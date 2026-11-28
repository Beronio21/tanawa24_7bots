import { CanvasTexture, NearestFilter, SRGBColorSpace } from "three";

/**
 * Integer pixel-art chibi sprite engine.
 *
 * Ported from docs/references/hd_2d_pixel_art_sprite_3d_world_studio.html:
 * a PixelGrid painter with automatic 1px ink outlines, four built-in chibi
 * presets (Traveler Boy/Girl tunic sprites and tall Sage Robe sprites) baked
 * into crisp NearestFilter CanvasTextures for every idle/talk/walk/cheer
 * animation frame.
 */

export const PIXEL_PRESETS = [
  { id: "traveler_boy", label: "Traveler Boy (Chibi Tunic)", isSage: false, isFemale: false },
  { id: "traveler_girl", label: "Traveler Girl (Long Hair Tunic)", isSage: false, isFemale: true },
  { id: "sage_male", label: "Sage Male (White Robe & Sash)", isSage: true, isFemale: false },
  { id: "sage_female", label: "Sage Female (White Robe & Sash)", isSage: true, isFemale: true },
];

export const PIXEL_ANIMS = ["idle", "talk", "walk", "cheer"];
export const PIXEL_FRAMES_PER_ANIM = 4;

const PAL = {
  OUTLINE: "#221614",
  SKIN: "#efb08c",
  SKIN_SH: "#c77c58",
  SKIN_HI: "#fad3ba",
  EYE: "#1b1412",
  WHITE: "#ffffff",
  BLUSH: "#e07a7a",
  MOUTH_OPEN: "#9e2a3b",

  HAIR_B: "#3d2822",
  HAIR_B_HI: "#69473c",
  HAIR_B_SH: "#241613",

  HAIR_G: "#5e3828",
  HAIR_G_HI: "#8f5b43",
  HAIR_G_SH: "#3b2117",

  TUNIC: "#e3cfa8",
  TUNIC_SH: "#b59c72",
  TUNIC_HI: "#f5e8ce",
  STRAP: "#592c25",
  STRAP_HI: "#82443a",
  GOLD: "#d9a441",
  SANDAL: "#6b3626",

  ROBE: "#e6e8ec",
  ROBE_SH: "#aeb5c2",
  ROBE_HI: "#ffffff",
  SASH: "#8c1428",
  SASH_SH: "#570916",
  SASH_HI: "#b8253e",
};

class PixelGrid {
  constructor(w, h) {
    this.w = w;
    this.h = h;
    this.cells = new Array(w * h).fill(null);
  }

  px(x, y, col) {
    x = Math.round(x);
    y = Math.round(y);
    if (x >= 1 && x < this.w - 1 && y >= 1 && y < this.h - 1) {
      this.cells[y * this.w + x] = col;
    }
  }

  rect(x, y, w, h, col) {
    for (let dy = 0; dy < h; dy++) {
      for (let dx = 0; dx < w; dx++) {
        this.px(x + dx, y + dy, col);
      }
    }
  }

  applyOutline(outlineColor = PAL.OUTLINE) {
    const copy = this.cells.slice();
    const dirs = [
      [-1, 0],
      [1, 0],
      [0, -1],
      [0, 1],
    ];
    for (let y = 1; y < this.h - 1; y++) {
      for (let x = 1; x < this.w - 1; x++) {
        if (copy[y * this.w + x] !== null) continue;
        for (const [dx, dy] of dirs) {
          if (copy[(y + dy) * this.w + (x + dx)] !== null) {
            this.cells[y * this.w + x] = outlineColor;
            break;
          }
        }
      }
    }
  }

  toCanvas() {
    const canvas = document.createElement("canvas");
    canvas.width = this.w;
    canvas.height = this.h;
    const ctx = canvas.getContext("2d");
    for (let y = 0; y < this.h; y++) {
      for (let x = 0; x < this.w; x++) {
        const col = this.cells[y * this.w + x];
        if (col) {
          ctx.fillStyle = col;
          ctx.fillRect(x, y, 1, 1);
        }
      }
    }
    return canvas;
  }
}

