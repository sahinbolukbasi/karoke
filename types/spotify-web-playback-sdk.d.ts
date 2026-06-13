declare global {
  interface Window {
    onSpotifyWebPlaybackSDKReady?: () => void;
    Spotify?: {
      Player: new (options: {
        name: string;
        getOAuthToken: (cb: (token: string) => void) => void;
        volume?: number;
      }) => SpotifyPlayer;
    };
  }
}

interface SpotifyPlayer {
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

export {};
