type AnalyticsParams = Record<string, string | number | boolean | undefined>;

export type AnalyticsEventName =
  | "ai_generate_error"
  | "ai_generate_start"
  | "ai_generate_success"
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
  | "tool_favorite_add"
  | "tool_favorite_remove"
  | "tool_next_step_click"
  | "tool_open"
  | "tool_related_click"
  | "tool_render_error"
  | "tool_render_success"
  | "tool_sample_load"
  | "tool_search_query"
  | "tool_share_link";

declare global {
  interface Window {
    gtag?: (command: "event", eventName: AnalyticsEventName, params?: AnalyticsParams) => void;
  }
}

export function trackEvent(eventName: AnalyticsEventName, params: AnalyticsParams = {}) {
  if (typeof window === "undefined" || typeof window.gtag !== "function") {
    return;
  }

  window.gtag("event", eventName, params);
}
