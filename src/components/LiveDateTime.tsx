"use client";

// Live readout of the current date and time. Renders nothing on the server
// (and on the first client paint) to avoid a hydration mismatch, then fills in
// on mount and ticks every second.

import { useEffect, useState } from "react";

const pad = (n: number) => String(n).padStart(2, "0");

function format(d: Date) {
  const date = `${pad(d.getDate())} - ${pad(d.getMonth() + 1)} - ${d.getFullYear()}`;
  const time = `${pad(d.getHours())}:${pad(d.getMinutes())}:${pad(d.getSeconds())}`;
  // three non-breaking spaces so they don't collapse in HTML
  return `${date}   ${time}`;
}

export function LiveDateTime({ className = "" }: { className?: string }) {
  const [now, setNow] = useState<Date | null>(null);

  useEffect(() => {
    setNow(new Date());
    const id = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(id);
  }, []);

  // reserve height with a non-breaking space until the clock is live
  return <span className={className}>{now ? format(now) : " "}</span>;
}
