# Project Specification: Tanawa 24/7 Bot

## 1. Executive Summary

**Tanawa 24/7 Bot** is a lightweight, 24/7 system-tray desktop studio built with **Tauri v2 (Rust)**, **Vite + Tailwind + Three.js**, **Python 3**, and **`debpalash/voicestudio`**. It empowers solo creators and businesses to automate end-to-end video production and multi-platform social publishing directly on their own PC without paying recurring cloud rendering or video-editing subscriptions.

The application features a **warm sunlit studio interface**, **5 cleanly separated workspace pages**, an **HD-2D Isometric Virtual Office** where pixel-art AI specialist bots visually collaborate and report progress, a dedicated **HD-2D Code & Film Studio** for turning pixel-art sprites and 3D low-poly worlds into 60fps MP4s, and an **UnlockTool / antivirus-style HWID-locked subscription gate**.

---

## 2. Core User Workflows & Separated Pages

### 2.1 Page 1 — Virtual Office (`#office`)
- **Visual Stage:** Interactive Three.js HD-2D isometric office set in warm morning sunlight with low-poly desks, plants, render monitors, a collaboration table, and crisp `NearestFilter` pixel-art specialists:
  1. **Director Bot** — Orchestrates sequential pipelines and overnight queues.
  2. **Voice & Dubbing Bot** — Interfaces with local `debpalash/voicestudio` (`http://localhost:3900`).
  3. **Video Editor Bot** — Cuts raw clips, trims silence, frames `9:16`, and burns captions via FFmpeg.
  4. **Animator Bot** — Directs HD-2D sprite worlds and exports 60fps MP4s via Playwright + FFmpeg.
  5. **Copywriter Bot** — Generates cached single-shot titles, descriptions, and 10 SEO keywords.
  6. **Thumbnail Bot** — Composites high-contrast `16:9` and `9:16` covers via Pillow.
  7. **Social Bot** — Schedules (`Asia/Manila`) and uploads via persistent Chrome automation.
- **Live Office Feed:** Real-time `#office` status stream showing active bot states (`IDLE`, `WORKING`, `DONE`, `QUEUED`) and one-click batch triggers.

### 2.2 Page 2 — Video Edit & Post (`raw-videos/`)
- **Input:** Raw screen recordings or camera clips dropped into `projects/<name>/raw-videos/`.
- **Automated Local Pipeline:**
  1. `batch_transcribe.py` extracts `.srt` timestamps locally via `faster-whisper` (or VoiceStudio).
  2. `batch_edit_video.py` trims dead air, normalizes audio, applies optional VoiceStudio voiceover/dubbing, scales/crops to `1080x1920` (`9:16`) or `1920x1080` (`16:9`), and burns bold outlined subtitles using hardware-accelerated FFmpeg (`NVENC`, `QuickSync`, `AMF`, `VideoToolbox`, or `libx264`).
  3. `batch_write_titles.py` & `batch_write_descriptions.py` generate cached JSON metadata + 10 SEO keywords + `https://tanawa.app` CTA link.
  4. `batch_make_images.py` renders `16:9` and `9:16` thumbnails via Pillow.
  5. Outputs land in `ready-to-post/` with a sidecar `.meta.json` manifest.

### 2.3 Page 3 — Code & Film Studio (`animation-scenes/`)
- **Dedicated Filmmaking Workspace:** Modeled on the HD-2D Pixel Sprite & 3D World Studio architecture (`hd_2d_pixel_art_sprite_3d_world_studio.html`):
  - **Framing & World Sets:** Instant toggle between `16:9 HD-2D` and `9:16 Reels`; 3D low-poly dioramas (*Meadow Plaza*, *Sunset Plaza*, *Cozy Studio*) with real directional shadows; camera presets (*Plaza Wide*, *Two-Shot*, *Low Hero*, *Diorama*); and *CRT Scanline*, *Subtitle*, and *HUD* toggles.
  - **Pixel-Art Sprite Cast:** Left and Right sprite slots supporting built-in 4-frame pixel characters (*Traveler Boy*, *Traveler Girl*, *Sage Male*, *Sage Female*) plus drag-and-drop custom transparent `.png` / horizontal sprite-sheet uploads rendered with `THREE.NearestFilter` and `alphaTest` silhouette shadows.
  - **Pose & Dialogue Timeline:** Multi-line cue editor controlling speaker badges, active animations (`Idle`, `Talk`, `Walk`, `Cheer`), camera cuts, and dialogue captions.
  - **VoiceStudio Integration:** Generates character speech `.wav` files locally via `http://localhost:3900` and aligns cue durations to audio length.
  - **Deterministic MP4 Export:** `batch_render_animation.py` advances the Three.js scene frame-by-frame in headless Playwright at exact `60 FPS` and pipes raw frames into FFmpeg (`image2pipe`) alongside the VoiceStudio audio track to produce a crisp `1080x1920` or `1920x1080` MP4.

