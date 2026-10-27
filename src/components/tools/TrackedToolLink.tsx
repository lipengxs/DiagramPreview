"use client";

import type {ReactNode} from "react";
import {Link} from "@/i18n/navigation";
import {trackEvent, type AnalyticsEventName} from "@/lib/analytics";
import {locales} from "@/config/locales";

type TrackedToolLinkProps = {
  href: string;
  children: ReactNode;
  className?: string;
  eventName: AnalyticsEventName;
  toolSlug?: string;
  targetToolSlug: string;
  source?: string;
};

export function TrackedToolLink({
  href,
  children,
  className,
  eventName,
  toolSlug,
  targetToolSlug,
  source
}: TrackedToolLinkProps) {
  return (
    <Link
      href={href}
      className={className}
      onClick={(event) => {
        trackEvent(eventName, {
          tool_slug: toolSlug ?? targetToolSlug,
          target_tool_slug: targetToolSlug,
          entry_surface: source
        });
        // Commit same-page history before updating the editor. Otherwise rapid
        // selections can race with router navigation and lose a Back entry.
        const url = new URL(href, window.location.href);
        const samePage = url.pathname === window.location.pathname || locales.some((locale) => window.location.pathname === `/${locale}${url.pathname}`);
        if (url.origin === window.location.origin && url.hash && samePage && !event.metaKey && !event.ctrlKey && !event.shiftKey && !event.altKey && event.button === 0) {
          event.preventDefault();
          if (window.location.hash !== url.hash) window.history.pushState(null, "", `${window.location.pathname}${window.location.search}${url.hash}`);
          window.dispatchEvent(new CustomEvent("diagram-preview:load-source", {detail: window.location.href}));
        }
      }}
    >
      {children}
    </Link>
  );
}
