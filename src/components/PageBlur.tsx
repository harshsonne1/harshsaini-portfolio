"use client";

import { useEffect, useState } from "react";
import GradualBlur from "./GradualBlur";

// Page-wide bottom blur, hidden once the footer scrolls into view so the
// closing CTA stays crisp.
export function PageBlur() {
  const [atFooter, setAtFooter] = useState(false);

  useEffect(() => {
    const footer = document.getElementById("contact");
    if (!footer) return;
    const io = new IntersectionObserver(
      ([entry]) => setAtFooter(entry.isIntersecting),
      { threshold: 0 },
    );
    io.observe(footer);
    return () => io.disconnect();
  }, []);

  if (atFooter) return null;

  return (
    <GradualBlur
      target="page"
      position="bottom"
      height="7rem"
      strength={2}
      divCount={5}
      curve="bezier"
      exponential
      opacity={1}
    />
  );
}
