# Design — Dashboard di Pistoia

> Direzione estetica e linguaggio visivo della piattaforma. Questo documento è la fonte di verità per ogni decisione di design: se una scelta visiva non è coerente con quanto scritto qui, o si corregge la scelta o si aggiorna (consapevolmente) questo documento.
> **Ultimo aggiornamento:** 2026-06-11 · I token implementati vivono in `pistoia-dashboard/src/app/globals.css`.

---

## 1. Carattere: civica, toscana, contemporanea

La Dashboard di Pistoia rappresenta un'istituzione. Il suo design deve trasmettere tre cose, in quest'ordine:

1. **Affidabilità** — è il Comune che parla: ordine, gerarchia chiara, niente effetti gratuiti.
2. **Vicinanza** — è al servizio dei cittadini, non sopra di loro: toni caldi, linguaggio umano, forme morbide.
3. **Cura** — una piattaforma curata comunica che la città è curata: ogni dettaglio (stati vuoti, caricamenti, errori) è disegnato, mai lasciato al caso.

**In una frase:** *l'eleganza sobria di un palazzo comunale toscano, con la leggibilità di un prodotto digitale moderno.*

Non è: un social network, una startup SaaS, un sito vetrina turistico, un template Tailwind. Quando un pattern sembra "già visto su dieci dashboard", è il segnale per ridisegnarlo.

---

## 2. I tre motivi identitari

Il design attinge a tre simboli reali di Pistoia. Sono il vocabolario decorativo della piattaforma: ogni ornamento deve derivare da uno di questi, mai da pattern generici.

| Motivo | Origine | Uso nella UI |
|---|---|---|
| **La scacchiera** | Lo stemma comunale, bianco e rosso scaccato | Momenti di brand: crest, favicon, dettagli del tour demo, bordo decorativo della Civic ID Card. Il rosso `--red` è *il* rosso dello stemma: riservato a brand e stati di errore/urgenza, mai decorativo casuale |
| **Le fasce romaniche** | Il marmo a fasce alternate di San Giovanni Fuorcivitas e del Duomo | Ritmo orizzontale: separatori di sezione, pattern sottili negli hero e negli empty state, righe alternate delle tabelle. Sempre a contrasto tenue (mai zebra dura) |
| **La città verde** | Pistoia capitale europea dei vivai | Il verde-acqua `--teal` è il colore "vivo" della piattaforma: azioni primarie, progressi, dati che crescono. Il viola `--viola` è il suo complemento istituzionale per la partecipazione |

---

## 3. Tipografia

| Ruolo | Font | Uso |
|---|---|---|
| **Display / titoli** | **Fraunces** (variabile, serif) | H1–H2, numeri grandi delle statistiche, momenti editoriali ("Storie della città"). Dà il carattere istituzionale-umanistico: un serif toscano contemporaneo, mai freddo |
| **Interfaccia / testo** | **Plus Jakarta Sans** | Tutto il resto: body, label, navigazione, form. Già in uso, resta la voce funzionale |
| **Dati tabellari** | Plus Jakarta Sans con `font-variant-numeric: tabular-nums` | Tabelle, importi, confronti: le cifre si allineano sempre |

Regole:
- Fraunces **solo** dove c'è gerarchia da affermare (titolo di pagina, numero protagonista). Mai nei paragrafi, mai sotto i 20px.
- Scala tipografica modulare definita nei token (`--text-*`); niente font-size arbitrari nelle pagine.
- I numeri importanti si presentano grandi e in Fraunces: il dato è il protagonista della piattaforma.
- Lingua: italiano, registro del "tu" civico — diretto ma mai confidenziale ("Segnala un problema", non "Dicci cosa non va!").

---

## 4. Colore

La palette esistente è confermata e formalizzata. Il fondo è quasi-bianco con bagliori d'angolo teal/viola; le superfici sono bianche, morbide, leggermente smerigliate.

### Semantica (non negoziabile)

| Token | Significato | Esempi |
|---|---|---|
| `--teal` | **Azione e vita**: il colore primario | CTA, link attivi, progressi, conferme |
| `--viola` | **Partecipazione e comunità** | Proposte, sondaggi, badge civici |
| `--amber` | **Attenzione e attesa** | Stati "in valutazione", avvisi non critici, badge demo |
| `--red` | **Brand e urgenza** (il rosso dello stemma) | Crest, errori, segnalazioni urgenti. Mai come decorazione |
| `--green` | **Risolto / completato** | Esiti positivi, segnalazioni chiuse |

Regole:
- Un colore dominante per schermata: le pagine hanno una tinta d'accento prevalente in base alla sezione (es. proposte → viola), non un arcobaleno.
- I colori `-soft` sono gli unici ammessi come sfondi di badge/chip; il colore pieno va su testo/icone/bordi.
- Contrasto WCAG AA minimo ovunque, AAA per il testo body. Già verificato: non si regredisce.
- Gradiente teal→viola: riservato a **un** momento per pagina al massimo (hero, numero chiave). È la firma, non la tappezzeria.

---

## 5. Spazio, forma, elevazione

