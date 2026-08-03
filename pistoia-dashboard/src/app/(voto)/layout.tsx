/*
  Il gruppo delle pagine che arrivano DA FUORI: il QR inquadrato per strada e
  il link nella mail di conferma. Due proprietà, entrambe di sostanza:

  - **Pubbliche.** Chi vota non ha un account (decisione del 2026-08-03), e chi
    clicca dalla posta nemmeno una sessione: il gruppo `(app)` impone
    `requireUser()` nel layout, quindi queste rotte vivono qui fuori.
  - **Una schermata, niente navigazione** (piano R-3). Nessuna barra, nessun
    menu: solo il compito. L'unico link è l'informativa privacy, dentro il
    modulo, perché lì è un obbligo e non una rotta di fuga.
*/
export default function VotoLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-dvh px-4 py-10 sm:py-14">
      <main className="mx-auto w-full max-w-md">{children}</main>
    </div>
  );
}
