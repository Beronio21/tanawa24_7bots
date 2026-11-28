import {
  createVirtualOfficeEngine,
  listOfficeBots,
  OFFICE_ROOMS,
} from "../engine/VirtualOfficeEngine.js";
import { buildPortraitSVG } from "../engine/CharacterRig.js";

const icons = {
  folder:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M3 6.5A1.5 1.5 0 0 1 4.5 5h5l2 2h8A1.5 1.5 0 0 1 21 8.5v9a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 17.5z"/></svg>',
};

const ROOM_META = {
  animation: { badge: "CAM 01 · Render", detail: "Animator Bot · playwright frames" },
  writer: { badge: "CAM 02 · Scripts", detail: "Writer & Scheduler · queue 14" },
  manager: { badge: "CAM 03 · QA", detail: "Manager Bot · review pass" },
  editing: { badge: "CAM 04 · Trim", detail: "Editor Bot · FFmpeg hardware cut" },
  coffee: { badge: "CAM 05 · Break", detail: "Off-duty Bot · coffee area" },
  broadcast: { badge: "CAM 06 · Publish", detail: "Posting Bot · tanawa.app CTA" },
};

const heroRoom = "animation";

function camTile(room) {
  const meta = ROOM_META[room.key] ?? { badge: "CAM", detail: room.label };
  return `
    <article class="office-cam${room.key === heroRoom ? " office-cam--hero" : ""}" data-cam="${room.key}" tabindex="0" role="button" aria-label="Focus ${room.label} camera">
      <div class="office-cam__feed" data-cam-feed>
        <span class="office-cam__badge">${meta.badge}</span>
        <span class="office-cam__live"><span class="status-dot" aria-hidden="true"></span>Live</span>
      </div>
      <div class="office-cam__meta">
        <strong>${room.label}</strong>
        <span>${meta.detail}</span>
      </div>
    </article>
  `;
}

function roster(bots) {
  return bots
    .map(
      (bot) => `
        <div class="office-roster-card" data-roster-bot="${bot.id}">
          <span class="office-roster-portrait" aria-hidden="true">${buildPortraitSVG(bot.rig, { width: 54, height: 54 })}</span>
          <span class="office-roster-name">${bot.label}</span>
          <span class="office-roster-status">${bot.cam === "coffee" ? "Resting" : "Working"}</span>
        </div>
      `,
    )
    .join("");
}

let engine = null;

