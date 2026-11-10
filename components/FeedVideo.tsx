import { useEffect } from 'react';
import { Platform, StyleSheet } from 'react-native';
import { useEvent } from 'expo';
import { useVideoPlayer, VideoView } from 'expo-video';
import { MAX_VIDEO_SECONDS, type FeedVideoProps } from './feedVideoTypes';

// iOS's player can't decode WebM, so prefer a QuickTime/MP4 source there.
function pickSource(sources: FeedVideoProps['sources']) {
  if (Platform.OS === 'ios') return (sources.find((s) => !s.mime.includes('webm')) ?? sources[0]).uri;
  return sources[0].uri;
}

export default function FeedVideo({ sources, active, muted, cover, onProgress }: FeedVideoProps) {
  const player = useVideoPlayer(pickSource(sources), (p) => {
    p.loop = true;
    p.muted = true;
    p.timeUpdateEventInterval = 0.25;
  });

  useEffect(() => {
    if (active) player.play();
    else player.pause();
  }, [active, player]);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/immutability -- expo-video players are configured by assignment
    player.muted = muted;
  }, [muted, player]);

  const time = useEvent(player, 'timeUpdate');
  useEffect(() => {
    if (!time) return;
    // eslint-disable-next-line react-hooks/immutability -- expo-video players are configured by assignment
    if (time.currentTime >= MAX_VIDEO_SECONDS) player.currentTime = 0;
    const total = Math.min(player.duration || MAX_VIDEO_SECONDS, MAX_VIDEO_SECONDS);
    onProgress?.(time.currentTime / total);
  }, [time, player, onProgress]);

  return <VideoView player={player} style={StyleSheet.absoluteFill} contentFit={cover ? 'cover' : 'contain'} nativeControls={false} />;
}
