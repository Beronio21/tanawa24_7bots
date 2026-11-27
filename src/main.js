import { mountSidebar } from "./components/SidebarNav.js";
import { mountTopStatusBar } from "./components/TopStatusBar.js";
import * as officePage from "./pages/VirtualOfficePage.js";
import * as studioPage from "./pages/CodeFilmStudioPage.js";
import * as queuePage from "./pages/ScheduleQueuePage.js";
import * as settingsPage from "./pages/EnginesByokPage.js";
import "./styles/sunlit-theme.css";

const pages = {
  office: { module: officePage, title: "Virtual Office" },
  studio: { module: studioPage, title: "Code & Film Studio" },
  queue: { module: queuePage, title: "Schedule & Queue" },
  settings: { module: settingsPage, title: "Engines & BYOK" },
};

const sidebar = mountSidebar(document.querySelector("#sidebar-nav"));
const topStatusBar = mountTopStatusBar(document.querySelector("#top-status-bar"));
const pageContainer = document.querySelector("#page-view");
let activeRoute;

function renderRoute() {
  const requestedRoute = window.location.hash.slice(1);
  const route = Object.hasOwn(pages, requestedRoute) ? requestedRoute : "office";

  if (route !== requestedRoute) {
    window.history.replaceState(null, "", `${window.location.pathname}${window.location.search}#${route}`);
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
