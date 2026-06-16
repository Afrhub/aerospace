import React from 'react';
import { Workflow } from '../types';

interface GapDetectionProps {
  workflow: Workflow;
}

export const GapDetection: React.FC<GapDetectionProps> = ({ workflow }) => {
  if (!workflow.gaps) return null;

  const { gap_count, gap_details } = workflow.gaps;

  if (gap_count === 0) {
    return (
      <div style={styles.container}>
        <div style={styles.successCard}>
          <h3 style={styles.successTitle}>✓ No Gaps Detected</h3>
          <p style={styles.successText}>
            Your workflow covers all identified ED-324 requirements. You're ready to generate a compliance report.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>ED-324 Requirement Gaps</h2>

      <div style={styles.gapSummary}>
        <p style={styles.summaryText}>
          <strong>{gap_count}</strong> ED-324 requirement(s) are missing from your workflow documentation.
          Review the details below and address them before regulatory submission.
        </p>
      </div>

      <div style={styles.gapsList}>
        {gap_details.map((gap, index) => (
          <div key={index} style={styles.gapCard}>
            <div style={styles.gapHeader}>
              <span style={styles.gapNumber}>{index + 1}</span>
              <h3 style={styles.gapTitle}>{gap.requirement}</h3>
            </div>
            <p style={styles.gapDetails}>{gap.details}</p>
            <div style={styles.gapAction}>
              <span style={styles.actionText}>
                💡 Document or implement this requirement before certification
              </span>
            </div>
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
    color: '#d32f2f'
  },
  gapSummary: {
    padding: '1rem',
    backgroundColor: '#fff3e0',
    border: '1px solid #ffb74d',
    borderRadius: '6px',
    marginBottom: '1.5rem'
  },
  summaryText: {
    margin: 0,
    color: '#e65100',
    fontSize: '0.95rem'
  },
  gapsList: {
    display: 'flex',
    flexDirection: 'column' as const,
    gap: '1rem'
  },
  gapCard: {
    border: '1px solid #ffcdd2',
    borderRadius: '6px',
    padding: '1.5rem',
    backgroundColor: '#fff5f5'
  },
  gapHeader: {
    display: 'flex',
    alignItems: 'center',
    marginBottom: '0.75rem',
    gap: '1rem'
  },
  gapNumber: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    width: '32px',
    height: '32px',
    backgroundColor: '#d32f2f',
    color: '#fff',
    borderRadius: '50%',
    fontWeight: 700,
    fontSize: '0.9rem',
    flexShrink: 0
  },
  gapTitle: {
    margin: 0,
    fontSize: '1.1rem',
    color: '#d32f2f',
    fontWeight: 600
  },
  gapDetails: {
    margin: '0.75rem 0 0 0',
    color: '#666',
    fontSize: '0.95rem',
    lineHeight: 1.5
  },
  gapAction: {
    marginTop: '1rem',
    padding: '0.75rem',
    backgroundColor: '#f3e5f5',
    borderRadius: '4px'
  },
  actionText: {
    color: '#7b1fa2',
    fontSize: '0.9rem',
    fontWeight: 500
  },
  successCard: {
    padding: '2rem',
    backgroundColor: '#e8f5e9',
    border: '2px solid #4caf50',
    borderRadius: '6px',
    textAlign: 'center' as const
  },
  successTitle: {
    margin: '0 0 0.5rem 0',
    fontSize: '1.3rem',
    color: '#2e7d32',
    fontWeight: 600
  },
  successText: {
    margin: 0,
    color: '#558b2f',
    fontSize: '0.95rem'
  }
};
