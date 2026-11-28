import {
  createFilmStudioEngine,
  WORLD_SETS,
  CAMERA_PRESETS,
} from "../engine/FilmStudioEngine.js";
import {
  buildPortraitSVG,
  createRig,
  listRigPresets,
  EXPRESSIONS,
  POSES,
} from "../engine/CharacterRig.js";
import {
  PIXEL_PRESETS,
  drawPixelPreview,
} from "../engine/PixelSpriteEngine.js";
import {
  getCharacterCast,
  setCharacterCastSlot,
} from "../state/characterCastStore.js";

const CAST_PRESETS = listRigPresets().filter(
  (preset) => preset.id.startsWith("cast_") || preset.id === "animator_bot",
);

const SPRITE_STYLES = [
  { id: "rig", label: "Cel-shaded Rig" },
  { id: "pixel", label: "Pixel Chibi" },
];

const DEFAULT_CUES = [
  {
    speaker: "HANA",
    actor: "left",
    anim: "talk",
    cam: "wide",
    text: '"Welcome to the Meadow Plaza! Ready to explore?"',
  },
  {
    speaker: "REN",
    actor: "right",
    anim: "cheer",
    cam: "two_shot",
    text: '"Yay! Let\u2019s check out the cottage and trees!"',
  },
  {
    speaker: "HANA",
    actor: "left",
    anim: "walk",
    cam: "low_hero",
    text: '"Follow the stepping stones\u2014sunset looks amazing here!"',
  },
  {
    speaker: "BOTH",
    actor: "both",
    anim: "cheer",
    cam: "diorama",
    text: '"HD-2D adventure unlocked!"',
  },
];

function optionList(items, selected, getValue = (item) => item, getLabel = (item) => item) {
  return items
    .map((item) => {
      const value = getValue(item);
      return `<option value="${value}"${value === selected ? " selected" : ""}>${getLabel(item)}</option>`;
    })
    .join("");
}

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;");
}

function rigInputFor(slot, config) {
  const {
    style: _style,
    pixelPreset: _pixelPreset,
    pose: _pose,
    presetId: _presetId,
    expression: _expression,
    rig,
    ...overrides
  } = config;
  return {
    presetId: config.presetId,
    expression: config.expression,
    facing: slot === "left" ? 1 : -1,
    ...(rig ?? {}),
    ...overrides,
  };
}

function portraitHTML(slot, config) {
  if (config.style === "pixel") {
    return `<canvas class="cast-pixel-preview" data-cast-pixel="${slot}" width="92" height="92" aria-hidden="true"></canvas>`;
  }
  const rig = createRig(rigInputFor(slot, config));
  return buildPortraitSVG(rig, { width: 46, height: 46 });
}

function castSlot(slot, config, label) {
  const isPixel = config.style === "pixel";
  const readoutPreset = isPixel
    ? (PIXEL_PRESETS.find((item) => item.id === config.pixelPreset)?.label ?? "Pixel Chibi")
    : (CAST_PRESETS.find((item) => item.id === config.presetId)?.label ?? "Character");
  return `
    <div class="cast-slot" data-cast-slot="${slot}">
      <div class="cast-slot-head">
        <span class="cast-portrait" data-cast-portrait="${slot}" aria-hidden="true">
          ${portraitHTML(slot, config)}
        </span>
        <div class="cast-slot-copy">
          <strong>${label}</strong>
          <span data-cast-readout="${slot}">${readoutPreset} · ${config.pose}</span>
        </div>
      </div>
      <div class="cast-fields cast-fields--style">
        <label class="field">
          <span>Sprite style</span>
          <select data-cast-style="${slot}">
            ${optionList(SPRITE_STYLES, config.style, (item) => item.id, (item) => item.label)}
          </select>
        </label>
        <label class="field" data-cast-rig-field="${slot}"${isPixel ? " hidden" : ""}>
          <span>Character</span>
          <select data-cast-preset="${slot}">
            ${optionList(CAST_PRESETS, config.presetId, (item) => item.id, (item) => item.label)}
          </select>
        </label>
        <label class="field" data-cast-pixel-field="${slot}"${isPixel ? "" : " hidden"}>
          <span>Pixel preset</span>
          <select data-cast-pixel-preset="${slot}">
            ${optionList(PIXEL_PRESETS, config.pixelPreset, (item) => item.id, (item) => item.label)}
          </select>
        </label>
      </div>
      <div class="cast-fields">
        <label class="field" data-cast-expression-field="${slot}"${isPixel ? " hidden" : ""}>
          <span>Expression</span>
          <select data-cast-expression="${slot}">
            ${optionList(EXPRESSIONS, config.expression)}
          </select>
        </label>
        <label class="field">
          <span>Pose</span>
          <select data-cast-pose="${slot}">
            ${optionList(POSES, config.pose)}
          </select>
        </label>
        <label class="field">
          <span>Flip X</span>
          <select data-cast-flip="${slot}">
            <option value="0">Facing right</option>
            <option value="1">Facing left</option>
          </select>
        </label>
      </div>
      <label class="cast-upload">
        <input type="file" accept="image/png,image/webp" data-cast-upload="${slot}" />
        <span>Upload PNG sprite sheet</span>
      </label>
    </div>
  `;
}

