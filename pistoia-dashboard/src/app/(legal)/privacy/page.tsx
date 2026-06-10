import type { Metadata } from "next";

export const metadata: Metadata = { title: "Informativa privacy" };

export default function PrivacyPage() {
  return (
    <>
      <h1 className="text-2xl font-bold tracking-tight">Informativa sulla privacy</h1>
      <p className="!text-muted-2">
        Dashboard di Pistoia è un <strong>progetto dimostrativo</strong> e non è un servizio ufficiale
        del Comune di Pistoia. Questa informativa descrive come la piattaforma tratterebbe i dati
        personali in un contesto reale.
      </p>

      <h2>Dati che raccogliamo</h2>
      <ul>
        <li>Dati dell&apos;account: nome, email e password (salvata solo come hash Argon2id, mai in chiaro).</li>
        <li>Profilo: nome pubblico abbreviato, quartiere, eventuale stato di verifica.</li>
        <li>Contenuti che pubblichi: segnalazioni, proposte, post, commenti e relative foto.</li>
        <li>Posizione precisa: solo se fornisci esplicito consenso quando crei una segnalazione.</li>
      </ul>

      <h2>Finalità e base giuridica</h2>
      <p>
        I dati servono unicamente a erogare i servizi civici della piattaforma (segnalazioni,
        proposte, consultazioni, notifiche). La base giuridica è il consenso e l&apos;esecuzione del
        servizio che richiedi.
      </p>

      <h2>Conservazione</h2>
      <p>
        I dati sono conservati finché l&apos;account è attivo. Puoi cancellare l&apos;account in
        qualunque momento: i contenuti pubblici già inviati restano visibili in forma anonima.
      </p>

      <h2>I tuoi diritti</h2>
      <p>
        Hai diritto ad accedere, rettificare, esportare e cancellare i tuoi dati. Puoi esercitare
        questi diritti direttamente da <strong>Impostazioni → Privacy e dati</strong>: lì trovi
        l&apos;esportazione in formato JSON e la cancellazione dell&apos;account.
      </p>

      <h2>Sicurezza</h2>
      <p>
        Le password sono protette con Argon2id; le sessioni usano un cookie opaco HttpOnly e nel
        database è salvato solo l&apos;HMAC del token. Un eventuale accesso al database non consente di
        forgiare una sessione valida.
      </p>
    </>
  );
}
