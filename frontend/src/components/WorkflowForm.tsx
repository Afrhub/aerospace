import React, { useState } from 'react';
import { WorkflowStep, Workflow } from '../types';
import axios from 'axios';

interface WorkflowFormProps {
  onWorkflowCreated: (workflow: Workflow) => void;
}

export const WorkflowForm: React.FC<WorkflowFormProps> = ({ onWorkflowCreated }) => {
  const [programName, setProgramName] = useState('');
  const [mlSystem, setMlSystem] = useState('');
  const [steps, setSteps] = useState<WorkflowStep[]>([
    { name: '', description: '', tools: [] }
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleAddStep = () => {
    setSteps([...steps, { name: '', description: '', tools: [] }]);
  };

  const handleRemoveStep = (index: number) => {
    setSteps(steps.filter((_, i) => i !== index));
  };

  const handleStepChange = (index: number, field: keyof WorkflowStep, value: any) => {
    const newSteps = [...steps];
    if (field === 'tools') {
      newSteps[index][field] = value.split(',').map((t: string) => t.trim());
    } else {
      newSteps[index][field] = value;
    }
    setSteps(newSteps);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await axios.post('/api/workflows', {
        program_name: programName,
        ml_system: mlSystem,
        workflow_steps: steps.filter(s => s.name && s.description)
      });

      const workflow: Workflow = {
        id: response.data.workflow_id,
        program_name: programName,
        ml_system: mlSystem,
        workflow_steps: steps,
        ed324_mapping: response.data.mapping,
        gaps: response.data.gaps
      };

      onWorkflowCreated(workflow);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to create workflow');
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} style={styles.form}>
      <h2 style={styles.title}>Create ML Development Workflow</h2>

      {error && <div style={styles.error}>{error}</div>}

      <div style={styles.section}>
        <label style={styles.label}>Program Name</label>
        <input
          type="text"
          value={programName}
          onChange={(e) => setProgramName(e.target.value)}
          placeholder="e.g., Avionics ML Safety System v1"
          style={styles.input}
          required
        />
      </div>

      <div style={styles.section}>
        <label style={styles.label}>ML System Description</label>
        <input
          type="text"
          value={mlSystem}
          onChange={(e) => setMlSystem(e.target.value)}
          placeholder="e.g., Neural network for fault detection"
          style={styles.input}
          required
        />
      </div>

      <div style={styles.section}>
        <h3 style={styles.subtitle}>Workflow Steps</h3>
        {steps.map((step, index) => (
          <div key={index} style={styles.stepCard}>
            <div style={styles.stepNumber}>Step {index + 1}</div>
            <div style={styles.stepContent}>
              <input
                type="text"
                placeholder="Step name (e.g., Data Collection) — leave blank to skip"
                value={step.name}
                onChange={(e) => handleStepChange(index, 'name', e.target.value)}
                style={styles.input}
              />
              <textarea
                placeholder="Describe what you did in this step — optional"
                value={step.description}
                onChange={(e) => handleStepChange(index, 'description', e.target.value)}
                style={styles.textarea}
              />
              <input
                type="text"
                placeholder="Tools used (comma-separated, e.g., Jira, GitHub, TensorFlow)"
                value={step.tools.join(', ')}
                onChange={(e) => handleStepChange(index, 'tools', e.target.value)}
                style={styles.input}
              />
            </div>
            {steps.length > 1 && (
              <button
                type="button"
                onClick={() => handleRemoveStep(index)}
                style={styles.removeBtn}
              >
                Remove
              </button>
            )}
          </div>
        ))}

        <button
          type="button"
          onClick={handleAddStep}
          style={styles.addBtn}
        >
          + Add Step
        </button>
      </div>

      <button
        type="submit"
        disabled={loading}
        style={{
          ...styles.submitBtn,
          opacity: loading ? 0.6 : 1,
          cursor: loading ? 'not-allowed' : 'pointer'
        }}
      >
        {loading ? 'Creating...' : 'Create Workflow & Map to ED-324'}
      </button>
    </form>
  );
};

const styles: Record<string, React.CSSProperties> = {
  form: {
    maxWidth: 800,
    margin: '0 auto',
    padding: '2rem',
    backgroundColor: '#fff',
    borderRadius: '8px',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
  },
  title: {
    fontSize: '1.5rem',
    marginBottom: '1.5rem',
    color: '#1f4788'
  },
  subtitle: {
    fontSize: '1.1rem',
    marginBottom: '1rem',
    color: '#333'
  },
  section: {
    marginBottom: '1.5rem'
  },
  label: {
    display: 'block',
    marginBottom: '0.5rem',
    fontWeight: 600,
    color: '#333'
  },
  input: {
    width: '100%',
    padding: '0.75rem',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '1rem',
    fontFamily: 'inherit',
    marginBottom: '0.5rem'
  },
  textarea: {
    width: '100%',
    padding: '0.75rem',
    border: '1px solid #ddd',
    borderRadius: '4px',
    fontSize: '1rem',
    fontFamily: 'inherit',
    minHeight: '100px',
    marginBottom: '0.5rem',
    resize: 'vertical'
  },
  stepCard: {
    border: '1px solid #e0e0e0',
    borderRadius: '6px',
    padding: '1rem',
    marginBottom: '1rem',
    backgroundColor: '#f9f9f9',
    position: 'relative' as const
  },
  stepNumber: {
    fontSize: '0.9rem',
    fontWeight: 600,
    color: '#666',
    marginBottom: '0.5rem'
  },
  stepContent: {
    display: 'flex',
    flexDirection: 'column' as const
  },
  addBtn: {
    padding: '0.75rem 1.5rem',
    backgroundColor: '#e8f0f8',
    color: '#1f4788',
    border: '2px dashed #1f4788',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '1rem',
    fontWeight: 600,
    marginBottom: '1.5rem',
    transition: 'all 0.2s'
  },
  removeBtn: {
    position: 'absolute' as const,
    top: '1rem',
    right: '1rem',
    padding: '0.5rem 0.75rem',
    backgroundColor: '#ffebee',
    color: '#c62828',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '0.85rem'
  },
  submitBtn: {
    width: '100%',
    padding: '1rem',
    backgroundColor: '#1f4788',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    fontSize: '1rem',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'background 0.2s'
  },
  error: {
    padding: '1rem',
    backgroundColor: '#ffebee',
    color: '#c62828',
    borderRadius: '4px',
    marginBottom: '1rem',
    border: '1px solid #ef5350'
  }
};
