import { StyleSheet, Text, View } from 'react-native';
import Svg, { Path } from 'react-native-svg';
import { Colors } from '../constants/colors';

export const SEEN_DIVIDER_HEIGHT = 30;

const WAVE = 10; // px per half-wave
const AMP = 3; // wave amplitude
const SEG_W = 480; // longer than any phone screen; the overflow is clipped

// A wavy line, like a hand-drawn squiggle.
function squigglePath() {
  const mid = AMP + 1;
  let d = `M0 ${mid}`;
  for (let x = 0; x < SEG_W; x += WAVE * 2) {
    d += ` q${WAVE / 2} ${-AMP * 2} ${WAVE} 0 t${WAVE} 0`;
  }
  return d;
}
const PATH = squigglePath();
const SVG_H = AMP * 2 + 2;

function Squiggle({ alignEnd }: { alignEnd?: boolean }) {
  return (
    <View style={[styles.side, alignEnd && styles.sideEnd]}>
      <Svg width={SEG_W} height={SVG_H}>
        <Path d={PATH} stroke={Colors.amber} strokeWidth={1.6} fill="none" strokeLinecap="round" />
      </Svg>
    </View>
  );
}

// Marks the point in the feed below which every listing has been seen before.
export default function SeenDivider({ label = 'Aşağıdakilerin hepsini gördün' }: { label?: string }) {
  return (
    <View style={styles.row} pointerEvents="none" accessibilityRole="text" accessibilityLabel={label}>
      <Squiggle alignEnd />
      <Text style={styles.label} numberOfLines={1}>
        {label}
      </Text>
      <Squiggle />
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    height: SEEN_DIVIDER_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 14,
    gap: 10,
  },
  side: { flex: 1, height: SVG_H, overflow: 'hidden', flexDirection: 'row' },
  sideEnd: { justifyContent: 'flex-end' },
  label: {
    color: Colors.white,
    fontSize: 12,
    fontWeight: '700',
    letterSpacing: 0.2,
    textShadowColor: 'rgba(0,0,0,0.6)',
    textShadowRadius: 6,
    flexShrink: 0,
  },
});
