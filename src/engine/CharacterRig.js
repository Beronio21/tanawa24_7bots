import { CanvasTexture, NearestFilter, SRGBColorSpace } from "three";

/**
 * Parameterized cel-shaded anime character rig.
 *
 * Ported from docs/references/character.html and the seated bot generator in
 * docs/references/multi_cam_cctv.html, then restyled for the Morning Light
 * palette. Renders inline SVG (roster cards, cast slots) and bakes crisp
 * NearestFilter CanvasTextures for 2D billboards inside the Three.js engines.
 */

const INK = "#2B201B";

const PALETTES = {
  animator: {
    skin: "#FFF0E6",
    skinShade: "#EED2C1",
    blush: "#E8856F",
    hair: "#B24A6E",
    hairShade: "#7C2C48",
    hairShine: "#E9A7BC",
    outfit: "#A8445C",
    outfitShade: "#7A2B3E",
    outfitLight: "#D96B43",
    shirt: "#FFFDF9",
    shirtShade: "#E8DED1",
    eyeTop: "#8E2C4C",
    eyeMid: "#C15C77",
    eyeGlow: "#F3C3CF",
    ribbon: "#D96B43",
  },
  editor: {
    skin: "#FFEFE2",
    skinShade: "#EBC6AC",
    blush: "#E8856F",
    hair: "#C2622B",
    hairShade: "#8A3F1B",
    hairShine: "#EFC08D",
    outfit: "#4A4038",
    outfitShade: "#2C241F",
    outfitLight: "#D96B43",
    shirt: "#5B5148",
    shirtShade: "#3E362F",
    eyeTop: "#9B4A12",
    eyeMid: "#D08434",
    eyeGlow: "#F6D9A6",
    ribbon: "#C88A2B",
  },
  writer: {
    skin: "#FFF3ED",
    skinShade: "#EFCBBC",
    blush: "#E8856F",
    hair: "#2F6E8F",
    hairShade: "#1D4A62",
    hairShine: "#A8CFE0",
    outfit: "#2B6E68",
    outfitShade: "#1B4A45",
    outfitLight: "#4E9A8F",
    shirt: "#FFFDF9",
    shirtShade: "#E8DED1",
    eyeTop: "#1E5A78",
    eyeMid: "#3F8CA8",
    eyeGlow: "#C6E2EC",
    ribbon: "#C88A2B",
  },
  scheduler: {
    skin: "#FFF1EB",
    skinShade: "#E9C6BE",
    blush: "#E8856F",
    hair: "#3F7D58",
    hairShade: "#28513A",
    hairShine: "#A9D2B9",
    outfit: "#2F6047",
    outfitShade: "#1D3E2D",
    outfitLight: "#5B9673",
    shirt: "#FFFDF9",
    shirtShade: "#E8DED1",
    eyeTop: "#2B6146",
    eyeMid: "#4C8E6B",
    eyeGlow: "#CBE3D5",
    ribbon: "#C88A2B",
  },
  manager: {
    skin: "#FFF4EF",
    skinShade: "#EDCBC0",
    blush: "#E8856F",
    hair: "#B9AB9B",
    hairShade: "#8C7F70",
    hairShine: "#E8DFD4",
    outfit: "#B4543A",
    outfitShade: "#7E3524",
    outfitLight: "#D96B43",
    shirt: "#FFFDF9",
    shirtShade: "#E8DED1",
    eyeTop: "#8E3A28",
    eyeMid: "#BF6746",
    eyeGlow: "#F0C6B4",
    ribbon: "#C88A2B",
  },
  poster: {
    skin: "#FFF0E8",
    skinShade: "#EEC8B6",
    blush: "#E8856F",
    hair: "#6F5A8E",
    hairShade: "#4A3A61",
    hairShine: "#C7B8DC",
    outfit: "#5B4A7A",
    outfitShade: "#382C4D",
    outfitLight: "#8B76AC",
    shirt: "#FFFDF9",
    shirtShade: "#E8DED1",
    eyeTop: "#4A3A61",
    eyeMid: "#7C689E",
    eyeGlow: "#D8CCEA",
    ribbon: "#C88A2B",
  },
  offduty: {
    skin: "#FFEFE2",
    skinShade: "#EBC6AC",
    blush: "#E8856F",
    hair: "#6E4A32",
    hairShade: "#4A3020",
    hairShine: "#CBAB84",
    outfit: "#5A5148",
    outfitShade: "#3A332C",
    outfitLight: "#8A7C6C",
    shirt: "#FBF6EE",
    shirtShade: "#D8CCBC",
    eyeTop: "#6B4526",
    eyeMid: "#A0714A",
    eyeGlow: "#E5CFB4",
    ribbon: "#C88A2B",
  },
  cast_hana: {
    skin: "#FFEDE1",
    skinShade: "#EAC4AB",
    blush: "#E57A66",
    hair: "#7A4A2E",
    hairShade: "#4E2E1B",
    hairShine: "#CFA379",
    outfit: "#2B6E68",
    outfitShade: "#1B4A45",
    outfitLight: "#4E9A8F",
    shirt: "#FFFDF9",
    shirtShade: "#E8DED1",
    eyeTop: "#2F5E52",
    eyeMid: "#54897C",
    eyeGlow: "#C9E1DA",
    ribbon: "#D96B43",
  },
  cast_ren: {
    skin: "#FFEBDD",
    skinShade: "#E6BCA0",
    blush: "#DE7259",
    hair: "#33302E",
    hairShade: "#1D1B1A",
    hairShine: "#7C736B",
    outfit: "#B4543A",
    outfitShade: "#7E3524",
    outfitLight: "#D96B43",
    shirt: "#FBF4EA",
    shirtShade: "#DCCFBE",
    eyeTop: "#8A3A24",
    eyeMid: "#B96A46",
    eyeGlow: "#EFC6B2",
    ribbon: "#2B6E68",
  },
};

