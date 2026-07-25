"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import type { ComponentProps } from "react";

/**
 * Il tema è guidato interamente da CSS e da attributi su <html>:
 *
 *  - `data-astryx-theme="pistoia"` — scritto lato server in layout.tsx, aggancia
 *    il blocco @scope che contiene i token del tema compilato;
 *  - `data-theme` + `class` — scritti da next-themes prima del paint, con nonce
 *    CSP. `data-theme` pilota `color-scheme`, e quindi tutte le light-dark()
 *    del tema; `class` serve alle variant `dark:` di Tailwind nelle rotte.
 *
 * NON usiamo il provider <Theme> di Astryx, per due motivi concreti:
 *
 *  1. Applica `color-scheme` sul PROPRIO wrapper. Essendo un div discendente di
 *     <html>, il suo valore vince su quello del root per tutto il sottoalbero:
 *     appena i due divergono — cosa che succede al primo render, quando
 *     next-themes ha già scritto "dark" e il provider non ha ancora lo stato —
 *     ogni light-dark() dei discendenti si risolve sul ramo sbagliato. In
 *     pratica: card bianche su tela nera.
 *  2. Sincronizza a sua volta `data-theme` su documentElement, contendendo
 *     l'attributo a next-themes.
 *
 * Con un tema COMPILATO (`astryx theme build`) il provider è superfluo: i token
 * e gli override di componente vivono già nel CSS statico, che è anche l'unica
 * strada percorribile sotto la CSP con nonce (l'iniezione a runtime del tema
 * non compilato verrebbe bloccata).
 */
export function ThemeProvider({
  children,
  ...props
}: ComponentProps<typeof NextThemesProvider>) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
