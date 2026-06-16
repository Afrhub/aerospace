"use client";

import React, { useState } from "react";
import { Plus, Trash2, GripVertical, Sparkles } from "lucide-react";
import { WorkflowStep, Workflow } from "../types";
import { createWorkflow } from "../lib/api";
import { Button, Field, inputCls, cx } from "./ui";

const SAMPLE: { program: string; system: string; steps: WorkflowStep[] } = {
  program: "Avionics Fault-Detection ML — Block 2",
  system: "ResNet-50 classifier on multi-sensor telemetry",
  steps: [
    { name: "Data collection & labeling", description: "Collected 50k labeled sensor frames from flight-test campaigns; versioned in DVC.", tools: ["Jira", "DVC"] },
    { name: "Model training", description: "Trained ResNet-50 with fixed seeds and logged hyperparameters for reproducibility.", tools: ["PyTorch", "MLflow"] },
    { name: "Evaluation", description: "Measured accuracy and false-negative rate on a held-out test set.", tools: ["pytest"] },
  ],
};

export function WorkflowForm({ onWorkflowCreated }: { onWorkflowCreated: (w: Workflow) => void }) {
  const [programName, setProgramName] = useState("");
  const [mlSystem, setMlSystem] = useState("");
  const [steps, setSteps] = useState<WorkflowStep[]>([{ name: "", description: "", tools: [] }]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const addStep = () => setSteps([...steps, { name: "", description: "", tools: [] }]);
  const removeStep = (i: number) => setSteps(steps.filter((_, idx) => idx !== i));
  const change = (i: number, field: keyof WorkflowStep, value: string) => {
    const next = [...steps];
    if (field === "tools") next[i].tools = value.split(",").map((t) => t.trim()).filter(Boolean);
    else next[i][field] = value;
    setSteps(next);
  };
  const fillSample = () => {
    setProgramName(SAMPLE.program); setMlSystem(SAMPLE.system); setSteps(SAMPLE.steps);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      const w = await createWorkflow({
        program_name: programName,
        ml_system: mlSystem,
        workflow_steps: steps.filter((s) => s.name && s.description),
      });
      onWorkflowCreated(w);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
      setError(msg || "Could not create workflow. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={submit} className="grid gap-6">
      {error && (
        <div role="alert" className="rounded-[var(--radius-md)] bg-[var(--color-danger-soft)] border border-[var(--color-danger)]/25 px-4 py-3 text-[13px] text-[var(--color-danger)]">
          {error}
        </div>
      )}

      {/* Program identity */}
      <section className="card p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-[15px] font-bold text-[var(--color-ink)]">Program identity</h2>
          <button type="button" onClick={fillSample}
            className="inline-flex items-center gap-1.5 text-[12.5px] font-semibold text-[var(--color-accent)] hover:text-[var(--color-accent-hover)] transition-colors cursor-pointer">
            <Sparkles size={14} /> Load sample
          </button>
        </div>
        <div className="grid sm:grid-cols-2 gap-4">
          <Field label="Program name" required>
            <input className={inputCls} value={programName} onChange={(e) => setProgramName(e.target.value)}
              placeholder="e.g. Avionics ML Safety System v1" required />
          </Field>
          <Field label="ML system" required>
            <input className={inputCls} value={mlSystem} onChange={(e) => setMlSystem(e.target.value)}
              placeholder="e.g. Neural network for fault detection" required />
          </Field>
        </div>
      </section>

      {/* Steps */}
      <section className="card p-6">
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-[15px] font-bold text-[var(--color-ink)]">Development steps</h2>
          <span className="text-[12px] text-[var(--color-faint)] tnum">{steps.length} step{steps.length !== 1 && "s"}</span>
        </div>
        <p className="text-[13px] text-[var(--color-muted)] mb-5">Document what you actually did — leave blank to skip. Gaps are flagged automatically.</p>

        <div className="grid gap-3">
          {steps.map((step, i) => (
            <div key={i} className="group relative rounded-[var(--radius-md)] border border-[var(--color-line)] bg-[var(--color-surface-2)] p-4 transition-colors hover:border-[var(--color-faint)]/60">
              <div className="flex items-center gap-2 mb-3">
                <GripVertical size={15} className="text-[var(--color-faint)]" />
                <span className="grid place-items-center h-5 w-5 rounded-md bg-[var(--color-accent-soft)] text-[var(--color-accent)] text-[11px] font-bold tnum">{i + 1}</span>
                <span className="text-[12.5px] font-semibold text-[var(--color-muted)]">Step {i + 1}</span>
                {steps.length > 1 && (
                  <button type="button" onClick={() => removeStep(i)} aria-label={`Remove step ${i + 1}`}
                    className="ml-auto grid place-items-center h-7 w-7 rounded-lg text-[var(--color-faint)] hover:text-[var(--color-danger)] hover:bg-[var(--color-danger-soft)] transition-colors cursor-pointer">
                    <Trash2 size={14} />
                  </button>
                )}
              </div>
              <div className="grid gap-2.5">
                <input className={inputCls} value={step.name} onChange={(e) => change(i, "name", e.target.value)}
                  placeholder="Step name — e.g. Data Collection" />
                <textarea value={step.description} onChange={(e) => change(i, "description", e.target.value)}
                  placeholder="What did you do in this step?"
                  className={cx(inputCls, "h-auto min-h-[76px] py-3 leading-relaxed resize-y")} />
                <input className={cx(inputCls, "mono text-[13px]")} value={step.tools.join(", ")}
                  onChange={(e) => change(i, "tools", e.target.value)}
                  placeholder="Tools used (comma-separated) — Jira, GitHub, TensorFlow" />
              </div>
            </div>
          ))}
        </div>

        <button type="button" onClick={addStep}
          className="mt-3 w-full inline-flex items-center justify-center gap-2 h-11 rounded-[var(--radius-md)] border border-dashed border-[var(--color-line)] text-[13px] font-semibold text-[var(--color-muted)] hover:border-[var(--color-accent)] hover:text-[var(--color-accent)] hover:bg-[var(--color-accent-soft)]/50 transition-colors cursor-pointer">
          <Plus size={16} /> Add step
        </button>
      </section>

      <div className="flex justify-end">
        <Button type="submit" loading={loading}>
          {loading ? "Mapping to ED-324…" : "Map to ED-324"}
        </Button>
      </div>
    </form>
  );
}
