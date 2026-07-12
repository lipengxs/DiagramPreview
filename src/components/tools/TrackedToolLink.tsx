"use client";

import type {ReactNode} from "react";
import {Link} from "@/i18n/navigation";
import {trackEvent, type AnalyticsEventName} from "@/lib/analytics";

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
      onClick={() =>
        trackEvent(eventName, {
          tool_slug: toolSlug ?? targetToolSlug,
          target_tool_slug: targetToolSlug,
          source
        })
      }
    >
      {children}
    </Link>
  );
}
