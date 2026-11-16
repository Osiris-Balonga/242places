import "server-only";
import photoRecords from "../../../../media/photos.json";
import { selectPlacePhotos, type PhotoRecord } from "./photo-selection";

export function placePhotos(placeId: string) {
  // Candidate photographs are visible only in an explicitly enabled review server.
  return selectPlacePhotos(
    photoRecords as PhotoRecord[],
    placeId,
    process.env.PLACE_PHOTO_REVIEW === "1",
  );
}