export const RIG_PRESETS = [
  {
    id: "animator_bot",
    label: "Animator Bot",
    role: "Animation Studio",
    hair: "long",
    accessory: "beret",
    palette: "animator",
    expression: "happy",
    pose: "typing",
  },
  {
    id: "editor_bot",
    label: "Video Editor Bot",
    role: "Editing Suite",
    hair: "braids",
    accessory: "headset",
    palette: "editor",
    expression: "focused",
    pose: "typing",
  },
  {
    id: "seo_writer_bot",
    label: "SEO Writer Bot",
    role: "Planning wall",
    hair: "buns",
    accessory: "glasses",
    palette: "writer",
    expression: "smile",
    pose: "typing",
  },
  {
    id: "scheduler_bot",
    label: "Scheduler Bot",
    role: "Publishing desk",
    hair: "long",
    accessory: "visor",
    palette: "scheduler",
    expression: "focused",
    pose: "typing",
  },
  {
    id: "manager_bot",
    label: "Manager Bot",
    role: "QA review",
    hair: "buns",
    accessory: "none",
    palette: "manager",
    expression: "smile",
    pose: "typing",
  },
  {
    id: "posting_bot",
    label: "Posting Bot",
    role: "Broadcast room",
    hair: "braids",
    accessory: "cap",
    palette: "poster",
    expression: "wink",
    pose: "typing",
  },
  {
    id: "offduty_bot",
    label: "Off-duty Bot",
    role: "Coffee area",
    hair: "long",
    accessory: "cap",
    palette: "offduty",
    expression: "happy",
    pose: "seated_idle",
  },
  {
    id: "cast_hana",
    label: "Hana",
    role: "Story lead",
    hair: "long",
    accessory: "none",
    palette: "cast_hana",
    expression: "happy",
    pose: "idle",
  },
  {
    id: "cast_ren",
    label: "Ren",
    role: "Story co-lead",
    hair: "braids",
    accessory: "glasses",
    palette: "cast_ren",
    expression: "smile",
    pose: "idle",
  },
  {
    id: "cast_mika",
    label: "Mika",
    role: "Story friend",
    hair: "buns",
    accessory: "beret",
    palette: "animator",
    expression: "pout",
    pose: "idle",
  },
  {
    id: "cast_toma",
    label: "Toma",
    role: "Story guide",
    hair: "long",
    accessory: "cap",
    palette: "scheduler",
    expression: "focused",
    pose: "idle",
  },
  {
    id: "cast_custom",
    label: "Custom Rig",
    role: "Character Rig",
    hair: "long",
    accessory: "none",
    palette: "cast_hana",
    expression: "smile",
    pose: "idle",
  },
];

