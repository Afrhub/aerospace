# Compliance Tooling — ED-324 Mapping & Evidence Generation

MVP web SaaS for aerospace teams to map ML workflows to ED-324 requirements in <4 hours.

## Project Structure

```
compliance-tooling/
├── frontend/                 # React SPA
│   ├── src/
│   │   ├── components/
│   │   │   ├── WorkflowForm.tsx       # Workflow input form/wizard
│   │   │   ├── MappingDisplay.tsx     # ED-324 mapping visualization
│   │   │   ├── GapDetection.tsx       # Gap flagging UI
│   │   │   └── ReportGenerator.tsx    # Report download
│   │   ├── App.tsx
│   │   └── index.tsx
│   └── package.json
├── backend/                  # Python Flask/FastAPI
│   ├── app/
│   │   ├── __init__.py
│   │   ├── main.py           # Flask app
│   │   ├── models.py         # SQLAlchemy models (Workflow, Report)
│   │   ├── ed324_engine.py   # ED-324 requirement mapping logic
│   │   ├── workflow_mapper.py # Workflow → ED-324 mapping
│   │   ├── report_generator.py # PDF/DOCX report generation
│   │   └── routes.py         # API endpoints
│   ├── requirements.txt
│   └── config.py
├── database/
│   └── schema.sql            # PostgreSQL schema
└── docker-compose.yml        # Local dev stack
```

## Tech Stack

- **Frontend:** React 18, TypeScript, Vite
- **Backend:** Flask + SQLAlchemy, Python 3.10+
- **Database:** PostgreSQL 14+
- **Reports:** python-docx + reportlab (PDF/DOCX)
- **Auth:** Flask-Login + OAuth (SSO-ready)
- **Hosting:** Docker + AWS (ECS/RDS)

## Development Setup

### Prerequisites
- Docker & Docker Compose
- OR: Python 3.10+, Node.js 18+, PostgreSQL 14+

### Option 1: Docker (Recommended)

```bash
cd /Users/alastair/projects/compliance-tooling

# Start all services
docker-compose up

# Services will be available at:
# Frontend:  http://localhost:3000
# Backend:   http://localhost:5000
# Database:  localhost:5432
```

### Option 2: Local Development (Without Docker)

**Backend:**
```bash
cd backend
python -m venv venv
source venv/bin/activate  # macOS/Linux
pip install -r requirements.txt

# Make sure PostgreSQL is running locally
export DATABASE_URL="postgresql://localhost/compliance"
export FLASK_ENV=development
python -m flask run
# Backend available at http://localhost:5000
```

**Frontend:**
```bash
cd frontend
npm install
REACT_APP_API_URL=http://localhost:5000 npm start
# Frontend available at http://localhost:3000
```

**Database (First Time):**
```bash
createdb compliance
# Then run:
psql compliance < backend/database/schema.sql
```

## API Endpoints

### Authentication
- `POST /api/auth/login` — Login with email
- `GET /api/auth/user` — Get current user
- `POST /api/auth/logout` — Logout

### Workflows
- `POST /api/workflows` — Create workflow + auto-map to ED-324 + detect gaps
- `GET /api/workflows/<id>` — Get workflow details
- `POST /api/workflows/<id>/report` — Generate compliance report (PDF/DOCX)
- `GET /api/reports/<id>/download` — Download report file

## Workflow Data Structure

```json
{
  "program_name": "Avionics ML Safety System",
  "ml_system": "Neural network for fault detection",
  "workflow_steps": [
    {
      "name": "Data Collection",
      "description": "Collected 50K sensor readings from test aircraft",
      "tools": ["Jira", "GitHub"]
    },
    {
      "name": "Model Training",
      "description": "Trained ResNet-50 on normalized sensor data",
      "tools": ["TensorFlow", "Jupyter"]
    }
  ]
}
```

## Spec & Requirements

See `/Users/alastair/specs/compliance-tooling.md` for full product specification.

## Build & Deployment

### Build Docker Images
```bash
docker-compose build
```

### Deploy to AWS (Future)
- ECS + RDS + ALB
- S3 for report storage
- CloudFront for CDN
- See deployment guide (pending)
