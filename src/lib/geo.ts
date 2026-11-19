// Location captured by the phone at clock in / clock out.

export type GeoReading =
  | { ok: true; lat: number; lng: number; accuracy: number }
  | { ok: false; issue: GeoIssue };

export type GeoIssue = "denied" | "unavailable" | "timeout" | "unsupported";

const ISSUES: GeoIssue[] = ["denied", "unavailable", "timeout", "unsupported"];

export const GEO_ISSUE_TEXT: Record<GeoIssue, string> = {
  denied: "Location blocked on phone",
  unavailable: "Phone could not find location",
  timeout: "Location timed out",
  unsupported: "Phone does not support location"
};

/** Runs in the browser. Never throws: a missing location is recorded, not blocking. */
export function readLocation(timeoutMs = 12000): Promise<GeoReading> {
  if (typeof navigator === "undefined" || !navigator.geolocation) {
    return Promise.resolve({ ok: false, issue: "unsupported" });
  }
  return new Promise((resolve) => {
    navigator.geolocation.getCurrentPosition(
      (pos) =>
        resolve({
          ok: true,
          lat: pos.coords.latitude,
          lng: pos.coords.longitude,
          accuracy: Math.round(pos.coords.accuracy)
        }),
      (err) =>
        resolve({
          ok: false,
          issue: err.code === err.PERMISSION_DENIED ? "denied" : err.code === err.TIMEOUT ? "timeout" : "unavailable"
        }),
      { enableHighAccuracy: true, timeout: timeoutMs, maximumAge: 60000 }
    );
  });
}

/** Server side: turn whatever the phone sent into safe database fields. */
export function cleanGeo(input: unknown): { lat: number | null; lng: number | null; accuracy: number | null; issue: string | null } {
  const g = input as Partial<{ ok: boolean; lat: unknown; lng: unknown; accuracy: unknown; issue: unknown }> | null;
  if (g && g.ok === true) {
    const lat = Number(g.lat);
    const lng = Number(g.lng);
    const acc = Number(g.accuracy);
    if (Number.isFinite(lat) && Number.isFinite(lng) && Math.abs(lat) <= 90 && Math.abs(lng) <= 180) {
      return {
        lat: Math.round(lat * 1e6) / 1e6,
        lng: Math.round(lng * 1e6) / 1e6,
        accuracy: Number.isFinite(acc) && acc >= 0 ? Math.min(Math.round(acc), 1_000_000) : null,
        issue: null
      };
    }
  }
  const issue = ISSUES.find((i) => i === g?.issue) ?? "unavailable";
  return { lat: null, lng: null, accuracy: null, issue };
}

export function mapUrl(lat: number, lng: number): string {
  return `https://www.google.com/maps?q=${lat},${lng}`;
}

/** Straight-line distance in km, used to flag when clock out is far from clock in. */
export function distanceKm(aLat: number, aLng: number, bLat: number, bLng: number): number {
  const R = 6371;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(bLat - aLat);
  const dLng = toRad(bLng - aLng);
  const h = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(aLat)) * Math.cos(toRad(bLat)) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(h));
}
