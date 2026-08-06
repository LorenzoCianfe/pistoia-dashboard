import { cn } from "@/lib/utils";
import { accent, initialsOf } from "@/lib/colors";

const sizeMap = {
  sm: "size-8 text-xs",
  md: "size-10 text-sm",
  lg: "size-12 text-base",
  xl: "size-16 text-xl",
};

export function Avatar({
  name,
  initials,
  color = "teal",
  size = "md",
  className,
}: {
  name?: string;
  initials?: string;
  color?: string;
  size?: keyof typeof sizeMap;
  className?: string;
}) {
  /*
    `ink` e non `fg`, dal 2026-08-06.

    L'avatar è **testo sopra il proprio `-soft`**, che è esattamente il caso per
    cui `lib/colors.ts` ha un terzo token: il rosso dello stemma su `--red-soft`
    fa **3,72:1**, sotto AA. La C-2 aveva creato `--red-ink` per questo e
    l'aveva applicato a `Badge` e al banner degli avvisi — qui era sfuggito.

    È sfuggito per una ragione precisa, e vale la pena scriverla: il colore
    dell'avatar deriva dal NOME, e nessuna delle pagine misurate dal cancello
    cadeva sul rosso. Ci è cascato il super-account del Comune, che è entrato
    fra le pagine misurate solo quando `/admin/*` è entrata nel cancello
    (Lavoro D §4) — **al primo giro**. Un difetto che dipende dai dati si vede
    solo se fra i dati misurati c'è il caso che lo innesca.
  */
  const { ink, soft } = accent(color);
  const text = initials ?? (name ? initialsOf(name) : "?");
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full font-bold",
        sizeMap[size],
        className,
      )}
      style={{ backgroundColor: soft, color: ink }}
      aria-hidden="true"
    >
      {text}
    </span>
  );
}
