"use client";

import { useEffect, useMemo, useState, useCallback } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { getDriverSeasons, DriverSeasonRow } from "@/lib/api/fantasy.api";
import { getConstructors, ConstructorRow } from "@/lib/api/constructors.api";
import { getToken } from "@/lib/auth/token";
import { getTeam, saveTeam, getDeadlineStatus, updateTeamName } from "@/lib/api/teams.api";
import GarageStage from "@/components/garage/garage-stage";
import DriverSlotCard from "@/components/garage/driver-slot-card";
import DriverStatsPopup from "@/components/driver-stats-popup";
import { Info, ArrowUpDown } from "lucide-react";

const SEASON_DEFAULT = 2026;
const BUDGET_MAX = 100;
const AUTOSAVE_DELAY = 0;

export default function MyTeamPage() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const leagueId = searchParams.get("leagueId");
  
  // États principaux
  const [season] = useState(SEASON_DEFAULT);
  const [teamName, setTeamName] = useState("");
  const [leagueName, setLeagueName] = useState("");
  const [teamBudget, setTeamBudget] = useState(BUDGET_MAX);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  // États pour la popup nom
  const [showNamePopup, setShowNamePopup] = useState(false);
  const [tempName, setTempName] = useState("");
  const [nameError, setNameError] = useState<string | null>(null);
  const [savingName, setSavingName] = useState(false);
  
  // États auto-save
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [saveError, setSaveError] = useState<string | null>(null);
  
  // États deadline
  const [deadlineState, setDeadlineState] = useState<"open" | "urgent" | "locked">("open");
  const [canEdit, setCanEdit] = useState(true);
  const [deadline, setDeadline] = useState<string | null>(null);
  const [unlockAt, setUnlockAt] = useState<string | null>(null);
  const [weekendName, setWeekendName] = useState<string | null>(null);
  const [timeRemaining, setTimeRemaining] = useState<string | null>(null);
  
  // Données disponibles
  const [constructors, setConstructors] = useState<ConstructorRow[]>([]);
  const [drivers, setDrivers] = useState<DriverSeasonRow[]>([]);
  
  // Sélections
  const [selectedConstructorsIds, setselectedConstructorsIds] = useState<number[]>([]);
  const [selectedDriverSeasonIds, setSelectedDriverSeasonIds] = useState<number[]>([]);

  // État pour l'apparition progressive du message
  const [showUnsavedMessage, setShowUnsavedMessage] = useState(false);

  // État pour forcer l'animation shake
  const [shakeKey, setShakeKey] = useState(0);

  // Chargement initial
  useEffect(() => {
    // Vérifier qu'on a un leagueId
    if (!leagueId) {
      router.push("/leagues");
      return;
    }

    const token = getToken();
    if (!token) {
      router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
      return;
    }

    setLoading(true);

    // Charger l'équipe depuis le backend
    getTeam(token, parseInt(leagueId))
      .then((data) => {
        console.log("Données reçues:", data); // DEBUG

        if (data.team) {
          const name = data.team.name?.trim() || "";
          setTeamName(name);
          
          setLeagueName(data.league?.name || "");
          console.log("Nom de la ligue:", data.league?.name); // DEBUG
          setTeamBudget(data.team.budget || BUDGET_MAX);
          
          // Afficher popup si pas de nom
          if (!name) {
            setShowNamePopup(true);
          }
          
          // Charger les écuries
          if (data.constructors.length > 0) {
            setselectedConstructorsIds(data.constructors.map(c => c.constructor_id));
          }
          
          // Charger les pilotes
          if (data.drivers.length > 0) {
            setSelectedDriverSeasonIds(data.drivers.map(d => d.driver_id));
          }
        } else {
          // Pas d'équipe = afficher popup
          setShowNamePopup(true);
        }
      })
      .catch((err) => {
        console.error("Erreur chargement équipe:", err);
        setError(err.message);
      });

    // Charger les données disponibles (constructeurs et pilotes)
    Promise.all([getConstructors(), getDriverSeasons(season)])
      .then(([c, d]) => {
        setConstructors(c);
        setDrivers(d);
      })
      .catch((e) => setError(e?.message ?? "Erreur chargement"))
      .finally(() => setLoading(false));

    // Charger le statut de la deadline
    loadDeadlineStatus();
  }, [leagueId, season, pathname, router]);

  // Fonction pour charger le statut deadline
  async function loadDeadlineStatus() {
    const token = getToken();
    if (!token || !leagueId) return;

    try {
      const status = await getDeadlineStatus(token, parseInt(leagueId));

      setDeadlineState(status.state);
      setCanEdit(status.canEdit);
      setDeadline(status.deadline);
      setUnlockAt(status.unlockAt);
      setWeekendName(status.weekendName);
      setTimeRemaining(status.timeRemaining);
    } catch (err) {
      console.error("Erreur chargement deadline:", err);
    }
  }

  // Rafraîchir le statut deadline toutes les 30 secondes
  useEffect(() => {
    const interval = setInterval(() => {
      loadDeadlineStatus();
    }, 30000); // 30 secondes

    return () => clearInterval(interval);
  }, [leagueId]);

  // Calculs dérivés
  const selectedConstructors = useMemo(
    () => constructors.filter(c => selectedConstructorsIds.includes(c.constructor_id)),
    [constructors, selectedConstructorsIds]
  );

  const selectedDrivers = useMemo(
    () => drivers.filter(d => selectedDriverSeasonIds.includes(d.driver_id)),
    [drivers, selectedDriverSeasonIds]
  );

  const budgetUsed = useMemo(() => {
    const constructorsPrice = selectedConstructors.reduce((sum, c) => sum + (c.price ?? 0), 0);
    const driversPrice = selectedDrivers.reduce((sum, d) => sum + (d.driver_price ?? 0), 0);
    return constructorsPrice + driversPrice;
  }, [selectedConstructors, selectedDrivers]);

  const budgetLeft = teamBudget - budgetUsed;
  const isOverBudget = budgetLeft < 0;

  // Équipe valide = prête pour sauvegarde
  const isValidTeam =
    canEdit && // Ne pas sauvegarder si verrouillé
    selectedConstructorsIds.length === 2 &&
    selectedDriverSeasonIds.length === 5 &&
    !isOverBudget &&
    teamName.trim().length > 0;

  // Fonction auto-save
  const performAutoSave = useCallback(async () => {
    const token = getToken();
    if (!token || !leagueId) return;

    // Ne sauvegarder que si l'équipe est valide
    if (!isValidTeam) return;

    setSaveStatus('saving');
    setSaveError(null);

    try {
      await saveTeam(token, parseInt(leagueId), {
        teamName: teamName.trim(),
        constructorIds: selectedConstructorsIds,
        driverIds: selectedDriverSeasonIds,
      });

      // Garder le spinner pendant 1 seconde même si c'est instantané
      setTimeout(() => {
        setSaveStatus('saved');
      }, 1000); // 1 seconde de spinner

    } catch (err: any) {
      setSaveStatus('error');
      setSaveError(err?.message ?? "Erreur sauvegarde");
      console.error("Erreur auto-save:", err);
    }
  }, [leagueId, teamName, selectedConstructorsIds, selectedDriverSeasonIds, isValidTeam]);

  // Auto-save avec debounce
  useEffect(() => {
    // Ne déclencher le timer que si l'équipe est valide
    if (!isValidTeam) {
      if (selectedConstructorsIds.length > 0 || selectedDriverSeasonIds.length > 0) {
        setSaveStatus('idle'); // Montrera "Modifications non enregistrées"
      }
      return;
    }

    const timer = setTimeout(() => {
      performAutoSave();
    }, AUTOSAVE_DELAY);

    return () => clearTimeout(timer);
  }, [isValidTeam, performAutoSave, selectedConstructorsIds.length, selectedDriverSeasonIds.length]);

  // Fonctions de toggle
  function toggleConstructor(id: number) {
    if (!canEdit) return; // Bloqué si deadline passée
    
    setselectedConstructorsIds(prev => {
      const exists = prev.includes(id);
      if (exists) return prev.filter(x => x !== id);
      if (prev.length >= 2) return prev;
      return [...prev, id];
    });
  }

  function toggleDriver(driverSeasonId: number) {
    if (!canEdit) return; // Bloqué si deadline passée
    
    setSelectedDriverSeasonIds(prev => {
      const exists = prev.includes(driverSeasonId);
      if (exists) return prev.filter(x => x !== driverSeasonId);
      if (prev.length >= 5) return prev;
      return [...prev, driverSeasonId];
    });
  }

  // Retry sauvegarde en cas d'erreur
  function retrySave() {
    performAutoSave();
  }

  // Valider le nom depuis la popup
  async function handleValidateName() {
    const token = getToken();
    if (!token || !leagueId) return;

    const name = tempName.trim();
    
    // Validation côté client
    if (!name) {
      setNameError("Le nom est requis");
      return;
    }
    
    if (name.length < 3) {
      setNameError("Le nom doit contenir au moins 3 caractères");
      return;
    }
    
    if (name.length > 20) {
      setNameError("Le nom ne doit pas dépasser 20 caractères");
      return;
    }

    setSavingName(true);
    setNameError(null);

    try {
      await updateTeamName(token, parseInt(leagueId), name);
      
      // Succès
      setTeamName(name);
      setShowNamePopup(false);
      setTempName("");
    } catch (err: any) {
      setNameError(err?.message ?? "Erreur lors de la validation");
    } finally {
      setSavingName(false);
    }
  }

  useEffect(() => {
    if (isOverBudget) {
      setShakeKey(prev => prev + 1); // Force le re-render de l'animation
    }
  }, [isOverBudget]);

  useEffect(() => {
    if (saveStatus === 'idle') {
      const timer = setTimeout(() => {
        setShowUnsavedMessage(true);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      setShowUnsavedMessage(false);
    }
  }, [saveStatus]);

  // Affichage loading/error
  if (loading) return <div className="p-6 text-white">Chargement…</div>;
  if (error) return <div className="p-6 text-red-300">{error}</div>;

  // Préparation des données pour le garage
  const rightSlug = selectedConstructors[0]?.slug ?? "default";
  const leftSlug = selectedConstructors[1]?.slug ?? "default";
  
  const driverSlots = [
    { label: "Pilote 1", className: "left-1/2 top-[20%] w-[15%] -translate-x-1/2" },
    { label: "Pilote 2", className: "left-[27%] top-[33%] w-[17%] translate-x-0" },
    { label: "Pilote 3", className: "right-[27%] top-[33%] w-[17%] translate-x-0" },
    { label: "Pilote 4", className: "left-[10%] top-[43%] w-[19%] translate-x-0" },
    { label: "Pilote 5", className: "right-[10%] top-[43%] w-[19%] translate-x-0" },
  ] as const;

  return (
    <div className="h-screen bg-background text-white overflow-hidden">
      {/* HUD global */}
      <div className="h-16 px-6 flex items-center justify-between gap-6 border-b border-white/10">
        <div className="flex items-center gap-6">
          {/* Nom de l'équipe (read-only) */}
          <div>
            <div className="text-xs opacity-70">Nom de l'équipe</div>
            <div className="text-sm font-semibold text-white/90">
              {teamName || "Sans nom"}
            </div>
          </div>
          
          {/* Budget */}
          <div>
            <div className="text-xs opacity-70">Budget</div>
            <div 
              key={shakeKey}
              className={`text-lg font-semibold transition-all ${
                isOverBudget 
                  ? "text-red-500 animate-shake" 
                  : ""
              }`}
            >
              {budgetUsed.toFixed(1)} / {teamBudget.toFixed(1)} M
              <span className={`ml-3 text-sm opacity-70 ${
                isOverBudget ? "text-red-400" : ""
              }`}>
                (reste {budgetLeft.toFixed(1)} M)
              </span>
            </div>
          </div>

          <div className="text-sm opacity-70">
            Écuries: {selectedConstructorsIds.length}/2 • Pilotes: {selectedDriverSeasonIds.length}/5
          </div>
        </div>

        {/* Centre = titre + timer */}
        <div className="text-center">
          <div className="text-lg font-bold leading-tight">Mon Équipe</div>
          {/* Afficher le nom de la ligue */}
          <div className="text-xs text-white/60">
            {leagueName || `Ligue ${leagueId}`} • Saison {season}
          </div>

          {/* Timer selon l'état */}
          {deadlineState === "open" && deadline && timeRemaining && (
            <div className="text-xs mt-1 text-slate-400">
              Verrouillage dans {timeRemaining}
            </div>
          )}

          {deadlineState === "urgent" && deadline && timeRemaining && (
            <div className="text-xs mt-1 text-orange-400 font-semibold">
              ⚠️ Verrouillage dans {timeRemaining}
            </div>
          )}

          {deadlineState === "locked" && unlockAt && timeRemaining && (
            <div className="text-xs mt-1 text-red-400">
              🔒 Déverrouillage dans {timeRemaining}
            </div>
          )}
        </div>

        {/* Indicateur sauvegarde */}
        <div className="flex items-center gap-3">
          {saveStatus === 'idle' && showUnsavedMessage && (
            <div className="flex items-center gap-2 text-sm text-orange-400 animate-fade-in">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
              <span>Modifications non enregistrées</span>
            </div>
          )}
          
          {saveStatus === 'saving' && (
            <div className="flex items-center gap-2 text-sm text-yellow-400">
              <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              <span>Sauvegarde...</span>
            </div>
          )}
          
          {saveStatus === 'saved' && (
            <div className="flex items-center gap-2 text-sm text-green-400 font-medium">
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Sauvegardé</span>
            </div>
          )}
          
          {saveStatus === 'error' && (
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-2 text-sm text-red-400">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
                <span>Erreur de sauvegarde</span>
              </div>
              <button
                onClick={retrySave}
                className="text-xs px-2 py-1 bg-red-500/20 hover:bg-red-500/30 border border-red-500/50 rounded transition-colors"
              >
                Réessayer
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Message d'erreur détaillé si besoin */}
      {saveError && (
        <div className="px-6 py-2 bg-red-900/20 border-b border-red-700/50 text-center text-sm text-red-400">
          {saveError}
        </div>
      )}

      {/* Contenu : garage + panel */}
      <div className="h-[calc(100vh-4rem)] grid grid-cols-[4fr_1fr] gap-2">
        {/* LEFT : garage */}
        <div className="h-full relative">
          {/* BANDEAU URGENT (orange) */}
          {deadlineState === "urgent" && deadline && timeRemaining && (
            <div className="absolute top-2 left-2 right-2 z-50 pointer-events-none">
              <div className="px-4 py-2 rounded-md bg-orange-900/80 backdrop-blur border border-orange-700/50">
                <div className="flex items-center justify-center gap-2 text-orange-100 text-sm font-semibold">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                      d="M12 9v2m0 4h.01m-6.938 4h13.856
                        c1.54 0 2.502-1.667 1.732-3L13.732 4
                        c-.77-1.333-2.694-1.333-3.464 0L3.34 16
                        c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <span>⚠️ Attention ! Verrouillage dans {timeRemaining}</span>
                </div>
              </div>
            </div>
          )}

          {/* BANDEAU VERROUILLÉ (rouge) */}
          {deadlineState === "locked" && weekendName && timeRemaining && (
            <div className="absolute top-2 left-2 right-2 z-50 pointer-events-none">
              <div className="px-4 py-3 rounded-md bg-red-900/80 backdrop-blur border border-red-700/50">
                <div className="flex flex-col items-center justify-center gap-1 text-red-100">
                  <div className="flex items-center gap-2 text-sm font-bold">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
                        d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                    </svg>
                    <span>🔒 Équipe verrouillée pour le weekend de {weekendName}</span>
                  </div>
                  <div className="text-xs text-red-200">
                    Prochaine période dans {timeRemaining}
                  </div>
                </div>
              </div>
            </div>
          )}

          <GarageStage
            backgroundSrc="/garage/background.png"
            carRightSlug={rightSlug}
            carLeftSlug={leftSlug}
            className="h-full w-full rounded-none border-0"
            carsScale="xl"
            carsLift="lg"
          >
            {/* Slots pilotes */}
            <div className="absolute inset-0 z-30 pointer-events-none">
              {driverSlots.map((slot, i) => (
                <div key={slot.label} className={`absolute ${slot.className} pointer-events-auto`}>
                  <DriverSlotCard
                    label={slot.label}
                    driver={
                      selectedDrivers[i]
                        ? {
                            id: selectedDrivers[i].driver_id,
                            name: selectedDrivers[i].driver_name,
                            teamName: selectedDrivers[i].constructor_name,
                            price: selectedDrivers[i].driver_price,
                          }
                        : undefined
                    }
                    avatarIndex={i}
                  />
                </div>
              ))}
            </div>
          </GarageStage>
        </div>

        {/* RIGHT : panel de sélection */}
        <div className="h-[calc(100vh-4rem)] p-1">
          <div className="h-full overflow-hidden rounded-2xl border border-white/10 bg-black/25">
            <div className="h-full overflow-y-auto p-2">
              <RightSelectorPanel
                constructors={constructors}
                drivers={drivers}
                selectedConstructorsIds={selectedConstructorsIds}
                selectedDriverSeasonIds={selectedDriverSeasonIds}
                onToggleConstructor={toggleConstructor}
                onToggleDriver={toggleDriver}
                canEdit={canEdit}
              />
            </div>
          </div>
        </div>
      </div>

      {/* POPUP MODALE - Nom d'équipe obligatoire */}
      {showNamePopup && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm flex items-center justify-center z-[100] p-4">
          <div className="bg-gradient-to-br from-slate-900 to-slate-900/95 border-2 border-accent/50 rounded-2xl p-8 max-w-md w-full shadow-2xl">
            {/* Header */}
            <div className="text-center mb-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-red-600 to-red-700 rounded-full mb-4 shadow-lg shadow-red-900/50">
                <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                </svg>
              </div>
              <h2 className="text-3xl font-bold text-white mb-2">Nomme ton équipe !</h2>
              <p className="text-slate-400 text-sm">
                Choisis un nom unique pour cette ligue
              </p>
            </div>

            {/* Input */}
            <div className="mb-6">
              <input
                type="text"
                value={tempName}
                onChange={(e) => {
                  setTempName(e.target.value);
                  setNameError(null);
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !savingName) {
                    handleValidateName();
                  }
                }}
                placeholder="Ex: Road to F1"
                maxLength={20}
                autoFocus
                className="w-full px-4 py-3 rounded-lg bg-black/30 border border-white/20 text-white text-center text-lg font-semibold placeholder:text-slate-500 outline-none focus:ring-2 focus:ring-accent focus:border-accent transition-all"
              />
              <div className="mt-2 text-xs text-slate-500 text-center">
                3-20 caractères
              </div>
            </div>

            {/* Erreur */}
            {nameError && (
              <div className="mb-4 rounded-lg border border-red-500/50 bg-red-500/10 px-4 py-3 text-red-400 text-sm text-center">
                {nameError}
              </div>
            )}

            {/* Info */}
            <div className="mb-6 p-4 bg-blue-950/30 border border-blue-900/40 rounded-lg">
              <div className="flex items-start gap-2">
                <svg className="w-4 h-4 text-blue-400 mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
                <p className="text-xs text-blue-300/90">
                  Tu pourras modifier ce nom à tout moment depuis <span className="font-semibold">Mes Ligues</span>
                </p>
              </div>
            </div>

            {/* Bouton */}
            <button
              onClick={handleValidateName}
              disabled={savingName || !tempName.trim()}
              className="w-full px-6 py-4 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-600 text-white font-bold rounded-lg transition-all duration-200 shadow-lg shadow-red-900/30 hover:shadow-red-900/50 disabled:opacity-50 disabled:cursor-not-allowed text-lg"
            >
              {savingName ? "Validation..." : "Je veux jouer !"}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

// Type pour le mode de tri
type SortMode = "default" | "asc" | "desc";

function RightSelectorPanel(props: {
  constructors: ConstructorRow[];
  drivers: DriverSeasonRow[];
  selectedConstructorsIds: number[];
  selectedDriverSeasonIds: number[];
  onToggleConstructor: (id: number) => void;
  onToggleDriver: (id: number) => void;
  canEdit: boolean;
}) {
  const {
    constructors,
    drivers,
    selectedConstructorsIds,
    selectedDriverSeasonIds,
    onToggleConstructor,
    onToggleDriver,
    canEdit,
  } = props;

  const [viewMode, setViewMode] = useState<"drivers" | "teams">("drivers");
  const [statsDriverId, setStatsDriverId] = useState<number | null>(null);
  
  // État de tri
  const [sortMode, setSortMode] = useState<SortMode>("default");

  // Fonction pour changer le mode de tri
  function cycleSortMode() {
    setSortMode(prev => {
      if (prev === "default") return "asc";
      if (prev === "asc") return "desc";
      return "default";
    });
  }

  // Tri des pilotes
  const sortedDrivers = useMemo(() => {
    if (sortMode === "default") return drivers;
    
    return [...drivers].sort((a, b) => {
      if (sortMode === "asc") {
        return a.driver_price - b.driver_price;
      }
      return b.driver_price - a.driver_price;
    });
  }, [drivers, sortMode]);

  // Tri des écuries
  const sortedConstructors = useMemo(() => {
    if (sortMode === "default") return constructors;
    
    return [...constructors].sort((a, b) => {
      if (sortMode === "asc") {
        return a.price - b.price;
      }
      return b.price - a.price;
    });
  }, [constructors, sortMode]);

  return (
    <div className="h-full flex flex-col p-0">
      {/* Toggle + Sort button */}
      <div className="flex gap-2 mb-3">
        <button
          onClick={() => setViewMode("drivers")}
          className={`flex-1 px-3 py-2 rounded-lg font-medium text-sm transition-colors ${
            viewMode === "drivers"
              ? "bg-accent text-accent-foreground"
              : "bg-secondary text-foreground hover:bg-muted"
          }`}
        >
          Pilotes
        </button>

        <button
          onClick={() => setViewMode("teams")}
          className={`flex-1 px-3 py-2 rounded-lg font-medium text-sm transition-colors ${
            viewMode === "teams"
              ? "bg-accent text-accent-foreground"
              : "bg-secondary text-foreground hover:bg-muted"
          }`}
        >
          Écuries
        </button>

        {/* Bouton de tri */}
        <button
          onClick={cycleSortMode}
          className="px-2 py-2 w-20 rounded-lg font-medium text-sm bg-secondary text-foreground hover:bg-muted transition-colors flex items-center justify-between"
        >
          <ArrowUpDown className="w-4 h-4 opacity-70" />
          <span>
            {sortMode === "default" && "Écurie"}
            {sortMode === "asc" && "Prix"}
            {sortMode === "desc" && "Prix"}
          </span>

          {(sortMode === "asc" || sortMode === "desc") && (
            <span>
              {sortMode === "asc" ? "↑" : "↓"}
            </span>
          )}
        </button>
      </div>

      {/* Scrollable list */}
      <div className="h-[calc(100vh-4rem-50px)] overflow-y-scroll pr-1 space-y-2">
        {viewMode === "drivers" && (
          <>
            <div className="text-xs text-white/60 mb-2">
              Sélectionne 5 pilotes • {selectedDriverSeasonIds.length}/5
            </div>

            {sortedDrivers.map((d) => {
              const selected = selectedDriverSeasonIds.includes(d.driver_id);
              const disabled = (!selected && selectedDriverSeasonIds.length >= 5) || !canEdit;

              return (
                <div
                  key={d.driver_id}
                  onClick={() => !disabled && onToggleDriver(d.driver_id)}
                  className={[
                    "w-full text-left rounded-xl p-3 bg-black/30 hover:bg-black/40 border transition-colors cursor-pointer",
                    selected ? "border-white/60" : "border-white/10",
                    disabled ? "opacity-40 cursor-not-allowed" : ""
                  ].join(" ")}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      <div className="font-semibold truncate">{d.driver_name}</div>
                      <div className="text-xs text-white/60 truncate">{d.constructor_name}</div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="text-sm text-white/80 whitespace-nowrap">
                        {d.driver_price.toFixed(1)} M
                      </div>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          setStatsDriverId(d.driver_id);
                        }}
                        className="w-5 h-5 flex items-center justify-center bg-white/10 hover:bg-white/20 rounded-full transition-colors group"
                      >
                        <Info className="w-3 h-3 text-white/60 group-hover:text-blue-400 transition-colors" />
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </>
        )}

        {viewMode === "teams" && (
          <>
            <div className="text-xs text-white/60 mb-2">
              Sélectionne 2 écuries • {selectedConstructorsIds.length}/2
            </div>

            {sortedConstructors.map((c) => {
              const selected = selectedConstructorsIds.includes(c.constructor_id);
              const disabled = (!selected && selectedConstructorsIds.length >= 2) || !canEdit;

              return (
                <button
                  key={c.constructor_id}
                  onClick={() => onToggleConstructor(c.constructor_id)}
                  disabled={disabled}
                  className={[
                    "w-full text-left rounded-xl p-3 bg-black/30 hover:bg-black/40 border transition-colors",
                    selected ? "border-white/60" : "border-white/10",
                    disabled ? "opacity-40 cursor-not-allowed" : ""
                  ].join(" ")}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="font-semibold truncate">{c.name}</div>
                    <div className="text-sm text-white/80 whitespace-nowrap">
                      {c.price.toFixed(1)} M
                    </div>
                  </div>
                </button>
              );
            })}
          </>
        )}
      </div>

      {/* Popup stats */}
      {statsDriverId && (
        <DriverStatsPopup
          driverId={statsDriverId}
          onClose={() => setStatsDriverId(null)}
        />
      )}
    </div>
  );
}