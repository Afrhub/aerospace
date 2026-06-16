"use client";

import React from "react";
import { Check } from "lucide-react";

export const cx = (...c: (string | false | null | undefined)[]) =>
  c.filter(Boolean).join(" ");

/* ---------------- Wordmark ---------------- */
export function Logo({ compact = false }: { compact?: boolean }) {
  return (
    <span className="inline-flex items-center gap-2.5 select-none">
      <span className="grid place-items-center h-8 w-8 rounded-[10px] bg-[var(--color-accent)] shadow-[var(--shadow-sm)]">
        <svg width="17" height="17" viewBox="0 0 24 24" fill="none" aria-hidden>
          <path d="M12 2 4 5.5v6c0 4.7 3.2 8.4 8 10.5 4.8-2.1 8-5.8 8-10.5v-6L12 2Z" stroke="#fff" strokeWidth="1.7" strokeLinejoin="round" />
          <path d="m8.6 12 2.3 2.4 4.5-4.8" stroke="#fff" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
      </span>
      {!compact && (
        <span className="flex flex-col leading-none">
          <span className="text-[15px] font-extrabold tracking-tight text-[var(--color-ink)]">Verity</span>
          <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[var(--color-faint)]">ED-324 Evidence</span>
        </span>
      )}
    </span>
  );
}

/* ---------------- Button ---------------- */
type BtnProps = React.ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: "primary" | "secondary" | "ghost";
  loading?: boolean;
};
export function Button({
  variant = "primary",
  loading,
  className,
  children,
  disabled,
  ...rest
}: BtnProps) {
  const base =
    "inline-flex items-center justify-center gap-2 h-11 px-5 rounded-[var(--radius-md)] text-[14px] font-semibold transition-all duration-200 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.985] whitespace-nowrap";
  const styles = {
    primary:
      "bg-[var(--color-accent)] text-white shadow-[var(--shadow-sm)] hover:bg-[var(--color-accent-hover)] hover:shadow-[var(--shadow-md)]",
    secondary:
      "bg-[var(--color-surface)] text-[var(--color-ink-2)] border border-[var(--color-line)] hover:border-[var(--color-faint)] hover:bg-[var(--color-surface-2)]",
    ghost: "text-[var(--color-muted)] hover:text-[var(--color-ink)] hover:bg-[var(--color-surface-2)]",
  };
  return (
    <button className={cx(base, styles[variant], className)} disabled={disabled || loading} {...rest}>
      {loading && (
        <span className="h-4 w-4 rounded-full border-2 border-current/30 border-t-current animate-spin" />
      )}
      {children}
    </button>
  );
}

/* ---------------- Stepper ---------------- */
export const STEPS = [
  { key: "form", label: "Workflow" },
  { key: "interpret", label: "Interpretations" },
  { key: "review", label: "Review" },
  { key: "report", label: "Report" },
] as const;

export function Stepper({ current }: { current: string }) {
  const idx = STEPS.findIndex((s) => s.key === current);
  return (
    <nav aria-label="Progress" className="flex items-center gap-1.5 sm:gap-3">
      {STEPS.map((s, i) => {
        const done = i < idx;
        const active = i === idx;
        return (
          <React.Fragment key={s.key}>
            <div className="flex items-center gap-2">
              <span
                className={cx(
                  "grid place-items-center h-6 w-6 rounded-full text-[11px] font-bold tnum transition-colors",
                  done && "bg-[var(--color-accent)] text-white",
                  active && "bg-[var(--color-accent-soft)] text-[var(--color-accent)] ring-2 ring-[var(--color-accent)]",
                  !done && !active && "bg-[var(--color-line-2)] text-[var(--color-faint)]"
                )}
              >
                {done ? <Check size={13} strokeWidth={3} /> : i + 1}
              </span>
              <span
                className={cx(
                  "hidden sm:block text-[12.5px] font-semibold transition-colors",
                  active ? "text-[var(--color-ink)]" : "text-[var(--color-faint)]"
                )}
              >
                {s.label}
              </span>
            </div>
            {i < STEPS.length - 1 && (
              <span className={cx("h-px w-4 sm:w-8", done ? "bg-[var(--color-accent)]" : "bg-[var(--color-line)]")} />
            )}
          </React.Fragment>
        );
      })}
    </nav>
  );
}

/* ---------------- Field ---------------- */
export function Field({
  label, hint, required, children,
}: {
  label: string; hint?: string; required?: boolean; children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="flex items-baseline justify-between mb-1.5">
        <span className="text-[13px] font-semibold text-[var(--color-ink-2)]">
          {label}
          {required && <span className="text-[var(--color-accent)]"> *</span>}
        </span>
        {hint && <span className="text-[11.5px] text-[var(--color-faint)]">{hint}</span>}
      </span>
      {children}
    </label>
  );
}

export const inputCls =
  "w-full h-11 px-3.5 rounded-[var(--radius-sm)] border border-[var(--color-line)] bg-[var(--color-surface)] text-[14px] text-[var(--color-ink)] placeholder:text-[var(--color-faint)] transition-colors focus:border-[var(--color-accent)] outline-none";

/* ---------------- Section header (for review screens) ---------------- */
export function Eyebrow({ children }: { children: React.ReactNode }) {
  return (
    <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--color-accent)]">
      {children}
    </span>
  );
}
