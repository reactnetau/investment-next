"use client";

import { useEffect, useState } from "react";

interface Props {
  nextRefresh: string | null;
}

export function PriceCountdown({ nextRefresh }: Props) {
  const [display, setDisplay] = useState("");

  useEffect(() => {
    if (!nextRefresh) {
      setDisplay("");
      return;
    }

    function update() {
      const diff = Math.max(0, new Date(nextRefresh!).getTime() - Date.now());
      if (diff === 0) {
        setDisplay("Prices updating now…");
        return;
      }
      const h = Math.floor(diff / 3600000);
      const m = Math.floor((diff % 3600000) / 60000);
      const s = Math.floor((diff % 60000) / 1000);
      const parts = [];
      if (h > 0) parts.push(`${h}h`);
      if (m > 0 || h > 0) parts.push(`${m}m`);
      parts.push(`${s}s`);
      setDisplay(`Prices update in ${parts.join(" ")}`);
    }

    update();
    const id = setInterval(update, 1000);
    return () => clearInterval(id);
  }, [nextRefresh]);

  if (!display) return null;

  return (
    <span className="text-xs text-muted">{display}</span>
  );
}
