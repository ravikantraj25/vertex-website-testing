'use client'

import { useState } from 'react'
import { motion, AnimatePresence } from 'motion/react'
import Image from 'next/image'

const iffathMessage = [
  `It is with immense pride and gratitude that I thank the Department of Electronics & Telecommunication Engineering, Dayananda Sagar College of Engineering, for entrusting me with the responsibility of supporting and guiding the Students Club-VERTEX. Being part of this journey is both an honour and a privilege.`,
  `I extend my heartfelt congratulations to our students (Batch 2022-26) who pioneered Vertex. What began as a vision in their minds has now grown into a vibrant platform of learning, leadership, and innovation. Their courage to initiate and their commitment to sustain this student club will always remain the foundation on which Vertex stands. I wish them continued success. May they carry the spirit of Vertex wherever they go.`,
  `Built through determination, teamwork, and perseverance, Vertex stands today as a testament to what committed students can achieve together. It is a movement of curiosity, creativity, and collaboration. It provides a space where ideas are discussed fearlessly, skills are sharpened practically, and leadership is cultivated naturally. Through technical events, extra-curricular activities, workshops, competitions, and collaborative initiatives, Vertex bridges classroom knowledge with real-world challenges.`,
  `For every student enrolling, Vertex offers an empowering environment to explore ideas, experiment boldly, develop leadership skills, and build meaningful networks. It is a space where curiosity is encouraged, creativity is celebrated, and growth is continuous.`,
  `Looking ahead, we envision expanding Vertex into a center of excellence for student innovation — initiating interdisciplinary projects, industry-sponsored challenges, research-driven activities, technical publications, skill-enhancement programs, and national-level collaborations. With collective effort and sustained enthusiasm, Vertex will continue to evolve as a platform that shapes confident, competent, and future-ready professionals.`,
  `Let us continue to learn, lead, and light the path forward — together.`,
]

const founders = [
  {
    name: 'Pranjal Yadav',
    badge: 'Student President',
    src: '/images/members/Pranjal.png',
    objectPosition: 'object-top',
    index: '01',
  },
  {
    name: 'Darshil Mahraur',
    badge: null,
    src: '/images/members/darshil.jpeg',
    objectPosition: 'object-center',
    index: '02',
  },
  {
    name: 'Devesh Chandra',
    badge: null,
    src: '/images/members/devash.jpeg',
    objectPosition: 'object-center',
    index: '03',
  },
  {
    name: 'Asadullah M A Ansari',
    badge: null,
    src: '/images/members/Asad.JPG',
    objectPosition: 'object-center',
    index: '04',
  },
]

