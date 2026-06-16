"use client";

import React, { useState } from "react";
import { FileText, Download, Check, FileType2 } from "lucide-react";
import { Workflow } from "../types";
import { generateReport, api } from "../lib/api";
import { Button, cx } from "./ui";

const CONTENTS = [
  "Program & ML system identification",
  "Complete development workflow record",
  "ED-324 requirement mapping & coverage",
  "Identified gaps & declared interpretations",
  "Certification-readiness assessment",
];

export function ReportGenerator({ workflow }: { workflow: Workflow }) {
  const [format, setFormat] = useState<"pdf" | "docx">("pdf");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [done, setDone] = useState(false);

  const generate = async () => {
    setError(""); setLoading(true); setDone(false);
    try {
      const url = await generateReport(workflow, format);
      const href = url.startsWith("blob:") || url.startsWith("http") ? url : `${api.defaults.baseURL}${url}`;
      const a = document.createElement("a");
      a.href = href;
      a.download = `compliance_report_${workflow.id}.${format}`;
      document.body.appendChild(a); a.click(); a.remove();
      setDone(true);
      setTimeout(() => setDone(false), 3500);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
      setError(msg || "Report generation failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const coverage = workflow.ed324_mapping?.coverage_percent ?? 0;
  const gapCount = workflow.gaps?.gap_count ?? 0;

  return (
    <div className="grid lg:grid-cols-[1fr_340px] gap-6 items-start">
      {/* Document preview */}
      <div className="card p-8 sm:p-10">
        <div className="mx-auto max-w-md rounded-xl border border-[var(--color-line)] bg-white shadow-[var(--shadow-md)] p-8 aspect-[1/1.18] flex flex-col">
          <div className="flex items-center gap-2 text-[var(--color-accent)]">
            <FileText size={18} />
            <span className="text-[11px] font-bold uppercase tracking-[0.16em]">ED-324 Compliance Report</span>
          </div>
          <div className="mt-5 space-y-1">
            <div className="text-[15px] font-extrabold text-[var(--color-ink)] leading-snug">{workflow.program_name || "Program"}</div>
            <div className="text-[12px] text-[var(--color-muted)]">{workflow.ml_system || "ML system"}</div>
          </div>
          <div className="mt-5 grid grid-cols-2 gap-2">
            <div className="rounded-lg bg-[var(--color-surface-2)] border border-[var(--color-line-2)] p-3">
              <div className="text-[20px] font-extrabold tnum text-[var(--color-ink)]">{coverage}%</div>
              <div className="text-[10.5px] font-semibold uppercase tracking-wide text-[var(--color-faint)]">Coverage</div>
            </div>
            <div className="rounded-lg bg-[var(--color-surface-2)] border border-[var(--color-line-2)] p-3">
              <div className="text-[20px] font-extrabold tnum text-[var(--color-ink)]">{gapCount}</div>
              <div className="text-[10.5px] font-semibold uppercase tracking-wide text-[var(--color-faint)]">Gaps</div>
            </div>
          </div>
          <div className="mt-5 space-y-2 flex-1">
            {[100, 82, 90, 68].map((w, i) => (
              <div key={i} className="h-2 rounded-full bg-[var(--color-line-2)]" style={{ width: `${w}%` }} />
            ))}
          </div>
          <div className="mt-4 pt-4 border-t border-[var(--color-line-2)] text-[10px] text-[var(--color-faint)] flex justify-between">
            <span>Verity · Generated</span><span className="mono">ED-324</span>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="card p-6">
        <h2 className="text-[15px] font-bold text-[var(--color-ink)]">Export evidence</h2>
        <p className="text-[13px] text-[var(--color-muted)] mt-1">Regulator-ready — no manual editing required.</p>

        {/* Segmented control */}
        <div className="mt-5 grid grid-cols-2 gap-1 p-1 rounded-[var(--radius-md)] bg-[var(--color-line-2)]">
          {(["pdf", "docx"] as const).map((f) => (
            <button key={f} onClick={() => setFormat(f)}
              className={cx(
                "inline-flex items-center justify-center gap-1.5 h-9 rounded-[9px] text-[13px] font-semibold transition-all cursor-pointer",
                format === f ? "bg-[var(--color-surface)] text-[var(--color-ink)] shadow-[var(--shadow-xs)]" : "text-[var(--color-muted)] hover:text-[var(--color-ink)]"
              )}>
              <FileType2 size={14} /> {f.toUpperCase()}
            </button>
          ))}
        </div>

        <ul className="mt-5 grid gap-2">
          {CONTENTS.map((c) => (
            <li key={c} className="flex items-start gap-2.5 text-[13px] text-[var(--color-ink-2)]">
              <Check size={15} className="mt-0.5 shrink-0 text-[var(--color-ok)]" strokeWidth={2.5} /> {c}
            </li>
          ))}
        </ul>

        {error && <div role="alert" className="mt-4 rounded-[var(--radius-md)] bg-[var(--color-danger-soft)] border border-[var(--color-danger)]/25 px-3.5 py-2.5 text-[12.5px] text-[var(--color-danger)]">{error}</div>}

        <Button onClick={generate} loading={loading} className="w-full mt-5">
          {done ? <><Check size={16} /> Downloaded</> : <><Download size={16} /> Download {format.toUpperCase()}</>}
        </Button>
        <p className="mt-3 text-[11.5px] text-[var(--color-faint)] leading-relaxed text-center">Handle exported evidence per your program's data-classification policy.</p>
      </div>
    </div>
  );
}