function cueCard(cue, index, isActive) {
  return `
    <div class="cue-card${isActive ? " is-active" : ""}" data-cue-index="${index}">
      <div class="cue-card__row">
        <input class="cue-input cue-input--speaker" data-cue-field="speaker" data-cue-idx="${index}" type="text" value="${escapeHtml(cue.speaker)}" aria-label="Speaker" />
        <select class="cue-input" data-cue-field="actor" data-cue-idx="${index}" aria-label="Actor">
          ${optionList(["left", "right", "both"], cue.actor)}
        </select>
        <select class="cue-input" data-cue-field="anim" data-cue-idx="${index}" aria-label="Animation">
          ${optionList(POSES, cue.anim ?? "talk")}
        </select>
        <select class="cue-input" data-cue-field="cam" data-cue-idx="${index}" aria-label="Camera">
          ${optionList(CAMERA_PRESETS, cue.cam ?? "wide", (item) => item.id, (item) => item.label)}
        </select>
        <button type="button" class="cue-icon-btn" data-cue-preview="${index}" title="Preview line" aria-label="Preview line">▶</button>
        <button type="button" class="cue-icon-btn cue-icon-btn--danger" data-cue-del="${index}" title="Delete line" aria-label="Delete line">✕</button>
      </div>
      <input class="cue-input cue-input--text" data-cue-field="text" data-cue-idx="${index}" type="text" value="${escapeHtml(cue.text)}" aria-label="Dialogue text" />
    </div>
  `;
}

let engine = null;

