"use client";

import { useEffect, useMemo, useState, useCallback, Suspense } from "react";
import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { getDriverSeasons, DriverSeasonRow } from "@/lib/api/fantasy.api";
import { getConstructors, ConstructorRow } from "@/lib/api/constructors.api";
import { getToken } from "@/lib/auth/token";
import { getTeam, saveTeam, getDeadlineStatus, updateTeamName } from "@/lib/api/teams.api";
import GarageStage from "@/components/garage/garage-stage";
import DriverSlotCard from "@/components/garage/driver-slot-card";
import DriverStatsPopup from "@/components/driver-stats-popup";
import { Info, ArrowUpDown } from "lucide-react";
import { useTranslations } from "next-intl";

const SEASON_DEFAULT = 2026;
const BUDGET_INITIAL = 100;
const BUDGET_MAX = 200;
const AUTOSAVE_DELAY = 0;

export function MyTeamContent() {
  const t = useTranslations("myTeam");
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const leagueId = searchParams.get("leagueId");
  
  // États principaux
  const [season] = useState(SEASON_DEFAULT);
  const [teamName, setTeamName] = useState("");
  const [leagueName, setLeagueName] = useState("");
  const [leagueCode, setLeagueCode] = useState<string | null>(null);
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
  const [selectedConstructorsIds, setselectedConstructorsIds] = useState<(number | null)[]>([null, null]);
  const [selectedDriverSeasonIds, setSelectedDriverSeasonIds] = useState<(number | null)[]>([null, null, null, null, null]);
  const [captainDriverId, setCaptainDriverId] = useState<number | null>(null);

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
        console.log("Données reçues:", data);

        // Si pas d'équipe du tout, afficher la popup
        if (!data.team) {
          console.log("🔴 Aucune équipe trouvée, popup affichée");
          setShowNamePopup(true);
          setLeagueName(data.league?.name || "");
          setLeagueCode(data.league?.code || null);
          setTeamBudget(BUDGET_INITIAL);
          return; // Sortir ici
        }

        // Si équipe existe
        const name = data.team.name?.trim() || "";
        setTeamName(name);
        setLeagueName(data.league?.name || "");
        setLeagueCode(data.league?.code || null);
        setTeamBudget(data.team.budget || BUDGET_MAX);
        
        // Afficher popup si nom vide
        if (!name || name.length === 0) {
          console.log("🔴 Équipe sans nom, popup affichée");
          setShowNamePopup(true);
        }
        
        // Charger les écuries
        if (data.constructors && data.constructors.length > 0) {
          const cSlots: (number | null)[] = [null, null]; 
          data.constructors.forEach((c, i) => {
            if (i < 2) cSlots[i] = c.constructor_id;
          });
          setselectedConstructorsIds(cSlots);
        } else {
          setselectedConstructorsIds([null, null]);
        }

        // Charger les pilotes
        if (data.drivers && data.drivers.length > 0) {
          const slots: (number | null)[] = [null, null, null, null, null];
          let captain: number | null = null;
          
          data.drivers.forEach((d, i) => {
            if (i < 5) {
              slots[i] = d.driver_id;
              if (d.is_captain === 1) {
                captain = d.driver_id;
              }
            }
          });
          
          setSelectedDriverSeasonIds(slots);
          setCaptainDriverId(captain);
        } else {
          setSelectedDriverSeasonIds([null, null, null, null, null]);
          setCaptainDriverId(null);
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
    () => selectedConstructorsIds.map(id => id ? constructors.find(c => c.constructor_id === id) : null),
    [constructors, selectedConstructorsIds]
  );

  const selectedDrivers = useMemo(
    () => selectedDriverSeasonIds.map(id => id ? drivers.find(d => d.driver_id === id) : null),
    [drivers, selectedDriverSeasonIds]
  );

  const budgetUsed = useMemo(() => {
    const constructorsPrice = selectedConstructors.reduce((sum, c) => sum + (c?.price ?? 0), 0);
    const driversPrice = selectedDrivers.reduce((sum, d) => sum + (d?.driver_price ?? 0), 0);
    return constructorsPrice + driversPrice;
  }, [selectedConstructors, selectedDrivers]);

  const budgetLeft = teamBudget - budgetUsed;
  const isOverBudget = budgetLeft < 0;

  // Équipe valide = prête pour sauvegarde
  const isValidTeam =
    canEdit && 
    selectedConstructorsIds.filter(id => id !== null).length === 2 &&
    selectedDriverSeasonIds.filter(id => id !== null).length === 5 &&
    !isOverBudget &&
    teamName.trim().length > 0;

  // Fonction auto-save
  const performAutoSave = useCallback(async () => {
    const token = getToken();
    if (!token || !leagueId) return;

    if (!isValidTeam) return;

    setSaveStatus('saving');
    setSaveError(null); // Réinitialiser l'erreur avant de sauvegarder

    const driverIdsToSave = selectedDriverSeasonIds.filter((id): id is number => id !== null);
    const constructorIdsToSave = selectedConstructorsIds.filter((id): id is number => id !== null);

    try {
      await saveTeam(token, parseInt(leagueId), {
        teamName: teamName.trim(),
        constructorIds: constructorIdsToSave,
        driverIds: driverIdsToSave,
        captainDriverId: captainDriverId,
      });
      
      setSaveError(null); // Réinitialiser après succès
      setTimeout(() => { setSaveStatus('saved'); }, 1000);
    } catch (err: any) {
      setSaveStatus('error');
      setSaveError(err?.message ?? "Erreur sauvegarde");
    }
  }, [leagueId, teamName, selectedConstructorsIds, selectedDriverSeasonIds, captainDriverId, isValidTeam]);
  
  useEffect(() => {
    // Ne déclencher le timer que si l'équipe est valide
    if (!isValidTeam) {
      if (selectedConstructorsIds.length > 0 || selectedDriverSeasonIds.length > 0) {
        setSaveStatus('idle'); // Montrera "Non sauvegardé"
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
    if (!canEdit) return;
    
    setselectedConstructorsIds(prev => {
      const currentIndex = prev.indexOf(id);

      if (currentIndex !== -1) {
        // Désélection : on remet le slot à null
        const next = [...prev];
        next[currentIndex] = null;
        return next;
      } else {
        // Sélection : on cherche le premier slot vide (null)
        const firstEmptySlot = prev.indexOf(null);
        if (firstEmptySlot !== -1 && !prev.includes(id)) {
          const next = [...prev];
          next[firstEmptySlot] = id;
          return next;
        }
        return prev;
      }
    });
  }

  function toggleDriver(driverSeasonId: number) {
    if (!canEdit) return;

    setSelectedDriverSeasonIds(prev => {
      const currentIndex = prev.indexOf(driverSeasonId);

      if (currentIndex !== -1) {
        const next = [...prev];
        next[currentIndex] = null;
        
        if (captainDriverId === driverSeasonId) {
          setCaptainDriverId(null);
        }
        
        return next;
      } else {
        const firstEmptySlot = prev.indexOf(null);
        if (firstEmptySlot !== -1 && !prev.includes(driverSeasonId)) {
          const next = [...prev];
          next[firstEmptySlot] = driverSeasonId;
          return next;
        }
        return prev;
      }
    });
  }

  function toggleCaptain(driverId: number) {
    if (!canEdit) return;
    
    // Si on clique sur le capitaine actuel, on le désélectionne
    if (captainDriverId === driverId) {
      setCaptainDriverId(null);
    } else {
      // Sinon, on définit le nouveau capitaine
      setCaptainDriverId(driverId);
    }
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
      
      // Si l'équipe est complète, déclencher une sauvegarde pour calculer initial_spent
      const driverIdsToSave = selectedDriverSeasonIds.filter((id): id is number => id !== null);
      const constructorIdsToSave = selectedConstructorsIds.filter((id): id is number => id !== null);
      
      if (driverIdsToSave.length === 5 && constructorIdsToSave.length === 2) {
        console.log("🔄 Sauvegarde automatique après validation du nom...");
        await saveTeam(token, parseInt(leagueId), {
          teamName: name,
          constructorIds: constructorIdsToSave,
          driverIds: driverIdsToSave,
          captainDriverId: captainDriverId,
        });
        console.log("✅ Équipe sauvegardée avec initial_spent calculé");
        
        // Recharger l'équipe pour obtenir le nouveau budget
        const updatedTeam = await getTeam(token, parseInt(leagueId));
        if (updatedTeam.team) {
          setTeamBudget(updatedTeam.team.budget);
        }
      }
      
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
  if (loading) return <div className="p-6 text-white">{t("loading")}</div>;
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
        
        {/* GAUCHE : Bouton retour + Identité */}
        <div className="flex items-center gap-4">
          {/* Bouton retour à la ligue */}
          {leagueId && leagueCode && (
            <button
              onClick={() => router.push(`/leagues/${leagueCode}`)}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-white/90 hover:bg-white/10 hover:border-white/20 hover:text-white transition-all text-sm font-medium"
            >
              <svg 
                className="w-4 h-4" 
                fill="none" 
                stroke="currentColor" 
                viewBox="0 0 24 24"
              >
                <path 
                  strokeLinecap="round" 
                  strokeLinejoin="round" 
                  strokeWidth={2} 
                  d="M10 19l-7-7m0 0l7-7m-7 7h18" 
                />
              </svg>
              <span>{t("back")}</span>
            </button>
          )}

          {/* Identité */}
          <div className="ml-4">
            <div className="text-lg font-semibold text-white/90">
              {teamName || t("noName")}
            </div>
            <div className="text-xs text-white/60">
              {leagueName || "FSF Officiel"} • {t("season")} {season}
            </div>
          </div>
        </div>

        {/* CENTRE : Budget */}
        <div className="text-center">
          <div 
            key={shakeKey}
            className={`text-lg font-semibold transition-all ${
              isOverBudget ? "text-red-500 animate-shake" : ""
            }`}
          >
            {t("budget.label")} : {budgetUsed.toFixed(1)} / {teamBudget.toFixed(1)} {t("budget.unit")}
          </div>
          <div className={`text-xs opacity-70 ${isOverBudget ? "text-red-400" : ""}`}>
            ({t("budget.remaining")} {budgetLeft.toFixed(1)} {t("budget.unit")})
          </div>
        </div>

        {/* DROITE : Sauvegarde (Haut) + Infos (Bas) */}
        <div className="flex flex-col items-end gap-1">
          
          {/* Ligne 1 : Statut Sauvegarde */}
          <div className="h-5 flex items-center">
            {saveStatus === 'idle' && showUnsavedMessage && (
              <div className="flex items-center gap-2 text-sm text-orange-400 animate-fade-in">
                <span>{t("save.unsaved")}</span>
              </div>
            )}
            
            {saveStatus === 'saving' && (
              <div className="flex items-center gap-2 text-sm text-yellow-400">
                <svg className="animate-spin h-4 w-4" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>{t("save.saving")}</span>
              </div>
            )}
            
            {saveStatus === 'saved' && (
              <div className="flex items-center gap-2 text-sm text-green-400 font-medium">
                <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
                <span>{t("save.saved")}</span>
              </div>
            )}

            {saveStatus === 'error' && (
              <div className="flex items-center gap-2 text-sm text-red-400">
                 <span>{t("save.error")}</span>
                 <button onClick={retrySave} className="underline">{t("save.retry")}</button>
              </div>
            )}
          </div>

          {/* Ligne 2 : Compo + Deadline */}
          <div className="flex items-center gap-55">
            <div className="text-sm opacity-70">
              {t("composition.constructors")} : {selectedConstructorsIds.filter(id => id !== null).length} / 2 | {t("composition.drivers")} : {selectedDriverSeasonIds.filter(id => id !== null).length} / 5
            </div>

            {deadlineState === "open" && timeRemaining && (
              <div className="text-xs text-slate-400">
                {t("deadline.lockingIn")} {timeRemaining}
              </div>
            )}

            {deadlineState === "urgent" && timeRemaining && (
              <div className="text-xs text-orange-400 font-semibold">
                ⚠️ {t("deadline.lockingIn")} {timeRemaining}
              </div>
            )}

            {deadlineState === "locked" && timeRemaining && (
              <div className="text-xs text-red-400">
                🔒 {t("deadline.locked")} ({timeRemaining})
              </div>
            )}
          </div>
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
                  <span>{t("deadline.urgentWarning")} {timeRemaining}</span>
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
                    <span>{t("deadline.locked")} {weekendName}</span>
                  </div>
                  <div className="text-xs text-red-200">
                    {t("deadline.nextPeriod")} {timeRemaining}
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
              {driverSlots.map((slot, i) => {
                // On récupère le pilote à cet index précis
                const driverAtSlot = selectedDrivers[i]; 

                return (
                  <div key={slot.label} className={`absolute ${slot.className} pointer-events-auto`}>
                    <DriverSlotCard
                      label={slot.label}
                      driver={
                        driverAtSlot
                          ? {
                              id: driverAtSlot.driver_id,
                              name: driverAtSlot.driver_name,
                              teamName: driverAtSlot.constructor_name,
                              price: driverAtSlot.driver_price,
                            }
                          : undefined
                      }
                      avatarIndex={i}
                      isCaptain={driverAtSlot?.driver_id === captainDriverId}
                      onToggleCaptain={driverAtSlot ? () => toggleCaptain(driverAtSlot.driver_id) : undefined}
                      canEdit={canEdit}
                      showBadge={captainDriverId === null || driverAtSlot?.driver_id === captainDriverId} // ✅ Nouveau : afficher seulement si pas de capitaine OU si c'est lui
                    />
                  </div>
                );
              })}
            </div>
          </GarageStage>
        </div>

        {/* RIGHT : panel de sélection */}
        <div className="h-[calc(100vh-4rem)] p-1">
          <div className="h-full  rounded-2xl border border-white/10 bg-black/25">
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
              <h2 className="text-3xl font-bold text-white mb-2">{t("namePopup.title")}</h2>
              <p className="text-slate-400 text-sm">
                {t("namePopup.description")}
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
                placeholder={t("namePopup.placeholder")}
                maxLength={20}
                autoFocus
                className="w-full px-4 py-3 rounded-lg bg-black/30 border border-white/20 text-white text-center text-lg font-semibold placeholder:text-slate-500 outline-none focus:ring-2 focus:ring-accent focus:border-accent transition-all"
              />
              <div className="mt-2 text-xs text-slate-500 text-center">
                {t("namePopup.hint")}
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
                  {t("namePopup.info")} <span className="font-semibold">{t("namePopup.infoLink")}</span>
                </p>
              </div>
            </div>

            {/* Bouton */}
            <button
              onClick={handleValidateName}
              disabled={savingName || !tempName.trim()}
              className="w-full px-6 py-4 bg-gradient-to-r from-red-600 to-red-500 hover:from-red-500 hover:to-red-600 text-white font-bold rounded-lg transition-all duration-200 shadow-lg shadow-red-900/30 hover:shadow-red-900/50 disabled:opacity-50 disabled:cursor-not-allowed text-lg"
            >
              {savingName ? t("namePopup.submitting") : t("namePopup.submit")}
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

export default function MyTeamPage() {
  return (
    <Suspense fallback={
      <div className="h-screen bg-background flex items-center justify-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-accent border-t-transparent"></div>
      </div>
    }>
      <MyTeamContent />
    </Suspense>
  );
}

// Type pour le mode de tri
type SortMode = "default" | "asc" | "desc";

function RightSelectorPanel(props: {
  constructors: ConstructorRow[];
  drivers: DriverSeasonRow[];
  selectedConstructorsIds: (number | null)[]; // Adapté pour les slots
  selectedDriverSeasonIds: (number | null)[]; // Adapté pour les slots
  onToggleConstructor: (id: number) => void;
  onToggleDriver: (id: number) => void;
  canEdit: boolean;
}) {
  const t = useTranslations("myTeam");
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
  
  // Compteurs pour l'affichage (car les tableaux contiennent maintenant des nulls)
  const nbDrivers = selectedDriverSeasonIds.filter(id => id !== null).length;
  const nbConstructors = selectedConstructorsIds.filter(id => id !== null).length;

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
          {t("panel.drivers")}
        </button>

        <button
          onClick={() => setViewMode("teams")}
          className={`flex-1 px-3 py-2 rounded-lg font-medium text-sm transition-colors ${
            viewMode === "teams"
              ? "bg-accent text-accent-foreground"
              : "bg-secondary text-foreground hover:bg-muted"
          }`}
        >
          {t("panel.constructors")}
        </button>

        {/* Bouton de tri */}
        <button
          onClick={cycleSortMode}
          className="px-2 py-2 w-20 rounded-lg font-medium text-sm bg-secondary text-foreground hover:bg-muted transition-colors flex items-center justify-between"
        >
          <ArrowUpDown className="w-4 h-4 opacity-70" />
          <span>
            {sortMode === "default" && t("panel.sortTeam")}
            {sortMode === "asc" && t("panel.sortPrice")}
            {sortMode === "desc" && t("panel.sortPrice")}
          </span>

          {(sortMode === "asc" || sortMode === "desc") && (
            <span>
              {sortMode === "asc" ? "↑" : "↓"}
            </span>
          )}
        </button>
      </div>

      {/* Scrollable list */}
      <div className="h-[calc(100vh-4rem-50px)] overflow-y-scroll pr-1 space-y-2 pb-15">
        {viewMode === "drivers" && (
          <>
            <div className="text-xs text-white/60 mb-2">
              {t("panel.selectDrivers")} {nbDrivers}/5
            </div>

            {sortedDrivers.map((d) => {
              const selected = selectedDriverSeasonIds.includes(d.driver_id);
              const disabled = (!selected && nbDrivers >= 5) || !canEdit;

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
              {t("panel.selectConstructors")} {nbConstructors}/2
            </div>

            {sortedConstructors.map((c) => {
              const selected = selectedConstructorsIds.includes(c.constructor_id);
              const disabled = (!selected && nbConstructors >= 2) || !canEdit;

              // On cherche les pilotes qui appartiennent à cette écurie
              const teamDrivers = drivers
                .filter(d => d.constructor_id === c.constructor_id)
                .map(d => {
                  const name = d.driver_name;
                  // Si c'est Fittipaldi Jr.
                  if (name.includes("Jr."))  {
                    return name.split(' ').slice(-2).join(' '); // Prend les 2 derniers mots
                  }
                  // Si c'est Van Hoepen
                  if (name.toLowerCase().includes("van ")) {
                    return name.split(' ').slice(-2).join(' '); // Prend les 2 derniers mots
                  }
                  // Sinon, on garde le comportement par défaut (Nom de famille)
                  return name.split(' ').pop();
                });

              return (
                <div
                  key={c.constructor_id}
                  onClick={() => !disabled && onToggleConstructor(c.constructor_id)}
                  className={[
                    "w-full text-left rounded-xl p-3 bg-black/30 hover:bg-black/40 border transition-colors cursor-pointer",
                    selected ? "border-white/60" : "border-white/10",
                    disabled ? "opacity-40 cursor-not-allowed" : ""
                  ].join(" ")}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="min-w-0 flex-1">
                      {/* Nom de l'écurie */}
                      <div className="font-semibold truncate">{c.name}</div>
                      
                      {/* Affichage des pilotes trouvés */}
                      <div className="text-xs text-white/60 truncate">
                        {teamDrivers.length > 0 
                          ? teamDrivers.join(" - ") 
                          : t("panel.noDrivers")}
                      </div>
                    </div>

                    <div className="text-sm text-white/80 whitespace-nowrap">
                      {c.price.toFixed(1)} M
                    </div>
                  </div>
                </div>
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