export interface Participant {
  id: string;
  name: string;
}

export interface SpotifyTrack {
  id: string;
  name: string;
  artist: string;
  album: string;
  uri: string;
  image?: string;
  durationMs: number;
}

export interface LyricLine {
  id: string;
  startMs: number;
  endMs: number;
  text: string;
}

export interface ScoreBreakdown {
  rhythm: number;
  energy: number;
  pitchStability: number;
  crowdBonus: number;
}

export interface PerformanceScore {
  total: number;
  breakdown: ScoreBreakdown;
  message: string;
}

export interface BluetoothState {
  isSupported: boolean;
  isConnected: boolean;
  deviceName?: string;
  error?: string;
}

export interface AudioTelemetry {
  averageEnergy: number;
  varianceEnergy: number;
  spectralCentroid: number;
  samples: number;
}
