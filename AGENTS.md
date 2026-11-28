# AGENTS.md — Tanawa 24/7 Bot

Operational rules, environment setup, architecture constraints, and coding standards for AI coding agents working on **Tanawa 24/7 Bot**.

---

## 1. Project Identity & Core Mandate

- **Product Name:** `Tanawa 24/7 Bot` — Native Rust/Tauri v2 Desktop Video Automation & HD-2D Virtual Studio.
- **Core Purpose:** A lightweight 24/7 system-tray desktop application that turns raw screen recordings or story-driven HTML5/Three.js pixel-art worlds and characters into voiced, movement-choreographed, SFX-mixed, captioned, thumbnailed, and scheduled social videos using local `$0` Python scripts, local `debpalash/voicestudio`, and optional BYOK AI APIs.
- **Strict Brand Separation:** `Tanawa 24/7 Bot` is 100% standalone. Never share databases, authentication sessions, or backend code with `tanawa.app`. The desktop app promotes `https://tanawa.app` (or any user-configured URL) solely by injecting the CTA link into outgoing post descriptions, captions, or first comments.
- **Default Timezone:** `Asia/Manila` (`UTC+8`).


---

## 2. Confirmed Tech Stack & Pre-Flight Installation

Install **only** the confirmed stack below. Do not introduce Next.js, Electron, PySide6/PyQt, Selenium, or HyperFrames.

### 2.1 System & Desktop Shell Prerequisites (Windows)
```powershell
winget install --id Python.Python.3.12 --exact
winget install --id OpenJS.NodeJS.LTS --exact
winget install --id Gyan.FFmpeg --exact
winget install --id Rustlang.Rustup --exact

# Configure MSVC toolchain for Tauri v2 (also requires VS C++ Build Tools + Edge WebView2)
rustup default stable-x86_64-pc-windows-msvc
```

2. **Page 2 — Code & Film Studio (`#studio`)**: Built from `docs/references/hd_2d_pixel_art_sprite_3d_world_studio.html` and `docs/references/character.html` (restyled in Morning Light). Dedicated 3D world set & 2D/pixel-art character filmmaking studio (`16:9 HD-2D` / `9:16 Reels`, story-to-HTML character & world generator, 3D-to-2D materialized paper-cutout & SVG anime character rig, locked cast & world manifests, automated character movement choreography, dialogue cue timeline, VoiceStudio `:3900` TTS, and headless Playwright + FFmpeg MP4 rendering).

### 2.2 Local Voice & Dubbing Engine (`debpalash/voicestudio`)
```bash
git clone https://github.com/debpalash/voicestudio.git
# Configure VoiceStudio locally so its API/UI runs on http://localhost:3900
```

### 2.3 Python Worker Environment (`requirements.txt`)
```bash
python -m venv .venv
.venv\Scripts\activate

pip install playwright pillow faster-whisper httpx pydantic keyring python-dotenv aiosqlite pypdf
python -m playwright install chromium
```
- **Browser Automation Rule:** Use `Playwright` with the user's persistent `Google Chrome` profile (`user_data_dir`) so social logins stay active without storing passwords. Only use `PyAutoGUI` as an optional fallback if a native OS file dialog resists Playwright.

### 2.4 Frontend & Tauri v2 Dependencies (`package.json`)
Use standard `npm` and `Vite` (do not install Next.js or pnpm):
```bash
npm install three @tauri-apps/api
npm install -D vite tailwindcss @tauri-apps/cli@^2
```

### 2.5 Rust Crates (`src-tauri/Cargo.toml`)
```toml
[dependencies]
tauri = { version = "2", features = ["tray-icon"] }
serde = { version = "1", features = ["derive"] }
serde_json = "1"
tokio = { version = "1", features = ["full"] }
machine-uid = "0.5"
ed25519-dalek = "2"
sha2 = "0.10"
base64 = "0.22"
hex = "0.4"
reqwest = { version = "0.12", features = ["json"] }
keyring = "3"
chrono = { version = "0.4", features = ["serde"] }
```

---

## 3. Non-Negotiable Architecture & Design Rules

### 3.1 Warm Sunlit Aesthetic (No Dark-Blue Themes)
- **Forbidden:** Do not use dark-blue, navy, slate-blue, or generic indigo dark themes (`#0d1015`, `#0f172a`, `#1e293b`, etc.).
- **Required Palette (Warm Sunlit Atelier / "Morning Light"):**
  - Primary Window Canvas: `#FAF6F0` (Warm Cream)
  - Secondary Panels & Sidebar: `#F3ECE1` (Warm Parchment)
  - Elevated Cards & Inputs: `#FFFFFF` (Crisp Ivory)
  - Borders & Dividers: `#E2D7C5` (Warm Sand)
  - Primary Ink Text: `#1F1A17` (Deep Espresso)
  - Muted Ink Text: `#63584F` (Warm Stone)
  - Primary Accent (CTAs / Active States): `#D96B43` (Sunlit Terracotta)
  - Secondary Accent (Highlights / Badges): `#C88A2B` (Warm Amber Gold)
  - Success / Online Status: `#3F7D58` (Sage Emerald)
  - Secondary Action Accent: `#2B6E68` (Botanical Teal)

