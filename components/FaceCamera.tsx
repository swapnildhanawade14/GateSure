'use client';

import { useEffect, useRef, useState } from 'react';
import { captureAndExtractFace, capturePhotoBase64 } from '@/lib/faceRecognition';

interface FaceCameraProps {
  onFaceCaptured: (descriptor: Float32Array, photoBase64: string) => void;
  onBack?: () => void;
  onError?: (error: string) => void;
}

export default function FaceCamera({ onFaceCaptured, onBack, onError }: FaceCameraProps) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [isCapturing, setIsCapturing] = useState(false);
  const [isStartingCamera, setIsStartingCamera] = useState(false);
  const [cameraReady, setCameraReady] = useState(false);
  const [status, setStatus] = useState('Tap to open camera.');

  const startCamera = async (): Promise<boolean> => {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      const message = 'This browser does not support camera access.';
      setStatus(message);
      onError?.(message);
      return false;
    }

    if (location.protocol !== 'http:' && location.protocol !== 'https:') {
      const message = 'Camera access requires a browser page served over localhost or HTTPS.';
      setStatus(message);
      onError?.(message);
      return false;
    }

    setIsStartingCamera(true);
    setStatus('Opening camera...');

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: { ideal: 'user' },
        },
        audio: false,
      });

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play().catch(() => undefined);
      }

      setCameraReady(true);
      setStatus('Camera ready. Position your face in frame.');
      return true;
    } catch (error) {
      const message =
        error instanceof DOMException && error.name === 'NotAllowedError'
          ? 'Camera permission was denied. Please allow access and refresh the page.'
          : 'Failed to access camera. Please use localhost or HTTPS and allow camera access.';
      setStatus(message);
      setCameraReady(false);
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
      onError?.(message);
      return false;
    } finally {
      setIsStartingCamera(false);
    }
  };

  useEffect(() => {
    return () => {
      streamRef.current?.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    };
  }, []);

  const handleStartCamera = async () => {
    await startCamera();
  };

  const handleCapture = async () => {
    if (!videoRef.current || !streamRef.current) {
      const started = await startCamera();
      if (!started || !videoRef.current || !streamRef.current) return;
    }

    setIsCapturing(true);
    setStatus('Detecting face...');

    try {
      const descriptor = await captureAndExtractFace(videoRef.current);
      if (!descriptor) {
        setStatus('No face detected. Try again.');
        return;
      }

      const photoBase64 = await capturePhotoBase64(videoRef.current);
      setStatus('Face captured successfully!');
      onFaceCaptured(descriptor, photoBase64);
    } catch (error) {
      const message = error instanceof Error ? error.message : 'Capture failed';
      setStatus(message);
      onError?.(message);
    } finally {
      setIsCapturing(false);
    }
  };

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
      <video
        ref={videoRef}
        autoPlay
        playsInline
        muted
        className="h-80 w-full rounded-lg bg-black object-cover"
      />

      <div className="text-center">
        <p className="mb-3 text-sm text-slate-600">{status}</p>
        <div className="flex gap-3">
          <button
            type="button"
            onClick={() => {
              if (onBack) {
                onBack();
                return;
              }
              handleStartCamera();
            }}
            className="flex-1 rounded-lg border border-slate-300 bg-white px-4 py-2 font-medium text-slate-700 transition hover:bg-slate-100"
          >
            Back to form
          </button>
          <button
            type="button"
            onClick={handleStartCamera}
            disabled={isStartingCamera || isCapturing}
            className="flex-1 rounded-lg border border-slate-300 bg-white px-4 py-2 font-medium text-slate-700 transition hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isStartingCamera ? 'Opening...' : 'Open Camera'}
          </button>
          <button
            type="button"
            onClick={handleCapture}
            disabled={isCapturing || isStartingCamera || !cameraReady}
            className="flex-1 rounded-lg bg-blue-600 px-4 py-2 font-medium text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:bg-slate-400"
          >
            {isCapturing ? 'Capturing...' : 'Capture Face'}
          </button>
        </div>
      </div>
    </div>
  );
}
