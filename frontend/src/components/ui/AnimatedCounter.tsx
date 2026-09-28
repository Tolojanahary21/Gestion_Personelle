"use client";

import { useEffect, useState } from "react";

export default function AnimatedCounter({ value, duration = 850 }: { value: number; duration?: number }) {
  const [displayed, setDisplayed] = useState(0);
  useEffect(() => {
    const target = Number.isFinite(value) ? value : 0;
    let frame = 0;
    const start = performance.now();
    const animate = (now: number) => {
      const progress = Math.min(1, (now - start) / duration);
      const eased = 1 - Math.pow(1 - progress, 4);
      setDisplayed(Math.round(target * eased));
      if (progress < 1) frame = requestAnimationFrame(animate);
    };
    frame = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(frame);
  }, [duration, value]);
  return <>{new Intl.NumberFormat("fr-FR").format(displayed)}</>;
}
