// Extract lat/lng from common Google Maps URLs.
// Supports:
// - https://www.google.com/maps/@52.520008,13.404954,17z
// - ...!3d52.520008!4d13.404954...

export function parseGoogleMapsLatLng(url: string): { lat: number; lng: number } | null {
  const s = (url || "").trim();
  if (!s) return null;

  // @lat,lng
  const at = s.match(/@(-?\d+\.\d+),\s*(-?\d+\.\d+)/);
  if (at) {
    const lat = Number(at[1]);
    const lng = Number(at[2]);
    if (Number.isFinite(lat) && Number.isFinite(lng)) return { lat, lng };
  }

  // !3dlat!4dlng
  const bang = s.match(/!3d(-?\d+\.\d+)!4d(-?\d+\.\d+)/);
  if (bang) {
    const lat = Number(bang[1]);
    const lng = Number(bang[2]);
    if (Number.isFinite(lat) && Number.isFinite(lng)) return { lat, lng };
  }

  return null;
}