export const EXPRESSIONS = [
  "happy",
  "smile",
  "focused",
  "pout",
  "wink",
  "grin",
  "serious",
  "shout",
  "shy_glance",
];
export const POSES = ["idle", "talk", "walk", "cheer"];
export const HAIR_STYLES = ["long", "braids", "buns"];
export const ACCESSORIES = ["none", "beret", "glasses", "visor", "headset", "cap"];

const PRESET_INDEX = new Map(RIG_PRESETS.map((preset) => [preset.id, preset]));

let uidCounter = 0;

export function getRigPreset(id) {
  return PRESET_INDEX.get(id) ?? RIG_PRESETS[0];
}

export function listRigPresets() {
  return RIG_PRESETS.slice();
}

/** Normalize a loose config into a complete rig description. */
export function createRig(overrides = {}) {
  const base = getRigPreset(overrides.presetId ?? overrides.id);
  const merged = { ...base, ...overrides };
  const paletteRequest = merged.paletteKey ?? merged.palette ?? base.palette;
  const fallbackPalette =
    PALETTES[typeof paletteRequest === "string" ? paletteRequest : base.palette] ??
    PALETTES.cast_hana;
  merged.palette =
    paletteRequest && typeof paletteRequest === "object"
      ? { ...fallbackPalette, ...paletteRequest }
      : fallbackPalette;
  merged.expression =
    typeof merged.expression === "string" && merged.expression.trim()
      ? merged.expression
      : base.expression;
  merged.pose = merged.pose ?? base.pose;
  merged.hair = typeof merged.hair === "string" && merged.hair ? merged.hair : base.hair;
  merged.accessory =
    typeof merged.accessory === "string" ? merged.accessory : base.accessory;
  merged.facing = merged.facing === -1 ? -1 : 1;
  return merged;
}

function eyeLayer(pal, uid, mode, x, y) {
  const grad = `url(#rig-iris-${uid})`;
  if (mode === "closed" || mode === "wink") {
    return `<path d="M ${x - 11} ${y} Q ${x} ${y - 7} ${x + 11} ${y}" fill="none" stroke="${INK}" stroke-width="3.4" stroke-linecap="round" />`;
  }
  const ry = mode === "narrow" ? 7.5 : 11.5;
  return `
    <ellipse cx="${x}" cy="${y}" rx="10.5" ry="${ry + 2}" fill="#FFFDF9" stroke="${INK}" stroke-width="2.4" />
    <ellipse cx="${x}" cy="${y + 0.5}" rx="6.8" ry="${ry}" fill="${grad}" />
    <ellipse cx="${x}" cy="${y + 1}" rx="3" ry="${ry * 0.62}" fill="${INK}" />
    <circle cx="${x - 2.4}" cy="${y - 3.4}" r="2.4" fill="#FFFFFF" />
    <circle cx="${x + 2.6}" cy="${y + 3}" r="1.2" fill="#FFFFFF" opacity="0.75" />
    <path d="M ${x - 11} ${y - ry - 1} Q ${x} ${y - ry - 6} ${x + 11} ${y - ry - 1}" fill="none" stroke="${INK}" stroke-width="3" stroke-linecap="round" />
  `;
}

