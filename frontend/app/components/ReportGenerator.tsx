import React, { useState } from 'react';
import { Workflow, Report } from '../types';
import axios from 'axios';

interface ReportGeneratorProps {
  workflow: Workflow;
}

export const ReportGenerator: React.FC<ReportGeneratorProps> = ({ workflow }) => {
  const [format, setFormat] = useState<'pdf' | 'docx'>('pdf');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);

  const handleGenerateReport = async () => {
    setError('');
    setSuccess(false);
    setLoading(true);

    try {
      const response = await axios.post(`/api/workflows/${workflow.id}/report`, {
        format: format
      });

      const report: Report = response.data;

      // Trigger download
      window.location.href = report.download_url;

      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err: any) {
      setError(err.response?.data?.error || 'Failed to generate report');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <h2 style={styles.title}>Download Compliance Report</h2>

      <div style={styles.info}>
        <p style={styles.infoText}>
          Generate a regulatory-ready compliance report documenting your ML workflow
          and ED-324 requirement mapping. This report can be submitted directly to regulators.
        </p>
      </div>

      {error && <div style={styles.error}>{error}</div>}
      {success && <div style={styles.success}>Report generated successfully! Downloading...</div>}

      <div style={styles.section}>
        <h3 style={styles.subtitle}>Report Format</h3>
        <div style={styles.formatOptions}>
          <label style={styles.radioLabel}>
            <input
              type="radio"
              value="pdf"
              checked={format === 'pdf'}
              onChange={(e) => setFormat(e.target.value as 'pdf' | 'docx')}
            />
            <span>PDF</span>
            <span style={styles.formatHint}>(Professional, read-only)</span>
          </label>
          <label style={styles.radioLabel}>
            <input
              type="radio"
              value="docx"
              checked={format === 'docx'}
              onChange={(e) => setFormat(e.target.value as 'pdf' | 'docx')}
            />
            <span>Word (DOCX)</span>
            <span style={styles.formatHint}>(Editable)</span>
          </label>
        </div>
      </div>

      <div style={styles.section}>
        <h3 style={styles.subtitle}>Report Contents</h3>
        <ul style={styles.contentsList}>
          <li style={styles.contentItem}>Program and ML system information</li>
          <li style={styles.contentItem}>Complete workflow description</li>
          <li style={styles.contentItem}>ED-324 requirement mapping</li>
          <li style={styles.contentItem}>Identified gaps and missing requirements</li>
          <li style={styles.contentItem}>Certification readiness assessment</li>
        </ul>
      </div>

      <button
        onClick={handleGenerateReport}
        disabled={loading}
        style={{
          ...styles.generateBtn,
          opacity: loading ? 0.6 : 1,
          cursor: loading ? 'not-allowed' : 'pointer'
        }}
      >
        {loading ? 'Generating...' : `Download as ${format.toUpperCase()}`}
      </button>

      <p style={styles.note}>
        💾 <strong>Note:</strong> The generated report is adoption-ready and can be submitted to regulators without further editing.
      </p>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  container: {
    backgroundColor: '#fff',
    borderRadius: '8px',
    padding: '2rem',
    boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
  },
  title: {
    fontSize: '1.5rem',
    marginBottom: '1rem',
    color: '#1f4788'
  },
  info: {
    padding: '1rem',
    backgroundColor: '#e3f2fd',
    border: '1px solid #90caf9',
    borderRadius: '6px',
    marginBottom: '1.5rem'
  },
  infoText: {
    margin: 0,
    color: '#1565c0',
    fontSize: '0.95rem'
  },
  section: {
    marginBottom: '1.5rem'
  },
  subtitle: {
    fontSize: '1rem',
    fontWeight: 600,
    color: '#333',
    marginBottom: '0.75rem'
  },
  formatOptions: {
    display: 'flex',
    gap: '2rem'
  },
  radioLabel: {
    display: 'flex',
    alignItems: 'center',
    gap: '0.5rem',
    cursor: 'pointer',
    fontSize: '0.95rem'
  },
  formatHint: {
    fontSize: '0.85rem',
    color: '#999',
    marginLeft: '0.25rem'
  },
  contentsList: {
    listStyle: 'none',
    padding: 0,
    margin: 0
  },
  contentItem: {
    padding: '0.5rem 0 0.5rem 1.5rem',
    position: 'relative' as const,
    fontSize: '0.95rem',
    color: '#666'
  },
  generateBtn: {
    width: '100%',
    padding: '1rem',
    backgroundColor: '#1f4788',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    fontSize: '1rem',
    fontWeight: 600,
    cursor: 'pointer',
    marginBottom: '1rem',
    transition: 'background 0.2s'
  },
  note: {
    margin: 0,
    padding: '0.75rem',
    backgroundColor: '#f5f5f5',
    borderLeft: '4px solid #ffc107',
    fontSize: '0.9rem',
    color: '#666'
  },
  error: {
    padding: '1rem',
    backgroundColor: '#ffebee',
    color: '#c62828',
    borderRadius: '4px',
    marginBottom: '1rem',
    border: '1px solid #ef5350'
  },
  success: {
    padding: '1rem',
    backgroundColor: '#e8f5e9',
    color: '#2e7d32',
    borderRadius: '4px',
    marginBottom: '1rem',
    border: '1px solid #4caf50'
  }
};
