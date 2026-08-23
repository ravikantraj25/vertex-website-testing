"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import Navbar from "../components/Navbar";

export default function InnoVerseEventHub() {
  return (
    <div className="min-h-screen bg-black text-zinc-100 selection:bg-amber-500/30 font-sans pb-24">
      <Navbar />

      {/* Header */}
      <section className="relative pt-32 pb-16 px-6 lg:px-8 text-center overflow-hidden">
        <div className="absolute inset-0 z-0">
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[600px] bg-amber-500/10 rounded-full blur-[120px] pointer-events-none" />
          <div className="absolute top-0 left-0 w-full h-full bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20 pointer-events-none mix-blend-overlay" />
        </div>
        
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="relative z-10 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 border border-amber-500/30 bg-amber-500/10 text-amber-400 text-xs font-bold uppercase tracking-[0.2em] px-4 py-2 rounded-full mb-6">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            Registrations Open
          </div>
          <h1 className="text-5xl md:text-7xl font-black text-transparent bg-clip-text bg-gradient-to-b from-white to-zinc-500 tracking-tight mb-6" style={{ fontFamily: "'Bebas Neue', sans-serif", letterSpacing: "0.05em" }}>
            INNOVERSE <span className="text-amber-400">2026</span>
          </h1>
          <p className="text-zinc-400 text-lg md:text-xl leading-relaxed">
            Choose an event below to view its specific guidelines, rules, and to register your team.
          </p>
        </motion.div>
      </section>

      {/* Events Grid */}
      <section className="relative z-10 max-w-5xl mx-auto px-6 lg:px-8">
        <div className="flex flex-col gap-8">
          
          {/* PROTOPITCH */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-6 md:p-10 hover:border-amber-500/30 transition-all">
            <div className="flex flex-col md:flex-row gap-8 justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-3xl">💡</span>
                  <h2 className="text-3xl font-bold text-white">Protopitch</h2>
                  <span className="px-3 py-1 bg-amber-500/10 text-amber-400 text-xs font-bold rounded-full border border-amber-500/20">₹100 / Team</span>
                </div>
                <p className="text-amber-500 text-sm font-semibold uppercase tracking-widest mb-4">Hardware Expo</p>
                <p className="text-zinc-400 text-sm leading-relaxed mb-6">
                  An inter-college hardware exhibition where teams showcase physical engineering prototypes, demonstrate their working hardware, explain their firmware/code, and pitch the real-world applicability of their project.
                </p>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 text-sm text-zinc-300 mb-6">
                  <div><strong className="text-white">Team Size:</strong> 2 to 4 members</div>
                  <div><strong className="text-white">Prize:</strong> 1st: ₹6,000 | 2nd: ₹4,000 | Open: ₹5,000</div>
                  <div><strong className="text-white">Deadline:</strong> 30th September</div>
                  <div><strong className="text-white">Coordinators:</strong> Dhruva Kumar (6361536637)</div>
                </div>

                <div className="bg-zinc-950 rounded-xl p-4 border border-zinc-800/50">
                  <p className="text-xs font-semibold text-amber-400 mb-2 uppercase tracking-wider">Rules</p>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    Teams must build projects from the ground up; plug-and-play assembled kits are prohibited. Hardware must work physically during the live demo. Internal circuitry must be accessible for inspection. Wireless interference and unsafe wiring are prohibited.
                  </p>
                </div>
              </div>
              <div className="flex flex-col justify-end md:w-48 shrink-0">
                <Link href="/innoverseRegistration/protopitch">
                  <button className="w-full py-4 bg-amber-500 hover:bg-amber-400 text-black font-bold uppercase tracking-widest rounded-xl transition-all shadow-[0_0_20px_rgba(245,158,11,0.2)]">
                    Register Now
                  </button>
                </Link>
              </div>
            </div>
          </motion.div>

          {/* EMBEDDED ENIGMA */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-6 md:p-10 hover:border-amber-500/30 transition-all">
            <div className="flex flex-col md:flex-row gap-8 justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-3xl">🧩</span>
                  <h2 className="text-3xl font-bold text-white">Embedded Enigma</h2>
                  <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 text-xs font-bold rounded-full border border-emerald-500/20">Free</span>
                </div>
                <p className="text-amber-500 text-sm font-semibold uppercase tracking-widest mb-4">Hardware Challenge</p>
                <p className="text-zinc-400 text-sm leading-relaxed mb-6">
                  A hardware challenge pushing your embedded systems knowledge to the limit. Solve complex problems and execute flawless hardware integrations.
                </p>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 text-sm text-zinc-300 mb-6">
                  <div><strong className="text-white">Team Size:</strong> 1 to 2 members</div>
                  <div><strong className="text-white">Prize:</strong> TBD</div>
                  <div><strong className="text-white">Deadline:</strong> 30th September</div>
                  <div><strong className="text-white">Coordinators:</strong> Shreyas J (8762485683) <br/> Jyothika S</div>
                </div>

                <div className="bg-zinc-950 rounded-xl p-4 border border-zinc-800/50">
                  <p className="text-xs font-semibold text-amber-400 mb-2 uppercase tracking-wider">Rules</p>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    General Vertex rules apply: outside hardware/tools are prohibited, personal electronic devices must remain stowed during active rounds, internet assistance is prohibited, and collaboration is limited to teammates.
                  </p>
                </div>
              </div>
              <div className="flex flex-col justify-end md:w-48 shrink-0">
                <Link href="/innoverseRegistration/embedded-enigma">
                  <button className="w-full py-4 bg-amber-500 hover:bg-amber-400 text-black font-bold uppercase tracking-widest rounded-xl transition-all shadow-[0_0_20px_rgba(245,158,11,0.2)]">
                    Register Now
                  </button>
                </Link>
              </div>
            </div>
          </motion.div>

          {/* LINE FOLLOWER */}
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-zinc-900/50 border border-zinc-800 rounded-3xl p-6 md:p-10 hover:border-amber-500/30 transition-all">
            <div className="flex flex-col md:flex-row gap-8 justify-between">
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-3xl">🤖</span>
                  <h2 className="text-3xl font-bold text-white">Line Follower</h2>
                  <span className="px-3 py-1 bg-emerald-500/10 text-emerald-400 text-xs font-bold rounded-full border border-emerald-500/20">Free</span>
                </div>
                <p className="text-amber-500 text-sm font-semibold uppercase tracking-widest mb-4">Technical Challenge</p>
                <p className="text-zinc-400 text-sm leading-relaxed mb-6">
                  Design and program a robot capable of autonomously following a specific line path. Speed, accuracy, and engineering execution will determine the winner.
                </p>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-4 text-sm text-zinc-300 mb-6">
                  <div><strong className="text-white">Team Size:</strong> 1 to 2 members</div>
                  <div><strong className="text-white">Prize:</strong> TBD</div>
                  <div><strong className="text-white">Deadline:</strong> 30th September</div>
                  <div><strong className="text-white">Coordinators:</strong> TBD</div>
                </div>

                <div className="bg-zinc-950 rounded-xl p-4 border border-zinc-800/50">
                  <p className="text-xs font-semibold text-amber-400 mb-2 uppercase tracking-wider">Rules</p>
                  <p className="text-xs text-zinc-400 leading-relaxed">
                    General Vertex rules apply. Specific rules and track dimensions will be provided to registered participants prior to the event.
                  </p>
                </div>
              </div>
              <div className="flex flex-col justify-end md:w-48 shrink-0">
                <Link href="/innoverseRegistration/line-follower">
                  <button className="w-full py-4 bg-amber-500 hover:bg-amber-400 text-black font-bold uppercase tracking-widest rounded-xl transition-all shadow-[0_0_20px_rgba(245,158,11,0.2)]">
                    Register Now
                  </button>
                </Link>
              </div>
            </div>
          </motion.div>

        </div>
      </section>
    </div>
  );
}
