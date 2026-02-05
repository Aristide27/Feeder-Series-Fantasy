"use client";

import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-black/30 backdrop-blur-sm">
      <div className="mx-auto max-w-7xl px-6 py-6">
        <div className="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
          
          {/* Left: disclaimer */}
          <p className="text-xs text-white/60 leading-relaxed max-w-3xl">
            Feeder Series Fantasy is an independent fantasy game created by fans.
            It is not affiliated with, endorsed by, or connected to the FIA, Formula 1,
            Formula 2, Formula 3, or F1 Academy.
          </p>

          {/* Right: links */}
          <nav className="flex flex-wrap items-center gap-x-6 gap-y-2 text-sm">
            <Link href="/how-to-play" className="text-white/70 hover:text-white transition-colors">
              Comment jouer
            </Link>
            <Link href="/rules" className="text-white/70 hover:text-white transition-colors">
              Règles du jeu
            </Link>
            <Link href="/faq" className="text-white/70 hover:text-white transition-colors">
              FAQ
            </Link>
            <Link href="/contact" className="text-white/70 hover:text-white transition-colors">
              Contact
            </Link>
          </nav>
        </div>

        {/* Bottom line */}
        <div className="mt-6 flex items-center justify-between gap-4 border-t border-white/5 pt-4 text-xs text-white/50">
          <span>© {new Date().getFullYear()} Feeder Series Fantasy</span>
          <span>Built by motorsport fans</span>
        </div>
      </div>
    </footer>
  );
}
