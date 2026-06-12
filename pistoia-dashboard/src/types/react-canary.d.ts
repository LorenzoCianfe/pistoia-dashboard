// L'App Router usa la build canary di React, che esporta <ViewTransition>.
// I tipi stabili di @types/react non lo dichiarano: questo reference aggiunge
// le dichiarazioni canary (usate da src/app/(app)/template.tsx).
/// <reference types="react/canary" />
