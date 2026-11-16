import { readFileSync } from "node:fs";
// Shared artwork is part of the server checkout, not the standalone CLI package.
export const brandMark = readFileSync(
  new URL("../../../../assets/brand/mark.svg", import.meta.url),
  "utf8",
);
export const brandIcon = readFileSync(
  new URL("../../../../apps/web/public/favicon.svg", import.meta.url),
  "utf8",
);
