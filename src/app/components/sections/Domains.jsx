"use client";

import { useState } from "react"
import { motion } from "motion/react"
import CpuIcon from "@/components/ui/cpu-icon"
import DrumIcon from "@/components/ui/drum-icon"
import CameraIcon from "@/components/ui/camera-icon"
import PenIcon from "@/components/ui/pen-icon"
import CopyIcon from "@/components/ui/copy-icon"
import TrophyIcon from "@/components/ui/trophy-icon"

const domains = [
  {
    num: "01",
    Icon: CpuIcon,
    name: "Technical",
    description: "Hackathons, workshops, and projects pushing the bleeding edge of technology.",
    hex: "#22d3ee",
    className: "md:col-span-2 md:row-span-1",
  },
  {
    num: "02",
    Icon: DrumIcon,
    name: "Cultural",
    description: "Events and initiatives amplifying art, music, and student expression.",
    hex: "#c084fc",
    className: "md:col-span-1 md:row-span-2",
  },
  {
    num: "03",
    Icon: CameraIcon,
    name: "Media",
    description: "Photography, videography, and storytelling that immortalize every moment.",
    hex: "#f472b6",
    className: "md:col-span-1 md:row-span-1",
  },
  {
    num: "04",
    Icon: PenIcon,
    name: "Content",
    description: "Writing, design, and digital content that forges the creative voice of Vertex.",
    hex: "#facc15",
    className: "md:col-span-1 md:row-span-1",
  },
  {
    num: "05",
    Icon: CopyIcon,
    name: "Organizing",
    description: "The logistical backbone and strategic execution behind every successful initiative.",
    hex: "#fb923c",
    className: "md:col-span-2 md:row-span-1",
  },
  {
    num: "06",
    Icon: TrophyIcon,
    name: "Sports",
    description: "Competitions and activities that forge teamwork, grit, and spirit.",
    hex: "#4ade80",
    className: "md:col-span-1 md:row-span-1",
  },
]

function DomainCard({ domain, index }) {
  const [hovered, setHovered] = useState(false)
  const { num, Icon, name, description, hex, className } = domain

  return (
    <motion.div
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-50px" }}
      transition={{ delay: index * 0.08, duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={`group relative overflow-hidden rounded-2xl border bg-[#161616] p-7 transition-all duration-500 ${className}`}
      style={{
        borderColor: hovered ? `${hex}40` : "rgba(255,255,255,0.10)",
        boxShadow: hovered
          ? `0 0 40px ${hex}18, inset 0 0 40px ${hex}06`
          : "0 2px 24px rgba(0,0,0,0.6)",
      }}
    >
      {/* Top accent line */}
      <div
        className="absolute left-0 top-0 h-[2px] w-full origin-left transition-all duration-500"
        style={{
          background: `linear-gradient(to right, ${hex}, transparent)`,
          transform: hovered ? "scaleX(1)" : "scaleX(0.3)",
          opacity: hovered ? 1 : 0.4,
        }}
      />

      {/* Backdrop icon */}
      <div
        className="pointer-events-none absolute -bottom-6 -right-6 transition-all duration-700 ease-out group-hover:scale-110"
        style={{ opacity: hovered ? 0.07 : 0.03 }}
      >
        <Icon size={180} color={hex} strokeWidth={1} />
      </div>

      {/* Radial glow */}
      <div
        className="pointer-events-none absolute inset-0 transition-opacity duration-700"
        style={{
          background: `radial-gradient(ellipse at top left, ${hex}12 0%, transparent 60%)`,
          opacity: hovered ? 1 : 0,
        }}
      />

      <div className="relative z-10 flex h-full flex-col justify-between">
        {/* Top row */}
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <span
              className="font-mono text-[10px] font-bold tracking-widest transition-colors duration-300"
              style={{ color: hovered ? hex : "rgba(255,255,255,0.2)" }}
            >
              {num}
            </span>
            <div
              className="flex h-10 w-10 items-center justify-center rounded-xl border transition-all duration-500"
              style={{
                borderColor: hovered ? `${hex}40` : "rgba(255,255,255,0.08)",
                backgroundColor: hovered ? `${hex}15` : "rgba(255,255,255,0.03)",
              }}
            >
              <Icon size={20} color={hovered ? hex : "rgba(255,255,255,0.4)"} />
            </div>
          </div>
          <svg
            className="h-4 w-4 transition-all duration-500"
            style={{
              color: hovered ? hex : "rgba(255,255,255,0.15)",
              transform: hovered ? "translate(2px, -2px)" : "translate(0,0)",
              opacity: hovered ? 1 : 0.5,
            }}
            viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}
          >
            <path d="M7 17L17 7M17 7H7M17 7v10" />
          </svg>
        </div>

        {/* Bottom text */}
        <div>
          <h3
            className="mb-2 text-2xl font-bold tracking-tight transition-colors duration-300"
            style={{ color: hovered ? "#ffffff" : "rgba(255,255,255,0.85)" }}
          >
            {name}
          </h3>
          <p
            className="text-sm leading-relaxed transition-colors duration-300"
            style={{ color: hovered ? "rgba(255,255,255,0.6)" : "rgba(255,255,255,0.35)" }}
          >
            {description}
          </p>
        </div>
      </div>

      {/* Bottom edge glow */}
      <div
        className="absolute bottom-0 left-8 right-8 h-px transition-opacity duration-500"
        style={{
          background: `linear-gradient(to right, transparent, ${hex}60, transparent)`,
          opacity: hovered ? 1 : 0,
        }}
      />
    </motion.div>
  )
}

function Domains() {
  return (
    <section className="relative w-full overflow-hidden bg-[#080808] px-4 py-24 sm:px-6 lg:px-8">

      {/* Top fade */}
      <div className="pointer-events-none absolute inset-x-0 top-0 h-32 bg-gradient-to-b from-black to-transparent" />
      {/* Bottom fade */}
      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-black to-transparent" />

      <div className="mx-auto max-w-7xl">

        {/* ── Bento Grid ─────────────────────────────────── */}
        <div className="grid grid-cols-1 gap-3 md:auto-rows-[260px] md:grid-cols-3">
          {domains.map((domain, i) => (
            <DomainCard key={domain.name} domain={domain} index={i} />
          ))}
        </div>

      </div>
    </section>
  )
}

export default Domains
