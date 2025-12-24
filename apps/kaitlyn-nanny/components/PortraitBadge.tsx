"use client";

import { useMemo, useState } from "react";

export function PortraitBadge({
  src = "/kaitlyn.jpg",
  alt = "Kaitlyn Noel Raczniak"
}: {
  src?: string;
  alt?: string;
}) {
  const [status, setStatus] = useState<"loading" | "ok" | "error">("loading");
  const initials = useMemo(() => "K", []);

  return (
    <div
      className="relative h-9 w-9 overflow-hidden rounded-full border border-[hsl(var(--border))] bg-white shadow-sm"
      aria-label={alt}
    >
      <div className="flex h-full w-full items-center justify-center">
        <span className="font-[var(--font-heading)] text-sm text-[hsl(var(--text))]">{initials}</span>
      </div>

      {src && status !== "error" ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={alt}
          className={[
            "absolute inset-0 h-full w-full object-cover transition-opacity",
            status === "ok" ? "opacity-100" : "opacity-0"
          ].join(" ")}
          onLoad={() => setStatus("ok")}
          onError={() => setStatus("error")}
        />
      ) : null}
    </div>
  );
}


