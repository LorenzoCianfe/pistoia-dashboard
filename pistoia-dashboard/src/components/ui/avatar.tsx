import { cn } from "@/lib/utils";
import { accent, initialsOf } from "@/lib/colors";

const sizeMap = {
  sm: "size-8 text-xs",
  md: "size-10 text-sm",
  lg: "size-12 text-base",
  xl: "size-16 text-xl",
};

export function Avatar({
  name,
  initials,
  color = "teal",
  size = "md",
  className,
}: {
  name?: string;
  initials?: string;
  color?: string;
  size?: keyof typeof sizeMap;
  className?: string;
}) {
  const { fg, soft } = accent(color);
  const text = initials ?? (name ? initialsOf(name) : "?");
  return (
    <span
      className={cn(
        "inline-flex shrink-0 items-center justify-center rounded-full font-bold",
        sizeMap[size],
        className,
      )}
      style={{ backgroundColor: soft, color: fg }}
      aria-hidden="true"
    >
      {text}
    </span>
  );
}
