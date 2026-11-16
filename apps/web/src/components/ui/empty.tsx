import type { ComponentProps } from "react";
import { cn } from "@/lib/utils";

// Composition follows shadcn/ui Empty with the site's existing surface tokens.
export function Empty({ className, ...props }: ComponentProps<"div">) {
  return <div data-slot="empty" className={cn("empty", className)} {...props} />;
}
export function EmptyHeader(props: ComponentProps<"div">) {
  return <div data-slot="empty-header" className="empty-header" {...props} />;
}
export function EmptyMedia(props: ComponentProps<"div">) {
  return <div data-slot="empty-media" className="empty-media" {...props} />;
}
export function EmptyTitle(props: ComponentProps<"h3">) {
  return <h3 data-slot="empty-title" className="empty-title" {...props} />;
}
export function EmptyDescription(props: ComponentProps<"p">) {
  return <p data-slot="empty-description" className="empty-description" {...props} />;
}
export function EmptyContent(props: ComponentProps<"div">) {
  return <div data-slot="empty-content" className="empty-content" {...props} />;
}
