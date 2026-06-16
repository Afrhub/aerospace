"use client";

import React from "react";
import { ShieldCheck, AlertTriangle } from "lucide-react";
import { Workflow } from "../types";

export function GapDetection({ workflow }: { workflow: Workflow }) {
  const gaps = workflow.gaps;
  if (!gaps) return null;

  if (gaps.gap_count === 0) {
    return (
      <section className="card p-6 flex items-start gap-4">
        <span className="grid place-items-center h-11 w-11 shrink-0 rounded-[12px] bg-[var(--color-ok-soft)] text-[var(--color-ok)]"><ShieldCheck size={22} /></span>
        <div>
          <h2 className="text-[15.5px] font-bold text-[var(--color-ink)]">No gaps detected</h2>
          <p className="text-[13.5px] text-[var(--color-muted)] mt-1">Every ED-324 requirement is evidenced by your workflow. You're ready to generate the compliance report.</p>
        </div>
      </section>
    );
  }

  return (
    <section className="card overflow-hidden">
      <div className="flex items-center gap-3 p-6 border-b border-[var(--color-line-2)]">
        <span className="grid place-items-center h-11 w-11 shrink-0 rounded-[12px] bg-[var(--color-warn-soft)] text-[var(--color-warn)]"><AlertTriangle size={21} /></span>
        <div>
          <h2 className="text-[15.5px] font-bold text-[var(--color-ink)]">
            <span className="tnum">{gaps.gap_count}</span> requirement{gaps.gap_count !== 1 && "s"} need attention
          </h2>
          <p className="text-[13px] text-[var(--color-muted)]">Address these before submitting to regulators, or document the deviation in your evidence trail.</p>
        </div>
      </div>

      <ol className="divide-y divide-[var(--color-line-2)]">
        {gaps.gap_details.map((gap, i) => (
          <li key={i} className="flex gap-4 px-6 py-4">
            <span className="grid place-items-center h-7 w-7 shrink-0 rounded-full bg-[var(--color-warn-soft)] text-[var(--color-warn)] text-[12px] font-bold tnum">{i + 1}</span>
            <div>
              <h3 className="text-[14px] font-bold text-[var(--color-ink)]">{gap.requirement}</h3>
              <p className="text-[13px] text-[var(--color-muted)] mt-0.5 leading-relaxed">{gap.details}</p>
            </div>
          </li>
        ))}
      </ol>
    </section>
  );
}
