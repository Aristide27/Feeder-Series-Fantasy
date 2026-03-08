"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useTranslations } from "next-intl";

export default function HomePage() {
  const t = useTranslations("home");
  const [fsfLeagueId, setFsfLeagueId] = useState<number | null>(null);
  const [loadingFsf, setLoadingFsf] = useState(true);
  const [showMobileWarning, setShowMobileWarning] = useState(false);

  useEffect(() => {
    setLoadingFsf(true);
    const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000';
    
    fetch(`${API_URL}/api/leagues/public/fsf`)
      .then((res) => res.json())
      .then((fsfLeague) => {
        if (fsfLeague && fsfLeague.id) setFsfLeagueId(fsfLeague.id);
      })
      .catch(console.error)
      .finally(() => setLoadingFsf(false));

    // Détecter si on est sur mobile
    const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);
    if (isMobile) {
      setShowMobileWarning(true);
    }
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Popup avertissement mobile */}
      {showMobileWarning && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="relative max-w-md w-full bg-gradient-to-br from-slate-900 to-slate-800 border-2 border-orange-500/50 rounded-2xl p-6 shadow-2xl">
            {/* Bouton fermer */}
            <button
              onClick={() => setShowMobileWarning(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white transition-colors"
              aria-label={t("mobileWarning.ariaClose")}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>

            {/* Icône avertissement */}
            <div className="flex justify-center mb-4">
              <div className="w-16 h-16 bg-orange-500/20 border border-orange-500/50 rounded-full flex items-center justify-center">
                <svg className="w-8 h-8 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
              </div>
            </div>

            {/* Titre */}
            <h2 className="text-2xl font-bold text-white text-center mb-3">
              {t("mobileWarning.title")}
            </h2>

            {/* Message */}
            <p className="text-slate-300 text-center mb-6 leading-relaxed">
              <strong className="text-white">Feeder Series Fantasy</strong> {t("mobileWarning.description")}{" "}
              <strong className="text-orange-400">{t("mobileWarning.descriptionHighlight")}</strong>{" "}
              {t("mobileWarning.descriptionEnd")}
            </p>

            <p className="text-slate-400 text-sm text-center mb-6">
              {t("mobileWarning.mobileUpdate")}
            </p>

            {/* Bouton */}
            <button
              onClick={() => setShowMobileWarning(false)}
              className="w-full px-6 py-3 bg-gradient-to-r from-orange-600 to-orange-500 hover:from-orange-500 hover:to-orange-600 text-white font-bold rounded-lg transition-all duration-200 shadow-lg"
            >
              {t("mobileWarning.confirm")}
            </button>
          </div>
        </div>
      )}

      {/* Hero Section - Style des pages contact/FAQ */}
      <div className="relative overflow-hidden border-b border-slate-800/50">
        <div className="absolute inset-0 bg-gradient-to-r from-accent/10 via-slate-900/40 to-accent/10" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-accent/10 via-transparent to-transparent" />

        <div className="relative max-w-7xl mx-auto px-8 py-20">
          <div className="text-center max-w-4xl mx-auto">
            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="h-1 w-12 bg-gradient-to-r from-accent to-accent/80 rounded-full" />
              <span className="text-accent text-sm font-semibold tracking-wider uppercase">
                {t("hero.badge")}
              </span>
              <div className="h-1 w-12 bg-gradient-to-l from-accent to-accent/80 rounded-full" />
            </div>

            {/* Logo */}
            <div className="flex justify-center mb-8">
              <img
                src="/logo/logo.png"
                alt="Feeder Series Fantasy"
                className="h-36 md:h-40 w-auto drop-shadow-2xl"
              />
            </div>

            <h1 className="text-6xl md:text-7xl font-bold text-white mb-6 tracking-tight">
              {t("hero.title")}<span className="text-accent">{t("hero.titleHighlight")}</span>
            </h1>

            <p className="text-xl text-slate-300 leading-relaxed mb-8">
              {t("hero.description")}
            </p>

            {/* CTA Hero */}
            {fsfLeagueId ? (
              <Link
                href={`/my-team?leagueId=${fsfLeagueId}`}
                className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-accent to-accent/80 hover:from-accent/90 hover:to-accent text-white font-bold rounded-lg transition-all duration-200 shadow-lg shadow-blue-900/30 hover:shadow-blue-900/50 text-lg"
              >
                <span>{t("hero.cta")}</span>
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </Link>
            ) : (
              <button
                disabled
                className="inline-flex items-center gap-2 px-8 py-4 bg-accent/40 text-white font-bold rounded-lg opacity-60 cursor-wait text-lg"
              >
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>{loadingFsf ? t("hero.loading") : t("hero.unavailable")}</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-8 py-16">
        {/* Section centrale - CTA renforcé */}
        <div className="max-w-4xl mx-auto mb-16">
          <div className="group relative bg-gradient-to-br from-slate-900/90 to-slate-900/50 border border-slate-800/50 rounded-xl p-8 hover:border-slate-700/50 transition-all duration-300">
            <div className="absolute inset-0 bg-gradient-to-br from-accent/10 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            <div className="relative text-center space-y-6">
              <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-green-950/40 border border-green-900/50 rounded-full">
                <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                <span className="text-sm font-semibold text-green-300">{t("pitch.seasonOpen")}</span>
              </div>

              <h2 className="text-3xl md:text-4xl font-bold text-white">
                {t("pitch.title")}
              </h2>

              <p className="text-slate-300 max-w-3xl mx-auto">
                {t("pitch.description")}
              </p>
            </div>
          </div>
        </div>

        {/* Roadmap Section - Nouvelles fonctionnalités */}
        <div className="max-w-4xl mx-auto mb-16">
          <div className="relative bg-gradient-to-br from-purple-950/30 to-slate-900/50 border-2 border-purple-500/30 rounded-xl p-8 overflow-hidden">
            {/* Effet de brillance */}
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-purple-500/5 to-transparent" />
            
            <div className="relative">
              {/* Badge "À venir" */}
              <div className="flex items-center justify-center gap-3 mb-6">
                <div className="h-1 w-8 bg-gradient-to-r from-purple-500 to-purple-400 rounded-full" />
                <span className="text-purple-400 text-sm font-bold tracking-wider uppercase">
                  {t("roadmap.badge")}
                </span>
                <div className="h-1 w-8 bg-gradient-to-l from-purple-500 to-purple-400 rounded-full" />
              </div>

              <h2 className="text-2xl md:text-3xl font-bold text-white text-center mb-6">
                {t("roadmap.title")}
              </h2>

              <p className="text-slate-300 text-center mb-8 max-w-2xl mx-auto">
                {t("roadmap.description")}
              </p>

              {/* Liste des features à venir */}
              <div className="grid md:grid-cols-2 gap-4">
                {[
                  {
                    title: t("roadmap.features.multilang.title"),
                    desc: t("roadmap.features.multilang.desc"),
                    status: t("roadmap.statusInProgress")
                  },
                  {
                    title: t("roadmap.features.design.title"),
                    desc: t("roadmap.features.design.desc"),
                    status: t("roadmap.statusInProgress")
                  },
                  {
                    title: t("roadmap.features.bugs.title"),
                    desc: t("roadmap.features.bugs.desc"),
                    status: t("roadmap.statusInProgress")
                  },
                  {
                    title: t("roadmap.features.friends.title"),
                    desc: t("roadmap.features.friends.desc"),
                    status: t("roadmap.statusComing")
                  },
                  {
                    title: t("roadmap.features.mobile.title"),
                    desc: t("roadmap.features.mobile.desc"),
                    status: t("roadmap.statusComing")
                  },
                  {
                    title: t("roadmap.features.f3.title"),
                    desc: t("roadmap.features.f3.desc"),
                    status: t("roadmap.statusComing")
                  }
                ].map((feature, idx) => (
                  <div
                    key={idx}
                    className="flex items-start gap-3 p-4 bg-slate-900/50 border border-slate-800/50 rounded-lg hover:border-purple-500/30 transition-all duration-200"
                  >
                    <div className="text-2xl flex-shrink-0"></div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        <h3 className="text-white font-bold text-sm">{feature.title}</h3>
                        <span className={`text-xs px-2 py-0.5 rounded-full ${
                          feature.status === t("roadmap.statusInProgress")
                            ? "bg-green-950/50 text-green-400 border border-green-900/50" 
                            : "bg-purple-950/50 text-purple-400 border border-purple-900/50"
                        }`}>
                          {feature.status}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400">{feature.desc}</p>
                    </div>
                  </div>
                ))}
              </div>

              {/* Message de fin */}
              <div className="mt-6 p-4 bg-purple-950/20 border border-purple-900/30 rounded-lg">
                <p className="text-sm text-center text-slate-300">
                  💡 <strong className="text-white">{t("roadmap.suggestion")}</strong> {t("roadmap.suggestionText")}{" "}
                  <Link href="/contact" className="text-purple-400 hover:text-purple-300 underline">
                    {t("roadmap.contactLink")}
                  </Link>
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="grid md:grid-cols-2 gap-6 mb-16">
          {[
            {
              title: t("features.realtime.title"),
              desc: t("features.realtime.desc"),
              icon: (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M13 10V3L4 14h7v7l9-11h-7z" />
              ),
            },
            {
              title: t("features.strategy.title"),
              desc: t("features.strategy.desc"),
              icon: (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
              ),
            },
            {
              title: t("features.leagues.title"),
              desc: t("features.leagues.desc"),
              icon: (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
              ),
            },
            {
              title: t("features.world.title"),
              desc: t("features.world.desc"),
              icon: (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                  d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              ),
            },
          ].map((f) => (
            <div
              key={f.title}
              className="group relative bg-gradient-to-br from-slate-900/90 to-slate-900/50 border border-slate-800/50 rounded-xl p-6 hover:border-slate-700/50 transition-all duration-300"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-accent/10 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

              <div className="relative flex items-start gap-4">
                <div className="flex-shrink-0 w-12 h-12 bg-accent/10 border border-accent/20 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    {f.icon}
                  </svg>
                </div>
                <div className="flex-1">
                  <h3 className="text-lg font-bold text-white mb-2">{f.title}</h3>
                  <p className="text-sm text-slate-400">{f.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* CTA Leagues */}
        <div className="mt-16 text-center">
          <div className="inline-block p-8 bg-gradient-to-br from-slate-900/90 to-slate-900/50 border border-slate-800/50 rounded-xl">
            <h3 className="text-2xl font-bold text-white mb-4">
              {t("cta.title")}
            </h3>

            <p className="text-slate-300 mb-6 max-w-xl mx-auto">
              {t("cta.description")}
            </p>

            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link
                href="/leagues"
                className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-gradient-to-r from-accent to-accent/80 hover:from-accent/90 hover:to-accent text-white font-bold rounded-lg transition-all duration-200 shadow-lg shadow-blue-900/30 hover:shadow-blue-900/50 text-lg"
              >
                <span>{t("cta.joinLeague")}</span>
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}