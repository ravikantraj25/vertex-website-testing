"use client";

import { motion } from "motion/react";
import Image from "next/image";

const navLinks = [
  { label: "Home", href: "#" },
  { label: "About", href: "#about" },
  { label: "Members", href: "#members" },
  { label: "Contact", href: "#contact" },
];

const socials = [
  {
    label: "Instagram",
    href: "https://www.instagram.com/vertex_ete/",
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
        <path d="M12 2.2c3.2 0 3.6 0 4.9.1 3.2.1 4.8 1.7 4.9 4.9.1 1.3.1 1.7.1 4.9s0 3.6-.1 4.9c-.1 3.2-1.7 4.8-4.9 4.9-1.3.1-1.7.1-4.9.1s-3.6 0-4.9-.1c-3.2-.1-4.8-1.7-4.9-4.9C2.2 15.6 2.2 15.2 2.2 12s0-3.6.1-4.9c.1-3.2 1.7-4.8 4.9-4.9C8.4 2.2 8.8 2.2 12 2.2zm0 3.5a6.3 6.3 0 100 12.6 6.3 6.3 0 000-12.6zm0 10.4a4.1 4.1 0 110-8.2 4.1 4.1 0 010 8.2zm6.5-11.1a1.47 1.47 0 100 2.94 1.47 1.47 0 000-2.94z" />
      </svg>
    ),
  },
  {
    label: "LinkedIn",
    href: "https://www.linkedin.com/company/vertex-et-dsce/",
    icon: (
      <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
        <path d="M4.98 3.5a2.5 2.5 0 110 5 2.5 2.5 0 010-5zM3 9h4v12H3V9zm7 0h3.8v1.7h.1a4.2 4.2 0 013.8-2.1c4 0 4.7 2.6 4.7 6v6.4h-4v-5.7c0-1.4 0-3.2-2-3.2s-2.3 1.5-2.3 3.1v5.8h-4V9z" />
      </svg>
    ),
  },
];

const Contact = () => {
  return (
    <section id="contact" className="relative w-full overflow-hidden bg-[#080808]">
      {/* Top divider */}
      <div className="h-px w-full bg-white/[0.06]" />

      {/* Subtle radial glow */}
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(ellipse_70%_60%_at_50%_100%,rgba(139,92,246,0.07),transparent)]" />

      <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {/* Main CTA block */}
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          transition={{ duration: 0.85, ease: [0.22, 1, 0.36, 1] }}
          className="flex flex-col items-center py-24 text-center"
        >
          <p className="mb-5 text-[10px] font-bold uppercase tracking-[0.35em] text-white/25">
            Vertex Club · ETE · DSCE
          </p>
          <h2 className="mb-6 max-w-3xl text-4xl font-black leading-[1.05] tracking-tight text-white sm:text-5xl lg:text-[3.5rem]">
            Be part of something{" "}
            <span className="font-light italic text-white/40">bigger.</span>
          </h2>
          <p className="mb-10 max-w-md text-base leading-relaxed text-white/35">
            Join a community that learns, creates, and grows together — across technology, culture, media, and beyond.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3">
            <a
              href="https://www.instagram.com/vertex_ete/"
              target="_blank"
              rel="noopener noreferrer"
              className="group flex items-center gap-2 rounded-full bg-white px-6 py-2.5 text-xs font-bold uppercase tracking-widest text-black transition-all duration-300 hover:bg-white/90"
            >
              Follow us
              <svg className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
                <path d="M7 17L17 7M17 7H7M17 7v10" />
              </svg>
            </a>
            <a
              href="https://www.linkedin.com/company/vertex-et-dsce/"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-full border border-white/[0.12] px-6 py-2.5 text-xs font-bold uppercase tracking-widest text-white/60 transition-all duration-300 hover:border-white/25 hover:text-white/90"
            >
              LinkedIn
            </a>
          </div>
        </motion.div>

        {/* Footer bar */}
        <div className="border-t border-white/[0.06] py-8">
          <div className="flex flex-col items-center justify-between gap-6 md:flex-row">
            {/* Logo */}
            <Image src="/logo.svg" alt="Vertex" width={100} height={28} className="opacity-70" />

            {/* Nav */}
            <nav className="flex flex-wrap items-center justify-center gap-x-8 gap-y-2">
              {navLinks.map((link) => (
                <a
                  key={link.label}
                  href={link.href}
                  className="text-xs font-semibold uppercase tracking-widest text-white/30 transition-colors duration-200 hover:text-white/70"
                >
                  {link.label}
                </a>
              ))}
            </nav>

            {/* Socials */}
            <div className="flex items-center gap-3">
              {socials.map((s) => (
                <a
                  key={s.label}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.label}
                  className="flex h-9 w-9 items-center justify-center rounded-full border border-white/[0.1] text-white/40 transition-all duration-200 hover:border-white/25 hover:text-white/80"
                >
                  {s.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Copyright */}
          <p className="mt-8 text-center text-[10px] font-bold uppercase tracking-[0.3em] text-white/15">
            Made with ♥ by Team Vertex · {new Date().getFullYear()}
          </p>
        </div>
      </div>
    </section>
  );
};

export default Contact;
