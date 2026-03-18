export type ThemeProps = {
  fontFamily?: string;
  colors?: {
    background?: string;
    text?: string;
    nil?: string;
    nodeBlack?: string;
    nodeRed?: string;
    nodeText?: string;
    button?: {
      bg?: string;
      text?: string;
      disabled?: string;
    };
    input?: {
      bg?: string;
      border?: string;
      text?: string;
    };
  };
};

export type NodeColors = {
  nodeRed: string;
  nodeRedHighlight: string;
  nodeRedHighlightSpecular: string;
  nodeRedDark: string;
  nodeRedGlow: string;
  nodeRedRing: string;
  nodeBlack: string;
  nodeBlackHighlight: string;
  nodeBlackHighlightSpecular: string;
  nodeBlackDark: string;
  nodeBlackRing: string;
  nodeText: string;
  edge: string;
  edgeHighlight: string;
  dropShadow: string;
};
