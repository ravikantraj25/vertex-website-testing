'use client'

import { motion } from 'motion/react'
import Image from 'next/image'

export default function Members() {
  return (
    <section className="relative w-full overflow-hidden bg-black px-4 py-24 sm:px-6 lg:px-8">
      {/* Subtle radial glow for atmosphere */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(139,92,246,0.08),transparent_50%)]" />
      
      {/* Grain overlay for texture */}
      <div className="pointer-events-none absolute inset-0 opacity-[0.03] mix-blend-overlay" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }} />

      <div className="relative mx-auto max-w-7xl">
        {/* Header Section */}
        <div className="mb-16 md:mb-24">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
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

        {/* Bento Grid */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-12 md:gap-6 lg:h-[640px]">
          
          {/* Left Large Card - Dr. Iffath Fawad */}
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="group relative flex h-[500px] w-full flex-col justify-end overflow-hidden rounded-[2rem] border border-white/[0.08] bg-[#0a0a0a] md:col-span-12 md:h-[600px] lg:col-span-6 lg:h-full"
          >
            <Image 
              src="/images/members/IffathMaam.png" 
              alt="Dr. Iffath Fawad" 
              fill 
              sizes="(max-width: 768px) 100vw, (max-width: 1024px) 100vw, 50vw"
              className="object-cover object-top transition-transform duration-1000 ease-out group-hover:scale-105" 
            />
            
            {/* Gradient Overlays for depth */}
            <div className="absolute inset-0 bg-gradient-to-t from-black/95 via-black/50 to-transparent transition-opacity duration-500" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-transparent to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
            
            <div className="relative z-10 p-6 sm:p-8 md:p-10 lg:p-12">
              <div className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-1.5 backdrop-blur-md">
                <div className="h-1.5 w-1.5 rounded-full bg-violet-400/80" />
                <span className="text-[10px] font-bold tracking-widest text-white/70 uppercase">
                  Student Coordinator
                </span>
              </div>
              <h3 className="mb-3 text-3xl font-bold tracking-tight text-white md:text-4xl lg:text-5xl">
                Dr. Iffath Fawad
              </h3>
              <p className="max-w-md text-sm leading-relaxed text-white/50 md:text-base">
                Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam.
              </p>
            </div>
          </motion.div>

          {/* Right Side - 3 Cards */}
          <div className="flex flex-col gap-4 md:col-span-12 md:grid md:grid-cols-2 md:gap-6 lg:col-span-6 lg:flex lg:flex-col">
            
            {/* Pranjal Yadav */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.7, delay: 0.1, ease: [0.22, 1, 0.36, 1] }}
              className="group relative flex h-44 flex-1 overflow-hidden rounded-[2rem] border border-white/[0.08] bg-[#0a0a0a] md:col-span-2 md:h-56 lg:h-auto"
            >
              <div className="relative h-full w-[40%] min-w-[140px] shrink-0 overflow-hidden sm:min-w-[180px] md:w-[45%] lg:w-[40%]">
                <Image 
                  src="/images/members/Pranjal.png" 
                  alt="Pranjal Yadav" 
                  fill 
                  sizes="(max-width: 768px) 40vw, (max-width: 1024px) 45vw, 20vw"
                  className="object-cover object-center transition-transform duration-1000 ease-out group-hover:scale-105" 
                />
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#0a0a0a]/50 to-[#0a0a0a]" />
              </div>
              <div className="flex flex-col justify-center px-5 sm:px-8 md:px-10 lg:px-8">
                <span className="mb-2 text-[10px] font-bold tracking-[0.2em] text-violet-400/80 uppercase">
                  Student President
                </span>
                <h3 className="mb-2 text-xl font-bold tracking-tight text-white md:text-3xl lg:text-2xl">
                  Pranjal Yadav
                </h3>
                <p className="text-xs font-medium text-white/40 md:text-sm">
                  Founding Member
                </p>
              </div>
            </motion.div>

            {/* Darshil Mahraur */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.7, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
              className="group relative flex h-40 flex-1 overflow-hidden rounded-[2rem] border border-white/[0.08] bg-[#0a0a0a] md:col-span-1 md:h-48 lg:h-auto lg:flex-row-reverse"
            >
              <div className="relative h-full w-[40%] min-w-[130px] shrink-0 overflow-hidden lg:w-[35%]">
                <Image 
                  src="/images/members/darshil.jpeg" 
                  alt="Darshil Mahraur" 
                  fill 
                  sizes="(max-width: 768px) 40vw, (max-width: 1024px) 50vw, 20vw"
                  className="object-cover object-center transition-transform duration-1000 ease-out group-hover:scale-105" 
                />
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#0a0a0a]/50 to-[#0a0a0a] lg:bg-gradient-to-l" />
              </div>
              <div className="flex flex-col justify-center px-5 lg:w-[65%] lg:items-end lg:text-right">
                <h3 className="mb-1.5 text-lg font-bold tracking-tight text-white md:text-xl lg:text-xl">
                  Darshil Mahraur
                </h3>
                <p className="text-[10px] font-bold tracking-widest text-white/40 uppercase">
                  Founding Member
                </p>
              </div>
            </motion.div>

            {/* Devansh Chandra */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-100px" }}
              transition={{ duration: 0.7, delay: 0.3, ease: [0.22, 1, 0.36, 1] }}
              className="group relative flex h-40 flex-1 overflow-hidden rounded-[2rem] border border-white/[0.08] bg-[#0a0a0a] md:col-span-1 md:h-48 lg:h-auto"
            >
              <div className="relative h-full w-[40%] min-w-[130px] shrink-0 overflow-hidden lg:w-[35%]">
                <Image 
                  src="/images/members/devash.jpeg" 
                  alt="Devansh Chandra" 
                  fill 
                  sizes="(max-width: 768px) 40vw, (max-width: 1024px) 50vw, 20vw"
                  className="object-cover object-center transition-transform duration-1000 ease-out group-hover:scale-105" 
                />
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-[#0a0a0a]/50 to-[#0a0a0a]" />
              </div>
              <div className="flex flex-col justify-center px-5">
                <h3 className="mb-1.5 text-lg font-bold tracking-tight text-white md:text-xl lg:text-xl">
                  Devansh Chandra
                </h3>
                <p className="text-[10px] font-bold tracking-widest text-white/40 uppercase">
                  Founding Member
                </p>
              </div>
            </motion.div>

          </div>
        </div>
      </div>
    </section>
  )
}
