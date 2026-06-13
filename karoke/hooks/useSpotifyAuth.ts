"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import {
  buildSpotifyAuthUrl,
  exchangeCodeForToken,
  generateCodeChallenge,
  generateCodeVerifier,
  parseCodeFromUrl,
} from "@/lib/spotify";

const TOKEN_STORAGE_KEY = "karaoke_spotify_token";
const EXPIRY_STORAGE_KEY = "karaoke_spotify_expiry";
const CODE_VERIFIER_KEY = "karaoke_code_verifier";

export function useSpotifyAuth() {
  const isExchanging = useRef(false);
  const [token, setToken] = useState<string>(() => {
    if (typeof window === "undefined") return "";
    const stored = localStorage.getItem(TOKEN_STORAGE_KEY);
    const expiry = localStorage.getItem(EXPIRY_STORAGE_KEY);
    if (stored && expiry && Date.now() < Number(expiry)) return stored;
    if (stored && expiry && Date.now() >= Number(expiry)) {
      localStorage.removeItem(TOKEN_STORAGE_KEY);
      localStorage.removeItem(EXPIRY_STORAGE_KEY);
    }
    return "";
  });

  const isConnected = useMemo(() => Boolean(token), [token]);

  /**
   * Callback sonrasi gelen `code` parametresini access_token ile degistir.
   */
  useEffect(() => {
    const code = parseCodeFromUrl();
    const verifier = sessionStorage.getItem(CODE_VERIFIER_KEY);

    if (!code || !verifier || isExchanging.current) return;

    const clientId = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID;
    const redirectUri =
      process.env.NEXT_PUBLIC_SPOTIFY_REDIRECT_URI ?? window.location.origin;

    if (!clientId) return;

    isExchanging.current = true;

    exchangeCodeForToken(code, redirectUri, verifier, clientId)
      .then(({ accessToken, refreshToken, expiresIn }) => {
        localStorage.setItem(TOKEN_STORAGE_KEY, accessToken);
        localStorage.setItem(
          EXPIRY_STORAGE_KEY,
          String(Date.now() + expiresIn * 1000),
        );
        if (refreshToken) {
          localStorage.setItem("karaoke_refresh_token", refreshToken);
        }
        sessionStorage.removeItem(CODE_VERIFIER_KEY);
        window.history.replaceState(
          {},
          document.title,
          window.location.pathname,
        );
        setToken(accessToken);
      })
      .catch((err) => {
        console.error("Token exchange failed:", err);
        sessionStorage.removeItem(CODE_VERIFIER_KEY);
      })
      .finally(() => {
        isExchanging.current = false;
      });
  }, []);

  const login = useCallback(() => {
    const clientId = process.env.NEXT_PUBLIC_SPOTIFY_CLIENT_ID;
    const redirectUri =
      process.env.NEXT_PUBLIC_SPOTIFY_REDIRECT_URI ?? window.location.origin;

    if (!clientId) {
      alert("NEXT_PUBLIC_SPOTIFY_CLIENT_ID tanimlanmadi.");
      return;
    }

    const verifier = generateCodeVerifier();
    sessionStorage.setItem(CODE_VERIFIER_KEY, verifier);

    generateCodeChallenge(verifier).then((challenge) => {
      const authUrl = buildSpotifyAuthUrl(clientId, redirectUri, challenge);
      window.location.assign(authUrl);
    });
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_STORAGE_KEY);
    localStorage.removeItem(EXPIRY_STORAGE_KEY);
    localStorage.removeItem("karaoke_refresh_token");
    sessionStorage.removeItem(CODE_VERIFIER_KEY);
    setToken("");
  }, []);

  return {
    token,
    isConnected,
    login,
    logout,
  };
}
