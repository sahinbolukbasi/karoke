"use client";

import { useCallback, useRef, useState } from "react";
import { AudioTelemetry, PerformanceScore } from "@/types/karaoke";

export function useAudioScoring() {
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [error, setError] = useState("");

  const streamRef = useRef<MediaStream | null>(null);
  const contextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const intervalRef = useRef<number | null>(null);

  const samplesRef = useRef<number[]>([]);
  const centroidsRef = useRef<number[]>([]);

  const stopSampling = useCallback(() => {
    if (intervalRef.current) {
      window.clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
  }, []);

  const resetBuffers = useCallback(() => {
    samplesRef.current = [];
    centroidsRef.current = [];
  }, []);

  const startAnalysis = useCallback(async () => {
    try {
      setError("");
      resetBuffers();

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;

      const context = new AudioContext();
      contextRef.current = context;

      const source = context.createMediaStreamSource(stream);
      const analyser = context.createAnalyser();
      analyser.fftSize = 2048;
      analyser.smoothingTimeConstant = 0.85;
      source.connect(analyser);
      analyserRef.current = analyser;

      intervalRef.current = window.setInterval(() => {
        const activeAnalyser = analyserRef.current;
        if (!activeAnalyser) {
          return;
        }

        const timeData = new Uint8Array(activeAnalyser.fftSize);
        activeAnalyser.getByteTimeDomainData(timeData);

        const rms = Math.sqrt(
          timeData.reduce((acc, value) => {
            const normalized = (value - 128) / 128;
            return acc + normalized * normalized;
          }, 0) / timeData.length,
        );

        const freqData = new Uint8Array(activeAnalyser.frequencyBinCount);
        activeAnalyser.getByteFrequencyData(freqData);

        let weightedSum = 0;
        let magnitudeSum = 0;
        for (let i = 0; i < freqData.length; i += 1) {
          weightedSum += i * freqData[i];
          magnitudeSum += freqData[i];
        }
        const centroid = magnitudeSum > 0 ? weightedSum / magnitudeSum : 0;

        samplesRef.current.push(rms);
        centroidsRef.current.push(centroid);
      }, 120);

      setIsAnalyzing(true);
    } catch {
      setError("Mikrofon izni alinamadi veya ses analizi baslatilamadi.");
      setIsAnalyzing(false);
    }
  }, [resetBuffers]);

  const stopAnalysis = useCallback(async (): Promise<AudioTelemetry> => {
    stopSampling();

    streamRef.current?.getTracks().forEach((track) => track.stop());
    streamRef.current = null;

    if (contextRef.current && contextRef.current.state !== "closed") {
      await contextRef.current.close();
    }
    contextRef.current = null;
    analyserRef.current = null;

    const energies = samplesRef.current;
    const centroids = centroidsRef.current;

    const averageEnergy = energies.length
      ? energies.reduce((acc, value) => acc + value, 0) / energies.length
      : 0;

    const varianceEnergy = energies.length
      ? energies.reduce((acc, value) => {
          const diff = value - averageEnergy;
          return acc + diff * diff;
        }, 0) / energies.length
      : 0;

    const spectralCentroid = centroids.length
      ? centroids.reduce((acc, value) => acc + value, 0) / centroids.length
      : 0;

    setIsAnalyzing(false);

    return {
      averageEnergy,
      varianceEnergy,
      spectralCentroid,
      samples: energies.length,
    };
  }, [stopSampling]);

  const scorePerformance = useCallback((telemetry: AudioTelemetry): PerformanceScore => {
    const rhythm = Math.min(100, Math.round((1 - Math.min(telemetry.varianceEnergy, 0.08) / 0.08) * 100));
    const energy = Math.min(100, Math.round(Math.min(telemetry.averageEnergy, 0.55) / 0.55 * 100));
    const pitchStability = Math.min(
      100,
      Math.round((1 - Math.min(Math.abs(telemetry.spectralCentroid - 140), 140) / 140) * 100),
    );
    const crowdBonus = Math.min(100, 65 + Math.floor(Math.random() * 35));

    const total = Math.round(rhythm * 0.3 + energy * 0.25 + pitchStability * 0.25 + crowdBonus * 0.2);

    const message =
      total >= 90
        ? "Sahne senin! Bu performans geceyi yakti."
        : total >= 75
          ? "Harika enerji! Bir sonraki turda zirve kesin."
          : total >= 60
            ? "Ritim iyi, biraz daha cesur vokal ile cok daha iyi olur."
            : "Eglenmeye devam! Isinma turu super bir baslangic.";

    return {
      total,
      breakdown: {
        rhythm,
        energy,
        pitchStability,
        crowdBonus,
      },
      message,
    };
  }, []);

  return {
    isAnalyzing,
    error,
    startAnalysis,
    stopAnalysis,
    scorePerformance,
  };
}
