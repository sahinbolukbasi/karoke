"use client";

import { useEffect, useRef, useState } from "react";

interface WebPlaybackPlayer {
  connect: () => Promise<boolean>;
  disconnect: () => void;
  addListener: (
    event:
      | "ready"
      | "not_ready"
      | "initialization_error"
      | "authentication_error"
      | "account_error"
      | "playback_error",
    callback: (data: { device_id?: string; message?: string }) => void,
  ) => boolean;
}

export function useSpotifyPlayer(token: string) {
  const [deviceId, setDeviceId] = useState<string>("");
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string>("");
  const playerRef = useRef<WebPlaybackPlayer | null>(null);

  useEffect(() => {
    if (!token) {
      playerRef.current?.disconnect();
      return;
    }

    const scriptId = "spotify-sdk";
    const existingScript = document.getElementById(scriptId) as HTMLScriptElement | null;

    if (!existingScript) {
      const script = document.createElement("script");
      script.id = scriptId;
      script.src = "https://sdk.scdn.co/spotify-player.js";
      script.async = true;
      document.body.appendChild(script);
    }

    window.onSpotifyWebPlaybackSDKReady = () => {
      if (!window.Spotify) {
        setError("Spotify SDK yuklenemedi.");
        return;
      }

      const player = new window.Spotify.Player({
        name: "Neon Karaoke Player",
        getOAuthToken: (cb) => cb(token),
        volume: 0.8,
      });

      player.addListener("ready", ({ device_id }) => {
        if (!device_id) {
          setError("Spotify cihaz kimligi alinamadi.");
          return;
        }
        setDeviceId(device_id);
        setIsReady(true);
      });

      player.addListener("not_ready", () => {
        setIsReady(false);
      });

      player.addListener("authentication_error", ({ message }) => {
        setError(message ?? "Spotify kimlik dogrulama hatasi.");
      });

      player.addListener("account_error", ({ message }) => {
        setError(message ?? "Spotify hesap hatasi.");
      });

      player.addListener("playback_error", ({ message }) => {
        setError(message ?? "Spotify oynatma hatasi.");
      });

      player
        .connect()
        .then((connected) => {
          if (!connected) {
            setError("Spotify oynatici baglanamadi.");
          }
        })
        .catch(() => {
          setError("Spotify oynatici baglantisi basarisiz.");
        });

      playerRef.current = player;
    };

    return () => {
      playerRef.current?.disconnect();
    };
  }, [token]);

  return {
    deviceId: token ? deviceId : "",
    isReady: token ? isReady : false,
    error: token ? error : "",
  };
}
