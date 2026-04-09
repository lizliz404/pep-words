import { useEffect, useState } from "react";
import type { RouteKey } from "@/types";

export const DEFAULT_ROUTE: RouteKey = "middle-school";

const VALID_ROUTES = new Set<RouteKey>([
  "middle-school",
  "primary-school",
  "docs/middle-school",
  "docs/primary-school",
]);

export function routeToHash(route: RouteKey) {
  return `#/${route}`;
}

export function normalizeHashRoute(hash: string): RouteKey {
  const normalized = hash.replace(/^#\/?/, "").replace(/\/+$/, "");

  if (VALID_ROUTES.has(normalized as RouteKey)) {
    return normalized as RouteKey;
  }

  return DEFAULT_ROUTE;
}

export function useHashRoute() {
  const [route, setRoute] = useState<RouteKey>(() => {
    if (typeof window === "undefined") {
      return DEFAULT_ROUTE;
    }

    return normalizeHashRoute(window.location.hash);
  });

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const current = normalizeHashRoute(window.location.hash);
    const expectedHash = routeToHash(current);

    if (window.location.hash !== expectedHash) {
      window.location.hash = expectedHash;
    } else {
      setRoute(current);
    }

    const handleHashChange = () => {
      setRoute(normalizeHashRoute(window.location.hash));
    };

    window.addEventListener("hashchange", handleHashChange);

    return () => {
      window.removeEventListener("hashchange", handleHashChange);
    };
  }, []);

  const navigate = (nextRoute: RouteKey) => {
    const nextHash = routeToHash(nextRoute);

    if (window.location.hash === nextHash) {
      setRoute(nextRoute);
      return;
    }

    window.location.hash = nextHash;
  };

  return {
    route,
    navigate,
  };
}
