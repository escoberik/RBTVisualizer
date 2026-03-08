import { colors } from "./colors";

export default function SvgDefs() {
  return (
    <defs>
      <radialGradient id="nilGradient" cx="35%" cy="30%" r="65%">
        <stop offset="0%" stopColor={colors.nilHighlight} />
        <stop offset="50%" stopColor={colors.nil} />
        <stop offset="100%" stopColor={colors.nilDark} />
      </radialGradient>
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
      <filter id="nilShadow" x="-60%" y="-60%" width="220%" height="220%">
        <feDropShadow dx="0" dy="1.5" stdDeviation="1.5" floodColor={colors.dropShadow} />
      </filter>
      <filter id="nodeRedGlow" x="-50%" y="-50%" width="200%" height="200%">
        <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor={colors.nodeRedGlow} floodOpacity="0.75" />
      </filter>
      <filter id="nodeShadow" x="-50%" y="-50%" width="200%" height="200%">
        <feDropShadow dx="0" dy="2" stdDeviation="2.5" floodColor={colors.dropShadow} />
      </filter>
      <filter id="edgeShadow" x="-20%" y="-20%" width="140%" height="140%">
        <feDropShadow dx="0" dy="1" stdDeviation="1" floodColor={colors.dropShadow} />
      </filter>
      <linearGradient id="arrowGradient" x1="0" y1="0" x2="1" y2="0">
        <stop offset="0%" stopColor={colors.edge} />
        <stop offset="100%" stopColor={colors.edgeHighlight} />
      </linearGradient>
      <marker id="arrowhead" markerWidth="10" markerHeight="18" refX="10" refY="9" orient="auto" markerUnits="userSpaceOnUse">
        <polygon points="0 0, 10 9, 0 18, 3 9" fill="url(#arrowGradient)" stroke={colors.edgeHighlight} strokeWidth="0.75" strokeOpacity="0.6" strokeLinejoin="round" />
      </marker>
    </defs>
  );
}
