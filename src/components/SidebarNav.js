const icons = {
  office:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M3 10.5 12 3l9 7.5v9a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 19.5z"/><path d="M9 21v-6h6v6M7 10h.01M17 10h.01"/></svg>',
  studio:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><rect x="3" y="4" width="18" height="16" rx="2"/><path d="m10 9 5 3-5 3z"/></svg>',
  queue:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M8 6h13M8 12h13M8 18h13"/><path d="M3 6h.01M3 12h.01M3 18h.01"/></svg>',
  settings:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M12 8.5a3.5 3.5 0 1 0 0 7 3.5 3.5 0 0 0 0-7Z"/><path d="m19.4 15 .1.1a1.7 1.7 0 0 1-2.4 2.4l-.1-.1a1.7 1.7 0 0 0-2.9 1.2v.2a1.7 1.7 0 0 1-3.4 0v-.2a1.7 1.7 0 0 0-2.9-1.2l-.1.1a1.7 1.7 0 0 1-2.4-2.4l.1-.1a1.7 1.7 0 0 0-1.2-2.9H4a1.7 1.7 0 0 1 0-3.4h.2a1.7 1.7 0 0 0 1.2-2.9l-.1-.1a1.7 1.7 0 0 1 2.4-2.4l.1.1a1.7 1.7 0 0 0 2.9-1.2V2a1.7 1.7 0 0 1 3.4 0v.2a1.7 1.7 0 0 0 2.9 1.2l.1-.1a1.7 1.7 0 0 1 2.4 2.4l-.1.1a1.7 1.7 0 0 0 1.2 2.9h.2a1.7 1.7 0 0 1 0 3.4h-.2a1.7 1.7 0 0 0-1.2 2.9Z"/></svg>',
};

const links = [
  { route: "office", label: "Virtual Office" },
  { route: "studio", label: "Code & Film Studio" },
  { route: "queue", label: "Schedule & Queue" },
  { route: "settings", label: "Engines & BYOK" },
];

export function mountSidebar(container) {
  container.innerHTML = `
    <div class="sidebar-content">
      <a class="brand-lockup" href="#office" aria-label="Tanawa 24/7 Bot home">
        <span class="brand-mark" aria-hidden="true">T.</span>
        <span>
          <span class="brand-name">Tanawa Studio</span>
          <span class="brand-caption">Local video workspace</span>
        </span>
      </a>
      <p class="nav-label">Workspace</p>
      <nav aria-label="Main navigation">
        <ul class="nav-list">
          ${links
            .map(
              ({ route, label }) => `
                <li>
                  <a class="nav-link" href="#${route}" data-route="${route}" aria-label="${label}">
                    <span class="nav-icon">${icons[route]}</span>
                    <span>${label}</span>
                  </a>
                </li>
              `,
            )
            .join("")}
        </ul>
      </nav>
      <aside class="sidebar-note">
        <strong>Made for local work</strong>
        <p>Your studio stays on this device. Connect the tools you choose when you are ready.</p>
      </aside>
    </div>
  `;

  return {
    setActiveRoute(route) {
      for (const link of container.querySelectorAll("[data-route]")) {
        if (link.dataset.route === route) {
          link.setAttribute("aria-current", "page");
        } else {
          link.removeAttribute("aria-current");
        }
      }
    },
    unmount() {
      container.replaceChildren();
    },
  };
}
