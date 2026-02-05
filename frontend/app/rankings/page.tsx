"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import { getToken } from "@/lib/auth/token";
import { getGlobalRankings, GlobalRankingEntry } from "@/lib/api/rankings.api";

export default function RankingsPage() {
  const router = useRouter();
  const pathname = usePathname();
  const [rankings, setRankings] = useState<GlobalRankingEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [myRank, setMyRank] = useState<GlobalRankingEntry | null>(null);

  useEffect(() => {
    loadRankings();
  }, []);

  async function loadRankings() {
    const token = getToken();
    if (!token) {
      router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
      return;
    }

    try {
      setLoading(true);
      const data = await getGlobalRankings(token);
      
      // Séparer le top 50 et trouver ma position
      const top50 = data.slice(0, 50);
      const myPosition = data.find(entry => entry.is_me);
      
      setRankings(top50);
      setMyRank(myPosition || null);
    } catch (err: any) {
      setError(err?.message ?? "Erreur lors du chargement du classement");
    } finally {
      setLoading(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        <div className="max-w-7xl mx-auto px-8 py-16">
          <div className="text-center">
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-accent border-t-transparent mb-4"></div>
            <p className="text-white text-lg">Chargement du classement mondial...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
        <div className="max-w-7xl mx-auto px-8 py-16">
          <div className="rounded-lg border border-red-500 bg-red-500/15 px-6 py-4 text-red-500">
            {error}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Hero Section - Ultra premium */}
      <div className="relative overflow-hidden border-b border-slate-800/50">
        {/* Animated background gradients */}
        <div className="absolute inset-0 bg-gradient-to-r from-yellow-500/5 via-slate-900/40 to-yellow-500/5 animate-pulse" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-yellow-500/20 via-transparent to-transparent" />
        
        {/* Decorative elements */}
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-yellow-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl"></div>
        
        <div className="relative max-w-7xl mx-auto px-8 py-24">
          <div className="text-center">
            {/* Trophy icon */}
            <div className="inline-flex items-center justify-center w-24 h-24 mb-6 bg-gradient-to-br from-yellow-400 to-amber-600 rounded-full shadow-2xl shadow-yellow-500/50">
              <svg className="w-12 h-12 text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
              </svg>
            </div>

            <div className="flex items-center justify-center gap-3 mb-6">
              <div className="h-1 w-16 bg-gradient-to-r from-transparent via-yellow-500 to-transparent rounded-full" />
              <span className="text-yellow-400 text-sm font-bold tracking-wider uppercase">
                Classement Mondial
              </span>
              <div className="h-1 w-16 bg-gradient-to-r from-transparent via-yellow-500 to-transparent rounded-full" />
            </div>
            
            <h1 className="text-7xl font-black text-white mb-6 tracking-tight">
              Hall of <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-400 to-amber-600">Fame</span>
            </h1>
            
            <p className="text-xl text-slate-300 max-w-3xl mx-auto leading-relaxed">
              Les 50 meilleurs stratèges de Feeder Series Fantasy F2. 
              Seuls les plus talentueux figurent dans ce classement d'élite.
            </p>

            {/* Stats bar */}
            <div className="mt-12 flex items-center justify-center gap-8">
              <StatBadge label="Joueurs actifs" value={rankings.length} />
              <div className="h-12 w-px bg-slate-700" />
              <StatBadge label="Top 50" value="Élite" highlight />
              <div className="h-12 w-px bg-slate-700" />
              <StatBadge label="Saison" value="2026" />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-8 py-16">
        <div className="flex gap-8">
          {/* Main Rankings - Podium + List */}
          <div className="flex-1 space-y-8">
            {/* Podium - Top 3 */}
            {rankings.length >= 3 ? (
              <div className="relative">
                <div className="flex items-end justify-center gap-6 mb-8">
                  {/* 2nd place */}
                  <PodiumPlace 
                    rank={2}
                    entry={rankings[1]}
                    height="h-56"
                    medal="silver"
                  />
                  
                  {/* 1st place */}
                  <PodiumPlace 
                    rank={1}
                    entry={rankings[0]}
                    height="h-72"
                    medal="gold"
                  />
                  
                  {/* 3rd place */}
                  <PodiumPlace 
                    rank={3}
                    entry={rankings[2]}
                    height="h-44"
                    medal="bronze"
                  />
                </div>
              </div>
            ) : rankings.length > 0 ? (
              <div className="bg-gradient-to-br from-slate-900/90 to-slate-900/50 border border-slate-800/50 rounded-xl p-8 text-center">
                <div className="inline-flex items-center justify-center w-16 h-16 mb-4 bg-gradient-to-br from-yellow-400/20 to-amber-600/20 rounded-full">
                  <svg className="w-8 h-8 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                    <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                  </svg>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">Podium en construction</h3>
                <p className="text-slate-400 mb-4">
                  Il faut au moins 3 joueurs classés pour afficher le podium
                </p>
                <p className="text-sm text-slate-500">
                  Actuellement : {rankings.length} joueur{rankings.length > 1 ? 's' : ''} classé{rankings.length > 1 ? 's' : ''}
                </p>
              </div>
            ) : null}

            {/* All rankings (from 4 to 50 if we have them, or all available) */}
            <div className="space-y-3">
              {rankings.length > 3 && (
                <>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="h-px flex-1 bg-gradient-to-r from-transparent via-slate-700 to-slate-700" />
                    <h2 className="text-xl font-bold text-white">
                      {rankings.length >= 50 ? 'Top 4-50' : `Top ${rankings.length}`}
                    </h2>
                    <div className="h-px flex-1 bg-gradient-to-r from-slate-700 via-slate-700 to-transparent" />
                  </div>

                  {rankings.slice(3).map((entry) => (
                    <RankingRow key={entry.user_id} entry={entry} />
                  ))}
                </>
              )}

              {rankings.length < 4 && rankings.length > 0 && (
                <div className="text-center py-12">
                  <p className="text-slate-400">
                    Seulement {rankings.length} joueur{rankings.length > 1 ? 's' : ''} classé{rankings.length > 1 ? 's' : ''} pour le moment
                  </p>
                </div>
              )}

              {rankings.length === 0 && (
                <div className="text-center py-12">
                  <p className="text-slate-400">Aucun joueur classé pour le moment</p>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="w-96">
            <div className="sticky top-18 space-y-6">
              {/* My Position Card */}
              {myRank && <MyPositionCard entry={myRank} />}

              {/* Info Card */}
              <InfoCard />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Components

interface StatBadgeProps {
  label: string;
  value: string | number;
  highlight?: boolean;
}

function StatBadge({ label, value, highlight }: StatBadgeProps) {
  return (
    <div className="text-center">
      <p className="text-sm text-slate-400 mb-1">{label}</p>
      <p className={`text-2xl font-bold ${highlight ? 'text-yellow-400' : 'text-white'}`}>
        {value}
      </p>
    </div>
  );
}

interface PodiumPlaceProps {
  rank: number;
  entry: GlobalRankingEntry;
  height: string;
  medal: "gold" | "silver" | "bronze";
}

function PodiumPlace({ rank, entry, height, medal }: PodiumPlaceProps) {
  const medalColors = {
    gold: "from-yellow-400 to-amber-600",
    silver: "from-gray-300 to-gray-500",
    bronze: "from-orange-400 to-orange-600",
  };

  const medalEmojis = {
    gold: "🥇",
    silver: "🥈",
    bronze: "🥉",
  };

  const glowColors = {
    gold: "shadow-yellow-500/50",
    silver: "shadow-gray-400/50",
    bronze: "shadow-orange-500/50",
  };

  return (
    <div className="flex flex-col items-center gap-4">
      {/* Player card */}
      <div className={`relative bg-gradient-to-br from-slate-900 to-slate-900/50 border-2 ${
        medal === "gold" ? "border-yellow-400" : 
        medal === "silver" ? "border-gray-400" : 
        "border-orange-400"
      } rounded-xl p-6 w-56 shadow-2xl ${glowColors[medal]}`}>
        
        {/* Medal badge */}
        <div className={`absolute -top-4 left-1/2 -translate-x-1/2 w-12 h-12 bg-gradient-to-br ${medalColors[medal]} rounded-full flex items-center justify-center text-2xl shadow-lg ${glowColors[medal]}`}>
          {medalEmojis[medal]}
        </div>

        <div className="mt-4 text-center">
          <p className="text-sm text-slate-400 mb-1">#{rank}</p>
          <h3 className="text-xl font-bold text-white mb-3 truncate">
            {entry.username}
          </h3>
          <div className="flex items-center justify-center gap-2">
            <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <span className="text-2xl font-bold text-white">
              {entry.total_points}
            </span>
            <span className="text-sm text-slate-400">pts</span>
          </div>
        </div>
      </div>

      {/* Podium base */}
      <div className={`w-56 ${height} bg-gradient-to-b ${medalColors[medal]} rounded-t-xl shadow-2xl ${glowColors[medal]} flex items-end justify-center pb-4`}>
        <span className="text-6xl font-black text-white/20">#{rank}</span>
      </div>
    </div>
  );
}

interface RankingRowProps {
  entry: GlobalRankingEntry;
}

function RankingRow({ entry }: RankingRowProps) {
  const isTopTen = entry.rank <= 10;
  
  return (
    <div className={`group relative bg-gradient-to-br from-slate-900/90 to-slate-900/50 border ${
      isTopTen ? 'border-yellow-500/30' : 'border-slate-800/50'
    } rounded-xl p-5 hover:border-slate-700/50 transition-all duration-300`}>
      
      {isTopTen && (
        <div className="absolute inset-0 bg-gradient-to-br from-yellow-500/5 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
      )}
      
      <div className="relative flex items-center justify-between">
        <div className="flex items-center gap-6">
          {/* Rank */}
          <div className={`flex-shrink-0 w-16 h-16 rounded-xl flex items-center justify-center ${
            isTopTen 
              ? 'bg-gradient-to-br from-yellow-500/20 to-amber-600/20 border border-yellow-500/30' 
              : 'bg-slate-800/50 border border-slate-700/50'
          }`}>
            <span className={`text-2xl font-bold ${
              isTopTen ? 'text-yellow-400' : 'text-slate-400'
            }`}>
              #{entry.rank}
            </span>
          </div>

          {/* User info */}
          <div>
            <h3 className="text-lg font-bold text-white mb-1 flex items-center gap-2">
              {entry.username}
              {isTopTen && (
                <span className="px-2 py-0.5 bg-yellow-500/20 border border-yellow-500/30 text-yellow-400 text-xs font-bold rounded uppercase">
                  Top 10
                </span>
              )}
            </h3>
            <p className="text-sm text-slate-400">
              Membre depuis {new Date(entry.joined_at).toLocaleDateString("fr-FR")}
            </p>
          </div>
        </div>

        {/* Points */}
        <div className="text-right">
          <div className="flex items-center gap-2 mb-1">
            <svg className="w-5 h-5 text-yellow-400" fill="currentColor" viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
            <span className="text-3xl font-bold text-white">
              {entry.total_points}
            </span>
          </div>
          <p className="text-xs text-slate-500">points totaux</p>
        </div>
      </div>
    </div>
  );
}

interface MyPositionCardProps {
  entry: GlobalRankingEntry;
}

function MyPositionCard({ entry }: MyPositionCardProps) {
  const isTop50 = entry.rank <= 50;
  
  return (
    <div className="bg-gradient-to-br from-accent/20 to-slate-900/50 border-2 border-accent/50 rounded-xl p-5 shadow-2xl shadow-accent/20">
      <div className="flex items-center gap-3 mb-4">
        <svg className="w-6 h-6 text-accent" fill="currentColor" viewBox="0 0 20 20">
          <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd" />
        </svg>
        <h3 className="text-lg font-bold text-white">Ma Position</h3>
      </div>

      <div className="space-y-3">
        <div className="flex items-center justify-between p-4 bg-slate-900/50 rounded-lg border border-accent/30">
          <span className="text-sm text-slate-300">Classement</span>
          <span className="text-2xl font-bold text-accent">#{entry.rank}</span>
        </div>

        <div className="flex items-center justify-between p-4 bg-slate-900/50 rounded-lg border border-accent/30">
          <span className="text-sm text-slate-300">Points totaux</span>
          <span className="text-2xl font-bold text-white">{entry.total_points}</span>
        </div>

        {isTop50 ? (
          <div className="p-4 bg-gradient-to-br from-green-500/20 to-emerald-600/20 border border-green-500/30 rounded-lg">
            <p className="text-sm text-green-300 text-center font-semibold">
              🎉 Félicitations ! Tu es dans le Top 50 mondial
            </p>
          </div>
        ) : (
          <div className="p-4 bg-slate-900/50 border border-slate-700/50 rounded-lg">
            <p className="text-sm text-slate-400 text-center">
              Continue à progresser pour atteindre le Top 50 !
            </p>
          </div>
        )}
      </div>
    </div>
  );
}

function InfoCard() {
  return (
    <div className="bg-gradient-to-br from-slate-900/90 to-slate-900/50 border border-slate-800/50 rounded-xl p-6">
      <h3 className="text-lg font-bold text-white mb-4">À propos du classement</h3>
      
      <div className="space-y-3 text-sm text-slate-300">
        <div className="flex gap-3">
          <span className="text-blue-400 flex-shrink-0">•</span>
          <p>Seuls les 50 meilleurs joueurs mondiaux sont affichés</p>
        </div>
        
        <div className="flex gap-3">
          <span className="text-blue-400 flex-shrink-0">•</span>
          <p>Le classement est mis à jour après chaque week-end de course</p>
        </div>
        
        <div className="flex gap-3">
          <span className="text-blue-400 flex-shrink-0">•</span>
          <p>Les points sont cumulés sur toute la saison</p>
        </div>
{/*         
        <div className="flex gap-3">
          <span className="text-blue-400 flex-shrink-0">•</span>
          <p>Tous les joueurs ayant une équipe validée participent au classement mondial</p>
        </div> */}
      </div>

      <div className="mt-4 p-4 bg-accent/10 border border-accent/30 rounded-lg">
        <p className="text-xs text-accent text-center font-medium">
          Deviens le prochain champion FSF !
        </p>
      </div>
    </div>
  );
}