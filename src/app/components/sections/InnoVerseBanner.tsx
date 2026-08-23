"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useEffect, useState } from "react";

export default function InnoVerseBanner() {
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  if (!mounted) return null;

  return (
    <section className="relative w-full overflow-hidden bg-zinc-950 py-20 sm:py-32">
      {/* Background Effects */}
      <div className="absolute inset-0 z-0">
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-amber-500/10 rounded-full blur-[120px] pointer-events-none" />
        <div className="absolute top-0 left-0 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none mix-blend-overlay" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto px-6 lg:px-8 flex flex-col items-center text-center">
        {/* Badge */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="inline-flex items-center gap-2 border border-amber-500/30 bg-amber-500/10 text-amber-400 text-xs font-bold uppercase tracking-[0.2em] px-4 py-2 rounded-full mb-8 shadow-[0_0_20px_rgba(245,158,11,0.2)]"
        >
          <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
          Registrations Open
        </motion.div>

        {/* Title */}
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
          className="text-6xl sm:text-8xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-zinc-500 tracking-tight mb-6"
          style={{ fontFamily: "'Bebas Neue', sans-serif", letterSpacing: "0.05em" }}
        >
          INNOVERSE <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-400 to-amber-600 drop-shadow-[0_0_15px_rgba(245,158,11,0.5)]">2026</span>
        </motion.h1>

        {/* Subtitle */}
        <motion.p
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          className="text-lg sm:text-xl text-zinc-400 max-w-2xl mb-4 leading-relaxed"
        >
          Vertex's flagship technical and cultural fest is here. Explore exciting events, build your team, and showcase your talent.
        </motion.p>

        {/* Deadline Notice */}
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mb-10 text-red-400/90 font-medium text-sm flex items-center gap-2 bg-red-500/10 border border-red-500/20 px-4 py-2 rounded-lg"
        >
          <span>⏳</span> Registrations strictly close on September 25th
        </motion.div>

        {/* CTA Buttons */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          className="flex flex-col sm:flex-row gap-4"
        >
          <Link href="/innoverseRegistration">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 bg-amber-500 text-black text-sm font-bold uppercase tracking-widest rounded-xl shadow-[0_0_30px_rgba(245,158,11,0.4)] transition-all"
            >
              Register Now
            </motion.button>
          </Link>
          <a href="https://drive.google.com/file/d/1DTBWmRSt2gY8iDVAYTbsmnojs7weL9Jt/view?usp=sharing" target="_blank" rel="noopener noreferrer">
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              className="px-8 py-4 bg-zinc-900 border border-zinc-700 text-white text-sm font-bold uppercase tracking-widest rounded-xl hover:bg-zinc-800 hover:border-zinc-600 transition-all"
            >
              View Brochure
            </motion.button>
          </a>
        </motion.div>
      </div>
    </section>
  );
}
