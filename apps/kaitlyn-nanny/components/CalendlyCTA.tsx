"use client";

import { useState } from "react";
import { CalendlyModal } from "./CalendlyModal";

export function CalendlyCTA({ url }: { url: string }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="inline-flex items-center justify-center rounded-full border border-[hsl(var(--accent))]/50 bg-white/70 px-5 py-2.5 text-xs font-semibold tracking-[0.18em] text-[hsl(var(--accent-deep))] shadow-lg backdrop-blur-xl transition hover:bg-white/90"
      >
        CHECK OPEN WEEKENDS
      </button>

      <CalendlyModal open={open} onClose={() => setOpen(false)} url={url} />
    </>
  );
}