function faceLayer(expression, pal, uid) {
  const leftEye = { x: 204, y: 124 };
  const rightEye = { x: 236, y: 124 };
  let leftMode = "open";
  let rightMode = "open";
  let browLeft = `<path d="M 193 106 Q 204 101 215 106" fill="none" stroke="${INK}" stroke-width="3" stroke-linecap="round" />`;
  let browRight = `<path d="M 225 106 Q 236 101 247 106" fill="none" stroke="${INK}" stroke-width="3" stroke-linecap="round" />`;
  let mouth = `<path d="M 210 146 Q 220 153 230 146" fill="none" stroke="${INK}" stroke-width="2.8" stroke-linecap="round" />`;

  if (expression === "happy") {
    leftMode = "closed";
    rightMode = "closed";
    mouth = `<path d="M 206 143 Q 220 158 234 143 Q 220 150 206 143 Z" fill="${INK}" />`;
  } else if (expression === "focused") {
    leftMode = "narrow";
    rightMode = "narrow";
    browLeft = `<path d="M 192 103 L 215 109" fill="none" stroke="${INK}" stroke-width="3" stroke-linecap="round" />`;
    browRight = `<path d="M 248 103 L 225 109" fill="none" stroke="${INK}" stroke-width="3" stroke-linecap="round" />`;
    mouth = `<path d="M 211 148 L 229 148" fill="none" stroke="${INK}" stroke-width="2.8" stroke-linecap="round" />`;
  } else if (expression === "pout") {
    browLeft = `<path d="M 192 107 Q 204 109 214 103" fill="none" stroke="${INK}" stroke-width="3" stroke-linecap="round" />`;
    mouth = `<path d="M 212 148 Q 220 142 228 148" fill="none" stroke="${INK}" stroke-width="2.8" stroke-linecap="round" />`;
  } else if (expression === "wink") {
    rightMode = "wink";
    mouth = `<path d="M 208 145 Q 220 155 232 145" fill="none" stroke="${INK}" stroke-width="2.8" stroke-linecap="round" />`;
  } else if (expression === "grin") {
    mouth = `<path d="M 203 140 Q 220 161 237 140 Q 220 150 203 140 Z" fill="${INK}" />`;
  } else if (expression === "serious") {
    leftMode = "narrow";
    rightMode = "narrow";
    browLeft = `<path d="M 193 104 L 214 110" fill="none" stroke="${INK}" stroke-width="3" stroke-linecap="round" />`;
    browRight = `<path d="M 247 104 L 226 110" fill="none" stroke="${INK}" stroke-width="3" stroke-linecap="round" />`;
    mouth = `<path d="M 210 150 L 230 150" fill="none" stroke="${INK}" stroke-width="3" stroke-linecap="round" />`;
  } else if (expression === "shout") {
    leftMode = "narrow";
    rightMode = "narrow";
    mouth = `<ellipse cx="220" cy="149" rx="8.5" ry="6.5" fill="${INK}" />`;
  } else if (expression === "shy_glance") {
    mouth = `<path d="M 211 147 Q 220 153 229 147" fill="none" stroke="${INK}" stroke-width="2.8" stroke-linecap="round" />`;
  }

  return `
    ${browLeft}
    ${browRight}
    ${eyeLayer(pal, uid, leftMode, leftEye.x, leftEye.y)}
    ${eyeLayer(pal, uid, rightMode, rightEye.x, rightEye.y)}
    <ellipse cx="191" cy="140" rx="8" ry="3.4" fill="${pal.blush}" opacity="0.36" />
    <ellipse cx="249" cy="140" rx="8" ry="3.4" fill="${pal.blush}" opacity="0.36" />
    ${mouth}
  `;
}

function backHairLayer(hair, pal) {
  if (hair === "braids") {
    return `
      <path d="M 178 114 C 168 142, 168 172, 175 194 C 167 216, 167 246, 175 268 C 167 290, 168 318, 176 336 L 186 336 C 193 318, 193 290, 185 268 C 193 246, 193 216, 185 194 C 192 172, 192 142, 186 114 Z" fill="url(#rig-hair)" />
      <path d="M 176 336 C 170 350, 172 366, 181 374 C 190 366, 192 350, 186 336 Z" fill="${pal.hairShade}" />
      <path d="M 181 335 L 172 329 L 174 339 Z M 181 335 L 190 329 L 188 339 Z" fill="${pal.ribbon}" />
      <path d="M 244 108 C 240 138, 240 172, 246 196 C 240 220, 240 250, 246 274 C 240 296, 241 322, 247 338 L 257 338 C 263 322, 263 296, 256 274 C 263 250, 263 220, 256 196 C 262 172, 262 138, 254 108 Z" fill="url(#rig-hair)" />
      <path d="M 247 338 C 242 350, 244 364, 251 371 C 259 364, 261 350, 256 338 Z" fill="${pal.hairShade}" />
      <path d="M 251 337 L 243 331 L 245 340 Z M 251 337 L 259 331 L 257 340 Z" fill="${pal.ribbon}" />
    `;
  }
  if (hair === "buns") {
    return `
      <ellipse cx="176" cy="73" rx="22" ry="20" transform="rotate(-18 176 73)" fill="url(#rig-hair)" />
      <ellipse cx="253" cy="77" rx="18" ry="19" transform="rotate(18 253 77)" fill="url(#rig-hair)" />
      <path d="M 180 132 C 174 156, 176 174, 186 184 L 244 184 C 250 174, 252 156, 246 132 Z" fill="${pal.hairShade}" />
    `;
  }
  return `
    <path d="M 178 84 C 155 110, 146 164, 140 216 C 134 260, 124 298, 131 328 C 135 346, 148 354, 159 344 C 151 340, 148 328, 151 314 C 156 334, 166 348, 178 342 L 262 342 C 274 348, 284 334, 289 314 C 292 328, 289 340, 281 344 C 292 354, 305 346, 309 328 C 316 298, 306 260, 300 216 C 294 164, 285 110, 260 84 Z" fill="url(#rig-hair)" />
    <path d="M 182 128 C 174 176, 173 238, 177 320 L 263 320 C 267 238, 266 176, 258 128 Z" fill="${pal.hairShade}" opacity="0.85" />
  `;
}

