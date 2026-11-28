import referenceHtml from "../../docs/references/character.html?raw";
import { EXPRESSIONS, POSES } from "./CharacterRig.js";

export const CHARACTER_REFERENCE_ROUTE = "character-rig";
export const CHARACTER_REFERENCE_SOURCE = "docs/references/character.html";

const BRIDGE_SCRIPT = `
<script>
(function () {
  var CHANNEL = "tanawa-character-rig";
  function safe(fn, fallback) {
    try { return fn(); } catch (err) { return fallback; }
  }
  function cssVar(name) {
    return safe(function () {
      return getComputedStyle(document.documentElement).getPropertyValue(name).trim();
    }, "");
  }
  var PALETTE_VARS = [
    "--skin-base", "--skin-shade", "--skin-blush",
    "--hair-base", "--hair-shade", "--hair-shine",
    "--outfit-main", "--outfit-shade", "--outfit-light",
    "--shirt-base", "--shirt-shade",
    "--eye-top", "--eye-mid", "--eye-glow",
    "--ribbon-accent"
  ];
  function paletteVars() {
    var out = {};
    PALETTE_VARS.forEach(function (name) { out[name] = cssVar(name); });
    return out;
  }
  function list(fn) { return safe(fn, []) || []; }
  function pick(fn, fallback) {
    var value = safe(fn, fallback);
    return value === undefined ? fallback : value;
  }
  function state() {
    var exprIdx = pick(function () { return exprIndex; }, 0);
    var hairIdx = pick(function () { return hairIndex; }, 0);
    var exprList = list(function () { return expressions; });
    var hairLabelList = list(function () { return getHairLabels(); });
    var angleKey = pick(function () { return currentAngle; }, "front");
    var angles = pick(function () { return angleConfigs; }, {}) || {};
    var angleCfg = angles[angleKey] || {};
    return {
      type: CHANNEL,
      ready: true,
      gender: pick(function () { return charGender; }, "female"),
      age: pick(function () { return charAge; }, "teenager"),
      paletteIndex: pick(function () { return paletteIndex; }, 0),
      paletteVars: paletteVars(),
      palettes: list(function () { return palettes; }),
      expressions: exprList,
      exprIndex: exprIdx,
      expression: exprList[exprIdx] || "",
      angle: angleKey,
      angleLabel: angleCfg.label || angleKey,
      hairIndex: hairIdx,
      hairLabels: hairLabelList,
      hairLabel: hairLabelList[hairIdx] || "",
      armL: pick(function () { return armPoses[armLIndex]; }, null),
      armR: pick(function () { return armPoses[armRIndex]; }, null),
      handGesture: pick(function () { return handGestures[handGestureIndex]; }, null),
      legPose: pick(function () { return legPoses[legPoseIndex]; }, null),
      gazeX: pick(function () { return targetGazeX; }, 0),
      gazeY: pick(function () { return targetGazeY; }, 0),
      followMouse: pick(function () { return followMouse; }, false),
      shoes: pick(function () { return showShoes; }, false),
      paper: pick(function () { return isPaper; }, false),
      persp: pick(function () { return currentPersp; }, 0)
    };
  }
  function post() {
    try { window.parent.postMessage(state(), "*"); } catch (err) {}
  }
  window.addEventListener("message", function (event) {
    var data = event.data || {};
    if (data.type === CHANNEL && data.command === "state") post();
  });
  window.addEventListener("load", function () { setTimeout(post, 60); });
  setInterval(post, 500);
})();
</script>`;

export function buildCharacterReferenceSrcDoc() {
  if (typeof referenceHtml !== "string" || !referenceHtml.trim()) {
    return "<!doctype html><title>Character reference missing</title>";
  }
  if (referenceHtml.includes("</body>")) {
    return referenceHtml.replace("</body>", `${BRIDGE_SCRIPT}\n</body>`);
  }
  return `${referenceHtml}\n${BRIDGE_SCRIPT}`;
}

