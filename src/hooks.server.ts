import { redirect, json, type Handle } from '@sveltejs/kit';
import { isAuthEnabled, validateSessionToken, SESSION_COOKIE_NAME } from '$lib/server/auth';

export const handle: Handle = async ({ event, resolve }) => {
  if (!isAuthEnabled()) {
    return resolve(event);
  }

  const { pathname, search } = event.url;

  if (
    pathname === '/api/auth/logout' ||
    pathname === '/favicon.svg' ||
    pathname === '/robots.txt' ||
    pathname.startsWith('/_app/')
  ) {
    return resolve(event);
  }

  const token = event.cookies.get(SESSION_COOKIE_NAME);
  const authenticated = validateSessionToken(token);

  if (pathname === '/login') {
    if (authenticated && event.request.method === 'GET') {
      throw redirect(303, '/');
    }
    return resolve(event);
  }

  if (!authenticated) {
    if (pathname.startsWith('/api/') || pathname === '/mcp') {
      return json({ error: 'Unauthorized' }, { status: 401 });
    }
    const target = pathname === '/'
      ? '/login'
      : `/login?redirectTo=${encodeURIComponent(pathname + search)}`;
    throw redirect(303, target);
  }

  return resolve(event);
};

