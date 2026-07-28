"use client";

import { useActionState, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Lightbulb, ArrowLeft, ArrowRight, MapPin, Users, FileText, Eye } from "lucide-react";
import {
  createProposalAction,
  type ProposalFormState,
} from "@/app/actions/proposals";
import { Field, Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { SubmitButton } from "@/components/ui/submit-button";
import { Alert } from "@/components/ui/alert";
import { AFFECTED_GROUPS } from "@/lib/civic-topics";
import { cn } from "@/lib/utils";
import type { NeighborhoodOption } from "@/lib/data/neighborhoods";

// Creazione guidata delle proposte (A1 §14): una domanda alla volta.
// Lo stato vive nel client; al passo finale parte la server action di sempre
// (gli input nascosti portano tutti i campi nel FormData).

const selectClass =
  "h-11 w-full rounded-[var(--radius-sm)] border border-border-strong bg-surface px-3 text-sm text-foreground focus-visible:border-teal focus-visible:outline-none";

const textareaClass =
  "w-full resize-none rounded-[var(--radius-sm)] border border-border-strong bg-surface px-3.5 py-2.5 text-sm placeholder:text-muted-2 focus-visible:border-teal focus-visible:outline-none";

const CATEGORIES = ["Mobilità", "Verde", "Ambiente", "Cultura", "Sport", "Sociale", "Decoro", "Sicurezza"];

const STEPS = [
  { title: "Il problema", icon: Lightbulb },
  { title: "Dove", icon: MapPin },
  { title: "Chi ne beneficia", icon: Users },
  { title: "La tua proposta", icon: FileText },
  { title: "Riepilogo", icon: Eye },
] as const;

export function ProposalWizard({
  neighborhoods,
  defaultNeighborhoodId,
}: {
  neighborhoods: NeighborhoodOption[];
  defaultNeighborhoodId?: string | null;
}) {
  const router = useRouter();
  const [state, action] = useActionState<ProposalFormState, FormData>(
    createProposalAction,
    undefined,
  );

  const [step, setStep] = useState(0);
  const [problem, setProblem] = useState("");
  const [neighborhoodId, setNeighborhoodId] = useState(defaultNeighborhoodId ?? "");
  const [groups, setGroups] = useState<string[]>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("");
  const [stepError, setStepError] = useState<string | null>(null);

  const headingRef = useRef<HTMLHeadingElement>(null);
  const firstRender = useRef(true);

  useEffect(() => {
    if (state?.ok && state.id) router.push(`/proposte/${state.id}`);
  }, [state, router]);

  // A ogni cambio passo il focus va sul titolo del passo (a11y).
  useEffect(() => {
    if (firstRender.current) {
      firstRender.current = false;
      return;
    }
    headingRef.current?.focus();
  }, [step]);

  function validateStep(s: number): string | null {
    if (s === 0 && problem.trim().length < 12) {
      return "Racconta il problema con qualche parola in più (almeno 12 caratteri).";
    }
    if (s === 3) {
      if (title.trim().length < 6) return "Il titolo è troppo breve (almeno 6 caratteri).";
      if (description.trim().length < 12) return "Spiega la tua proposta (almeno 12 caratteri).";
    }
    return null;
  }

  function goNext() {
    const err = validateStep(step);
    if (err) {
      setStepError(err);
      return;
    }
    setStepError(null);
    setStep((s) => Math.min(s + 1, STEPS.length - 1));
  }

  function goBack() {
    setStepError(null);
    setStep((s) => Math.max(s - 1, 0));
  }

  function toggleGroup(key: string) {
    setGroups((g) => (g.includes(key) ? g.filter((k) => k !== key) : [...g, key]));
  }

  const neighborhoodName =
    neighborhoods.find((n) => n.id === neighborhoodId)?.name ?? "Tutta la città";

  const Icon = STEPS[step].icon;

  return (
    <form
      action={action}
      onKeyDown={(e) => {
        // Invio avanza tra i passi invece di inviare il form a metà.
        if (
          e.key === "Enter" &&
          step < STEPS.length - 1 &&
          !(e.target instanceof HTMLTextAreaElement)
        ) {
          e.preventDefault();
          goNext();
        }
      }}
      className="space-y-4"
    >
      {/* Tutti i campi viaggiano nascosti: visibile è solo il passo corrente. */}
      <input type="hidden" name="problem" value={problem} />
      <input type="hidden" name="neighborhoodId" value={neighborhoodId} />
      <input type="hidden" name="title" value={title} />
      <input type="hidden" name="description" value={description} />
      <input type="hidden" name="category" value={category} />
      {groups.map((g) => (
        <input key={g} type="hidden" name="affectedGroups" value={g} />
      ))}

      {/* Indicatore di avanzamento */}
      <div>
        <p className="text-xs font-medium text-muted-2">
          Passo {step + 1} di {STEPS.length}
        </p>
        <div className="mt-1.5 flex gap-1.5" aria-hidden>
          {STEPS.map((s, i) => (
            <span
              key={s.title}
              className={cn(
                "h-1.5 flex-1 rounded-pill transition-colors",
                i <= step ? "gradient-teal-viola" : "bg-surface-3",
              )}
            />
          ))}
        </div>
        <h3
          ref={headingRef}
          tabIndex={-1}
          className="mt-3 flex items-center gap-2 text-base font-semibold outline-none"
        >
          <Icon size={18} className="text-teal" aria-hidden />
          {STEPS[step].title}
        </h3>
      </div>

      {state?.error ? <Alert>{state.error}</Alert> : null}
      {stepError ? <Alert>{stepError}</Alert> : null}

      {step === 0 ? (
        <Field label="Qual è il problema che vuoi risolvere?" htmlFor="wiz-problem">
          <textarea
            id="wiz-problem"
            rows={3}
            maxLength={800}
            value={problem}
            onChange={(e) => setProblem(e.target.value)}
            placeholder="Es. In Piazza X d'estate non c'è acqua potabile e le panchine sono al sole…"
            className={textareaClass}
          />
        </Field>
      ) : null}

      {step === 1 ? (
        <Field label="Dove si trova?" htmlFor="wiz-neighborhood">
          <select
            id="wiz-neighborhood"
            value={neighborhoodId}
            onChange={(e) => setNeighborhoodId(e.target.value)}
            className={selectClass}
          >
            <option value="">Tutta la città</option>
            {neighborhoods.map((n) => (
              <option key={n.id} value={n.id}>
                {n.name}
              </option>
            ))}
          </select>
        </Field>
      ) : null}

      {step === 2 ? (
        <fieldset>
          <legend className="text-sm font-medium">
            A chi porta beneficio? <span className="font-normal text-muted-2">(facoltativo)</span>
          </legend>
          <p className="mt-1 text-xs text-muted-2">
            Descrive l&apos;intervento, non le persone: aiuta il Comune a capire chi è interessato.
          </p>
          <div className="mt-3 flex flex-wrap gap-2">
            {Object.entries(AFFECTED_GROUPS).map(([key, g]) => {
              const selected = groups.includes(key);
              return (
                <button
                  key={key}
                  type="button"
                  aria-pressed={selected}
                  onClick={() => toggleGroup(key)}
                  className={cn(
                    "flex items-center gap-1.5 rounded-pill border px-3.5 py-2 text-sm font-medium transition-colors",
                    selected
                      ? "border-transparent bg-teal-soft text-teal"
                      : "border-border-strong bg-surface text-muted hover:text-foreground",
                  )}
                >
                  <span aria-hidden>{g.emoji}</span>
                  {g.label}
                </button>
              );
            })}
          </div>
        </fieldset>
      ) : null}

      {step === 3 ? (
        <div className="space-y-3.5">
          <Field label="Titolo della proposta" htmlFor="wiz-title">
            <Input
              id="wiz-title"
              maxLength={140}
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Es. Una fontanella in Piazza…"
            />
          </Field>
          <Field label="La tua proposta concreta" htmlFor="wiz-description">
            <textarea
              id="wiz-description"
              rows={3}
              maxLength={1200}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Cosa proponi di fare, in pratica?"
              className={textareaClass}
            />
          </Field>
          <Field label="Ambito" htmlFor="wiz-category">
            <select
              id="wiz-category"
              value={category}
              onChange={(e) => setCategory(e.target.value)}
              className={selectClass}
            >
              <option value="">Generale</option>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </Field>
        </div>
      ) : null}

      {step === 4 ? (
        <dl className="space-y-2.5 rounded-[var(--radius-sm)] border border-border bg-surface-2/40 p-4 text-sm">
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-muted-2">Problema</dt>
            <dd className="mt-0.5">{problem.trim()}</dd>
          </div>
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-muted-2">Dove</dt>
            <dd className="mt-0.5">{neighborhoodName}</dd>
          </div>
          {groups.length > 0 ? (
            <div>
              <dt className="text-xs font-semibold uppercase tracking-wide text-muted-2">
                Chi ne beneficia
              </dt>
              <dd className="mt-0.5">
                {groups.map((g) => AFFECTED_GROUPS[g]?.label).filter(Boolean).join(", ")}
              </dd>
            </div>
          ) : null}
          <div>
            <dt className="text-xs font-semibold uppercase tracking-wide text-muted-2">Proposta</dt>
            <dd className="mt-0.5 font-semibold">{title.trim()}</dd>
            <dd className="mt-1 text-foreground/85">{description.trim()}</dd>
            {category ? <dd className="mt-1 text-xs text-muted">Ambito: {category}</dd> : null}
          </div>
        </dl>
      ) : null}

      <div className="flex items-center justify-between gap-3 pt-1">
        {step > 0 ? (
          <Button type="button" variant="ghost" size="sm" onClick={goBack}>
            <ArrowLeft size={15} />
            Indietro
          </Button>
        ) : (
          <span className="text-xs text-muted-2">
            Ti facciamo qualche domanda: 2 minuti.
          </span>
        )}

        {step < STEPS.length - 1 ? (
          <Button type="button" size="sm" onClick={goNext}>
            Avanti
            <ArrowRight size={15} />
          </Button>
        ) : (
          <SubmitButton size="sm" pendingText="Invio…">
            <Lightbulb size={16} />
            Pubblica proposta
          </SubmitButton>
        )}
      </div>
    </form>
  );
}
