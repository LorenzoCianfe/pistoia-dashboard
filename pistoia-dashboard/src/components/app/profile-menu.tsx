"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";
import {
  User,
  Settings,
  Shield,
  LogOut,
  Network,
  ChevronDown,
} from "lucide-react";
import { AnimatePresence, motion } from "motion/react";
import { Avatar } from "@/components/ui/avatar";
import { logoutAction } from "@/app/actions/auth";
import type { CurrentUser } from "@/lib/auth/dal";

export function ProfileMenu({ user }: { user: CurrentUser }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

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

            {user.role === "ADMIN" ? (
              <Link
                href="/admin"                onClick={() => setOpen(false)}
                className="flex items-center gap-2.5 rounded-[var(--radius-sm)] px-2.5 py-2 text-sm text-foreground transition-colors hover:bg-surface-2"
              >
                <Shield size={17} className="text-[var(--red)]" />
                Area Comune
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