function renderTravelerFrame(isFemale, anim, frameIdx) {
  const g = new PixelGrid(48, 64);

  const bobY =
    anim === "walk" || anim === "cheer"
      ? frameIdx % 2 === 1
        ? -1
        : 0
      : frameIdx % 2 === 1
        ? 1
        : 0;

  const hairBase = isFemale ? PAL.HAIR_G : PAL.HAIR_B;
  const hairHi = isFemale ? PAL.HAIR_G_HI : PAL.HAIR_B_HI;
  const hairSh = isFemale ? PAL.HAIR_G_SH : PAL.HAIR_B_SH;

  if (isFemale) {
    g.rect(12, 13 + bobY, 24, 24, hairSh);
    g.rect(11, 17 + bobY, 5, 22, hairBase);
    g.rect(32, 17 + bobY, 5, 22, hairBase);
    g.px(12, 22 + bobY, hairHi);
    g.px(12, 23 + bobY, hairHi);
    g.px(35, 22 + bobY, hairHi);
    g.px(35, 23 + bobY, hairHi);
    g.rect(11, 39 + bobY, 3, 2, hairBase);
    g.rect(34, 39 + bobY, 3, 2, hairBase);
  } else {
    g.rect(14, 12 + bobY, 20, 14, hairSh);
  }

  const leftStep = anim === "walk" && frameIdx === 0 ? -2 : 0;
  const rightStep = anim === "walk" && frameIdx === 2 ? -2 : 0;

  g.rect(18, 46, 4, 11 + leftStep, PAL.SKIN_SH);
  g.rect(19, 46, 3, 11 + leftStep, PAL.SKIN);
  g.rect(17, 57 + leftStep, 6, 4, PAL.SANDAL);
  g.rect(18, 57 + leftStep, 4, 1, PAL.SKIN_HI);
  g.rect(17, 59 + leftStep, 6, 1, PAL.OUTLINE);

  g.rect(26, 46, 4, 11 + rightStep, PAL.SKIN_SH);
  g.rect(26, 46, 3, 11 + rightStep, PAL.SKIN);
  g.rect(25, 57 + rightStep, 6, 4, PAL.SANDAL);
  g.rect(26, 57 + rightStep, 4, 1, PAL.SKIN_HI);
  g.rect(25, 59 + rightStep, 6, 1, PAL.OUTLINE);

  const ty = 28 + bobY;
  g.rect(21, ty - 1, 6, 3, PAL.SKIN_SH);
  g.rect(22, ty - 1, 4, 2, PAL.SKIN);

  g.rect(16, ty + 1, 16, 18, PAL.TUNIC);
  g.rect(16, ty + 1, 2, 18, PAL.TUNIC_SH);
  g.rect(30, ty + 1, 2, 18, PAL.TUNIC_SH);
  g.rect(18, ty + 2, 11, 2, PAL.TUNIC_HI);

  g.rect(21, ty + 1, 6, 2, PAL.SKIN);
  g.px(23, ty + 3, PAL.TUNIC_SH);
  g.px(24, ty + 3, PAL.TUNIC_SH);

  for (let i = 0; i < 11; i++) {
    g.rect(28 - i, ty + 1 + i, 3, 2, PAL.STRAP);
    g.px(29 - i, ty + 1 + i, PAL.STRAP_HI);
  }

  g.rect(16, ty + 11, 16, 2, PAL.STRAP);
  g.rect(23, ty + 11, 2, 2, PAL.GOLD);

  g.rect(14, ty + 9, 4, 6, PAL.STRAP);
  g.rect(15, ty + 10, 2, 3, PAL.STRAP_HI);

  g.rect(16, ty + 17, 16, 2, PAL.TUNIC_SH);
  g.rect(20, ty + 14, 1, 5, PAL.TUNIC_SH);
  g.rect(27, ty + 14, 1, 5, PAL.TUNIC_SH);

  if (anim === "cheer") {
    const reach = frameIdx % 2 === 1 ? -1 : 0;
    g.rect(12, 13 + reach, 3, 16 - reach, PAL.SKIN);
    g.rect(12, 22 + reach, 3, 8 - reach, PAL.TUNIC);
    g.rect(12, 11 + reach, 3, 3, PAL.SKIN_HI);
    g.rect(33, 13 + reach, 3, 16 - reach, PAL.SKIN);
    g.rect(33, 22 + reach, 3, 8 - reach, PAL.TUNIC);
    g.rect(33, 11 + reach, 3, 3, PAL.SKIN_HI);
  } else {
    const armSwingL = anim === "walk" ? (frameIdx === 0 ? -2 : frameIdx === 2 ? 2 : 0) : 0;
    const armSwingR = anim === "walk" ? (frameIdx === 2 ? -2 : frameIdx === 0 ? 2 : 0) : 0;

    g.rect(12, ty + 2 + armSwingL, 4, 6, PAL.TUNIC);
    g.rect(12, ty + 7 + armSwingL, 4, 1, PAL.TUNIC_SH);
    g.rect(12, ty + 8 + armSwingL, 4, 6, PAL.SKIN);
    g.rect(12, ty + 12 + armSwingL, 3, 2, PAL.SKIN_SH);

    if (anim === "talk" && frameIdx % 2 === 1) {
      g.rect(32, ty + 2, 4, 6, PAL.TUNIC);
      g.rect(33, ty + 7, 5, 4, PAL.SKIN);
      g.rect(36, ty + 6, 3, 3, PAL.SKIN_HI);
    } else {
      g.rect(32, ty + 2 + armSwingR, 4, 6, PAL.TUNIC);
      g.rect(32, ty + 7 + armSwingR, 4, 1, PAL.TUNIC_SH);
      g.rect(32, ty + 8 + armSwingR, 4, 6, PAL.SKIN);
      g.rect(33, ty + 12 + armSwingR, 3, 2, PAL.SKIN_SH);
    }
  }

  const hy = 8 + bobY;
  g.rect(16, hy + 4, 16, 15, PAL.SKIN);
  g.rect(17, hy + 18, 14, 2, PAL.SKIN_SH);
  g.rect(16, hy + 5, 2, 13, PAL.SKIN_SH);
  g.rect(18, hy + 5, 12, 3, PAL.SKIN_HI);

  const isBlink = anim === "idle" && frameIdx === 3;
  if (isBlink || anim === "cheer") {
    g.rect(19, hy + 11, 3, 1, PAL.EYE);
    g.rect(26, hy + 11, 3, 1, PAL.EYE);
  } else {
    g.rect(19, hy + 10, 2, 3, PAL.EYE);
    g.px(19, hy + 10, PAL.WHITE);
    g.rect(26, hy + 10, 2, 3, PAL.EYE);
    g.px(26, hy + 10, PAL.WHITE);
  }

  g.px(18, hy + 14, PAL.BLUSH);
  g.px(29, hy + 14, PAL.BLUSH);
  g.px(23, hy + 13, PAL.SKIN_SH);

  if ((anim === "talk" || anim === "cheer") && frameIdx % 2 === 1) {
    g.rect(22, hy + 15, 4, 2, PAL.MOUTH_OPEN);
  } else {
    g.rect(22, hy + 16, 4, 1, PAL.OUTLINE);
  }

  g.rect(15, hy, 18, 6, hairBase);
  g.rect(17, hy + 1, 14, 2, hairHi);

  if (isFemale) {
    g.rect(14, hy + 4, 4, 11, hairBase);
    g.rect(30, hy + 4, 4, 11, hairBase);
    g.rect(18, hy + 5, 3, 3, hairBase);
    g.rect(27, hy + 5, 3, 3, hairBase);
    g.px(23, hy + 5, hairSh);
  } else {
    g.rect(13, hy + 3, 3, 8, hairBase);
    g.rect(32, hy + 3, 3, 8, hairBase);
    g.rect(18, hy + 5, 4, 3, hairBase);
    g.rect(24, hy + 5, 5, 2, hairBase);
    g.px(12, hy + 6, hairBase);
    g.px(35, hy + 5, hairBase);
  }

  g.applyOutline();
  return g.toCanvas();
}

