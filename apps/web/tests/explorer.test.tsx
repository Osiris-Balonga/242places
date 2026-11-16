import assert from "node:assert/strict";
import { test, mock, afterEach } from "node:test";
import { render, screen, cleanup } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
let query = "";
const pushed: string[] = [];
mock.module("next/navigation", { namedExports: {
  useSearchParams: () => new URLSearchParams(query),
  usePathname: () => "/fr/places/territory",
  useRouter: () => ({ push: (href: string) => pushed.push(href) }),
}});
const { Explorer } = await import("../src/components/explorer.tsx");
const originalFetch = globalThis.fetch;
afterEach(() => { cleanup(); query = ""; pushed.length = 0; globalThis.fetch = originalFetch; });
function mount() {
  const requests: URL[] = [];
  globalThis.fetch = async (url) => {
    const request = new URL(String(url), "http://localhost");
    requests.push(request);
    const data = request.searchParams.has("direct") || request.searchParams.get("q") === "missing" ? [] : [{ id: "quarter-id", name: "Example quarter", resource: "neighborhoods", ancestors: [] }];
    return Response.json({ data, meta: { total: data.length, limit: 20, offset: 0 } });
  };
  render(<QueryClientProvider client={new QueryClient({ defaultOptions: { queries: { retry: false, gcTime: 0 } } })}><Explorer locale="fr" parent="territory" direct /></QueryClientProvider>);
  return { user: userEvent.setup(), requests };
}
test("detail suggestions include descendants and open the selected stable place", async () => {
  const { user, requests } = mount();
  await user.type(screen.getByRole("combobox", { name: "Rechercher un lieu" }), "Example");
  await screen.findByRole("option", { name: /Example quarter/ });
  const suggestions = requests.find(url => url.searchParams.get("limit") === "6")!;
  assert.equal(suggestions.searchParams.get("parent"), "territory");
  assert.equal(suggestions.searchParams.has("direct"), false);
  await user.keyboard("{ArrowDown}{Enter}");
  assert.equal(pushed.at(-1), "/fr/places/quarter-id");
});
test("submitted detail queries search deeper than direct children", async () => {
  query = "q=Example";
  const { user, requests } = mount();
  await screen.findByRole("link", { name: /Example quarter/ });
  assert.equal(requests[0].searchParams.get("parent"), "territory");
  assert.equal(requests[0].searchParams.has("direct"), false);
  await user.click(screen.getByRole("button", { name: "Rechercher" }));
  assert.equal(pushed.at(-1), "/fr/places/territory?q=Example");
});
test("an empty direct-child list is distinguished from an unsuccessful search", async () => {
  const { requests } = mount();
  await screen.findByText("Aucun lieu rattaché répertorié");
  assert.equal(requests[0].searchParams.get("direct"), "true");
  assert.equal(screen.queryByText("Aucun lieu trouvé"), null);
});
test("empty search offers a reset that removes query and category", async () => {
  query = "q=missing&resource=neighborhoods";
  const { user } = mount();
  await screen.findByText("Aucun lieu trouvé");
  await user.click(screen.getByRole("button", { name: "Effacer la recherche" }));
  assert.equal(pushed.at(-1), "/fr/places/territory?");
});
