import fs from 'node:fs/promises';
import path from 'node:path';
import { env } from '$env/dynamic/private';

export interface ServerProjectSummary {
  id: string;
  name: string;
  updatedAt: string;
}

export function getStorageDir(): string {
  return env.STORAGE_DIR || process.env.STORAGE_DIR || path.resolve(process.cwd(), 'data/projects');
}

async function ensureDir(dir: string): Promise<void> {
  await fs.mkdir(dir, { recursive: true });
}

function sanitizeId(id: string): string {
  // Allow alphanumeric, dash, underscore only to prevent path traversal
  const clean = id.replace(/[^a-zA-Z0-9_-]/g, '');
  if (!clean) throw new Error('Invalid project ID');
  return clean;
}

function projectFilePath(id: string): string {
  return path.join(getStorageDir(), `${sanitizeId(id)}.json`);
}

function thumbnailFilePath(id: string): string {
  return path.join(getStorageDir(), `${sanitizeId(id)}.thumb`);
}

/** Atomically writes data by saving to a temp file and renaming it. */
async function atomicWrite(targetPath: string, content: string): Promise<void> {
  const dir = path.dirname(targetPath);
  await ensureDir(dir);
  const tempPath = `${targetPath}.${Date.now()}.${Math.random().toString(36).slice(2)}.tmp`;
  await fs.writeFile(tempPath, content, 'utf8');
  await fs.rename(tempPath, targetPath);
}

export async function listServerProjects(): Promise<ServerProjectSummary[]> {
  const dir = getStorageDir();
  await ensureDir(dir);
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const results: ServerProjectSummary[] = [];

  for (const entry of entries) {
    if (entry.isFile() && entry.name.endsWith('.json')) {
      const id = entry.name.slice(0, -5);
      const filePath = path.join(dir, entry.name);
      try {
        const raw = await fs.readFile(filePath, 'utf8');
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed.name === 'string') {
          results.push({
            id: parsed.id || id,
            name: parsed.name,
            updatedAt: parsed.updatedAt ? new Date(parsed.updatedAt).toISOString() : new Date().toISOString()
          });
        }
      } catch (err) {
        console.error(`Failed to read project ${entry.name}:`, err);
      }
    }
  }

  return results;
}

export async function getServerProject(id: string): Promise<string | null> {
  try {
    const filePath = projectFilePath(id);
    return await fs.readFile(filePath, 'utf8');
  } catch (err: unknown) {
    if ((err as NodeJS.ErrnoException).code === 'ENOENT') return null;
    throw err;
  }
}

export async function saveServerProject(id: string, rawJson: string): Promise<void> {
  const filePath = projectFilePath(id);
  await atomicWrite(filePath, rawJson);
}

export async function deleteServerProject(id: string): Promise<void> {
  const pPath = projectFilePath(id);
  const tPath = thumbnailFilePath(id);
  try { await fs.unlink(pPath); } catch (e: unknown) {
    if ((e as NodeJS.ErrnoException).code !== 'ENOENT') throw e;
  }
  try { await fs.unlink(tPath); } catch (e: unknown) {
    if ((e as NodeJS.ErrnoException).code !== 'ENOENT') throw e;
  }
}

export async function saveServerThumbnail(id: string, dataUrl: string): Promise<void> {
  const tPath = thumbnailFilePath(id);
  await atomicWrite(tPath, dataUrl);
}

export async function getServerThumbnail(id: string): Promise<string | null> {
  try {
    const tPath = thumbnailFilePath(id);
    return await fs.readFile(tPath, 'utf8');
  } catch (err: unknown) {
    if ((err as NodeJS.ErrnoException).code === 'ENOENT') return null;
    throw err;
  }
}

export async function getServerThumbnails(): Promise<Record<string, string>> {
  const dir = getStorageDir();
  await ensureDir(dir);
  const entries = await fs.readdir(dir, { withFileTypes: true });
  const thumbs: Record<string, string> = {};

  for (const entry of entries) {
    if (entry.isFile() && entry.name.endsWith('.thumb')) {
      const id = entry.name.slice(0, -6);
      try {
        const content = await fs.readFile(path.join(dir, entry.name), 'utf8');
        thumbs[id] = content;
      } catch {}
    }
  }

  return thumbs;
}

