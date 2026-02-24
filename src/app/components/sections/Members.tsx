'use client'

import { motion } from 'motion/react'
import Image from 'next/image'

const founders = [
  { id: 1, name: 'Pranjal', role: 'Overall Lead', image: '/founders/pranjal.jpg' },
  { id: 2, name: 'Darshil', role: 'Technical Lead', image: '/founders/darshil.jpg' },
  { id: 3, name: 'Amogh', role: 'Media Lead', image: '/founders/amogh.jpg' },
  { id: 4, name: 'Aryan', role: 'Events Lead', image: '/founders/aryan.jpg' },
  { id: 5, name: 'Sneha', role: 'Design Lead', image: '/founders/sneha.jpg' },
]

export default function Members() {
  return (
    <section className="relative w-full overflow-hidden bg-[#080808] px-4 py-24 sm:px-6 lg:px-8">
      {/* Subtle radial glow */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_50%_at_70%_50%,rgba(139,92,246,0.05),transparent)]" />

      <div className="relative mx-auto max-w-7xl">
        {/* Header */}
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
          className="mb-5 text-[10px] font-bold uppercase tracking-[0.35em] text-white/30"
        >
          The Team
        </motion.p>

        <div className="mb-14 grid grid-cols-1 gap-x-12 gap-y-6 lg:grid-cols-2 lg:items-end">
          <motion.h2
            initial={{ opacity: 0, y: 28 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.85, delay: 0.05, ease: [0.22, 1, 0.36, 1] }}
            className="text-4xl font-black leading-[1.1] tracking-tight text-white sm:text-5xl lg:text-[3.75rem]"
          >
            Meet the{' '}
            <span className="font-light italic text-white/40">Founders</span>
          </motion.h2>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, delay: 0.15, ease: [0.22, 1, 0.36, 1] }}
            className="text-base leading-relaxed text-white/40 lg:pb-1"
          >
            A team of passionate visionaries united by creativity, leadership, and a shared mission to shape a vibrant, inclusive community at Vertex.
          </motion.p>
        </div>

        {/* Scrollable cards row */}
        <div className="overflow-x-auto pb-4" style={{ scrollbarWidth: 'thin', scrollbarColor: '#a855f7 rgba(255,255,255,0.05)' }}>
          <div className="flex gap-4 min-w-max">
            {founders.map((founder, index) => (
              <motion.div
                key={founder.id}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-40px' }}
                transition={{ duration: 0.7, delay: index * 0.08, ease: [0.22, 1, 0.36, 1] }}
                className="group relative w-72 flex-shrink-0 overflow-hidden rounded-2xl border border-white/[0.07] bg-white/[0.02] transition-all duration-500 hover:border-purple-500/25 hover:bg-white/[0.04]"
                style={{ boxShadow: 'none' }}
                whileHover={{ y: -4 }}
              >
                {/* Top accent line */}
                <div className="absolute left-0 top-0 h-[1px] w-full origin-left bg-gradient-to-r from-purple-500/60 to-transparent opacity-0 transition-all duration-500 group-hover:opacity-100" />

                {/* Image area */}
                <div className="relative aspect-[3/4] w-full overflow-hidden bg-white/[0.03]">
                  <Image
                    src={founder.image}
                    alt={founder.name}
                    fill
                    className="object-cover object-top transition-transform duration-700 group-hover:scale-105"
                    onError={(e) => {
                      (e.currentTarget as HTMLImageElement).style.display = 'none'
                    }}
                  />
                  {/* Fallback initial */}
                  <div className="absolute inset-0 flex items-center justify-center text-7xl font-black text-white/[0.06] select-none">
                    {founder.name[0]}
                  </div>
                  {/* Bottom gradient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-[#080808] via-[#080808]/20 to-transparent" />
                </div>

                {/* Info */}
                <div className="p-5">
                  <h3 className="text-lg font-bold tracking-tight text-white/90">
                    {founder.name}
                  </h3>
                  <p className="mt-1 text-xs font-semibold uppercase tracking-widest text-purple-400/70">
                    {founder.role}
                  </p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}