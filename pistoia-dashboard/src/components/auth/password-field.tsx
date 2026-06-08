"use client";

import { useState } from "react";
import { Eye, EyeOff } from "lucide-react";
import { Field, Input } from "@/components/ui/input";
import { estimatePasswordStrength } from "@/lib/auth/validation";
import { cn } from "@/lib/utils";

const STRENGTH_COLORS = [
  "var(--red)",
  "var(--red)",
  "var(--amber)",
  "var(--teal)",
  "var(--green)",
];

export function PasswordField({
  name,
  id,
  label,
  error,
  autoComplete = "current-password",
  placeholder = "••••••••",
  showStrength = false,
}: {
  name: string;
  id: string;
  label: string;
  error?: string | string[];
  autoComplete?: string;
  placeholder?: string;
  showStrength?: boolean;
}) {
  const [value, setValue] = useState("");
  const [show, setShow] = useState(false);
  const { score, label: strengthLabel } = estimatePasswordStrength(value);

  return (
    <Field label={label} htmlFor={id} error={error}>
      <div className="relative">
        <Input
          id={id}
          name={name}
          type={show ? "text" : "password"}
          autoComplete={autoComplete}
          placeholder={placeholder}
          invalid={!!error}
          className="pr-11"
          value={value}
          onChange={(e) => setValue(e.target.value)}
        />
        <button
          type="button"
          onClick={() => setShow((s) => !s)}
          aria-label={show ? "Nascondi password" : "Mostra password"}
          className="absolute right-1.5 top-1/2 grid size-8 -translate-y-1/2 place-items-center rounded-lg text-muted hover:text-foreground"
        >
          {show ? <EyeOff size={17} /> : <Eye size={17} />}
        </button>
      </div>

      {showStrength && value.length > 0 ? (
        <div className="mt-2 space-y-1">
          <div className="flex gap-1">
            {[0, 1, 2, 3].map((i) => (
              <div
                key={i}
                className="h-1.5 flex-1 rounded-full transition-colors"
                style={{
                  backgroundColor:
                    i < score ? STRENGTH_COLORS[score] : "var(--surface-3)",
                }}
              />
            ))}
          </div>
          <p
            className={cn("text-xs font-medium")}
            style={{ color: STRENGTH_COLORS[score] }}
          >
            Sicurezza: {strengthLabel}
          </p>
        </div>
      ) : null}
    </Field>
  );
}
