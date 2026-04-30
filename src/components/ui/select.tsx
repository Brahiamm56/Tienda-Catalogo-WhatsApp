import * as React from "react";

import { cn } from "@/lib/utils";

export const Select = React.forwardRef<
  HTMLSelectElement,
  React.SelectHTMLAttributes<HTMLSelectElement>
>(({ className, ...props }, ref) => {
  return (
    <select
      ref={ref}
      className={cn(
        "flex h-12 w-full rounded-2xl border border-[var(--border)] bg-white/80 px-4 text-sm outline-none ring-0 transition focus:border-[var(--accent)]",
        className,
      )}
      {...props}
    />
  );
});

Select.displayName = "Select";