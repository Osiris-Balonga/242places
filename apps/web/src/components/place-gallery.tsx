"use client";
import { useRef, useState } from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { ImageOff, ChevronLeft, ChevronRight, X } from "lucide-react";
import type { PlacePhoto } from "../lib/place-photo";
type Locale = "fr" | "en";
function Photo({
  photo,
  locale,
  large = false,
  eager = false,
  sizes,
}: {
  photo: PlacePhoto;
  locale: Locale;
  large?: boolean;
  eager?: boolean;
  sizes?: string;
}) {
  const [failed, setFailed] = useState(false);
  if (failed)
    return (
      <span className="gallery-image-error">
        <ImageOff aria-hidden="true" size={28} />
        <span>
          {locale === "fr" ? "Photo indisponible" : "Photo unavailable"}
        </span>
      </span>
    );
  return (
    <img
      src={photo.src}
      srcSet={photo.srcSet}
      sizes={large ? "100vw" : sizes}
      width={photo.width}
      height={photo.height}
      alt={photo.caption[locale]}
      loading={large || eager ? "eager" : "lazy"}
      decoding="async"
      onError={() => setFailed(true)}
    />
  );
}
export function PlaceGallery({
  photos,
  locale,
  placeName,
}: {
  photos: PlacePhoto[];
  locale: Locale;
  placeName: string;
}) {
  const [index, setIndex] = useState<number | null>(null);
  const opener = useRef<HTMLButtonElement | null>(null);
  const fr = locale === "fr";
  const title = `${fr ? "Photos de" : "Photos of"} ${placeName}`;
  const active = photos[index ?? 0];
  function open(at: number, button: HTMLButtonElement) {
    opener.current = button;
    setIndex(at);
  }
  function move(delta: number) {
    setIndex(
      (current) => ((current ?? 0) + delta + photos.length) % photos.length,
    );
  }
  if (!photos.length)
    return (
      <div
        className="place-no-photo"
        role="img"
        aria-label={`${fr ? "Aucune photo disponible pour" : "No photos available for"} ${placeName}`}
      >
        <ImageOff size={34} aria-hidden="true" />
        <span>{fr ? "Aucune photo disponible" : "No photos available"}</span>
      </div>
    );
  function tile(at: number) {
    const photo = photos[at];
    return (
      <button
        className="gallery-tile"
        key={photo.id}
        aria-label={
          fr
            ? `Ouvrir la photo ${at + 1} sur ${photos.length}`
            : `Open photo ${at + 1} of ${photos.length}`
        }
        onClick={(event) => open(at, event.currentTarget)}
      >
        <Photo
          photo={photo}
          locale={locale}
          eager={at === 0}
          sizes={
            at === 0
              ? "(max-width: 700px) calc(100vw - 40px), (max-width: 1000px) 60vw, 800px"
              : at === 2 && photos.length > 3
                ? "(max-width: 700px) 23vw, 230px"
                : "(max-width: 700px) 46vw, 460px"
          }
        />
      </button>
    );
  }
  return (
    <section className="place-gallery" aria-label={title}>
      <div className="gallery-mosaic" data-count={Math.min(photos.length, 4)}>
        {tile(0)}
        {photos.length > 1 && tile(1)}
        {photos.length === 3 && tile(2)}
        {photos.length > 3 && (
          <div className="gallery-tail">
            {tile(2)}
            <button
              className="gallery-more"
              aria-label={
                fr
                  ? photos.length === 4
                    ? "Voir l’autre photo"
                    : `Voir les ${photos.length - 3} autres photos`
                  : `View ${photos.length - 3} more ${photos.length === 4 ? "photo" : "photos"}`
              }
              onClick={(event) => open(3, event.currentTarget)}
            >
              <Photo
                photo={photos[3]}
                locale={locale}
                sizes="(max-width: 700px) 23vw, 230px"
              />
              <span aria-hidden="true">+{photos.length - 3}</span>
            </button>
          </div>
        )}
      </div>
      <Dialog.Root
        open={index !== null}
        onOpenChange={(open) => {
          if (!open) setIndex(null);
        }}
      >
        <Dialog.Portal>
          <Dialog.Overlay className="gallery-overlay" />
          <Dialog.Content
            className="gallery-viewer"
            aria-describedby={undefined}
            onCloseAutoFocus={(event) => {
              event.preventDefault();
              opener.current?.focus();
            }}
            onKeyDown={(event) => {
              if (event.key === "ArrowRight" || event.key === "ArrowLeft") {
                event.preventDefault();
                move(event.key === "ArrowRight" ? 1 : -1);
              }
            }}
          >
            <header className="gallery-viewer-header">
              <Dialog.Title>{title}</Dialog.Title>
              <span className="gallery-position" aria-live="polite">
                {(index ?? 0) + 1} / {photos.length}
              </span>
              <Dialog.Close
                className="gallery-control"
                aria-label={fr ? "Fermer la galerie" : "Close gallery"}
              >
                <X size={22} />
              </Dialog.Close>
            </header>
            <div className="gallery-stage">
              {photos.length > 1 && (
                <button
                  className="gallery-control gallery-previous"
                  aria-label={fr ? "Photo précédente" : "Previous photo"}
                  onClick={() => move(-1)}
                >
                  <ChevronLeft />
                </button>
              )}
              <Photo key={active.id} photo={active} locale={locale} large />
              {photos.length > 1 && (
                <button
                  className="gallery-control gallery-next"
                  aria-label={fr ? "Photo suivante" : "Next photo"}
                  onClick={() => move(1)}
                >
                  <ChevronRight />
                </button>
              )}
            </div>
            <footer className="gallery-caption">
              <p>{active.caption[locale]}</p>
              <div>
                <span>{active.author}</span>
                <a href={active.sourceUrl} target="_blank" rel="noreferrer">
                  Source
                </a>
                <a href={active.licenseUrl} target="_blank" rel="noreferrer">
                  {active.license}
                </a>
              </div>
            </footer>
          </Dialog.Content>
        </Dialog.Portal>
      </Dialog.Root>
    </section>
  );
}
