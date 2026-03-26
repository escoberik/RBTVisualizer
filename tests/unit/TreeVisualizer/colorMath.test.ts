import { describe, it, expect } from "vitest";
import { Color, lighten, darken } from "../../../src/TreeVisualizer/theme/colorMath";

describe("Color", () => {
  it("parses a mid-range hex color", () => {
    const c = new Color("#804020");
    expect(c.hex).toBe("#804020");
  });

  it("parses black", () => {
    expect(new Color("#000000").hex).toBe("#000000");
  });

  it("parses white", () => {
    expect(new Color("#ffffff").hex).toBe("#ffffff");
  });

  describe("mix", () => {
    it("amount=0 returns the original color unchanged", () => {
      const c = new Color("#804020");
      expect(c.mix(Color.WHITE, 0).hex).toBe("#804020");
    });

    it("amount=1 returns the target color", () => {
      const c = new Color("#804020");
      expect(c.mix(Color.WHITE, 1).hex).toBe("#ffffff");
    });

    it("amount=0.5 is midpoint between source and target", () => {
      // #000000 mixed 50% toward #ffffff → #7f7f7f (rounds down per Math.round)
      expect(new Color("#000000").mix(Color.WHITE, 0.5).hex).toBe("#808080");
    });

    it("clamps output channels to [0, 255]", () => {
      // Mixing black toward black should not go negative
      expect(new Color("#000000").mix(Color.BLACK, 0.5).hex).toBe("#000000");
      // Mixing white toward white should not exceed 255
      expect(new Color("#ffffff").mix(Color.WHITE, 0.5).hex).toBe("#ffffff");
    });
  });
});

describe("lighten", () => {
  it("amount=0 returns the original color", () => {
    expect(lighten("#1f2937", 0)).toBe("#1f2937");
  });

  it("amount=1 returns white", () => {
    expect(lighten("#1f2937", 1)).toBe("#ffffff");
  });

  it("lightening black by 0.5 produces a mid-gray", () => {
    expect(lighten("#000000", 0.5)).toBe("#808080");
  });

  it("lightening a color produces a value closer to white", () => {
    const original = parseInt("1f2937", 16);
    const lightened = parseInt(lighten("#1f2937", 0.3).slice(1), 16);
    // Each channel of lightened should be >= corresponding channel of original
    const or = (original >> 16) & 0xff;
    const og = (original >>  8) & 0xff;
    const ob =  original        & 0xff;
    const lr = (lightened >> 16) & 0xff;
    const lg = (lightened >>  8) & 0xff;
    const lb =  lightened        & 0xff;
    expect(lr).toBeGreaterThanOrEqual(or);
    expect(lg).toBeGreaterThanOrEqual(og);
    expect(lb).toBeGreaterThanOrEqual(ob);
  });
});

describe("darken", () => {
  it("amount=0 returns the original color", () => {
    expect(darken("#e81010", 0)).toBe("#e81010");
  });

  it("amount=1 returns black", () => {
    expect(darken("#e81010", 1)).toBe("#000000");
  });

  it("darkening white by 0.5 produces a mid-gray", () => {
    expect(darken("#ffffff", 0.5)).toBe("#808080");
  });

  it("darkening a color produces a value closer to black", () => {
    const original = parseInt("e81010", 16);
    const darkened = parseInt(darken("#e81010", 0.55).slice(1), 16);
    const or = (original >> 16) & 0xff;
    const og = (original >>  8) & 0xff;
    const ob =  original        & 0xff;
    const dr = (darkened >> 16) & 0xff;
    const dg = (darkened >>  8) & 0xff;
    const db =  darkened        & 0xff;
    expect(dr).toBeLessThanOrEqual(or);
    expect(dg).toBeLessThanOrEqual(og);
    expect(db).toBeLessThanOrEqual(ob);
  });
});
