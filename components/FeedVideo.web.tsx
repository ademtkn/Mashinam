import { useEffect, useRef } from 'react';
import { MAX_VIDEO_SECONDS, type FeedVideoProps } from './feedVideoTypes';

// Plain <video> on web so the browser can fall back between sources
// (Safari may not play WebM; it gets the QuickTime/MP4 source instead).
export default function FeedVideo({ sources, poster, active, muted, cover, onProgress }: FeedVideoProps) {
  const ref = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    const v = ref.current;
    if (!v) return;
    if (active) v.play().catch(() => {});
    else v.pause();
  }, [active]);

  useEffect(() => {
    if (ref.current) ref.current.muted = muted;
  }, [muted]);

  return (
    <video
      ref={ref}
      poster={poster}
      muted
      loop
      playsInline
      preload="metadata"
      onTimeUpdate={(e) => {
        const v = e.currentTarget;
        if (v.currentTime >= MAX_VIDEO_SECONDS) v.currentTime = 0;
        const total = Math.min(v.duration || MAX_VIDEO_SECONDS, MAX_VIDEO_SECONDS);
        onProgress?.(v.currentTime / total);
      }}
      style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: cover ? 'cover' : 'contain' }}
    >
      {sources.map((s) => (
        <source key={s.uri} src={s.uri} type={s.mime} />
      ))}
    </video>
  );
}
