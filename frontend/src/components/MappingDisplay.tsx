import React from 'react';
import { Workflow } from '../types';

interface MappingDisplayProps {
  workflow: Workflow;
}

export const MappingDisplay: React.FC<MappingDisplayProps> = ({ workflow }) => {
  if (!workflow.ed324_mapping) return null;

  const { mapping, coverage_percent } = workflow.ed324_mapping;

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>ED-324 Requirement Mapping</h2>

      <div style={styles.coverageSection}>
        <h3 style={styles.subtitle}>Coverage Overview</h3>
        <div style={styles.coverageBar}>
          <div
            style={{
              ...styles.coverageBarFill,
              width: `${coverage_percent}%`
            }}
          />
        </div>
        <p style={styles.coverageText}>
          <strong>{coverage_percent}%</strong> of ED-324 requirements covered
        </p>
      </div>

      <div style={styles.mappingGrid}>
        <h3 style={styles.subtitle}>Step-by-Step Mapping</h3>
        {Object.entries(mapping).map(([stepName, requirements]) => (
          <div key={stepName} style={styles.mappingCard}>
            <h4 style={styles.stepName}>{stepName}</h4>
            {requirements.length > 0 ? (
              <div style={styles.requirementsList}>
                {requirements.map((req) => (
                  <span key={req} style={styles.requirementTag}>
                    ✓ {req}
                  </span>
                ))}
              </div>
            ) : (
              <p style={styles.noMapping}>No ED-324 requirements mapped to this step</p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    backgroundColor: '#fff',
    borderRadius: '8px',
    padding: '2rem',
    marginBottom: '2rem',
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
    color: '#333',
    fontWeight: 600
  },
  coverageSection: {
    marginBottom: '2rem',
    padding: '1.5rem',
    backgroundColor: '#f5f5f5',
    borderRadius: '6px'
  },
  coverageBar: {
    width: '100%',
    height: '30px',
    backgroundColor: '#e0e0e0',
    borderRadius: '4px',
    overflow: 'hidden',
    marginBottom: '0.75rem'
  },
  coverageBarFill: {
    height: '100%',
    backgroundColor: '#4caf50',
    transition: 'width 0.3s ease'
  },
  coverageText: {
    fontSize: '0.95rem',
    color: '#666',
    margin: 0
  },
  mappingGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))',
    gap: '1rem'
  },
  mappingCard: {
    border: '1px solid #ddd',
    borderRadius: '6px',
    padding: '1rem',
    backgroundColor: '#fafafa'
  },
  stepName: {
    margin: '0 0 0.75rem 0',
    fontSize: '1rem',
    color: '#1f4788',
    fontWeight: 600
  },
  requirementsList: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '0.5rem'
  },
  requirementTag: {
    display: 'inline-block',
    padding: '0.5rem 0.75rem',
    backgroundColor: '#e8f5e9',
    color: '#2e7d32',
    borderRadius: '4px',
    fontSize: '0.9rem',
    fontWeight: 500
  },
  noMapping: {
    margin: 0,
    color: '#999',
    fontStyle: 'italic',
    fontSize: '0.9rem'
  }
};
