import React, { useState, useEffect } from 'react';
import axios from 'axios';

interface Interpretation {
  id: string;
  label: string;
  description: string;
}

interface AmbiguousRequirement {
  requirement: string;
  details: string;
  interpretations: Interpretation[];
}

interface InterpretationSelectorProps {
  onSelectInterpretations: (choices: Record<string, string>) => void;
  onSkip: () => void;
}

export const InterpretationSelector: React.FC<InterpretationSelectorProps> = ({
  onSelectInterpretations,
  onSkip
}) => {
  const [ambiguousReqs, setAmbiguousReqs] = useState<Record<string, AmbiguousRequirement>>({});
  const [selections, setSelections] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const fetchAmbiguousRequirements = async () => {
      try {
        const response = await axios.get('/api/ed324/ambiguous');
        setAmbiguousReqs(response.data.ambiguous_requirements);

        // Initialize selections with first interpretation of each
        const initialSelections: Record<string, string> = {};
        Object.entries(response.data.ambiguous_requirements).forEach(([reqId, req]: [string, any]) => {
          if (req.interpretations?.length > 0) {
            initialSelections[reqId] = req.interpretations[0].id;
          }
        });
        setSelections(initialSelections);
      } catch (err: any) {
        setError('Failed to load interpretation options');
      } finally {
        setLoading(false);
      }
    };

    fetchAmbiguousRequirements();
  }, []);

  const handleSelectionChange = (reqId: string, interpretationId: string) => {
    setSelections({
      ...selections,
      [reqId]: interpretationId
    });
  };

  const handleSubmit = () => {
    onSelectInterpretations(selections);
  };

  if (loading) {
    return <div style={styles.container}>Loading interpretation options...</div>;
  }

  if (Object.keys(ambiguousReqs).length === 0) {
    return null; // No ambiguous requirements
  }

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>ED-324 Interpretation Selections</h2>
      <p style={styles.subtitle}>
        Some ED-324 requirements have multiple valid interpretations. Select which interpretation(s) you followed.
      </p>

      {error && <div style={styles.error}>{error}</div>}

      {Object.entries(ambiguousReqs).map(([reqId, req]) => (
        <div key={reqId} style={styles.requirementCard}>
          <h3 style={styles.reqTitle}>{req.requirement}</h3>
          <p style={styles.reqDetails}>{req.details}</p>

          <div style={styles.interpretationsGroup}>
            {req.interpretations.map((interp: Interpretation) => (
              <label key={interp.id} style={styles.interpLabel}>
                <input
                  type="radio"
                  name={`interpretation_${reqId}`}
                  value={interp.id}
                  checked={selections[reqId] === interp.id}
                  onChange={() => handleSelectionChange(reqId, interp.id)}
                  style={styles.radio}
                />
                <span style={styles.interpLabelText}>
                  <strong>{interp.label}</strong>
                  <br />
                  <span style={styles.interpDescription}>{interp.description}</span>
                </span>
              </label>
            ))}
          </div>
        </div>
      ))}

      <div style={styles.actions}>
        <button onClick={handleSubmit} style={styles.submitBtn}>
          Confirm Interpretations
        </button>
        <button onClick={onSkip} style={styles.skipBtn}>
          Skip (use defaults)
        </button>
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    backgroundColor: '#fff',
    borderRadius: '8px',
    padding: '2rem',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    marginBottom: '2rem'
  },
  title: {
    fontSize: '1.5rem',
    marginBottom: '0.5rem',
    color: '#1f4788'
  },
  subtitle: {
    fontSize: '0.95rem',
    color: '#666',
    marginBottom: '1.5rem'
  },
  error: {
    padding: '1rem',
    backgroundColor: '#ffebee',
    color: '#c62828',
    borderRadius: '4px',
    marginBottom: '1rem'
  },
  requirementCard: {
    border: '1px solid #ddd',
    borderRadius: '6px',
    padding: '1.5rem',
    marginBottom: '1.5rem',
    backgroundColor: '#f9f9f9'
  },
  reqTitle: {
    margin: '0 0 0.5rem 0',
    fontSize: '1.1rem',
    color: '#1f4788'
  },
  reqDetails: {
    margin: '0 0 1rem 0',
    color: '#666',
    fontSize: '0.9rem',
    fontStyle: 'italic'
  },
  interpretationsGroup: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '1rem'
  },
  interpLabel: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '0.75rem',
    cursor: 'pointer',
    padding: '0.75rem',
    borderRadius: '4px',
    backgroundColor: '#fff',
    border: '1px solid #e0e0e0',
    transition: 'all 0.2s'
  },
  radio: {
    marginTop: '0.25rem',
    cursor: 'pointer',
    flexShrink: 0
  },
  interpLabelText: {
    flex: 1,
    fontSize: '0.95rem'
  },
  interpDescription: {
    display: 'block',
    fontSize: '0.85rem',
    color: '#999',
    marginTop: '0.25rem',
    fontStyle: 'italic',
    fontWeight: 'normal'
  },
  actions: {
    display: 'flex',
    gap: '1rem',
    justifyContent: 'center',
    marginTop: '2rem'
  },
  submitBtn: {
    padding: '0.75rem 1.5rem',
    backgroundColor: '#1f4788',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '1rem',
    fontWeight: 600
  },
  skipBtn: {
    padding: '0.75rem 1.5rem',
    backgroundColor: '#f5f5f5',
    color: '#333',
    border: '1px solid #ddd',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '1rem',
    fontWeight: 600
  }
};
