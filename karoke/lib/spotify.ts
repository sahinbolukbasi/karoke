import { SpotifyTrack } from "@/types/karaoke";

const SPOTIFY_ACCOUNTS_URL = "https://accounts.spotify.com/authorize";
const SPOTIFY_API_URL = "https://api.spotify.com/v1";

const SPOTIFY_SCOPES = [
  "user-read-email",
  "user-read-private",
  "streaming",
  "user-read-playback-state",
  "user-modify-playback-state",
  "playlist-read-private",
  "playlist-read-collaborative",
];

export function buildSpotifyAuthUrl(clientId: string, redirectUri: string): string {
  const params = new URLSearchParams({
    client_id: clientId,
    response_type: "token",
    redirect_uri: redirectUri,
    scope: SPOTIFY_SCOPES.join(" "),
    show_dialog: "true",
  });

  return `${SPOTIFY_ACCOUNTS_URL}?${params.toString()}`;
}

export function parseTokenFromHash(hash: string): string | null {
  const raw = hash.startsWith("#") ? hash.slice(1) : hash;
  const params = new URLSearchParams(raw);
  return params.get("access_token");
}

export async function searchSpotifyTracks(token: string, query: string): Promise<SpotifyTrack[]> {
  if (!query.trim()) {
    return [];
  }

  const params = new URLSearchParams({
    q: query,
    type: "track",
    limit: "8",
  });

  const response = await fetch(`${SPOTIFY_API_URL}/search?${params.toString()}`, {
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });

  if (!response.ok) {
    throw new Error("Spotify arama istegi basarisiz oldu.");
  }

  const json = await response.json();

  return (json.tracks?.items ?? []).map(
    (item: {
      id: string;
      name: string;
      uri: string;
      duration_ms: number;
      artists: Array<{ name: string }>;
      album: { name: string; images: Array<{ url: string }> };
    }) => ({
      id: item.id,
      name: item.name,
      artist: item.artists.map((artist) => artist.name).join(", "),
      album: item.album.name,
      uri: item.uri,
      image: item.album.images?.[0]?.url,
      durationMs: item.duration_ms,
    }),
  );
}

export async function startSpotifyPlayback(
  token: string,
  trackUri: string,
  deviceId?: string,
): Promise<void> {
  const deviceQuery = deviceId ? `?device_id=${deviceId}` : "";
  const response = await fetch(`${SPOTIFY_API_URL}/me/player/play${deviceQuery}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      uris: [trackUri],
    }),
  });

  if (!response.ok) {
    throw new Error("Spotify oynatma baslatilamadi. Premium hesap gerekebilir.");
  }
}
