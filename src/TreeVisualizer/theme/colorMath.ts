export class Color {
  private r: number;
  private g: number;
  private b: number;

  static readonly WHITE = new Color("#ffffff");
  static readonly BLACK = new Color("#000000");

  constructor(hex: string) {
    const n = parseInt(hex.replace("#", ""), 16);
    this.r = (n >> 16) & 0xff;
    this.g = (n >> 8) & 0xff;
    this.b = n & 0xff;
  }

  mix(other: Color, amount: number): Color {
    const clamp = (v: number) => Math.max(0, Math.min(255, Math.round(v)));
    const r = clamp(this.r + (other.r - this.r) * amount);
    const g = clamp(this.g + (other.g - this.g) * amount);
    const b = clamp(this.b + (other.b - this.b) * amount);
    return new Color(
      "#" + [r, g, b].map((v) => v.toString(16).padStart(2, "0")).join(""),
    );
  }

  get hex(): string {
    return (
      "#" +
      [this.r, this.g, this.b]
        .map((v) => v.toString(16).padStart(2, "0"))
        .join("")
    );
  }
}

export const lighten = (hex: string, amount: number) =>
  new Color(hex).mix(Color.WHITE, amount).hex;

export const darken = (hex: string, amount: number) =>
  new Color(hex).mix(Color.BLACK, amount).hex;
