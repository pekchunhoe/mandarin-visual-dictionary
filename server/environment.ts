import { loadEnv } from 'vite';

/** Development only. Vercel supplies production secrets directly to process.env. */
export function loadServerEnvironment(mode: string, directory: string) {
  const environment = loadEnv(mode, directory, ['PIXABAY_', 'PEXELS_', 'OPENVERSE_', 'GEMINI_API_KEY']);
  for (const [name, value] of Object.entries(environment)) {
    if (process.env[name] === undefined) process.env[name] = value;
  }
}
