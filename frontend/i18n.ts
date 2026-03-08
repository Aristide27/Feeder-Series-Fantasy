import {notFound} from 'next/navigation';
import {getRequestConfig} from 'next-intl/server';
import {cookies} from 'next/headers';

// Les locales supportées
export const locales = ['ar', 'de','en', 'es', 'fr', 'it', 'ja', 'nl', 'pt', 'tr'] as const;
export const defaultLocale = 'en' as const;

export default getRequestConfig(async () => {
  const cookieStore = await cookies();
  const localeCookie = cookieStore.get('NEXT_LOCALE');
  const raw = localeCookie?.value || defaultLocale;

  // Fallback sur defaultLocale si la valeur du cookie est invalide
  const locale = locales.includes(raw as any) ? raw : defaultLocale;

  return {
    locale,
    messages: (await import(`./messages/${locale}.json`)).default
  };
});