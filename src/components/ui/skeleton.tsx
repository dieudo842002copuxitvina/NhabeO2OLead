import { cn } from "@/lib/utils";

/**
 * Brand-tinted shimmer skeleton — uses Nature Green low-opacity gradient
 * for on-brand loading states. Pure CSS animation, GPU-friendly.
 */
function Skeleton({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn(
        "relative overflow-hidden rounded-md bg-primary/5",
        "before:absolute before:inset-0 before:-translate-x-full",
        "before:bg-gradient-to-r before:from-transparent before:via-primary/15 before:to-transparent",
        "before:animate-[shimmer_1.6s_infinite]",
        className,
      )}
      {...props}
    />
  );
}

export { Skeleton };
