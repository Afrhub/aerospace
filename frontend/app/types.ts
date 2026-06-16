export interface WorkflowStep {
  name: string;
  description: string;
  tools: string[];
}

export interface Workflow {
  id: number;
  program_name: string;
  ml_system: string;
  workflow_steps: WorkflowStep[];
  ed324_mapping?: {
    mapping: Record<string, string[]>;
    covered_requirements: string[];
    coverage_percent: number;
  };
  gaps?: {
    missing_requirements: string[];
    gap_details: Array<{
      requirement: string;
      details: string;
    }>;
    gap_count: number;
  };
  interpretation_choices?: Record<string, string>;
}

export interface User {
  user_id: number;
  email: string;
  company?: string;
}

export interface Report {
  report_id: number;
  format: 'pdf' | 'docx';
  download_url: string;
}
