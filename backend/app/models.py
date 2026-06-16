# SQLAlchemy Models for Compliance Tooling

from sqlalchemy import Column, Integer, String, Text, JSON, DateTime, ForeignKey, Boolean
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import relationship
from datetime import datetime

Base = declarative_base()


class User(Base):
    __tablename__ = 'users'

    id = Column(Integer, primary_key=True)
    email = Column(String(255), unique=True, nullable=False)
    company = Column(String(255))
    created_at = Column(DateTime, default=datetime.utcnow)

    workflows = relationship('Workflow', back_populates='user')
    reports = relationship('ComplianceReport', back_populates='user')


class Workflow(Base):
    __tablename__ = 'workflows'

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    program_name = Column(String(255), nullable=False)
    ml_system = Column(String(255), nullable=False)
    workflow_steps = Column(JSON, nullable=False)  # [{'name': str, 'description': str, 'tools': [str]}]
    ed324_mapping = Column(JSON)  # {'mapping': {...}, 'covered_requirements': [...], 'coverage_percent': float}
    gaps = Column(JSON)  # {'missing_requirements': [...], 'gap_details': [...], 'gap_count': int}
    interpretation_choices = Column(JSON, default={})  # {'robustness_validation': 'adversarial', ...}
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship('User', back_populates='workflows')
    reports = relationship('ComplianceReport', back_populates='workflow')


class ComplianceReport(Base):
    __tablename__ = 'compliance_reports'

    id = Column(Integer, primary_key=True)
    user_id = Column(Integer, ForeignKey('users.id'), nullable=False)
    workflow_id = Column(Integer, ForeignKey('workflows.id'), nullable=False)
    format_type = Column(String(20), default='pdf')  # 'pdf' or 'docx'
    file_path = Column(String(512))  # S3 or local path
    content = Column(Text)  # Text summary for UI preview
    created_at = Column(DateTime, default=datetime.utcnow)

    user = relationship('User', back_populates='reports')
    workflow = relationship('Workflow', back_populates='reports')
