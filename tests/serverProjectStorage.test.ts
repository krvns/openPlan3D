import { describe, it, expect, beforeEach, vi } from 'vitest';
import fs from 'node:fs/promises';
import path from 'node:path';
import os from 'node:os';

vi.mock('$env/dynamic/private', () => ({ env: {} }));

import {
  saveServerProject,
  getServerProject,
  listServerProjects,
  deleteServerProject,
  saveServerThumbnail,
  getServerThumbnails,
} from '$lib/server/projectStorage';

describe('Server Project Storage', () => {
  let tempDir: string;

  beforeEach(async () => {
    tempDir = await fs.mkdtemp(path.join(os.tmpdir(), 'openplan-test-'));
    process.env.STORAGE_DIR = tempDir;
  });

  it('saves and retrieves a project', async () => {
    const project = { id: 'test-1', name: 'Test Plan', updatedAt: new Date().toISOString() };
    await saveServerProject('test-1', JSON.stringify(project));

    const retrieved = await getServerProject('test-1');
    expect(retrieved).not.toBeNull();
    expect(JSON.parse(retrieved!)).toEqual(project);
  });

  it('lists stored projects', async () => {
    const p1 = { id: 'p1', name: 'First Plan', updatedAt: new Date().toISOString() };
    const p2 = { id: 'p2', name: 'Second Plan', updatedAt: new Date().toISOString() };
    await saveServerProject('p1', JSON.stringify(p1));
    await saveServerProject('p2', JSON.stringify(p2));

    const list = await listServerProjects();
    expect(list.length).toBe(2);
    expect(list.map(p => p.id).sort()).toEqual(['p1', 'p2']);
  });

  it('saves thumbnails and deletes cleanly', async () => {
    const p = { id: 'p3', name: 'Third', updatedAt: new Date().toISOString() };
    await saveServerProject('p3', JSON.stringify(p));
    await saveServerThumbnail('p3', 'data:image/svg+xml,...');

    const thumbs = await getServerThumbnails();
    expect(thumbs['p3']).toBe('data:image/svg+xml,...');

    await deleteServerProject('p3');
    expect(await getServerProject('p3')).toBeNull();
    const afterThumbs = await getServerThumbnails();
    expect(afterThumbs['p3']).toBeUndefined();
  });
});
