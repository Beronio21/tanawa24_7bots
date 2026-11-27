# Tanawa 24/7 Bot — Master Project Specification (`project-doc.md`)

---

## 1. Executive Summary

**Tanawa 24/7 Bot** is a standalone, local-first native desktop studio built with **Tauri v2 (Rust)**, **Vite + Tailwind CSS + Three.js**, **Python 3.12**, and **`debpalash/voicestudio`**. It automates end-to-end social video production and multi-platform scheduling while keeping recurring AI token expenses near `$0`.

### Core Architectural Pillars
1. **Native Desktop Shell (~30–50 MB Idle RAM):** Opens in a native OS window via Tauri v2 (WebView2) with system-tray background persistence—never inside a browser tab or bloated Electron/Next.js server wrapper.
2. **Strictly Separated Dual Workspaces:**
   - **Page 1 — Virtual Office & Video Pipeline (`#office`):** Monitors 24/7 studio specialists, processes raw camera/screen recordings (`raw-videos/`), generates cached SEO copy and thumbnails, and automates Chrome uploads with `https://tanawa.app` CTA links.
   - **Page 2 — Code & Film Studio (`#studio`):** Turns a user's story prompt into a locked 3D low-poly world + custom 2D pixel-art character cast (`scene_manifest.json`), generates a beat-by-beat storytelling script (`story_script.json`) with automated character movement (`idle`, `talk`, `walk`, `cheer`), synthesizes dialogue via local VoiceStudio (`:3900`), mixes categorized `.mp3` SFX (`assets/sfx/`), and films deterministic 60fps MP4 videos via Python + headless Playwright + FFmpeg.
3. **UnlockTool / Antivirus-Style Subscription Lockout:** Hardware-ID (`machine-uid`) bound Ed25519 cryptographic licensing enforced inside the Rust core before unlocking the UI or spawning Python workers.
4. **Python-First `$0` Local Execution:** Every repeatable step—PDF knowledge indexing, `.mp3` SFX indexing, HTML stage assembly, video editing, frame rendering, audio mixing, thumbnail creation, and Chrome posting—runs in local deterministic Python scripts for `$0`. Cloud BYOK LLMs are called only via single-shot SQLite-cached JSON prompts.

---

## 2. Separated Workspace & Folder Architecture

### 2.1 Reference Prototypes & Knowledge Base (`docs/` & `assets/`)
- `docs/references/tanawa_24_7_bot_virtual_office.html` — Blueprint for **Page 1 (`#office`)**: sunlit isometric office, 48×56 pixel-art bot specialists, projected status holograms, and live telemetry.
- `docs/references/hd_2d_pixel_art_sprite_3d_world_studio.html` — Blueprint for **Page 2 (`#studio`)**: `16:9 HD-2D` / `9:16 Reels` aspect switching, 3D low-poly environments (*Meadow Plaza*, *Sunset Plaza*, *Cozy Office*), camera presets, Left/Right `NearestFilter` sprite slots + PNG sprite-sheet upload, and multi-line cue timelines (restyled in the Morning Light palette).
- `docs/knowledge/` — Local storytelling knowledge base (`Short-Form Storytelling Principles.pdf`, `Short-Form Storytelling Template Database.pdf`, and distilled `storytelling_templates.json`).
- `assets/sfx/` — Local folder-categorized `.mp3` sound effects (`Popup sounds`, `Reveal sounds`, `Suspense sounds`, `Transition sounds`, `Zoom sounds`, `SFX For CapCut Text Animations`, and individual hits) indexed into `sfx_catalog.json`.

### 2.2 Per-Project Data Isolation (`projects/<project_name>/`)
```text
projects/<project_name>/
├── raw-videos/              # Input for Page 1 raw video editing (user uploads/drops clips here)
├── edited-videos/           # Intermediate Page 1 cuts (9:16 framed, leveled, subtitled)
├── animation-scenes/        # Input/output for Page 2: scene_manifest.json, story_script.json, PNG sheets & standalone HTML stage
├── rendered-animations/     # Finished MP4 films rendered by Python + Playwright + FFmpeg + VoiceStudio
├── voiceovers/              # Output from local VoiceStudio (localhost:3900)
├── thumbnails/              # Output from Pillow cover frame compositor
├── metadata/                # Exported JSON manifests, .srt transcripts & Asia/Manila slots
└── ready-to-post/           # Shared handoff folder of approved MP4s for Chrome scheduling & upload
```

---

## 3. Story-to-HTML World, Character & Movement Pipeline

To ensure generated characters and 3D worlds stay 100% consistent across an entire story while automating repeatable work in Python:

