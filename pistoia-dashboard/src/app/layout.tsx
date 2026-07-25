import type { Metadata, Viewport } from "next";
import { JetBrains_Mono, Schibsted_Grotesk } from "next/font/google";
import { cookies, headers } from "next/headers";
import "./globals.css";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { SIMPLE_MODE_COOKIE } from "@/lib/ui-prefs";

// Voce della piattaforma (DESIGN.md §3): Schibsted Grotesk, grottesco di
// matrice editoriale — disegnato per la lettura di interesse pubblico. Regge
// sia la label da 11px sia la cifra display da 80px, e ha una copertura piena
// dei diacritici italiani. Sostituisce Montserrat (revisione 2026-07-25).
const schibsted = Schibsted_Grotesk({
  variable: "--font-schibsted",
  subsets: ["latin", "latin-ext"],
  display: "swap",
});

// Voce tecnica: numeri di protocollo, coordinate, timestamp, importi tabellari.
const jetbrains = JetBrains_Mono({
  variable: "--font-jetbrains",
  subsets: ["latin", "latin-ext"],
  display: "swap",
});

export const metadata: Metadata = {
  title: {
    default: "Dashboard di Pistoia",
    template: "%s · Dashboard di Pistoia",
  },
  description:
    "I dati pubblici del Comune di Pistoia, finalmente leggibili: bilancio, opere, sondaggi e la città che si risponde.",
  applicationName: "Dashboard di Pistoia",
  authors: [{ name: "Comune di Pistoia" }],
  keywords: ["Pistoia", "comune", "bilancio", "opere", "trasparenza", "cittadini"],
};

export const viewport: Viewport = {
  // Allineati alla tela (DESIGN.md §5): la cornice del browser continua la
  // superficie invece di interromperla.
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#e8e7e4" },
    { media: "(prefers-color-scheme: dark)", color: "#131211" },
  ],
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Nonce CSP generato per-request dal proxy: next-themes lo usa per il suo
  // script inline anti-FOUC, che altrimenti la CSP bloccherebbe.
  const nonce = (await headers()).get("x-nonce") ?? undefined;
  // Modalità semplice (A1 §19): la classe arriva dal server, prima del paint.
  const simpleMode =
    (await cookies()).get(SIMPLE_MODE_COOKIE)?.value === "1";

  return (
    <html
      lang="it"
      suppressHydrationWarning
      // `data-astryx-theme` è statico e scritto qui, lato server: i token del
      // tema vivono in un blocco @scope agganciato a questo attributo, quindi
      // senza di esso lo sfondo del <body> non avrebbe i token già al primo
      // paint. Astryx lo sincronizzerebbe da solo, ma solo dopo l'hydration.
      data-astryx-theme="pistoia"
      className={`${schibsted.variable} ${jetbrains.variable} h-full antialiased${simpleMode ? " simple-mode" : ""}`}
    >
      <body className="min-h-full">
        <ThemeProvider
          // Due attributi: `class` per le variant `dark:` di Tailwind usate
          // dalle rotte esistenti, `data-theme` per il light-dark() di Astryx.
          attribute={["class", "data-theme"]}
          defaultTheme="light"
          enableSystem
          disableTransitionOnChange
          nonce={nonce}
        >
          {children}
        </ThemeProvider>
      </body>
    </html>
  );
}
