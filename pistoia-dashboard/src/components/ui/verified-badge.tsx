import { BadgeCheck } from "lucide-react";
import { cn } from "@/lib/utils";

/** Blue verification check, like a verified profile on a social network. */
export function VerifiedBadge({
  className,
  size = 16,
}: {
  className?: string;
  size?: number;
}) {
  return (
    <BadgeCheck
      size={size}
      className={cn("text-[#3b82f6]", className)}
      aria-label="Profilo verificato"
    />
  );
}