### 3.2 Separated Multi-Page Workspace Layout
Never cram all tools onto a single scrolling screen. Render a persistent left navigation rail (`220px`) switching cleanly between separated pages with strict `unmount()` / `mount()` lifecycles:
1. **Page 1 — Virtual Office & Video Pipeline (`#office`)**: Built from `docs/references/tanawa_24_7_bot_virtual_office.html` and `docs/references/multi_cam_cctv.html`. Multi-cam CCTV bento layout + full-viewport HD-2D isometric office built with Three.js scissor viewports, depth-occluded 2D cel-shaded anime character billboards (`docs/references/character.html`), raw video ingestion (`raw-videos/`), live telemetry feed, and one-click project batch triggers.
2. **Page 2 — Code & Film Studio (`#studio`)**: Built from `docs/references/hd_2d_pixel_art_sprite_3d_world_studio.html` (restyled in Morning Light). Dedicated 3D world set & pixel-art sprite filmmaking studio (`16:9 HD-2D` / `9:16 Reels`, story-to-HTML character & world generator, locked cast & world manifests, Left & Right `NearestFilter` sprite slots + custom PNG sprite-sheet upload, automated character movement choreography, dialogue cue timeline, VoiceStudio `:3900` TTS, and headless Playwright + FFmpeg MP4 rendering).
3. **Page 3 — Schedule & Social Queue (`#queue`)**: Sequential overnight render & publish queue (`concurrency = 1`), `Asia/Manila` schedule slots, Chrome profile health, and `https://tanawa.app` CTA injection rules.
4. **Page 4 — Local Engines, BYOK & Subscription (`#settings`)**: HWID subscription activation status, LifeOS Brand TELOS & Bot Personas, local engine diagnostics (`VoiceStudio :3900`, `FFmpeg` hardware encoders, `Ollama :11434`, `Chrome`), and encrypted BYOK API key vault.

### 3.3 UnlockTool / Antivirus-Style Subscription Lockout
- **Hard Launch Gate:** On startup, Rust verifies the local signed license before unlocking any workspace page. Unlicensed or expired users see only the **Subscription Activation Gate** with their read-only **Hardware ID (HWID)**, license key input (`TNW-XXXX-XXXX-XXXX-XXXX`), and checkout links (**PayMongo** for GCash/Maya/QR Ph/cards; **Polar.sh / Stripe** for international cards).
- **Dual Enforcement:** Every Tauri IPC command that spawns a Python script (`run_project_batch`, `run_single_step`, `film_animation_scene`, `post_social_batch`) must verify the active license state in Rust before spawning the child process.
- **Anti-Tamper & Offline Grace:** Store the Ed25519-signed license token in OS `keyring`, validate `expires_at` and `hwid_hash`, allow a 7-day offline grace window, and reject system clock rollbacks via a monotonic `last_seen_utc` timestamp.

### 3.4 Python-First Cost Guardrails & Story-to-Film Consistency
- **Python-First Automation Rule:** Anything repeatable or automatable—indexing storytelling PDFs, scanning `.mp3` SFX libraries, assembling standalone HTML/Three.js scene bundles from templates, synthesizing VoiceStudio audio, stepping `window.renderFrame(t)` into `FFmpeg` with beat-synced SFX, generating thumbnails, and posting via Chrome—**must run in local deterministic Python scripts for `$0`**. Never use multi-turn screenshot-loop UI agents.
- **Locked World & Character Consistency (`scene_manifest.json` + `story_script.json`):**
  - When a user writes or generates a story script from `docs/knowledge/` (the 8 Core Scriptwriting Principles & 10 Storytelling Templates), generate or bind a single **`scene_manifest.json`** (locking the 3D world environment, lighting, camera presets, and Left/Right pixel-art character sprites) and a beat-by-beat **`story_script.json`** (driving character movements `idle` / `talk` / `walk` / `cheer`, stage coordinates `x, z`, camera cuts, dialogue lines, and `assets/sfx/` audio cues).
  - Never regenerate world geometry or character sprites mid-story; only beat choreography and dialogue advance across frames so characters and worlds stay 100% consistent from hook to CTA.
- **Deterministic CLI Scripts (`scripts/`):**
  - `scripts/index_storytelling_kb.py` (distills `docs/knowledge/*.pdf` into `storytelling_templates.json` for `$0`)
  - `scripts/index_sfx.py` (indexes `assets/sfx/**/*.mp3` into `sfx_catalog.json` for `$0`)
  - `scripts/build_html_scene.py` (compiles `scene_manifest.json` + `story_script.json` into a deterministic standalone HTML/Three.js stage file for `$0`)
  - `scripts/batch_voiceover.py`
  - `scripts/batch_edit_video.py`
  - `scripts/batch_render_animation.py`
  - `scripts/batch_transcribe.py`
  - `scripts/batch_write_titles.py`
  - `scripts/batch_write_descriptions.py`
  - `scripts/batch_make_images.py`
  - `scripts/batch_schedule.py`
  - `scripts/batch_post_social.py`
