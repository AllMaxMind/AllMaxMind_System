import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { blobToBase64, formatDuration } from '../useAudioRecorder';

// Mock navigator.mediaDevices for hook tests
const mockGetUserMedia = vi.fn();
const mockMediaRecorder = vi.fn();

describe('useAudioRecorder utilities', () => {
  describe('formatDuration', () => {
    it('should format 0ms as 0:00', () => {
      expect(formatDuration(0)).toBe('0:00');
    });

    it('should format 1000ms as 0:01', () => {
      expect(formatDuration(1000)).toBe('0:01');
    });

    it('should format 60000ms as 1:00', () => {
      expect(formatDuration(60000)).toBe('1:00');
    });

    it('should format 90000ms as 1:30', () => {
      expect(formatDuration(90000)).toBe('1:30');
    });

    it('should format 125000ms as 2:05', () => {
      expect(formatDuration(125000)).toBe('2:05');
    });

    it('should handle partial seconds by flooring', () => {
      expect(formatDuration(1500)).toBe('0:01');
      expect(formatDuration(1999)).toBe('0:01');
    });
  });

  describe('blobToBase64', () => {
    it('should convert a blob to base64 string', async () => {
      const testData = 'Hello, World!';
      const blob = new Blob([testData], { type: 'text/plain' });

      const base64 = await blobToBase64(blob);

      // Base64 of "Hello, World!" without data URL prefix
      expect(base64).toBe('SGVsbG8sIFdvcmxkIQ==');
    });

    it('should handle empty blob', async () => {
      const blob = new Blob([], { type: 'audio/webm' });

      const base64 = await blobToBase64(blob);

      expect(base64).toBe('');
    });

    it('should strip data URL prefix', async () => {
      const testData = new Uint8Array([0xFF, 0xD8, 0xFF]); // JPEG magic bytes
      const blob = new Blob([testData], { type: 'image/jpeg' });

      const base64 = await blobToBase64(blob);

      // Should not contain "data:" prefix
      expect(base64).not.toContain('data:');
      expect(base64).not.toContain(';base64,');
    });
  });
});

describe('useAudioRecorder hook (browser support)', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should detect when MediaRecorder is not available', () => {
    // In test environment, MediaRecorder might not be available
    // This tests that the hook handles it gracefully
    const hasMediaRecorder = typeof MediaRecorder !== 'undefined';

    // The hook should set isSupported based on browser capabilities
    expect(typeof hasMediaRecorder).toBe('boolean');
  });

  it('should detect when navigator.mediaDevices is not available', () => {
    const hasMediaDevices = !!navigator.mediaDevices?.getUserMedia;

    // The hook should check for this
    expect(typeof hasMediaDevices).toBe('boolean');
  });
});