export default function Members() {
  const [messageOpen, setMessageOpen] = useState(false)

  return (
    <section className="relative w-full overflow-hidden bg-black px-4 py-24 sm:px-6 lg:px-8">
      {/* Radial glow */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_60%_40%_at_50%_0%,rgba(139,92,246,0.10),transparent_60%)]" />
      {/* Grain */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.035] mix-blend-overlay" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22n%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.75%22 numOctaves=%224%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23n)%22/%3E%3C/svg%3E")' }} />

      {/* Message Modal */}
      <AnimatePresence>
        {messageOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6"
            onClick={() => setMessageOpen(false)}
          >
            <div className="absolute inset-0 bg-black/80 backdrop-blur-md" />
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: 16 }}
              transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="relative w-full max-w-2xl overflow-hidden rounded-[2rem] border border-white/[0.08] bg-[#0d0d0d]"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-violet-500/40 to-transparent" />
              <div className="flex items-start justify-between border-b border-white/[0.06] px-6 py-5 sm:px-8 sm:py-6">
                <div>
                  <span className="mb-1 block text-[10px] font-bold tracking-[0.25em] text-violet-400/80 uppercase">Message from</span>
                  <h3 className="text-xl font-bold tracking-tight text-white">Dr. Iffath Fawad</h3>
                  <p className="mt-0.5 text-xs text-white/40">Student Affairs Coordinator · Assistant Professor, Dept. of ETE, DSCE</p>
                </div>
                <button
                  onClick={() => setMessageOpen(false)}
                  className="ml-4 flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/5 text-white/50 transition-colors hover:bg-white/10 hover:text-white"
                  aria-label="Close"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              </div>
              <div className="max-h-[60vh] overflow-y-auto px-6 py-6 sm:px-8 sm:py-8">
                <div className="space-y-4">
                  {iffathMessage.map((para, i) => (
                    <p key={i} className={`text-sm leading-relaxed sm:text-[0.9375rem] ${i === iffathMessage.length - 1 ? 'font-medium text-white/80' : 'text-white/60'}`}>
                      {para}
                    </p>
                  ))}
                </div>
                <div className="mt-8 border-t border-white/[0.06] pt-6">
                  <p className="text-sm font-semibold text-white">Dr. Iffath Fawad</p>
                  <p className="mt-1 text-xs text-white/40">Student Affairs Coordinator</p>
                  <p className="text-xs text-white/40">Assistant Professor</p>
                  <p className="text-xs text-white/40">Dept. of ETE, DSCE</p>
                </div>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="relative mx-auto max-w-7xl">
        {/* Header */}
        <div className="mb-16 md:mb-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col items-start gap-4 md:flex-row md:items-end md:justify-between"
          >
            <div className="max-w-2xl">
              <span className="mb-6 inline-block text-[11px] font-bold tracking-[0.3em] text-white/40 uppercase">
                Leadership
              </span>
              <h2 className="text-4xl font-black leading-[1.05] tracking-tight text-white sm:text-5xl md:text-6xl lg:text-[4.5rem]">
                Meet the{' '}
                <span className="font-light italic text-white/50">Founders</span>
              </h2>
            </div>
            <p className="mt-6 max-w-md text-sm leading-relaxed text-white/40 md:mt-0 md:text-base">
              A team of passionate visionaries united by creativity, leadership, and a shared mission to shape a vibrant, inclusive community at Vertex.
            </p>
          </motion.div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 gap-4 lg:grid-cols-[5fr_7fr] lg:gap-5 lg:items-stretch">

          {/* Left — Dr. Iffath hero portrait */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-100px' }}
            transition={{ duration: 0.9, ease: [0.22, 1, 0.36, 1] }}
            className="group relative h-[560px] overflow-hidden rounded-[2rem] border border-white/[0.07] bg-[#0a0a0a] lg:h-[700px]"
          >
            <Image
              src="/images/members/De.Iffath.jpeg"
              alt="Dr. Iffath Fawad"
              fill
              sizes="(max-width: 1024px) 100vw, 42vw"
              className="object-cover object-top transition-transform duration-[1.2s] ease-out group-hover:scale-[1.04]"
            />
            {/* deep bottom gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
            {/* left-edge vignette */}
            <div className="absolute inset-0 bg-gradient-to-r from-black/30 to-transparent" />

            {/* Decorative corner index */}
            <div className="absolute right-6 top-6 font-mono text-[11px] font-bold tracking-widest text-white/15">00</div>

            {/* Bottom content */}
            <div className="absolute inset-x-0 bottom-0 p-7 sm:p-9 lg:p-10">
              {/* thin violet rule */}
              <div className="mb-5 h-px w-12 bg-gradient-to-r from-violet-500/60 to-transparent" />
              <h3 className="mb-4 text-4xl font-black leading-none tracking-tight text-white sm:text-5xl lg:text-[3.25rem]">
                Dr. Iffath Fawad
              </h3>
              <div className="flex flex-wrap items-center gap-2.5">
                <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.07] px-4 py-2 backdrop-blur-md">
                  <div className="h-1.5 w-1.5 rounded-full bg-violet-400/80" />
                  <span className="text-[10px] font-bold tracking-widest text-white/70 uppercase">Student Coordinator</span>
                </div>
                <button
                  onClick={() => setMessageOpen(true)}
                  className="group/btn inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/[0.07] px-4 py-2 text-[10px] font-bold tracking-widest text-white/70 uppercase backdrop-blur-md transition-all duration-300 hover:border-violet-500/40 hover:bg-violet-500/10 hover:text-white"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="transition-transform duration-300 group-hover/btn:translate-x-0.5">
                    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  </svg>
                  Read Message
                </button>
              </div>
            </div>
          </motion.div>

          {/* Right — 2×2 portrait grid */}
          <div className="grid grid-cols-2 gap-4 lg:gap-5 lg:h-full">
            {founders.map((f, i) => (
              <motion.div
                key={f.name}
                initial={{ opacity: 0, y: 24 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '-80px' }}
                transition={{ duration: 0.75, delay: 0.08 * (i + 1), ease: [0.22, 1, 0.36, 1] }}
                className="group relative overflow-hidden rounded-[1.5rem] border border-white/[0.07] bg-[#0a0a0a]"
                style={{ minHeight: '220px' }}
              >
                <Image
                  src={f.src}
                  alt={f.name}
                  fill
                  sizes="(max-width: 768px) 50vw, (max-width: 1024px) 50vw, 29vw"
                  className={`object-cover ${f.objectPosition} transition-transform duration-[1.2s] ease-out group-hover:scale-[1.06]`}
                />

                {/* Gradient: strong at bottom, very light at top */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/20 to-transparent" />

                {/* Hover — thin violet top line reveal */}
                <div className="absolute inset-x-0 top-0 h-[2px] origin-left scale-x-0 bg-gradient-to-r from-violet-500/80 via-violet-400/50 to-transparent transition-transform duration-500 group-hover:scale-x-100" />

                {/* Index number */}
                <div className="absolute right-4 top-4 font-mono text-[10px] font-bold tracking-widest text-white/20">
                  {f.index}
                </div>

                {/* Name block */}
                <div className="absolute inset-x-0 bottom-0 p-4 sm:p-5">
                  {f.badge && (
                    <span className="mb-1.5 block text-[9px] font-bold tracking-[0.22em] text-violet-400/90 uppercase">
                      {f.badge}
                    </span>
                  )}
                  <h3 className="text-sm font-bold leading-tight tracking-tight text-white sm:text-base lg:text-[0.95rem]">
                    {f.name}
                  </h3>
                  <p className="mt-1 text-[9px] font-bold tracking-widest text-white/35 uppercase">
                    Founding Member
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
