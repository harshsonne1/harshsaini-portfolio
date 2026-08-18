// Skeleton — a pulsing placeholder for content that has not arrived yet.
//
// Same API as shadcn/ui's: a div you size with `className`. The fill comes from
// this project's tokens rather than shadcn's `bg-primary/10`, which has no
// meaning here — `--color-fg` at low alpha reads correctly on the dark page and
// on the light one without a second rule.
//
// The pulse is dropped under prefers-reduced-motion (see globals.css): a
// placeholder that never resolves is information, and it should not throb to
// carry it.

import { cn } from "@/lib/utils";

export function Skeleton({
  className,
  ...props
}: React.ComponentProps<"div">) {
  return (
    <div
      data-slot="skeleton"
      aria-hidden="true"
      className={cn("animate-pulse rounded-md bg-fg/10", className)}
      {...props}
    />
  );
}
