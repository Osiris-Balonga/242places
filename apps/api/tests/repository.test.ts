import assert from 'node:assert/strict';
import { test } from 'node:test';
import { buildApp } from '../src/app.ts';
import { runInNewContext } from 'node:vm';
import { repositoryClient } from '../src/docs/repository-client.ts';

test('every documentation header links to GitHub after the theme control in both languages', async t => {
  const app = await buildApp();
  t.after(() => app.close());
  for (const locale of ['fr', 'en']) {
    for (const path of ['introduction', 'communes/list']) {
      const page = (await app.inject(`/docs/${locale}/${path}`)).body;
      const header = page.match(/<header class="docs-header">[\s\S]*?<\/header>/)![0];
      assert.match(header, /class="docs-github" href="https:\/\/github.com\/Osiris-Balonga\/242places"/);
      assert.ok(header.indexOf('docs-github') > header.indexOf('docs-theme'));
      assert.match(header, /aria-label="[^"]*GitHub[^"]*"/);
      assert.doesNotMatch(header, /docs-header-label/);
    }
  }
});

test('repository badge hides counts below ten and shares a cached lookup across requests', async t => {
  for (const count of [9, 10, 142]) {
    let requests = 0;
    const app = await buildApp({ repositoryFetch: async () => {
      requests++;
      return Response.json({ stargazers_count: count });
    } });
    t.after(() => app.close());
    const responses = await Promise.all([app.inject('/docs/repository.json'), app.inject('/docs/repository.json')]);
    for (const response of responses) {
      assert.equal(response.statusCode, 200);
      assert.deepEqual(response.json(), { stars: count >= 10 ? count : null });
    }
    assert.equal(requests, 1);
  }
});

test('GitHub outage or malformed count never breaks docs or renders a misleading count', async t => {
  for (const upstream of [async () => { throw new Error('offline'); }, async () => Response.json({ stargazers_count: -1 }),
    async () => new Response('limited', { status: 403 })]) {
    const app = await buildApp({ repositoryFetch: upstream });
    t.after(() => app.close());
    assert.deepEqual((await app.inject('/docs/repository.json')).json(), { stars: null });
    assert.equal((await app.inject('/docs/en/introduction')).statusCode, 200);
  }
});

test('the client enhances only eligible counts, with localized accessible text and safe failure', async () => {
  for (const [locale, stars, expected] of [['fr', 9, true], ['fr', 10, false], ['en', 142, false], ['en', null, true]] as const) {
    const count = { hidden: true, textContent: '' };
    const attributes: Record<string, string> = {};
    runInNewContext(repositoryClient, {
      document: { documentElement: { lang: locale }, querySelector: () => ({
        querySelector: () => count, setAttribute: (key: string, value: string) => { attributes[key] = value; },
      }) },
      fetch: async () => ({ ok: true, json: async () => ({ stars }) }),
    });
    await new Promise(resolve => setImmediate(resolve));
    assert.equal(count.hidden, expected);
    if (!expected) assert.match(attributes['aria-label']!, locale === 'fr' ? /10 étoiles/ : /142 stars/);
  }
  runInNewContext(repositoryClient, {
    document: { querySelector: () => ({}) }, fetch: async () => { throw new Error('offline'); },
  });
  await new Promise(resolve => setImmediate(resolve));
});
