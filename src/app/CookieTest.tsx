'use client';

import { useCookies } from 'react-cookie';

export default function CookieTest() {
  const [cookies, setCookie] = useCookies(['user']);

  return (
    <div>
      <p>Cookie: {cookies.user || 'none'}</p>
      <button onClick={() => setCookie('user', 'cookie-monster')}>Set Cookie</button>
    </div>
  );
}
