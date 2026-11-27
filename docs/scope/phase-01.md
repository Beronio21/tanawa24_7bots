# Phase 01 — Tauri v2 Desktop Shell, Morning Light Theme & Separated Page Router

> **Mandatory Context for AI Coding Agents:**
> Before writing or editing any file, read and strictly obey:
> 1. **`AGENTS.md`** — Enforces the **Warm Sunlit Atelier ("Morning Light")** color palette (zero dark-blue/slate/indigo colors), standalone brand isolation from `tanawa.app`, Vite frontend bundling (no Next.js), and `npm` build standardization.
> 2. **`docs/project-doc.md`** — Defines the master architecture, confirmed tool versions, and repository layout.
> 3. **`docs/references/`** — Contains the two reference HTML prototypes (`tanawa_24_7_bot_virtual_office.html` and `hd_2d_pixel_art_sprite_3d_world_studio.html`). **Do not modify or delete any file inside `docs/references/`.**
>
> *Housekeeping Note:* All phase specifications live exclusively inside `docs/scope/`. If an older `docs/phase-01.md` exists outside `docs/scope/`, remove it so `docs/scope/phase-01.md` is the single source of truth.

---

## 1. Phase 01 Single-System Scope

Phase 01 builds **only one complete foundation system**:
1. A native **Rust / Tauri v2 desktop application shell** (`Tanawa 24/7 Bot`) that opens in its own standalone OS desktop window (not a browser tab) and minimizes to the system tray for 24/7 background operation.
2. The **Warm Sunlit Atelier ("Morning Light")** CSS design system.
3. A **separated multi-page frontend router** with clean `unmount()` / `mount()` lifecycle hooks separating **Page 1 (`#office`)** and **Page 2 (`#studio`)** so their Three.js stages and workflows never collide.

### Explicitly Out of Scope (Do Not Build in Phase 01)
To prevent context overload and keep `npm run build` fast and deterministic, **do not implement** any of the following in Phase 01:
- Hardware-ID (HWID) subscription activation gate or Ed25519 verification *(reserved for `docs/scope/phase-02.md`)*.
- SQLite database initialization or OS Keyring BYOK vault *(reserved for `docs/scope/phase-03.md`)*.
- Full Three.js 3D scenes, pixel-art sprite renderers, or animation loops *(reserved for `docs/scope/phase-04.md` & `docs/scope/phase-05.md`)*.
- Any Python scripts inside `scripts/` *(reserved for `docs/scope/phase-06.md` through `phase-10.md`)*.

---

## 2. Separated Page Architecture (Reference Mapping)

Enforce strict separation between the two primary workflows defined in `docs/references/`:

| Route & Page Module | Reference Blueprint (`docs/references/`) | Role & Isolation Boundary |
| :--- | :--- | :--- |
| **`#office`** (`src/pages/VirtualOfficePage.js`) | `tanawa_24_7_bot_virtual_office.html` | **Page 1 — Virtual Office & Raw Video Pipeline.** Dedicated to 24/7 mission control, raw clip ingestion (`raw-videos/`), bot status monitoring, live telemetry, and `https://tanawa.app` CTA posting. |
| **`#studio`** (`src/pages/CodeFilmStudioPage.js`) | `hd_2d_pixel_art_sprite_3d_world_studio.html` | **Page 2 — Code & Film Studio.** Dedicated to 3D world sets, `16:9` / `9:16` pixel-art sprite casting, dialogue cue scripts, and rendering scenes (`animation-scenes/`). |
| **`#queue`** (`src/pages/ScheduleQueuePage.js`) | `docs/project-doc.md` | **Page 3 — Schedule & Social Queue.** Sequential overnight queue (`concurrency = 1`) and `Asia/Manila` publishing calendar. |
| **`#settings`** (`src/pages/EnginesByokPage.js`) | `docs/project-doc.md` | **Page 4 — Local Engines, BYOK & License.** VoiceStudio `:3900`, FFmpeg, Ollama, BYOK keys, and subscription status. |

**Lifecycle Rule:** Switching routes must call `unmount()` on the active page before calling `mount(container)` on the next page so only one page's DOM and listeners exist at any time.

---

## 3. Step-by-Step Implementation Tasks

### Task 1.1 — Initialize Vite Frontend & `npm` Scripts
Create `package.json`, `vite.config.js`, and `src/index.html` using standard `npm` and Vite (do not use Next.js):
- Dependencies: `three`, `@tauri-apps/api`
- DevDependencies: `vite`, `tailwindcss`, `@tauri-apps/cli@^2`
- Scripts in `package.json`:
  - `"dev": "vite"`
  - `"build": "vite build"`
  - `"tauri": "tauri"`
