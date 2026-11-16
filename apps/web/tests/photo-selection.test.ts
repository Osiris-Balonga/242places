import assert from "node:assert/strict";
import { test } from "node:test";
import {
  selectPlacePhotos,
  type PhotoRecord,
} from "../src/lib/photo-selection.ts";
const base = {
  src: "/images/example.webp",
  width: 800,
  height: 600,
  caption: { fr: "Exemple", en: "Example" },
  author: "Example",
  sourceUrl: "https://example.org",
  license: "CC0",
  licenseUrl: "https://creativecommons.org/publicdomain/zero/1.0/",
};
const records: PhotoRecord[] = [
  { ...base, id: "approved", placeId: "commune-a", reviewStatus: "approved" },
  { ...base, id: "pending", placeId: "commune-a", reviewStatus: "pending" },
  { ...base, id: "other", placeId: "department-a", reviewStatus: "approved" },
  {
    ...base,
    id: "linked",
    placeId: "quarter-a",
    relatedPlaceIds: ["commune-a"],
    reviewStatus: "approved",
  },
];
test("only reviewed photos with explicit UUID associations are public, with no same-name or implicit ancestor fallback", () => {
  assert.deepEqual(
    selectPlacePhotos(records, "commune-a").map((p) => p.id),
    ["approved", "linked"],
  );
  assert.deepEqual(selectPlacePhotos(records, "unphotographed"), []);
});
test("review previews may include candidates without leaking another place's images", () => {
  assert.deepEqual(
    selectPlacePhotos(records, "commune-a", true).map((p) => p.id),
    ["approved", "pending", "linked"],
  );
});
