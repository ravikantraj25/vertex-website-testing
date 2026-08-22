"use client";

import { useEffect, useRef, useState } from "react";
import Link from "next/link";

export default function NotFound() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [path, setPath] = useState("/???");

  useEffect(() => {
    setPath(window.location.pathname);
  }, []);

  // Animated starfield / particle background
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

    const PARTICLE_COUNT = 120;
    const particles = Array.from({ length: PARTICLE_COUNT }, () => ({
      x:       Math.random() * window.innerWidth,
      y:       Math.random() * window.innerHeight,
      r:       Math.random() * 1.5 + 0.3,
      dx:      (Math.random() - 0.5) * 0.3,
      dy:      (Math.random() - 0.5) * 0.3,
      opacity: Math.random() * 0.6 + 0.1,
    }));

    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const p of particles) {
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(251, 191, 36, ${p.opacity})`;
        ctx.fill();

        p.x += p.dx;
        p.y += p.dy;
        if (p.x < 0) p.x = canvas.width;
        if (p.x > canvas.width) p.x = 0;
        if (p.y < 0) p.y = canvas.height;
        if (p.y > canvas.height) p.y = 0;
      }
      animId = requestAnimationFrame(draw);
    };
    draw();

    return () => {
      cancelAnimationFrame(animId);
      window.removeEventListener("resize", resize);
    };
  }, []);

  return (
    <div className="relative min-h-screen bg-neutral-950 overflow-hidden flex items-center justify-center">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&family=DM+Serif+Display:ital@0;1&family=DM+Mono:wght@400;500&display=swap');
        .font-bebas   { font-family: 'Bebas Neue', sans-serif; }
        .font-serif   { font-family: 'DM Serif Display', serif; }
        .font-mono-dm { font-family: 'DM Mono', monospace; }

        @keyframes float {
          0%, 100% { transform: translateY(0px) rotate(-1deg); }
          50%       { transform: translateY(-18px) rotate(1deg); }
        }
        @keyframes glitch-1 {
          0%, 100% { clip-path: inset(0 0 95% 0); transform: translate(-4px, 0); }
          20%      { clip-path: inset(30% 0 50% 0); transform: translate(4px, 0); }
          40%      { clip-path: inset(60% 0 20% 0); transform: translate(-2px, 0); }
          60%      { clip-path: inset(80% 0 5% 0);  transform: translate(3px, 0); }
          80%      { clip-path: inset(10% 0 75% 0); transform: translate(-3px, 0); }
        }
        @keyframes glitch-2 {
          0%, 100% { clip-path: inset(50% 0 30% 0); transform: translate(4px, 0); }
          25%      { clip-path: inset(15% 0 70% 0); transform: translate(-4px, 0); }
          50%      { clip-path: inset(70% 0 10% 0); transform: translate(2px, 0); }
          75%      { clip-path: inset(5% 0 85% 0);  transform: translate(-2px, 0); }
        }
        @keyframes scanline {
          0%   { transform: translateY(-100%); }
          100% { transform: translateY(100vh); }
        }
        @keyframes blink {
          0%, 100% { opacity: 1; }
          50%       { opacity: 0; }
        }
        @keyframes fadeUp {
          from { opacity: 0; transform: translateY(24px); }
          to   { opacity: 1; transform: translateY(0); }
        }

        .glitch-wrap { position: relative; display: inline-block; }
        .glitch-wrap::before,
        .glitch-wrap::after {
          content: attr(data-text);
          position: absolute; inset: 0;
          font-family: 'Bebas Neue', sans-serif;
          font-size: inherit; line-height: inherit; color: inherit;
          pointer-events: none;
        }
        .glitch-wrap::before {
          color: #f87171;
          animation: glitch-1 3.5s infinite steps(1);
        }
        .glitch-wrap::after {
          color: #34d399;
          animation: glitch-2 3.5s infinite steps(1);
          animation-delay: 0.1s;
        }

        .scanline {
          position: absolute; inset: 0; pointer-events: none; overflow: hidden; z-index: 10;
        }
        .scanline::after {
          content: '';
          position: absolute; left: 0; right: 0; height: 2px;
          background: rgba(251,191,36,0.04);
          animation: scanline 6s linear infinite;
        }

        .float-anim { animation: float 5s ease-in-out infinite; }

        .fade-up-1 { animation: fadeUp 0.7s ease both; animation-delay: 0.1s; opacity: 0; }
        .fade-up-2 { animation: fadeUp 0.7s ease both; animation-delay: 0.3s; opacity: 0; }
        .fade-up-3 { animation: fadeUp 0.7s ease both; animation-delay: 0.5s; opacity: 0; }
        .fade-up-4 { animation: fadeUp 0.7s ease both; animation-delay: 0.7s; opacity: 0; }

        .cursor-blink { animation: blink 1s step-end infinite; }

        .btn-glow:hover {
          box-shadow: 0 0 24px rgba(251,191,36,0.35), 0 0 48px rgba(251,191,36,0.12);
        }
      `}</style>

      {/* Particle canvas */}
      <canvas ref={canvasRef} className="absolute inset-0 pointer-events-none" style={{ opacity: 0.5 }} />

      {/* Scanline overlay */}
      <div className="scanline" />

      {/* Noise texture overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{ backgroundImage: "url(\"data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")" }}
      />

      {/* Vignette */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: "radial-gradient(ellipse 80% 80% at 50% 50%, transparent 40%, rgba(0,0,0,0.85) 100%)" }}
      />

      {/* Content */}
      <div className="relative z-20 flex flex-col items-center text-center px-6 max-w-2xl mx-auto select-none">

        {/* Error code badge */}
        <div className="fade-up-1 font-mono-dm text-xs text-amber-500/70 tracking-[0.3em] uppercase mb-6 border border-amber-500/20 px-4 py-1.5 rounded-full bg-amber-500/5">
          ERROR · 404 · NOT FOUND
        </div>

        {/* Giant glitching 404 */}
        <div className="fade-up-2 float-anim mb-2">
          <span
            className="glitch-wrap font-bebas text-[clamp(8rem,25vw,18rem)] leading-none text-white"
            data-text="404"
          >
            404
          </span>
        </div>

        {/* Subheading */}
        <h1 className="fade-up-3 font-serif text-2xl sm:text-3xl text-white/90 mb-3 italic">
          Lost in the void
        </h1>

        {/* Terminal-style description */}
        <div className="fade-up-3 font-mono-dm text-sm text-neutral-500 mb-8 bg-neutral-900/60 border border-neutral-800 rounded-xl px-5 py-4 text-left w-full max-w-md">
          <span className="text-amber-400">$</span>{" "}
          <span className="text-neutral-300">resolve</span>{" "}
          <span className="text-red-400">"{path}"</span>
          <br />
          <span className="text-neutral-600">↳ </span>
          <span className="text-red-400">RouteNotFoundError</span>
          <span className="text-neutral-500">: path does not exist on this server</span>
          <br />
          <span className="text-neutral-600">↳ </span>
          <span className="text-neutral-400">suggested fix</span>
          <span className="text-neutral-500">: return to </span>
          <span className="text-amber-400">homepage</span>
          <span className="cursor-blink text-amber-400">_</span>
        </div>

        {/* Actions */}
        <div className="fade-up-4 flex flex-col sm:flex-row gap-3 w-full max-w-sm">
          <Link
            href="/"
            className="btn-glow flex-1 bg-amber-500 hover:bg-amber-400 text-black font-bebas text-xl tracking-widest py-3.5 px-6 rounded-xl transition-all duration-200 text-center"
          >
            Go Home
          </Link>
          <button
            onClick={() => window.history.back()}
            className="flex-1 bg-transparent border border-neutral-700 hover:border-neutral-500 text-neutral-300 hover:text-white font-mono-dm text-sm py-3.5 px-6 rounded-xl transition-all duration-200"
          >
            ← Go Back
          </button>
        </div>

      </div>
    </div>
  );
}