function renderSageFrame(isFemale, anim, frameIdx) {
  const g = new PixelGrid(64, 96);
  const bobY = frameIdx % 2 === 1 ? 1 : 0;

  const hairBase = isFemale ? PAL.HAIR_G : PAL.HAIR_B;
  const hairHi = isFemale ? PAL.HAIR_G_HI : PAL.HAIR_B_HI;

  g.rect(22, 11 + bobY, 20, 32, hairBase);
  if (isFemale) {
    g.rect(20, 16 + bobY, 24, 34, hairBase);
  }

  const stepL = anim === "walk" && frameIdx === 0 ? -2 : 0;
  const stepR = anim === "walk" && frameIdx === 2 ? -2 : 0;
  g.rect(23, 86 + stepL, 6, 6, PAL.SANDAL);
  g.rect(24, 86 + stepL, 4, 2, PAL.SKIN);
  g.rect(35, 86 + stepR, 6, 6, PAL.SANDAL);
  g.rect(36, 86 + stepR, 4, 2, PAL.SKIN);

  const ry = 28 + bobY;
  g.rect(21, ry, 22, 58, PAL.ROBE);
  g.rect(21, ry, 3, 58, PAL.ROBE_SH);
  g.rect(40, ry, 3, 58, PAL.ROBE_SH);
  g.rect(26, ry + 18, 2, 38, PAL.ROBE_SH);
  g.rect(35, ry + 22, 2, 34, PAL.ROBE_SH);
  g.rect(30, ry + 12, 3, 42, PAL.ROBE_HI);

  for (let i = 0; i < 20; i++) {
    const sx = 39 - Math.floor(i * 0.85);
    const sy = ry + 1 + i;
    g.rect(sx, sy, 5, 3, PAL.SASH);
    g.px(sx + 1, sy, PAL.SASH_HI);
  }
  g.rect(22, ry + 18, 7, 34, PAL.SASH);
  g.rect(22, ry + 18, 2, 34, PAL.SASH_SH);
  g.rect(26, ry + 20, 2, 30, PAL.SASH_HI);

  if (anim === "cheer") {
    g.rect(15, 12 + bobY, 5, 22, PAL.ROBE);
    g.rect(16, 9 + bobY, 4, 4, PAL.SKIN);
    g.rect(44, 12 + bobY, 5, 22, PAL.ROBE);
    g.rect(44, 9 + bobY, 4, 4, PAL.SKIN);
  } else {
    const gesture = anim === "talk" && frameIdx % 2 === 1 ? -2 : 0;
    g.rect(14, ry + 2, 7, 14, PAL.ROBE);
    g.rect(12, ry + 8, 6, 10, PAL.ROBE_SH);
    g.rect(9, ry + 15 + gesture, 6, 5, PAL.SKIN);
    g.rect(8, ry + 14 + gesture, 3, 2, PAL.SKIN_HI);

    g.rect(43, ry + 2, 7, 14, PAL.ROBE);
    g.rect(46, ry + 8, 6, 10, PAL.ROBE_SH);
    g.rect(49, ry + 15 - gesture, 6, 5, PAL.SKIN);
    g.rect(53, ry + 14 - gesture, 3, 2, PAL.SKIN_HI);
  }

  const hy = 9 + bobY;
  g.rect(29, hy + 16, 6, 4, PAL.SKIN);
  g.rect(26, hy + 4, 12, 13, PAL.SKIN);
  g.rect(26, hy + 4, 2, 13, PAL.SKIN_SH);

  g.rect(28, hy + 9, 2, 2, PAL.EYE);
  g.rect(34, hy + 9, 2, 2, PAL.EYE);

  if (!isFemale) {
    g.rect(26, hy + 12, 12, 5, hairBase);
    g.rect(30, hy + 13, 4, 1, PAL.SKIN);
  } else {
    g.px(27, hy + 12, PAL.BLUSH);
    g.px(36, hy + 12, PAL.BLUSH);
    if (anim === "talk" && frameIdx % 2 === 1) {
      g.rect(31, hy + 14, 3, 2, PAL.MOUTH_OPEN);
    } else {
      g.rect(31, hy + 14, 3, 1, PAL.OUTLINE);
    }
  }

  g.rect(24, hy, 16, 5, hairBase);
  g.rect(26, hy + 1, 12, 2, hairHi);
  g.rect(23, hy + 4, 3, 16, hairBase);
  g.rect(38, hy + 4, 3, 16, hairBase);

  g.applyOutline();
  return g.toCanvas();
}

