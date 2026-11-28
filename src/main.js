import { mountSidebar } from "./components/SidebarNav.js";
import { mountTopStatusBar } from "./components/TopStatusBar.js";
import * as officePage from "./pages/VirtualOfficePage.js";
import * as animOfficePage from "./pages/AnimationOfficePage.js";
import * as studioPage from "./pages/CodeFilmStudioPage.js";
import * as characterRigPage from "./pages/CharacterRigPage.js";
import * as queuePage from "./pages/ScheduleQueuePage.js";
import * as settingsPage from "./pages/EnginesByokPage.js";
import {
  getDefaultRoute,
  getModeForRoute,
  getStudioMode,
  setStudioMode,
} from "./state/store.js";
import "./styles/sunlit-theme.css";

const pages = {
  office: { module: officePage, title: "Virtual Office" },
  "anim-office": { module: animOfficePage, title: "Animation Studio Cam" },
  studio: { module: studioPage, title: "Code & Film Studio" },
  "character-rig": { module: characterRigPage, title: "Character Rig" },
  queue: { module: queuePage, title: "Schedule & Queue" },
  settings: { module: settingsPage, title: "Engines & BYOK" },
};

const sidebar = mountSidebar(document.querySelector("#sidebar-nav"));
const topStatusBar = mountTopStatusBar(document.querySelector("#top-status-bar"), {
  onModeChange: (mode) => {
    const targetRoute = getDefaultRoute(mode);
    if (window.location.hash === `#${targetRoute}`) {
      renderRoute();
    } else {
      window.location.hash = targetRoute;
    }
  },
});
const pageContainer = document.querySelector("#page-view");
let activeRoute;

function renderRoute() {
  const requestedRoute = window.location.hash.slice(1);
  const route = Object.hasOwn(pages, requestedRoute)
    ? requestedRoute
    : getDefaultRoute(getStudioMode());

  if (route !== requestedRoute) {
    window.history.replaceState(
      null,
      "",
      `${window.location.pathname}${window.location.search}#${route}`,
    );
  }

  const routeMode = getModeForRoute(route);
  if (routeMode && routeMode !== getStudioMode()) {
    setStudioMode(routeMode);
  }

  if (route === activeRoute) {
    sidebar.setActiveRoute(route);
    return;
  }

  if (activeRoute) {
    pages[activeRoute].module.unmount();
    pageContainer.replaceChildren();
  }

  activeRoute = route;
  pages[route].module.mount(pageContainer);
  sidebar.setActiveRoute(route);
  document.title = `${pages[route].title} · Tanawa 24/7 Bot`;
}

window.addEventListener("hashchange", renderRoute);
window.addEventListener("beforeunload", () => {
  if (activeRoute) pages[activeRoute].module.unmount();
  sidebar.unmount();
  topStatusBar.unmount();
});

renderRoute();
