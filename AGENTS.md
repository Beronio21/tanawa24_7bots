# AGENTS.md — Tanawa 24/7 Bot

Operational rules, environment setup, architecture constraints, and coding standards for AI coding agents working on **Tanawa 24/7 Bot**.

---

## 1. Project Identity & Core Mandate

- **Product Name:** `Tanawa 24/7 Bot` — Local Desktop Video Automation & HD-2D Virtual Studio.
- **Core Purpose:** A lightweight 24/7 system-tray desktop application that turns raw screen recordings or HTML5/Three.js pixel-art scenes into voiced, captioned, thumbnailed, and scheduled social videos using local `$0` Python scripts, local `debpalash/voicestudio`, and optional BYOK AI APIs.
- **Strict Brand Separation:** `Tanawa 24/7 Bot` is 100% standalone. Never share databases, authentication sessions, or backend code with `tanawa.app`. The desktop app promotes `https://tanawa.app` (or any user-configured URL) solely by injecting the CTA link into outgoing post descriptions, captions, or first comments.
- **Default Timezone:** `Asia/Manila` (`UTC+8`).

---

## 2. Confirmed Tech Stack & Pre-Flight Installation

Install **only** the confirmed stack below. Do not introduce Electron, PySide6/PyQt, Selenium, or HyperFrames.

### 2.1 System & Desktop Shell Prerequisites (Windows)
```powershell
winget install --id Python.Python.3.12 --exact
winget install --id OpenJS.NodeJS.LTS --exact
winget install --id Gyan.FFmpeg --exact
winget install --id Rustlang.Rustup --exact

# Configure MSVC toolchain for Tauri v2 (also requires VS C++ Build Tools + Edge WebView2)
rustup default stable-x86_64-pc-windows-msvc
```

### 2.2 Local Voice & Dubbing Engine (`debpalash/voicestudio`)
```bash
git clone https://github.com/debpalash/voicestudio.git
# Configure VoiceStudio locally so its API/UI runs on http://localhost:3900
```

### 2.3 Python Worker Environment (`requirements.txt`)
```bash
python -m venv .venv
.venv\Scripts\activate

pip install playwright pillow faster-whisper httpx pydantic keyring python-dotenv aiosqlite
python -m playwright install chromium
```
- **Browser Automation Rule:** Use `Playwright` with the user's persistent `Google Chrome` profile (`user_data_dir`) so social logins stay active without storing passwords. Only use `PyAutoGUI` as an optional fallback if a native OS file dialog resists Playwright.

### 2.4 Frontend & Tauri v2 Dependencies (`package.json`)
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
- **Required Palette (Warm Sunlit Atelier):**
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
Never cram all tools onto a single scrolling screen. Render a persistent left navigation rail (`220px`) switching cleanly between 5 dedicated views:
1. **Virtual Office (`#office`)**: Full-viewport HD-2D isometric office built with Three.js + crisp `NearestFilter` pixel-art bot specialists (Director, Video Editor, Animator, Copywriter, Thumbnails, Social, Voice & Dubbing), live `#office` activity feed, and one-click project batch triggers.
2. **Video Edit & Post (`raw-videos/`)**: Raw clip ingestion, silence trimming, `9:16` framing, `.srt` subtitle burn-in, VoiceStudio audio mixing, thumbnail generation, and social publishing.
3. **Code & Film Studio (`animation-scenes/`)**: Full-featured HD-2D Pixel Sprite & 3D World Filmmaking Studio (modeled on `hd_2d_pixel_art_sprite_3d_world_studio.html` with `16:9 HD-2D` and `9:16 Reels` aspect toggles, 3D low-poly world sets, camera presets, CRT/Subtitle/HUD toggles, Left & Right `NearestFilter` pixel-art sprite slots + custom PNG sprite-sheet upload, pose/animation controls, multi-line dialogue cue timeline, VoiceStudio `:3900` TTS synthesis, and headless Playwright + FFmpeg MP4 rendering).
4. **Schedule & Social Queue (`ready-to-post/`)**: Sequential overnight render & publish queue (`concurrency = 1`), `Asia/Manila` schedule slots, Chrome profile health, and `https://tanawa.app` CTA injection rules.
5. **Local Engines, BYOK & Subscription**: HWID subscription activation status, local engine diagnostics (`VoiceStudio :3900`, `FFmpeg` hardware encoders, `Ollama :11434`, `Chrome`), and encrypted BYOK API key vault.

