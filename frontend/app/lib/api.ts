import axios from "axios";
import type { Workflow, WorkflowStep } from "../types";

// ponytail: single axios instance; NEXT_PUBLIC_ prefix is required for client env in Next.
export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000",
  withCredentials: true,
});

// No HTTP response means the backend is unreachable (e.g. the public Vercel demo,
// connection refused, CORS, timeout). In that case we fall back to a fully-walkable
// client-side demo so reviewers can experience the whole flow.
// A real 4xx/5xx HAS a response, so genuine API errors still surface normally.
// ponytail: demo mirror, delete once the backend is hosted.
const isOffline = (err: unknown) =>
  !(err as { response?: unknown })?.response;

/* ---- ED-324 reference (mirrors backend ed324_engine for demo mode) ---- */
const ED324 = [
  { id: "data_preparation", kw: ["data", "dataset", "prepare", "preprocess", "label"], requirement: "Training data preparation & validation", details: "Document data sources, preprocessing, versioning, and validation approach." },
  { id: "model_training", kw: ["train", "model", "hyperparameter", "learning", "fit"], requirement: "Model training process & hyperparameter selection", details: "Describe training procedure, tuning, and reproducibility measures." },
  { id: "testing_evaluation", kw: ["test", "evaluate", "metric", "accuracy", "performance"], requirement: "Model testing & evaluation", details: "Test coverage, metrics, adversarial testing, and failure modes." },
  { id: "robustness_validation", kw: ["robust", "adversarial", "weather", "edge", "validation"], requirement: "Robustness validation across operational conditions", details: "Out-of-distribution inputs, sensor degradation, operational bounds." },
  { id: "monitoring_deployment", kw: ["monitor", "deploy", "drift", "runtime", "bound"], requirement: "Deployment monitoring & performance tracking", details: "Runtime metrics, drift detection, and performance bounds." },
  { id: "requirements_traceability", kw: ["trace", "version", "lineage", "provenance", "requirement"], requirement: "Requirements-to-model traceability", details: "Requirements mapping, data provenance, and model versioning." },
  { id: "documentation", kw: ["document", "doc", "evidence", "artifact", "report"], requirement: "Development & certification documentation", details: "Process documentation, design rationale, and evidence artifacts." },
];

export const AMBIGUOUS_DEMO = {
  robustness_validation: {
    requirement: "Robustness validation across operational conditions",
    details: "ED-324 does not prescribe a single method — declare the one you followed.",
    interpretations: [
      { id: "statistical", label: "Statistical OOD testing", description: "Quantitative performance on data outside the training distribution." },
      { id: "adversarial", label: "Adversarial attack testing", description: "Robustness against intentionally perturbed inputs (FGSM, PGD)." },
      { id: "simulation", label: "Edge-case simulation", description: "Synthetic edge scenarios: weather, sensor failure, extreme values." },
      { id: "combinatorial", label: "Combinatorial bounds testing", description: "Combinations of operational parameters across the envelope." },
    ],
  },
};

function analyze(steps: WorkflowStep[]) {
  const covered = new Set<string>();
  const mapping: Record<string, string[]> = {};
  for (const s of steps) {
    if (!s.name) continue;
    const hay = `${s.name} ${s.description}`.toLowerCase();
    const hits = ED324.filter((r) => r.kw.some((k) => hay.includes(k))).map((r) => r.id);
    hits.forEach((h) => covered.add(h));
    mapping[s.name] = hits;
  }
  const missing = ED324.filter((r) => !covered.has(r.id));
  return {
    mapping: {
      mapping,
      covered_requirements: [...covered],
      coverage_percent: Math.round((covered.size / ED324.length) * 1000) / 10,
    },
    gaps: {
      missing_requirements: missing.map((m) => m.id),
      gap_details: missing.map((m) => ({ requirement: m.requirement, details: m.details })),
      gap_count: missing.length,
    },
  };
}

export const DEMO = { active: false };

export async function login(email: string, company: string) {
  try {
    const { data } = await api.post("/api/auth/login", { email, company });
    return data;
  } catch (err) {
    if (isOffline(err)) {
      DEMO.active = true;
      return { user_id: 0, email, company };
    }
    throw err;
  }
}

export async function logout() {
  try { await api.post("/api/auth/logout"); } catch { /* demo: nothing to do */ }
}

export async function createWorkflow(payload: {
  program_name: string;
  ml_system: string;
  workflow_steps: WorkflowStep[];
}): Promise<Workflow> {
  try {
    const { data } = await api.post("/api/workflows", payload);
    return {
      id: data.workflow_id,
      program_name: payload.program_name,
      ml_system: payload.ml_system,
      workflow_steps: payload.workflow_steps,
      ed324_mapping: data.mapping,
      gaps: data.gaps,
    };
  } catch (err) {
    if (isOffline(err)) {
      DEMO.active = true;
      const { mapping, gaps } = analyze(payload.workflow_steps);
      return { id: 1, ...payload, ed324_mapping: mapping, gaps };
    }
    throw err;
  }
}

export async function getAmbiguous() {
  try {
    const { data } = await api.get("/api/ed324/ambiguous");
    return data.ambiguous_requirements as typeof AMBIGUOUS_DEMO;
  } catch (err) {
    if (isOffline(err)) { DEMO.active = true; return AMBIGUOUS_DEMO; }
    throw err;
  }
}

export async function generateReport(workflow: Workflow, format: "pdf" | "docx") {
  try {
    const { data } = await api.post(`/api/workflows/${workflow.id}/report`, { format });
    return data.download_url as string;
  } catch (err) {
    if (isOffline(err)) {
      DEMO.active = true;
      // Build a readable text artifact client-side so the download works in the demo.
      const lines = [
        `ED-324 COMPLIANCE REPORT`,
        `Program: ${workflow.program_name}`,
        `ML System: ${workflow.ml_system}`,
        ``,
        `Coverage: ${workflow.ed324_mapping?.coverage_percent ?? 0}%`,
        `Gaps: ${workflow.gaps?.gap_count ?? 0}`,
        ``,
        `Workflow steps:`,
        ...workflow.workflow_steps.filter((s) => s.name).map((s) => `  - ${s.name}: ${s.description}`),
      ];
      const blob = new Blob([lines.join("\n")], { type: "text/plain" });
      return URL.createObjectURL(blob);
    }
    throw err;
  }
}
