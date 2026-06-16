"use client";

import React, { useState } from "react";
import {
  ShieldCheck, ArrowRight, ArrowLeft, LogOut, Plus,
  FileCheck2, Workflow as WorkflowIcon, Scale, Clock,
} from "lucide-react";
import { Workflow, User } from "./types";
import { login as apiLogin, logout as apiLogout, DEMO } from "./lib/api";
import { Logo, Button, Stepper, Field, inputCls, cx } from "./components/ui";
import { WorkflowForm } from "./components/WorkflowForm";
import { InterpretationSelector } from "./components/InterpretationSelector";
import { MappingDisplay } from "./components/MappingDisplay";
import { GapDetection } from "./components/GapDetection";
import { ReportGenerator } from "./components/ReportGenerator";

type AppStep = "login" | "form" | "interpret" | "review" | "report";

export default function App() {
  const [step, setStep] = useState<AppStep>("login");
  const [user, setUser] = useState<User | null>(null);
  const [workflow, setWorkflow] = useState<Workflow | null>(null);

  const handleLoggedIn = (u: User) => { setUser(u); setStep("form"); };
  const handleLogout = async () => {
    await apiLogout();
    setUser(null); setWorkflow(null); setStep("login");
  };
  const onWorkflowCreated = (w: Workflow) => { setWorkflow(w); setStep("interpret"); };
  const onInterpretations = (choices: Record<string, string>) => {
    if (workflow) setWorkflow({ ...workflow, interpretation_choices: choices });
    setStep("review");
  };
  const startOver = () => { setWorkflow(null); setStep("form"); };

  if (step === "login") return <Login onLoggedIn={handleLoggedIn} />;

  return (
    <div className="flex flex-col min-h-dvh">
      {/* Top bar */}
      <header className="sticky top-0 z-40 border-b border-[var(--color-line)] bg-[var(--color-surface)]/85 backdrop-blur-xl">
        <div className="mx-auto max-w-6xl px-5 h-16 flex items-center justify-between gap-4">
          <Logo />
          <div className="hidden md:block"><Stepper current={step} /></div>
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex flex-col items-end leading-tight">
              <span className="text-[12.5px] font-semibold text-[var(--color-ink)] max-w-[180px] truncate">{user?.email}</span>
              {user?.company && <span className="text-[11px] text-[var(--color-faint)]">{user.company}</span>}
            </div>
            <button onClick={handleLogout} aria-label="Sign out"
              className="grid place-items-center h-9 w-9 rounded-[10px] border border-[var(--color-line)] text-[var(--color-muted)] hover:text-[var(--color-ink)] hover:bg-[var(--color-surface-2)] transition-colors cursor-pointer">
              <LogOut size={16} />
            </button>
          </div>
        </div>
        <div className="md:hidden border-t border-[var(--color-line-2)] px-5 py-2.5 overflow-x-auto"><Stepper current={step} /></div>
      </header>

      {DEMO.active && (
        <div className="bg-[var(--color-accent-soft)] border-b border-[var(--color-line)]">
          <div className="mx-auto max-w-6xl px-5 py-2 text-[12.5px] text-[var(--color-accent-ink)] font-medium flex items-center gap-2">
            <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-accent)]" />
            Preview mode — running on sample data. Connect the backend API to persist real programs.
          </div>
        </div>
      )}

      <main className="flex-1 mx-auto w-full max-w-6xl px-5 py-8 sm:py-12">
        {step === "form" && (
          <Stage key="form">
            <StageHead eyebrow="Step 1 — Capture" title="Describe your ML development workflow"
              sub="Record what your team actually did, step by step. We map each step to ED-324 obligations and surface what's missing." />
            <WorkflowForm onWorkflowCreated={onWorkflowCreated} />
          </Stage>
        )}

        {step === "interpret" && workflow && (
          <Stage key="interpret">
            <BackBar onBack={() => setStep("form")} label="Back to workflow" />
            <StageHead eyebrow="Step 2 — Interpretation" title="Resolve ambiguous requirements"
              sub="Some ED-324 clauses admit several valid methods. Declare the interpretation your program followed — it's recorded in the evidence trail." />
            <InterpretationSelector onSelectInterpretations={onInterpretations} onSkip={() => onInterpretations({})} />
          </Stage>
        )}

        {step === "review" && workflow && (
          <Stage key="review">
            <BackBar onBack={startOver} label="Start over" />
            <StageHead eyebrow="Step 3 — Analysis" title="Compliance coverage & gaps"
              sub={`${workflow.program_name} · mapped against ${7} ED-324 requirements.`} />
            <div className="grid gap-6">
              <MappingDisplay workflow={workflow} />
              <GapDetection workflow={workflow} />
            </div>
            <div className="mt-8 flex justify-end">
              <Button onClick={() => setStep("report")}>Generate compliance report <ArrowRight size={16} /></Button>
            </div>
          </Stage>
        )}

        {step === "report" && workflow && (
          <Stage key="report">
            <BackBar onBack={() => setStep("review")} label="Back to analysis" />
            <StageHead eyebrow="Step 4 — Evidence" title="Generate regulator-ready report"
              sub="A formatted evidence document covering workflow, mapping, gaps and certification readiness." />
            <ReportGenerator workflow={workflow} />
            <div className="mt-8 flex justify-center">
              <Button variant="secondary" onClick={startOver}><Plus size={16} /> Start a new program</Button>
            </div>
          </Stage>
        )}
      </main>

      <footer className="border-t border-[var(--color-line)] bg-[var(--color-surface)]">
        <div className="mx-auto max-w-6xl px-5 py-5 flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center gap-2 text-[12px] text-[var(--color-faint)]"><Logo compact /> <span>© 2026 Verity</span></div>
          <span className="text-[11.5px] text-[var(--color-faint)]">ED-324 evidence tooling for aerospace ML programs</span>
        </div>
      </footer>
    </div>
  );
}

