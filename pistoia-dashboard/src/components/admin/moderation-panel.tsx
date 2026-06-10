"use client";

import { useState, useTransition } from "react";
import { EyeOff, Ban, Clock, X, Plus, ShieldX, Merge } from "lucide-react";
import {
  hideCommentAction,
  dismissCommentReportsAction,
  suspendUserAction,
  banUserAction,
  liftUserSanctionAction,
  addBlockedWordAction,
  removeBlockedWordAction,
  mergeReportsAction,
} from "@/app/actions/moderation";
import { formatDate } from "@/lib/format";

type FlaggedComment = {
  commentId: string;
  postId: string;
  authorId: string | null;
  authorName: string;
  body: string;
  hidden: boolean;
  count: number;
  reasons: string[];
};
type BlockedWord = { id: string; word: string };
type Sanctioned = { id: string; name: string; banned: boolean; suspendedUntil: Date | null };
type ReportOption = { id: string; title: string };

export function ModerationPanel({
  flaggedComments,
  blockedWords,
  sanctioned,
  openReports,
}: {
  flaggedComments: FlaggedComment[];
  blockedWords: BlockedWord[];
  sanctioned: Sanctioned[];
  openReports: ReportOption[];
}) {
  const [pending, startTransition] = useTransition();
  const [flagged, setFlagged] = useState(flaggedComments);
  const [words, setWords] = useState(blockedWords);
  const [people, setPeople] = useState(sanctioned);
  const [newWord, setNewWord] = useState("");
  const [source, setSource] = useState("");
  const [target, setTarget] = useState("");
  const [mergeMsg, setMergeMsg] = useState<string | null>(null);

  function run(fn: () => Promise<unknown>, after?: () => void) {
    startTransition(async () => {
      await fn();
      after?.();
    });
  }

  return (
    <div className="space-y-6">
      {/* Flagged comments */}
      <section>
        <h3 className="text-sm font-semibold">Commenti segnalati</h3>
        {flagged.length === 0 ? (
          <p className="mt-2 text-sm text-muted-2">Nessun commento segnalato. 👌</p>
        ) : (
          <ul className="mt-3 space-y-3">
            {flagged.map((c) => (
              <li
                key={c.commentId}
                className="rounded-[var(--radius-sm)] border border-border bg-surface-2/50 p-3"
              >
                <p className="text-sm">{c.body}</p>
                <p className="mt-1 text-xs text-muted-2">
                  {c.authorName} · {c.count} segnalazion{c.count === 1 ? "e" : "i"}
                  {c.reasons.length ? ` · «${c.reasons[0]}»` : ""}
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {!c.hidden ? (
                    <button
                      type="button"
                      disabled={pending}
                      onClick={() => run(() => hideCommentAction(c.commentId), () =>
                        setFlagged((l) => l.filter((x) => x.commentId !== c.commentId)),
                      )}
                      className="inline-flex items-center gap-1 rounded-pill border border-border px-2.5 py-1 text-xs font-semibold hover:text-[var(--red)] disabled:opacity-60"
                    >
                      <EyeOff size={13} /> Nascondi
                    </button>
                  ) : null}
                  {c.authorId ? (
                    <>
                      <button
                        type="button"
                        disabled={pending}
                        onClick={() => run(() => suspendUserAction(c.authorId!, 7))}
                        className="inline-flex items-center gap-1 rounded-pill border border-border px-2.5 py-1 text-xs font-semibold hover:text-[var(--amber)] disabled:opacity-60"
                      >
                        <Clock size={13} /> Sospendi 7gg
                      </button>
                      <button
                        type="button"
                        disabled={pending}
                        onClick={() => run(() => banUserAction(c.authorId!))}
                        className="inline-flex items-center gap-1 rounded-pill border border-border px-2.5 py-1 text-xs font-semibold hover:text-[var(--red)] disabled:opacity-60"
                      >
                        <Ban size={13} /> Banna
                      </button>
                    </>
                  ) : null}
                  <button
                    type="button"
                    disabled={pending}
                    onClick={() => run(() => dismissCommentReportsAction(c.commentId), () =>
                      setFlagged((l) => l.filter((x) => x.commentId !== c.commentId)),
                    )}
                    className="inline-flex items-center gap-1 rounded-pill px-2.5 py-1 text-xs font-semibold text-muted-2 hover:text-foreground disabled:opacity-60"
                  >
                    <X size={13} /> Ignora
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>

      {/* Merge duplicate reports */}
      <section>
        <h3 className="flex items-center gap-1.5 text-sm font-semibold">
          <Merge size={15} /> Unisci segnalazioni duplicate
        </h3>
        <div className="mt-3 grid gap-2 sm:grid-cols-2">
          <select
            value={source}
            onChange={(e) => setSource(e.target.value)}
            aria-label="Segnalazione duplicata"
            className="h-10 rounded-[var(--radius-sm)] border border-border-strong bg-surface px-3 text-sm"
          >
            <option value="">Duplicata…</option>
            {openReports.map((r) => (
              <option key={r.id} value={r.id}>
                {r.title}
              </option>
            ))}
          </select>
          <select
            value={target}
            onChange={(e) => setTarget(e.target.value)}
            aria-label="Segnalazione principale"
            className="h-10 rounded-[var(--radius-sm)] border border-border-strong bg-surface px-3 text-sm"
          >
            <option value="">Da unire a…</option>
            {openReports.map((r) => (
              <option key={r.id} value={r.id}>
                {r.title}
              </option>
            ))}
          </select>
        </div>
        <div className="mt-2 flex items-center gap-3">
          <button
            type="button"
            disabled={pending || !source || !target}
            onClick={() =>
              run(
                async () => {
                  const res = await mergeReportsAction(source, target);
                  setMergeMsg(res.ok ? "Segnalazioni unite." : res.error ?? "Errore.");
                },
                () => {
                  setSource("");
                  setTarget("");
                },
              )
            }
            className="inline-flex items-center gap-1 rounded-pill gradient-teal-viola px-3.5 py-1.5 text-xs font-semibold text-white disabled:opacity-50"
          >
            <Merge size={13} /> Unisci
          </button>
          {mergeMsg ? <span className="text-xs text-muted-2">{mergeMsg}</span> : null}
        </div>
      </section>

      {/* Blocked words */}
      <section>
        <h3 className="text-sm font-semibold">Parole bloccate</h3>
        <div className="mt-3 flex items-center gap-2">
          <input
            value={newWord}
            onChange={(e) => setNewWord(e.target.value)}
            placeholder="Aggiungi un termine…"
            aria-label="Nuova parola bloccata"
            className="h-10 flex-1 rounded-[var(--radius-sm)] border border-border-strong bg-surface px-3 text-sm"
          />
          <button
            type="button"
            disabled={pending || newWord.trim().length < 2}
            onClick={() =>
              run(
                async () => {
                  const w = newWord.trim().toLowerCase();
                  const res = await addBlockedWordAction(w);
                  if (res.ok && !words.some((x) => x.word === w)) {
                    setWords((l) => [...l, { id: `tmp-${w}`, word: w }].sort((a, b) => a.word.localeCompare(b.word)));
                  }
                },
                () => setNewWord(""),
              )
            }
            className="inline-flex items-center gap-1 rounded-pill border border-border-strong px-3 py-2 text-xs font-semibold disabled:opacity-50"
          >
            <Plus size={13} /> Aggiungi
          </button>
        </div>
        {words.length > 0 ? (
          <ul className="mt-3 flex flex-wrap gap-2">
            {words.map((w) => (
              <li
                key={w.id}
                className="inline-flex items-center gap-1.5 rounded-pill bg-surface-2 px-2.5 py-1 text-xs"
              >
                {w.word}
                {!w.id.startsWith("tmp-") ? (
                  <button
                    type="button"
                    disabled={pending}
                    aria-label={`Rimuovi ${w.word}`}
                    onClick={() => run(() => removeBlockedWordAction(w.id), () =>
                      setWords((l) => l.filter((x) => x.id !== w.id)),
                    )}
                    className="text-muted-2 hover:text-[var(--red)]"
                  >
                    <X size={12} />
                  </button>
                ) : null}
              </li>
            ))}
          </ul>
        ) : (
          <p className="mt-2 text-xs text-muted-2">Nessun termine bloccato.</p>
        )}
      </section>

      {/* Sanctioned users */}
      {people.length > 0 ? (
        <section>
          <h3 className="flex items-center gap-1.5 text-sm font-semibold">
            <ShieldX size={15} /> Account sotto sanzione
          </h3>
          <ul className="mt-3 divide-y divide-border">
            {people.map((u) => (
              <li key={u.id} className="flex items-center justify-between gap-3 py-2 text-sm">
                <span>
                  {u.name}
                  <span className="ml-2 text-xs text-muted-2">
                    {u.banned
                      ? "Bannato"
                      : u.suspendedUntil
                        ? `Sospeso fino al ${formatDate(u.suspendedUntil)}`
                        : ""}
                  </span>
                </span>
                <button
                  type="button"
                  disabled={pending}
                  onClick={() => run(() => liftUserSanctionAction(u.id), () =>
                    setPeople((l) => l.filter((x) => x.id !== u.id)),
                  )}
                  className="rounded-pill border border-border px-2.5 py-1 text-xs font-semibold hover:text-teal disabled:opacity-60"
                >
                  Revoca
                </button>
              </li>
            ))}
          </ul>
        </section>
      ) : null}
    </div>
  );
}
