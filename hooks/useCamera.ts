"use client";

import { useEffect, useRef, useState, useCallback } from "react";

export interface CameraState {
  /** Latest downscaled RGBA pixel buffer from the camera (null until ready). */
  pixels: Uint8ClampedArray | null;
  /** Native width of the downscaled buffer. */
  width: number;
  /** Native height of the downscaled buffer. */
  height: number;
}

export interface CameraMotion {
  /** Horizontal "center of brightness" offset, -1..1. */
  x: number;
  /** Vertical "center of brightness" offset, -1..1. */
  y: number;
  /** Average frame luminance, 0..1. */
  brightness: number;
  /** Frame-to-frame motion magnitude, 0..1. */
  motion: number;
}

const CAM_W = 96;
const CAM_H = 72;

/**
 * Hook that opens the user's camera and continuously samples a tiny
 * downscaled buffer. Exposes a ref (read inside rAF loops, no re-renders)
 * plus reactive `ready` / `error` state for UI.
 *
 * Falls back gracefully: if the camera is denied, `ready` stays false and
 * consumers animate procedurally instead.
 */
export function useCamera() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const scratchRef = useRef<HTMLCanvasElement | null>(null);
  const scratchCtxRef = useRef<CanvasRenderingContext2D | null>(null);
  const stateRef = useRef<CameraState>({ pixels: null, width: CAM_W, height: CAM_H });
  const motionRef = useRef<CameraMotion>({ x: 0, y: 0, brightness: 0.5, motion: 0 });
  const prevLumRef = useRef<Float32Array | null>(null);

  const [ready, setReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // create offscreen elements once
  useEffect(() => {
    const video = document.createElement("video");
    video.autoplay = true;
    video.muted = true;
    video.playsInline = true;
    videoRef.current = video;

    const scratch = document.createElement("canvas");
    scratch.width = CAM_W;
    scratch.height = CAM_H;
    scratchRef.current = scratch;
    scratchCtxRef.current = scratch.getContext("2d", { willReadFrequently: true });

    let stream: MediaStream | null = null;
    let cancelled = false;

    (async () => {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user", width: CAM_W, height: CAM_H },
          audio: false,
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        video.srcObject = stream;
        await video.play();
        setReady(true);
      } catch (e) {
        setError(e instanceof Error ? e.message : "camera unavailable");
        setReady(false);
      }
    })();

    return () => {
      cancelled = true;
      stream?.getTracks().forEach((t) => t.stop());
    };
  }, []);

  /** Sample one frame. Call this inside your animation loop. */
  const sample = useCallback(() => {
    const video = videoRef.current;
    const scratch = scratchRef.current;
    const ctx = scratchCtxRef.current;
    if (!video || !scratch || !ctx || video.readyState < 2) return;

    ctx.drawImage(video, 0, 0, CAM_W, CAM_H);
    const frame = ctx.getImageData(0, 0, CAM_W, CAM_H);
    const data = frame.data;

    let lumSum = 0;
    let cx = 0;
    let cy = 0;
    let weight = 0;
    let motionSum = 0;

    const lumBuf = new Float32Array(CAM_W * CAM_H);
    const prev = prevLumRef.current;

    for (let i = 0, p = 0; i < data.length; i += 4, p++) {
      const l = (data[i] * 0.299 + data[i + 1] * 0.587 + data[i + 2] * 0.114) / 255;
      lumBuf[p] = l;
      lumSum += l;

      const px = p % CAM_W;
      const py = (p / CAM_W) | 0;
      cx += px * l;
      cy += py * l;
      weight += l;

      if (prev) motionSum += Math.abs(l - prev[p]);
    }

    const count = CAM_W * CAM_H;
    const brightness = lumSum / count;
    const motion = prev ? Math.min(1, (motionSum / count) * 6) : 0;

    let x = 0;
    let y = 0;
    if (weight > 0) {
      x = ((cx / weight) / CAM_W - 0.5) * 2;
      y = ((cy / weight) / CAM_H - 0.5) * 2;
    }

    motionRef.current = { x, y, brightness, motion };
    stateRef.current = { pixels: data, width: CAM_W, height: CAM_H };
    prevLumRef.current = lumBuf;
  }, []);

  return { ready, error, sample, stateRef, motionRef, CAM_W, CAM_H };
}
