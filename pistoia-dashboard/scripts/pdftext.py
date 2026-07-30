"""Estrattore di testo PDF con la sola libreria standard.

Tre cose che i PDF della pubblica amministrazione fanno e che, se ignorate,
producono un output *plausibile e sbagliato* invece di un errore:

1. **Font sottoinsiemati con ToUnicode.** I codici partono da <01> in ogni
   font, quindi una mappa unica li confonde: si decodifica con la mappa del
   font corrente.
2. **Font compositi (Type0/Identity-H) a due byte.** Iterare i byte uno a uno
   restituisce caratteri di sostituzione — sintomo che somiglia a un PDF
   scansionato. La larghezza si legge dal `codespacerange` della CMap.
3. **Array `TJ` crenati.** `[(Il )-250(Sindaco)]TJ` è la forma normale del
   testo giustificato: cercare solo `Tj` lascia passare i frammenti isolati.

Uso: python pdftext.py file.pdf [--griglia]
`--griglia` stampa (x, y, testo) invece delle righe ricomposte, che serve
quando il documento è una tabella larga e le colonne vanno riallineate a mano.
"""
import re
import sys
import zlib

PDF = sys.argv[1]
GRIGLIA = "--griglia" in sys.argv
data = open(PDF, "rb").read()


def oggetto(num: int) -> bytes:
    m = re.search(rb"(?<![0-9])" + str(num).encode() + rb"\s+0\s+obj(.*?)endobj", data, re.S)
    return m.group(1) if m else b""


def flusso(corpo: bytes) -> bytes:
    m = re.search(rb"stream\r?\n(.*?)endstream", corpo, re.S)
    if not m:
        return b""
    try:
        return zlib.decompress(m.group(1))
    except zlib.error:
        return m.group(1)


FUGHE = {b"\\n": b"\n", b"\\r": b"\r", b"\\t": b"\t",
         b"\\(": b"(", b"\\)": b")", b"\\\\": b"\\"}


def sliteral(b: bytes) -> str:
    for k, v in FUGHE.items():
        b = b.replace(k, v)
    b = re.sub(rb"\\([0-7]{1,3})", lambda m: bytes([int(m.group(1), 8) & 0xFF]), b)
    return b.decode("latin-1")


