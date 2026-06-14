"use client";

import { SpeakerHigh, SpeakerSlash } from "@phosphor-icons/react";
import { useCallback, useRef, useState } from "react";

type PostVideoProps = {
  src: string;
  poster?: string;
  className?: string;
};

export default function PostVideo({ src, poster, className }: PostVideoProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const [muted, setMuted] = useState(true);

  const toggleMute = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    const el = videoRef.current;
    if (!el) {
      return;
    }
    const next = !el.muted;
    el.muted = next;
    setMuted(next);
  }, []);

  return (
    <div className={`relative ${className ?? ""}`}>
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        muted={muted}
        playsInline
        loop
        controls
        className="h-full w-full object-cover"
      />
      <button
        type="button"
        onClick={toggleMute}
        className="absolute bottom-2 right-2 flex size-10 touch-manipulation items-center justify-center rounded-full bg-black/55 text-white backdrop-blur-sm hover:bg-black/70"
        aria-label={muted ? "Unmute video" : "Mute video"}
      >
        {muted ? (
          <SpeakerSlash className="size-5" weight="bold" aria-hidden />
        ) : (
          <SpeakerHigh className="size-5" weight="bold" aria-hidden />
        )}
      </button>
    </div>
  );
}
