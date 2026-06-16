# Flask API for Compliance Tooling

from flask import Flask, request, jsonify, send_file
from flask_cors import CORS
from flask_login import LoginManager, login_required, current_user, login_user, logout_user
from flask_wtf.csrf import CSRFProtect
from flask_limiter import Limiter
from flask_limiter.util import get_remote_address
from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
import os
from datetime import datetime
from functools import wraps
import json
from io import BytesIO
import re

from .ed324_engine import ED324Engine
from .report_generator import ReportGenerator
from .models import Base, Workflow, ComplianceReport, User
from .config import DevelopmentConfig, ProductionConfig

config = DevelopmentConfig if os.getenv('FLASK_ENV') == 'development' else ProductionConfig

app = Flask(__name__)
app.config.from_object(config)

CORS(app)
csrf = CSRFProtect(app)
limiter = Limiter(app=app, key_func=get_remote_address)

login_manager = LoginManager()
login_manager.init_app(app)
login_manager.login_view = 'login'

engine = create_engine(app.config['SQLALCHEMY_DATABASE_URI'])
Session = sessionmaker(bind=engine)

ed324_engine = ED324Engine()
report_gen = ReportGenerator()


@login_manager.user_loader
def load_user(user_id):
    session = Session()
    user = session.query(User).get(user_id)
    session.close()
    return user


def validate_email(email: str) -> bool:
    """Validate email format."""
    pattern = r'^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$'
    return re.match(pattern, email) is not None and len(email) <= 255


def validate_string(value: str, max_length: int = 255, allow_empty: bool = False) -> bool:
    """Validate string input."""
    if not value and allow_empty:
        return True
    return isinstance(value, str) and len(value) <= max_length and len(value) > 0


def sanitize_string(value: str) -> str:
    """Basic string sanitization."""
    if not isinstance(value, str):
        return ""
    return value.strip()[:1000]  # Limit to 1000 chars


@app.route('/health', methods=['GET'])
def health():
    """Health check endpoint."""
    return jsonify({'status': 'ok'})


@app.route('/api/workflows', methods=['POST'])
@limiter.limit("30 per hour")
@login_required
def create_workflow():
    """
    Create a new workflow entry.
    Body: {
        'program_name': str,
        'ml_system': str,
        'workflow_steps': [{'name': str, 'description': str, 'tools': [str]}],
        'interpretation_choices': {'robustness_validation': 'adversarial', ...} (optional)
    }
    """
    data = request.json
    session = Session()

    try:
        # Input validation
        if not data:
            return jsonify({'error': 'Request body required'}), 400

        program_name = sanitize_string(data.get('program_name', ''))
        ml_system = sanitize_string(data.get('ml_system', ''))
        workflow_steps = data.get('workflow_steps', [])

        if not program_name or len(program_name) < 3:
            return jsonify({'error': 'Program name required (min 3 chars)'}), 400

        if not ml_system or len(ml_system) < 3:
            return jsonify({'error': 'ML system description required (min 3 chars)'}), 400

        if not isinstance(workflow_steps, list) or len(workflow_steps) == 0:
            return jsonify({'error': 'At least one workflow step required'}), 400

        # Validate workflow steps
        for step in workflow_steps:
            if not isinstance(step, dict):
                return jsonify({'error': 'Invalid workflow step format'}), 400
            if 'name' not in step or 'description' not in step:
                return jsonify({'error': 'Each step must have name and description'}), 400

        workflow = Workflow(
            user_id=current_user.id,
            program_name=program_name,
            ml_system=ml_system,
            workflow_steps=workflow_steps,
            interpretation_choices=data.get('interpretation_choices', {})
        )

        mapping = ed324_engine.map_workflow(data['workflow_steps'])
        gaps = ed324_engine.detect_gaps(mapping)

        workflow.ed324_mapping = mapping
        workflow.gaps = gaps

        session.add(workflow)
        session.commit()
        workflow_id = workflow.id

        return jsonify({
            'workflow_id': workflow_id,
            'mapping': mapping,
            'gaps': gaps,
            'interpretation_choices': workflow.interpretation_choices
        }), 201

    except KeyError as e:
        session.rollback()
        return jsonify({'error': f'Missing required field: {str(e)}'}), 400
    except Exception as e:
        session.rollback()
        return jsonify({'error': str(e)}), 500
    finally:
        session.close()


@app.route('/api/workflows/<int:workflow_id>', methods=['GET'])
@login_required
def get_workflow(workflow_id):
    """Retrieve a workflow and its mapping/gaps."""
    session = Session()
    workflow = session.query(Workflow).filter_by(id=workflow_id, user_id=current_user.id).first()
    session.close()

    if not workflow:
        return jsonify({'error': 'Workflow not found'}), 404

    return jsonify({
        'workflow_id': workflow.id,
        'program_name': workflow.program_name,
        'ml_system': workflow.ml_system,
        'workflow_steps': workflow.workflow_steps,
        'mapping': workflow.ed324_mapping,
        'gaps': workflow.gaps
    })


