import * as React from "react";

import { cn } from "../../utils";

const Textarea = React.forwardRef(({ className, ...props }, ref) => {
  return (
    <textarea
      className={cn(
        "border-input bg-background placeholder:text-muted-foreground flex min-h-20 w-full border px-3 py-2 text-sm focus-visible:outline-none disabled:cursor-not-allowed disabled:opacity-50",
        className,
      )}
      ref={ref}
      {...props}
    />
  );
});
Textarea.displayName = "Textarea";

export { Textarea };
