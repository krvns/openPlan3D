import { fail, redirect } from '@sveltejs/kit';
import {
  isAuthEnabled,
  isUsernameRequired,
  verifyCredentials,
  createSessionToken,
  validateSessionToken,
  SESSION_COOKIE_NAME,
  SESSION_MAX_AGE
} from '$lib/server/auth';
import type { Actions, PageServerLoad } from './$types';

function sanitizeRedirect(target: string | null | undefined): string {
  return target && target.startsWith('/') && !target.startsWith('//') && !target.startsWith('/login')
    ? target
    : '/';
}

export const load: PageServerLoad = async ({ url, cookies }) => {
  if (!isAuthEnabled()) {
    throw redirect(303, '/');
  }

  const redirectTo = sanitizeRedirect(url.searchParams.get('redirectTo'));
  if (validateSessionToken(cookies.get(SESSION_COOKIE_NAME))) {
    throw redirect(303, redirectTo);
  }

  return {
    requireUsername: isUsernameRequired(),
    redirectTo
  };
};

export const actions: Actions = {
  default: async ({ request, url, cookies }) => {
    const data = await request.formData();
    const password = String(data.get('password') ?? '');
    const username = String(data.get('username') ?? '');
    const redirectTo = sanitizeRedirect(String(data.get('redirectTo') ?? '/'));

    if (!verifyCredentials(password, username)) {
      return fail(400, { error: 'Invalid password or credentials.' });
    }

    const isSecure = url.protocol === 'https:' || request.headers.get('x-forwarded-proto') === 'https';
    cookies.set(SESSION_COOKIE_NAME, createSessionToken(), {
      path: '/',
      httpOnly: true,
      sameSite: 'lax',
      secure: isSecure,
      maxAge: SESSION_MAX_AGE
    });

    throw redirect(303, redirectTo);
  }
};

