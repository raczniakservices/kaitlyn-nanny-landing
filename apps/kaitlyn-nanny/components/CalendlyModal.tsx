"use client";

import { useEffect, useMemo } from "react";

type Props = {
  open: boolean;
  onClose: () => void;
  url: string;
  title?: string;
  onEventScheduled?: (payload: any) => void;
};

declare global {
  interface Window {
    Calendly?: any;
  }
}

function loadCalendlyScript() {
  if (typeof window === "undefined") return;
  const id = "calendly-widget-js";
  if (document.getElementById(id)) return;

  const s = document.createElement("script");
  s.id = id;
  s.src = "https://assets.calendly.com/assets/external/widget.js";
  s.async = true;
  document.body.appendChild(s);
}

function withCalendlyEmbedParams(url: string) {
  // Calendly supports URL params to improve embed UX.
  // - hide_gdpr_banner helps remove the cookie banner in embed contexts
  // - primary_color aligns with our rose theme (accent-deep approx)
  // - text_color keeps things readable
  const params = new URLSearchParams({
    hide_gdpr_banner: "1",
    primary_color: "cc5c7a",
    text_color: "3b1f2a"
  });
  return url.includes("?") ? `${url}&${params.toString()}` : `${url}?${params.toString()}`;
}

export function CalendlyModal({
  open,
  onClose,
  url,
  title = "Check open weekends",
  onEventScheduled
}: Props) {
  const embedUrl = useMemo(() => withCalendlyEmbedParams(url), [url]);
  const widgetKey = useMemo(() => `cal-${btoa(embedUrl).slice(0, 12)}`, [embedUrl]);

  useEffect(() => {
    if (!open) return;
    loadCalendlyScript();
  }, [open]);

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [open, onClose]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: MessageEvent) => {
      const data: any = e.data;
      if (!data || typeof data !== "object") return;
      if (data.event === "calendly.event_scheduled") {
        // Calendly sends booking details via postMessage
        // payload.event.start_time is an ISO timestamp string
        // https://help.calendly.com/hc/en-us/articles/360020392853
        onEventScheduled?.(data.payload);
      }
    };
    window.addEventListener("message", handler);
    return () => window.removeEventListener("message", handler);
  }, [open, onEventScheduled]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center p-4"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      <button
        type="button"
        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
        onClick={onClose}
        aria-label="Close"
      />

      <div className="relative w-full max-w-4xl overflow-hidden rounded-3xl border border-white/20 bg-white/10 shadow-2xl backdrop-blur-xl">
        <div className="flex items-center justify-between border-b border-white/15 px-5 py-4">
          <div className="text-xs font-semibold tracking-[0.22em] text-white/90">{title.toUpperCase()}</div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold tracking-wide text-white/90 hover:bg-white/20"
          >
            Close
          </button>
        </div>

        {/* Calendly inline widget */}
        <div className="bg-white">
          <div
            key={widgetKey}
            className="calendly-inline-widget"
            data-url={embedUrl}
            style={{ minWidth: "320px", height: "760px" }}
          />
        </div>
      </div>
    </div>
  );
}


