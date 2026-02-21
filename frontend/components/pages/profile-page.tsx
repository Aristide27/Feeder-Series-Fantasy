"use client";

import { useEffect, useState, Suspense } from "react";
import { useRouter, usePathname } from "next/navigation";
import { getToken, getUsername as getStoredUsername, clearAuth } from "@/lib/auth/token";
import { getUserProfile, updateUsername, updateEmail, updatePassword, UserProfile } from "@/lib/api/users.api";

export function ProfileContent() {
  const router = useRouter();
  const pathname = usePathname();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // États pour l'édition
  const [editingField, setEditingField] = useState<"username" | "email" | "password" | null>(null);
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  
  // États pour afficher/masquer les mots de passe
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  // Messages séparés par section
  const [usernameMessage, setUsernameMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [emailMessage, setEmailMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  const [passwordMessage, setPasswordMessage] = useState<{ type: "success" | "error"; text: string } | null>(null);
  
  const [submitting, setSubmitting] = useState(false);

  // Charger le profil au montage
  useEffect(() => {
    loadProfile();
  }, []);

  async function loadProfile() {
    const token = getToken();
    if (!token) {
      // Rediriger vers login en sauvegardant la page actuelle
      router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
      return;
    }

    try {
      setLoading(true);
      const data = await getUserProfile(token);
      setProfile(data);
      setFormData({
        username: data.username,
        email: data.email ?? "",
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    } catch (err: any) {
      setError(err?.message ?? "Erreur lors du chargement du profil");
      if (err?.message?.includes("Token") || err?.message?.includes("401")) {
        clearAuth();
        router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
      }
    } finally {
      setLoading(false);
    }
  }

  // Reset tous les messages
  function resetAllMessages() {
    setUsernameMessage(null);
    setEmailMessage(null);
    setPasswordMessage(null);
  }

  // Modifier le username
  async function handleUpdateUsername() {
    const token = getToken();
    if (!token) return;

    resetAllMessages();
    setSubmitting(true);

    try {
      const result = await updateUsername(token, formData.username);
      setUsernameMessage({ type: "success", text: result.message });
      setProfile((prev) => (prev ? { ...prev, username: result.username } : null));
      
      // Mettre à jour le localStorage
      localStorage.setItem("fsf_username", result.username);
      
      setEditingField(null);
      
      // Recharger après 1 seconde pour voir le changement dans la nav
      setTimeout(() => {
        window.location.reload();
      }, 1000);
    } catch (err: any) {
      setUsernameMessage({ type: "error", text: err?.message ?? "Erreur lors de la modification" });
    } finally {
      setSubmitting(false);
    }
  }

  // Modifier l'email
  async function handleUpdateEmail() {
    const token = getToken();
    if (!token) return;

    resetAllMessages();
    setSubmitting(true);

    try {
      const result = await updateEmail(token, formData.email);
      setEmailMessage({ type: "success", text: result.message });
      setProfile((prev) => (prev ? { ...prev, email: result.email } : null));
      setEditingField(null);
    } catch (err: any) {
      setEmailMessage({ type: "error", text: err?.message ?? "Erreur lors de la modification" });
    } finally {
      setSubmitting(false);
    }
  }

  // Modifier le mot de passe
  async function handleUpdatePassword() {
    const token = getToken();
    if (!token) return;

    // Validation côté client
    if (formData.newPassword !== formData.confirmPassword) {
      setPasswordMessage({ type: "error", text: "Les mots de passe ne correspondent pas" });
      return;
    }

    if (formData.newPassword.length < 6) {
      setPasswordMessage({ type: "error", text: "Le nouveau mot de passe doit contenir au moins 6 caractères" });
      return;
    }

    resetAllMessages();
    setSubmitting(true);

    try {
      const result = await updatePassword(token, formData.oldPassword, formData.newPassword);
      setPasswordMessage({ type: "success", text: result.message });
      setFormData((prev) => ({ ...prev, oldPassword: "", newPassword: "", confirmPassword: "" }));
      setEditingField(null);
      // Réinitialiser les états d'affichage des mots de passe
      setShowOldPassword(false);
      setShowNewPassword(false);
      setShowConfirmPassword(false);
    } catch (err: any) {
      setPasswordMessage({ type: "error", text: err?.message ?? "Erreur lors de la modification" });
    } finally {
      setSubmitting(false);
    }
  }

  // Déconnexion
  function handleLogout() {
    clearAuth();
    router.push("/");
  }

  // Annuler l'édition
  function handleCancel() {
    setEditingField(null);
    resetAllMessages();
    // Réinitialiser les états d'affichage des mots de passe
    setShowOldPassword(false);
    setShowNewPassword(false);
    setShowConfirmPassword(false);
    if (profile) {
      setFormData({
        username: profile.username,
        email: profile.email ?? "",
        oldPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 px-8 py-16">
        <div className="max-w-2xl mx-auto">
          <div className="text-center text-white text-lg">Chargement du profil...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 px-8 py-16">
        <div className="max-w-2xl mx-auto">
          <div className="rounded-lg border border-red-500 bg-red-500/15 px-6 py-4 text-red-500">
            {error}
          </div>
        </div>
      </div>
    );
  }

  if (!profile) return null;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 px-8 py-16">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">Mon Profil</h1>
          <p className="text-slate-400">Gérez vos informations personnelles et votre sécurité</p>
        </div>

        {/* Section Informations générales */}
        <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-8 mb-6">
          <h2 className="text-2xl font-bold text-white mb-6">Informations générales</h2>

          {/* Username */}
          <div className="mb-6">
            <label className="block text-sm text-slate-400 mb-2">Username</label>
            
            {/* Message username */}
            {usernameMessage && (
              <div className={`mb-3 rounded-lg border px-4 py-3 text-sm ${
                usernameMessage.type === "success"
                  ? "border-green-500 bg-green-500/15 text-green-400"
                  : "border-red-500 bg-red-500/15 text-red-500"
              }`}>
                {usernameMessage.text}
              </div>
            )}
            
            {editingField === "username" ? (
              <div className="space-y-3">
                <input
                  type="text"
                  className="w-full px-4 py-3 rounded-lg bg-black/30 border border-white/10 text-white outline-none focus:ring-2 focus:ring-accent"
                  value={formData.username}
                  onChange={(e) => setFormData({ ...formData, username: e.target.value })}
                  placeholder="Nouveau username"
                />
                <div className="flex gap-3">
                  <button
                    onClick={handleUpdateUsername}
                    disabled={submitting || !formData.username}
                    className="px-4 py-2 rounded-lg bg-accent text-white font-semibold hover:bg-accent/90 disabled:opacity-50"
                  >
                    {submitting ? "Enregistrement..." : "Enregistrer"}
                  </button>
                  <button
                    onClick={handleCancel}
                    disabled={submitting}
                    className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white hover:bg-white/10"
                  >
                    Annuler
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <span className="text-white text-lg">{profile.username}</span>
                <button
                  onClick={() => {
                    setEditingField("username");
                    resetAllMessages();
                  }}
                  className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white/80 hover:bg-white/10 transition-colors text-sm"
                >
                  Modifier
                </button>
              </div>
            )}
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm text-slate-400 mb-2">Email</label>
            
            {/* Message email */}
            {emailMessage && (
              <div className={`mb-3 rounded-lg border px-4 py-3 text-sm ${
                emailMessage.type === "success"
                  ? "border-green-500 bg-green-500/15 text-green-400"
                  : "border-red-500 bg-red-500/15 text-red-500"
              }`}>
                {emailMessage.text}
              </div>
            )}
            
            {editingField === "email" ? (
              <div className="space-y-3">
                <input
                  type="email"
                  className="w-full px-4 py-3 rounded-lg bg-black/30 border border-white/10 text-white outline-none focus:ring-2 focus:ring-accent"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  placeholder="nouvel.email@example.com"
                />
                <div className="flex gap-3">
                  <button
                    onClick={handleUpdateEmail}
                    disabled={submitting}
                    className="px-4 py-2 rounded-lg bg-accent text-white font-semibold hover:bg-accent/90 disabled:opacity-50"
                  >
                    {submitting ? "Enregistrement..." : "Enregistrer"}
                  </button>
                  <button
                    onClick={handleCancel}
                    disabled={submitting}
                    className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white hover:bg-white/10"
                  >
                    Annuler
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <span className="text-white text-lg">{profile.email || "Non renseigné"}</span>
                <button
                  onClick={() => {
                    setEditingField("email");
                    resetAllMessages();
                  }}
                  className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white/80 hover:bg-white/10 transition-colors text-sm"
                >
                  Modifier
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Section Sécurité */}
        <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-8 mb-6">
          <h2 className="text-2xl font-bold text-white mb-6">Sécurité</h2>

          {/* Mot de passe */}
          <div>
            <label className="block text-sm text-slate-400 mb-2">Mot de passe</label>
            
            {/* Message mot de passe */}
            {passwordMessage && (
              <div className={`mb-3 rounded-lg border px-4 py-3 text-sm ${
                passwordMessage.type === "success"
                  ? "border-green-500 bg-green-500/15 text-green-400"
                  : "border-red-500 bg-red-500/15 text-red-500"
              }`}>
                {passwordMessage.text}
              </div>
            )}
            
            {editingField === "password" ? (
              <div className="space-y-3">
                {/* Ancien mot de passe */}
                <div className="relative">
                  <input
                    type={showOldPassword ? "text" : "password"}
                    className="w-full px-4 py-3 pr-12 rounded-lg bg-black/30 border border-white/10 text-white outline-none focus:ring-2 focus:ring-accent"
                    value={formData.oldPassword}
                    onChange={(e) => setFormData({ ...formData, oldPassword: e.target.value })}
                    placeholder="Ancien mot de passe"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowOldPassword(!showOldPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors"
                    tabIndex={-1}
                  >
                    {showOldPassword ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>

                {/* Nouveau mot de passe */}
                <div className="relative">
                  <input
                    type={showNewPassword ? "text" : "password"}
                    className="w-full px-4 py-3 pr-12 rounded-lg bg-black/30 border border-white/10 text-white outline-none focus:ring-2 focus:ring-accent"
                    value={formData.newPassword}
                    onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                    placeholder="Nouveau mot de passe"
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNewPassword(!showNewPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors"
                    tabIndex={-1}
                  >
                    {showNewPassword ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>

                {/* Confirmer nouveau mot de passe */}
                <div className="relative">
                  <input
                    type={showConfirmPassword ? "text" : "password"}
                    className="w-full px-4 py-3 pr-12 rounded-lg bg-black/30 border border-white/10 text-white outline-none focus:ring-2 focus:ring-accent"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    placeholder="Confirmer le nouveau mot de passe"
                    autoComplete="new-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors"
                    tabIndex={-1}
                  >
                    {showConfirmPassword ? (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                      </svg>
                    ) : (
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    )}
                  </button>
                </div>

                <div className="flex gap-3">
                  <button
                    onClick={handleUpdatePassword}
                    disabled={submitting || !formData.oldPassword || !formData.newPassword || !formData.confirmPassword}
                    className="px-4 py-2 rounded-lg bg-accent text-white font-semibold hover:bg-accent/90 disabled:opacity-50"
                  >
                    {submitting ? "Modification..." : "Modifier le mot de passe"}
                  </button>
                  <button
                    onClick={handleCancel}
                    disabled={submitting}
                    className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white hover:bg-white/10"
                  >
                    Annuler
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex items-center justify-between">
                <span className="text-white text-lg">••••••••</span>
                <button
                  onClick={() => {
                    setEditingField("password");
                    resetAllMessages();
                  }}
                  className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-white/80 hover:bg-white/10 transition-colors text-sm"
                >
                  Modifier
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Section Déconnexion */}
        <div className="bg-slate-900/60 border border-white/10 rounded-2xl p-8">
          <h2 className="text-2xl font-bold text-white mb-4">Déconnexion</h2>
          <p className="text-slate-400 mb-6">
            Déconnectez-vous de votre compte sur cet appareil.
          </p>
          <button
            onClick={handleLogout}
            className="px-6 py-3 rounded-lg bg-red-500/20 border border-red-500/50 text-red-400 font-semibold hover:bg-red-500/30 transition-colors"
          >
            Se déconnecter
          </button>
        </div>

        {/* Informations compte */}
        <div className="mt-6 text-center text-slate-500 text-sm">
          Compte créé le {new Date(profile.created_at).toLocaleDateString("fr-FR")}
        </div>
      </div>
    </div>
  );
}

export default function ProfilePage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-accent border-t-transparent"></div>
      </div>
    }>
      <ProfileContent />
    </Suspense>
  );
}