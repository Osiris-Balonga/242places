"use client";
import { useSearchParams, useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { useQuery } from "@tanstack/react-query";
import { ArrowRight, ChevronLeft, ChevronRight, X } from "lucide-react";
import { SearchForm } from "./search-form";
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription, EmptyContent } from "./ui/empty";
import { MapPinOff } from "lucide-react";
import { Button } from "./ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Skeleton } from "./ui/skeleton";
import { parseSearch, updateSearch } from "@/lib/search-state";
import { label, text, type Locale } from "@/lib/i18n";
type Place = {
  id: string;
  name: string;
  resource: string;
  ancestors: { id: string; name: string; resource: string }[];
};
type Results = {
  data: Place[];
  meta: {
    total: number;
    limit: number;
    offset: number;
    datasetVersion: string;
  };
};
export function Explorer({
  locale,
  departments = [],
  parent,
  direct = false,
}: {
  locale: Locale;
  departments?: { id: string; name: string }[];
  parent?: string;
  direct?: boolean;
}) {
  const params = useSearchParams(),
    router = useRouter(),
    path = usePathname();
  const state = parseSearch(parent ? new URLSearchParams({ offset: params.get("offset") ?? "0" }) : new URLSearchParams(params));
  const update = (changes: Record<string, string | number>) =>
    router.push(
      path + "?" + updateSearch(new URLSearchParams(params), changes),
      { scroll: false },
    );
  const api = new URLSearchParams({
    limit: "20",
    offset: String(state.offset),
  });
  if (state.q) api.set("q", state.q);
  if (state.resource) api.set("resource", state.resource);
  if (parent || state.parent) api.set("parent", parent ?? state.parent);
  if (direct && !state.q && !state.resource) api.set("direct", "true");
  const { data, error, isPending, isFetching, refetch } = useQuery<Results>({
    queryKey: ["places", api.toString()],
    queryFn: async ({ signal }) => {
      const response = await fetch("/v1/search?" + api, { signal });
      if (!response.ok) throw new Error(String(response.status));
      return response.json();
    },
  });
  return (
    <div className={"explorer " + (parent ? "embedded" : "")}>
      <SearchForm key={path + state.q + state.resource} locale={locale} initialQuery={state.q} initialResource={state.resource} />
      <div className="explorer-body">
        {!parent && <aside className="filters">
          <h2>{text(locale, "Affiner la recherche", "Refine your search")}</h2>
          {!parent && (
            <>
              <label htmlFor="territory-filter">
                {text(locale, "Département", "Department")}
              </label>
              <Select
                value={
                  departments.some((d) => d.id === state.parent)
                    ? state.parent
                    : "all"
                }
                onValueChange={(value) =>
                  update({ parent: value === "all" ? "" : value })
                }
              >
                <SelectTrigger id="territory-filter">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">
                    {text(locale, "Tous les départements", "All departments")}
                  </SelectItem>
                  {departments.map((d) => (
                    <SelectItem key={d.id} value={d.id}>
                      {d.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </>
          )}
          <Button
            variant="ghost"
            onClick={() =>
              update({ q: "", resource: "", parent: "", offset: 0 })
            }
          >
            <X size={14} />
            {text(locale, "Réinitialiser", "Reset")}
          </Button>
          {state.parent &&
            !departments.some((d) => d.id === state.parent) &&
            !parent && (
              <p>
                {text(
                  locale,
                  "Recherche limitée au territoire sélectionné.",
                  "Search is scoped to the selected territory.",
                )}
              </p>
            )}
        </aside>}
        <section
          className="results"
          data-reveal
          aria-busy={isFetching}
          aria-label={text(locale, "Résultats", "Results")}
        >
          <div className="results-title">
            <h2>{text(locale, "Lieux répertoriés", "Recorded places")}</h2>
            <span role="status" aria-live="polite">
              {data
                ? data.meta.total +
                  " " +
                  text(
                    locale,
                    data.meta.total === 1 ? "résultat" : "résultats",
                    data.meta.total === 1 ? "result" : "results",
                  )
                : ""}
            </span>
          </div>
          {isPending && (
            <div className="skeleton-list">
              {[1, 2, 3, 4].map((i) => (
                <Skeleton key={i} className="h-24 w-full" />
              ))}
            </div>
          )}
          {error && (
            <div role="alert">
              <p>
                {text(
                  locale,
                  "Les lieux ne peuvent pas être chargés. Réessayez ou réinitialisez les filtres.",
                  "Places could not be loaded. Try again or reset the filters.",
                )}
              </p>
              <Button onClick={() => refetch()} variant="outline">
                {text(locale, "Réessayer", "Try again")}
              </Button>
            </div>
          )}
          {data?.data.map((place) => (
            <Link
              className="result-row"
              href={"/" + locale + "/places/" + place.id}
              key={place.id}
            >
              <div>
                <h3>{place.name}</h3>
                <span className="kind-label">
                  {label(place.resource, locale)}
                </span>
                {(!parent || state.q || state.resource) && (
                  <p>
                    {place.ancestors
                      .filter((a) => a.resource !== "countries")
                      .map(
                        (a) => a.name + " (" + label(a.resource, locale) + ")",
                      )
                      .join(" · ")}
                  </p>
                )}
              </div>
              <ArrowRight size={19} />
            </Link>
          ))}
          {data?.meta.total === 0 && (
            <Empty className="search-empty">
              <EmptyHeader>
                <EmptyMedia><MapPinOff size={24} aria-hidden="true" /></EmptyMedia>
                <EmptyTitle>{parent && !state.q && !state.resource
                  ? text(locale, "Aucun lieu rattaché répertorié", "No attached places recorded")
                  : text(locale, "Aucun lieu trouvé", "No places found")}</EmptyTitle>
                <EmptyDescription>{parent && !state.q && !state.resource
                  ? text(locale, "Aucun lieu directement rattaché n’est documenté ici pour le moment. Le référentiel reste partiel.", "No directly attached places are documented here yet. Coverage remains partial.")
                  : text(locale, "Essayez un autre nom ou retirez un filtre. Le référentiel reste partiel.", "Try another name or remove a filter. Coverage remains partial.")}</EmptyDescription>
              </EmptyHeader>
              <EmptyContent>
                {state.q || state.resource || state.parent ? <Button variant="outline" onClick={() => update({ q: "", resource: "", parent: "", offset: 0 })}>
                  {text(locale, "Effacer la recherche", "Clear search")}
                </Button> : <Link href={"/" + locale + "/explore"}>{text(locale, "Explorer les lieux du Congo", "Explore places in the Congo")}</Link>}
              </EmptyContent>
            </Empty>
          )}
          {data && data.meta.total > 20 && (
            <nav className="pagination" aria-label="Pagination">
              <Button
                variant="outline"
                disabled={state.offset === 0}
                onClick={() =>
                  update({ offset: Math.max(0, state.offset - 20) })
                }
              >
                <ChevronLeft size={16} />
                {text(locale, "Précédent", "Previous")}
              </Button>
              <span>
                {Math.floor(state.offset / 20) + 1} /{" "}
                {Math.ceil(data.meta.total / 20)}
              </span>
              <Button
                variant="outline"
                disabled={state.offset + 20 >= data.meta.total}
                onClick={() => update({ offset: state.offset + 20 })}
              >
                {text(locale, "Suivant", "Next")}
                <ChevronRight size={16} />
              </Button>
            </nav>
          )}
          <p className="coverage-note">
            {text(
              locale,
              "Couverture partielle : un lieu absent peut simplement ne pas être documenté.",
              "Partial coverage: a missing place may simply not be documented.",
            )}{" "}
            <Link href={"/" + locale + "/project#sources"}>
              {text(locale, "Sources", "Sources")}
            </Link>
          </p>
        </section>
      </div>
    </div>
  );
}