function accessoryLayer(accessory, pal) {
  if (accessory === "beret") {
    return `<ellipse cx="218" cy="63" rx="40" ry="15" transform="rotate(-11 218 63)" fill="${pal.outfit}" stroke="${INK}" stroke-width="3" />
      <path d="M 208 50 L 214 34 L 220 50 Z" fill="${pal.ribbon}" stroke="${INK}" stroke-width="2.4" />`;
  }
  if (accessory === "glasses") {
    return `<g fill="none" stroke="${INK}" stroke-width="2.6" opacity="0.9">
        <rect x="189" y="112" width="26" height="23" rx="6" />
        <rect x="226" y="112" width="26" height="23" rx="6" />
        <line x1="215" y1="122" x2="226" y2="122" />
        <line x1="189" y1="120" x2="180" y2="116" />
        <line x1="252" y1="120" x2="261" y2="116" />
      </g>`;
  }
  if (accessory === "visor") {
    return `<rect x="188" y="109" width="64" height="18" rx="7" fill="${pal.outfitLight}" stroke="${INK}" stroke-width="3" />
      <rect x="195" y="114" width="26" height="7" rx="3" fill="#FFFDF9" opacity="0.55" />`;
  }
  if (accessory === "headset") {
    return `<path d="M 178 122 C 173 72, 258 72, 255 122" fill="none" stroke="${pal.outfitLight}" stroke-width="7" />
      <rect x="168" y="112" width="15" height="26" rx="6" fill="${pal.outfitLight}" stroke="${INK}" stroke-width="2.6" />
      <path d="M 233 140 C 240 150, 240 158, 234 164" fill="none" stroke="${INK}" stroke-width="2.4" />
      <circle cx="233" cy="165" r="3.4" fill="${INK}" />`;
  }
  if (accessory === "cap") {
    return `<path d="M 181 84 C 187 55, 253 55, 257 84 Z" fill="${pal.outfit}" stroke="${INK}" stroke-width="3" />
      <path d="M 220 82 L 272 90 L 248 98 L 205 88 Z" fill="${pal.outfitLight}" stroke="${INK}" stroke-width="2.8" />`;
  }
  return "";
}

function armLayer(side, upper, lower, pal) {
  const shoulderX = 220 + side * 35;
  const rotation = side * upper;
  return `
    <g transform="translate(${shoulderX} 206) rotate(${rotation})">
      <path d="M -12 0 L 12 0 L 10 64 L -10 64 Z" fill="${pal.shirt}" stroke="${INK}" stroke-width="3" stroke-linejoin="round" />
      <g transform="translate(0 62) rotate(${side * lower})">
        <path d="M -9 0 L 9 0 L 7 44 L -7 44 Z" fill="${pal.skin}" stroke="${INK}" stroke-width="3" stroke-linejoin="round" />
        <path d="M -9 0 L 9 0 L 8 8 L -8 8 Z" fill="${pal.skinShade}" opacity="0.5" />
        <circle cx="0" cy="50" r="9.5" fill="${pal.skin}" stroke="${INK}" stroke-width="3" />
      </g>
    </g>
  `;
}

