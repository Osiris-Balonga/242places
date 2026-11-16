import assert from "node:assert/strict";
import { test, afterEach } from "node:test";
import {
  render,
  screen,
  cleanup,
  fireEvent,
  waitFor,
} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { PlaceGallery } from "../src/components/place-gallery.tsx";
import type { PlacePhoto } from "../src/lib/place-photo.ts";
afterEach(cleanup);
const photos: PlacePhoto[] = Array.from({ length: 6 }, (_, i) => ({
  id: `photo-${i}`,
  placeId: "synthetic-place",
  src: `/images/test-${i}.webp`,
  width: 1200,
  height: 800,
  caption: { fr: `Vue ${i + 1}`, en: `View ${i + 1}` },
  author: "Example photographer",
  sourceUrl: `https://example.org/photo-${i}`,
  license: "CC BY-SA 4.0",
  licenseUrl: "https://creativecommons.org/licenses/by-sa/4.0/",
  reviewStatus: "approved",
}));
function mount(count: number, locale: "fr" | "en" = "fr") {
  render(
    <PlaceGallery
      photos={photos.slice(0, count)}
      locale={locale}
      placeName="Lieu exemple"
    />,
  );
  return userEvent.setup();
}
test("an unphotographed place has an honest noninteractive placeholder", () => {
  mount(0);
  assert.ok(
    screen.getByRole("heading", {
      name: "Aucune photo disponible",
    }),
  );
  assert.equal(screen.queryByRole("button"), null);
});
for (const count of [1, 2, 3])
  test(`${count} photos are all individually accessible without a misleading overflow count`, () => {
    mount(count);
    assert.equal(screen.getAllByRole("button").length, count);
    for (let i = 1; i <= count; i++)
      assert.ok(
        screen.getByRole("button", {
          name: `Ouvrir la photo ${i} sur ${count}`,
        }),
      );
    assert.equal(screen.queryByText(/^\+\d+$/), null);
  });
test("overflow counts only photos beyond the three full previews and opens the first extra photo", async () => {
  const user = mount(6);
  assert.ok(screen.getByText("+3"));
  assert.equal(screen.getAllByRole("button").length, 4);
  await user.click(
    screen.getByRole("button", { name: "Voir les 3 autres photos" }),
  );
  assert.ok(screen.getByRole("dialog", { name: "Photos de Lieu exemple" }));
  assert.ok(screen.getByText("4 / 6"));
  assert.equal(
    screen.getByRole("link", { name: "Source" }).getAttribute("href"),
    photos[3].sourceUrl,
  );
});
test("a fourth photo uses a precise +1 tile, and a single-photo viewer has no navigation controls", async () => {
  mount(4);
  assert.ok(screen.getByRole("button", { name: "Voir l’autre photo" }));
  assert.ok(screen.getByText("+1"));
  cleanup();
  const user = mount(1);
  await user.click(
    screen.getByRole("button", { name: "Ouvrir la photo 1 sur 1" }),
  );
  assert.equal(screen.queryByRole("button", { name: "Photo suivante" }), null);
  await user.click(screen.getByRole("button", { name: "Fermer la galerie" }));
  assert.equal(screen.queryByRole("dialog"), null);
});
test("the viewer supports keyboard navigation, credits, Escape and restoring focus", async () => {
  const user = mount(2, "en");
  const opener = screen.getByRole("button", { name: "Open photo 1 of 2" });
  await user.click(opener);
  assert.ok(screen.getByRole("dialog", { name: "Photos of Lieu exemple" }));
  assert.ok(screen.getByText("Example photographer"));
  await user.keyboard("{ArrowRight}");
  assert.ok(screen.getByText("2 / 2"));
  await user.keyboard("{ArrowLeft}");
  assert.ok(screen.getByText("1 / 2"));
  await user.keyboard("{Escape}");
  await waitFor(() => assert.equal(screen.queryByRole("dialog"), null));
  assert.equal(document.activeElement, opener);
});
test("a failed image gets a replacement without hiding the other photographs", () => {
  mount(2);
  fireEvent.error(screen.getByAltText("Vue 1"));
  assert.ok(screen.getByText("Photo indisponible"));
  assert.ok(screen.getByAltText("Vue 2"));
});
