const timeFormatter = new Intl.DateTimeFormat("en-PH", {
  timeZone: "Asia/Manila",
  hour: "2-digit",
  minute: "2-digit",
  hour12: true,
});

export function mountTopStatusBar(container) {
  container.innerHTML = `
    <div class="topbar-heading">
      <strong>Tanawa 24/7 Bot</strong>
      <span>Your local first video production desk</span>
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
    </div>
  `;

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
      container.replaceChildren();
    },
  };
}