@app.route('/api/workflows/<int:workflow_id>/report', methods=['POST'])
@limiter.limit("20 per hour")
@login_required
def generate_report(workflow_id):
    """
    Generate a compliance report (PDF/DOCX).
    Body: {'format': 'pdf' | 'docx'}
    """
    session = Session()

    try:
        workflow = session.query(Workflow).filter_by(id=workflow_id, user_id=current_user.id).first()

        if not workflow:
            return jsonify({'error': 'Workflow not found'}), 404

        format_type = request.json.get('format', 'pdf') if request.json else 'pdf'

        if format_type not in ['pdf', 'docx']:
            return jsonify({'error': 'Invalid format (use "pdf" or "docx")'}), 400

        # Generate report (returns bytes)
        report_content = report_gen.generate(workflow, format_type)

        if not isinstance(report_content, bytes):
            return jsonify({'error': 'Report generation failed'}), 500

        # Store report metadata in database
        # (binary content will be regenerated on download for MVP)
        report = ComplianceReport(
            user_id=current_user.id,
            workflow_id=workflow_id,
            format_type=format_type,
            content=f"Report generated: {workflow.program_name} ({format_type.upper()})"
        )
        session.add(report)
        session.commit()
        report_id = report.id

        return jsonify({
            'report_id': report_id,
            'format': format_type,
            'download_url': f'/api/reports/{report_id}/download',
            'message': f'{format_type.upper()} report generated successfully'
        }), 201

    except Exception as e:
        session.rollback()
        return jsonify({'error': f'Report generation failed: {str(e)}'}), 500
    finally:
        session.close()


@app.route('/api/reports/<int:report_id>/download', methods=['GET'])
@login_required
def download_report(report_id):
    """Download a compliance report file."""
    session = Session()

    try:
        report = session.query(ComplianceReport).filter_by(id=report_id, user_id=current_user.id).first()

        if not report:
            return jsonify({'error': 'Report not found'}), 404

        # Regenerate report on-demand (MVP approach; can be optimized with file storage)
        workflow = session.query(Workflow).get(report.workflow_id)
        if not workflow:
            return jsonify({'error': 'Associated workflow not found'}), 404

        report_content = report_gen.generate(workflow, report.format_type)

        if not isinstance(report_content, bytes):
            return jsonify({'error': 'Report generation failed'}), 500

        file_ext = report.format_type
        mime_type = f'application/{file_ext}' if file_ext == 'pdf' else 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'

        return send_file(
            BytesIO(report_content),
            mimetype=mime_type,
            as_attachment=True,
            download_name=f'compliance_report_{report.workflow_id}.{file_ext}'
        )

    except Exception as e:
        return jsonify({'error': f'Download failed: {str(e)}'}), 500
    finally:
        session.close()


@app.route('/api/auth/login', methods=['POST'])
@limiter.limit("10 per minute")
@csrf.exempt  # Allow login from SPA without CSRF token
def login():
    """Simple login endpoint (for testing; use OAuth in production)."""
    data = request.json

    if not data:
        return jsonify({'error': 'Request body required'}), 400

    email = data.get('email', '').strip()
    company = sanitize_string(data.get('company', ''))

    # Validate email
    if not email or not validate_email(email):
        return jsonify({'error': 'Invalid email format'}), 400

    session = Session()

    try:
        user = session.query(User).filter_by(email=email).first()

        if not user:
            user = User(email=email, company=company)
            session.add(user)
            session.commit()

        login_user(user, remember=True)

        return jsonify({
            'user_id': user.id,
            'email': user.email,
            'company': user.company,
            'message': 'Logged in successfully'
        }), 200

    except Exception as e:
        session.rollback()
        return jsonify({'error': 'Login failed'}), 500
    finally:
        session.close()


@app.route('/api/auth/logout', methods=['POST'])
@login_required
def logout():
    """Logout endpoint."""
    logout_user()
    return jsonify({'message': 'Logged out successfully'}), 200


@app.route('/api/auth/user', methods=['GET'])
@login_required
def get_current_user():
    """Get current logged-in user."""
    return jsonify({
        'user_id': current_user.id,
        'email': current_user.email,
        'company': current_user.company
    }), 200


@app.route('/api/ed324/ambiguous', methods=['GET'])
def get_ambiguous_requirements():
    """Get ED-324 requirements with multiple valid interpretations."""
    try:
        ambiguous = ed324_engine.get_ambiguous_requirements()
        return jsonify({
            'ambiguous_requirements': ambiguous,
            'count': len(ambiguous)
        }), 200
    except Exception as e:
        return jsonify({'error': str(e)}), 500


@app.errorhandler(404)
def not_found(e):
    return jsonify({'error': 'Not found'}), 404


@app.errorhandler(500)
def server_error(e):
    return jsonify({'error': 'Internal server error'}), 500


if __name__ == '__main__':
    Base.metadata.create_all(engine)
    app.run(debug=True, host='0.0.0.0', port=5000)
