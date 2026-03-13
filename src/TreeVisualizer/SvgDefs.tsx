import { colors } from "./colors";

export default function SvgDefs() {
  return (
    <defs>
      <radialGradient id="nodeRedGradient" cx="35%" cy="30%" r="65%">
        <stop offset="0%"   stopColor={colors.nodeRedHighlight} />
        <stop offset="55%"  stopColor={colors.nodeRed} />
        <stop offset="100%" stopColor={colors.nodeRedDark} />
      </radialGradient>
      <radialGradient id="nodeBlackGradient" cx="35%" cy="30%" r="65%">
        <stop offset="0%"   stopColor={colors.nodeBlackHighlight} />
        <stop offset="55%"  stopColor={colors.nodeBlack} />
        <stop offset="100%" stopColor={colors.nodeBlackDark} />
      </radialGradient>
      <filter id="nodeRedGlow" x="-50%" y="-50%" width="200%" height="200%">
        <feDropShadow dx="0" dy="0" stdDeviation="0.1" floodColor={colors.nodeRedGlow} floodOpacity="0.75" />
      </filter>
      <filter id="nodeShadow" x="-50%" y="-50%" width="200%" height="200%">
        <feDropShadow dx="0" dy="0.05" stdDeviation="0.0625" floodColor={colors.dropShadow} />
      </filter>
      <filter id="edgeShadow" filterUnits="userSpaceOnUse" x="-50" y="-1" width="100" height="4">
        <feDropShadow dx="0" dy="0.025" stdDeviation="0.025" floodColor={colors.dropShadow} />
      </filter>
      <linearGradient id="arrowGradient" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stopColor={colors.edge} />
        <stop offset="100%" stopColor={colors.edgeHighlight} />
      </linearGradient>
      <marker id="arrowhead" markerWidth="0.25" markerHeight="0.45" refX="0.25" refY="0.225" orient="auto" markerUnits="userSpaceOnUse">
        <polygon points="0 0, 0.25 0.225, 0 0.45, 0.075 0.225" fill="url(#arrowGradient)" stroke={colors.edgeHighlight} strokeWidth="0.02" strokeOpacity="0.6" strokeLinejoin="round" />
      </marker>
    </defs>
  );
}
