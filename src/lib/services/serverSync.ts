import type { Project } from '$lib/models/types';
import { base } from '$app/paths';

export interface ServerProjectSummary {
  id: string;
  name: string;
  updatedAt: string;
}

export async function fetchServerProjects(): Promise<{
  projects: ServerProjectSummary[];
  thumbnails: Record<string, string>;
} | null> {
  try {
    const res = await fetch(`${base}/api/projects`, { credentials: 'same-origin' });
    if (!res.ok) return null;
    return await res.json();
  } catch (err) {
    console.warn('Could not contact server storage endpoint:', err);
    return null;
  }
}

export async function fetchServerProject(id: string): Promise<{ project: Project; thumbnail?: string } | null> {
  try {
    const res = await fetch(`${base}/api/projects/${encodeURIComponent(id)}`, { credentials: 'same-origin' });
    if (!res.ok) return null;
    const data = await res.json();
    return { project: data.project, thumbnail: data.thumbnail };
  } catch (err) {
    console.warn(`Could not load project ${id} from server:`, err);
    return null;
  }
}

export async function saveProjectToServer(project: Project, thumbnail?: string | null): Promise<boolean> {
  try {
    const res = await fetch(`${base}/api/projects/${encodeURIComponent(project.id)}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ project, thumbnail }),
      credentials: 'same-origin',
    });
    return res.ok;
  } catch (err) {
    console.warn(`Could not save project ${project.id} to server:`, err);
    return false;
  }
}

export async function deleteProjectFromServer(id: string): Promise<boolean> {
  try {
    const res = await fetch(`${base}/api/projects/${encodeURIComponent(id)}`, {
      method: 'DELETE',
      credentials: 'same-origin',
    });
    return res.ok;
  } catch (err) {
    console.warn(`Could not delete project ${id} from server:`, err);
    return false;
  }
}

