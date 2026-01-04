"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

const navItems = [
  { name: "Home", href: "/" },
  { name: "Events", href: "/events" },
  { name: "Contact", href: "/contact" },
  { name: "Achievements", href: "/achievements" },
  { name: "Members", href: "/members" },
];

export default function Navbar() {
  const pathname = usePathname();

  return (
    <nav className="w-full px-6 py-4 flex items-center justify-center bg-transparent">
      <ul className="flex gap-12">
        {navItems.map((item) => (
          <li key={item.name}>
            <Link
              href={item.href}
              className={`hover:text-blue-600 transition-colors ${
                pathname === item.href ? "text-blue-600 font-semibold" : "font-semibold"
              }`}
            >
              {item.name}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
