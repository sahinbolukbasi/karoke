"use client";

import { useCallback, useMemo, useState } from "react";
import { BluetoothState } from "@/types/karaoke";

interface BluetoothGattLike {
  connected?: boolean;
  connect: () => Promise<void>;
  disconnect: () => void;
}

interface BluetoothDeviceLike {
  name?: string;
  gatt?: BluetoothGattLike;
  addEventListener: (event: "gattserverdisconnected", callback: () => void) => void;
}

interface RequestDeviceOptionsLike {
  acceptAllDevices: boolean;
  optionalServices?: string[];
}

type BluetoothNavigator = Navigator & {
  bluetooth?: {
    requestDevice: (options: RequestDeviceOptionsLike) => Promise<BluetoothDeviceLike>;
  };
};

export function useWebBluetooth() {
  const [device, setDevice] = useState<BluetoothDeviceLike | null>(null);
  const [error, setError] = useState("");

  const isSupported = useMemo(() => {
    if (typeof navigator === "undefined") {
      return false;
    }

    const nav = navigator as BluetoothNavigator;
    return Boolean(nav.bluetooth?.requestDevice);
  }, []);

  const connect = useCallback(async () => {
    const nav = navigator as BluetoothNavigator;
    if (!nav.bluetooth?.requestDevice) {
      setError("Tarayici Web Bluetooth desteklemiyor.");
      return;
    }

    try {
      setError("");
      const chosenDevice = await nav.bluetooth.requestDevice({
        acceptAllDevices: true,
        optionalServices: ["battery_service", "device_information"],
      });

      setDevice(chosenDevice);
      chosenDevice.addEventListener("gattserverdisconnected", () => {
        setDevice(null);
      });

      if (chosenDevice.gatt && !chosenDevice.gatt.connected) {
        await chosenDevice.gatt.connect();
      }
    } catch {
      setError("Bluetooth cihazi baglantisi tamamlanamadi.");
    }
  }, []);

  const disconnect = useCallback(() => {
    if (device?.gatt?.connected) {
      device.gatt.disconnect();
    }
    setDevice(null);
  }, [device]);

  const state: BluetoothState = {
    isSupported,
    isConnected: Boolean(device),
    deviceName: device?.name ?? "Bilinmeyen cihaz",
    error: error || undefined,
  };

  return {
    state,
    connect,
    disconnect,
  };
}