const PALETTE_VAR_MAP = {
  skin: "--skin-base",
  skinShade: "--skin-shade",
  blush: "--skin-blush",
  hair: "--hair-base",
  hairShade: "--hair-shade",
  hairShine: "--hair-shine",
  outfit: "--outfit-main",
  outfitShade: "--outfit-shade",
  outfitLight: "--outfit-light",
  shirt: "--shirt-base",
  shirtShade: "--shirt-shade",
  eyeTop: "--eye-top",
  eyeMid: "--eye-mid",
  eyeGlow: "--eye-glow",
  ribbon: "--ribbon-accent",
};

const FALLBACK_PALETTE = {
  skin: "#FFF0E6",
  skinShade: "#EDD0C0",
  blush: "#FB7185",
  hair: "#2A3142",
  hairShade: "#181C26",
  hairShine: "#7C89AB",
  outfit: "#1D4ED8",
  outfitShade: "#172554",
  outfitLight: "#3B82F6",
  shirt: "#FFFFFF",
  shirtShade: "#E2E8F0",
  eyeTop: "#1D4ED8",
  eyeMid: "#3B82F6",
  eyeGlow: "#93C5FD",
  ribbon: "#E11D48",
};

export function mapReferencePalette(source = {}) {
  if (source && typeof source === "object" && source.skin) {
    return { ...FALLBACK_PALETTE, ...source };
  }
  const isCssVars = Object.keys(source).some((key) => key.startsWith("--"));
  const palette = {};
  for (const [rigKey, cssKey] of Object.entries(PALETTE_VAR_MAP)) {
    const value = isCssVars ? source[cssKey] : source[cssKey];
    palette[rigKey] = value || FALLBACK_PALETTE[rigKey];
  }
  return palette;
}

function expressionIdFromLabel(label = "") {
  const slug = String(label)
    .toLowerCase()
    .replace(/^\d+[.)\s-]*/, "")
    .replace(/[^a-z]+/g, "_")
    .replace(/^_+|_+$/g, "");
  return EXPRESSIONS.includes(slug) ? slug : "smile";
}

function hairStyleFromLabel(label = "") {
  if (/bun/i.test(label)) return "buns";
  if (/braid|twintail|ponytail/i.test(label)) return "braids";
  return "long";
}

function poseFromReference(state = {}, existingPose = "idle") {
  const legId = state.legPose?.id ?? "";
  const gestureId = state.handGesture?.id ?? "";
  const armText = `${state.armL?.label ?? ""} ${state.armR?.label ?? ""}`;
  if (legId === "action_step") return "walk";
  if (gestureId === "wave" || /wave/i.test(armText)) return "talk";
  if (POSES.includes(existingPose)) return existingPose;
  return "idle";
}

function compactReference(state = {}) {
  return {
    source: CHARACTER_REFERENCE_SOURCE,
    gender: state.gender,
    age: state.age,
    paletteIndex: state.paletteIndex,
    angle: state.angle,
    angleLabel: state.angleLabel,
    expression: state.expression,
    hairIndex: state.hairIndex,
    hairLabel: state.hairLabel,
    armL: state.armL?.label ?? null,
    armR: state.armR?.label ?? null,
    handGesture: state.handGesture?.label ?? null,
    legPose: state.legPose?.label ?? null,
    gaze: state.followMouse ? "cursor" : `${state.gazeX ?? 0},${state.gazeY ?? 0}`,
    footwear: state.shoes ? "loafers" : "barefoot",
    mode: state.paper ? "2d_paper" : "3d",
  };
}

export function mapReferenceStateToCast(state = {}, existing = {}) {
  const paletteSource =
    state.paletteVars && Object.keys(state.paletteVars).length
      ? state.paletteVars
      : state.palettes?.[state.paletteIndex] ?? {};
  const expression = expressionIdFromLabel(state.expression);
  return {
    style: "rig",
    presetId: "cast_custom",
    pixelPreset: existing.pixelPreset ?? "traveler_boy",
    expression,
    pose: poseFromReference(state, existing.pose),
    palette: mapReferencePalette(paletteSource),
    hair: hairStyleFromLabel(state.hairLabel || state.hairLabels?.[state.hairIndex]),
    accessory: "none",
    gender: state.gender ?? "female",
    age: state.age ?? "teenager",
    reference: compactReference(state),
  };
}
