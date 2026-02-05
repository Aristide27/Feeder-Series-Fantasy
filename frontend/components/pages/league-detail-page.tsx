"use client";

import { useEffect, useState } from "react";
import { useRouter, useParams, usePathname } from "next/navigation";
import Link from "next/link";
import { getToken } from "@/lib/auth/token";
import { getMe } from "@/lib/api/auth";
import { updateTeamName } from "@/lib/api/teams.api";
import {
  getLeagueDetails,
  getLeagueLeaderboard,
  getMemberTeam,
  updateLeague,
  deleteLeague,
  LeagueDetails,
  LeaderboardEntry,
  TeamComposition,
} from "@/lib/api/leagues.api";
import DeleteLeagueModal from "@/components/DeleteLeagueModal";

export default function LeagueDetailPage() {
  const router = useRouter();
  const params = useParams();
  const pathname = usePathname();
  const code = params?.code as string;

  const [league, setLeague] = useState<LeagueDetails | null>(null);
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [selectedTeam, setSelectedTeam] = useState<TeamComposition | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Édition ligue
  const [isEditing, setIsEditing] = useState(false);
  const [editedName, setEditedName] = useState("");
  const [editError, setEditError] = useState<string | null>(null);
  const [saving, setSaving] = useState(false);

  // Suppression
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  // Copie
  const [copied, setCopied] = useState(false);

  // Modification nom d'équipe
  const [myTeamName, setMyTeamName] = useState("");
  const [editingTeamName, setEditingTeamName] = useState(false);
  const [tempTeamName, setTempTeamName] = useState("");
  const [teamNameError, setTeamNameError] = useState<string | null>(null);
  const [savingTeamName, setSavingTeamName] = useState(false);

  useEffect(() => {
    if (code) loadLeagueData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [code]);

  async function loadLeagueData() {
    const token = getToken();

    if (!token) {
      router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
      return;
    }

    try {
      setLoading(true);
      const [leagueData, leaderboardData, userData] = await Promise.all([
        getLeagueDetails(token, code),
        getLeagueLeaderboard(token, code),
        getMe(token),
      ]);

      setLeague(leagueData);
      setEditedName(leagueData.name);
      setLeaderboard(leaderboardData);

      // Charger mon équipe pour avoir le nom
      try {
        const myTeam = await getMemberTeam(token, code, userData.id);
        if (myTeam.team) {
          setMyTeamName(myTeam.team.name);
          setTempTeamName(myTeam.team.name);
        }
      } catch {
        // pas d'équipe
      }
    } catch (err: any) {
      setError(err?.message ?? "Erreur lors du chargement de la ligue");
    } finally {
      setLoading(false);
    }
  }

  async function handleViewTeam(userId: number) {
    const token = getToken();
    if (!token) return;

    try {
      const team = await getMemberTeam(token, code, userId);
      setSelectedTeam(team);
    } catch (err: any) {
      alert(err?.message ?? "Erreur lors du chargement de l'équipe");
    }
  }

  async function handleSaveName() {
    const token = getToken();
    if (!token) return;

    setEditError(null);
    setSaving(true);

    try {
      await updateLeague(token, code, { name: editedName });
      setLeague((prev) => (prev ? { ...prev, name: editedName } : null));
      setIsEditing(false);
    } catch (err: any) {
      setEditError(err?.message ?? "Erreur lors de la modification");
    } finally {
      setSaving(false);
    }
  }

  async function handleToggleClosed() {
    const token = getToken();
    if (!token || !league) return;

    const confirmMsg = league.is_closed
      ? "Êtes-vous sûr de vouloir rouvrir cette ligue ?"
      : "Êtes-vous sûr de vouloir fermer cette ligue ? Plus personne ne pourra la rejoindre.";

    if (!confirm(confirmMsg)) return;

    try {
      await updateLeague(token, code, { is_closed: !league.is_closed });
      setLeague((prev) => (prev ? { ...prev, is_closed: prev.is_closed ? 0 : 1 } : null));
    } catch (err: any) {
      alert(err?.message ?? "Erreur lors de la modification");
    }
  }

  async function handleDeleteLeague() {
    const token = getToken();
    if (!token) return;

    setIsDeleting(true);

    try {
      await deleteLeague(token, code);
      router.push("/leagues?deleted=true");
    } catch (err: any) {
      alert(err?.message ?? "Erreur lors de la suppression");
      setShowDeleteModal(false);
    } finally {
      setIsDeleting(false);
    }
  }

  function flashCopied() {
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  function handleCopyCode() {
    navigator.clipboard.writeText(code);
    flashCopied();
  }

  function handleCopyInviteLink() {
    const link = `${window.location.origin}/leagues/${code}`;
    navigator.clipboard.writeText(link);
    flashCopied();
  }

  async function handleSaveTeamName() {
    const token = getToken();
    if (!token || !league) return;

    const name = tempTeamName.trim();

    if (!name) return setTeamNameError("Le nom est requis");
    if (name.length < 3) return setTeamNameError("Le nom doit contenir au moins 3 caractères");
    if (name.length > 20) return setTeamNameError("Le nom ne doit pas dépasser 20 caractères");

    setSavingTeamName(true);
    setTeamNameError(null);

    try {
      await updateTeamName(token, league.id, name);
      setMyTeamName(name);
      setEditingTeamName(false);
    } catch (err: any) {
      setTeamNameError(err?.message ?? "Erreur lors de la modification");
    } finally {
      setSavingTeamName(false);
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 px-4 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="text-center text-slate-200 text-lg">Chargement...</div>
        </div>
      </div>
    );
  }

  if (error || !league) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 px-4 py-12">
        <div className="max-w-6xl mx-auto">
          <div className="rounded-lg border border-red-500/60 bg-red-500/10 px-6 py-4 text-red-300">
            {error || "Ligue introuvable"}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950">
      {/* Hero */}
      <div className="relative overflow-hidden border-b border-slate-800/50">
        <div className="absolute inset-0 bg-gradient-to-r from-accent/10 via-slate-900/40 to-accent/10" />
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-accent/10 via-transparent to-transparent" />

        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
          <button
            onClick={() => router.push("/leagues")}
            className="text-slate-300 hover:text-white mb-5 inline-flex items-center gap-2 transition-colors"
          >
            <span className="opacity-80">←</span> Retour aux ligues
          </button>

          <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6">
            <div className="flex-1 min-w-0">
              {isEditing ? (
                <div className="space-y-3 max-w-2xl">
                  <input
                    type="text"
                    className="w-full text-3xl md:text-4xl font-bold text-white bg-black/30 border border-slate-700/60 rounded-lg px-4 py-3 outline-none focus:ring-2 focus:ring-accent"
                    value={editedName}
                    onChange={(e) => setEditedName(e.target.value)}
                    maxLength={50}
                  />
                  {editError && <p className="text-red-300 text-sm">{editError}</p>}
                  <div className="flex flex-wrap gap-2">
                    <button
                      onClick={handleSaveName}
                      disabled={saving || !editedName.trim()}
                      className="h-10 px-4 rounded-lg bg-gradient-to-r from-accent to-accent/80 text-white font-semibold hover:opacity-95 disabled:opacity-50"
                    >
                      {saving ? "Enregistrement..." : "Enregistrer"}
                    </button>
                    <button
                      onClick={() => {
                        setIsEditing(false);
                        setEditedName(league.name);
                        setEditError(null);
                      }}
                      className="h-10 px-4 rounded-lg bg-slate-800/50 border border-slate-700/50 text-slate-200 hover:text-white hover:bg-slate-800 hover:border-slate-700 transition-all"
                    >
                      Annuler
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <div className="flex flex-wrap items-center gap-2">
                    <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
                      {league.name}
                    </h1>

                    {league.is_official === 1 && (
                      <span className="text-xs bg-accent/20 text-accent px-2 py-1 rounded">
                        Officiel
                      </span>
                    )}

                    {league.is_closed === 1 && (
                      <span className="text-xs bg-red-500/15 text-red-300 border border-red-500/30 px-2 py-1 rounded">
                        Fermée
                      </span>
                    )}
                  </div>

                  <p className="text-slate-300 mt-2">
                    Créée par <span className="font-semibold text-white/90">{league.creator_username}</span> •{" "}
                    {league.member_count} membres
                  </p>
                </>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              <Link
                href={`/my-team?leagueId=${league.id}`}
                className="h-10 px-5 inline-flex items-center justify-center rounded-lg bg-gradient-to-r from-accent to-accent/80 text-white font-semibold shadow-lg shadow-blue-900/30 hover:shadow-blue-900/50 transition-all"
              >
                Mon équipe
              </Link>

              {league.is_creator && league.is_official === 0 && !isEditing && (
                <>
                  <button
                    onClick={() => setIsEditing(true)}
                    className="h-10 px-4 rounded-lg bg-slate-800/50 border border-slate-700/50 text-slate-200 hover:text-white hover:bg-slate-800 hover:border-slate-700 transition-all"
                  >
                    Modifier le nom
                  </button>

                  <button
                    onClick={handleToggleClosed}
                    className={`h-10 px-4 rounded-lg border transition-all ${
                      league.is_closed
                        ? "bg-emerald-500/10 text-emerald-300 border-emerald-500/25 hover:bg-emerald-500/15"
                        : "bg-red-500/10 text-red-300 border-red-500/25 hover:bg-red-500/15"
                    }`}
                  >
                    {league.is_closed ? "Rouvrir" : "Fermer"}
                  </button>

                  <button
                    onClick={() => setShowDeleteModal(true)}
                    className="h-10 px-4 rounded-lg bg-red-500/10 text-red-300 border border-red-500/25 hover:bg-red-500/15 transition-all"
                  >
                    Supprimer
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Classement */}
          <div className="lg:col-span-2">
            <div className="relative bg-gradient-to-br from-slate-900/90 to-slate-900/50 border border-slate-800/50 rounded-2xl p-6">
              <div className="absolute inset-0 bg-gradient-to-br from-accent/10 to-transparent rounded-2xl opacity-30 pointer-events-none" />

              <div className="relative">
                <h2 className="text-2xl font-bold text-white mb-6">Classement</h2>

                <div className="space-y-3">
                  {leaderboard.map((entry) => (
                    <div
                      key={entry.id}
                      className="flex items-center justify-between gap-4 p-4 bg-black/20 border border-slate-800/50 rounded-xl hover:border-slate-700/50 transition-all"
                    >
                      <div className="flex items-center gap-4 min-w-0">
                        <div
                          className={`text-2xl font-bold w-12 text-center ${
                            entry.rank === 1
                              ? "text-yellow-300"
                              : entry.rank === 2
                              ? "text-slate-300"
                              : entry.rank === 3
                              ? "text-orange-300"
                              : "text-slate-400"
                          }`}
                        >
                          #{entry.rank}
                        </div>

                        <div className="min-w-0">
                          <p className="font-bold text-white truncate">{entry.username}</p>
                          <p className="text-sm text-slate-400">
                            Membre depuis{" "}
                            {new Date(entry.joined_at).toLocaleDateString("fr-FR")}
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center gap-3">
                        <p className="text-xl font-bold text-accent whitespace-nowrap">
                          {entry.total_points} pts
                        </p>
                        <button
                          onClick={() => handleViewTeam(entry.id)}
                          className="h-9 px-3 rounded-lg bg-accent/15 text-accent border border-accent/20 hover:bg-accent/20 transition-all text-sm"
                        >
                          Voir équipe
                        </button>
                      </div>
                    </div>
                  ))}

                  {leaderboard.length === 0 && (
                    <p className="text-center text-slate-400 py-8">
                      Aucun classement disponible
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Partage */}
            <div className="relative bg-gradient-to-br from-slate-900/90 to-slate-900/50 border border-slate-800/50 rounded-2xl p-6">
              <div className="absolute inset-0 bg-gradient-to-br from-accent/10 to-transparent rounded-2xl opacity-30 pointer-events-none" />
              <div className="relative">
                <h2 className="text-xl font-bold text-white mb-4">Partager la ligue</h2>

                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-slate-300 mb-2">Code d'invitation</p>
                    <div className="flex gap-2">
                      <div className="flex-1 bg-black/30 border border-slate-700/60 rounded-lg px-4 py-3 font-mono text-xl md:text-2xl font-bold text-center text-white">
                        {code}
                      </div>
                      <button
                        onClick={handleCopyCode}
                        className="w-12 rounded-lg bg-gradient-to-r from-accent to-accent/80 text-white font-semibold hover:opacity-95"
                        title="Copier le code"
                      >
                        {copied ? "✓" : "📋"}
                      </button>
                    </div>
                    {copied && (
                      <div className="mt-2 text-xs text-slate-400">
                        Copié !
                      </div>
                    )}
                  </div>

                  <div>
                    <p className="text-sm text-slate-300 mb-2">Lien d'invitation</p>
                    <button
                      onClick={handleCopyInviteLink}
                      className="w-full h-11 rounded-lg bg-gradient-to-r from-accent to-accent/80 text-white font-semibold hover:opacity-95"
                    >
                      {copied ? "Copié !" : "Copier le lien"}
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* Mon équipe */}
            <div className="relative bg-gradient-to-br from-slate-900/90 to-slate-900/50 border border-slate-800/50 rounded-2xl p-6">
              <div className="absolute inset-0 bg-gradient-to-br from-accent/10 to-transparent rounded-2xl opacity-30 pointer-events-none" />
              <div className="relative">
                <h2 className="text-xl font-bold text-white mb-4">Mon équipe</h2>

                {editingTeamName ? (
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={tempTeamName}
                      onChange={(e) => {
                        setTempTeamName(e.target.value);
                        setTeamNameError(null);
                      }}
                      onKeyDown={(e) => {
                        if (e.key === "Enter" && !savingTeamName) handleSaveTeamName();
                        if (e.key === "Escape") {
                          setEditingTeamName(false);
                          setTempTeamName(myTeamName);
                          setTeamNameError(null);
                        }
                      }}
                      placeholder="Nom de ton équipe"
                      maxLength={20}
                      autoFocus
                      className="w-full px-4 py-3 rounded-lg bg-black/30 border border-slate-700/60 text-white outline-none focus:ring-2 focus:ring-accent"
                    />

                    <div className="text-xs text-slate-400">3–20 caractères</div>

                    {teamNameError && (
                      <div className="rounded-lg border border-red-500/60 bg-red-500/10 px-3 py-2 text-red-300 text-sm">
                        {teamNameError}
                      </div>
                    )}

                    <div className="flex gap-2">
                      <button
                        onClick={handleSaveTeamName}
                        disabled={savingTeamName || !tempTeamName.trim()}
                        className="flex-1 h-10 rounded-lg bg-gradient-to-r from-accent to-accent/80 text-white font-semibold hover:opacity-95 disabled:opacity-50 text-sm"
                      >
                        {savingTeamName ? "Enregistrement..." : "Enregistrer"}
                      </button>
                      <button
                        onClick={() => {
                          setEditingTeamName(false);
                          setTempTeamName(myTeamName);
                          setTeamNameError(null);
                        }}
                        disabled={savingTeamName}
                        className="h-10 px-4 rounded-lg bg-slate-800/50 border border-slate-700/50 text-slate-200 hover:text-white hover:bg-slate-800 hover:border-slate-700 transition-all text-sm"
                      >
                        Annuler
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-3 p-4 bg-black/20 border border-slate-800/50 rounded-xl">
                      <div className="min-w-0">
                        <p className="text-xs text-slate-400 mb-1">Nom de l'équipe</p>
                        <p className="text-lg font-bold text-white truncate">
                          {myTeamName || "Pas encore défini"}
                        </p>
                      </div>

                      <button
                        onClick={() => {
                          setEditingTeamName(true);
                          setTempTeamName(myTeamName);
                        }}
                        className="h-9 px-3 rounded-lg bg-accent/15 text-accent border border-accent/20 hover:bg-accent/20 transition-all text-sm font-medium"
                      >
                        Modifier
                      </button>
                    </div>

                    {!myTeamName && (
                      <div className="p-3 bg-amber-950/20 border border-amber-900/30 rounded-lg">
                        <p className="text-xs text-amber-200/90">
                          Définis un nom en allant sur{" "}
                          <Link
                            href={`/my-team?leagueId=${league.id}`}
                            className="font-semibold underline"
                          >
                            Mon Équipe
                          </Link>
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Modale équipe */}
      {selectedTeam && (
        <div
          className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          onClick={() => setSelectedTeam(null)}
        >
          <div
            className="relative bg-gradient-to-br from-slate-900/90 to-slate-900/60 border border-slate-800/50 rounded-2xl p-8 max-w-2xl w-full max-h-[80vh] overflow-y-auto"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="absolute inset-0 bg-gradient-to-br from-accent/10 to-transparent rounded-2xl opacity-30 pointer-events-none" />
            <div className="relative">
              <h2 className="text-2xl font-bold text-white mb-4">
                Équipe de {selectedTeam.username}
              </h2>

              {selectedTeam.team ? (
                <>
                  <div className="mb-6">
                    <p className="text-slate-400 mb-1">Nom de l'équipe</p>
                    <p className="text-xl font-bold text-white">{selectedTeam.team.name}</p>
                  </div>

                  <div className="mb-6">
                    <p className="text-slate-400 mb-1">Constructeur</p>
                    <p className="text-xl font-bold text-white">{selectedTeam.team.constructor}</p>
                  </div>

                  <div>
                    <p className="text-slate-400 mb-3">Pilotes</p>
                    <div className="space-y-3">
                      {selectedTeam.drivers.map((driver) => (
                        <div
                          key={driver.id}
                          className="bg-black/20 border border-slate-800/50 rounded-xl p-4"
                        >
                          <div className="flex items-center justify-between gap-3">
                            <div className="min-w-0">
                              <p className="font-bold text-white truncate">
                                {driver.name}
                                {driver.rookie === 1 && (
                                  <span className="ml-2 text-xs bg-accent/20 text-accent px-2 py-1 rounded">
                                    Rookie
                                  </span>
                                )}
                              </p>
                              <p className="text-sm text-slate-400 truncate">
                                {driver.constructor_name}
                              </p>
                            </div>
                            <p className="text-lg font-bold text-accent whitespace-nowrap">
                              {driver.price}M
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <p className="text-center text-slate-400 py-8">
                  {selectedTeam.username} n'a pas encore créé d'équipe
                </p>
              )}

              <button
                onClick={() => setSelectedTeam(null)}
                className="w-full mt-6 h-11 rounded-lg bg-slate-800/50 border border-slate-700/50 text-slate-200 hover:text-white hover:bg-slate-800 hover:border-slate-700 transition-all"
              >
                Fermer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modale suppression */}
      {showDeleteModal && league && (
        <DeleteLeagueModal
          leagueName={league.name}
          leagueCode={code}
          memberCount={league.member_count}
          onConfirm={handleDeleteLeague}
          onCancel={() => setShowDeleteModal(false)}
          isDeleting={isDeleting}
        />
      )}
    </div>
  );
}
