import type { Metadata, Viewport } from "next";
import { Montserrat } from "next/font/google";
import { cookies, headers } from "next/headers";
import "./globals.css";
import { ThemeProvider } from "@/components/theme/theme-provider";
import { SIMPLE_MODE_COOKIE } from "@/lib/ui-prefs";

// Voce unica della piattaforma (DESIGN.md §3): Montserrat, geometrico e
// minimale — i titoli si distinguono per peso e tracking, non per famiglia.
const montserrat = Montserrat({
  variable: "--font-montserrat",
  subsets: ["latin"],
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
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#fbfbfd" },
    { media: "(prefers-color-scheme: dark)", color: "#0e1117" },
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
      className={`${montserrat.variable} h-full antialiased${simpleMode ? " simple-mode" : ""}`}
    >
      <body className="min-h-full">
        <ThemeProvider
          attribute="class"
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
