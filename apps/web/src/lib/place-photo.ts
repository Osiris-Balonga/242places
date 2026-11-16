export type PlacePhoto = {
  id: string;
  placeId: string;
  src: string;
  srcSet?: string;
  width: number;
  height: number;
  caption: { fr: string; en: string };
  author: string;
  sourceUrl: string;
  license: string;
  licenseUrl: string;
  reviewStatus: "approved" | "pending";
};
