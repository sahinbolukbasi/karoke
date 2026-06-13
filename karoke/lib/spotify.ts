import { SpotifyTrack } from "../types/karaoke";

const SPOTIFY_ACCOUNTS_URL = "https://accounts.spotify.com/authorize";
const SPOTIFY_TOKEN_URL = "https://accounts.spotify.com/api/token";
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

/**
 * PKCE: Rastgele code_verifier üretir (43-128 karakter).
 */
export function generateCodeVerifier(): string {
  const array = new Uint8Array(64);
  crypto.getRandomValues(array);
  return base64UrlEncode(array);
}

/**
 * PKCE: code_verifier'dan SHA-256 code_challenge üretir.
 */
export async function generateCodeChallenge(verifier: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(verifier);
  const digest = await crypto.subtle.digest("SHA-256", data);
  return base64UrlEncode(new Uint8Array(digest));
}

function base64UrlEncode(buffer: Uint8Array): string {
  return btoa(String.fromCharCode(...buffer))
    .replace(/\+/g, "-")
    .replace(/\//g, "_")
    .replace(/=+$/, "");
}

export function buildSpotifyAuthUrl(
  clientId: string,
  redirectUri: string,
  codeChallenge: string,
): string {
  const params = new URLSearchParams({
    client_id: clientId,
    response_type: "code",
    redirect_uri: redirectUri,
    code_challenge_method: "S256",
    code_challenge: codeChallenge,
    scope: SPOTIFY_SCOPES.join(" "),
    show_dialog: "true",
  });

  return `${SPOTIFY_ACCOUNTS_URL}?${params.toString()}`;
}

/**
 * Yetkilendirme kodunu Spotify API'ye gönderip access_token alır.
 */
export async function exchangeCodeForToken(
  code: string,
  redirectUri: string,
  codeVerifier: string,
  clientId: string,
): Promise<{ accessToken: string; refreshToken: string; expiresIn: number }> {
  const body = new URLSearchParams({
    client_id: clientId,
    grant_type: "authorization_code",
    code,
    redirect_uri: redirectUri,
    code_verifier: codeVerifier,
  });

  const response = await fetch(SPOTIFY_TOKEN_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/x-www-form-urlencoded",
    },
    body: body.toString(),
  });

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Token alinamadi: ${err}`);
  }

  const data = await response.json();
  return {
    accessToken: data.access_token,
    refreshToken: data.refresh_token,
    expiresIn: data.expires_in,
  };
}

/**
 * URL'deki authorization_code parametresini döndürür.
 */
export function parseCodeFromUrl(): string | null {
  const params = new URLSearchParams(window.location.search);
  return params.get("code");
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
