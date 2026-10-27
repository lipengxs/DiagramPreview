"use client";

import {usePathname, useSearchParams} from "next/navigation";
import Script from "next/script";
import {useEffect, useState} from "react";
import {trackPageView} from "@/lib/analytics";

export function GoogleAnalyticsPageView() {
  const [initialized, setInitialized] = useState(false);
  const pathname = usePathname();
  const searchParams = useSearchParams();

  useEffect(() => {
    trackPageView();
    setInitialized(true);
  }, [pathname, searchParams]);

  return initialized ? <Script src="https://www.googletagmanager.com/gtag/js?id=G-ED9W50FK0X" strategy="afterInteractive" onLoad={trackPageView} /> : null;
}
