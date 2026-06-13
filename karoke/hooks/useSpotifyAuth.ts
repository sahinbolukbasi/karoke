"use client";

import { useCallback, useMemo, useState } from "react";
import { buildSpotifyAuthUrl, parseTokenFromHash } from "@/lib/spotify";

const STORAGE_KEY = "karaoke_spotify_token";

export function useSpotifyAuth() {
  const [token, setToken] = useState<string>(() => {
    if (typeof window === "undefined") {
      return "";
    }

    const hashToken = parseTokenFromHash(window.location.hash);
    if (hashToken) {
      localStorage.setItem(STORAGE_KEY, hashToken);
      window.history.replaceState({}, document.title, window.location.pathname);
      return hashToken;
    }

    return localStorage.getItem(STORAGE_KEY) ?? "";
  });

  const isConnected = useMemo(() => Boolean(token), [token]);

  const login = useCallback(() => {
    const clientId = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID;
    const redirectUri = process.env.NEXT_PUBLIC_SPOTIFY_REDIRECT_URI ?? window.location.origin;

    if (!clientId) {
      alert("NEXT_PUBLIC_SPOTIFY_CLIENT_ID tanimlanmadi.");
      return;
    }

    const authUrl = buildSpotifyAuthUrl(clientId, redirectUri);
    window.location.assign(authUrl);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY);
    setToken("");
  }, []);

  return {
    token,
    isConnected,
    login,
    logout,
  };
}
