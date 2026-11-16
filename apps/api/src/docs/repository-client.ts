/** Independent enhancement: the repository link works even when the lookup fails. */
export const repositoryClient = String.raw`
const repository = document.querySelector('.docs-github');
if (repository && typeof fetch === 'function') {
  fetch('/docs/repository.json', { credentials: 'omit' })
    .then(response => response.ok ? response.json() : null)
    .then(data => {
      if (!Number.isSafeInteger(data?.stars) || data.stars < 10) return;
      const count = repository.querySelector('[data-repository-stars]');
      count.textContent = data.stars.toLocaleString(document.documentElement.lang);
      count.hidden = false;
      repository.setAttribute('aria-label', document.documentElement.lang === 'fr'
        ? '242Places sur GitHub, ' + count.textContent + ' étoiles'
        : '242Places on GitHub, ' + count.textContent + ' stars');
    }).catch(() => {});
}
`;
