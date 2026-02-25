"use client";

import { useRef, useEffect, useState, useCallback } from "react";
import {
  useScroll,
  useTransform,
  useMotionValueEvent,
} from "motion/react";

const TOTAL_FRAMES = 298;
const BG = "#0a0a0a";

function frameSrc(i: number) {
  return `/HeroVideo/ezgif-frame-${String(i + 1).padStart(3, "0")}.jpg`;
}

export default function ChipScroll() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [images, setImages] = useState<HTMLImageElement[]>([]);
  const [loaded, setLoaded] = useState(false);
  const [progress, setProgress] = useState(0);
  const frameIdxRef = useRef(-1);
  const rafRef = useRef(0);
  const targetRef = useRef(0);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start start", "end end"],
  });

  const frameIndex = useTransform(
    scrollYProgress,
    [0, 1],
    [0, TOTAL_FRAMES - 1],
  );

  useEffect(() => {
    const arr: HTMLImageElement[] = new Array(TOTAL_FRAMES);
    let n = 0;

    const tick = () => {
      n += 1;
      setProgress(n / TOTAL_FRAMES);
      if (n === TOTAL_FRAMES) {
        setImages(arr);
        setLoaded(true);
      }
    };

    for (let i = 0; i < TOTAL_FRAMES; i++) {
      const img = new Image();
      img.src = frameSrc(i);
      img.onload = tick;
      img.onerror = tick;
      arr[i] = img;
    }
  }, []);

  const paint = useCallback(
    (idx: number) => {
      const cvs = canvasRef.current;
      if (!cvs || images.length === 0) return;
      const ctx = cvs.getContext("2d");
      if (!ctx) return;

      const i = Math.max(0, Math.min(Math.round(idx), TOTAL_FRAMES - 1));
      if (i === frameIdxRef.current) return;
      frameIdxRef.current = i;

      const img = images[i];
      if (!img?.complete || !img.naturalWidth) return;

      // Match canvas resolution to viewport so it always fills the screen
      const W = window.innerWidth;
      const H = window.innerHeight;
      if (cvs.width !== W || cvs.height !== H) {
        cvs.width = W;
        cvs.height = H;
      }

      // Cover-scale: fill the canvas, centered, no letterboxing
      const scale = Math.max(W / img.naturalWidth, H / img.naturalHeight);
      const sw = img.naturalWidth * scale;
      const sh = img.naturalHeight * scale;
      const sx = (W - sw) / 2;
      const sy = (H - sh) / 2;

      ctx.clearRect(0, 0, W, H);
      ctx.drawImage(img, sx, sy, sw, sh);
    },
    [images],
  );

  // Repaint on resize so the cover-scale stays correct
  useEffect(() => {
    const onResize = () => {
      frameIdxRef.current = -1;
      paint(targetRef.current);
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [paint]);

  useMotionValueEvent(frameIndex, "change", (v) => {
    targetRef.current = v;
    if (!rafRef.current) {
      rafRef.current = requestAnimationFrame(() => {
        paint(targetRef.current);
        rafRef.current = 0;
      });
    }
  });

  useEffect(() => {
    if (loaded) {
      frameIdxRef.current = -1;
      paint(0);
    }
  }, [loaded, paint]);


  /* ── render ────────────────────────────────────────────── */

  return (
    <>
      {/* Loading overlay — always rendered, fades out when done */}
      {!loaded && (
        <div
          className="fixed inset-0 z-50 flex flex-col items-center justify-center"
          style={{ background: BG }}
        >
          <div className="relative mb-8 h-12 w-12">
            <div className="absolute inset-0 rounded-full border-2 border-white/5" />
            <div className="absolute inset-0 animate-spin rounded-full border-2 border-transparent border-t-cyan-500" />
          </div>

          <p className="mb-4 text-[10px] font-light uppercase tracking-[0.3em] text-white/40 sm:text-xs">
            Loading
          </p>

          <div className="h-px w-48 overflow-hidden rounded-full bg-white/10">
            <div
              className="h-full bg-gradient-to-r from-cyan-500 to-blue-500 transition-all duration-200"
              style={{ width: `${progress * 100}%` }}
            />
          </div>

          <p className="mt-3 text-[11px] tabular-nums text-white/25">
            {Math.round(progress * 100)}%
          </p>
        </div>
      )}

      {/* Scroll section — always in the DOM so containerRef is hydrated */}
      <section ref={containerRef} className="relative" style={{ height: "400vh" }}>
        <div
          className="sticky top-0 flex h-screen w-full items-center justify-center overflow-hidden"
          style={{ background: BG }}
        >
        {/* canvas */}
        <canvas
          ref={canvasRef}
          className="h-full w-full"
          style={{ background: BG }}
        />

      </div>
    </section>
    </>
  );
}
