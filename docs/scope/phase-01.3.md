# Phase 01.3 — Wire Reference Prototypes (Characters, 3D Worlds & CCTV Bots) into Mode Viewports

## Objective
Replace the placeholder canvases in **Video Editor** mode (`Virtual Office`) and **Video Animation** mode (`Code & Film Studio` & `Animation Studio Cam`) with interactive Three.js + 2D SVG/Canvas engines ported directly from `docs/references/`, restyled to match the **Morning Light** (`#FAF6F0` / `#F3ECE1` / `#D96B43`) desktop aesthetic.

---

## Reference Mapping (`docs/references/`)
1. `docs/references/multi_cam_cctv.html` + `docs/references/tanawa_24_7_bot_virtual_office.html` -> **Video Editor Mode (`#office`)** & **Animation Studio Cam (`#anim-cam`)**
2. `docs/references/hd_2d_pixel_art_sprite_3d_world_studio.html` -> **Video Animation Mode (`#studio`) 3D World Stage**
3. `docs/references/character.html` -> **Modular 2D/3D Cel-Shaded Anime Character Rig** used both for the workstation specialist bots and the castable story characters in `#studio`.

---

## Deliverables & File Changes

### 1. Reusable Character Rig Module (`src/engine/CharacterRig.js`)
- Extract the parameterized SVG cel-shaded character generator from `docs/references/character.html`.
- Support configurable presets for specialist bots (`Animator Bot`, `Video Editor Bot`, `SEO Writer Bot`, `Scheduler Bot`, `Manager Bot`, `Posting Bot`, `Off-duty Bot`) and custom story cast (`left_cast`, `right_cast`):
  - Hair styles (`long`, `braids`, `buns`), accessories (`beret`, `glasses`, `visor`, `headset`, `cap`, `none`), color palettes, facing (`1` / `-1`), expressions (`happy`, `smile`, `focused`, `pout`, `wink`), and poses (`typing`, `idle`, `talk`, `walk`, `cheer`).
- Provide helper methods to:
  1. Render an inline SVG portrait for roster cards and cast slots.
  2. Bake 2-frame or multi-frame `THREE.CanvasTexture` billboards (`alphaTest: 0.45`) so characters sit behind 3D desks and monitors with true WebGL depth occlusion.

### 2. Multi-Cam CCTV & Isometric Virtual Office (`src/engine/VirtualOfficeEngine.js`)
- Port the Three.js multi-viewport scissor engine from `docs/references/multi_cam_cctv.html` and isometric view toggle from `docs/references/tanawa_24_7_bot_virtual_office.html`.
- Restyle room lighting, window sunbeams, walls, and HUD overlays to harmonize with the **Morning Light** palette (warm sunlit timber `#C89D6C`, cream daylight `#FEF9C3`, terracotta `#D96B43` active frames, espresso `#1F1A17` badges).
- Mount into **Page 1 (`VirtualOfficePage.js`)** inside the `Studio floor` container with a view toggle:
  - **6-Cam CCTV Grid** (`ANIMATION STUDIO`, `WRITER'S DESK & PLANNING WALL`, `MANAGER'S OFFICE`, `EDITING SUITE`, `COFFEE AREA`, `BROADCAST ROOM`) with depth-occluded bots seated behind desks/monitors and live progress overlays.
  - **Isometric Floor Overview** (full office cutaway view with bottom bot roster dock).
- Expose a single-room camera mode (`mountSingleRoom('animation')`) for the **Animation Studio Cam (`#anim-cam`)** sub-view inside **Video Animation** mode so users can monitor `Animator Bot` rendering frames live.
- Enforce strict `dispose()` cleanup on page unmount (cancel `requestAnimationFrame`, dispose WebGL geometries/textures/renderer, disconnect `ResizeObserver`).

### 3. HD-2D World & Character Film Studio (`src/engine/FilmStudioEngine.js`)
- Port the Three.js world builder and camera preset system (`wide`, `two_shot`, `low_hero`, `diorama`) from `docs/references/hd_2d_pixel_art_sprite_3d_world_studio.html` into the `Scene viewport` of `CodeFilmStudioPage.js`.
- Support switching `16:9 HD-2D` and `9:16 Reels` aspect framing cleanly inside the viewport.
- Wire the right-hand **Scene setup** and **Sprite cast** panels:
  - **World set selector:** *Cozy Morning Studio*, *Meadow Plaza*, *Sunset Overlook*.
  - **Camera preset selector:** `Wide`, `Two-Shot`, `Low Hero`, `Diorama`.
  - **Left & Right Cast slots:** Allow picking a built-in anime character rig preset from `CharacterRig.js` (with expression/pose controls) OR uploading a custom PNG sprite sheet rendered with `THREE.NearestFilter` (`generateMipmaps = false`).
- Expose deterministic `window.renderFrame(t)` hook so Python Playwright rendering remains ready for Phase 09.
- Enforce strict `dispose()` cleanup when switching pages or modes.

---

## Verification Checklist
- [ ] Switching to **Video Editor -> Virtual Office** renders the interactive 6-Cam CCTV office & isometric toggle with depth-occluded 2D anime bots seated behind desks and monitors.
- [ ] Switching to **Video Animation -> Code & Film Studio** renders the live 3D world stage inside `Scene viewport` with working `16:9` / `9:16` framing, camera presets, and Left/Right character cast selection.
- [ ] Switching to **Video Animation -> Animation Studio Cam** renders the dedicated live `ANIMATION STUDIO` CCTV feed showing `Animator Bot` at the dual-monitor workstation.
- [ ] Switching rapidly between **Video Editor** and **Video Animation** modes cleanly disposes WebGL contexts with zero console errors or memory leaks.
- [ ] `npm run build` succeeds with zero errors.
