import { json } from '@sveltejs/kit';
import { isAuthEnabled, SESSION_COOKIE_NAME } from '$lib/server/auth';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async () => {
  return json({ authEnabled: isAuthEnabled() }, {
    headers: {
      'Cache-Control': 'no-store'
    }
  });
};

export const POST: RequestHandler = async ({ cookies }) => {
  cookies.delete(SESSION_COOKIE_NAME, { path: '/' });
  return json({ ok: true });
};