1. **Knowledge & SFX Indexing (`$0` Python):**
   - `scripts/index_storytelling_kb.py` extracts the **8 Core Scriptwriting Principles** (*Curiosity & Contrast*, *Speed to Value < 5s*, *Value Density*, *6th-Grade Clarity & Repeaters*, *Absorption Rate*, *Anticipation*, *Emotional Resonance*, *Staccato Trance Rhythm*) and **10 Mad-Lib Story Frameworks** (*Hero's Journey*, *Personal Learning/Epiphany*, *About Me*, *Before and After*, *Goal/Dream Journey*, *Challenge*, *Win*, *Day In The Life*, *Personal Update*, *Lesson From Others*) into `docs/knowledge/storytelling_templates.json`.
   - `scripts/index_sfx.py` scans `assets/sfx/` recursively for `.mp3` files and builds `assets/sfx/sfx_catalog.json` tagged by narrative beat (`popup`, `reveal`, `suspense`, `transition`, `zoom`, `typing`, `impact`, `error`).
2. **World & Character Lock (`scene_manifest.json`):**
   - Customizes the Three.js world set (environment theme, Morning Light lighting, 4 camera presets: `wide`, `two_shot`, `low_hero`, `diorama`) and locks `"left_cast"` and `"right_cast"` pixel-art sprites (`THREE.NearestFilter`, scale, ground offset) once per story.
3. **Beat-by-Beat Story & Movement Script (`story_script.json`):**
   - Single-shot cached BYOK/Ollama call generates structured JSON beats mapped to the selected storytelling template.
   - Each beat specifies `speaker`, `pose` (`"idle" | "talk" | "walk" | "cheer"`), `move_to` (`x, z` stage coordinates for automated walking/blocking), `camera` preset, `sfx` tag, `subtitle`, and `tts_text`—never altering the underlying world or character sprites mid-story.
4. **Deterministic Python HTML Assembly & Film Render (`$0` Python):**
   - `scripts/build_html_scene.py` injects `scene_manifest.json` and `story_script.json` into the deterministic HD-2D Three.js stage template (`window.renderFrame(t)`), producing a self-contained HTML scene inside `animation-scenes/`.
   - `scripts/batch_voiceover.py` synthesizes each beat's `tts_text` via VoiceStudio (`localhost:3900`).
   - `scripts/batch_render_animation.py` steps `window.renderFrame(t)` in headless Chromium, pipes raw frames into `FFmpeg` (`image2pipe`), mixes VoiceStudio dialogue + beat-synced `.mp3` SFX (`adelay` + `amix`), and saves the finished MP4 to `rendered-animations/` (and `ready-to-post/`).

---

## 4. Local SQLite Schema (`data/tanawa_studio.db`)

1. **`projects`**: `id`, `name`, `slug`, `cta_url` (default `https://tanawa.app`), `timezone` (default `Asia/Manila`), `created_at`.
2. **`media_items`**: `id`, `project_id`, `source_type` (`raw_edit` | `html_film`), `input_path`, `output_path`, `voiceover_path`, `thumbnail_path`, `file_hash`, `status` (`QUEUED` | `RUNNING` | `COMPLETED` | `FAILED`), `error_message`, `updated_at`.
3. **`cached_copy`**: `id`, `file_hash`, `prompt_hash`, `provider`, `title`, `description`, `keywords_json` (10 SEO tags), `created_at`.
4. **`schedules`**: `id`, `media_item_id`, `platform` (`tiktok` | `facebook` | `instagram` | `youtube`), `scheduled_at_utc`, `scheduled_at_manila`, `post_status` (`PENDING` | `SCHEDULED` | `POSTED` | `FAILED`), `post_url`.
5. **`job_queue`**: `id`, `project_id`, `pipeline_mode` (`edit_only` | `film_only` | `full_batch`), `priority`, `status`, `started_at`, `finished_at` (processed sequentially with `concurrency = 1`).

---

## 5. Python-First Deterministic Batch Workers (`scripts/`)

| Script | Responsibility | Engine & Cost |
| :--- | :--- | :--- |
| `index_storytelling_kb.py` | Distills `docs/knowledge/*.pdf` into `storytelling_templates.json`. | Local Python `pypdf` — **`$0`** |
| `index_sfx.py` | Indexes `assets/sfx/**/*.mp3` by folder/beat tag into `sfx_catalog.json`. | Local Python `os`/`json` — **`$0`** |
| `build_html_scene.py` | Compiles locked `scene_manifest.json` + `story_script.json` into a standalone deterministic HTML/Three.js stage file. | Local Python template assembler — **`$0`** |
| `batch_voiceover.py` | Synthesizes character dialogue & dubs from text cues. | Local `debpalash/voicestudio` (`http://localhost:3900`) — **`$0`** |
| `batch_edit_video.py` | Trims silence, crops `9:16` / `16:9`, normalizes LUFS, burns `.srt` captions. | Local `FFmpeg` (auto-probes NVENC/QSV/AMF/VideoToolbox -> `libx264`) — **`$0`** *(optional `--use-higgsfield`)* |
| `batch_render_animation.py` | Steps `window.renderFrame(t)` in headless Chromium and pipes raw frames to `FFmpeg` (`image2pipe`) with VoiceStudio audio + beat-synced `.mp3` SFX. | Local `Playwright` + `FFmpeg` — **`$0`** |
| `batch_transcribe.py` | Generates `.srt` and `.txt` transcripts from audio/video tracks. | Local `faster-whisper` (or Groq Whisper fallback) — **`$0`** |
| `batch_write_titles.py` & `batch_write_descriptions.py` | Single-shot structured JSON generation of titles, descriptions, 10 SEO keywords, and `https://tanawa.app` CTA injection. | Cached in SQLite; supports `Ollama` (**`$0`**) or BYOK (`Groq`, `Claude`, `Gemini`, `OpenAI`, `DeepSeek`, `NVIDIA NIM`, `Kimi`) |
| `batch_make_images.py` | Extracts peak frames (`FFmpeg`) and renders branded cover thumbnails (`Pillow`). | Local `FFmpeg` + `Pillow` — **`$0`** |
| `batch_schedule.py` | Assigns non-overlapping `Asia/Manila` (`UTC+8`) time slots and rejects past dates. | Local Python `zoneinfo` + SQLite — **`$0`** |
| `batch_post_social.py` | Uploads and schedules videos via user's persistent `Google Chrome` profile. | Local `Playwright` (`launch_persistent_context`) — **`$0` LLM tokens** |

---

## 6. Subscription Licensing & Payment Architecture

- **Hardware Binding (`src-tauri/src/license.rs`):** Computes a deterministic SHA-256 Hardware ID (`HWID`) from `machine-uid`.
- **Cryptographic Verification:** Validates an **Ed25519-signed license payload** (`license_key`, `hwid_hash`, `plan_tier`, `expires_at_utc`, `issued_at_utc`) stored in OS `keyring`.
- **Anti-Tamper & Offline Grace:** Tracks `last_seen_utc` to block system clock rollbacks and allows a 7-day offline grace window for uninterrupted rendering.
- **Checkout Integrations:**
  - **PayMongo:** GCash, Maya, QR Ph, and Philippine debit/credit cards.
  - **Polar.sh / Stripe:** International cards and recurring global subscriptions.

---

## 7. Modular Phase Roadmap (`docs/scope/`)

Each phase lives inside `docs/scope/phase-XX.md`, builds **one isolated system**, and must pass `npm run build` (and `cargo check` for Rust changes) before starting the next phase:

- `docs/scope/phase-01.md` — Tauri v2 Desktop Shell, Morning Light Theme & Separated Page Router
- `docs/scope/phase-01.1.md` — LifeOS Persistent Brand Identity (`BRAND_TELOS`), Guardrails & Bot Voice Personas
- `docs/scope/phase-02.md` — Rust HWID Subscription & Ed25519 Activation Gate
- `docs/scope/phase-03.md` — Local SQLite Database, Project Folders, BYOK Vault, Storytelling KB & SFX Indexers
- `docs/scope/phase-04.md` — Page 1 UI: Virtual Office & 24/7 Pipeline (`#office`)
- `docs/scope/phase-05.md` — Page 2 UI: Code & Film Studio (`#studio`) with Story-to-World/Character Generator & Movement Timeline
- `docs/scope/phase-06.md` — Raw Video Batch Editor (`batch_edit_video.py`)
- `docs/scope/phase-07.md` — Local VoiceStudio TTS & Offline Transcription (`batch_voiceover.py`, `batch_transcribe.py`)
- `docs/scope/phase-08.md` — Single-Shot SQLite-Cached SEO Copy & Pillow Thumbnails
- `docs/scope/phase-09.md` — Deterministic HTML Scene Assembler & Headless MP4 Film Renderer (`build_html_scene.py`, `batch_render_animation.py`)
- `docs/scope/phase-10.md` — `Asia/Manila` Scheduler, Persistent Chrome Poster & Overnight Queue
