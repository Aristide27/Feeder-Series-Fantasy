"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { getToken } from "@/lib/auth/token";
import { getMyLeagues, createLeague, joinLeague, League } from "@/lib/api/leagues.api";

export default function MyLeaguesPage() {
  const router = useRouter();
  const pathname = usePathname();
  const [leagues, setLeagues] = useState<League[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Modales
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinModal, setShowJoinModal] = useState(false);

  // Formulaire création
  const [leagueName, setLeagueName] = useState("");
  const [createError, setCreateError] = useState<string | null>(null);
  const [creating, setCreating] = useState(false);

  // Formulaire rejoindre
  const [joinCode, setJoinCode] = useState("");
  const [joinError, setJoinError] = useState<string | null>(null);
  const [joining, setJoining] = useState(false);

  useEffect(() => {
    loadLeagues();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadLeagues() {
    const token = getToken();
    if (!token) {
      router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
      return;
    }

    try {
      setLoading(true);
      const data = await getMyLeagues(token);
      setLeagues(data);
    } catch (err: any) {
      setError(err?.message ?? "Erreur lors du chargement des ligues");
    } finally {
      setLoading(false);
    }
  }

  async function handleCreateLeague() {
    const token = getToken();
    if (!token) return;

    setCreateError(null);
    setCreating(true);

    try {
      await createLeague(token, leagueName);
      setShowCreateModal(false);
      setLeagueName("");
      loadLeagues();
    } catch (err: any) {
      setCreateError(err?.message ?? "Erreur lors de la création");
    } finally {
      setCreating(false);
    }
  }

  async function handleJoinLeague() {
    const token = getToken();
    if (!token) return;

    setJoinError(null);
    setJoining(true);

    try {
      await joinLeague(token, joinCode);
      setShowJoinModal(false);
      setJoinCode("");
      loadLeagues();
    } catch (err: any) {
      setJoinError(err?.message ?? "Erreur lors de l'inscription");
    } finally {
      setJoining(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 px-4 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="text-center text-slate-200 text-lg">Chargement des ligues...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 px-4 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="rounded-lg border border-red-500/60 bg-red-500/10 px-6 py-4 text-red-300">
            {error}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Hero header */}
      <div className="relative overflow-hidden border-b border-slate-800/50">
        <div className="absolute inset-0 bg-gradient-to-r from-accent/10 via-slate-900/40 to-accent/10" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-accent/10 via-transparent to-transparent" />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div>
              <h1 className="text-4xl font-bold text-white mb-2 tracking-tight">Mes Ligues</h1>
              <p className="text-slate-300">
                Crée une ligue privée ou rejoins tes amis avec un code d’invitation.
              </p>
            </div>

            <div className="flex flex-wrap gap-3">
              <button
                onClick={() => setShowJoinModal(true)}
                className="h-10 px-5 inline-flex items-center justify-center rounded-lg bg-slate-800/50 border border-slate-700/50 text-slate-200 hover:text-white hover:bg-slate-800 hover:border-slate-700 transition-all"
              >
                Rejoindre
              </button>

              <button
                onClick={() => setShowCreateModal(true)}
                className="h-10 px-5 inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-accent to-accent/80 text-white font-semibold shadow-lg shadow-blue-900/30 hover:shadow-blue-900/50 transition-all"
              >
                + Créer
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Leagues Grid */}
        {leagues.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {leagues.map((league) => (
              <Link
                key={league.id}
                href={`/leagues/${league.code}`}
                className="group relative bg-gradient-to-br from-slate-900/90 to-slate-900/50 border border-slate-800/50 rounded-xl p-6 hover:border-slate-700/50 transition-all duration-300"
              >
                <div className="absolute inset-0 bg-gradient-to-br from-accent/10 to-transparent rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

                <div className="relative space-y-4">
                  {/* League name */}
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <h3 className="text-xl font-bold text-white truncate group-hover:text-accent transition-colors">
                        {league.name}
                      </h3>

                      <div className="mt-2 flex flex-wrap gap-2">
                        {league.is_official === 1 && (
                          <span className="text-xs bg-accent/20 text-accent px-2 py-1 rounded">
                            Officiel
                          </span>
                        )}
                        {league.rank === 1 && (
                          <span className="text-xs bg-accent/20 text-accent px-2 py-1 rounded font-bold">
                            🏆 Leader
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="text-right">
                      <div className="text-xs text-slate-400">Code</div>
                      <div className="text-sm font-mono font-bold text-accent">{league.code}</div>
                    </div>
                  </div>

                  {/* Stats Grid */}
                  <div className="grid grid-cols-3 gap-3">
                    <div className="bg-black/20 border border-slate-800/50 rounded-lg p-3 text-center">
                      <p className="text-[11px] text-slate-400 mb-1">Membres</p>
                      <p className="text-2xl font-bold text-white">{league.member_count}</p>
                    </div>
                    <div className="bg-black/20 border border-slate-800/50 rounded-lg p-3 text-center">
                      <p className="text-[11px] text-slate-400 mb-1">Position</p>
                      <p className="text-2xl font-bold text-white">#{league.rank}</p>
                    </div>
                    <div className="bg-black/20 border border-slate-800/50 rounded-lg p-3 text-center">
                      <p className="text-[11px] text-slate-400 mb-1">Points</p>
                      <p className="text-2xl font-bold text-accent">{league.total_points}</p>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-800/50 text-center text-xs text-slate-400">
                    Ouvrir la ligue →
                  </div>
                </div>
              </Link>
            ))}
          </div>
        ) : (
          <div className="text-center py-16">
            <p className="text-slate-300 mb-4">Aucune ligue pour le moment</p>
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center justify-center h-11 px-6 rounded-lg bg-gradient-to-r from-accent to-accent/80 text-white font-semibold shadow-lg shadow-blue-900/30 hover:shadow-blue-900/50 transition-all"
            >
              Créer votre première ligue
            </button>
          </div>
        )}
      </div>

      {/* Modale Créer une ligue */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="relative bg-gradient-to-br from-slate-900/90 to-slate-900/60 border border-slate-800/50 rounded-2xl p-8 max-w-md w-full">
            <div className="absolute inset-0 bg-gradient-to-br from-accent/10 to-transparent rounded-2xl opacity-60 pointer-events-none" />

            <div className="relative">
              <h2 className="text-2xl font-bold text-white mb-2">Créer une ligue</h2>
              <p className="text-slate-300 mb-6">Donne un nom à ta ligue pour commencer.</p>

              {createError && (
                <div className="mb-4 rounded-lg border border-red-500/60 bg-red-500/10 px-4 py-3 text-red-300 text-sm">
                  {createError}
                </div>
              )}

              <input
                type="text"
                className="w-full px-4 py-3 rounded-lg bg-black/30 border border-slate-700/60 text-white outline-none focus:ring-2 focus:ring-accent mb-6"
                placeholder="Nom de la ligue"
                value={leagueName}
                onChange={(e) => setLeagueName(e.target.value)}
                maxLength={50}
              />

              <div className="flex gap-3">
                <button
                  onClick={handleCreateLeague}
                  disabled={creating || !leagueName.trim()}
                  className="flex-1 h-11 rounded-lg bg-gradient-to-r from-accent to-accent/80 text-white font-semibold hover:opacity-95 disabled:opacity-50"
                >
                  {creating ? "Création..." : "Créer"}
                </button>
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setLeagueName("");
                    setCreateError(null);
                  }}
                  disabled={creating}
                  className="flex-1 h-11 rounded-lg bg-slate-800/50 border border-slate-700/50 text-slate-200 hover:text-white hover:bg-slate-800 hover:border-slate-700 transition-all"
                >
                  Annuler
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modale Rejoindre une ligue */}
      {showJoinModal && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="relative bg-gradient-to-br from-slate-900/90 to-slate-900/60 border border-slate-800/50 rounded-2xl p-8 max-w-md w-full">
            <div className="absolute inset-0 bg-gradient-to-br from-accent/10 to-transparent rounded-2xl opacity-60 pointer-events-none" />

            <div className="relative">
              <h2 className="text-2xl font-bold text-white mb-2">Rejoindre une ligue</h2>
              <p className="text-slate-300 mb-6">Entre le code d’invitation de la ligue.</p>

              {joinError && (
                <div className="mb-4 rounded-lg border border-red-500/60 bg-red-500/10 px-4 py-3 text-red-300 text-sm">
                  {joinError}
                </div>
              )}

              <input
                type="text"
                className="w-full px-4 py-3 rounded-lg bg-black/30 border border-slate-700/60 text-white outline-none focus:ring-2 focus:ring-accent mb-6 uppercase text-center text-2xl font-mono tracking-widest"
                placeholder="ABC123"
                value={joinCode}
                onChange={(e) => setJoinCode(e.target.value.toUpperCase())}
                maxLength={6}
              />

              <div className="flex gap-3">
                <button
                  onClick={handleJoinLeague}
                  disabled={joining || !joinCode.trim()}
                  className="flex-1 h-11 rounded-lg bg-gradient-to-r from-accent to-accent/80 text-white font-semibold hover:opacity-95 disabled:opacity-50"
                >
                  {joining ? "Inscription..." : "Rejoindre"}
                </button>
                <button
                  onClick={() => {
                    setShowJoinModal(false);
                    setJoinCode("");
                    setJoinError(null);
                  }}
                  disabled={joining}
                  className="flex-1 h-11 rounded-lg bg-slate-800/50 border border-slate-700/50 text-slate-200 hover:text-white hover:bg-slate-800 hover:border-slate-700 transition-all"
                >
                  Annuler
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
