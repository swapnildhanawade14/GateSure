import * as faceapi from 'face-api.js';

const MODEL_URL = 'https://cdn.jsdelivr.net/gh/justadudewhohacks/face-api.js@master/weights';
const LOCAL_MODEL_URL = '/models';
let modelsLoaded = false;

export async function loadModels() {
  if (modelsLoaded) return;

  const modelLoaders = [
    {
      label: 'local',
      loader: async () => {
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(LOCAL_MODEL_URL),
          faceapi.nets.faceLandmark68Net.loadFromUri(LOCAL_MODEL_URL),
          faceapi.nets.faceRecognitionNet.loadFromUri(LOCAL_MODEL_URL),
          faceapi.nets.faceExpressionNet.loadFromUri(LOCAL_MODEL_URL),
          faceapi.nets.ageGenderNet.loadFromUri(LOCAL_MODEL_URL),
        ]);
      },
    },
    {
      label: 'cdn',
      loader: async () => {
        await Promise.all([
          faceapi.nets.tinyFaceDetector.loadFromUri(MODEL_URL),
          faceapi.nets.faceLandmark68Net.loadFromUri(MODEL_URL),
          faceapi.nets.faceRecognitionNet.loadFromUri(MODEL_URL),
          faceapi.nets.faceExpressionNet.loadFromUri(MODEL_URL),
          faceapi.nets.ageGenderNet.loadFromUri(MODEL_URL),
        ]);
      },
    },
  ];

  let lastError: unknown;

  for (const source of modelLoaders) {
    try {
      await source.loader();
      modelsLoaded = true;
      return;
    } catch (error) {
      lastError = error;
      console.warn(`Face model load failed from ${source.label}; trying next source.`, error);
    }
  }

  console.error('Face model load failed from both local and CDN paths:', lastError);
  throw new Error('Face recognition models failed to load');
}

async function ensureVideoReady(videoElement: HTMLVideoElement) {
  if (videoElement.readyState >= 2 && videoElement.videoWidth > 0 && videoElement.videoHeight > 0) {
    return;
  }

  await new Promise<void>((resolve, reject) => {
    const timeout = window.setTimeout(() => {
      cleanup();
      reject(new Error('Camera stream did not become ready in time.'));
    }, 8000);

    const cleanup = () => {
      window.clearTimeout(timeout);
      videoElement.removeEventListener('loadeddata', onReady);
      videoElement.removeEventListener('loadedmetadata', onReady);
      videoElement.removeEventListener('error', onError);
    };

    const onReady = () => {
      if (videoElement.readyState >= 2 && videoElement.videoWidth > 0 && videoElement.videoHeight > 0) {
        cleanup();
        resolve();
      }
    };

    const onError = () => {
      cleanup();
      reject(new Error('Camera stream failed to load.'));
    };

    videoElement.addEventListener('loadeddata', onReady, { once: true });
    videoElement.addEventListener('loadedmetadata', onReady, { once: true });
    videoElement.addEventListener('error', onError, { once: true });
  });
}

export async function captureAndExtractFace(
  videoElement: HTMLVideoElement
): Promise<Float32Array | null> {
  try {
    await loadModels();
    await ensureVideoReady(videoElement);

    const detections = await faceapi
      .detectSingleFace(videoElement, new faceapi.TinyFaceDetectorOptions())
      .withFaceLandmarks()
      .withFaceDescriptor();

    if (!detections) {
      return null;
    }

    return detections.descriptor;
  } catch (error) {
    console.error('Face detection error:', error);
    return null;
  }
}

export function compareFaceDescriptors(
  descriptor1: Float32Array,
  descriptor2: Float32Array,
  threshold = 0.6
): number {
  if (!descriptor1 || !descriptor2) return Number.MAX_SAFE_INTEGER;

  const distance = faceapi.euclideanDistance(
    Array.from(descriptor1),
    Array.from(descriptor2)
  );

  return Number.isNaN(distance) ? threshold + 1 : distance;
}

export function isFaceMatch(distance: number, threshold = 0.6): boolean {
  return distance < threshold;
}

export async function capturePhotoBase64(
  videoElement: HTMLVideoElement
): Promise<string> {
  await ensureVideoReady(videoElement);

  const canvas = document.createElement('canvas');
  canvas.width = videoElement.videoWidth || 640;
  canvas.height = videoElement.videoHeight || 480;

  const ctx = canvas.getContext('2d');
  if (!ctx) {
    throw new Error('Failed to get canvas context');
  }

  ctx.drawImage(videoElement, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL('image/jpeg', 0.8);
}
