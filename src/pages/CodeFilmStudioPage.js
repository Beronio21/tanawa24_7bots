let removeRatioListeners = () => {};

export function mount(container) {
  container.innerHTML = `
    <section class="page-heading" aria-labelledby="studio-title">
      <div class="page-heading-copy">
        <span class="eyebrow">Page 02 · Scene direction</span>
        <h1 id="studio-title">Code &amp; Film Studio</h1>
        <p>Set the frame, cast your sprites, and prepare a scene for a small world with a big story.</p>
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
            <span>Compose the world before you film it</span>
          </div>
          <span class="stage-label" data-frame-label>16:9 · HD-2D</span>
        </div>
        <div class="stage-art studio-art" data-frame="landscape">
          <div class="stage-scene" data-studio-stage>
            <div class="scene-orbit" aria-hidden="true"></div>
            <div class="scene-copy">
              <span class="decorative-icon" aria-hidden="true">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="m3 16 6-7 4 4 3-5 5 8H3Z"/><circle cx="8" cy="6" r="1.5"/></svg>
              </span>
              <h3>A new scene starts here</h3>
              <p>Your world set will appear in this space when scene building is available.</p>
            </div>
          </div>
        </div>
        <div class="stage-footer">
          <span class="stage-tag">animation-scenes/</span>
          <span class="stage-tag">Pixel crisp pipeline planned</span>
          <span class="stage-tag">Preview only</span>
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
            <div class="control-row"><span>World set</span><strong>Not selected</strong></div>
            <div class="control-row"><span>Camera preset</span><strong>Not selected</strong></div>
            <div class="control-row"><span>Output frame</span><strong data-frame-value>16:9 HD-2D</strong></div>
          </div>
        </section>

        <section class="card panel-card" aria-labelledby="cast-title">
          <div class="card-heading">
            <div>
              <h2 id="cast-title">Sprite cast</h2>
              <p>Two character slots for your scene.</p>
            </div>
          </div>
          <div class="slot-grid">
            <div class="sprite-slot" data-sprite-slot="left">
              <span class="sprite-swatch" aria-hidden="true"></span>
              <strong>Left sprite</strong>
              <span>Waiting for a sprite sheet</span>
            </div>
            <div class="sprite-slot" data-sprite-slot="right">
              <span class="sprite-swatch" aria-hidden="true"></span>
              <strong>Right sprite</strong>
              <span>Waiting for a sprite sheet</span>
            </div>
          </div>
        </section>

        <section class="card panel-card" aria-labelledby="dialogue-title">
          <div class="card-heading">
            <div>
              <h2 id="dialogue-title">Dialogue cues</h2>
              <p>Plan the lines that guide the performance.</p>
            </div>
          </div>
          <div class="cue-empty">No dialogue cues yet. Scene scripting and VoiceStudio playback are planned for a later phase.</div>
        </section>
      </div>
    </div>

    <footer class="page-footer">
      <span>Scene work stays separate from the Virtual Office pipeline.</span>
      <span>Rendering is not enabled in this phase.</span>
    </footer>
  `;

  const buttons = container.querySelectorAll("[data-ratio]");
  const frameLabels = container.querySelectorAll("[data-frame-label], [data-frame-value]");
  const stage = container.querySelector(".studio-art");
  const onRatioChange = (event) => {
    const selected = event.currentTarget.dataset.ratio;
    const isPortrait = selected === "portrait";
    for (const button of buttons) {
      button.setAttribute("aria-pressed", String(button === event.currentTarget));
    }
    for (const label of frameLabels) {
      label.textContent = isPortrait ? "9:16 Reels" : "16:9 HD-2D";
    }
    stage.dataset.frame = selected;
  };

  for (const button of buttons) {
    button.addEventListener("click", onRatioChange);
  }

  removeRatioListeners = () => {
    for (const button of buttons) {
      button.removeEventListener("click", onRatioChange);
    }
  };
}

export function unmount() {
  removeRatioListeners();
  removeRatioListeners = () => {};
}
