"use client";

import { motion } from "motion/react"

const domains = [
  {
    num: "01",
    emoji: "💻",
    name: "Technical",
    description: "Hackathons, workshops, and projects pushing the bleeding edge of technology.",
  },
  {
    num: "02",
    emoji: "🎭",
    name: "Cultural",
    description: "Events and initiatives amplifying art, music, and student expression.",
  },
  {
    num: "03",
    emoji: "📸",
    name: "Media",
    description: "Photography, videography, and storytelling that immortalize every moment.",
  },
  {
    num: "04",
    emoji: "✍️",
    name: "Content",
    description: "Writing, design, and digital content that forges the creative voice of Vertex.",
  },
  {
    num: "05",
    emoji: "📋",
    name: "Organizing",
    description: "The logistical backbone and strategic execution behind every successful initiative.",
  },
  {
    num: "06",
    emoji: "🏆",
    name: "Sports",
    description: "Competitions and activities that forge teamwork, grit, and spirit.",
  },
]

function DomainCard({ domain }) {
  const { num, emoji, name, description } = domain

  return (
    <div className="group relative flex h-[320px] w-[260px] sm:w-[300px] shrink-0 flex-col justify-between overflow-hidden rounded-[2rem] border border-white/[0.04] bg-[#111111] p-6 sm:p-8 transition-all duration-300 hover:scale-[1.02] hover:bg-[#161616] group-hover/marquee:opacity-30 hover:!opacity-100 hover:shadow-2xl">
      <div className="flex items-start justify-between">
        <span className="text-[40px] leading-none transition-transform duration-300 group-hover:scale-110">{emoji}</span>
        <span className="font-mono text-[11px] font-bold tracking-widest text-[#444]">
          {num}
        </span>
      </div>

      <div>
        <h3 className="mb-3 text-[22px] font-bold tracking-tight text-white transition-colors">
          {name}
        </h3>
        <p className="text-[15px] leading-relaxed text-[#777] transition-colors group-hover:text-[#999]">
          {description}
        </p>
      </div>
    </div>
  )
}

function Domains() {
  return (
    <section className="relative w-full overflow-hidden bg-[#080808] pb-16 pt-8 sm:pb-24">
      {/* Left and Right fade masks to blend the marquee smoothly */}
      <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-24 bg-gradient-to-r from-[#080808] to-transparent md:w-48" />
      <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-24 bg-gradient-to-l from-[#080808] to-transparent md:w-48" />

      {/* Marquee Container */}
      <div
        className="group/marquee flex w-fit hover:[animation-play-state:paused]"
        style={{ animation: "marquee 35s linear infinite" }}
      >
        <style>{`
          @keyframes marquee {
            0% { transform: translateX(0%); }
            100% { transform: translateX(-50%); }
          }
        `}</style>
        
        {/* First Set */}
        <div className="flex shrink-0 gap-4 pr-4 md:gap-5 md:pr-5">
          {domains.map((domain) => (
            <DomainCard key={`${domain.name}-1`} domain={domain} />
          ))}
        </div>
        {/* Second Set */}
        <div className="flex shrink-0 gap-4 pr-4 md:gap-5 md:pr-5">
          {domains.map((domain) => (
            <DomainCard key={`${domain.name}-2`} domain={domain} />
          ))}
        </div>
      </div>
    </section>
  )
}

export default Domains
