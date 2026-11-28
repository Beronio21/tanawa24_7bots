# Phase 01.2 — Top-Bar Mode Switcher (`Video Editor` vs. `Video Animation`) & Context-Aware Sidebar

## 1. Objective & Architectural Rationale
Currently, the left sidebar mixes **Virtual Office** (raw video editing pipeline) and **Code & Film Studio** (3D/2D animation filmmaking) in the same navigation rail, which confuses users because raw clip editing and story-driven 2.5D animation have completely different production workflows.

In **Phase 01.2**, we introduce a **Top-Bar Studio Mode Switcher** (`Video Editor` | `Video Animation`) in `TopStatusBar.js` and make `SidebarNav.js` **context-aware** so each mode displays only its own focused pages, folders, and tools—while preserving the warm sunlit **Morning Light** palette (`#FAF6F0`, `#F3ECE1`, `#D96B43`, `#1F1A17`).

---

## 2. Isolated Scope & File Targets
Only modify or create the files listed below. Do not implement backend database, licensing, or Python worker logic in this phase.

- **Create:** `docs/scope/phase-01.2.md` (this specification)
- **Update:** `src/state/store.js` — Add `studioMode` (`"video_editor"` | `"video_animation"`), default active route per mode, and mode-switching actions.
- **Update:** `src/components/TopStatusBar.js` — Add the primary segmented mode switcher (**Video Editor** vs. **Video Animation**) prominently in the top header bar.
- **Update:** `src/components/SidebarNav.js` — Dynamically render only the navigation items belonging to the active `studioMode` (plus shared operational pages clearly scoped to that mode).
- **Create:** `src/pages/AnimationOfficePage.js` — Dedicated overview & batch monitor page for **Video Animation** mode (`#anim-office`), previewing the 2.5D CCTV studio layout (`docs/references/multi_cam_cctv.html` + `character.html`) in Morning Light.
- **Update:** `src/main.js` — Register the mode-aware routes (`#office`, `#anim-office`, `#studio`, `#queue`, `#settings`) with clean `unmount()` / `mount()` lifecycle transitions when switching top-bar modes.
- **Update:** `src/styles/sunlit-theme.css` — Add styling for the Morning Light segmented mode pill toggle in the top bar.

---

## 3. Navigation & Mode Separation Rules

### 3.1 Top-Bar Mode Switcher (`TopStatusBar.js`)
Render a tactile two-option segmented pill control in the top bar between the brand subtitle and the project/status chips:
- **Mode A — `Video Editor` (`studioMode = "video_editor"`)**
  - Purpose: Raw screen recordings / camera clip trimming, silence removal, captions, thumbnails, and social publishing.
  - Default route on switch: `#office` (**Virtual Office**).
- **Mode B — `Video Animation` (`studioMode = "video_animation"`)**
  - Purpose: Story-to-HTML 3D world + 2D cel-shaded anime character filmmaking (`16:9 HD-2D` / `9:16 Reels`), VoiceStudio dialogue, and beat-synced SFX rendering.
  - Default route on switch: `#studio` (**Code & Film Studio**).

### 3.2 Context-Aware Left Sidebar (`SidebarNav.js`)
When `studioMode === "video_editor"`, the left sidebar renders **only**:
1. **Virtual Office (`#office`)** — Multi-cam CCTV office floor & raw clip pipeline monitor (`raw-videos/` -> `edited-videos/` -> `ready-to-post/`).
2. **Schedule & Queue (`#queue`)** — `Asia/Manila` publish slots & batch queue filtered for edited videos.
3. **Engines & BYOK (`#settings`)** — FFmpeg hardware encoder, Whisper transcription, Chrome profile, and LifeOS TELOS settings.

When `studioMode === "video_animation"`, the left sidebar renders **only**:
1. **Code & Film Studio (`#studio`)** — 3D world set, 2D anime character rig (`character.html`), story-to-HTML script generator, and movement timeline.
2. **Animation Studio Cam (`#anim-office`)** — Dedicated CCTV production floor monitor (`animation-scenes/` -> `voiceovers/` -> `rendered-animations/`).
3. **Schedule & Queue (`#queue`)** — `Asia/Manila` publish slots & render queue filtered for rendered animations.
4. **Engines & BYOK (`#settings`)** — VoiceStudio `:3900`, Playwright renderer, SFX catalog, and LifeOS TELOS settings.

*(Never render `#office` and `#studio` in the sidebar at the same time.)*

---

## 4. Visual & Design Guardrails
- **Strict Morning Light Palette:**
  - Top bar mode switcher track: `#F3ECE1` (Warm Parchment) with `1px solid #E2D7C5` (Warm Sand) border.
  - Active mode pill: `#D96B43` (Sunlit Terracotta) with `#FFFFFF` bold text, or `#FFFFFF` elevated card with `#D96B43` indicator dot and `#1F1A17` ink text.
  - Inactive mode pill: transparent background with `#63584F` (Warm Stone) text and `#1F1A17` hover state.
- **Persistent State:** Switching between **Video Editor** and **Video Animation** updates `store.studioMode`, resets the active route to that mode's primary workspace (`#office` or `#studio`), and cleanly calls `unmount()` on the previous page before calling `mount()` on the new page.

---

## 5. Verification Checklist
1. Launching the app defaults to **Video Editor** mode with `#office` active and **no** Code & Film Studio link cluttering the sidebar.
2. Clicking **Video Animation** in the top bar switches the sidebar exclusively to animation pages (`Code & Film Studio`, `Animation Studio Cam`, `Schedule & Queue`, `Engines & BYOK`) and mounts `#studio`.
3. Clicking **Video Editor** in the top bar switches the sidebar back to raw-video pages (`Virtual Office`, `Schedule & Queue`, `Engines & BYOK`) and mounts `#office`.
4. `npm run build` completes with zero Vite or JavaScript bundling errors.
