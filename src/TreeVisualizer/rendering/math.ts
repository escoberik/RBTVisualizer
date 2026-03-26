export function lerp(a: number, b: number, t: number): number {
  return a + (b - a) * t;
}

export function lerpColor(a: string, b: string, t: number): string {
  if (t <= 0) return a;
  if (t >= 1) return b;
  const ca = parseInt(a.slice(1), 16);
  const cb = parseInt(b.slice(1), 16);
  const mix = (x: number, y: number) => Math.round(x + (y - x) * t);
  const r  = mix((ca >> 16) & 0xff, (cb >> 16) & 0xff);
  const g  = mix((ca >>  8) & 0xff, (cb >>  8) & 0xff);
  const bl = mix( ca        & 0xff,  cb        & 0xff);
  return (
    "#" +
    r .toString(16).padStart(2, "0") +
    g .toString(16).padStart(2, "0") +
    bl.toString(16).padStart(2, "0")
  );
}
