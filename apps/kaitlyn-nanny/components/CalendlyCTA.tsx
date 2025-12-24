"use client";

import { useState } from "react";
import { CalendlyModal } from "./CalendlyModal";
import { Button } from "./ui/button";

export function CalendlyCTA({ url }: { url: string }) {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button
        type="button"
        onClick={() => setOpen(true)}
        variant="outline"
        size="sm"
        className="rounded-full border-accent/50 bg-white/70 px-5 text-xs font-semibold tracking-[0.18em] text-accent-deep shadow-lg backdrop-blur-xl hover:bg-white/90"
      >
        CHECK OPEN WEEKENDS
      </Button>

      <CalendlyModal open={open} onClose={() => setOpen(false)} url={url} />
    </>
  );
}




