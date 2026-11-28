import {
  getStudioMode,
  listStudioModes,
  setStudioMode,
  subscribeStudioMode,
} from "../state/store.js";

const timeFormatter = new Intl.DateTimeFormat("en-PH", {
  timeZone: "Asia/Manila",
  hour: "2-digit",
  minute: "2-digit",
  hour12: true,
});

export function mountTopStatusBar(container, { onModeChange } = {}) {
  const modeButtons = listStudioModes()
    .map(
      (mode) => `
        <button
          class="mode-option"
          type="button"
          data-mode="${mode.id}"
          aria-pressed="${String(mode.id === getStudioMode())}"
        >
          <span class="mode-dot" aria-hidden="true"></span>
          ${mode.label}
        </button>
      `,
    )
    .join("");

  container.innerHTML = `
    <div class="topbar-heading">
      <strong>Tanawa 24/7 Bot</strong>
      <span>Your local first video production desk</span>
    </div>
    <div class="mode-switcher" role="group" aria-label="Studio mode">
      ${modeButtons}
    </div>
    <div class="topbar-meta">
      <span class="project-badge">
        <span class="status-dot" aria-hidden="true"></span>
        default_project
      </span>
      <time class="clock-badge" id="manila-clock" aria-label="Current time in Asia/Manila (UTC+8)"></time>
      <span class="local-badge">
        <span class="status-dot" aria-hidden="true"></span>
        $0 Local-First
      </span>
      <a class="telos-badge" href="#settings" aria-label="Open Brand TELOS settings">
        <span class="status-dot" aria-hidden="true"></span>
        TELOS: Active
      </a>
    </div>
  `;

  const buttons = [...container.querySelectorAll("[data-mode]")];

  const syncModeButtons = (mode) => {
    for (const button of buttons) {
      button.setAttribute("aria-pressed", String(button.dataset.mode === mode));
    }
  };

  const onModeClick = (event) => {
    const mode = event.currentTarget.dataset.mode;
    if (mode === getStudioMode()) return;

    setStudioMode(mode);
    onModeChange?.(mode);
  };

  for (const button of buttons) {
    button.addEventListener("click", onModeClick);
  }

  const unsubscribeMode = subscribeStudioMode(syncModeButtons);

  const clock = container.querySelector("#manila-clock");
  const updateClock = () => {
    const now = new Date();
    clock.dateTime = now.toISOString();
    clock.textContent = `${timeFormatter.format(now)} UTC+8`;
  };

  updateClock();
  const intervalId = window.setInterval(updateClock, 1000);

  return {
    unmount() {
      window.clearInterval(intervalId);
      unsubscribeMode();
      for (const button of buttons) {
        button.removeEventListener("click", onModeClick);
      }
      container.replaceChildren();
    },
  };
}