def leggi_cmap(cm: bytes):
    """→ ({codice: testo}, larghezza in byte del codice)."""
    mappa = {}
    larghezza = 1
    cs = re.search(rb"begincodespacerange\s*<([0-9A-Fa-f]+)>", cm)
    if cs:
        larghezza = max(1, len(cs.group(1)) // 2)
    for blocco in re.findall(rb"beginbfchar(.*?)endbfchar", cm, re.S):
        for a, b in re.findall(rb"<([0-9A-Fa-f]+)>\s*<([0-9A-Fa-f]+)>", blocco):
            mappa[int(a, 16)] = bytes.fromhex(b.decode()).decode("utf-16-be", "replace")
    for blocco in re.findall(rb"beginbfrange(.*?)endbfrange", cm, re.S):
        for a, b, c in re.findall(rb"<([0-9A-Fa-f]+)>\s*<([0-9A-Fa-f]+)>\s*<([0-9A-Fa-f]+)>", blocco):
            testo = bytes.fromhex(c.decode()).decode("utf-16-be", "replace")
            base = ord(testo[0]) if testo else 0
            for i in range(int(a, 16), min(int(b, 16), int(a, 16) + 65535) + 1):
                mappa[i] = chr(base + i - int(a, 16))
    return mappa, larghezza


# Il dizionario dei font può essere inline (`/Font <</F1 4 0 R>>`) oppure
# indiretto (`/Font 210 0 R`). Cercare solo la prima forma lascia la mappa
# vuota e ogni glifo diventa «�».
dizionari = [m.group(1) for m in re.finditer(rb"/Font\s*<<(.*?)>>", data, re.S)]
for m in re.finditer(rb"/Font\s+(\d+)\s+0\s+R", data):
    dizionari.append(oggetto(int(m.group(1))))

font_map = {}
for ris in dizionari:
    for nome, num in re.findall(rb"/([A-Za-z0-9_.+\-]+)\s+(\d+)\s+0\s+R", ris):
        corpo = oggetto(int(num))
        tu = re.search(rb"/ToUnicode\s+(\d+)\s+0\s+R", corpo)
        if tu:
            font_map[nome.decode()] = leggi_cmap(flusso(oggetto(int(tu.group(1)))))

contenuto = b""
for m in re.finditer(rb"stream\r?\n(.*?)endstream", data, re.S):
    try:
        p = zlib.decompress(m.group(1))
    except zlib.error:
        continue
    if b"BT" in p and (b"Tj" in p or b"TJ" in p):
        contenuto += p + b"\n"


def decodifica(hexstr: bytes, mappa, larghezza) -> str:
    grezzo = bytes.fromhex(hexstr.decode())
    if larghezza == 2:
        codici = [int.from_bytes(grezzo[i:i + 2], "big") for i in range(0, len(grezzo) - 1, 2)]
    else:
        codici = list(grezzo)
    return "".join(mappa.get(c, "�") for c in codici)


frammenti = []
for blocco in re.findall(rb"BT(.*?)ET", contenuto, re.S):
    fon = re.findall(rb"/([A-Za-z0-9_.+\-]+)\s+[\d.]+\s+Tf", blocco)
    mappa, larghezza = font_map.get(fon[0].decode(), ({}, 1)) if fon else ({}, 1)
    # Posizione: `Td`/`TD` o la matrice `Tm`.
    pos = re.search(rb"([-\d.]+)\s+([-\d.]+)\s+T[dD]", blocco)
    if not pos:
        tm = re.search(rb"([-\d.]+)\s+([-\d.]+)\s+([-\d.]+)\s+([-\d.]+)\s+([-\d.]+)\s+([-\d.]+)\s+Tm", blocco)
        if not tm:
            continue
        x, y = float(tm.group(5)), float(tm.group(6))
    else:
        x, y = float(pos.group(1)), float(pos.group(2))

    testo = ""
    for tok in re.finditer(rb"<([0-9A-Fa-f]+)>\s*Tj|\(((?:\\.|[^\\()])*)\)\s*Tj|\[((?:[^\[\]\\]|\\.)*)\]\s*TJ", blocco, re.S):
        if tok.group(1) is not None:
            testo += decodifica(tok.group(1), mappa, larghezza)
        elif tok.group(2) is not None:
            testo += sliteral(tok.group(2))
        else:
            for el in re.finditer(rb"<([0-9A-Fa-f]+)>|\(((?:\\.|[^\\()])*)\)|(-?\d+(?:\.\d+)?)", tok.group(3)):
                if el.group(1) is not None:
                    testo += decodifica(el.group(1), mappa, larghezza)
                elif el.group(2) is not None:
                    testo += sliteral(el.group(2))
                elif float(el.group(3)) < -180:
                    testo += " "
    if testo.strip():
        frammenti.append((round(y, 1), x, testo))

if GRIGLIA:
    for y, x, t in sorted(frammenti, key=lambda f: (-f[0], f[1])):
        print(f"{y:9.1f} {x:8.1f}  {t}")
    sys.exit(0)

righe = {}
for y, x, t in frammenti:
    righe.setdefault(y, []).append((x, t))

out = []
for y in sorted(righe, reverse=True):
    pezzi = sorted(righe[y])
    riga, fine = "", None
    for x, t in pezzi:
        if fine is not None and x - fine > 1.5:
            riga += "  "
        riga += t
        fine = x + len(t) * 3.0
    out.append(riga.rstrip())

sys.stdout.buffer.write("\n".join(out).encode("utf-8", "replace"))