- **Cached Single-Shot AI Calls:** BYOK AI providers (Groq, Claude, Gemini, OpenAI, DeepSeek, NVIDIA NIM, Kimi, Higgsfield, Ollama) are called **only** for single-shot structured JSON outputs (story beat scripts, scene manifests, titles, descriptions, 10 SEO keywords) and cached in local SQLite (`data/tanawa_studio.db`) by input hash + prompt hash so re-runs cost `$0`.

---

## 4. Repository Structure & Phase-by-Phase Build Protocol

```text
tanawa24_7bots/
├── AGENTS.md
├── package.json
├── vite.config.js
├── requirements.txt
├── docs/
│   ├── project-doc.md
│   ├── knowledge/                # Storytelling principles & 10 Mad-Lib templates
│   │   ├── Short-Form Storytelling Principles.pdf
│   │   ├── Short-Form Storytelling Template Database.pdf
│   │   └── storytelling_templates.json
│   ├── references/               # Read-only HTML UI & Three.js prototypes
│   │   ├── character.html
│   │   ├── hd_2d_pixel_art_sprite_3d_world_studio.html
│   │   ├── multi_cam_cctv.html
│   │   └── tanawa_24_7_bot_virtual_office.html
│   └── scope/                    # Isolated single-system phase specs
│       ├── phase-01.md
│       └── phase-01.1.md
├── assets/
│   └── sfx/                      # Local categorized .mp3 sound effects (git-ignored)
│       └── sfx_catalog.json
├── src/                          # Vite + Tailwind + Three.js Sunlit UI
│   ├── index.html
│   ├── main.js
│   ├── styles/
│   │   └── sunlit-theme.css
│   ├── state/
│   │   ├── store.js
│   │   └── lifeosStore.js
│   ├── components/
│   │   ├── SidebarNav.js
│   │   ├── TopStatusBar.js
│   │   └── LicenseGateModal.js
│   └── pages/
│       ├── VirtualOfficePage.js
│       ├── CodeFilmStudioPage.js
│       ├── ScheduleQueuePage.js
│       └── EnginesByokPage.js
├── src-tauri/                    # Tauri v2 Rust Core
│   ├── Cargo.toml
│   ├── tauri.conf.json
│   └── src/
│       ├── main.rs
│       ├── lifeos.rs             # Brand TELOS, guardrails & bot personas
│       ├── license.rs            # HWID + Ed25519 subscription verifier
│       ├── vault.rs              # OS keyring BYOK secret storage
│       ├── tray.rs               # 24/7 background system tray
│       └── runner.rs             # Sequential Python worker spawner
├── scripts/                      # Deterministic $0 Python Batch Pipeline
│   ├── common/
│   │   ├── db.py                 # SQLite queue, cache & schedule store
│   │   ├── ffmpeg_hw.py          # NVENC / QSV / AMF / VideoToolbox detector
│   │   └── llm_client.py         # Cached single-shot BYOK + Ollama router
│   ├── index_storytelling_kb.py
│   ├── index_sfx.py
│   ├── build_html_scene.py
│   ├── batch_voiceover.py
│   ├── batch_edit_video.py
│   ├── batch_render_animation.py
│   ├── batch_transcribe.py
│   ├── batch_write_titles.py
│   ├── batch_write_descriptions.py
│   ├── batch_make_images.py
│   ├── batch_schedule.py
│   └── batch_post_social.py
├── projects/                     # User workspace folders
│   └── default_project/
│       ├── raw-videos/
│       ├── edited-videos/
│       ├── animation-scenes/
│       ├── rendered-animations/
│       ├── voiceovers/
│       ├── thumbnails/
│       ├── metadata/
│       └── ready-to-post/
└── data/
    ├── lifeos/                   # BRAND_TELOS.md, identity.json, guardrails.json
    └── tanawa_studio.db          # Local SQLite database
```

### Phase-by-Phase Execution Rule
- Build **one phase at a time** from `docs/scope/phase-XX.md`.
- Never implement out-of-scope features from future phases.
- Run `npm run build` (and `cargo check` when Rust files change) at the end of **every** phase before proceeding.

---

## 5. Verification & Code Quality Standards

- Every Python script in `scripts/` must expose a clean CLI (`argparse`), emit structured JSON progress lines to `stdout` for the Virtual Office live feed, and exit with `0` on success or non-zero with a clear error message on failure.
- Three.js pixel-art textures must always enforce `THREE.NearestFilter` for both `magFilter` and `minFilter` with `generateMipmaps = false` so pixel sprites remain razor-sharp.
- Never hardcode API keys, private signing keys, or user credentials in source files.
