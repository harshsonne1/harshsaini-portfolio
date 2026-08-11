// cn — joins class values, dropping anything falsy.
//
// The usual clsx + tailwind-merge pair, minus the dependencies: nothing here
// passes conflicting utilities to the same element, so plain joining is all
// that's needed. Components that need a caller to override a base utility
// expose a CSS variable instead of relying on merge order (see DotLoader).
export function cn(...classes: (string | false | null | undefined)[]) {
  return classes.filter(Boolean).join(" ");
}