export function canvasToCrispTexture(canvas) {
  const tex = new CanvasTexture(canvas);
  tex.magFilter = NearestFilter;
  tex.minFilter = NearestFilter;
  tex.generateMipmaps = false;
  tex.colorSpace = SRGBColorSpace;
  tex.needsUpdate = true;
  return tex;
}

/**
 * Lazy sprite library: { presetId: { anim: [CanvasTexture x4] } }.
 * Textures are shared across actors; do not dispose them per-actor.
 */
let spriteLibrary = null;
export function getPixelSpriteLibrary() {
  if (spriteLibrary) return spriteLibrary;
  spriteLibrary = {};
  for (const preset of PIXEL_PRESETS) {
    spriteLibrary[preset.id] = {};
    for (const anim of PIXEL_ANIMS) {
      spriteLibrary[preset.id][anim] = [];
      for (let fIdx = 0; fIdx < PIXEL_FRAMES_PER_ANIM; fIdx += 1) {
        const canvas = preset.isSage
          ? renderSageFrame(preset.isFemale, anim, fIdx)
          : renderTravelerFrame(preset.isFemale, anim, fIdx);
        spriteLibrary[preset.id][anim].push({ canvas, texture: canvasToCrispTexture(canvas) });
      }
    }
  }
  return spriteLibrary;
}

/** Draw a single pixel frame into a preview canvas (NearestFilter scaling). */
export function drawPixelPreview(presetId, anim = "idle", frameIdx = 0, targetCanvas) {
  const library = getPixelSpriteLibrary();
  const frames = library[presetId]?.[anim] ?? library.traveler_boy.idle;
  const source = frames[frameIdx % frames.length].canvas;
  const ctx = targetCanvas.getContext("2d");
  ctx.imageSmoothingEnabled = false;
  ctx.clearRect(0, 0, targetCanvas.width, targetCanvas.height);
  const scale = Math.min(targetCanvas.width / source.width, targetCanvas.height / source.height);
  const dw = Math.max(1, Math.round(source.width * scale));
  const dh = Math.max(1, Math.round(source.height * scale));
  const dx = Math.floor((targetCanvas.width - dw) / 2);
  const dy = Math.floor((targetCanvas.height - dh) / 2);
  ctx.drawImage(source, dx, dy, dw, dh);
}

export function pixelPresetBaseHeight(presetId) {
  const preset = PIXEL_PRESETS.find((item) => item.id === presetId);
  return preset?.isSage ? 1.56 : 1.18;
}
