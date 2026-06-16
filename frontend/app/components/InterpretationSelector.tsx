"use client";

import React, { useEffect, useState } from "react";
import { Check, ScanSearch } from "lucide-react";
import { getAmbiguous } from "../lib/api";
import { Button, cx } from "./ui";

interface Interpretation { id: string; label: string; description: string; }
interface AmbiguousReq { requirement: string; details: string; interpretations: Interpretation[]; }

export function InterpretationSelector({
  onSelectInterpretations, onSkip,
}: {
  onSelectInterpretations: (choices: Record<string, string>) => void;
  onSkip: () => void;
}) {
  const [reqs, setReqs] = useState<Record<string, AmbiguousReq>>({});
  const [selections, setSelections] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAmbiguous().then((data) => {
      setReqs(data as Record<string, AmbiguousReq>);
      const init: Record<string, string> = {};
      Object.entries(data).forEach(([id, r]) => {
        if ((r as AmbiguousReq).interpretations?.length) init[id] = (r as AmbiguousReq).interpretations[0].id;
      });
      setSelections(init);
    }).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="card p-10 grid place-items-center text-[13px] text-[var(--color-muted)]">
        <span className="h-5 w-5 mb-3 rounded-full border-2 border-[var(--color-line)] border-t-[var(--color-accent)] animate-spin" />
        Loading interpretation options…
      </div>
    );
  }

  const entries = Object.entries(reqs);
  if (entries.length === 0) {
    return (
      <div className="card p-8 text-center">
        <p className="text-[14px] text-[var(--color-muted)]">No ambiguous requirements detected for this workflow.</p>
        <Button className="mt-4 mx-auto" onClick={() => onSelectInterpretations({})}>Continue to analysis</Button>
      </div>
    );
  }

  return (
    <div className="grid gap-6">
      {entries.map(([id, req]) => (
        <section key={id} className="card p-6">
          <div className="flex items-start gap-3 mb-5">
            <span className="grid place-items-center h-9 w-9 shrink-0 rounded-[10px] bg-[var(--color-accent-soft)] text-[var(--color-accent)]"><ScanSearch size={18} /></span>
            <div>
              <h2 className="text-[15.5px] font-bold text-[var(--color-ink)]">{req.requirement}</h2>
              <p className="text-[13px] text-[var(--color-muted)] mt-0.5">{req.details}</p>
            </div>
          </div>

          <div className="grid sm:grid-cols-2 gap-3">
            {req.interpretations.map((interp) => {
              const active = selections[id] === interp.id;
              return (
                <button key={interp.id} type="button"
                  onClick={() => setSelections({ ...selections, [id]: interp.id })}
                  className={cx(
                    "text-left rounded-[var(--radius-md)] border p-4 transition-all cursor-pointer",
                    active
                      ? "border-[var(--color-accent)] bg-[var(--color-accent-soft)] shadow-[var(--shadow-sm)]"
                      : "border-[var(--color-line)] bg-[var(--color-surface)] hover:border-[var(--color-faint)] hover:bg-[var(--color-surface-2)]"
                  )}>
                  <div className="flex items-center gap-2.5 mb-1.5">
                    <span className={cx(
                      "grid place-items-center rounded-full border-2 transition-colors shrink-0",
                      active ? "border-[var(--color-accent)] bg-[var(--color-accent)]" : "border-[var(--color-faint)]"
                    )} style={{ height: 18, width: 18 }}>
                      {active && <Check size={11} strokeWidth={3} className="text-white" />}
                    </span>
                    <span className={cx("text-[13.5px] font-bold", active ? "text-[var(--color-accent-ink)]" : "text-[var(--color-ink)]")}>{interp.label}</span>
                  </div>
                  <p className="text-[12.5px] leading-snug text-[var(--color-muted)] pl-[28px]">{interp.description}</p>
                </button>
              );
            })}
          </div>
        </section>
      ))}

      <div className="flex items-center justify-end gap-3">
        <Button variant="ghost" onClick={onSkip}>Skip — use defaults</Button>
        <Button onClick={() => onSelectInterpretations(selections)}>Confirm interpretations</Button>
      </div>
    </div>
  );
}
