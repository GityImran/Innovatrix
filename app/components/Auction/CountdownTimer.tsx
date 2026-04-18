"use client";

import React, { useState, useEffect } from "react";

interface CountdownTimerProps {
  endTime: string | Date;
  onEnd?: () => void;
  compact?: boolean;
}

export default function CountdownTimer({ endTime, onEnd, compact = false }: CountdownTimerProps) {
  const [timeLeft, setTimeLeft] = useState<{ d: number; h: number; m: number; s: number } | null>(null);
  const [isExpired, setIsExpired] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date().getTime();
      const end = new Date(endTime).getTime();
      const distance = end - now;

      if (distance < 0) {
        clearInterval(timer);
        setIsExpired(true);
        setTimeLeft(null);
        if (onEnd) onEnd();
        return;
      }

      setTimeLeft({
        d: Math.floor(distance / (1000 * 60 * 60 * 24)),
        h: Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60)),
        m: Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60)),
        s: Math.floor((distance % (1000 * 60)) / 1000),
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [endTime, onEnd]);

  if (isExpired) {
    return <span className="font-black text-red-500 uppercase tracking-widest text-[10px] animate-pulse">Expired</span>;
  }

  if (!timeLeft) {
    return <span className="text-zinc-500 text-xs font-mono">--:--:--</span>;
  }

  const { d, h, m, s } = timeLeft;
  
  if (compact) {
    return (
      <span className="font-mono font-bold text-yellow-400">
        {d > 0 ? `${d}d ` : ""}{h.toString().padStart(2, "0")}:{m.toString().padStart(2, "0")}:{s.toString().padStart(2, "0")}
      </span>
    );
  }

  return (
    <div className="flex items-center gap-1">
      {d > 0 && (
        <>
          <span className="font-mono font-black text-yellow-400">{d}</span>
          <span className="text-[10px] text-zinc-500 font-bold uppercase mr-1">d</span>
        </>
      )}
      <span className="font-mono font-black text-yellow-400">{h.toString().padStart(2, "0")}</span>
      <span className="text-[10px] text-zinc-500 font-bold uppercase mr-1">h</span>
      
      <span className="font-mono font-black text-yellow-400">{m.toString().padStart(2, "0")}</span>
      <span className="text-[10px] text-zinc-500 font-bold uppercase mr-1">m</span>
      
      <span className="font-mono font-black text-yellow-400">{s.toString().padStart(2, "0")}</span>
      <span className="text-[10px] text-zinc-500 font-bold uppercase">s</span>
    </div>
  );
}
