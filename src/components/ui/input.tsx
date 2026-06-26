import * as React from "react";

import { cn } from "@/lib/utils";

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          "flex h-12 w-full rounded-2xl border border-[var(--border)] bg-[var(--surface-strong)] px-4 text-sm text-[var(--foreground)] outline-none ring-0 transition placeholder:text-[var(--muted-foreground)] focus:border-[var(--accent)]",
          className,
        )}
        {...props}
      />
    );
  },
);

Input.displayName = "Input";