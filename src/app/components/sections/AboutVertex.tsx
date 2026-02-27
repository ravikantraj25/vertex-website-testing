"use client";

import { motion } from "motion/react";
import Image from "next/image";

export default function AboutVertex() {
  return (
    <section className="relative w-full overflow-hidden bg-[#080808] px-4 pt-16 pb-12 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl flex flex-col gap-8">

        {/* Label row */}
        <motion.div
          initial={{ opacity: 0, y: 12 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
          className="flex items-center gap-4"
        >
          <span className="text-[11px] font-bold uppercase tracking-[0.35em] text-[#444]">
            About Vertex
          </span>
          <div className="h-px flex-1 bg-white/[0.06]" />
        </motion.div>

        {/* Main row: heading left, logo right */}
        <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:gap-12">

          {/* Left: heading */}
          <motion.h2
            initial={{ opacity: 0, y: 24 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
            className="flex-1 text-4xl font-bold leading-[1.1] tracking-tight text-white sm:text-5xl lg:text-[3.25rem]"
          >
            Empowering students through{" "}
            <span className="font-light italic text-[#555]">
              creativity, collaboration,
            </span>{" "}
            and community.
          </motion.h2>

          {/* Right: logo */}
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            whileInView={{ opacity: 1, scale: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
            className="flex shrink-0 justify-center lg:justify-end"
          >
            <Image
              src="/dsceete.png"
              alt="Dept of ETE, DSCE"
              width={180}
              height={180}
              className="opacity-85"
            />
          </motion.div>
        </div>

        {/* Divider */}
        <div className="h-px bg-white/[0.06]" />

        {/* Bottom row: description left, stats right */}
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.7, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between"
        >
          <p className="max-w-xl text-sm leading-relaxed text-[#666] lg:text-base">
            A student-led club from the ETE Department at DSCE — where innovation meets
            expression and students grow through{" "}
            <span className="font-semibold text-white">
              technical excellence, cultural vibrance, and social impact.
            </span>
          </p>

          <div className="flex gap-3 shrink-0">
            {[
              { label: "ETE Dept", sub: "DSCE" },
              { label: "6", sub: "DOMAINS" },
              { label: "Student", sub: "Led Club" },
            ].map(({ label, sub }) => (
              <div
                key={sub}
                className="flex min-w-[90px] flex-col items-center justify-center rounded-xl border border-white/5 bg-[#111] px-4 py-3"
              >
                <span className="text-sm font-bold text-white">{label}</span>
                <span className="mt-0.5 text-[9px] font-bold tracking-widest text-[#555]">{sub}</span>
              </div>
            ))}
          </div>
        </motion.div>

      </div>
    </section>
  );
}
