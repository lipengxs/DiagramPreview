import {sanitizedAnalyticsLocation, sanitizedAnalyticsReferrer} from "./analytics-location";

type AnalyticsParams = Record<string, string | number | boolean | undefined>;

export type AnalyticsEventName =
  | "advanced_export_intent"
  | "ai_generate_error"
  | "ai_generate_start"
  | "ai_generate_success"
  | "ai_review_start"
  | "ai_review_success"
  | "batch_conversion_intent"
  | "batch_conversion_complete"
  | "batch_conversion_error"
  | "monetization_cta_click"
  | "monetization_cta_view"
  | "tool_clear"
  | "tool_copy_code"
  | "tool_copy_html"
  | "tool_copy_markdown"
  | "tool_detected_tool_click"
  | "tool_download_file"
  | "tool_entry_click"
  | "tool_export_pdf"
  | "tool_export_png"
  | "tool_export_svg"
  | "tool_conversion_success"
  | "tool_export_success"
  | "tool_favorite_add"
  | "tool_favorite_remove"
  | "tool_next_step_click"
  | "tool_open"
  | "tool_related_click"
  | "tool_render_error"
  | "tool_render_qualified"
  | "tool_render_success"
  | "tool_sample_load"
  | "tool_search_query"
  | "tool_share_link"
  | "waitlist_open"
  | "waitlist_submit"
  | "workspace_draft_dismissed"
  | "workspace_draft_restored"
  | "workspace_draft_saved";

const measurementId = "G-ED9W50FK0X";

type AnalyticsState = {location?: string; referrer: string};

declare global {
  interface Window {
    gtag?: (...args: unknown[]) => void;
    dataLayer?: unknown[];
    diagramAnalytics?: AnalyticsState;
  }
}

// The local gtag queue is available immediately, even before the remote tag loads.
// A blocked tag must never make a tool action fail.
function initializeAnalytics() {
  if (window.diagramAnalytics) return window.diagramAnalytics;
  window.dataLayer = window.dataLayer || [];
  window.gtag = window.gtag || function () { window.dataLayer!.push(arguments); };
  const state: AnalyticsState = {referrer: sanitizedAnalyticsReferrer(document.referrer)};
  window.diagramAnalytics = state;
  window.gtag("js", new Date());
  window.gtag("set", {
    page_location: sanitizedAnalyticsLocation(window.location.href),
    page_referrer: state.referrer
  });
  window.gtag("config", measurementId, {send_page_view: false});
  return state;
}

export function trackPageView() {
  if (typeof window === "undefined") return;
  try {
    const state = initializeAnalytics();
    const location = sanitizedAnalyticsLocation(window.location.href);
    if (state.location === location) return;
    const referrer = state.location || state.referrer;
    // Update defaults too: later automatic tag events must not inherit raw URLs.
    window.gtag!("set", {page_location: location, page_referrer: referrer});
    window.gtag!("event", "page_view", {
      page_title: document.title,
      page_location: location,
      page_referrer: referrer,
      page_path: new URL(location).pathname
    });
    state.location = location;
    state.referrer = referrer;
  } catch {
    // Analytics is optional; rendering and downloads remain usable.
  }
}

// Explicit keys prevent accidental source/prompt/filename/URL payloads.
const allowedParams = new Set([
  "tool_slug", "target_tool_slug", "renderer", "mode", "output_language", "implemented",
  "render_origin", "entry_surface", "provider", "preview_kind", "sample_key", "reason",
  "source_length", "item_count", "success_count", "failure_count", "success", "intent",
  "artifact_type", "export_stage", "has_query", "query_length", "has_svg", "has_html",
  "has_artifact", "diagram_type", "issue_count", "team_size"
]);

export function trackEvent(eventName: AnalyticsEventName, params: AnalyticsParams = {}) {
  if (typeof window === "undefined") return;
  try {
    trackPageView();
    const state = initializeAnalytics();
    const safeParams = Object.fromEntries(Object.entries(params).filter(([key, value]) => allowedParams.has(key) && value !== undefined));
    window.gtag!("event", eventName, {
      ...safeParams,
      page_location: state.location || sanitizedAnalyticsLocation(window.location.href),
      page_referrer: state.referrer
    });
  } catch {
    // Measurement failures must not turn a successful tool action into a failure.
  }
}
