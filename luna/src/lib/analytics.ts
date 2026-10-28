// No report contents, personal questions, or assessment answers enter telemetry.
export function track(
  event: string,
  properties: Record<string, string | number> = {},
) {
  if (
    typeof window === "undefined" ||
    localStorage.getItem("luna:analytics:v1") !== "true"
  )
    return;
  window.dispatchEvent(
    new CustomEvent("luna:analytics", {
      detail: { event, properties, timestamp: new Date().toISOString() },
    }),
  );
}
