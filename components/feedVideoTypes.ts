import type { VideoSource } from '../types/car';

// Reels-style cap: clips longer than this loop back to the start.
export const MAX_VIDEO_SECONDS = 40;

export interface FeedVideoProps {
  sources: VideoSource[];
  poster?: string;
  active: boolean; // play only while this card and this page are on screen
  muted: boolean;
  cover?: boolean; // fill the screen (portrait clips) instead of letterboxing
  onProgress?: (fraction: number) => void;
}
