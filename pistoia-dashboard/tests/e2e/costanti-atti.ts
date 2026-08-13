/*
  Le costanti degli atti di prova, in un modulo SENZA effetti collaterali.

  Le usano `semina-atti.ts`, che scrive nel database, e `prima-pagina.spec.ts`,
  che le cerca in pagina. Stanno separate dallo script di semina perché quello
  **si esegue da sé** quando viene importato: uno spec che ne prendesse una
  costante rieseguirebbe la semina dentro il processo di Playwright, dove
  `DATABASE_URL` non è impostata — quindi contro `dev.db`, il database della
  dimostrazione.

  E sono in un posto solo perché due copie dello stesso titolo divergono al
  primo ritocco, e il test fallirebbe dicendo «il titolo non c'è» su una pagina
  che lo mostra (`AGENTS.md` §3, ondata 7, nota finale).
*/

export const TITOLO_CURATO =
  "La scuola «Raffaello» avrà un involucro nuovo, per consumare meno";

export const SOMMARIO_CURATO =
  "Con questo atto parte la progettazione esecutiva; paga il programma europeo FESR della Toscana.";

/**
 * L'oggetto ufficiale dell'atto curato, per intero.
 *
 * Serve doppio: lo scrive la semina, e lo spec ne cerca un frammento in pagina
 * per provare che il **doppio titolo onesto** regge — titolo umano sopra,
 * oggetto ufficiale sotto, mai riscritto (`direzione-prodotto.md` §1.12.1).
 */
export const OGGETTO_CURATO =
  "CUP C54D24001030006. \"INTERVENTO DI EFFICIENTAMENTO DELL'INVOLUCRO EDILIZIO AI FINI DEL MIGLIORAMENTO ENERGETICO DELL'ISTITUTO COMPRENSIVO STATALE «RAFFAELLO» VIA PIETRO CALAMANDREI\" - APPROVAZIONE DEL PROGETTO DI FATTIBILITÀ TECNICA ED ECONOMICA E AFFIDAMENTO DELLA PROGETTAZIONE ESECUTIVA.";

/** Un frammento cercabile dell'oggetto: la parte che nessun titolo umano avrebbe. */
export const OGGETTO_CURATO_FRAMMENTO = "EFFICIENTAMENTO DELL'INVOLUCRO EDILIZIO";

/**
 * L'oggetto di un atto **corto**, per provare il rifiuto del titolo ricopiato.
 *
 * Serve corto per una ragione precisa: il campo del titolo ha `maxLength` a
 * 120, quindi con l'oggetto lungo qui sopra un copia-incolla verrebbe TAGLIATO
 * dal browser e il testo incollato non sarebbe più identico all'oggetto —
 * il test proverebbe il limite di lunghezza credendo di provare la copiatura,
 * e passerebbe per la ragione sbagliata.
 */
export const OGGETTO_CORTO = "NOMINA DEL RESPONSABILE UNICO DEL PROGETTO.";

/** Gli atti seminati nel giorno più recente e in quello di tre giorni prima. */
export const ATTI_DEL_GIORNO = 8;
export const ATTI_TOTALI = 13;
