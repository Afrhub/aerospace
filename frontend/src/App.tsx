import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { WorkflowForm } from './components/WorkflowForm';
import { InterpretationSelector } from './components/InterpretationSelector';
import { MappingDisplay } from './components/MappingDisplay';
import { GapDetection } from './components/GapDetection';
import { ReportGenerator } from './components/ReportGenerator';
import { Workflow, User } from './types';

type AppStep = 'login' | 'form' | 'interpret' | 'review' | 'report';

const App: React.FC = () => {
  const [step, setStep] = useState<AppStep>('login');
  const [user, setUser] = useState<User | null>(null);
  const [workflow, setWorkflow] = useState<Workflow | null>(null);
  const [email, setEmail] = useState('');
  const [company, setCompany] = useState('');
  const [loginError, setLoginError] = useState('');

  useEffect(() => {
    // Configure axios defaults
    axios.defaults.baseURL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
    axios.defaults.withCredentials = true;
  }, []);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');

    try {
      const response = await axios.post('/api/auth/login', {
        email,
        company
      });

      setUser(response.data);
      setStep('form');
    } catch (err: any) {
      setLoginError(err.response?.data?.error || 'Login failed');
    }
  };

  const handleLogout = async () => {
    try {
      await axios.post('/api/auth/logout');
      setUser(null);
      setWorkflow(null);
      setStep('login');
      setEmail('');
      setCompany('');
    } catch (err) {
      console.error('Logout failed:', err);
    }
  };

  const handleWorkflowCreated = (newWorkflow: Workflow) => {
    setWorkflow(newWorkflow);
    setStep('interpret');
  };

  const handleInterpretationsSelected = (choices: Record<string, string>) => {
    if (workflow) {
      setWorkflow({
        ...workflow,
        interpretation_choices: choices
      });
    }
    setStep('review');
  };

  const handleStartOver = () => {
    setWorkflow(null);
    setStep('form');
  };

  return (
    <div style={styles.app}>
      <header style={styles.header}>
        <div style={styles.headerContent}>
          <h1 style={styles.logo}>ED-324 Compliance Tooling</h1>
          {user && (
            <div style={styles.userSection}>
              <span style={styles.userEmail}>{user.email}</span>
              <button onClick={handleLogout} style={styles.logoutBtn}>
                Logout
              </button>
            </div>
          )}
        </div>
      </header>

      <main style={styles.main}>
        {step === 'login' && (
          <div style={styles.loginContainer}>
            <div style={styles.loginCard}>
              <h2 style={styles.loginTitle}>Welcome to ED-324 Compliance Tooling</h2>
              <p style={styles.loginSubtitle}>
                Map your ML development workflow to ED-324 requirements in under 4 hours.
              </p>

              <form onSubmit={handleLogin} style={styles.loginForm}>
                {loginError && <div style={styles.error}>{loginError}</div>}

                <div style={styles.formGroup}>
                  <label style={styles.label}>Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="your@company.com"
                    style={styles.input}
                    required
                  />
                </div>

                <div style={styles.formGroup}>
                  <label style={styles.label}>Company (Optional)</label>
                  <input
                    type="text"
                    value={company}
                    onChange={(e) => setCompany(e.target.value)}
                    placeholder="e.g., Textron, Garmin, Collins"
                    style={styles.input}
                  />
                </div>

                <button type="submit" style={styles.loginBtn}>
                  Get Started
                </button>
              </form>

              <p style={styles.disclaimer}>
                No account needed. We'll create one for you automatically.
              </p>
            </div>
          </div>
        )}

        {step === 'form' && user && (
          <WorkflowForm onWorkflowCreated={handleWorkflowCreated} />
        )}

        {step === 'interpret' && workflow && (
          <div>
            <div style={styles.reviewHeader}>
              <h2 style={styles.sectionTitle}>ED-324 Requirement Interpretations</h2>
              <button onClick={() => setStep('form')} style={styles.backBtn}>
                ← Back to Workflow
              </button>
            </div>
            <InterpretationSelector
              onSelectInterpretations={handleInterpretationsSelected}
              onSkip={() => {
                handleInterpretationsSelected({});
              }}
            />
          </div>
        )}

        {step === 'review' && workflow && (
          <div>
            <div style={styles.reviewHeader}>
              <h2 style={styles.sectionTitle}>Workflow Review & Compliance Analysis</h2>
              <button onClick={handleStartOver} style={styles.startOverBtn}>
                ← Start Over
              </button>
            </div>

            <MappingDisplay workflow={workflow} />
            <GapDetection workflow={workflow} />

            <div style={styles.navigation}>
              <button onClick={() => setStep('report')} style={styles.nextBtn}>
                Generate Compliance Report →
              </button>
            </div>
          </div>
        )}

        {step === 'report' && workflow && (
          <div>
            <div style={styles.reviewHeader}>
              <h2 style={styles.sectionTitle}>Generate & Download Report</h2>
              <button onClick={() => setStep('review')} style={styles.backBtn}>
                ← Back to Review
              </button>
            </div>

            <ReportGenerator workflow={workflow} />

            <div style={styles.navigation}>
              <button onClick={handleStartOver} style={styles.newWorkflowBtn}>
                Start New Workflow
              </button>
            </div>
          </div>
        )}
      </main>

      <footer style={styles.footer}>
        <p style={styles.footerText}>
          ED-324 Compliance Tooling v0.1 | © 2026 | For aerospace ML development teams
        </p>
      </footer>
    </div>
  );
};

