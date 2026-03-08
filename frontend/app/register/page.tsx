"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { registerUser } from "@/lib/api/auth";
import GoogleButton from "@/components/GoogleButton";
import { useTranslations } from "next-intl";

// Fonction de validation du mot de passe
function validatePassword(password: string): { valid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (password.length < 8) {
    errors.push("Au moins 8 caractères");
  }

  if (!/[A-Z]/.test(password)) {
    errors.push("Au moins 1 lettre majuscule (A-Z)");
  }

  if (!/[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(password)) {
    errors.push("Au moins 1 caractère spécial (!@#$%^&*...)");
  }

  return {
    valid: errors.length === 0,
    errors
  };
}

export default function RegisterPage() {
  const t = useTranslations("register");
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [passwordErrors, setPasswordErrors] = useState<string[]>([]);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setErr(null);
    setOk(null);
    setLoading(true);
    try {
      const res = await registerUser({ username, email, password });
      setOk(res.message ?? "Compte créé !");
      router.push("/login");
    } catch (e: any) {
      setErr(e?.message ?? "Erreur inscription");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 px-8 py-16">
      <div className="max-w-lg mx-auto bg-slate-900/60 border border-white/10 rounded-2xl p-8">
        <h1 className="text-3xl font-bold text-white mb-2">{t("title")}</h1>
        <p className="text-slate-300 mb-6">{t("description")}</p>

        {err && (
        <div className="mb-6 rounded-lg border border-red-500 bg-red-500/15 px-4 py-3 text-red-500 text-base font-semibold">
            {err}
        </div>
        )}

        {ok && (
        <div className="mb-6 rounded-lg border border-green-500 bg-green-500/15 px-4 py-3 text-green-400 text-base font-semibold">
            {ok}
        </div>
        )}

        <GoogleButton mode="login" />  {/* ou mode="register" */}

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <div className="w-full border-t border-white/10"></div>
          </div>
          <div className="relative flex justify-center text-sm">
            <span className="px-4 bg-slate-900/60 text-slate-400">{t("or")}</span>
          </div>
        </div>

        <form onSubmit={onSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-slate-300 mb-1">{t("username")}</label>
            <input
              className="w-full px-4 py-3 rounded-lg bg-black/30 border border-white/10 text-white outline-none focus:ring-2 focus:ring-accent"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
            />
          </div>

          <div>
            <label className="block text-sm text-slate-300 mb-1">{t("email")}</label>
            <input
              className="w-full px-4 py-3 rounded-lg bg-black/30 border border-white/10 text-white outline-none focus:ring-2 focus:ring-accent"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              autoComplete="email"
            />
          </div>

          <div>
            <label className="block text-sm text-slate-300 mb-1">{t("password")}</label>
            <div className="relative">
              <input
                type={showPassword ? "text" : "password"}
                className={`w-full px-4 py-3 pr-12 rounded-lg bg-black/30 border outline-none focus:ring-2 ${
                  password.length > 0 && passwordErrors.length > 0
                    ? "border-red-500/50 focus:ring-red-500"
                    : password.length > 0 && passwordErrors.length === 0
                    ? "border-green-500/50 focus:ring-green-500"
                    : "border-white/10 focus:ring-accent"
                } text-white`}
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value);
                  const validation = validatePassword(e.target.value);
                  setPasswordErrors(validation.errors);
                }}
                autoComplete="new-password"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 transition-colors"
                tabIndex={-1}
              >
                {showPassword ? (
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

            {/* Affichage des erreurs ou succès */}
            {password.length > 0 && (
              <div className="mt-2">
                {passwordErrors.length > 0 ? (
                  <div className="text-sm space-y-1">
                    <p className="font-semibold text-red-400">Le mot de passe doit contenir :</p>
                    <ul className="space-y-1">
                      {passwordErrors.map((error, i) => (
                        <li key={i} className="flex items-center gap-2 text-red-400">
                          <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                          </svg>
                          <span>{error}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                ) : (
                  <div className="flex items-center gap-2 text-sm text-green-400">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="font-semibold">Mot de passe valide ✓</span>
                  </div>
                )}
              </div>
            )}
          </div>

          <button
            disabled={loading || !username || !password || passwordErrors.length > 0}
            className="w-full px-4 py-3 rounded-lg bg-accent text-accent-foreground font-semibold hover:bg-accent/90 disabled:opacity-50"
          >
            {loading ? t("submitting") : t("submit")}
          </button>

          <button
            type="button"
            onClick={() => router.push("/login")}
            className="w-full px-4 py-3 rounded-lg bg-white/5 border border-white/10 text-white/80 hover:bg-white/10"
          >
            {t("login")}
          </button>
        </form>
      </div>
    </div>
  );
}