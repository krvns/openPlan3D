import adapter from '@sveltejs/adapter-node';
import { execSync } from 'node:child_process';

function getGitHash() {
	if (process.env.GIT_HASH) {
		return process.env.GIT_HASH.slice(0, 7);
	}
	try {
		return execSync('git rev-parse --short HEAD', { encoding: 'utf8', stdio: ['ignore', 'pipe', 'ignore'] }).trim();
	} catch {
		return 'local';
	}
}

const now = new Date();
const dateStamp = now.toISOString().slice(0, 10).replace(/-/g, '');
const gitHash = getGitHash();

/** @type {import('@sveltejs/kit').Config} */
const config = {
	kit: {
		adapter: adapter(),
		version: {
			name: `v${dateStamp}.${gitHash}`
		}
	}
};

export default config;
