import { beforeEach, describe, expect, it, vi } from 'vitest';

const { env } = vi.hoisted(() => ({ env: {} as Record<string, string | undefined> }));
vi.mock('$env/dynamic/private', () => ({ env }));

import {
  isAuthEnabled,
  isUsernameRequired,
  verifyCredentials,
  createSessionToken,
  validateSessionToken,
  SESSION_MAX_AGE
} from '$lib/server/auth';

describe('Server Authentication Engine', () => {
  beforeEach(() => {
    delete env.AUTH_PASSWORD;
    delete env.AUTH_USERNAME;
    delete env.AUTH_SECRET;
    delete process.env.AUTH_PASSWORD;
    delete process.env.AUTH_USERNAME;
    delete process.env.AUTH_SECRET;
  });

  it('reports auth disabled when AUTH_PASSWORD is empty or unset', () => {
    expect(isAuthEnabled()).toBe(false);
    env.AUTH_PASSWORD = '   ';
    expect(isAuthEnabled()).toBe(false);
  });

  it('reports auth enabled when AUTH_PASSWORD is set', () => {
    env.AUTH_PASSWORD = 'super-secret-password';
    expect(isAuthEnabled()).toBe(true);
  });

  it('verifies passwords in constant time and handles mismatched lengths', () => {
    env.AUTH_PASSWORD = 'CorrectHorseBatteryStaple';
    expect(isUsernameRequired()).toBe(false);
    expect(verifyCredentials('CorrectHorseBatteryStaple')).toBe(true);
    expect(verifyCredentials('Wrong')).toBe(false);
    expect(verifyCredentials('CorrectHorseBatteryStapleExtra')).toBe(false);
    expect(verifyCredentials('CorrectHorseBatteryStaplE')).toBe(false);
    expect(verifyCredentials('')).toBe(false);
  });

  it('enforces AUTH_USERNAME when configured', () => {
    env.AUTH_PASSWORD = 'secret-password';
    env.AUTH_USERNAME = 'architect';
    expect(isUsernameRequired()).toBe(true);
    expect(verifyCredentials('secret-password')).toBe(false);
    expect(verifyCredentials('secret-password', 'wronguser')).toBe(false);
    expect(verifyCredentials('wrong-password', 'architect')).toBe(false);
    expect(verifyCredentials('secret-password', 'architect')).toBe(true);
    expect(verifyCredentials('secret-password', ' architect ')).toBe(true);
  });

  it('creates and validates signed session tokens', () => {
    env.AUTH_PASSWORD = 'secret-password';
    env.AUTH_SECRET = '0123456789abcdef0123456789abcdef';
    const now = 1_700_000_000_000;
    const token = createSessionToken(now);

    expect(validateSessionToken(token, now)).toBe(true);
    expect(validateSessionToken(token, now + 10_000)).toBe(true);
  });

  it('rejects tampered, expired, future, and malformed tokens', () => {
    env.AUTH_PASSWORD = 'secret-password';
    env.AUTH_SECRET = '0123456789abcdef0123456789abcdef';
    const now = 1_700_000_000_000;
    const token = createSessionToken(now);
    const [ts, nonce, sig] = token.split('.');

    // Tampered signature
    const badSig = (sig[0] === 'a' ? 'b' : 'a') + sig.slice(1);
    expect(validateSessionToken(`${ts}.${nonce}.${badSig}`, now)).toBe(false);

    // Tampered timestamp
    expect(validateSessionToken(`${Number(ts) + 1}.${nonce}.${sig}`, now)).toBe(false);

    // Expired token (> SESSION_MAX_AGE)
    expect(validateSessionToken(token, now + SESSION_MAX_AGE * 1000 + 1)).toBe(false);

    // Token from the future (> 60s clock skew)
    expect(validateSessionToken(token, now - 61_000)).toBe(false);

    // Malformed tokens
    expect(validateSessionToken(undefined, now)).toBe(false);
    expect(validateSessionToken(null, now)).toBe(false);
    expect(validateSessionToken('', now)).toBe(false);
    expect(validateSessionToken('only.two', now)).toBe(false);
    expect(validateSessionToken('notanumber.nonce.sig', now)).toBe(false);
  });
});

