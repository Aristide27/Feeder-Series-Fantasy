"use client";

import { useEffect } from "react";
import { useRouter, usePathname } from "next/navigation";
import { getToken } from "@/lib/auth/token";

/**
 * Hook pour vérifier la validité du token au chargement de chaque page
 * Place ce hook dans ton layout.tsx ou dans chaque page protégée
 */
export function useAuthGuard() {
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    // Pages publiques (pas besoin de token)
    const publicPages = ['/login', '/register', '/'];
    if (publicPages.includes(pathname)) {
      return;
    }

    // Vérifier si le token existe
    const token = getToken();
    if (!token) {
      console.log("[AUTH GUARD] Pas de token, redirection vers /login");
      router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
      return;
    }

    // Optionnel : Vérifier que le token est valide en faisant un appel API léger
    // (par exemple GET /api/auth/me)
    fetch("http://localhost:3000/api/auth/me", {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => {
      if (res.status === 401) {
        console.log("[AUTH GUARD] Token invalide, déconnexion");
        localStorage.removeItem('token');
        router.push(`/login?redirect=${encodeURIComponent(pathname)}`);
      }
    })
    .catch(err => {
      console.error("[AUTH GUARD] Erreur vérification token:", err);
    });

  }, [pathname, router]);
}