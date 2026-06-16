"use client";

import React, { useEffect, useState } from "react";
import { Check, Minus } from "lucide-react";
import { Workflow } from "../types";
import { cx } from "./ui";

const REQ_LABEL: Record<string, string> = {
  data_preparation: "Data preparation",
  model_training: "Model training",
  testing_evaluation: "Testing & evaluation",
  robustness_validation: "Robustness validation",
  monitoring_deployment: "Deployment monitoring",
  requirements_traceability: "Traceability",
  documentation: "Documentation",
};

function Gauge({ percent }: { percent: number }) {
  const [p, setP] = useState(0);
  useEffect(() => {
    const t = setTimeout(() => setP(percent), 80);
    return () => clearTimeout(t);
  }, [percent]);
  const r = 52, c = 2 * Math.PI * r;
  const tone = percent >= 80 ? "var(--color-ok)" : percent >= 50 ? "var(--color-accent)" : "var(--color-warn)";
  return (
    <div className="relative h-[140px] w-[140px] shrink-0">
      <svg viewBox="0 0 140 140" className="-rotate-90 h-full w-full">
        <circle cx="70" cy="70" r={r} fill="none" stroke="var(--color-line-2)" strokeWidth="11" />
        <circle cx="70" cy="70" r={r} fill="none" stroke={tone} strokeWidth="11" strokeLinecap="round"
          strokeDasharray={c} strokeDashoffset={c - (c * p) / 100}
          style={{ transition: "stroke-dashoffset 1s cubic-bezier(0.16,1,0.3,1)" }} />
      </svg>
      <div className="absolute inset-0 grid place-content-center text-center">
        <span className="text-[30px] font-extrabold tracking-tight tnum text-[var(--color-ink)] leading-none">{Math.round(p)}<span className="text-[16px] text-[var(--color-faint)]">%</span></span>
        <span className="text-[10.5px] font-semibold uppercase tracking-wider text-[var(--color-faint)] mt-1">covered</span>
      </div>
    </div>
  );
}

export function MappingDisplay({ workflow }: { workflow: Workflow }) {
  const m = workflow.ed324_mapping;
  if (!m) return null;
  const covered = new Set(m.covered_requirements);

  return (
    <section className="card overflow-hidden">
      <div className="flex flex-col sm:flex-row sm:items-center gap-6 p-6 border-b border-[var(--color-line-2)] bg-[var(--color-surface-2)]">
        <Gauge percent={m.coverage_percent} />
        <div className="flex-1">
          <h2 className="text-[16px] font-bold text-[var(--color-ink)]">ED-324 requirement coverage</h2>
          <p className="text-[13px] text-[var(--color-muted)] mt-1 max-w-md">
            {covered.size} of 7 requirements are evidenced by your workflow. The remainder appear as gaps below.
          </p>
          <div className="flex flex-wrap gap-1.5 mt-4">
            {Object.keys(REQ_LABEL).map((id) => {
              const ok = covered.has(id);
              return (
                <span key={id} className={cx(
                  "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11.5px] font-semibold",
                  ok ? "bg-[var(--color-ok-soft)] text-[var(--color-ok)]" : "bg-[var(--color-line-2)] text-[var(--color-faint)]"
                )}>
                  {ok ? <Check size={11} strokeWidth={3} /> : <Minus size={11} strokeWidth={3} />}
                  {REQ_LABEL[id]}
                </span>
              );
            })}
          </div>
        </div>
      </div>

      <div className="divide-y divide-[var(--color-line-2)]">
        {Object.entries(m.mapping).map(([stepName, reqs]) => (
          <div key={stepName} className="flex flex-col sm:flex-row sm:items-center gap-3 px-6 py-4">
            <div className="sm:w-56 shrink-0 font-semibold text-[14px] text-[var(--color-ink)]">{stepName}</div>
            <div className="flex flex-wrap gap-1.5">
              {reqs.length > 0 ? reqs.map((r) => (
                <span key={r} className="mono inline-flex items-center gap-1.5 rounded-md bg-[var(--color-accent-soft)] text-[var(--color-accent-ink)] px-2 py-1 text-[11.5px] font-medium">
                  <Check size={11} strokeWidth={3} /> {r}
                </span>
              )) : (
                <span className="text-[12.5px] text-[var(--color-faint)] italic">No ED-324 requirement matched</span>
              )}
            </div>
          </div>
        ))}
      </div>
    </section>
  );
}
