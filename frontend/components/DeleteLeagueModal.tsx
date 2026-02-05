"use client";

import { useState } from "react";

interface DeleteLeagueModalProps {
  leagueName: string;
  leagueCode: string;
  memberCount: number;
  onConfirm: () => void;
  onCancel: () => void;
  isDeleting: boolean;
}

export default function DeleteLeagueModal({
  leagueName,
  leagueCode,
  memberCount,
  onConfirm,
  onCancel,
  isDeleting,
}: DeleteLeagueModalProps) {
  const [confirmCode, setConfirmCode] = useState("");
  const [showFinalConfirm, setShowFinalConfirm] = useState(false);
  const isValid = confirmCode.toUpperCase() === leagueCode.toUpperCase();

  function handleDelete() {
    if (!isValid) return;
    // Afficher la confirmation finale
    setShowFinalConfirm(true);
  }

  function handleFinalConfirm() {
    setShowFinalConfirm(false);
    onConfirm();
  }

  function handleFinalCancel() {
    setShowFinalConfirm(false);
  }

  return (
    <>
      {/* Modale principale */}
      <div
        className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 p-4"
        onClick={onCancel}
      >
        <div
          className="bg-slate-900 border border-red-500/50 rounded-2xl p-8 max-w-md w-full"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Icône danger */}
          <div className="w-16 h-16 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>

          {/* Titre */}
          <h2 className="text-2xl font-bold text-white text-center mb-2">
            Supprimer la ligue ?
          </h2>

          {/* Avertissement */}
          <div className="bg-red-950/40 border border-red-900/50 rounded-lg p-4 mb-6">
            <p className="text-red-200 text-sm font-semibold mb-2">⚠️ Action irréversible</p>
            <ul className="text-red-300 text-sm space-y-1">
              <li>• La ligue <span className="font-bold">{leagueName}</span> sera définitivement supprimée</li>
              <li>• Les {memberCount} membres perdront l'accès</li>
              <li>• Tous les scores et classements seront effacés</li>
              <li>• Cette action ne peut pas être annulée</li>
            </ul>
          </div>

          {/* Confirmation par code */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-white mb-2">
              Pour confirmer, entre le code de la ligue :
            </label>
            <div className="text-center mb-3">
              <span className="text-2xl font-bold text-red-400 font-mono tracking-widest">
                {leagueCode}
              </span>
            </div>
            <input
              type="text"
              className="w-full px-4 py-3 rounded-lg bg-slate-800/50 border border-slate-700 text-white text-center text-xl font-mono tracking-widest uppercase outline-none focus:border-red-500 focus:ring-2 focus:ring-red-500/50"
              placeholder="Entre le code"
              value={confirmCode}
              onChange={(e) => setConfirmCode(e.target.value)}
              maxLength={6}
              autoFocus
            />
            {confirmCode && !isValid && (
              <p className="text-red-400 text-sm mt-2 text-center">Le code ne correspond pas</p>
            )}
          </div>

          {/* Boutons */}
          <div className="flex gap-3">
            <button
              onClick={onCancel}
              disabled={isDeleting}
              className="flex-1 px-4 py-3 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-semibold transition-colors disabled:opacity-50"
            >
              Annuler
            </button>
            <button
              onClick={handleDelete}
              disabled={!isValid || isDeleting}
              className="flex-1 px-4 py-3 rounded-lg bg-red-600 hover:bg-red-500 text-white font-semibold transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isDeleting ? "Suppression..." : "Supprimer définitivement"}
            </button>
          </div>
        </div>
      </div>

      {/* Modale de confirmation finale */}
      {showFinalConfirm && (
        <div
          className="fixed inset-0 bg-black/80 flex items-center justify-center z-[60] p-4"
          onClick={handleFinalCancel}
        >
          <div
            className="bg-slate-900 border border-slate-700 rounded-xl p-6 max-w-sm w-full"
            onClick={(e) => e.stopPropagation()}
          >
            <h3 className="text-xl font-bold text-white text-center mb-4">
              Êtes-vous sûr ?
            </h3>
            <p className="text-slate-300 text-center mb-6">
              Cette action est irréversible.
            </p>
            <div className="flex gap-3">
              <button
                onClick={handleFinalCancel}
                className="flex-1 px-4 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-medium transition-colors"
              >
                Non
              </button>
              <button
                onClick={handleFinalConfirm}
                className="flex-1 px-4 py-2.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-white font-medium transition-colors"
              >
                Oui
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
}