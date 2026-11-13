import { json } from '@sveltejs/kit';
import { listServerProjects, getServerThumbnails } from '$lib/server/projectStorage';
import type { RequestHandler } from './$types';

export const GET: RequestHandler = async () => {
  try {
    const projects = await listServerProjects();
    const thumbnails = await getServerThumbnails();
    return json({ projects, thumbnails }, {
      headers: {
        'Cache-Control': 'no-cache'
      }
    });
  } catch (err: unknown) {
    console.error('Failed to list server projects:', err);
    return json({ error: 'Failed to list server projects' }, { status: 500 });
  }
};