- **Raggio**: la piattaforma è morbida. `--radius-sm` (0.85rem) per input e chip, `--radius` (1.5rem) per le card, `--radius-lg` (2rem) per hero e modali, pill per bottoni e badge. Mai spigoli vivi, mai mix di raggi nella stessa gerarchia.
- **Elevazione**: due sole ombre — quella di riposo (sottile, diffusa) e quella di hover (più alta, sempre con `translateY(-2px)`). Niente ombre dure, niente glow colorati salvo focus.
- **Densità**: aria generosa di default; la densità aumenta solo nelle viste dati (tabelle bilancio, admin). La modalità semplice scala tutto al 115%: ogni layout deve sopravvivere a quel test.
- **Bordi**: 1px `--border`; il bordo forte solo su hover/focus. Le fasce romaniche (sezione 2) sono il modo decorativo di separare, in alternativa alle linee.

---

## 6. Motion

Il movimento comunica che la città è viva — ma è un'istituzione che si muove: sobria, mai giocosa.

| Principio | Regola |
|---|---|
| **Durate** | 150ms micro (hover, toggle) · 250ms standard (card, fade) · 400ms scena (page load, modali). Mai oltre 500ms |
| **Easing** | `cubic-bezier(0.22, 1, 0.36, 1)` (ease-out-quint) per ingressi; ease semplice per i colori. Mai bounce, mai elastic |
| **Ingresso pagina** | Una sola orchestrazione: titolo → contenuto principale → dettagli, stagger 40–60ms. Il resto appare e basta |
| **Transizioni di rotta** | View Transitions: cross-fade rapido + continuità degli elementi condivisi dove naturale |
| **Micro-interazioni** | Riservate alle azioni civiche che meritano festa misurata: invio segnalazione, conferma risoluzione, firma proposta |
| **Dati** | I numeri contano da 0 (AnimatedNumber esistente), i grafici si disegnano una volta sola all'ingresso |
| **Reduced motion** | `prefers-reduced-motion` annulla tutto (già attivo). Non negoziabile |

---

## 7. Iconografia, illustrazione, empty state

- **Icone**: Lucide, peso 1.5–2, sempre con etichetta testuale nelle azioni primarie. Mai icone-mistero.
- **Empty state**: ogni lista vuota ha un'illustrazione custom della famiglia "Pistoia geometrica" — composizioni astratte costruite **solo** con i tre motivi identitari (scacchi, fasce, foglia/vivaio) nei colori soft della palette. SVG inline, leggeri, coerenti tra loro. Ogni empty state dice: cosa non c'è, perché, e qual è l'azione per riempirlo.
- **Niente**: foto stock, illustrazioni 3D generiche, emoji come decorazione strutturale, clipart "people working".

---

## 8. Data-viz

I dati sono il cuore civico della piattaforma: la visualizzazione è informazione, non ornamento.

- Palette dati derivata dai token (teal → viola → ambra, con i soft come riempimenti); il rosso solo per scostamenti negativi/urgenze.
- Ogni grafico ha: titolo che dice la *conclusione* (non "Spesa per missione" ma "Dove vanno i soldi"), fonte + freschezza (SourceBadge), equivalente testuale accessibile.
- Treemap del bilancio: le aree parlano (etichette dentro le celle quando c'è spazio), interazione = approfondimento progressivo (missione → programmi), transizioni dolci.
- Mai: torte 3D, doppi assi non dichiarati, assi tagliati che drammatizzano, legende che richiedono memoria.

---

## 9. Tema scuro

Il tema scuro è una **seconda lettura dello stesso luogo, di sera** — non un'inversione.

- Fondo blu-notte (`#0e1117` esistente), superfici che salgono per gradini chiari, bagliori d'angolo più presenti (la sera le luci si vedono di più).
- I colori d'accento si schiariscono di un grado (già nei token) ma la semantica resta identica.
- Le ombre quasi spariscono: nel buio l'elevazione si comunica con i gradini di superficie e i bordi.
- Ogni componente nuovo nasce nei due temi insieme: non esiste "poi lo adattiamo al dark".

---

## 10. Accessibilità (vincoli, non preferenze)

1. Contrasto AA ovunque, AAA sul body.
2. Tutto è raggiungibile e usabile da tastiera; focus visibile sempre (`--ring`).
3. Stati comunicati anche senza colore (icona + testo, mai solo rosso/verde).
4. Live region per i cambi di stato asincroni (già in essere con ActionError/toast).
5. La modalità semplice è un cittadino di prima classe: ogni feature nuova si verifica anche lì.
6. Target touch ≥ 44px.

---

## 11. Sì / No

| ✅ Sì | ❌ No |
|---|---|
| Un momento memorabile per pagina (un hero, un numero, una visualizzazione) | Dieci effetti che competono |
| Ornamento derivato dai tre motivi identitari | Pattern decorativi generici, gradienti viola su bianco da template |
| Fraunces per affermare, Jakarta per funzionare | Titoli in font "di sistema" o display usato per i paragrafi |
| Stati vuoti/errore/caricamento disegnati | `<p>Nessun risultato</p>` |
| Motion sobrio con un'unica orchestrazione d'ingresso | Animazioni su ogni elemento, bounce, parallax |
| Il rosso dello stemma per brand e urgenza | Rosso decorativo |
| Densità che cresce solo nelle viste dati | Tutto compresso o tutto arioso indistintamente |