### 2.4 Page 4 — Schedule & Social Queue (`ready-to-post/`)
- **Sequential Overnight Queue (`concurrency = 1`):** Processes queued render and upload jobs one at a time so laptops never freeze or thermally throttle overnight.
- **Timezone-Aware Planner:** Schedules publishing windows in `Asia/Manila` (`UTC+8`).
- **Multi-Platform Publisher (`batch_post_social.py`):** Uses `Playwright` attached to the user's logged-in `Google Chrome` profile to upload videos and inject the `https://tanawa.app` CTA link across YouTube Shorts/Videos, TikTok, Instagram Reels, Facebook Reels, and X.

### 2.5 Page 5 — Local Engines, BYOK & Subscription License
- **Subscription & HWID Activation Panel:** Displays active plan tier, expiration date/countdown, bound Hardware ID (`HWID`), and device-transfer cooldown status.
- **Local Engine Health Checks:** One-click verification for `VoiceStudio (:3900)`, `FFmpeg` + detected GPU hardware encoder, `Pillow`, `faster-whisper`, `Ollama (:11434)`, and `Google Chrome` profile path.
- **Encrypted BYOK Key Vault:** Stores user-supplied keys in the OS keyring (`keyring`) for **Groq**, **Claude**, **Gemini**, **OpenAI**, **DeepSeek**, **NVIDIA NIM**, **Kimi**, and **Higgsfield API**, plus local **Ollama** model selection.

---

## 3. Subscription & Hardware-ID Licensing Architecture

To protect commercial distribution like **UnlockTool** and desktop antivirus suites, **Tanawa 24/7 Bot** enforces subscription activation inside the Tauri Rust core:

1. **Hardware Fingerprint (`HWID`):**
   - Computed in `src-tauri/src/license.rs` using `machine-uid` combined with a salted SHA-256 hash, formatted for display (e.g., `HWID-9F4A-22C1-88B0-3E7D`).
2. **Payment & Key Issuance:**
   - **Philippines Checkout:** **PayMongo** Checkout Sessions supporting **GCash**, **Maya**, **QR Ph**, and local debit/credit cards.
   - **Global Checkout:** **Polar.sh** or **Stripe** supporting international cards and recurring subscriptions.
   - Upon confirmed payment webhook, the licensing backend generates a time-limited key (`TNW-XXXX-XXXX-XXXX-XXXX`) for the purchased duration (**1-Month**, **3-Month**, **6-Month**, or **1-Year**).
3. **Activation & Ed25519 Signed Token:**
   - User enters their key on the **Activation Gate** screen.
   - Rust sends `{ license_key, hwid_hash, app_version }` over HTTPS to the activation endpoint.
   - If valid and unbound (or already bound to the same `hwid_hash`), the server returns an **Ed25519-signed license payload** (`plan`, `expires_at_utc`, `hwid_hash`, `issued_at_utc`, `grace_days`).
   - Rust verifies the Ed25519 signature using the embedded public key (`ed25519-dalek`) and saves the signed token in the OS credential vault (`keyring`).
4. **Offline Grace & Clock-Tamper Defense:**
   - Users can run the app offline for up to **7 days** between online heartbeats.
   - Rust updates a monotonic `last_seen_utc` timestamp on every launch and blocks activation if the system clock is rolled backward.
   - When `now_utc > expires_at_utc`, the app immediately locks back to the Activation Gate until renewed.

---

## 4. SQLite Local Database Schema (`data/tanawa_studio.db`)

- **`projects`**: `id`, `name`, `root_path`, `default_cta_url` (`https://tanawa.app`), `aspect_ratio`, `created_at`
- **`queue_jobs`**: `id`, `project_id`, `job_type` (`voiceover`, `edit_video`, `render_anim`, `transcribe`, `copy_meta`, `thumbnail`, `post_social`), `input_path`, `output_path`, `status` (`queued`, `running`, `completed`, `failed`), `progress_pct`, `error_msg`, `created_at`, `finished_at`
- **`ai_cache`**: `cache_key` (SHA-256 of media + prompt + provider), `provider`, `model`, `response_json`, `created_at`
- **`schedule_slots`**: `id`, `project_id`, `asset_path`, `platform` (`youtube`, `tiktok`, `instagram`, `facebook`, `x`), `scheduled_at_manila`, `cta_url`, `status`, `post_url`

---

## 5. Hardware-Accelerated FFmpeg Strategy (`scripts/common/ffmpeg_hw.py`)

At startup and before every render job, `ffmpeg_hw.py` probes `ffmpeg -hide_banner -encoders` and selects the fastest available H.264 encoder in priority order:
1. `h264_nvenc` (NVIDIA GPU)
2. `h264_qsv` (Intel QuickSync)
3. `h264_amf` (AMD GPU)
4. `h264_videotoolbox` (Apple Silicon / macOS)
5. `libx264 -preset medium -crf 20` (Universal CPU fallback)
