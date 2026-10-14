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

  for (const [key, parameterValue] of url.searchParams) {
    if (allowedCampaignParams.has(key)) sanitized.searchParams.set(key, parameterValue);
  }

  return sanitized.toString();
}
