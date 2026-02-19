"use client";
import { useEffect, useState, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { saveAuth } from "@/lib/auth/token";

function AuthCallbackContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<"loading" | "success" | "error">("loading");

  useEffect(() => {
    const token = searchParams?.get("token");
    const username = searchParams?.get("username");
    const error = searchParams?.get("error");

    if (error) {
      setStatus("error");
      setTimeout(() => {
        router.push("/login?error=" + error);
      }, 2000);
      return;
    }

    if (token && username) {
      // Sauvegarder le token
      saveAuth(token, username);
      setStatus("success");
      
      // Rediriger vers la page d'accueil après 1 seconde
      setTimeout(() => {
        window.location.href = "/";
      }, 1000);
    } else {
      setStatus("error");
      setTimeout(() => {
        router.push("/login");
      }, 2000);
    }
  }, [searchParams, router]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center px-8">
      <div className="max-w-md w-full bg-slate-900/60 border border-white/10 rounded-2xl p-8 text-center">
        {status === "loading" && (
          <>
            <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-accent border-t-transparent mb-4"></div>
            <h2 className="text-2xl font-bold text-white mb-2">Connexion en cours...</h2>
            <p className="text-slate-400">Veuillez patienter</p>
          </>
        )}
        {status === "success" && (
          <>
            <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Connexion réussie !</h2>
            <p className="text-slate-400">Redirection en cours...</p>
          </>
        )}
        {status === "error" && (
          <>
            <div className="w-12 h-12 bg-red-500/20 rounded-full flex items-center justify-center mx-auto mb-4">
              <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Erreur de connexion</h2>
            <p className="text-slate-400">Redirection vers la page de connexion...</p>
          </>
        )}
      </div>
    </div>
  );
}

export default function AuthCallbackPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 flex items-center justify-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-4 border-accent border-t-transparent"></div>
      </div>
    }>
      <AuthCallbackContent />
    </Suspense>
  );
}