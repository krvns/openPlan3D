import crypto from 'node:crypto';
import { env } from '$env/dynamic/private';

export const SESSION_COOKIE_NAME = 'openplan3d_session';
export const SESSION_MAX_AGE = 60 * 60 * 24 * 30; // 30 days in seconds

function getConfiguredPassword(): string {
  return (env.AUTH_PASSWORD ?? process.env.AUTH_PASSWORD ?? '').trim();
}

function getConfiguredUsername(): string {
  return (env.AUTH_USERNAME ?? process.env.AUTH_USERNAME ?? '').trim();
}

function getSigningSecret(): string {
  const configured = (env.AUTH_SECRET ?? process.env.AUTH_SECRET ?? '').trim();
  if (configured) return configured;
  return crypto
    .createHash('sha256')
    .update('openplan3d-fallback-secret:' + getConfiguredPassword())
    .digest('hex');
}

export function isAuthEnabled(): boolean {
  return getConfiguredPassword().length > 0;
}

export function isUsernameRequired(): boolean {
  return getConfiguredUsername().length > 0;
}

function safeCompare(a: string, b: string): boolean {
  const hashA = crypto.createHash('sha256').update(a).digest();
  const hashB = crypto.createHash('sha256').update(b).digest();
  return crypto.timingSafeEqual(hashA, hashB) && a.length === b.length;
}

export function verifyCredentials(password: string, username?: string): boolean {
  if (!isAuthEnabled()) return true;
  const passOk = safeCompare(password, getConfiguredPassword());
  if (isUsernameRequired()) {
    const userOk = safeCompare((username ?? '').trim(), getConfiguredUsername());
    return passOk && userOk;
  }
  return passOk;
}

export function createSessionToken(now = Date.now()): string {
  const nonce = crypto.randomBytes(16).toString('hex');
  const payload = `${now}.${nonce}`;
  const sig = crypto.createHmac('sha256', getSigningSecret()).update(payload).digest('hex');
  return `${payload}.${sig}`;
}

export function validateSessionToken(token: string | undefined | null, now = Date.now()): boolean {
  if (!token || typeof token !== 'string') return false;
  const parts = token.split('.');
  if (parts.length !== 3) return false;
  const [tsStr, nonce, sig] = parts;
  const ts = Number(tsStr);
  if (!Number.isFinite(ts) || !nonce || !sig) return false;
  if (now - ts > SESSION_MAX_AGE * 1000 || ts > now + 60_000) return false;
  const expectedSig = crypto
    .createHmac('sha256', getSigningSecret())
    .update(`${tsStr}.${nonce}`)
    .digest('hex');
  return safeCompare(sig, expectedSig);
}

