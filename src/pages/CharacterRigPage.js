import {
  CHARACTER_REFERENCE_SOURCE,
  buildCharacterReferenceSrcDoc,
  mapReferenceStateToCast,
} from "../engine/CharacterRigReference.js";
import {
  getCharacterCast,
  setCharacterCastSlot,
} from "../state/characterCastStore.js";

let cleanup = null;

function field(label, value) {
  return `<div class="rig-readout"><span>${label}</span><strong>${value}</strong></div>`;
}

function stateSummary(state) {
  if (!state?.ready) {
    return `
      ${field("Source", CHARACTER_REFERENCE_SOURCE)}
      ${field("Status", "Waiting for rig bridge…")}
    `;
  }
  return `
    ${field("Source", CHARACTER_REFERENCE_SOURCE)}
    ${field("Build", `${state.gender ?? "—"} · ${state.age ?? "—"}`)}
    ${field("Camera", state.angleLabel || state.angle || "—")}
    ${field("Expression", state.expression || "—")}
    ${field("Hair", state.hairLabel || "—")}
    ${field("Palette", `#${String(state.paletteIndex ?? 0).padStart(2, "0")}`)}
    ${field("Limbs", `${state.armL?.label ?? "—"} / ${state.legPose?.label ?? "—"}`)}
    ${field("Mode", state.paper ? "2D paper cutout" : "3D materialized")}
  `;
}

export function mount(container) {
  container.innerHTML = `
    <section class="page-heading" aria-labelledby="character-rig-title">
      <div class="page-heading-copy">
        <span class="eyebrow">Video Animation · Character rig</span>
        <h1 id="character-rig-title">Character Rig</h1>
        <p>Drive the FK perspective rig, then push its look into the Code &amp; Film Studio cast.</p>
      </div>
      <span class="status-pill"><span class="status-dot" aria-hidden="true"></span>Reference live</span>
    </section>

    <div class="studio-grid">
      <section class="card stage-card" aria-labelledby="rig-stage-title">
        <div class="stage-card-header">
          <div class="stage-header-copy">
            <strong id="rig-stage-title">FK perspective rig</strong>
            <span data-rig-caption>${CHARACTER_REFERENCE_SOURCE} · gender, age, angle, limbs, gaze, palette</span>
          </div>
          <span class="stage-label">Live reference</span>
        </div>
        <div class="stage-art character-rig-stage">
          <iframe
            class="character-rig-frame"
            data-rig-frame
            title="Character reference rig"
            sandbox="allow-scripts"
            referrerpolicy="no-referrer"
          ></iframe>
        </div>
        <div class="stage-footer">
          <span class="stage-tag">character.html</span>
          <span class="stage-tag">postMessage bridge</span>
          <span class="stage-tag">cast sync ready</span>
        </div>
      </section>

      <div class="stack">
        <section class="card panel-card" aria-labelledby="rig-sync-title">
          <div class="card-heading">
            <div>
              <h2 id="rig-sync-title">Cast sync</h2>
              <p>Apply the current reference look to the studio's Left or Right sprite slot.</p>
            </div>
          </div>
          <div class="rig-readout-list" data-rig-state>
            ${stateSummary(null)}
          </div>
          <div class="rig-apply-row" role="group" aria-label="Apply rig to cast">
            <button type="button" class="rig-apply-btn" data-apply-cast="left">Apply to Left Cast</button>
            <button type="button" class="rig-apply-btn" data-apply-cast="right">Apply to Right Cast</button>
            <button type="button" class="rig-apply-btn rig-apply-btn--both" data-apply-cast="both">Apply to Both</button>
          </div>
          <div class="cue-status" data-rig-status>Waiting for the reference rig state…</div>
        </section>

        <section class="card panel-card" aria-labelledby="rig-notes-title">
          <div class="card-heading">
            <div>
              <h2 id="rig-notes-title">Sync notes</h2>
              <p>What carries into the HD-2D stage.</p>
            </div>
          </div>
          <ul class="rig-note-list">
            <li>Palette CSS variables map into the cel-shaded rig colors.</li>
            <li>Reference expressions map to studio expressions; new labels fall back cleanly.</li>
            <li>Hair labels map to the nearest rig hair style and stay recorded in cast metadata.</li>
            <li>FK limb poses preview in the reference; the stage keeps idle/talk/walk/cheer animation.</li>
          </ul>
        </section>
      </div>
    </div>

    <footer class="page-footer">
      <span>Replacing docs/references/character.html refreshes this rig on the next build.</span>
      <span>Code &amp; Film Studio reads the same shared cast store.</span>
    </footer>
  `;

  const frame = container.querySelector("[data-rig-frame]");
  const stateBox = container.querySelector("[data-rig-state]");
  const statusBox = container.querySelector("[data-rig-status]");
  const applyButtons = container.querySelectorAll("[data-apply-cast]");
  let latestState = null;
  let disposed = false;

  const requestState = () => {
    frame.contentWindow?.postMessage({ type: "tanawa-character-rig", command: "state" }, "*");
  };

  const onFrameLoad = () => {
    frame.contentWindow?.postMessage({ type: "tanawa-character-rig", command: "state" }, "*");
  };
  frame.addEventListener("load", onFrameLoad);
  frame.srcdoc = buildCharacterReferenceSrcDoc();

  const onMessage = (event) => {
    if (disposed) return;
    const data = event.data;
    if (!data || data.type !== "tanawa-character-rig" || !data.ready) return;
    latestState = data;
    stateBox.innerHTML = stateSummary(data);
    statusBox.textContent = "Reference state received. Apply it to a cast slot when ready.";
  };
  window.addEventListener("message", onMessage);

  const onApply = (event) => {
    const target = event.currentTarget.dataset.applyCast;
    if (!latestState?.ready) {
      statusBox.textContent = "Waiting for the reference rig state…";
      return;
    }
    const current = getCharacterCast();
    const targets = target === "both" ? ["left", "right"] : [target];
    const applied = [];
    for (const slot of targets) {
      const mapped = mapReferenceStateToCast(latestState, current[slot] ?? {});
      setCharacterCastSlot(slot, mapped);
      applied.push(`${slot === "left" ? "Left" : "Right"} Cast`);
    }
    statusBox.textContent = `Applied ${applied.join(" + ")} · ${latestState.expression || "custom expression"} · palette #${String(latestState.paletteIndex ?? 0).padStart(2, "0")}`;
  };
  for (const button of applyButtons) button.addEventListener("click", onApply);

  cleanup = () => {
    disposed = true;
    window.removeEventListener("message", onMessage);
    frame.removeEventListener("load", onFrameLoad);
    for (const button of applyButtons) button.removeEventListener("click", onApply);
  };
}

export function unmount() {
  cleanup?.();
  cleanup = null;
}