- Configure Vite to serve `src/` as root and output static production bundles to `dist/` (`emptyOutDir: true`).

### Task 1.2 — Configure Native Tauri v2 Window & System Tray (`src-tauri/`)
Create `src-tauri/Cargo.toml`, `src-tauri/tauri.conf.json`, `src-tauri/src/main.rs`, and `src-tauri/src/tray.rs`:
- Set `frontendDist` to `../dist` and `devUrl` to `http://localhost:5173`.
- Configure the main native window in `tauri.conf.json`:
  - `title`: `"Tanawa 24/7 Bot"`
  - `width`: `1440`, `height`: `900`, `minWidth`: `1180`, `minHeight`: `760`
  - `resizable`: `true`, `center`: `true`
- Implement `src-tauri/src/tray.rs` with Tauri v2's `tray-icon` feature:
  - Tray menu items: **Open Tanawa Studio** and **Quit Tanawa 24/7 Bot**.
  - Intercept `WindowEvent::CloseRequested` so clicking `X` hides the window to the tray rather than terminating background tasks, while **Quit Tanawa 24/7 Bot** cleanly exits the process.

### Task 1.3 — Create Morning Light Theme (`src/styles/sunlit-theme.css`)
Define root CSS variables and utility classes matching `AGENTS.md`:
- `--bg-canvas: #FAF6F0` (Warm Cream)
- `--bg-panel: #F3ECE1` (Warm Parchment)
- `--bg-card: #FFFFFF` (Crisp Ivory)
- `--border-sand: #E2D7C5` (Warm Sand)
- `--text-ink: #1F1A17` (Deep Espresso)
- `--text-muted: #63584F` (Warm Stone)
- `--accent-terracotta: #D96B43` (Primary CTA / Active Nav)
- `--accent-amber: #C88A2B` (Badges / Highlights)
- `--accent-emerald: #3F7D58` (Online / Ready Status)
- `--accent-teal: #2B6E68` (Secondary Action)
- **Constraint:** Zero dark-blue, slate, or indigo hex values (`#0d1015`, `#0f172a`, `#1e293b`) anywhere in `src/`.

### Task 1.4 — Build Persistent Layout Shell & Separated Page Shells (`src/`)
Create clean, modular ES modules:
1. **`src/components/TopStatusBar.js`**: Displays app title (`Tanawa 24/7 Bot`), active project badge (`default_project`), live `Asia/Manila` (`UTC+8`) clock, and a `$0 Local-First` status pill.
2. **`src/components/SidebarNav.js`**: Fixed `220px` left navigation rail with clear visual separation between:
   - **Virtual Office** (`#office`)
   - **Code & Film Studio** (`#studio`)
   - **Schedule & Queue** (`#queue`)
   - **Engines & BYOK** (`#settings`)
3. **`src/pages/VirtualOfficePage.js`**: Renders the Page 1 shell (`#office`) with designated mount containers for the future isometric Three.js office stage, raw-video queue (`raw-videos/`), and live telemetry feed.
4. **`src/pages/CodeFilmStudioPage.js`**: Renders the Page 2 shell (`#studio`) restyled in the Morning Light palette with designated mount containers for the future 3D world stage, `16:9` / `9:16` framing controls, sprite cast slots, and dialogue cue script.
5. **`src/pages/ScheduleQueuePage.js` & `src/pages/EnginesByokPage.js`**: Clean placeholder shells ready for later phases.
6. **`src/main.js`**: Hash/state router (`#office` default) with strict `unmount()` / `mount()` page lifecycle management.

---

## 4. Mandatory Phase 01 Verification Gate

Phase 01 is complete **only** when all checks below pass with zero errors:

1. **Install & Frontend Build Check:**
   ```bash
   npm install
   npm run build
   ```
   *Expected:* Vite compiles `dist/` cleanly with exit code `0` and zero missing-import warnings.
2. **Rust Core Compilation Check:**
   ```bash
   cd src-tauri
   cargo check
   ```
   *Expected:* Rust dependencies and `tray.rs` compile with zero errors.
3. **Desktop Window & Separation Smoke Test:**
   - Launch `npm run tauri dev` and confirm a native desktop window titled **Tanawa 24/7 Bot** opens in the warm Morning Light theme.
   - Click between **Virtual Office (`#office`)** and **Code & Film Studio (`#studio`)** in the left sidebar and confirm each page renders independently with clean DOM unmounting.
   - Click the window close button (`X`) and verify the app stays alive in the system tray and re-opens when clicked.
