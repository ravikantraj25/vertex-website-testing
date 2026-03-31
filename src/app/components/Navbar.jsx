"use client"

import React, { useEffect, useState } from 'react'
import Link from 'next/link'
import Logo from "./Logo.jsx"
import { usePathname } from 'next/navigation'

const navItems = [
  { href: "/about", label: "About" },
  { href: "/members", label: "Members" },
  { href: "/gallery", label: "Gallery" },
];

// Hero section is 400vh tall. scrollY at its end = (400 - 100)vh = 300vh
// because the viewport itself accounts for the last 100vh.
const HERO_SCROLL_END_VH = 300;

function Navbar() {
  const pathname = usePathname()
  const isHome = pathname === "/"
  const [visible, setVisible] = useState(!isHome)

  useEffect(() => {
    if (!isHome) {
      setVisible(true)
      return
    }

    const threshold = () => (HERO_SCROLL_END_VH / 100) * window.innerHeight

    const onScroll = () => {
      setVisible(window.scrollY >= threshold())
    }

    window.addEventListener("scroll", onScroll, { passive: true })
    onScroll()
    return () => window.removeEventListener("scroll", onScroll)
  }, [isHome])

  return (
    <header
      className="fixed w-full z-30 md:bg-opacity-90 text-white backdrop-blur-sm transition-all duration-300 ease-in-out"
      style={{
        opacity: visible ? 1 : 0,
        pointerEvents: visible ? "auto" : "none",
        transform: visible ? "translateY(0)" : "translateY(-100%)",
      }}
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex items-center justify-between h-16">
        <div className="flex items-center h-16">
          <Logo />
        </div>

        <nav className="flex items-center gap-1 justify-end h-16 sm:gap-2">
          {/* {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="px-3 py-1.5 text-sm font-medium text-white/80 hover:text-white rounded-lg transition duration-150 ease-in-out sm:px-4"
            >
              {item.label}
            </Link>
          ))} */}
        
        </nav>
      </div>
    </header>
  )
}

export default Navbar