const styles: Record<string, React.CSSProperties> = {
  app: {
    minHeight: '100vh',
    display: 'flex',
    flexDirection: 'column',
    backgroundColor: '#f5f5f5'
  },
  header: {
    backgroundColor: '#1f4788',
    color: '#fff',
    padding: '1.5rem 0',
    boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
  },
  headerContent: {
    maxWidth: 1200,
    margin: '0 auto',
    padding: '0 2rem',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    width: '100%'
  },
  logo: {
    margin: 0,
    fontSize: '1.5rem',
    fontWeight: 700
  },
  userSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '1rem'
  },
  userEmail: {
    fontSize: '0.9rem',
    opacity: 0.9
  },
  logoutBtn: {
    padding: '0.5rem 1rem',
    backgroundColor: 'rgba(255,255,255,0.2)',
    color: '#fff',
    border: '1px solid #fff',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '0.9rem',
    fontWeight: 500,
    transition: 'all 0.2s'
  },
  main: {
    flex: 1,
    maxWidth: 1200,
    margin: '0 auto',
    padding: '2rem',
    width: '100%'
  },
  loginContainer: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: '60vh'
  },
  loginCard: {
    backgroundColor: '#fff',
    borderRadius: '8px',
    padding: '3rem',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    maxWidth: 400,
    width: '100%'
  },
  loginTitle: {
    fontSize: '1.5rem',
    marginBottom: '0.5rem',
    color: '#1f4788',
    textAlign: 'center'
  },
  loginSubtitle: {
    textAlign: 'center',
    color: '#666',
    marginBottom: '2rem',
    fontSize: '0.95rem'
  },
  loginForm: {
    marginBottom: '1.5rem'
  },
  formGroup: {
    marginBottom: '1rem'
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
    fontFamily: 'inherit'
  },
  loginBtn: {
    width: '100%',
    padding: '0.75rem',
    backgroundColor: '#1f4788',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    fontSize: '1rem',
    fontWeight: 600,
    cursor: 'pointer',
    transition: 'background 0.2s'
  },
  disclaimer: {
    textAlign: 'center',
    fontSize: '0.85rem',
    color: '#999',
    margin: 0
  },
  error: {
    padding: '0.75rem',
    backgroundColor: '#ffebee',
    color: '#c62828',
    borderRadius: '4px',
    marginBottom: '1rem',
    border: '1px solid #ef5350',
    fontSize: '0.9rem'
  },
  reviewHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '2rem'
  },
  sectionTitle: {
    fontSize: '1.5rem',
    color: '#1f4788',
    margin: 0
  },
  startOverBtn: {
    padding: '0.5rem 1rem',
    backgroundColor: '#f5f5f5',
    color: '#333',
    border: '1px solid #ddd',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '0.9rem',
    fontWeight: 500
  },
  backBtn: {
    padding: '0.5rem 1rem',
    backgroundColor: '#f5f5f5',
    color: '#333',
    border: '1px solid #ddd',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '0.9rem',
    fontWeight: 500
  },
  navigation: {
    display: 'flex',
    gap: '1rem',
    justifyContent: 'center',
    margin: '2rem 0'
  },
  nextBtn: {
    padding: '1rem 2rem',
    backgroundColor: '#1f4788',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '1rem',
    fontWeight: 600,
    transition: 'background 0.2s'
  },
  newWorkflowBtn: {
    padding: '0.75rem 1.5rem',
    backgroundColor: '#4caf50',
    color: '#fff',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    fontSize: '1rem',
    fontWeight: 600,
    transition: 'background 0.2s'
  },
  footer: {
    backgroundColor: '#f5f5f5',
    borderTop: '1px solid #ddd',
    padding: '2rem',
    textAlign: 'center',
    marginTop: 'auto'
  },
  footerText: {
    margin: 0,
    color: '#999',
    fontSize: '0.85rem'
  }
};

export default App;
