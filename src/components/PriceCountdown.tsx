"use client";

import { useEffect, useRef, useState } from "react";

interface Props {
  nextRefresh: string | null;
  onRefreshDue?: () => void;
}

export function PriceCountdown({ nextRefresh, onRefreshDue }: Props) {
  const [display, setDisplay] = useState("");
  const firedRef = useRef(false);

  useEffect(() => {
    firedRef.current = false;

    if (!nextRefresh) {
      setDisplay("");
      return;
    }

    function update() {
      const diff = Math.max(0, new Date(nextRefresh!).getTime() - Date.now());
      if (diff === 0) {
        setDisplay("Prices updating now…");
        if (!firedRef.current) {
          firedRef.current = true;
          // Poll every 30s for up to 10 minutes to catch when the cron finishes
          let attempts = 0;
          const poll = setInterval(() => {
            onRefreshDue?.();
            attempts++;
            if (attempts >= 20) clearInterval(poll);
          }, 30_000);
        }
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nextRefresh]);

  if (!display) return null;

  return (
    <span className="text-xs text-muted">{display}</span>
  );
}
