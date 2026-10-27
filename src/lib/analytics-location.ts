const allowedCampaignParams = new Set([
  "utm_source",
  "utm_medium",
  "utm_campaign",
  "utm_content",
  "utm_term",
  "gclid",
  "dclid",
  "gbraid",
  "wbraid",
  "msclkid"
]);

export function sanitizedAnalyticsLocation(value: string) {
  const url = new URL(value);
  const sanitized = new URL(url.origin + url.pathname);

  for (const key of allowedCampaignParams) {
    const parameterValue = url.searchParams.get(key);
    if (parameterValue !== null) sanitized.searchParams.set(key, parameterValue);
  }

  return sanitized.toString();
}

export function sanitizedAnalyticsReferrer(value: string) {
  if (!value) return "";
  try {
    const url = new URL(value);
    // Referrer queries may contain user content on external sites as well.
    return /^https?:$/.test(url.protocol) ? url.origin + url.pathname : "";
  } catch {
    return "";
  }
}
