"use client";

import { useEffect, useId, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { useRouter } from "next/navigation";
import {
  Search,
  Megaphone,
  Lightbulb,
  HardHat,
  CalendarDays,
  Vote,
  MapPinned,
  FileQuestion,
  type LucideIcon,
} from "lucide-react";
import { NAV_ITEMS, SECONDARY_NAV, GUIDED_ACTIONS } from "./nav-items";
import { SEARCH_GROUP_LABEL, type SearchResult, type SearchResultType } from "@/lib/search-types";
import { accent, type AccentColor } from "@/lib/colors";
import { cn } from "@/lib/utils";

// Palette di ricerca globale (Cmd/Ctrl+K). Pattern combobox + listbox:
// il focus resta sull'input, le frecce muovono l'opzione attiva
// (aria-activedescendant), Invio apre, Esc chiude.

type Item = {
  key: string;
  title: string;
  subtitle?: string | null;
  href: string;
  group: string;
  icon: LucideIcon;
  color: AccentColor;
};

const TYPE_META: Record<SearchResultType, { icon: LucideIcon; color: AccentColor }> = {
  report: { icon: Megaphone, color: "amber" },
  proposal: { icon: Lightbulb, color: "green" },
  opera: { icon: HardHat, color: "teal" },
  event: { icon: CalendarDays, color: "viola" },
  poll: { icon: Vote, color: "viola" },
  neighborhood: { icon: MapPinned, color: "teal" },
};

const PAGES: Item[] = [...NAV_ITEMS, ...SECONDARY_NAV].map((n) => ({
  key: `page:${n.href}`,
  title: n.label,
  href: n.href,
  group: "Pagine",
  icon: n.icon,
  color: "teal",
}));

const ACTIONS: Item[] = GUIDED_ACTIONS.map((a) => ({
  key: `action:${a.href}`,
  title: a.title,
  subtitle: a.description,
  href: a.href,
  group: "Azioni rapide",
  icon: a.icon,
  color: a.color,
}));

/** Confronto senza accenti né maiuscole: "mobilita" trova "Mobilità". */
function norm(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/\p{Diacritic}/gu, "");
}

