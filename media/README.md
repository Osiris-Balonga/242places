# Place photographs

[Français](README.fr.md)

`photos.json` records explicit stable place UUIDs, localized captions, author, source and license for each photograph. Optional `relatedPlaceIds` are reviewed associations, never a same-name match or automatic inheritance from a parent. A photograph of a city is not silently reused for every neighborhood.

The initial batch contains three previously published city photographs and eight new **pending** candidates for Bacongo, Talangaï and Poto-Poto. It is partial photographic coverage, not a photograph for every catalog entry. Files that depict unrelated people, phone screens or redundant views were excluded during curation.

## Review

Normal servers show only `reviewStatus: "approved"`. To review candidates locally, set `PLACE_PHOTO_REVIEW=1` **before starting the server**. Do not enable this setting on production. The review site uses actual candidate photos; there is no demonstration badge and no generated photo pretending to document a place.

Review the original source, location association, caption, author and license, then set the accepted record to `approved` in a reviewed commit. Keep rejected photographs out of the manifest and website. A missing photograph displays a compact neutral placeholder, not another location's photo.

## Storage and delivery

The private Cloudflare R2 bucket `242places-media` stages optimized candidates under the content-addressed `candidates/<photo-id>/...` keys recorded in `variants`. No public bucket access, custom domain or production deployment is enabled by this change. Approved publishing remains a separate step after maintainer review.

This review branch serves the checked-in optimized WebP variants from `/media/`, so reviewers and CI can run without private R2 credentials. The original research downloads remain outside the repository. Original source URLs and SHA-256 hashes are recorded for reproducibility. Candidate derivatives use up to 384/768/1280px widths without upscaling; metadata is removed, no scene elements are changed, and the viewer preserves the entire frame. Thumbnails may crop through CSS. The existing city derivatives remain under `/images/`.

The viewer provides the individual author, original source and license. CC BY/CC BY-SA terms continue to apply to photographs and their derivatives; the repository's MIT code license does not replace them. CC0 works retain source credits as provenance.