### 3.3 UnlockTool / Antivirus-Style Subscription Lockout
- **Hard Launch Gate:** On startup, Rust verifies the local signed license before unlocking any workspace page. Unlicensed or expired users see only the **Subscription Activation Gate** with their read-only **Hardware ID (HWID)**, license key input (`TNW-XXXX-XXXX-XXXX-XXXX`), and checkout links (**PayMongo** for GCash/Maya/QR Ph/cards; **Polar.sh / Stripe** for international cards).
- **Dual Enforcement:** Every Tauri IPC command that spawns a Python script (`run_project_batch`, `run_single_step`, `film_animation_scene`, `post_social_batch`) must verify the active license state in Rust before spawning the child process.
- **Anti-Tamper & Offline Grace:** Store the Ed25519-signed license token in OS `keyring`, validate `expires_at` and `hwid_hash`, allow a 7-day offline grace window, and reject system clock rollbacks via a monotonic `last_seen_utc` timestamp.

### 3.4 Python-First Cost Guardrails
- **Zero Multi-Turn UI Agents:** Never use screenshot-loop computer-use agents to operate video editors or browsers.
- **Deterministic CLI Scripts (`scripts/`):** All repeatable work runs in local Python scripts for `$0`:
  - `scripts/batch_voiceover.py`
  - `scripts/batch_edit_video.py`
  - `scripts/batch_render_animation.py`
  - `scripts/batch_transcribe.py`
  - `scripts/batch_write_titles.py`
  - `scripts/batch_write_descriptions.py`
  - `scripts/batch_make_images.py`
  - `scripts/batch_schedule.py`
  - `scripts/batch_post_social.py`
- **Cached Single-Shot AI Calls:** BYOK AI providers (Groq, Claude, Gemini, OpenAI, DeepSeek, NVIDIA NIM, Kimi, Higgsfield, Ollama) are called only for single-shot structured JSON outputs (HTML5/Three.js scene code, titles, descriptions, 10 SEO keywords) and cached in local SQLite (`data/tanawa_studio.db`) by file hash + prompt hash so re-runs cost `$0`.

---

## 4. Repository Structure

```text
tanawa-24-7-bot/
├── AGENTS.md
├── package.json
├── requirements.txt
├── docs/
│   └── project-doc.md
├── src/                          # Vite + Tailwind + Three.js Sunlit UI
│   ├── index.html
│   ├── main.js
│   ├── styles/
│   │   └── sunlit-theme.css
│   ├── state/
│   │   └── store.js
│   ├── components/
│   │   ├── SidebarNav.js
│   │   ├── TopStatusBar.js
│   │   └── LicenseGateModal.js
│   └── pages/
│       ├── VirtualOfficePage.js
│       ├── VideoEditPage.js
│       ├── CodeFilmStudioPage.js
│       ├── ScheduleQueuePage.js
│       └── EnginesByokPage.js
├── src-tauri/                    # Tauri v2 Rust Core
│   ├── Cargo.toml
│   ├── tauri.conf.json
│   └── src/
│       ├── main.rs
│       ├── license.rs            # HWID + Ed25519 subscription verifier
│       ├── vault.rs              # OS keyring BYOK secret storage
│       ├── tray.rs               # 24/7 background system tray
│       └── runner.rs             # Sequential Python worker spawner
├── scripts/                      # Deterministic $0 Python Batch Pipeline
│   ├── common/
│   │   ├── db.py                 # SQLite queue, cache & schedule store
│   │   ├── ffmpeg_hw.py          # NVENC / QSV / AMF / VideoToolbox detector
│   │   └── llm_client.py         # Cached single-shot BYOK + Ollama router
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
│       ├── animation-scenes/
│       ├── voiceovers/
│       ├── thumbnails/
│       └── ready-to-post/
└── data/
    └── tanawa_studio.db          # Local SQLite database
```

---

## 5. Verification & Code Quality Standards

- Every Python script in `scripts/` must expose a clean CLI (`argparse`), emit structured JSON progress lines to `stdout` for the Virtual Office live feed, and exit with `0` on success or non-zero with a clear error message on failure.
- Three.js pixel-art textures must always enforce `THREE.NearestFilter` for both `magFilter` and `minFilter` with `generateMipmaps = false` so pixel sprites remain razor-sharp.
- Never hardcode API keys, private signing keys, or user credentials in source files.
