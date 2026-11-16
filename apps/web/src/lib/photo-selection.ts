import type { PlacePhoto } from "./place-photo.ts";
export type PhotoRecord = PlacePhoto & { relatedPlaceIds?: string[] };
export function selectPlacePhotos(
  records: PhotoRecord[],
  placeId: string,
  includePending = false,
): PlacePhoto[] {
  return records.filter(
    (photo) =>
      (photo.placeId === placeId || photo.relatedPlaceIds?.includes(placeId)) &&
      (photo.reviewStatus === "approved" || includePending),
  );
}
