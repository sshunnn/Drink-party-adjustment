import { useEffect, useState } from 'react';

/**
 * Loads an image and removes its white background using Canvas + edge flood-fill.
 * This ensures interior white areas (inside a circle border) are also removed.
 */
export function useTransparentImage(src: string, threshold = 40): string | null {
  const [dataUrl, setDataUrl] = useState<string | null>(null);

  useEffect(() => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => {
      const canvas = document.createElement('canvas');
      const w = img.naturalWidth;
      const h = img.naturalHeight;
      canvas.width = w;
      canvas.height = h;
      const ctx = canvas.getContext('2d')!;
      ctx.drawImage(img, 0, 0);

      const imageData = ctx.getImageData(0, 0, w, h);
      const data = imageData.data;
      const visited = new Uint8Array(w * h);

      const isWhitish = (i: number) =>
        data[i] > 255 - threshold &&
        data[i + 1] > 255 - threshold &&
        data[i + 2] > 255 - threshold;

      // BFS flood-fill from all 4 edges to find and remove white background
      const queue: number[] = [];
      const enqueue = (x: number, y: number) => {
        if (x < 0 || x >= w || y < 0 || y >= h) return;
        const idx = y * w + x;
        if (visited[idx]) return;
        const pi = idx * 4;
        if (!isWhitish(pi)) return;
        visited[idx] = 1;
        queue.push(x, y);
      };

      // Seed from all edges
      for (let x = 0; x < w; x++) { enqueue(x, 0); enqueue(x, h - 1); }
      for (let y = 0; y < h; y++) { enqueue(0, y); enqueue(w - 1, y); }

      while (queue.length > 0) {
        const y = queue.pop()!;
        const x = queue.pop()!;
        const pi = (y * w + x) * 4;
        data[pi + 3] = 0; // make transparent
        enqueue(x + 1, y); enqueue(x - 1, y);
        enqueue(x, y + 1); enqueue(x, y - 1);
      }

      ctx.putImageData(imageData, 0, 0);
      setDataUrl(canvas.toDataURL('image/png'));
    };
    img.src = src;
  }, [src, threshold]);

  return dataUrl;
}
