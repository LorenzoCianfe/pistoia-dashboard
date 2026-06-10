import type { Metadata } from "next";

export const metadata: Metadata = { title: "Regole della community" };

export default function NoteComunitaPage() {
  return (
    <>
      <h1 className="text-2xl font-bold tracking-tight">Regole della community</h1>
      <p className="!text-muted-2">
        Questo è uno spazio civico: deve restare utile, leggibile e rispettoso. Partecipando accetti
        queste regole di comportamento.
      </p>

      <h2>Cosa ci aspettiamo</h2>
      <ul>
        <li>Rispetto verso gli altri cittadini, gli operatori del Comune e i moderatori.</li>
        <li>Contenuti pertinenti, veritieri e relativi alla vita della città.</li>
        <li>Segnalazioni accurate: descrivi il problema in modo chiaro, senza esagerazioni.</li>
        <li>Tutela della privacy altrui: non pubblicare dati personali di altre persone.</li>
      </ul>

      <h2>Cosa non è consentito</h2>
      <ul>
        <li>Insulti, molestie, incitamento all&apos;odio o discriminazioni.</li>
        <li>Spam, pubblicità non richiesta, contenuti ripetuti o fuori tema.</li>
        <li>Linguaggio volgare: alcuni termini sono filtrati automaticamente.</li>
        <li>Segnalazioni o proposte palesemente false o provocatorie.</li>
      </ul>

      <h2>Moderazione</h2>
      <p>
        Puoi segnalare un commento inappropriato con il pulsante <strong>Segnala</strong>. I
        moderatori possono nascondere contenuti, sospendere temporaneamente o bloccare gli account
        che violano le regole. Ogni intervento è registrato in un log di audit, con la relativa
        motivazione.
      </p>

      <h2>Aspettative verso il Comune</h2>
      <p>
        Una proposta o una segnalazione non equivale a un intervento approvato: gli stati pubblici
        (ricevuta, in lavorazione, risolta, in valutazione…) indicano onestamente a che punto è la
        richiesta.
      </p>
    </>
  );
}
