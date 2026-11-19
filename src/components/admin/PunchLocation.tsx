import { GEO_ISSUE_TEXT, distanceKm, mapUrl, type GeoIssue } from "@/lib/geo";

type Entry = {
  clockOut: Date | null;
  clockInLat: number | null;
  clockInLng: number | null;
  clockInAccuracy: number | null;
  clockInGeoIssue: string | null;
  clockOutLat: number | null;
  clockOutLng: number | null;
  clockOutAccuracy: number | null;
  clockOutGeoIssue: string | null;
};

function Point({
  label,
  lat,
  lng,
  accuracy,
  issue
}: {
  label: string;
  lat: number | null;
  lng: number | null;
  accuracy: number | null;
  issue: string | null;
}) {
  if (lat !== null && lng !== null) {
    return (
      <span>
        {label}:{" "}
        <a href={mapUrl(lat, lng)} target="_blank" rel="noopener noreferrer" className="text-brand-600 underline">
          map
        </a>
        {accuracy !== null && <span> (within {accuracy >= 1000 ? `${(accuracy / 1000).toFixed(1)} km` : `${accuracy} m`})</span>}
      </span>
    );
  }
  if (issue) {
    return (
      <span className="text-amber-700">
        {label}: {GEO_ISSUE_TEXT[issue as GeoIssue] ?? "No location"}
      </span>
    );
  }
  return <span>{label}: entered by admin</span>;
}

/** One line under a time entry: where the phone was at clock in and clock out. */
export default function PunchLocation({ entry: e, compact }: { entry: Entry; compact?: boolean }) {
  let moved: number | null = null;
  if (e.clockInLat !== null && e.clockInLng !== null && e.clockOutLat !== null && e.clockOutLng !== null) {
    moved = distanceKm(e.clockInLat, e.clockInLng, e.clockOutLat, e.clockOutLng);
  }
  return (
    <div className={`flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-ink-700 ${compact ? "" : "mt-0.5"}`}>
      <Point label="In" lat={e.clockInLat} lng={e.clockInLng} accuracy={e.clockInAccuracy} issue={e.clockInGeoIssue} />
      {e.clockOut && (
        <Point label="Out" lat={e.clockOutLat} lng={e.clockOutLng} accuracy={e.clockOutAccuracy} issue={e.clockOutGeoIssue} />
      )}
      {moved !== null && moved >= 1 && moved * 1000 > (e.clockInAccuracy ?? 0) + (e.clockOutAccuracy ?? 0) && (
        <span className="text-amber-700">Clocked out {moved.toFixed(1)} km from where they clocked in</span>
      )}
    </div>
  );
}

/** True if a punch from the phone came in without a location. */
export function missingLocation(e: Entry): boolean {
  return !!e.clockInGeoIssue || (!!e.clockOut && !!e.clockOutGeoIssue);
}
