import type { Metadata } from "next";

export const metadata: Metadata = { title: "Informativa privacy" };

export default function PrivacyPage() {
  return (
    <>
      <h1 className="text-2xl font-bold tracking-tight">Informativa sulla privacy</h1>
      {/*
        Un'informativa senza data non si può leggere: chi la consulta non sa se
        vale ancora, e chi contesta un trattamento non sa quale testo fosse in
        vigore quel giorno. La data è quella dell'ultima modifica reale del
        documento, non quella dell'ultima volta che qualcuno ha toccato il file.
      */}
      <p className="!mt-1 !text-xs !text-muted-2">
        In vigore dal 10 giugno 2026
      </p>
      <p className="!text-muted-2">
        Pistoia.app è un <strong>progetto dimostrativo</strong> e non è un servizio ufficiale del
        Comune di Pistoia. Questa informativa descrive come la piattaforma tratterebbe i dati
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

      <h2>Valutazioni dei servizi</h2>
      <p>
        Per valutare un servizio non serve un account: chiediamo soltanto un indirizzo email.
        Il voto entra subito nel conteggio; l&apos;email serve a confermarlo o a rimuoverlo
        («non sono stato io») e non compare mai in pagina.
      </p>
      <ul>
        <li>
          <strong>Email:</strong> conservata finché la valutazione resta pubblicata, poi
          cancellata con lei. Chi rimuove il proprio voto cancella anche l&apos;indirizzo.
        </li>
        <li>
          <strong>Indirizzo IP:</strong> raccolto solo per riconoscere gli abusi e cancellato
          automaticamente dopo <strong>180 giorni</strong>.
        </li>
        <li>
          <strong>Telefono:</strong> non viene richiesto né raccolto.
        </li>
        <li>
          <strong>Promemoria mensile:</strong> solo se lo chiedi tu, dopo un voto,
          riceviamo l&apos;incarico di scriverti <strong>una volta al mese</strong> quando
          il voto sulle condizioni si rinnova. Ogni messaggio contiene il link «non
          inviarmelo più»: la disattivazione è immediata e cancella l&apos;indirizzo
          dall&apos;elenco dei promemoria.
        </li>
        <li>
          <strong>Inviti in piattaforma:</strong> per chi ha un account, registriamo
          quando ti abbiamo chiesto una valutazione (data e canale), per una sola
          ragione: non chiedertela più di una volta al mese, da nessun canale.
        </li>
      </ul>
      <p>
        In questa demo l&apos;invio delle email è simulato: nessun messaggio lascia il computer
        su cui gira la piattaforma. Quando l&apos;invio diventerà reale, il fornitore che
        recapita le email sarà indicato qui come responsabile del trattamento.
      </p>

      <h2>Conservazione</h2>
      <p>
        I dati sono conservati finché l&apos;account è attivo. Puoi cancellare l&apos;account in
        qualunque momento: i contenuti pubblici già inviati restano visibili in forma anonima.
        Per le valutazioni dei servizi valgono le durate della sezione precedente.
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
