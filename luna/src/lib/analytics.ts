import posthog from "posthog-js";

const CONSENT_KEY = "luna:analytics:v1";

// On by default; only an explicit opt-out in settings turns it off.
export function hasAnalyticsConsent() {
  return typeof window !== "undefined" && localStorage.getItem(CONSENT_KEY) !== "false";
}

export function setAnalyticsConsent(allowed: boolean) {
  localStorage.setItem(CONSENT_KEY, String(allowed));
  if (!posthog.__loaded) return;
  if (allowed) posthog.opt_in_capturing();
  else posthog.opt_out_capturing();
}

// Forget the anonymous id so the visitor starts over; consent returns to the default.
export function clearAnalytics() {
  localStorage.removeItem(CONSENT_KEY);
  if (!posthog.__loaded) return;
  posthog.reset(true);
  posthog.opt_in_capturing();
}

// No report contents, personal questions, or assessment answers enter telemetry.
export function track(
  event: string,
  properties: Record<string, string | number> = {},
) {
  if (!hasAnalyticsConsent() || !posthog.__loaded) return;
  posthog.capture(event, properties);
}
