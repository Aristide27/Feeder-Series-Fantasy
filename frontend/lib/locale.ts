'use client';

import { useRouter, usePathname } from 'next/navigation';
import { locales } from '@/i18n';

export function useChangeLocale() {
  const router = useRouter();
  const pathname = usePathname();

  const changeLocale = (newLocale: string) => {
    // Stocke la langue choisie dans un cookie
    document.cookie = `NEXT_LOCALE=${newLocale}; path=/; max-age=31536000`; // 1 an
    
    // Recharge la page pour appliquer la nouvelle langue
    router.refresh();
  };

  return changeLocale;
}

export function getCurrentLocale(): string {
  if (typeof document === 'undefined') return 'fr';
  
  const cookie = document.cookie
    .split('; ')
    .find(row => row.startsWith('NEXT_LOCALE='));
  
  return cookie ? cookie.split('=')[1] : 'fr';
}