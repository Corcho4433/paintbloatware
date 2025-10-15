import { BaseMetadata,OS,Device } from "../types/telemetry";

export async function fetchWithTelemetry(
  input: RequestInfo,
  init?: RequestInit,
): Promise<Response> {
  const metadata = await buildBaseMetadata();
  logTelemetry("fetch", { input, init, metadata });
  return fetch(input, init);
}

export async function logTelemetry(
  eventType: string,
  metadata: Record<string, any>,
  userId?: string
) {
  try {
    const body = {
      eventType,
      userId,
      metadata: {
        ...metadata,
        schemaVersion: 1,
        userId: getUserID(),
        appVersion: "1.0.0",
        device: detectDevice(),
      },
    };

    // mandamos a backend
    await fetch("/api/telemetry", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(body),
      keepalive: true, // permite mandar datos al cerrar pestaña
    });
  } catch (err) {
    console.warn("Failed to send telemetry:", err);
  }
}

function getUserID(): string | undefined {
  try {
    return localStorage.getItem("userID") || undefined;
  } catch (err) {
    console.warn("Failed to get userID:", err);
    return undefined;
  }
}

function detectDevice(): Device {
  if (typeof navigator === "undefined") return undefined;
  const ua = navigator.userAgent.toLowerCase();
  if ((navigator as any).userAgentData?.mobile) return "mobile";
  if (/mobile|iphone|android/.test(ua)) return "mobile";
  if (/tablet|ipad/.test(ua)) return "tablet";
  if (/desktop|windows|macintosh|linux/.test(ua)) return "desktop";
  return undefined;
}

function detectOS(): OS {
  if (typeof navigator === "undefined") return "Unknown";
  const ua = navigator.userAgent || "";
  const platform = (navigator as any).platform || "";
  if (/android/i.test(ua)) return "Android";
  if (/iphone|ipad|ipod/i.test(ua)) return "iOS";
  if (/win/i.test(platform) || /windows nt/i.test(ua)) return "Windows";
  if (/mac/i.test(platform) || /macintosh/i.test(ua)) return "MacOS";
  if (/linux/i.test(platform) && !/android/i.test(ua)) return "Linux";
  return "Unknown";
}

export async function buildBaseMetadata(): Promise<BaseMetadata> {
  const device = detectDevice();
  const appVersion = (globalThis as any).APP_VERSION || (import.meta as any)?.env?.VITE_APP_VERSION || "unknown";
    const os = detectOS();
  // Try geolocation first (user consent). Keep it fast and tolerant.

  return {
    device,
    appVersion,
    os,
    schemaVersion: 1,
  };
}