const STANDING_ARMS = {
  idle: { left: [9, 4], right: [9, 4] },
  talk: { left: [12, 8], right: [46, -66] },
  walk: { left: [24, 6], right: [16, 10] },
  cheer: { left: [152, -16], right: [152, -16] },
};

function standingBody(pal, pose) {
  const arms = STANDING_ARMS[pose] ?? STANDING_ARMS.idle;
  const stride = pose === "walk";
  return `
    <g transform="${stride ? "rotate(5 206 432)" : ""}">
      <path d="M 190 428 C 186 500, 184 570, 187 640 L 208 640 C 210 570, 210 500, 206 428 Z" fill="${pal.skin}" stroke="${INK}" stroke-width="3" stroke-linejoin="round" />
    </g>
    <g transform="${stride ? "rotate(-7 236 432)" : ""}">
      <path d="M 234 428 C 230 500, 230 570, 233 640 L 254 640 C 256 570, 254 500, 250 428 Z" fill="${pal.skin}" stroke="${INK}" stroke-width="3" stroke-linejoin="round" />
    </g>
    <path d="M 184 636 C 182 654, 186 664, 194 666 L 212 666 C 214 656, 211 646, 208 640 Z" fill="${INK}" />
    <path d="M 232 640 C 229 646, 226 656, 228 666 L 246 666 C 254 664, 258 654, 256 636 Z" fill="${INK}" />
    ${armLayer(-1, arms.left[0], arms.left[1], pal)}
    ${armLayer(1, arms.right[0], arms.right[1], pal)}
  `;
}

function seatedBody(pal, phase) {
  const tap = Math.sin(phase) * 7;
  const bob = Math.sin(phase * 0.5) * 2.2;
  return `
    <path d="M 188 410 L 254 426 L 256 462 L 188 450 Z" fill="${pal.skinShade}" stroke="${INK}" stroke-width="3" />
    <path d="M 244 432 L 266 565 L 246 568 L 226 446 Z" fill="${pal.skin}" stroke="${INK}" stroke-width="3" />
    <path d="M 222 436 L 240 572 L 218 575 L 204 446 Z" fill="${pal.skin}" stroke="${INK}" stroke-width="3" />
    <path d="M 244 562 L 286 574 C 290 588, 276 596, 242 594 Z" fill="${INK}" />
    <path d="M 216 568 L 258 580 C 262 594, 248 602, 214 600 Z" fill="${INK}" />
    <g transform="translate(0 ${-tap * 0.4})">
      <path d="M 244 205 L 286 258 L 328 266 L 324 282 L 274 274 L 234 214 Z" fill="${pal.skinShade}" stroke="${INK}" stroke-width="3" stroke-linejoin="round" />
    </g>
    <g transform="translate(0 ${tap * 0.5})">
      <path d="M 180 205 L 176 274 L 248 282 L 250 266 L 194 260 L 192 214 Z" fill="${pal.skin}" stroke="${INK}" stroke-width="3" stroke-linejoin="round" />
      <circle cx="252" cy="274" r="9.5" fill="${pal.skin}" stroke="${INK}" stroke-width="3" />
    </g>
    <g transform="translate(0 ${bob})"></g>
  `;
}

/**
 * Full inline SVG for a character.
 * @returns {string} an `<svg>` string sized to the requested box.
 */
