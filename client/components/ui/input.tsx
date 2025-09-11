import * as React from "react";

import { cn } from "@/lib/utils";
import { FieldError } from "react-hook-form";

const Input = React.forwardRef<
  HTMLInputElement,
  React.ComponentProps<"input"> & { error?: FieldError }
>(({ className, error, type, ...props }, ref) => {
  return (
    <div className="flex flex-col gap-1 flex-1">
      <input
        type={type}
        className={cn(
          "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-base ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 md:text-sm",
          {
            "ring-destructive focus-visible:ring-destructive": !!error,
            "focus-visible:ring-ring": !error,
          },
          className
        )}
        ref={ref}
        {...props}
      />

      {error && <p className="text-destructive text-sm">{error?.message}</p>}
    </div>
  );
});
Input.displayName = "Input";

export { Input };