/* ---------------- Stage wrappers ---------------- */
function Stage({ children }: { children: React.ReactNode }) {
  return <div className="animate-rise">{children}</div>;
}
function StageHead({ eyebrow, title, sub }: { eyebrow: string; title: string; sub: string }) {
  return (
    <div className="mb-7 max-w-2xl">
      <span className="text-[11px] font-bold uppercase tracking-[0.16em] text-[var(--color-accent)]">{eyebrow}</span>
      <h1 className="mt-2 text-[26px] sm:text-[30px] font-extrabold tracking-tight text-[var(--color-ink)] leading-tight">{title}</h1>
      <p className="mt-2 text-[14.5px] text-[var(--color-muted)] leading-relaxed">{sub}</p>
    </div>
  );
}
function BackBar({ onBack, label }: { onBack: () => void; label: string }) {
  return (
    <button onClick={onBack}
      className="inline-flex items-center gap-1.5 mb-4 text-[13px] font-semibold text-[var(--color-muted)] hover:text-[var(--color-ink)] transition-colors cursor-pointer group">
      <ArrowLeft size={15} className="transition-transform group-hover:-translate-x-0.5" /> {label}
    </button>
  );
}

/* ---------------- Login (split hero) ---------------- */
function Login({ onLoggedIn }: { onLoggedIn: (u: User) => void }) {
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(""); setLoading(true);
    try {
      const u = await apiLogin(email, company);
      onLoggedIn(u);
    } catch (err: unknown) {
      const msg = (err as { response?: { data?: { error?: string } } })?.response?.data?.error;
      setError(msg || "Sign-in failed. Check your email and try again.");
    } finally {
      setLoading(false);
    }
  };

  const props = [
    { icon: WorkflowIcon, title: "Map every step", body: "Each workflow stage is matched to its ED-324 obligation." },
    { icon: Scale, title: "Declare interpretations", body: "Resolve ambiguous clauses with an auditable rationale." },
    { icon: FileCheck2, title: "Export evidence", body: "Regulator-ready PDF or Word — no manual editing." },
  ];

  return (
    <div className="flex-1 grid lg:grid-cols-[1.05fr_1fr] min-h-dvh">
      {/* Left — mission control */}
      <div className="relative hidden lg:flex flex-col justify-between overflow-hidden bg-[#0b1430] text-white p-12 blueprint">
        <div className="absolute -right-40 -top-40 h-[460px] w-[460px] rounded-full bg-[radial-gradient(circle,rgba(36,86,230,0.45),transparent_70%)]" />
        <div className="relative flex items-center gap-2.5">
          <span className="grid place-items-center h-9 w-9 rounded-[11px] bg-white/10 ring-1 ring-white/15">
            <ShieldCheck size={18} className="text-white" />
          </span>
          <span className="text-[16px] font-extrabold tracking-tight">Verity</span>
        </div>

        <div className="relative">
          <span className="text-[11px] font-bold uppercase tracking-[0.18em] text-[#8fb0ff]">ED-324 · DO-178C aligned</span>
          <h2 className="mt-3 text-[40px] font-extrabold leading-[1.05] tracking-tight">
            Certification evidence,<br />in hours — not months.
          </h2>
          <p className="mt-4 max-w-md text-[15px] leading-relaxed text-white/65">
            Verity turns scattered ML development records into a structured, regulator-ready ED-324 compliance dossier for aerospace programs.
          </p>
          <div className="mt-9 grid gap-3.5 max-w-md">
            {props.map((p) => (
              <div key={p.title} className="flex items-start gap-3.5 rounded-2xl bg-white/[0.04] ring-1 ring-white/10 p-4">
                <span className="grid place-items-center h-9 w-9 shrink-0 rounded-[10px] bg-white/10"><p.icon size={17} className="text-[#a8c2ff]" /></span>
                <div>
                  <div className="text-[14px] font-semibold">{p.title}</div>
                  <div className="text-[12.5px] text-white/55 leading-snug">{p.body}</div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="relative flex items-center gap-2 text-[12px] text-white/45">
          <Clock size={14} /> Median program mapping: under 4 hours
        </div>
      </div>

      {/* Right — sign in */}
      <div className="flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-sm animate-rise">
          <div className="lg:hidden mb-8"><Logo /></div>
          <h1 className="text-[24px] font-extrabold tracking-tight text-[var(--color-ink)]">Sign in to your workspace</h1>
          <p className="mt-1.5 text-[14px] text-[var(--color-muted)]">No password needed for the pilot — we'll provision your workspace automatically.</p>

          <form onSubmit={submit} className="mt-7 grid gap-4">
            {error && (
              <div role="alert" className="rounded-[var(--radius-md)] bg-[var(--color-danger-soft)] border border-[var(--color-danger)]/25 px-3.5 py-2.5 text-[13px] text-[var(--color-danger)]">
                {error}
              </div>
            )}
            <Field label="Work email" required>
              <input type="email" required value={email} onChange={(e) => setEmail(e.target.value)}
                placeholder="engineer@oem.aero" autoComplete="email" className={inputCls} />
            </Field>
            <Field label="Organization" hint="optional">
              <input type="text" value={company} onChange={(e) => setCompany(e.target.value)}
                placeholder="Textron · Collins · GE Aviation" className={inputCls} />
            </Field>
            <Button type="submit" loading={loading} className="w-full mt-1">
              {loading ? "Provisioning…" : <>Enter workspace <ArrowRight size={16} /></>}
            </Button>
          </form>

          <p className="mt-6 text-[12px] text-[var(--color-faint)] leading-relaxed">
            By continuing you agree to handle exported evidence in accordance with your program's data-classification policy.
          </p>
        </div>
      </div>
    </div>
  );
}
