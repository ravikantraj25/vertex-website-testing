"use client";

import { motion } from "motion/react";

export default function AboutVertex() {
  return (
    <section className="relative w-full overflow-hidden bg-[#080808] px-4 pb-0 pt-24 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-7xl">

        <motion.p
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="mb-5 text-[10px] font-bold uppercase tracking-[0.35em] text-white/30"
        >
          About Vertex
        </motion.p>

        <motion.h2
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.85, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
          className="mb-12 max-w-4xl text-4xl font-black leading-[1.1] tracking-tight text-white sm:text-5xl lg:text-[3.75rem]"
        >
          Empowering students through{" "}
          <span className="font-light italic text-white/45">
            creativity, collaboration,
          </span>{" "}
          and community.
        </motion.h2>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.8, delay: 0.12, ease: [0.22, 1, 0.36, 1] }}
          className="grid grid-cols-1 gap-6 md:grid-cols-2 md:gap-16"
        >
          <p className="text-base leading-relaxed text-white/40">
            In a world where learning goes beyond classrooms, Vertex stands as a dynamic student-led club from the ETE Department at DSCE — a space where innovation meets expression, bringing students together through{" "}
            <span className="font-semibold text-white/65">
              technical excellence, cultural vibrance, and social impact.
            </span>
          </p>
          <p className="text-base leading-relaxed text-white/40">
            Driven by curiosity and passion, Vertex encourages students to{" "}
            <span className="font-semibold text-white/65">
              step up, lead, create, and connect
            </span>{" "}
            — shaping a well-rounded college experience rooted in teamwork, exploration, and growth.
          </p>
        </motion.div>

      </div>
    </section>
  );
}
