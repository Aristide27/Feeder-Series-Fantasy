"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { getToken } from "@/lib/auth/token";
import { useChangeLocale, getCurrentLocale } from "@/lib/locale";
import { useTranslations } from "next-intl";

export default function NavigationStyle2() {
  const t = useTranslations("navigation");
  const pathname = usePathname();
  const [username, setUsername] = useState<string | null>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [loading, setLoading] = useState(true);
  
  // SÉLECTEUR DE LANGUE
  const [currentLocale, setCurrentLocale] = useState('fr');
  const [showLangDropdown, setShowLangDropdown] = useState(false);
  const changeLocale = useChangeLocale();

  // Initialiser la langue au montage
  useEffect(() => {
    setCurrentLocale(getCurrentLocale());
  }, []);

  // VÉRIFICATION DE L'UTILISATEUR AU MONTAGE
  useEffect(() => {
    const checkUser = async () => {
      const token = getToken();
      
      if (!token) {
        setUsername(null);
        setLoading(false);
        return;
      }

      // Vérifier que l'utilisateur existe vraiment en base
      try {
        const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
        const res = await fetch(`${API_URL}/api/auth/me`, {
          headers: { Authorization: `Bearer ${token}` }
        });

        if (res.ok) {
          const user = await res.json();
          setUsername(user.username);
        } else {
          // Token invalide ou utilisateur supprimé
          console.warn("[Navigation] Utilisateur introuvable - Suppression du token");
          localStorage.removeItem("token");
          setUsername(null);
        }
      } catch (err) {
        console.error("[Navigation] Erreur vérification utilisateur:", err);
        localStorage.removeItem("token");
        setUsername(null);
      }
      
      setLoading(false);
    };

    checkUser();
  }, [pathname]); // Re-vérifier quand la page change

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };

    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  const toggleFullscreen = () => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen();
    } else {
      document.exitFullscreen();
    }
  };

  const handleChangeLanguage = (locale: string) => {
    setCurrentLocale(locale);
    changeLocale(locale);
    setShowLangDropdown(false);
  };

  const navItems = [
    { href: "/", label: t("home") },
    { href: "/leagues", label: t("leagues") },
    { href: "/rankings", label: t("rankings") },
    { href: "/how-to-play", label: t("howToPlay") },
    { href: "/rules", label: t("rules") },
    { href: "/faq", label: t("faq") },
    { href: "/contact", label: t("contact") },
  ];

  const languages = [
    { code: 'ar',    name: t("languages.ar"),   flag: '🇸🇦', label: 'AR' }, // Arabic
    { code: 'pt',    name: t("languages.pt"),   flag: '🇵🇹', label: 'PT' }, // Portuguese
    { code: 'nl',    name: t("languages.nl"),   flag: '🇳🇱', label: 'NL' }, // Dutch
    { code: 'en',    name: t("languages.en"),   flag: '🇬🇧', label: 'EN' }, // English
    { code: 'fr',    name: t("languages.fr"),   flag: '🇫🇷', label: 'FR' }, // French
    { code: 'de',    name: t("languages.de"),   flag: '🇩🇪', label: 'DE' }, // German
    { code: 'it',    name: t("languages.it"),   flag: '🇮🇹', label: 'IT' }, // Italian
    { code: 'ja',    name: t("languages.ja"),   flag: '🇯🇵', label: 'JA' }, // Japanese
    { code: 'es',    name: t("languages.es"),   flag: '🇪🇸', label: 'ES' }, // Spanish
    { code: 'tr',    name: t("languages.tr"),   flag: '🇹🇷', label: 'TR' }, // Turkish
  ];

  const currentLang = languages.find(l => l.code === currentLocale) || languages[0];

  return (
    <nav className="border-b border-slate-800/50 bg-slate-950/80 backdrop-blur-xl sticky top-0 z-50">
      {/* Gradient accent en haut */}
      <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent" />
      
      <div className="max-w-8xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo + Nom */}
          <div className="flex-shrink-0">
            <Link href="/" className="flex items-center gap-3 group">
              <div className="relative">
                <div className="absolute inset-0 bg-blue-500/20 blur-lg rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                <img 
                  src="/logo/logo.png" 
                  alt="Feeder Series Fantasy" 
                  className="h-10 w-auto transition-transform group-hover:scale-110 duration-300 relative z-10"
                />
              </div>
              <span className="text-xl font-bold text-white group-hover:text-blue-400 transition-colors duration-300 hidden sm:block">
                Feeder Series Fantasy
              </span>
            </Link>
          </div>

          {/* Navigation principale */}
          <div className="hidden md:flex items-center gap-1">
            {navItems.map((item) => {
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`relative px-4 py-2 text-sm font-medium transition-all duration-200 rounded-lg ${
                    active
                      ? "text-white"
                      : "text-slate-300 hover:text-white"
                  }`}
                >
                  {/* Background actif - Style blue gradient */}
                  {active && (
                    <>
                      <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-blue-500 rounded-lg" />
                      <div className="absolute inset-0 shadow-lg shadow-blue-900/30 rounded-lg" />
                    </>
                  )}
                  
                  {/* Background hover pour items non-actifs */}
                  {!active && (
                    <div className="absolute inset-0 bg-slate-800/30 rounded-lg opacity-0 hover:opacity-100 transition-opacity duration-200" />
                  )}
                  
                  <span className="relative">{item.label}</span>
                </Link>
              );
            })}
          </div>

          {/* Actions droite */}
          <div className="hidden md:flex items-center gap-3">
            {/* SÉLECTEUR DE LANGUE */}
            <div className="relative">
              <button
                onClick={() => setShowLangDropdown(!showLangDropdown)}
                className="h-9 px-2 py-2 text-sm font-medium rounded-lg bg-slate-800/50 border border-slate-700/50 text-slate-300 hover:text-white hover:bg-slate-800 hover:border-slate-700 transition-all duration-200 flex items-center gap-2"
              >
                <span className="text-lg">{currentLang.flag}</span>
                <span className="text-xs font-bold">{currentLang.label}</span>
                <svg 
                  className={`w-3 h-3 transition-transform ${showLangDropdown ? 'rotate-180' : ''}`} 
                  fill="none" 
                  stroke="currentColor" 
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {/* Dropdown */}
              {showLangDropdown && (
                <>
                  {/* Overlay pour fermer au clic extérieur */}
                  <div 
                    className="fixed inset-0 z-10" 
                    onClick={() => setShowLangDropdown(false)}
                  />
                  
                  <div className="absolute right-0 mt-2 w-36 bg-slate-900 border border-slate-700 rounded-lg shadow-xl overflow-hidden z-20">
                    {languages.map((lang) => (
                      <button
                        key={lang.code}
                        onClick={() => handleChangeLanguage(lang.code)}
                        className={`w-full flex items-center gap-3 px-4 py-1.5 text-sm transition-colors ${
                          currentLocale === lang.code
                            ? 'bg-blue-600/20 text-white'
                            : 'text-slate-300 hover:bg-slate-800 hover:text-white'
                        }`}
                      >
                        <span className="text-lg">{lang.flag}</span>
                        <span className="flex-1 text-left">{lang.name}</span>
                        {currentLocale === lang.code && (
                          <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        )}
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Bouton Fullscreen */}
            <button
              onClick={toggleFullscreen}
              className="px-2 h-9 py-2 text-sm font-medium rounded-lg bg-slate-800/50 border border-slate-700/50 text-slate-300 hover:text-white hover:bg-slate-800 hover:border-slate-700 transition-all duration-200 flex items-center gap-2"
              title={isFullscreen ? t("fullscreenExit") : t("fullscreenEnter")}
            >
              {isFullscreen ? (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 9V4.5M9 9H4.5M9 9L3.75 3.75M9 15v4.5M9 15H4.5M9 15l-5.25 5.25M15 9h4.5M15 9V4.5M15 9l5.25-5.25M15 15h4.5M15 15v4.5m0-4.5l5.25 5.25" />
                </svg>
              ) : (
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5l-5-5m5 5v-4m0 4h-4" />
                </svg>
              )}
              <span className="text-xs opacity-70">F11</span>
            </button>

            {/* Bouton connexion/profil */}
            {loading ? (
              // Skeleton pendant le chargement
              <div className="px-4 py-2 h-9 rounded-lg bg-slate-800/50 border border-slate-700/50 animate-pulse">
                <div className="h-4 w-20 bg-slate-700/50 rounded" />
              </div>
            ) : !username ? (
              <Link
                href="/login"
                className="px-4 py-2 text-sm font-medium rounded-lg bg-slate-800/50 border border-slate-700/50 text-slate-300 hover:text-white hover:bg-slate-800 hover:border-slate-700 transition-all duration-200"
              >
                {t("login")}
              </Link>
            ) : (
              <Link
                href="/profile"
                className={`h-9 px-4 py-2 text-sm font-medium rounded-lg transition-all duration-200 ${
                  pathname === "/profile"
                    ? "bg-gradient-to-r from-blue-600 to-blue-500 text-white shadow-lg shadow-blue-900/30"
                    : "bg-slate-800/50 border border-slate-700/50 text-slate-300 hover:text-white hover:bg-slate-800 hover:border-slate-700"
                }`}
              >
                <span className="flex items-center gap-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                  {username}
                </span>
              </Link>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button className="text-blue-400 hover:text-blue-300 transition-colors">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </nav>
  );
}