export function buildCharacterSVG(rigInput = {}, options = {}) {
  const rig = rigInput.palette ? rigInput : createRig(rigInput);
  const pal = rig.palette;
  const {
    pose = rig.pose ?? "idle",
    expression = rig.expression ?? "smile",
    facing = rig.facing ?? 1,
    phase = 0,
    seated = pose === "typing" || pose === "seated_idle",
    viewBox = "0 0 440 820",
    width = 220,
    height = 410,
    className = "",
  } = options;

  const uid = `${(uidCounter += 1)}`;
  const body = seated ? seatedBody(pal, phase) : standingBody(pal, pose === "typing" ? "idle" : pose);
  const mirrored = facing === -1 ? "translate(440 0) scale(-1 1)" : "";

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="${viewBox}" width="${width}" height="${height}" class="${className}" role="img" aria-label="${escapeAttr(rig.label ?? "Character")}">
    <defs>
      <linearGradient id="rig-iris-${uid}" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="${pal.eyeTop}" />
        <stop offset="52%" stop-color="${pal.eyeMid}" />
        <stop offset="88%" stop-color="${pal.eyeGlow}" />
        <stop offset="100%" stop-color="#FFFFFF" />
      </linearGradient>
      <linearGradient id="rig-hair-${uid}" x1="0%" y1="0%" x2="0%" y2="100%">
        <stop offset="0%" stop-color="${pal.hairShade}" />
        <stop offset="34%" stop-color="${pal.hair}" />
        <stop offset="84%" stop-color="${pal.hair}" />
        <stop offset="100%" stop-color="${pal.hairShade}" />
      </linearGradient>
      <linearGradient id="rig-outfit-${uid}" x1="0%" y1="0%" x2="100%" y2="0%">
        <stop offset="0%" stop-color="${pal.outfitShade}" />
        <stop offset="30%" stop-color="${pal.outfit}" />
        <stop offset="52%" stop-color="${pal.outfitLight}" />
        <stop offset="74%" stop-color="${pal.outfit}" />
        <stop offset="100%" stop-color="${pal.outfitShade}" />
      </linearGradient>
      <style>
        .rig-ink-${uid} { stroke: ${INK}; stroke-width: 3; stroke-linejoin: round; stroke-linecap: round; }
        .rig-fine-${uid} { stroke: ${INK}; stroke-width: 1.6; stroke-linejoin: round; stroke-linecap: round; opacity: 0.72; }
      </style>
    </defs>
    <g transform="${mirrored}">
      <g fill="none" stroke="${INK}" stroke-width="3" stroke-linejoin="round" stroke-linecap="round">
        ${backHairLayer(rig.hair, pal).replaceAll("url(#rig-hair)", `url(#rig-hair-${uid})`)}
        ${body}
        <path d="M 211 148 L 210 186 L 230 186 L 229 148 Z" fill="${pal.skin}" />
        <path d="M 211 154 C 216 166, 224 166, 229 154 L 229 174 C 223 178, 217 178, 211 174 Z" fill="${pal.skinShade}" stroke="none" />
        <path d="M 181 196 C 198 189, 240 189, 254 196 L 253 328 L 183 328 Z" fill="${pal.shirt}" />
        <path d="M 182 200 L 191 200 L 192 327 L 184 327 Z" fill="${pal.shirtShade}" stroke="none" opacity="0.7" />
        <path class="rig-fine-${uid}" d="M 232 206 L 232 321" fill="none" />
        <circle cx="232" cy="256" r="1.9" fill="${INK}" stroke="none" />
        <circle cx="232" cy="290" r="1.9" fill="${INK}" stroke="none" />
        <path d="M 207 186 L 232 202 L 216 213 L 200 195 Z" fill="#FFFDF9" />
        <path d="M 244 187 L 232 202 L 243 211 L 250 195 Z" fill="#FFFDF9" />
        <path d="M 229 204 L 222 242 L 229 245 L 232 212 Z" fill="${pal.ribbon}" />
        <path d="M 234 204 L 241 241 L 235 244 L 232 212 Z" fill="${pal.ribbon}" />
        <rect x="228.5" y="199" width="7" height="7" rx="2" fill="${pal.outfitLight}" />
        <path d="M 185 318 L 251 318 C 259 354, 265 392, 270 432 Q 220 422 168 432 C 173 392, 179 354, 185 318 Z" fill="url(#rig-outfit-${uid})" />
        <path class="rig-fine-${uid}" d="M 197 326 L 187 430 M 214 326 L 209 428 M 231 326 L 233 428 M 244 326 L 255 430" fill="none" />
        <path d="M 183 94 C 183 65, 257 65, 257 94 L 256 132 C 254 148, 236 160, 220 165 C 204 160, 186 148, 184 132 Z" fill="${pal.skin}" />
        <path d="M 184 106 Q 204 97 220 88 Q 236 97 256 106 L 256 90 L 184 90 Z" fill="${pal.skinShade}" stroke="none" opacity="0.4" />
        <path d="M 179 124 C 171 124, 170 142, 180 145" fill="${pal.skin}" />
        <circle cx="176.5" cy="143" r="2.4" fill="${pal.ribbon}" stroke-width="1.4" />
        <g stroke="none">
          ${faceLayer(expression, pal, uid)}
        </g>
        <path d="M 193 94 C 184 128, 186 170, 196 204 C 193 174, 194 138, 199 104 Z" fill="url(#rig-hair-${uid})" />
        <path d="M 248 100 C 256 132, 254 170, 246 202 C 248 172, 248 140, 244 106 Z" fill="url(#rig-hair-${uid})" />
        <path d="M 216 61 C 188 61, 171 80, 169 112 C 168 132, 171 152, 176 168 C 175 150, 176 128, 181 112 C 187 96, 204 87, 221 92 C 218 100, 217 108, 220 114 C 220 106, 222 98, 225 92 C 224 100, 224 107, 227 113 C 227 105, 228 97, 229 91 C 238 89, 247 95, 252 110 C 256 124, 256 142, 254 160 C 260 142, 263 122, 261 106 C 259 80, 242 61, 216 61 Z" fill="url(#rig-hair-${uid})" />
        <path d="M 181 92 L 194 86 L 203 90 L 215 84 L 225 89 L 234 84 L 244 90 L 255 94 L 257 100 L 245 96 L 235 91 L 225 95 L 215 91 L 203 96 L 193 92 L 179 98 Z" fill="${pal.hairShine}" stroke="none" opacity="0.66" />
        ${accessoryLayer(rig.accessory, pal)}
      </g>
    </g>
  </svg>`;
}

/** Inline SVG cropped to a head-and-shoulders portrait for roster cards. */
export function buildPortraitSVG(rigInput = {}, options = {}) {
  const rig = rigInput.palette ? rigInput : createRig(rigInput);
  return buildCharacterSVG(rig, {
    width: options.width ?? 96,
    height: options.height ?? 96,
    viewBox: "156 48 128 128",
    expression: options.expression ?? rig.expression,
    facing: options.facing ?? rig.facing,
    pose: "idle",
    phase: 0,
  });
}

function escapeAttr(value) {
  return String(value).replaceAll("&", "&amp;").replaceAll('"', "&quot;").replaceAll("<", "&lt;");
}

/** Draw an SVG string into a canvas; resolves when the frame is painted. */
export function paintSVGToCanvas(svg, canvas) {
  const ctx = canvas.getContext("2d");
  return new Promise((resolve) => {
    const blob = new Blob([svg], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const image = new Image();
    image.onload = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(image, 0, 0, canvas.width, canvas.height);
      URL.revokeObjectURL(url);
      resolve(canvas);
    };
    image.onerror = () => {
      URL.revokeObjectURL(url);
      resolve(canvas);
    };
    image.src = url;
  });
}

/** Crop windows keep the baked billboard body filling its plane. */
export const RIG_CROPS = {
  standing: { viewBox: "128 40 184 664" },
  seated: { viewBox: "134 44 172 700" },
};

/** Bake one crisp billboard frame into a NearestFilter CanvasTexture. */
export function createCharacterTexture(rigInput, options = {}, size = {}) {
  const seated = options.seated ?? (options.pose === "typing" || options.pose === "seated_idle");
  const viewBox = options.viewBox ?? (seated ? RIG_CROPS.seated.viewBox : RIG_CROPS.standing.viewBox);
  const [, , viewWidth, viewHeight] = viewBox.split(/\s+/).map(Number);

  const canvas = document.createElement("canvas");
  canvas.height = size.height ?? 720;
  canvas.width = Math.round(canvas.height * (viewWidth / viewHeight));
  const texture = new CanvasTexture(canvas);
  texture.magFilter = NearestFilter;
  texture.minFilter = NearestFilter;
  texture.generateMipmaps = false;
  texture.colorSpace = SRGBColorSpace;
  texture.needsUpdate = true;

  const svg = buildCharacterSVG(rigInput, {
    ...options,
    seated,
    viewBox,
    width: canvas.width,
    height: canvas.height,
  });
  paintSVGToCanvas(svg, canvas).then(() => {
    texture.needsUpdate = true;
  });

  return texture;
}

export function textureAspect(texture) {
  const image = texture?.image;
  if (!image?.width || !image?.height) return 0.28;
  return image.width / image.height;
}
