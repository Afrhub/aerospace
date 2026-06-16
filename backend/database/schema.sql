-- ED-324 Compliance Tooling Database Schema

CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    company VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS workflows (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    program_name VARCHAR(255) NOT NULL,
    ml_system VARCHAR(255) NOT NULL,
    workflow_steps JSONB NOT NULL,
    ed324_mapping JSONB,
    gaps JSONB,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE IF NOT EXISTS compliance_reports (
    id SERIAL PRIMARY KEY,
    user_id INTEGER NOT NULL REFERENCES users(id),
    workflow_id INTEGER NOT NULL REFERENCES workflows(id),
    format_type VARCHAR(20) DEFAULT 'pdf',
    file_path VARCHAR(512),
    content TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Indexes for performance
CREATE INDEX idx_workflows_user_id ON workflows(user_id);
CREATE INDEX idx_workflows_created_at ON workflows(created_at);
CREATE INDEX idx_reports_user_id ON compliance_reports(user_id);
CREATE INDEX idx_reports_workflow_id ON compliance_reports(workflow_id);

-- Sample ED-324 requirements reference table (optional, for future enhancement)
CREATE TABLE IF NOT EXISTS ed324_requirements (
    id SERIAL PRIMARY KEY,
    requirement_id VARCHAR(50) UNIQUE NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    details TEXT
);

INSERT INTO ed324_requirements (requirement_id, title, description, details) VALUES
('data_preparation', 'Training data preparation and validation', 'Document data sources, preprocessing, versioning, and validation approach', 'Data must be versioned, validated for quality, and traced to source'),
('model_training', 'Model training process and hyperparameter selection', 'Describe training procedure, hyperparameter tuning, reproducibility measures', 'Training must be reproducible with documented hyperparameters'),
('testing_evaluation', 'Model testing and evaluation', 'Test coverage, metrics, adversarial testing, failure modes', 'Comprehensive testing including edge cases and adversarial examples'),
('robustness_validation', 'Robustness validation across operational conditions', 'Weather conditions, sensor degradation, out-of-distribution inputs', 'Validation across expected operational conditions'),
('monitoring_deployment', 'Deployment monitoring and performance tracking', 'Runtime metrics, drift detection, performance bounds', 'Continuous monitoring for model drift and performance degradation'),
('requirements_traceability', 'Traceability from requirements to training data to model', 'Requirements mapping, data provenance, model versioning', 'Complete traceability chain for certification'),
('documentation', 'Comprehensive development and certification documentation', 'Process documentation, design rationale, evidence artifacts', 'Full documentation of development process and design decisions')
ON CONFLICT (requirement_id) DO NOTHING;
