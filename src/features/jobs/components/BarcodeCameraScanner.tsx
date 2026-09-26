import { useEffect, useRef, useState } from 'react';
import { Button } from '@/components/ui/Button';
import { normalizeCode128Value } from '../utils/scannableBarcode';

type BarcodeDetectorLike = {
  detect: (source: ImageBitmapSource) => Promise<Array<{ rawValue?: string }>>;
};

type BarcodeDetectorCtor = new (opts?: { formats?: string[] }) => BarcodeDetectorLike;

function getBarcodeDetectorCtor(): BarcodeDetectorCtor | null {
  const w = window as Window & { BarcodeDetector?: BarcodeDetectorCtor };
  return typeof w.BarcodeDetector === 'function' ? w.BarcodeDetector : null;
}

/**
 * Live camera CODE128 reader for phones / tablets (BarcodeDetector API).
 * Falls back to a short note when the browser has no detector.
 */
export function BarcodeCameraScanner({
  onDetected,
  disabled,
}: {
  onDetected: (code: string) => void;
  disabled?: boolean;
}) {
  const videoRef = useRef<HTMLVideoElement>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const [open, setOpen] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [supported, setSupported] = useState(true);
  const lastCodeRef = useRef('');

  useEffect(() => {
    if (!open) return;

    const Detector = getBarcodeDetectorCtor();
    if (!Detector) {
      setSupported(false);
      setErr('This browser cannot read barcodes with the camera. Use a USB scanner or type the code.');
      return;
    }

    let cancelled = false;
    let raf = 0;
    const detector = new Detector({ formats: ['code_128'] });

    const stop = () => {
      cancelAnimationFrame(raf);
      streamRef.current?.getTracks().forEach((t) => t.stop());
      streamRef.current = null;
      if (videoRef.current) videoRef.current.srcObject = null;
    };

    const tick = async () => {
      if (cancelled) return;
      const video = videoRef.current;
      if (video && video.readyState >= 2) {
        try {
          const hits = await detector.detect(video);
          const raw = hits[0]?.rawValue;
          const code = normalizeCode128Value(raw ?? '');
          if (code && code !== lastCodeRef.current) {
            lastCodeRef.current = code;
            onDetected(code);
            setOpen(false);
            stop();
            return;
          }
        } catch {
          // keep scanning
        }
      }
      raf = requestAnimationFrame(() => {
        void tick();
      });
    };

    void (async () => {
      try {
        setErr(null);
        const stream = await navigator.mediaDevices.getUserMedia({
          audio: false,
          video: {
            facingMode: { ideal: 'environment' },
            width: { ideal: 1280 },
            height: { ideal: 720 },
          },
        });
        if (cancelled) {
          stream.getTracks().forEach((t) => t.stop());
          return;
        }
        streamRef.current = stream;
        const video = videoRef.current;
        if (video) {
          video.srcObject = stream;
          await video.play();
        }
        raf = requestAnimationFrame(() => {
          void tick();
        });
      } catch {
        setErr('Camera permission denied or unavailable on this device.');
        setOpen(false);
      }
    })();

    return () => {
      cancelled = true;
      stop();
    };
  }, [open, onDetected]);

  if (!supported && !open) {
    return (
      <p className="text-xs text-[var(--color-neutral-400)]">
        Camera barcode scan needs Chrome/Edge on Android (or a browser with BarcodeDetector).
        USB/handheld scanners work in the field above on any device.
      </p>
    );
  }

  return (
    <div className="space-y-2">
      {!open ? (
        <Button
          type="button"
          variant="secondary"
          disabled={disabled}
          onClick={() => {
            lastCodeRef.current = '';
            setSupported(true);
            setOpen(true);
          }}
        >
          Scan with camera
        </Button>
      ) : (
        <div className="space-y-2">
          <div className="overflow-hidden rounded-md border border-[var(--color-neutral-200)] bg-black">
            <video
              ref={videoRef}
              className="mx-auto max-h-64 w-full object-cover"
              playsInline
              muted
              autoPlay
            />
          </div>
          <div className="flex flex-wrap gap-2">
            <Button type="button" variant="secondary" onClick={() => setOpen(false)}>
              Stop camera
            </Button>
          </div>
          <p className="text-xs text-[var(--color-neutral-500)]">
            Point at the CODE128 sticker — job details open automatically when read.
          </p>
        </div>
      )}
      {err ? <p className="text-sm text-[var(--color-danger-600)]">{err}</p> : null}
    </div>
  );
}
