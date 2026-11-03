"use client";

import Image from "next/image";
import { Volume2, VolumeX } from "lucide-react";
import { useRef, useState } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { GlowCard } from "@/components/ui/spotlight-card";

export default function PortraitVideo() {
  const video = useRef<HTMLVideoElement>(null);
  const [flipped, setFlipped] = useState(false);
  const [failed, setFailed] = useState(false);
  const [muted, setMuted] = useState(false);
  const reduced = useReducedMotion();

  function returnToPhoto() {
    video.current?.pause();
    setFlipped(false);
  }

  return (
    <GlowCard className="greeting-portrait portrait-video" customSize>
      <button
        type="button"
        className="portrait-video-trigger"
        aria-label={
          flipped ? "Return to portrait" : "Play Aneeq’s portrait video"
        }
        aria-pressed={flipped}
        onClick={() => {
          if (flipped) returnToPhoto();
          else {
            setFailed(false);
            setFlipped(true);
            if (video.current) {
              video.current.currentTime = 0;
              video.current.muted = muted;
              // Start within the tap gesture so mobile browsers allow audio.
              void video.current.play().catch(() => {
                setFailed(true);
                returnToPhoto();
              });
            }
          }
        }}
      >
        <motion.span
          className="portrait-video-flipper"
          initial={false}
          animate={{ rotateY: flipped ? 180 : 0 }}
          transition={{
            duration: reduced ? 0 : 0.65,
            ease: [0.22, 1, 0.36, 1],
          }}
        >
          <span className="portrait-video-face portrait-video-front">
            <Image
              className="greeting-portrait-image"
              src="/aneeq-pixel-to-4k.gif"
              alt="Animated portrait of Aneeq resolving from pixels into detail"
              width={144}
              height={144}
              unoptimized
            />
          </span>
          <span
            className="portrait-video-face portrait-video-back"
            aria-hidden="true"
          >
            <video
              ref={video}
              src="/videos/aneeq-portrait.mp4"
              poster="/aneeq-pixel-to-4k.gif"
              preload="metadata"
              muted={muted}
              playsInline
              tabIndex={-1}
              onEnded={returnToPhoto}
              onError={() => {
                setFailed(true);
                returnToPhoto();
              }}
            />
          </span>
        </motion.span>
      </button>
      {flipped && (
        <button
          type="button"
          className="portrait-video-sound"
          aria-label={muted ? "Unmute portrait video" : "Mute portrait video"}
          aria-pressed={muted}
          onClick={() => {
            const next = !muted;
            if (video.current) video.current.muted = next;
            setMuted(next);
          }}
        >
          {muted ? (
            <VolumeX size={14} aria-hidden="true" />
          ) : (
            <Volume2 size={14} aria-hidden="true" />
          )}
        </button>
      )}
      {failed && (
        <span className="sr-only" role="status">
          The portrait video couldn’t play. Please try again.
        </span>
      )}
    </GlowCard>
  );
}
