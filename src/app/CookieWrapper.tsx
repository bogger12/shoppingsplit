'use client';

import { CookiesProvider } from 'react-cookie';

export default function CookieWrapper({ children }: { children: React.ReactNode }) {
  return <CookiesProvider>{children}</CookiesProvider>;
}
