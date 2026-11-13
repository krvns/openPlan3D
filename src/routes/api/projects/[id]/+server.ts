import { json } from '@sveltejs/kit';
import { getServerProject, saveServerProject, deleteServerProject, saveServerThumbnail, getServerThumbnail } from '$lib/server/projectStorage';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async ({ params }) => {
  const { id } = params;
  if (!id) return json({ error: 'Missing ID' }, { status: 400 });

  try {
    const raw = await getServerProject(id);
    if (!raw) return json({ error: 'Not found' }, { status: 404 });
    const thumbnail = await getServerThumbnail(id);
    return json({ project: JSON.parse(raw), thumbnail }, {
      headers: {
        'Cache-Control': 'no-cache'
      }
    });
  } catch (err: unknown) {
    console.error(`Failed to get project ${id}:`, err);
    return json({ error: 'Failed to retrieve project' }, { status: 500 });
  }
};

export const PUT: RequestHandler = async ({ params, request }) => {
  const { id } = params;
  if (!id) return json({ error: 'Missing ID' }, { status: 400 });

  try {
    const body = await request.json();
    const { project, thumbnail } = body;
    if (!project) return json({ error: 'Missing project data' }, { status: 400 });

    const rawJson = typeof project === 'string' ? project : JSON.stringify(project);
    await saveServerProject(id, rawJson);

    if (thumbnail && typeof thumbnail === 'string') {
      await saveServerThumbnail(id, thumbnail);
    }

    return json({ ok: true, id });
  } catch (err: unknown) {
    console.error(`Failed to save project ${id}:`, err);
    return json({ error: 'Failed to save project' }, { status: 500 });
  }
};

export const DELETE: RequestHandler = async ({ params }) => {
  const { id } = params;
  if (!id) return json({ error: 'Missing ID' }, { status: 400 });

  try {
    await deleteServerProject(id);
    return json({ ok: true, id });
  } catch (err: unknown) {
    console.error(`Failed to delete project ${id}:`, err);
    return json({ error: 'Failed to delete project' }, { status: 500 });
  }
};

