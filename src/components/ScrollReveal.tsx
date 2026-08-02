"use client";

// ScrollReveal — one page-wide IntersectionObserver driving every scroll-in
// animation. Mark an element `data-reveal="up|wipe"` to animate it on its own,
// or put `data-reveal-group` on a container and `data-reveal-item="…"` on its
// children so they all fire off the container's single trigger (that's how an
// experience row's hairline, period, role and description stay in step).
// Per-element offsets come from a `--reveal-delay` custom property.
import { useEffect } from "react";

export default function ScrollReveal() {
  useEffect(() => {
    // note: the `js-reveal` class that arms the hidden state is set by the
    // pre-paint script in layout.tsx, not here
    const targets = Array.from(
      document.querySelectorAll<HTMLElement>(
        "[data-reveal], [data-reveal-group]",
      ),
    );

    // reduced motion: show everything, skip the observer entirely
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) {
      targets.forEach((el) => el.classList.add("is-in"));
      return;
    }

    const io = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          entry.target.classList.add("is-in");
          io.unobserve(entry.target); // reveals are one-shot
        });
      },
      // fire once the element's top edge clears the lower 12% of the viewport
      { threshold: 0, rootMargin: "0px 0px -12% 0px" },
    );

    targets.forEach((el) => io.observe(el));

    return () => io.disconnect();
  }, []);

  return null;
}
