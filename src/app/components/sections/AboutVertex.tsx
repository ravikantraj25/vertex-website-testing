"use client";

import { motion } from "motion/react";

export default function AboutVertex() {
  return (
    <section className="relative w-full overflow-hidden bg-[#080808] px-4 pb-12 pt-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="mb-6 text-[11px] font-bold uppercase tracking-[0.35em] text-[#666]"
        >
          About Vertex
        </motion.p>

        <motion.h2
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.85, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
          className="mb-16 max-w-5xl text-4xl font-bold leading-[1.15] tracking-tight text-white sm:text-5xl lg:text-[4.5rem]"
        >
          Empowering students through{" "}
          <span className="font-light italic text-[#666]">
            creativity, collaboration,
          </span>{" "}
          and community.
        </motion.h2>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col items-start justify-between gap-10 md:flex-row md:items-center"
        >
          <p className="max-w-2xl text-base leading-relaxed text-[#777]">
            A student-led club from the ETE Department at DSCE — where innovation meets
            expression and students grow through <span className="font-semibold text-white">technical excellence, cultural vibrance, and social impact.</span>
          </p>

          <div className="flex flex-wrap gap-4">
            <div className="flex min-w-[120px] flex-col items-center justify-center rounded-2xl border border-white/5 bg-[#111] px-6 py-5">
              <span className="text-lg font-bold text-white">ETE Dept</span>
              <span className="mt-1 text-[10px] font-bold tracking-widest text-[#555]">DSCE</span>
            </div>
            <div className="flex min-w-[120px] flex-col items-center justify-center rounded-2xl border border-white/5 bg-[#111] px-6 py-5">
              <span className="text-lg font-bold text-white">6</span>
              <span className="mt-1 text-[10px] font-bold tracking-widest text-[#555]">DOMAINS</span>
            </div>
            <div className="flex min-w-[120px] flex-col items-center justify-center rounded-2xl border border-white/5 bg-[#111] px-6 py-5">
              <span className="text-lg font-bold text-white">Student</span>
              <span className="mt-1 text-[10px] font-bold tracking-widest text-[#555]">LED CLUB</span>
            </div>
          </div>
        </motion.div>

      </div>
    </section>
  );
}
