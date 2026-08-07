"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { User, Settings, LogOut, Network, ChevronDown } from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { Avatar } from "@/components/ui/avatar";
import { staffNav } from "@/components/app/nav-items";
import { logoutAction } from "@/app/actions/auth";
import type { CurrentUser } from "@/lib/auth/dal";

export function ProfileMenu({ user }: { user: CurrentUser }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  // Il ruolo si risolve QUI, in un componente client: `staff.icon` è un
  // componente React, e da un Server Component non attraverserebbe il confine
  // (`AGENTS.md` §3, ondata 7, 1 — ripagata su `SideNav` lo stesso giorno).
  const staff = staffNav(user.role);

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setOpen(false);
    }
    document.addEventListener("mousedown", onClick);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onClick);
      document.removeEventListener("keydown", onKey);
    };
  }, []);

  const links = [
    { href: "/profilo", label: "Profilo", icon: User },
    { href: "/organigramma", label: "Organigramma", icon: Network },
    { href: "/impostazioni", label: "Impostazioni", icon: Settings },
  ];

  return (
    <div className="relative" ref={ref}>
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-haspopup="true"
        aria-expanded={open}
        // Il pulsante non ha testo: dentro c'è solo l'`Avatar`, che è
        // `aria-hidden` di proposito (le iniziali non dicono niente a chi non
        // vede), più un chevron decorativo. Senza questa etichetta uno
        // screen reader annuncia «pulsante» e basta — violazione `button-name`
        // trovata da axe il 2026-08-05 su ogni pagina autenticata.
        aria-label={`Menu del profilo di ${user.name}`}
        className="flex items-center gap-1.5 rounded-pill border border-border bg-surface py-1 pl-1 pr-2 transition-colors hover:bg-surface-2"
      >
        <Avatar name={user.name} color={user.avatarColor} size="sm" />
        <ChevronDown size={15} className="text-muted" />
      </button>

      <AnimatePresence>
        {open ? (
          <motion.div
            initial={{ opacity: 0, y: -6, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -6, scale: 0.98 }}
            transition={{ duration: 0.16, ease: [0.22, 1, 0.36, 1] }}
            className="card absolute right-0 mt-2 w-60 overflow-hidden p-2"
          >
            <div className="flex items-center gap-3 px-2 py-2">
              <Avatar name={user.name} color={user.avatarColor} size="md" />
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold">{user.name}</p>
                <p className="truncate text-xs text-muted">{user.email}</p>
              </div>
            </div>
            <div className="my-1.5 h-px bg-border" />

            {links.map((l) => (
              <Link
                key={l.href}
                href={l.href}                onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 rounded-[var(--radius-sm)] px-2.5 py-2 text-sm text-foreground transition-colors hover:bg-surface-2"
              >
                <l.icon size={17} className="text-muted" />
                {l.label}
              </Link>
            ))}

            {/*
              La superficie riservata del ruolo, se ne ha una.

              Era il solo `role === "ADMIN"` con `/admin` scritto a mano, ed è
              metà della ragione per cui la Redazione è rimasta senza porta
              (2026-08-07): la barra laterale non ce l'aveva, e qui nemmeno.
              Questa voce è quella che vale **su telefono**, dove la barra
              laterale non esiste (`lg:block`) e la barra in basso porta solo le
              cinque destinazioni pubbliche.
            */}
            {staff ? (
              <Link
                href={staff.href}
                onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 rounded-[var(--radius-sm)] px-2.5 py-2 text-sm text-foreground transition-colors hover:bg-surface-2"
              >
                <staff.icon size={17} style={{ color: staff.tinta }} />
                {staff.label}
              </Link>
            ) : null}

            <div className="my-1.5 h-px bg-border" />
            <form action={logoutAction}>
              <button
                type="submit"                className="flex w-full items-center gap-2.5 rounded-[var(--radius-sm)] px-2.5 py-2 text-sm font-medium text-[var(--red)] transition-colors hover:bg-[var(--red-soft)]"
              >
                <LogOut size={17} />
                Esci
              </button>
            </form>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  );
}
