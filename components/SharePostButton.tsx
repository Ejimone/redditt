"use client";

import { ShareFat } from "@phosphor-icons/react";
import { useCallback, useState } from "react";

type SharePostButtonProps = {
  path: string;
  title: string;
  className?: string;
};

export default function SharePostButton({
  path,
  title,
  className = "",
}: SharePostButtonProps) {
  const [label, setLabel] = useState("Share");

  const onClick = useCallback(async () => {
    const origin =
      typeof window !== "undefined" ? window.location.origin : "";
    const abs = `${origin}${path.startsWith("/") ? path : `/${path}`}`;

    try {
      if (typeof navigator !== "undefined" && navigator.share) {
        await navigator.share({ title, url: abs, text: title });
        return;
      }
    } catch {
      /* cancelled or failed */
    }

    try {
      if (typeof navigator !== "undefined" && navigator.clipboard?.writeText) {
        await navigator.clipboard.writeText(abs);
        setLabel("Copied!");
        window.setTimeout(() => setLabel("Share"), 2000);
        return;
      }
    } catch {
      /* clipboard blocked */
    }

    window.prompt("Copy this link:", abs);
  }, [path, title]);

  return (
    <button
      type="button"
      onClick={onClick}
      className={`inline-flex min-h-11 touch-manipulation items-center gap-1.5 rounded-full px-3 py-2 text-xs font-bold text-muted-foreground transition-colors hover:bg-white/10 hover:text-foreground active:bg-white/15 sm:min-h-10 ${className}`}
    >
      <ShareFat className="size-5 shrink-0" weight="bold" aria-hidden />
      {label}
    </button>
  );
}
