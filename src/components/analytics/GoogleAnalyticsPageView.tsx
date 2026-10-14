"use client";

import {usePathname, useSearchParams} from "next/navigation";
import {useEffect} from "react";
import {sanitizedAnalyticsLocation} from "@/lib/analytics-location";

export function GoogleAnalyticsPageView() {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    if (typeof window === "undefined" || typeof window.gtag !== "function") return;

    const location = sanitizedAnalyticsLocation(window.location.href);
    window.gtag("event", "page_view", {
      page_title: document.title,
      page_location: location,
      page_path: new URL(location).pathname
    });
  }, [pathname, searchParams]);

  return null;
}
