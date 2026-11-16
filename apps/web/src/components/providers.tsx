"use client";
import { ThemeProvider } from "./theme-provider";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
export function Providers({ children }: { children: React.ReactNode }) {
  const [client] = useState(
    () =>
      new QueryClient({
        defaultOptions: { queries: { staleTime: 300000, retry: 1 } },
      }),
  );
  const path = usePathname();
  useEffect(() => {
    if (
      typeof matchMedia !== "function" ||
      typeof IntersectionObserver === "undefined" ||
      matchMedia("(prefers-reduced-motion: reduce)").matches
    )
      return;
    const observer = new IntersectionObserver(
      (entries) =>
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("revealed");
            observer.unobserve(e.target);
          }
        }),
      { threshold: 0.12 },
    );
    const registered = new WeakSet<Element>();
    const register = () => document.querySelectorAll("[data-reveal]").forEach((el) => {
      if (registered.has(el)) return;
      registered.add(el);
      el.classList.add("reveal-ready");
      observer.observe(el);
    });
    register();
    // Server-streamed sections can arrive after the route's initial effect.
    const mutations = new MutationObserver(register);
    mutations.observe(document.getElementById("main") ?? document.body, { childList: true, subtree: true });
    return () => { mutations.disconnect(); observer.disconnect(); };

  }, [path]);
  return (
    <QueryClientProvider client={client}>
      <ThemeProvider>{children}</ThemeProvider>
    </QueryClientProvider>
  );
}
