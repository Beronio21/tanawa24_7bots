const clone = (value) => {
  if (typeof structuredClone === "function") return structuredClone(value);
  return JSON.parse(JSON.stringify(value));
};

export const CHARACTER_CAST_DEFAULTS = {
  left: {
    style: "rig",
    presetId: "cast_hana",
    pixelPreset: "traveler_boy",
    expression: "happy",
    pose: "idle",
  },
  right: {
    style: "rig",
    presetId: "cast_ren",
    pixelPreset: "traveler_girl",
    expression: "smile",
    pose: "talk",
  },
};

let characterCast = {
  left: { ...CHARACTER_CAST_DEFAULTS.left },
  right: { ...CHARACTER_CAST_DEFAULTS.right },
};
const listeners = new Set();

function notify() {
  for (const listener of listeners) listener(getCharacterCast());
}

export function getCharacterCast() {
  return clone(characterCast);
}

export function setCharacterCastSlot(slot, config = {}) {
  if (!characterCast[slot]) return null;
  characterCast[slot] = { ...characterCast[slot], ...clone(config) };
  notify();
  return getCharacterCast()[slot];
}

export function resetCharacterCast() {
  characterCast = {
    left: { ...CHARACTER_CAST_DEFAULTS.left },
    right: { ...CHARACTER_CAST_DEFAULTS.right },
  };
  notify();
  return getCharacterCast();
}

export function subscribeCharacterCast(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
