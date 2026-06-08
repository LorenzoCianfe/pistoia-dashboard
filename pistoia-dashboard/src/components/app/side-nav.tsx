"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { motion } from "motion/react";
import { NAV_ITEMS, SECONDARY_NAV, ADMIN_NAV, type NavItem } from "./nav-items";
import { cn } from "@/lib/utils";

function NavLink({ item, active }: { item: NavItem; active: boolean }) {
  const Icon = item.icon;
  return (
    <Link
      href={item.href}
      className={cn(
        "group relative flex items-center gap-3 rounded-[var(--radius-sm)] px-3.5 py-2.5 text-sm font-medium transition-colors",
        active ? "text-foreground" : "text-muted hover:text-foreground",
      )}
    >
      {active ? (
        <motion.span
          layoutId="side-active"
          className="absolute inset-0 rounded-[var(--radius-sm)] border border-border bg-surface-2"
          transition={{ type: "spring", stiffness: 420, damping: 34 }}
        />
      ) : null}
      <Icon
        size={19}
        className={cn("relative z-10 shrink-0", active && "text-teal")}
      />
      <span className="relative z-10">{item.label}</span>
    </Link>
  );
}

export function SideNav({ isAdmin }: { isAdmin: boolean }) {
  const pathname = usePathname();
  const isActive = (href: string) =>
    pathname === href || pathname.startsWith(href + "/");

  const secondary = isAdmin ? [...SECONDARY_NAV, ADMIN_NAV] : SECONDARY_NAV;

  return (
    <nav aria-label="Navigazione principale" className="flex flex-col gap-1">
      {NAV_ITEMS.map((item) => (
        <NavLink key={item.href} item={item} active={isActive(item.href)} />
      ))}
      <div className="my-2 h-px bg-border" />
      {secondary.map((item) => (
        <NavLink key={item.href} item={item} active={isActive(item.href)} />
      ))}
    </nav>
  );
}
