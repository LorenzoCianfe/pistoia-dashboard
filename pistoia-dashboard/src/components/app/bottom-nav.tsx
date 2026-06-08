"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { User } from "lucide-react";
import { NAV_ITEMS, type NavItem } from "./nav-items";
import { cn } from "@/lib/utils";

const tabs: NavItem[] = [
  ...NAV_ITEMS.filter((i) => i.core),
  { href: "/profilo", label: "Profilo", icon: User, core: false },
];

export function BottomNav() {
  const pathname = usePathname();
  return (
    <nav
      aria-label="Navigazione rapida"
      className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-surface/85 backdrop-blur-lg lg:hidden"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      <ul className="mx-auto flex max-w-md items-stretch justify-around">
        {tabs.map((item) => {
          const active =
            pathname === item.href || pathname.startsWith(item.href + "/");
          const Icon = item.icon;
          return (
            <li key={item.href} className="flex-1">
              <Link
                href={item.href}
                aria-current={active ? "page" : undefined}
                className={cn(
                  "flex flex-col items-center gap-1 pb-2 pt-2 text-[11px] font-medium transition-colors",
                  active ? "text-teal" : "text-muted",
                )}
              >
                <span
                  className={cn(
                    "grid place-items-center rounded-pill px-5 py-1 transition-colors",
                    active && "bg-teal-soft",
                  )}
                >
                  <Icon size={20} />
                </span>
                {item.label}
              </Link>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
