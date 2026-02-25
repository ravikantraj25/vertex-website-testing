"use client";

import { useEffect, useRef } from "react";

interface ErrorPageProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorPage({ error, reset }: ErrorPageProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Animated "static" / glitch lines background
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    let animId: number;

    const resize = () => {
      canvas.width  = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    const drawStatic = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const lineCount = Math.floor(canvas.height / 3);
      for (let i = 0; i < lineCount; i++) {
        if (Math.random() > 0.97) {
          const y = i * 3;
          const w = Math.random() * canvas.width * 0.4;
          const x = Math.random() * (canvas.width - w);
          ctx.fillStyle = `rgba(239, 68, 68, ${Math.random() * 0.07})`;
          ctx.fillRect(x, y, w, 1.5);
        }
      }
      // Occasional full-width flash
      if (Math.random() > 0.994) {
        const y = Math.random() * canvas.height;
        ctx.fillStyle = `rgba(239,68,68,0.04)`;
        ctx.fillRect(0, y, canvas.width, Math.random() * 6 + 1);
      }
      animId = requestAnimationFrame(drawStatic);
    };
    drawStatic();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  // Log error in dev
  useEffect(() => {
    console.error("[ErrorBoundary]", error);
  }, [error]);

  return (
    <div className="relative min-h-screen bg-neutral-950 overflow-hidden flex items-center justify-center">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Serif+Display:ital@0;1&family=DM+Mono:wght@400;500&display=swap');
        .font-bebas   { font-family: 'Bebas Neue', sans-serif; }
        .font-serif   { font-family: 'DM Serif Display', serif; }
        .font-mono-dm { font-family: 'DM Mono', monospace; }

        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(20px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @keyframes pulseRed {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0.4; }
        }
        @keyframes shake {
          0%, 100% { transform: translateX(0); }
          15%      { transform: translateX(-5px); }
          30%      { transform: translateX(5px); }
          45%      { transform: translateX(-3px); }
          60%      { transform: translateX(3px); }
          75%      { transform: translateX(-1px); }
          90%      { transform: translateX(1px); }
        }
        @keyframes scanline {
          0%   { transform: translateY(-100%); }
          100% { transform: translateY(100vh); }
        }
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0; }
        }
        @keyframes spin-slow {
          from { transform: rotate(0deg); }
          to   { transform: rotate(360deg); }
        }

        .fade-up-1 { animation: fadeUp 0.6s ease both 0.05s; opacity: 0; }
        .fade-up-2 { animation: fadeUp 0.6s ease both 0.2s;  opacity: 0; }
        .fade-up-3 { animation: fadeUp 0.6s ease both 0.35s; opacity: 0; }
        .fade-up-4 { animation: fadeUp 0.6s ease both 0.5s;  opacity: 0; }

        .pulse-red  { animation: pulseRed 2s ease-in-out infinite; }
        .shake-icon { animation: shake 0.6s ease both 0.2s; }

        .scanline-overlay::after {
          content: '';
          position: absolute; left: 0; right: 0; height: 3px;
          background: rgba(239,68,68,0.05);
          animation: scanline 5s linear infinite;
        }

        .cursor-blink { animation: blink 1s step-end infinite; }

        .spin-slow { animation: spin-slow 10s linear infinite; }

        .btn-red-glow:hover {
          box-shadow: 0 0 24px rgba(239,68,68,0.4), 0 0 48px rgba(239,68,68,0.15);
        }
        .btn-neutral-glow:hover {
          box-shadow: 0 0 16px rgba(255,255,255,0.06);
        }
      `}</style>

      {/* Glitch static canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none"/>

      {/* Scanline */}
      <div className="scanline-overlay absolute inset-0 pointer-events-none overflow-hidden"/>

      {/* Radial vignette */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse 90% 80% at 50% 50%, transparent 30%, rgba(0,0,0,0.9) 100%)" }}
      />

      {/* Red corner glow */}
      <div className="absolute top-0 left-0 w-96 h-96 pointer-events-none"
        style={{ background: "radial-gradient(ellipse at top left, rgba(239,68,68,0.08), transparent 70%)" }}
      />
      <div className="absolute bottom-0 right-0 w-96 h-96 pointer-events-none"
        style={{ background: "radial-gradient(ellipse at bottom right, rgba(239,68,68,0.06), transparent 70%)" }}
      />

      {/* Content */}
      <div className="relative z-20 flex flex-col items-center text-center px-6 max-w-2xl mx-auto">

        {/* Status badge */}
        <div className="fade-up-1 flex items-center gap-2 font-mono-dm text-xs text-red-400/80 tracking-[0.25em] uppercase mb-6 border border-red-500/20 px-4 py-1.5 rounded-full bg-red-500/5">
          <span className="pulse-red w-1.5 h-1.5 rounded-full bg-red-500 inline-block"/>
          SYSTEM ERROR · 500 · SERVER FAULT
        </div>

        {/* Icon */}
        <div className="shake-icon fade-up-1 mb-6 relative">
          {/* Spinning ring */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div
              className="spin-slow w-32 h-32 rounded-full border border-dashed border-red-500/20"
            />
          </div>
          <div className="w-24 h-24 rounded-2xl bg-red-950/50 border border-red-800/50 flex items-center justify-center mx-auto backdrop-blur-sm">
            <svg width="44" height="44" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-red-400">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z"/>
            </svg>
          </div>
        </div>

        {/* Heading */}
        <h1 className="fade-up-2 font-bebas text-6xl sm:text-7xl text-white tracking-wider mb-1">
          Someone broke the server, is it you?
        </h1>
        <p className="fade-up-2 font-serif text-lg text-red-300/80 italic mb-6">
          The server encountered an unexpected condition
        </p>

        {/* Error details terminal */}
        <div className="fade-up-3 font-mono-dm text-xs text-left w-full max-w-lg bg-neutral-900/70 border border-neutral-800 rounded-xl overflow-hidden mb-7 backdrop-blur-sm">
          {/* Terminal header */}
          <div className="flex items-center gap-1.5 px-4 py-2.5 border-b border-neutral-800 bg-neutral-900/80">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500/70"/>
            <div className="w-2.5 h-2.5 rounded-full bg-amber-500/40"/>
            <div className="w-2.5 h-2.5 rounded-full bg-green-500/30"/>
            <span className="ml-2 text-neutral-600 text-[10px] tracking-widest">CRASH LOG</span>
          </div>
          {/* Terminal body */}
          <div className="px-5 py-4 flex flex-col gap-1.5">
            <div>
              <span className="text-red-400">✗ UnhandledError</span>
              <span className="text-neutral-500">: {error.message || "An unexpected error occurred"}</span>
            </div>
            {error.digest && (
              <div>
                <span className="text-neutral-600">digest </span>
                <span className="text-amber-400/70">{error.digest}</span>
              </div>
            )}
            <div className="text-neutral-600">
              <span>timestamp </span>
              <span className="text-neutral-500">{new Date().toISOString()}</span>
            </div>
            <div className="mt-1">
              <span className="text-neutral-600">suggested </span>
              <span className="text-green-400">→ retry request or contact support</span>
              <span className="cursor-blink text-neutral-500">_</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="fade-up-4 flex flex-col sm:flex-row gap-3 w-full max-w-sm">
          <button
            onClick={reset}
            className="btn-red-glow flex-1 bg-red-600 hover:bg-red-500 text-white font-bebas text-xl tracking-widest py-3.5 px-6 rounded-xl transition-all duration-200"
          >
            Try Again
          </button>
          <a
            href="/"
            className="btn-neutral-glow flex-1 bg-transparent border border-neutral-700 hover:border-neutral-500 text-neutral-300 hover:text-white font-mono-dm text-sm py-3.5 px-6 rounded-xl transition-all duration-200 text-center"
          >
            ← Go Home
          </a>
        </div>

        <p className="fade-up-4 text-neutral-700 text-xs font-mono-dm mt-6">
          If this keeps happening, contact Harsh at <a href="tel:+918269273139" className="text-amber-500 hover:underline">8269273139</a>
        </p>
      </div>
    </div>
  );
}