export function mount(container) {
  const bots = listOfficeBots();

  container.innerHTML = `
    <section class="page-heading" aria-labelledby="office-title">
      <div class="page-heading-copy">
        <span class="eyebrow">Page 01 · Mission control</span>
        <h1 id="office-title">Virtual Office</h1>
        <p>Keep every step of your video pipeline in view, from a raw clip to a ready to post cut.</p>
      </div>
      <span class="status-pill"><span class="status-dot" aria-hidden="true"></span>Workspace ready</span>
    </section>

    <div class="office-grid">
      <section class="card stage-card" aria-labelledby="office-stage-title">
        <div class="stage-card-header">
          <div class="stage-header-copy">
            <strong id="office-stage-title">Studio floor</strong>
            <span>Two anime specialists deep in a render, live from the office</span>
          </div>
          <div class="view-toggle" role="group" aria-label="Office view">
            <button class="view-toggle__button" type="button" data-office-view="grid" aria-pressed="true">6-Cam CCTV</button>
            <button class="view-toggle__button" type="button" data-office-view="iso" aria-pressed="false">Floor Overview</button>
          </div>
        </div>

        <div class="office-engine" data-office-engine data-view="grid">
          <div class="office-cam-grid" data-office-grid>
            ${OFFICE_ROOMS.map(camTile).join("")}
          </div>
          <div class="office-roster" data-office-roster hidden>
            <div class="office-roster-head">
              <strong>Studio roster</strong>
              <span>Specialist bots on shift</span>
            </div>
            <div class="office-roster-track">${roster(bots)}</div>
          </div>
        </div>

        <div class="stage-footer" aria-label="Pipeline folders">
          <span class="stage-tag">raw-videos/</span>
          <span class="stage-tag">voiceovers/</span>
          <span class="stage-tag">ready-to-post/</span>
        </div>
      </section>

      <div class="stack">
        <section class="card panel-card" aria-labelledby="pipeline-title">
          <div class="card-heading">
            <div>
              <h2 id="pipeline-title">Your video pipeline</h2>
              <p>A clear path from source clip to scheduled post.</p>
            </div>
          </div>
          <ol class="pipeline-list">
            <li class="pipeline-step">
              <span class="step-number">01</span>
              <span><strong>Bring in a raw clip</strong><span>Start with a recording in your project folder.</span></span>
            </li>
            <li class="pipeline-step">
              <span class="step-number">02</span>
              <span><strong>Shape the story</strong><span>Prepare voice, captions, and a cover frame.</span></span>
            </li>
            <li class="pipeline-step">
              <span class="step-number">03</span>
              <span><strong>Choose when to share</strong><span>Review a post before it joins your queue.</span></span>
            </li>
          </ol>
        </section>

        <section class="card panel-card" aria-labelledby="raw-video-title">
          <div class="card-heading">
            <div>
              <h2 id="raw-video-title">Raw video inbox</h2>
              <p>Project media stays on this device.</p>
            </div>
          </div>
          <div class="folder-card section-gap">
            <span class="status-icon">${icons.folder}</span>
            <div>
              <strong>raw-videos/</strong>
              <p>No clips yet. Add videos here when ingestion is available.</p>
            </div>
          </div>
        </section>
      </div>
    </div>

    <section class="card telemetry-card" aria-labelledby="telemetry-title">
      <div class="card-heading">
        <div>
          <h2 id="telemetry-title">Live studio activity</h2>
          <p>Worker updates will appear here while a batch is running.</p>
        </div>
        <span class="status-pill">Waiting for first job</span>
      </div>
      <div class="telemetry-empty" role="status">
        <span class="status-dot" aria-hidden="true"></span>
        Nothing is running right now. Your local studio is standing by.
      </div>
    </section>

    <footer class="page-footer">
      <span>Built for a calm, local first production workflow.</span>
      <span>Posting destinations are configured in your project.</span>
    </footer>
  `;

  const host = container.querySelector("[data-office-engine]");
  const grid = container.querySelector("[data-office-grid]");
  const rosterDock = container.querySelector("[data-office-roster]");
  const viewButtons = container.querySelectorAll("[data-office-view]");
  const tiles = grid.querySelectorAll("[data-cam]");

  engine = createVirtualOfficeEngine({
    container: grid,
    view: "grid",
    onRoomFocus: (roomKey) => {
      for (const tile of tiles) {
        tile.classList.toggle("is-focused", tile.dataset.cam === roomKey);
      }
    },
  });

  const onViewClick = (event) => {
    const view = event.currentTarget.dataset.officeView;
    engine.setView(view);
    host.dataset.view = view;
    rosterDock.hidden = view !== "iso";
    for (const button of viewButtons) {
      button.setAttribute("aria-pressed", String(button.dataset.officeView === view));
    }
    if (view === "iso") {
      for (const tile of tiles) tile.classList.remove("is-focused");
    }
  };

  for (const button of viewButtons) button.addEventListener("click", onViewClick);

  const onRosterClick = (event) => {
    const card = event.target.closest("[data-roster-bot]");
    if (!card) return;
    const bot = bots.find((item) => item.id === card.dataset.rosterBot);
    if (!bot) return;
    for (const item of rosterDock.querySelectorAll("[data-roster-bot]")) {
      item.classList.toggle("is-active", item === card);
    }
    engine.focusRoom(bot.cam);
  };
  rosterDock.addEventListener("click", onRosterClick);

  const onKeyDown = (event) => {
    if (event.key !== "Enter" && event.key !== " ") return;
    const tile = event.target.closest("[data-cam]");
    if (!tile) return;
    event.preventDefault();
    engine.focusRoom(tile.dataset.cam);
  };
  grid.addEventListener("keydown", onKeyDown);

  engine.__pageCleanup = () => {
    for (const button of viewButtons) button.removeEventListener("click", onViewClick);
    rosterDock.removeEventListener("click", onRosterClick);
    grid.removeEventListener("keydown", onKeyDown);
  };
}

export function unmount() {
  if (!engine) return;
  engine.__pageCleanup?.();
  engine.dispose();
  engine = null;
}
