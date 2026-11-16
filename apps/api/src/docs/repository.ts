import type { FastifyInstance } from 'fastify';

export type RepositoryFetch = (url: string, options: RequestInit) => Promise<Response>;

/** Fixed public upstream, no credential or client-controlled URL. Shared per app instance. */
export function registerRepository(app: FastifyInstance, fetchRepository: RepositoryFetch = fetch) {
  let cached: Promise<{ stars: number | null }> | undefined;
  let expires = 0;
  app.get('/docs/repository.json', { schema: { hide: true } }, async (_request, reply) => {
    if (!cached || Date.now() >= expires) {
      expires = Date.now() + 300_000;
      cached = (async () => {
        try {
          const response = await fetchRepository('https://api.github.com/repos/Osiris-Balonga/242places', {
            headers: { Accept: 'application/vnd.github+json', 'User-Agent': '242Places' },
            signal: AbortSignal.timeout(2000),
          });
          if (!response.ok) return { stars: null };
          const body = await response.json() as { stargazers_count?: unknown };
          const count = body.stargazers_count;
          return { stars: typeof count === 'number' && Number.isSafeInteger(count) && count >= 10 ? count : null };
        } catch { return { stars: null }; }
      })();
    }
    return reply.header('Cache-Control', 'public, max-age=300').send(await cached);
  });
}
