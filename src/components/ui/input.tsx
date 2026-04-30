import * as React from "react";

import { cn } from "@/lib/utils";

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => {
    return (
      <input
        ref={ref}
        className={cn(
          "flex h-12 w-full rounded-2xl border border-[var(--border)] bg-white/80 px-4 text-sm outline-none ring-0 transition placeholder:text-[var(--muted-foreground)] focus:border-[var(--accent)]",
          className,
        )}
        {...props}
      />
    );
  },
);

Input.displayName = "Input";