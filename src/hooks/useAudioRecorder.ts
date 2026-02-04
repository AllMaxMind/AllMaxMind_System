import { useState, useRef, useCallback, useEffect } from 'react';

export interface UseAudioRecorderReturn {
  isRecording: boolean;
  isSupported: boolean;
  permissionStatus: 'prompt' | 'granted' | 'denied' | 'unknown';
  recordingDuration: number;
  startRecording: () => Promise<void>;
  stopRecording: () => Promise<Blob | null>;
  cancelRecording: () => void;
  error: string | null;
}

const MAX_RECORDING_DURATION = 120000; // 2 minutes max

export function useAudioRecorder(): UseAudioRecorderReturn {
  const [isRecording, setIsRecording] = useState(false);
  const [isSupported, setIsSupported] = useState(true);
  const [permissionStatus, setPermissionStatus] = useState<'prompt' | 'granted' | 'denied' | 'unknown'>('unknown');
  const [recordingDuration, setRecordingDuration] = useState(0);
  const [error, setError] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const streamRef = useRef<MediaStream | null>(null);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const startTimeRef = useRef<number>(0);

  // Check browser support on mount
  useEffect(() => {
    const checkSupport = () => {
      const hasMediaDevices = !!navigator.mediaDevices?.getUserMedia;
      const hasMediaRecorder = typeof MediaRecorder !== 'undefined';
      setIsSupported(hasMediaDevices && hasMediaRecorder);

      if (!hasMediaDevices || !hasMediaRecorder) {
        console.warn('[AudioRecorder] Browser does not support audio recording');
      }
    };

    checkSupport();
  }, []);

  // Check permission status
  useEffect(() => {
    const checkPermission = async () => {
      try {
        if (navigator.permissions) {
          const result = await navigator.permissions.query({ name: 'microphone' as PermissionName });
          setPermissionStatus(result.state as 'prompt' | 'granted' | 'denied');

          result.addEventListener('change', () => {
            setPermissionStatus(result.state as 'prompt' | 'granted' | 'denied');
          });
        }
      } catch (e) {
        // Permissions API not supported, will check on first use
        setPermissionStatus('unknown');
      }
    };

    checkPermission();
  }, []);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
    };
  }, []);

  const startRecording = useCallback(async () => {
    if (!isSupported) {
      setError('Audio recording is not supported in this browser');
      return;
    }

    setError(null);
    audioChunksRef.current = [];

    try {
      // Request microphone access
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          sampleRate: 16000, // Good for speech
        }
      });

      streamRef.current = stream;
      setPermissionStatus('granted');

      // Determine best MIME type
      let mimeType = 'audio/webm;codecs=opus';
      if (!MediaRecorder.isTypeSupported(mimeType)) {
        mimeType = 'audio/webm';
        if (!MediaRecorder.isTypeSupported(mimeType)) {
          mimeType = 'audio/ogg;codecs=opus';
          if (!MediaRecorder.isTypeSupported(mimeType)) {
            mimeType = ''; // Let browser choose
          }
        }
      }

      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: mimeType || undefined,
      });

      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onerror = (event) => {
        console.error('[AudioRecorder] MediaRecorder error:', event);
        setError('Recording error occurred');
        stopRecordingInternal();
      };

      // Start recording
      mediaRecorder.start(1000); // Collect data every second
      setIsRecording(true);
      startTimeRef.current = Date.now();

      // Start duration timer
      timerRef.current = setInterval(() => {
        const elapsed = Date.now() - startTimeRef.current;
        setRecordingDuration(elapsed);

        // Auto-stop at max duration
        if (elapsed >= MAX_RECORDING_DURATION) {
          console.log('[AudioRecorder] Max duration reached, stopping');
          stopRecordingInternal();
        }
      }, 100);

      console.log('[AudioRecorder] Recording started');

    } catch (err: any) {
      console.error('[AudioRecorder] Failed to start recording:', err);

      if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
        setPermissionStatus('denied');
        setError('Microphone permission denied. Please allow access in your browser settings.');
      } else if (err.name === 'NotFoundError') {
        setError('No microphone found. Please connect a microphone.');
      } else {
        setError(`Failed to start recording: ${err.message}`);
      }
    }
  }, [isSupported]);

  const stopRecordingInternal = useCallback(() => {
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }

    setIsRecording(false);
    setRecordingDuration(0);
  }, []);

  const stopRecording = useCallback(async (): Promise<Blob | null> => {
    return new Promise((resolve) => {
      if (!mediaRecorderRef.current || mediaRecorderRef.current.state === 'inactive') {
        stopRecordingInternal();
        resolve(null);
        return;
      }

      mediaRecorderRef.current.onstop = () => {
        const mimeType = mediaRecorderRef.current?.mimeType || 'audio/webm';
        const audioBlob = new Blob(audioChunksRef.current, { type: mimeType });

        console.log('[AudioRecorder] Recording stopped, blob size:', audioBlob.size);

        stopRecordingInternal();
        resolve(audioBlob);
      };

      mediaRecorderRef.current.stop();
    });
  }, [stopRecordingInternal]);

  const cancelRecording = useCallback(() => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
    }

    audioChunksRef.current = [];
    stopRecordingInternal();

    console.log('[AudioRecorder] Recording cancelled');
  }, [stopRecordingInternal]);

  return {
    isRecording,
    isSupported,
    permissionStatus,
    recordingDuration,
    startRecording,
    stopRecording,
    cancelRecording,
    error,
  };
}

/**
 * Convert a Blob to base64 string
 */
export async function blobToBase64(blob: Blob): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => {
      const base64 = reader.result as string;
      // Remove data URL prefix (e.g., "data:audio/webm;base64,")
      const base64Data = base64.split(',')[1];
      resolve(base64Data);
    };
    reader.onerror = reject;
    reader.readAsDataURL(blob);
  });
}

/**
 * Format milliseconds to MM:SS display
 */
export function formatDuration(ms: number): string {
  const totalSeconds = Math.floor(ms / 1000);
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  return `${minutes}:${seconds.toString().padStart(2, '0')}`;
}
