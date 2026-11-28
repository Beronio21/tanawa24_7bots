import {
  createVirtualOfficeEngine,
  listOfficeBots,
  OFFICE_ROOMS,
} from "../engine/VirtualOfficeEngine.js";

const icons = {
  folder:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M3 6.5A1.5 1.5 0 0 1 4.5 5h5l2 2h8A1.5 1.5 0 0 1 21 8.5v9a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 17.5z"/></svg>',
};

const folders = [
  {
    name: "animation-scenes/",
    detail: "Story scripts, scene manifests, and locked cast sprites.",
  },
  {
    name: "voiceovers/",
    detail: "VoiceStudio :3900 dialogue lines, cached per story beat.",
  },
  {
    name: "rendered-animations/",
    detail: "Headless Playwright + FFmpeg MP4 masters, 16:9 or 9:16.",
  },
];

let engine = null;

export function mount(container) {
  const bots = listOfficeBots();

  container.innerHTML = `
    <section class="page-heading" aria-labelledby="anim-office-title">
      <div class="page-heading-copy">
        <span class="eyebrow">Video Animation · CCTV floor</span>
        <h1 id="anim-office-title">Animation Studio Cam</h1>
        <p>Watch every angle of your 2.5D set, from the world plate to each character cue, while a scene renders.</p>
      </div>
      <span class="status-pill"><span class="status-dot" aria-hidden="true"></span>Studio standing by</span>
    </section>

    <div class="anim-office-grid">
      <section class="card stage-card" aria-labelledby="anim-floor-title">
        <div class="stage-card-header">
          <div class="stage-header-copy">
            <strong id="anim-floor-title">Production floor</strong>
            <span data-room-caption>ANIMATION STUDIO · Animator Bot at the dual-monitor desk</span>
          </div>
          <span class="stage-label">Live CCTV</span>
        </div>

        <div class="anim-single" data-anim-engine>
          <div class="anim-single__screen" data-anim-screen>
            <span class="anim-single__badge" data-room-badge>CAM 01 · Animation Studio</span>
            <span class="anim-single__osd"><span class="status-dot" aria-hidden="true"></span>LIVE · 1080p</span>
            <span class="anim-single__frame">FRAME <strong data-frame-count>142</strong>/300</span>
          </div>
        </div>

        <div class="anim-room-strip" role="group" aria-label="Camera room">
          ${OFFICE_ROOMS.map(
            (room, index) => `
              <button class="anim-room-button" type="button" data-anim-room="${room.key}" aria-pressed="${index === 0}">
                <span>CAM 0${index + 1}</span>
                <strong>${room.label}</strong>
              </button>
            `,
          ).join("")}
        </div>

        <div class="stage-footer" aria-label="Animation pipeline folders">
          <span class="stage-tag">animation-scenes/</span>
          <span class="stage-tag">voiceovers/</span>
          <span class="stage-tag">rendered-animations/</span>
        </div>
      </section>

      <div class="stack">
        <section class="card panel-card" aria-labelledby="anim-pipeline-title">
          <div class="card-heading">
            <div>
              <h2 id="anim-pipeline-title">Scene render pipeline</h2>
              <p>Each beat advances the choreography, never the world.</p>
            </div>
          </div>
          <ol class="pipeline-list">
            <li class="pipeline-step">
              <span class="step-number">01</span>
              <span><strong>Bind the scene manifest</strong><span>Lock the 3D world, lighting, and Left/Right sprites.</span></span>
            </li>
            <li class="pipeline-step">
              <span class="step-number">02</span>
              <span><strong>Voice and choreograph</strong><span>Generate VoiceStudio lines and movement cues.</span></span>
            </li>
            <li class="pipeline-step">
              <span class="step-number">03</span>
              <span><strong>Render the film</strong><span>Step frames into FFmpeg with beat-synced SFX.</span></span>
            </li>
          </ol>
        </section>

        <section class="card panel-card" aria-labelledby="anim-queue-title">
          <div class="card-heading">
            <div>
              <h2 id="anim-queue-title">Render queue</h2>
              <p>Sequential overnight jobs, one scene at a time.</p>
            </div>
            <span class="status-pill">Idle</span>
          </div>
          <div class="cue-empty">No animation jobs queued yet. Rendering is not enabled in this phase.</div>
        </section>
      </div>
    </div>

    <section class="card panel-card section-gap" aria-labelledby="anim-folders-title">
      <div class="card-heading">
        <div>
          <h2 id="anim-folders-title">Animation asset folders</h2>
          <p>Everything a scene needs stays in the project folder.</p>
        </div>
      </div>
      <div class="anim-folder-grid">
        ${folders
          .map(
            ({ name, detail }) => `
              <div class="folder-card">
                <span class="status-icon">${icons.folder}</span>
                <div>
                  <strong>${name}</strong>
                  <p>${detail}</p>
                </div>
              </div>
            `,
          )
          .join("")}
      </div>
    </section>

    <section class="card telemetry-card" aria-labelledby="anim-telemetry-title">
      <div class="card-heading">
        <div>
          <h2 id="anim-telemetry-title">Live animation activity</h2>
          <p>Worker updates will stream here while a scene renders.</p>
        </div>
        <span class="status-pill">Waiting for first scene</span>
      </div>
      <div class="telemetry-empty" role="status">
        <span class="status-dot" aria-hidden="true"></span>
        Nothing is rendering right now. The animation floor is on standby.
      </div>
    </section>

    <footer class="page-footer">
      <span>Characters and worlds stay locked from hook to CTA.</span>
      <span>Rendering and publishing arrive in a later phase.</span>
    </footer>
  `;

  const screen = container.querySelector("[data-anim-screen]");
  const caption = container.querySelector("[data-room-caption]");
  const badge = container.querySelector("[data-room-badge]");
  const frameCount = container.querySelector("[data-frame-count]");
  const roomButtons = container.querySelectorAll("[data-anim-room]");

  engine = createVirtualOfficeEngine({
    container: screen,
    view: "single",
    room: "animation",
    onRoomFocus: () => {},
  });

  const selectRoom = (key) => {
    engine.setRoom(key);
    const room = OFFICE_ROOMS.find((item) => item.key === key);
    const bot = bots.find((item) => item.cam === key);
    badge.textContent = `CAM 0${OFFICE_ROOMS.findIndex((item) => item.key === key) + 1} · ${room.label}`;
    caption.textContent = `${room.label.toUpperCase()} · ${bot ? `${bot.label} on camera` : "Room overview"}`;
    for (const button of roomButtons) {
      button.setAttribute("aria-pressed", String(button.dataset.animRoom === key));
    }
  };

  const onRoomClick = (event) => selectRoom(event.currentTarget.dataset.animRoom);
  for (const button of roomButtons) button.addEventListener("click", onRoomClick);

  // Live render frame counter for the OSD
  let frame = 142;
  const timer = window.setInterval(() => {
    frame = frame >= 300 ? 1 : frame + 1;
    frameCount.textContent = String(frame);
  }, 900);

  engine.__pageCleanup = () => {
    window.clearInterval(timer);
    for (const button of roomButtons) button.removeEventListener("click", onRoomClick);
  };
}

export function unmount() {
  if (!engine) return;
  engine.__pageCleanup?.();
  engine.dispose();
  engine = null;
}
