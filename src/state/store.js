const STUDIO_MODES = {
  video_editor: {
    id: "video_editor",
    label: "Video Editor",
    defaultRoute: "office",
    navLabel: "Workspace · Video Editor",
    noteTitle: "Raw clips, calmly finished",
    noteBody:
      "Trim recordings, add captions and covers, then hand each cut to the publish queue on this device.",
  },
  video_animation: {
    id: "video_animation",
    label: "Video Animation",
    defaultRoute: "studio",
    navLabel: "Workspace · Video Animation",
    noteTitle: "Stories, frame by frame",
    noteBody:
      "Direct a locked world and cast, then render beat-synced HD-2D scenes with local voices and sound.",
  },
};

export const DEFAULT_STUDIO_MODE = "video_editor";

/**
 * Routes that belong to exactly one studio mode. Shared routes
 * (#queue, #settings) map to null so they work in both modes.
 */
const ROUTE_MODES = {
  office: "video_editor",
  studio: "video_animation",
  "anim-office": "video_animation",
  "character-rig": "video_animation",
  queue: null,
  settings: null,
};

let studioMode = DEFAULT_STUDIO_MODE;
const listeners = new Set();

export function listStudioModes() {
  return Object.values(STUDIO_MODES).map((mode) => ({ ...mode }));
}

export function isStudioMode(value) {
  return Object.hasOwn(STUDIO_MODES, value);
}

export function getStudioMode() {
  return studioMode;
}

export function getStudioModeConfig(mode = studioMode) {
  return STUDIO_MODES[mode] ?? STUDIO_MODES[DEFAULT_STUDIO_MODE];
}

export function getDefaultRoute(mode = studioMode) {
  return getStudioModeConfig(mode).defaultRoute;
}

export function getModeForRoute(route) {
  return ROUTE_MODES[route] ?? null;
}

export function setStudioMode(mode) {
  if (!isStudioMode(mode) || mode === studioMode) return studioMode;

  studioMode = mode;
  for (const listener of listeners) listener(studioMode);
  return studioMode;
}

export function subscribeStudioMode(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}