export function mount(container) {
  const initialCast = getCharacterCast();
  container.innerHTML = `
    <section class="page-heading" aria-labelledby="studio-title">
      <div class="page-heading-copy">
        <span class="eyebrow">Page 02 · Scene direction</span>
        <h1 id="studio-title">Code &amp; Film Studio</h1>
        <p>Set the frame, cast your sprites, and direct a beat-by-beat dialogue skit on the 3D stage.</p>
      </div>
      <div class="ratio-control" role="group" aria-label="Scene frame format">
        <button class="ratio-button" type="button" data-ratio="landscape" aria-pressed="true">16:9 HD-2D</button>
        <button class="ratio-button" type="button" data-ratio="portrait" aria-pressed="false">9:16 Reels</button>
      </div>
    </section>

    <div class="studio-grid">
      <section class="card stage-card" aria-labelledby="scene-title">
        <div class="stage-card-header">
          <div class="stage-header-copy">
            <strong id="scene-title">Scene viewport</strong>
            <span data-scene-caption>Meadow Plaza · Wide</span>
          </div>
          <div class="stage-header-actions">
            <div class="stage-zoom-controls" role="group" aria-label="Camera zoom">
              <button class="zoom-button" type="button" data-zoom="in" title="Zoom in (+)">+</button>
              <button class="zoom-button" type="button" data-zoom="out" title="Zoom out (−)">−</button>
              <button class="zoom-button zoom-button-reset" type="button" data-zoom="reset" title="Reset zoom">Reset</button>
            </div>
            <span class="stage-label" data-frame-label>16:9 · HD-2D</span>
          </div>
        </div>
        <div class="stage-art studio-art" data-frame="landscape">
          <div class="film-stage" data-film-stage data-frame="landscape">
            <span class="film-stage-hud"><span class="status-dot" aria-hidden="true"></span>HD-2D preview</span>
            <span class="film-stage-aspect">16:9</span>
          </div>
        </div>
        <div class="stage-footer">
          <span class="stage-tag">animation-scenes/</span>
          <span class="stage-tag">NearestFilter sprites</span>
          <span class="stage-tag">renderFrame(t) ready</span>
        </div>
      </section>

      <div class="stack">
        <section class="card panel-card" aria-labelledby="scene-setup-title">
          <div class="card-heading">
            <div>
              <h2 id="scene-setup-title">Scene setup</h2>
              <p>Keep the key pieces of a shot together.</p>
            </div>
          </div>
          <div class="control-list">
            <label class="control-row">
              <span>World set</span>
              <select class="control-select" data-world-select>
                ${optionList(WORLD_SETS, "meadow", (item) => item.id, (item) => item.label)}
              </select>
            </label>
            <label class="control-row">
              <span>Camera preset</span>
              <select class="control-select" data-camera-select>
                ${optionList(CAMERA_PRESETS, "wide", (item) => item.id, (item) => item.label)}
              </select>
            </label>
            <div class="control-row"><span>Output frame</span><strong data-frame-value>16:9 HD-2D</strong></div>
          </div>
          <div class="overlay-toggles" role="group" aria-label="Viewport overlays">
            <button type="button" class="overlay-toggle" data-overlay="crt" aria-pressed="true">CRT scanlines</button>
            <button type="button" class="overlay-toggle" data-overlay="subtitles" aria-pressed="true">Subtitles</button>
            <button type="button" class="overlay-toggle" data-overlay="hud" aria-pressed="true">HUD badges</button>
          </div>
        </section>

        <section class="card panel-card" aria-labelledby="cast-title">
          <div class="card-heading">
            <div>
              <h2 id="cast-title">Sprite cast</h2>
              <p>Two character slots for your scene.</p>
            </div>
          </div>
          <div class="cast-stack">
            ${castSlot("left", initialCast.left, "Left cast")}
            ${castSlot("right", initialCast.right, "Right cast")}
          </div>
        </section>

        <section class="card panel-card" aria-labelledby="dialogue-title">
          <div class="card-heading">
            <div>
              <h2 id="dialogue-title">Dialogue cues</h2>
              <p>Beat-by-beat lines that drive pose, speaker, and camera.</p>
            </div>
            <button type="button" class="cue-add-btn" data-add-cue>+ Add Line</button>
          </div>
          <div class="cue-list" data-cue-list>
            ${DEFAULT_CUES.map((cue, index) => cueCard(cue, index, index === 0)).join("")}
          </div>
          <div class="cue-status" data-cue-status>Ready · ${DEFAULT_CUES.length} lines · Space: Play/Pause</div>
        </section>
      </div>
    </div>

    <footer class="page-footer">
      <span>Scene work stays separate from the Virtual Office pipeline.</span>
      <span>Rendering is not enabled in this phase.</span>
    </footer>
  `;

  const stage = container.querySelector("[data-film-stage]");
  const art = container.querySelector(".studio-art");
  const sceneCaption = container.querySelector("[data-scene-caption]");
  const ratioButtons = container.querySelectorAll("[data-ratio]");
  const frameLabels = container.querySelectorAll("[data-frame-label], [data-frame-value], .film-stage-aspect");
  const worldSelect = container.querySelector("[data-world-select]");
  const cameraSelect = container.querySelector("[data-camera-select]");

  const cast = {
    left: { ...initialCast.left },
    right: { ...initialCast.right },
  };
  const cues = DEFAULT_CUES.map((cue) => ({ ...cue }));
  const overlayState = { crt: true, subtitles: true, hud: true };

  engine = createFilmStudioEngine({
    container: stage,
    world: "meadow",
    camera: "wide",
    cast,
    onChange: (change) => {
      if (change.world) {
        worldSelect.value = change.world;
        updateCaption();
      }
      if (change.camera) {
        cameraSelect.value = change.camera;
        updateCaption();
      }
    },
    onSkit: (state) => {
      const status = container.querySelector("[data-cue-status]");
      if (status) {
        status.textContent = state.playing
          ? `Playing cue ${state.cueIndex + 1}/${cues.length} · ${state.speaker || "NARRATOR"}`
          : `Ready · ${cues.length} lines · Space: Play/Pause`;
      }
      for (const card of container.querySelectorAll("[data-cue-index]")) {
        const idx = Number(card.dataset.cueIndex);
        const isActive = state.playing && idx === state.cueIndex - 1;
        card.classList.toggle("is-active", isActive);
      }
    },
  });
  engine.setCues(cues);
  engine.previewCue(0);

  function updateCaption() {
    const world = WORLD_SETS.find((item) => item.id === worldSelect.value);
    const camera = CAMERA_PRESETS.find((item) => item.id === cameraSelect.value);
    sceneCaption.textContent = `${world.label} · ${camera.label}`;
  }

  const onWorldChange = () => {
    engine.setWorld(worldSelect.value);
    updateCaption();
  };
  const onCameraChange = () => {
    engine.setCamera(cameraSelect.value);
    updateCaption();
  };
  worldSelect.addEventListener("change", onWorldChange);
  cameraSelect.addEventListener("change", onCameraChange);

  const onRatioChange = (event) => {
    const selected = event.currentTarget.dataset.ratio;
    const isPortrait = selected === "portrait";
    for (const button of ratioButtons) {
      button.setAttribute("aria-pressed", String(button === event.currentTarget));
    }
    for (const label of frameLabels) {
      if (label.classList.contains("film-stage-aspect")) {
        label.textContent = isPortrait ? "9:16" : "16:9";
      } else {
        label.textContent = isPortrait ? "9:16 Reels" : "16:9 HD-2D";
      }
    }
    art.dataset.frame = selected;
    stage.dataset.frame = selected;
    // Portrait reels default to the intimate two-shot; landscape returns wide.
    const nextCamera = isPortrait ? "two_shot" : "wide";
    engine.setCamera(nextCamera);
    cameraSelect.value = nextCamera;
    updateCaption();
  };
  for (const button of ratioButtons) button.addEventListener("click", onRatioChange);

  const onZoomClick = (event) => {
    const action = event.currentTarget.dataset.zoom;
    if (action === "in") engine.zoomIn();
    else if (action === "out") engine.zoomOut();
    else if (action === "reset") engine.resetZoom();
  };
  for (const button of container.querySelectorAll("[data-zoom]")) {
    button.addEventListener("click", onZoomClick);
  }

  function refreshSlot(slot) {
    const config = cast[slot];
    const portrait = container.querySelector(`[data-cast-portrait="${slot}"]`);
    if (portrait) {
      portrait.innerHTML = portraitHTML(slot, config);
      const pixelCanvas = portrait.querySelector("[data-cast-pixel]");
      if (pixelCanvas) {
        drawPixelPreview(config.pixelPreset, config.pose, 0, pixelCanvas);
      }
    }
    const readout = container.querySelector(`[data-cast-readout="${slot}"]`);
    if (readout) {
      const presetLabel = config.style === "pixel"
        ? (PIXEL_PRESETS.find((item) => item.id === config.pixelPreset)?.label ?? "Pixel Chibi")
        : (CAST_PRESETS.find((item) => item.id === config.presetId)?.label ?? "Character");
      readout.textContent = `${presetLabel} · ${config.pose}`;
    }
  }

  function syncCastFields(slot) {
    const config = cast[slot];
    const isPixel = config.style === "pixel";
    const rigField = container.querySelector(`[data-cast-rig-field="${slot}"]`);
    const pixelField = container.querySelector(`[data-cast-pixel-field="${slot}"]`);
    const expressionField = container.querySelector(`[data-cast-expression-field="${slot}"]`);
    if (rigField) rigField.hidden = isPixel;
    if (pixelField) pixelField.hidden = !isPixel;
    if (expressionField) expressionField.hidden = isPixel;
    const styleSelect = container.querySelector(`[data-cast-style="${slot}"]`);
    if (styleSelect) styleSelect.value = config.style;
    const presetSelect = container.querySelector(`[data-cast-preset="${slot}"]`);
    if (presetSelect) presetSelect.value = config.presetId;
    const pixelSelect = container.querySelector(`[data-cast-pixel-preset="${slot}"]`);
    if (pixelSelect) pixelSelect.value = config.pixelPreset;
    const expressionSelect = container.querySelector(`[data-cast-expression="${slot}"]`);
    if (expressionSelect) expressionSelect.value = config.expression;
    const poseSelect = container.querySelector(`[data-cast-pose="${slot}"]`);
    if (poseSelect) poseSelect.value = config.pose;
  }

  const onCastChange = (event) => {
    const field = event.target.closest(
      "[data-cast-style], [data-cast-preset], [data-cast-pixel-preset], [data-cast-expression], [data-cast-pose], [data-cast-flip]",
    );
    if (!field) return;
    const slot =
      field.dataset.castStyle ??
      field.dataset.castPreset ??
      field.dataset.castPixelPreset ??
      field.dataset.castExpression ??
      field.dataset.castPose ??
      field.dataset.castFlip;
    if (!slot) return;

    if (field.dataset.castStyle) cast[slot].style = field.value;
    if (field.dataset.castPreset) cast[slot].presetId = field.value;
    if (field.dataset.castPixelPreset) cast[slot].pixelPreset = field.value;
    if (field.dataset.castExpression) cast[slot].expression = field.value;
    if (field.dataset.castPose) cast[slot].pose = field.value;

    engine.setCast(slot, cast[slot]);
    if (field.dataset.castFlip) {
      engine.setActorTransform(slot, { flipX: field.value === "1" });
    }
    setCharacterCastSlot(slot, { ...cast[slot] });
    syncCastFields(slot);
    refreshSlot(slot);
  };
  const castStack = container.querySelector(".cast-stack");
  castStack.addEventListener("change", onCastChange);

  const onUpload = (event) => {
    const input = event.target.closest("[data-cast-upload]");
    if (!input || !input.files?.length) return;
    const slot = input.dataset.castUpload;
    const reader = new FileReader();
    reader.onload = () => {
      const image = new Image();
      image.onload = () => {
        engine.loadSpriteSheet(slot, image, 4);
        const readout = container.querySelector(`[data-cast-readout="${slot}"]`);
        if (readout) readout.textContent = "Custom sprite sheet · 4 frames";
      };
      image.src = reader.result;
    };
    reader.readAsDataURL(input.files[0]);
  };
  castStack.addEventListener("change", onUpload);

  // ---------------------------------------------------------- cue list editor
  const cueList = container.querySelector("[data-cue-list]");
  const cueStatus = container.querySelector("[data-cue-status]");

  function renderCueList() {
    const state = engine.getSkitState();
    cueList.innerHTML = cues.map((cue, index) => cueCard(cue, index, state.playing && index === state.cueIndex - 1)).join("");
  }

  const onCueInput = (event) => {
    const input = event.target.closest("[data-cue-field]");
    if (!input) return;
    const index = Number(input.dataset.cueIdx);
    const field = input.dataset.cueField;
    if (!cues[index]) return;
    cues[index][field] = input.value;
    engine.setCues(cues);
  };

  const onCueAction = (event) => {
    const previewBtn = event.target.closest("[data-cue-preview]");
    if (previewBtn) {
      engine.previewCue(Number(previewBtn.dataset.cuePreview));
      return;
    }
    const delBtn = event.target.closest("[data-cue-del]");
    if (delBtn && cues.length > 1) {
      cues.splice(Number(delBtn.dataset.cueDel), 1);
      engine.setCues(cues);
      engine.resetStage();
      renderCueList();
    }
  };

  const onAddCue = () => {
    cues.push({
      speaker: "NARRATOR",
      actor: "both",
      anim: "talk",
      cam: "two_shot",
      text: '"New dialogue line!"',
    });
    engine.setCues(cues);
    renderCueList();
    if (cueStatus) cueStatus.textContent = `Ready · ${cues.length} lines · Space: Play/Pause`;
  };

  cueList.addEventListener("input", onCueInput);
  cueList.addEventListener("click", onCueAction);
  container.querySelector("[data-add-cue]").addEventListener("click", onAddCue);

  const onSpaceToggle = (event) => {
    if (event.code !== "Space") return;
    const tag = event.target.tagName;
    if (tag === "INPUT" || tag === "SELECT" || tag === "TEXTAREA") return;
    event.preventDefault();
    const state = engine.getSkitState();
    if (state.playing) engine.stopSkit();
    else engine.playSkit();
  };
  window.addEventListener("keydown", onSpaceToggle);

  // ------------------------------------------------------------- overlay toggles
  const onOverlayToggle = (event) => {
    const button = event.target.closest("[data-overlay]");
    if (!button) return;
    const key = button.dataset.overlay;
    overlayState[key] = !overlayState[key];
    button.setAttribute("aria-pressed", String(overlayState[key]));
    button.classList.toggle("is-off", !overlayState[key]);
    engine.setOverlay(overlayState);
  };
  container.querySelector(".overlay-toggles").addEventListener("click", onOverlayToggle);

  engine.__pageCleanup = () => {
    worldSelect.removeEventListener("change", onWorldChange);
    cameraSelect.removeEventListener("change", onCameraChange);
    for (const button of ratioButtons) button.removeEventListener("click", onRatioChange);
    castStack.removeEventListener("change", onCastChange);
    castStack.removeEventListener("change", onUpload);
    cueList.removeEventListener("input", onCueInput);
    cueList.removeEventListener("click", onCueAction);
    container.querySelector("[data-add-cue]").removeEventListener("click", onAddCue);
    window.removeEventListener("keydown", onSpaceToggle);
    container.querySelector(".overlay-toggles").removeEventListener("click", onOverlayToggle);
  };
}

export function unmount() {
  if (!engine) return;
  engine.__pageCleanup?.();
  engine.dispose();
  engine = null;
}
