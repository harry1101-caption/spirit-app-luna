import posthog from "posthog-js";
import { hasAnalyticsConsent } from "@/lib/analytics";

const key = process.env.NEXT_PUBLIC_POSTHOG_KEY;

// Capturing starts unless the user has turned the analytics switch off.
// Autocapture and session replay stay off: they would pick up the private
// questions and answers that analytics.ts promises never to send.
if (key) {
  posthog.init(key, {
    api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST ?? "https://us.i.posthog.com",
    defaults: "2025-05-24",
    capture_pageview: "history_change",
    autocapture: false,
    disable_session_recording: true,
    persistence: "localStorage",
    person_profiles: "identified_only",
    opt_out_capturing_by_default: true,
  });
  if (hasAnalyticsConsent()) posthog.opt_in_capturing();
}
