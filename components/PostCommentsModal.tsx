"use client";

import { X } from "@phosphor-icons/react";
import { useRouter } from "next/navigation";
import { useEffect } from "react";

export default function PostCommentsModal({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();

  const close = () => router.back();

  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        router.back();
      }
    };
    document.addEventListener("keydown", onKeyDown);
    return () => document.removeEventListener("keydown", onKeyDown);
  }, [router]);

  return (
    <div
      className="fixed inset-0 z-50 overflow-y-auto bg-black/60 p-4"
      onClick={(event) => {
        if (event.target === event.currentTarget) {
          close();
        }
      }}
    >
      <div className="relative mx-auto my-8 w-full max-w-2xl space-y-6 rounded-2xl border border-white/10 bg-card p-4 ring-1 ring-white/5 sm:p-6">
        <button
          type="button"
          onClick={close}
          aria-label="Close"
          className="absolute right-3 top-3 flex size-9 items-center justify-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
        >
          <X className="size-5" weight="bold" />
        </button>
        {children}
      </div>
    </div>
  );
}
