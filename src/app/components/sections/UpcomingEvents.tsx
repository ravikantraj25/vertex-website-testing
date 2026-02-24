"use client";

import { motion } from "motion/react";
import { ArrowUpRight, Calendar, MapPin, Brain, Layers, Clapperboard, FileText, Trophy } from "lucide-react";

const upcomingEvent = {
  num: "01",
  title: "LUMOS 2.0",
  subtitle: "Inter-Departmental Fest",
  category: "Cultural & Technical",
  description:
    "A multi-event inter-departmental showdown — where ideas spark, creativity roars, and every department brings its A-game.",
  accent: "#fbbf24",
  date: "Coming Soon",
  venue: "Main Campus",
  subEvents: [
    { label: "Ideathon", Icon: Brain },
    { label: "Design Competition", Icon: Layers },
    { label: "Reel Creation", Icon: Clapperboard },
    { label: "Content Writing", Icon: FileText },
    { label: "Volleyball", Icon: Trophy },
  ],
};

export default function UpcomingEvents() {
  const { accent } = upcomingEvent;

  return (
    <section className="relative w-full bg-black px-6 py-20 sm:px-10 lg:px-20 overflow-hidden">
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
      <motion.div
        initial={{ opacity: 0, y: 50 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 1, ease: [0.22, 1, 0.36, 1], delay: 0.1 }}
        className="group relative"
      >
        {/* Hover border glow */}
        <div
          className="absolute -inset-px rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"
          style={{
            background: `linear-gradient(135deg, ${accent}44 0%, transparent 55%)`,
          }}
        />

        {/* Card body */}
        <div
          className="relative rounded-2xl border border-white/[0.08] bg-white/[0.02] p-7 md:p-10 overflow-hidden"
          style={{ boxShadow: "0 40px 80px -20px rgba(0,0,0,0.7)" }}
        >
          {/* Inner grain */}
          <div
            className="pointer-events-none absolute inset-0 opacity-[0.03] rounded-2xl"
            style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")`,
              backgroundSize: "200px",
            }}
          />

          {/* Right edge stripe */}
          <div
            className="pointer-events-none absolute top-0 right-0 h-full w-[1px] opacity-15 group-hover:opacity-35 transition-opacity duration-500"
            style={{ background: `linear-gradient(to bottom, transparent, ${accent}, transparent)` }}
          />

          {/* Top row: number + category + badge */}
          <div className="relative flex items-center justify-between mb-6 flex-wrap gap-3">
            <span
              className="font-mono text-[11px] font-bold tracking-[0.3em] uppercase"
              style={{ color: accent + "88" }}
            >
              {upcomingEvent.num} &mdash; {upcomingEvent.category}
            </span>
            <span
              className="rounded-full border px-3 py-1 text-[10px] font-bold uppercase tracking-widest"
              style={{
                borderColor: accent + "44",
                color: accent + "cc",
                backgroundColor: accent + "0d",
              }}
            >
              Registration Open
            </span>
          </div>

          {/* Titles */}
          <div className="relative mb-6">
            <h3 className="text-[clamp(3rem,10vw,7.5rem)] font-black uppercase leading-[0.85] tracking-tighter text-white">
              {upcomingEvent.title}
            </h3>
            <p
              className="mt-2 text-sm font-bold uppercase tracking-[0.25em]"
              style={{ color: accent + "aa" }}
            >
              {upcomingEvent.subtitle}
            </p>
          </div>

          {/* Divider */}
          <div
            className="relative mb-6 h-px"
            style={{ background: `linear-gradient(to right, ${accent}44, transparent)` }}
          />

          {/* Sub-events */}
          <div className="relative mb-8">
            <p className="mb-3 text-[10px] font-bold uppercase tracking-[0.35em] text-white/25">
              Events
            </p>
            <div className="flex flex-wrap gap-2">
              {upcomingEvent.subEvents.map((ev) => (
                <motion.div
                  key={ev.label}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  viewport={{ once: true }}
                  whileHover={{ scale: 1.04 }}
                  transition={{ duration: 0.25 }}
                  className="flex items-center gap-2 rounded-full border px-3.5 py-1.5 text-xs font-semibold cursor-default"
                  style={{
                    borderColor: accent + "35",
                    backgroundColor: accent + "0e",
                    color: accent + "cc",
                  }}
                >
                  <ev.Icon className="h-3 w-3" style={{ color: accent + "99" }} />
                  {ev.label}
                </motion.div>
              ))}
            </div>
          </div>

          {/* Description + meta */}
          <div className="relative flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <p className="max-w-md text-sm leading-relaxed text-white/35 md:text-base">
              {upcomingEvent.description}
            </p>

            <div className="flex flex-col gap-2.5 md:items-end shrink-0">
              <div className="flex items-center gap-2 text-white/30 text-xs">
                <Calendar className="h-3 w-3" style={{ color: accent + "88" }} />
                <span>{upcomingEvent.date}</span>
              </div>
              <div className="flex items-center gap-2 text-white/30 text-xs">
                <MapPin className="h-3 w-3" style={{ color: accent + "88" }} />
                <span>{upcomingEvent.venue}</span>
              </div>
            </div>
          </div>

          {/* CTA */}
          <div className="relative mt-8 flex items-center justify-between flex-wrap gap-4">
            <button
              className="group/btn flex items-center gap-2 rounded-full px-5 py-2.5 text-xs font-bold uppercase tracking-widest transition-all duration-300"
              style={{ backgroundColor: accent, color: "#000" }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLButtonElement).style.boxShadow = `0 0 28px ${accent}55`;
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLButtonElement).style.boxShadow = "none";
              }}
            >
              Register Now
              <ArrowUpRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover/btn:translate-x-0.5 group-hover/btn:-translate-y-0.5" />
            </button>

            <span className="text-[10px] font-bold uppercase tracking-[0.35em] text-white/15">
              Vertex Club &mdash; 2025
            </span>
          </div>
        </div>
      </motion.div>

      {/* Bottom rule */}
      <div className="mt-12 h-px bg-white/[0.06]" />
    </section>
  );
}