export function CommandPalette() {
  const router = useRouter();
  const listboxId = useId();
  const inputRef = useRef<HTMLInputElement>(null);
  const restoreFocusRef = useRef<HTMLElement | null>(null);

  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [failed, setFailed] = useState(false);
  const [active, setActive] = useState(0);

  const q = query.trim();

  // Il reset di risultati/stato avviene nell'onChange (event handler): qui
  // l'effect si limita a sincronizzare con il sistema esterno (fetch+debounce).
  useEffect(() => {
    if (!open || q.length < 2) return;
    const ctrl = new AbortController();
    const t = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(q)}`, {
          signal: ctrl.signal,
        });
        if (!res.ok) throw new Error(`search ${res.status}`);
        const data = (await res.json()) as { results: SearchResult[] };
        setResults(data.results);
        setFailed(false);
        setLoading(false);
      } catch {
        if (!ctrl.signal.aborted) {
          setResults([]);
          setFailed(true);
          setLoading(false);
        }
      }
    }, 220);
    return () => {
      ctrl.abort();
      clearTimeout(t);
    };
  }, [q, open]);

  function onQueryChange(value: string) {
    setQuery(value);
    setActive(0);
    if (value.trim().length < 2) {
      setResults([]);
      setFailed(false);
      setLoading(false);
    } else {
      setLoading(true);
    }
  }

  // Lista piatta nell'ordine visivo: azioni e pagine che combaciano, poi i
  // contenuti, raggruppati per tipo.
  const items = useMemo<Item[]>(() => {
    if (q.length === 0) return ACTIONS;
    const nq = norm(q);
    const staticMatches = [...ACTIONS, ...PAGES].filter((i) =>
      norm(i.title).includes(nq),
    );
    const dynamic = results.map<Item>((r) => ({
      key: `${r.type}:${r.id}`,
      title: r.title,
      subtitle: r.subtitle,
      href: r.href,
      group: SEARCH_GROUP_LABEL[r.type],
      icon: TYPE_META[r.type].icon,
      color: TYPE_META[r.type].color,
    }));
    return [...staticMatches, ...dynamic];
  }, [q, results]);

  // L'indice attivo viene clampato in render: se la lista si accorcia mentre
  // arrivano i risultati non serve un effect per riportarlo in range.
  const safeActive = items.length > 0 ? Math.min(active, items.length - 1) : 0;

  // Scorciatoia globale Ctrl/Cmd+K.
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Apertura: blocco dello scroll, focus sull'input, reset dello stato.
  // Chiusura: il focus torna dov'era.
  useEffect(() => {
    if (!open) return;
    restoreFocusRef.current = document.activeElement as HTMLElement | null;
    const prevOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    inputRef.current?.focus();
    return () => {
      document.body.style.overflow = prevOverflow;
      restoreFocusRef.current?.focus();
    };
  }, [open]);

  // L'opzione attiva resta visibile durante la navigazione con le frecce.
  useEffect(() => {
    if (!open) return;
    document
      .getElementById(`${listboxId}-opt-${safeActive}`)
      ?.scrollIntoView({ block: "nearest" });
  }, [safeActive, open, listboxId]);

  function close() {
    setOpen(false);
    setQuery("");
    setResults([]);
    setFailed(false);
  }

  function go(href: string) {
    close();
    router.push(href);
  }

  function onInputKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive(Math.min(safeActive + 1, Math.max(items.length - 1, 0)));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive(Math.max(safeActive - 1, 0));
    } else if (e.key === "Enter") {
      e.preventDefault();
      const item = items[safeActive];
      if (item) go(item.href);
    } else if (e.key === "Escape") {
      e.preventDefault();
      close();
    } else if (e.key === "Tab") {
      // Il focus resta sull'input: la lista si naviga con le frecce.
      e.preventDefault();
    }
  }

  const activeId = items[safeActive] ? `${listboxId}-opt-${safeActive}` : undefined;
  const showEmpty = q.length >= 2 && !loading && !failed && items.length === 0;

  // Raggruppa preservando l'ordine piatto (gli indici guidano la tastiera).
  const grouped = useMemo(() => {
    const out: { group: string; entries: { item: Item; index: number }[] }[] = [];
    items.forEach((item, index) => {
      const last = out[out.length - 1];
      if (last && last.group === item.group) {
        last.entries.push({ item, index });
      } else {
        out.push({ group: item.group, entries: [{ item, index }] });
      }
    });
    return out;
  }, [items]);

  const dialog = (
    <div
      className="fixed inset-0 z-50 bg-[#0b0e14]/45 p-4 backdrop-blur-[2px] sm:p-6"
      onClick={close}
      role="presentation"
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Cerca nella piattaforma"
        onClick={(e) => e.stopPropagation()}
        className="card mx-auto mt-[8dvh] flex max-h-[70dvh] w-full max-w-xl flex-col overflow-hidden !rounded-[var(--radius)] sm:mt-[12dvh]"
      >
        <div className="flex items-center gap-3 border-b border-border px-4">
          <Search size={18} className="shrink-0 text-muted-2" aria-hidden />
          <input
            ref={inputRef}
            role="combobox"
            aria-expanded="true"
            aria-controls={listboxId}
            aria-activedescendant={activeId}
            aria-autocomplete="list"
            aria-label="Cerca segnalazioni, proposte, opere, eventi, quartieri"
            value={query}
            onChange={(e) => onQueryChange(e.target.value)}
            onKeyDown={onInputKeyDown}
            placeholder="Cerca o scegli un'azione…"
            className="h-14 w-full bg-transparent text-[15px] text-foreground placeholder:text-muted-2 focus:outline-none"
            autoComplete="off"
            spellCheck={false}
          />
          <kbd className="hidden shrink-0 rounded-md border border-border bg-surface-2 px-1.5 py-0.5 text-[10px] font-semibold text-muted-2 sm:inline-block">
            esc
          </kbd>
        </div>

        <div id={listboxId} role="listbox" aria-label="Risultati" className="overflow-y-auto p-2">
          {q.length > 0 && q.length < 2 ? (
            <p className="px-3 py-6 text-center text-sm text-muted">
              Continua a digitare per cercare…
            </p>
          ) : null}

          {failed ? (
            <p className="px-3 py-6 text-center text-sm text-muted" role="alert">
              La ricerca non risponde. Controlla la connessione e riprova.
            </p>
          ) : null}

          {showEmpty ? (
            <div className="px-3 py-8 text-center">
              <FileQuestion size={22} className="mx-auto text-muted-2" aria-hidden />
              <p className="mt-2 text-sm font-medium">Nessun risultato per «{q}»</p>
              <p className="mt-1 text-xs text-muted">
                Prova con una parola diversa: via, quartiere, tema…
              </p>
            </div>
          ) : null}

          {grouped.map(({ group, entries }) => (
            <div key={group} role="group" aria-label={group}>
              <p
                role="presentation"
                className="px-3 pb-1 pt-3 text-[10.5px] font-semibold uppercase tracking-[0.14em] text-muted-2"
              >
                {group}
              </p>
              {entries.map(({ item, index }) => {
                const tokens = accent(item.color);
                const isActive = index === safeActive;
                const Icon = item.icon;
                return (
                  <div
                    key={item.key}
                    id={`${listboxId}-opt-${index}`}
                    role="option"
                    aria-selected={isActive}
                    tabIndex={-1}
                    onMouseMove={() => setActive(index)}
                    onClick={() => go(item.href)}
                    className={cn(
                      "flex cursor-pointer items-center gap-3 rounded-[var(--radius-sm)] px-3 py-2.5 transition-colors",
                      isActive ? "bg-surface-2" : "hover:bg-surface-2/60",
                    )}
                  >
                    <span
                      className="grid size-8 shrink-0 place-items-center rounded-full"
                      style={{ backgroundColor: tokens.soft, color: tokens.fg }}
                      aria-hidden
                    >
                      <Icon size={15} />
                    </span>
                    <span className="min-w-0 flex-1">
                      <span className="block truncate text-sm font-medium">{item.title}</span>
                      {item.subtitle ? (
                        <span className="block truncate text-xs text-muted-2">
                          {item.subtitle}
                        </span>
                      ) : null}
                    </span>
                  </div>
                );
              })}
            </div>
          ))}
        </div>

        <p className="sr-only" role="status">
          {loading
            ? "Ricerca in corso…"
            : q.length >= 2
              ? `${items.length} risultati disponibili`
              : ""}
        </p>

        <div className="flex items-center gap-4 border-t border-border px-4 py-2.5 text-[11px] text-muted-2">
          <span>
            <kbd className="font-sans font-semibold">↑↓</kbd> naviga
          </span>
          <span>
            <kbd className="font-sans font-semibold">↵</kbd> apri
          </span>
          <span>
            <kbd className="font-sans font-semibold">esc</kbd> chiudi
          </span>
          {loading ? <span className="ml-auto animate-pulse">Cerco…</span> : null}
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Trigger desktop: pill di ricerca ben visibile */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="hidden h-9 w-44 items-center gap-2.5 rounded-pill border border-border bg-surface-2/70 px-3.5 text-sm text-muted-2 transition-colors hover:border-border-strong hover:text-muted sm:flex lg:w-64"
      >
        <Search size={15} aria-hidden />
        <span className="flex-1 truncate text-left">Cerca nella città…</span>
        <kbd className="rounded-md border border-border bg-surface px-1.5 py-0.5 text-[10px] font-semibold">
          Ctrl K
        </kbd>
      </button>
      {/* Trigger mobile: icona compatta */}
      <button
        type="button"
        onClick={() => setOpen(true)}
        aria-label="Cerca nella piattaforma"
        className="grid size-9 place-items-center rounded-full border border-border bg-surface text-muted transition-colors hover:bg-surface-2 hover:text-foreground sm:hidden"
      >
        <Search size={18} aria-hidden />
      </button>
      {open ? createPortal(dialog, document.body) : null}
    </>
  );
}
