"use client";

import { motion } from "motion/react";
import { ArrowUpRight, Calendar, MapPin, Brain, Gamepad2, CircuitBoard, Clapperboard, Plus } from "lucide-react";
import Link from "next/link";
import Image from "next/image";

const upcomingEvent = {
  num: "01",
  title: "LUMOS 2.0",
  subtitle: "Inter-Departmental Fest",
  category: "Cultural & Technical",
  description:
    "A multi-event inter-departmental showdown — where ideas spark, creativity roars, and every department brings its A-game.",
  accent: "#fbbf24",
  date: "11th - 15th March 2026",
  venue: "Dept of ETE",
  subEvents: [
    { label: "Inspire (Ideathon)", Icon: Brain },
    { label: "BGMI", Icon: Gamepad2 },
    { label: "Hardware Escape Room", Icon: CircuitBoard },
    { label: "Reeluminati", Icon: Clapperboard },
    { label: "More", Icon: Plus },
  ],
};

export default function UpcomingEvents() {
  const { accent } = upcomingEvent;

  return (
    <section className="relative w-full bg-black px-4 py-20 sm:px-6 lg:px-8 overflow-hidden">
      {/* Grain texture */}
      <div
        className="pointer-events-none absolute inset-0 opacity-[0.045]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
          backgroundRepeat: "repeat",
          backgroundSize: "128px",
        }}
      />

      {/* Ambient glow */}
      <div
        className="pointer-events-none absolute"
        style={{
          width: "500px",
          height: "500px",
          borderRadius: "50%",
          background: `radial-gradient(circle, ${accent}14 0%, transparent 70%)`,
          top: "50%",
          left: "50%",
          transform: "translate(-50%, -50%)",
          filter: "blur(80px)",
        }}
      />

      <div className="mx-auto max-w-7xl">
      {/* Top rule */}
      <div className="mb-10 flex items-center gap-4 border-t border-white/[0.07] pt-5">
        <span className="shrink-0 text-[10px] font-bold uppercase tracking-[0.35em] text-white/20">
          Vertex Club
        </span>
        <div className="h-px flex-1 bg-white/[0.07]" />
        <span className="shrink-0 text-[10px] font-bold uppercase tracking-[0.35em] text-white/20">
          2025
        </span>
      </div>

      {/* Section label + heading row */}
      <motion.div
        initial={{ opacity: 0, y: 24 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        className="mb-10 flex flex-col gap-3"
      >
        <div className="flex items-center gap-3">
          <div className="h-[2px] w-6 rounded-full" style={{ backgroundColor: accent }} />
          <span
            className="text-[10px] font-bold uppercase tracking-[0.4em]"
            style={{ color: accent }}
          >
            Next Up
          </span>
        </div>
        <h2 className="text-[clamp(1.75rem,5vw,3.5rem)] font-black uppercase leading-tight tracking-tighter text-white">
          Upcoming Event
        </h2>
      </motion.div>

      {/* Card */}
      

      {/* Bottom rule */}
      <div className="mt-12 h-px bg-white/[0.06]" />
      </div>
    </section>
  );
}
