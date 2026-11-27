# Phase 01.1 — LifeOS Persistent Brand Identity, Guardrails & Bot Persona Layer

> **Mandatory Context for AI Coding Agents:**
> Before writing or editing any file, read and strictly obey:
>
> 1. **`AGENTS.md`** — Enforces the **Warm Sunlit Atelier ("Morning Light")** color palette (zero dark-blue/slate/indigo colors), standalone brand isolation from `tanawa.app`, Vite frontend bundling (no Next.js), and `npm` build standardization.
>
> 2. **`docs/project-doc.md`** — Defines the master architecture, confirmed tool versions, and repository layout.
>
> 3. **`docs/scope/phase-01.md`** — Preserves the existing Tauri v2 desktop shell, system tray behavior, and separated page lifecycle (`#office`, `#studio`, `#queue`, `#settings`).
>
> 4. **`docs/references/`** — Read-only HTML prototypes (`tanawa_24_7_bot_virtual_office.html` and `hd_2d_pixel_art_sprite_3d_world_studio.html`). **Do not modify or delete any file inside `docs/references/`.**

---

## 1. Phase 01.1 Single-System Scope

Phase 01.1 adapts **Daniel Miessler's LifeOS (Personal AI Infrastructure)** architecture directly into **Tanawa 24/7 Bot** as a lightweight, self-contained user memory and brand-identity layer (`Brand TELOS`) so the desktop app never treats video scripts, captions, or bot personas as a blank slate.

Rather than bundling LifeOS's external Bun/Claude CLI harness into the `.exe`, Phase 01.1 builds a native local **`Brand & Persona Identity System`** stored in human-readable Markdown + JSON (`data/lifeos/`) and exposed in the desktop UI:

1. **Persistent Brand TELOS (`data/lifeos/BRAND_TELOS.md` + `identity.json`):** Stores the creator's mission, target audience, brand voice rules, forbidden words/topics, and default CTA URL (`https://tanawa.app`) once so every future Python batch worker injects compact context automatically.
2. **Algorithmic Pre-Flight Guardrails (`data/lifeos/guardrails.json`):** Declarative content rules (CTA link presence, aspect ratio checks, max duration, and banned hashtag filters) that Python workers will validate before rendering or posting.
3. **Studio Bot Voice & Role Personas (`data/lifeos/bot_personas.json`):** Maps each of the 7 studio specialists (*Manager, Editor, Animator, SEO Writer, Thumbnails, Scheduler, Poster + CTA*) to a distinct speaking role and local **VoiceStudio (`localhost:3900`)** voice preset.
4. **Rust IPC Persistence (`src-tauri/src/lifeos.rs`):** Safe Tauri commands to read, save, and export the compact prompt-injection summary for downstream Python workers.
5. **LifeOS Brand Identity UI Card:** A clean, Morning-Light-styled **Brand TELOS & Bot Personas** panel integrated into **`#settings` (`EnginesByokPage.js`)** (and summarized as a read-only badge in `TopStatusBar.js`).

### Explicitly Out of Scope (Do Not Build in Phase 01.1)
- Hardware-ID (HWID) subscription activation gate or Ed25519 verification *(reserved for `docs/scope/phase-02.md`)*.
- Full SQLite database schema (`tanawa_studio.db`) or OS Keyring BYOK secret storage *(reserved for `docs/scope/phase-03.md`)*.
- Full Three.js 3D scenes, sprite animations, or live WebGL loops *(reserved for `docs/scope/phase-04.md` & `docs/scope/phase-05.md`)*.
- Python batch scripts inside `scripts/` *(reserved for `docs/scope/phase-06.md` through `phase-10.md`)*.

---

## 2. LifeOS Architecture Mapping

| LifeOS Core Concept | Tanawa 24/7 Bot Implementation | Why It Saves Tokens & Prevents Drift |
| :--- | :--- | :--- |
| **`USER/TELOS/` & `PRINCIPAL_IDENTITY.md`** | `data/lifeos/BRAND_TELOS.md` & `identity.json` | Defines creator niche, audience, tone, and `https://tanawa.app` CTA once instead of repeating long system prompts on every video. |
| **Compact Per-Turn Context Injection** | `get_lifeos_prompt_context` Rust IPC command | Produces a deterministic `<250`-token brand brief ready for single-shot cached JSON calls in later Python phases. |
| **Algorithmic Constraint Extraction** | `data/lifeos/guardrails.json` | Enforces hard rules (must include CTA URL, blocked words list, target clip length) before any video enters `ready-to-post/`. |
| **Voice Personality System** | `data/lifeos/bot_personas.json` | Assigns each studio specialist a default VoiceStudio (`:3900`) voice ID, pitch/speed style, and catchphrase cadence. |

---

## 3. Step-by-Step Implementation Tasks

### Task 1.1.1 — Create Local LifeOS Profile Data Schema (`src-tauri/src/lifeos.rs`)
Create `src-tauri/src/lifeos.rs` and register its commands in `src-tauri/src/main.rs`:
- Resolve the local app data directory `data/lifeos/` (auto-creating the folder and default files on first launch if missing).
- Define Rust structs (`Serialize`, `Deserialize`):
  - `BrandTelosProfile`:
    - `creator_name`: `String` (default `"Tanawa Creator"`)
    - `brand_mission`: `String` (default `"Automate daily short-form videos locally with $0 recurring AI bloat."`)
    - `target_audience`: `String` (default `"Solo creators, indie builders, and small business owners"`)
    - `voice_tone`: `String` (default `"Clear, practical, energetic, zero-fluff"`)
    - `default_cta_url`: `String` (default `"https://tanawa.app"`)
    - `forbidden_words`: `Vec<String>` (default `["guarantee", "get rich quick"]`)
  - `BotPersona`:
    - `bot_id`: `String` (`manager`, `editor`, `animator`, `seo_writer`, `thumbnails`, `scheduler`, `poster_cta`)
    - `display_name`: `String`
    - `role_focus`: `String`
    - `voicestudio_voice_id`: `String` (e.g., `"Anime_Mascot_Bright_JP_EN"`, `"Studio_Narrator_Warm_EN"`)
    - `speaking_style`: `String`
  - `GuardrailRules`:
    - `require_cta_link`: `bool` (default `true`)
    - `max_short_seconds`: `u32` (default `58`)
    - `enforce_vertical_9_16`: `bool` (default `true`)
    - `banned_hashtags`: `Vec<String>` (default `["#f4f", "#followforfollow"]`)
  - `LifeOsBundle`: combines `BrandTelosProfile`, `Vec<BotPersona>`, and `GuardrailRules`.
- Expose Tauri IPC commands:
  - `load_lifeos_profile() -> Result<LifeOsBundle, String>`
  - `save_lifeos_profile(bundle: LifeOsBundle) -> Result<String, String>` — Writes `data/lifeos/identity.json`, `data/lifeos/bot_personas.json`, `data/lifeos/guardrails.json`, and renders a clean human-readable `data/lifeos/BRAND_TELOS.md` summary file.
  - `get_lifeos_prompt_context() -> Result<String, String>` — Returns a compact, deterministic plain-text prompt header summarizing the brand voice, CTA URL, and forbidden words.

### Task 1.1.2 — Frontend State Store & IPC Wrapper (`src/state/lifeosStore.js`)
Create `src/state/lifeosStore.js`:
- Calls `@tauri-apps/api/core` (`invoke('load_lifeos_profile')` and `invoke('save_lifeos_profile', { bundle })`) when running inside the native Tauri window, with a clean `localStorage` fallback when previewing in Vite dev mode without Tauri.
- Exposes `getLifeOsState()`, `updateBrandTelos(patch)`, `updateBotPersona(botId, patch)`, `updateGuardrails(patch)`, and `previewPromptBrief()`.

### Task 1.1.3 — Add Brand TELOS & Bot Personas UI (`src/pages/EnginesByokPage.js` & `src/components/TopStatusBar.js`)
Update **`src/pages/EnginesByokPage.js`** (`#settings`) using the **Warm Sunlit Atelier ("Morning Light")** palette (`#FAF6F0`, `#F3ECE1`, `#FFFFFF`, `#E2D7C5`, `#1F1A17`, `#D96B43`, `#3F7D58`):
- **Section A — Brand TELOS & Creator Identity:** Form inputs for Creator/Brand Name, Mission, Target Audience, Voice & Tone, Default CTA URL (`https://tanawa.app`), and comma-separated Forbidden Words, plus a **"Save Brand TELOS"** button and live **"Prompt Context Preview"** box.
- **Section B — Pre-Flight Algorithmic Guardrails:** Toggle switches for *Require CTA URL in Captions*, *Enforce 9:16 Vertical Framing*, Max Short Duration (`seconds`), and Banned Hashtags.
- **Section C — 7 Studio Bot Voice Personas:** Compact card list mapping each studio specialist to their VoiceStudio (`:3900`) voice preset ID and speaking style.
- **TopStatusBar Badge (`src/components/TopStatusBar.js`):** Add a subtle `"TELOS: Active"` pill next to `$0 Local-First` that navigates to `#settings` when clicked.
- **Strict Separation Rule:** Keep `#office` (`VirtualOfficePage.js`) and `#studio` (`CodeFilmStudioPage.js`) completely untouched in Phase 01.1.

---

## 4. Mandatory Phase 01.1 Verification Gate

Phase 01.1 is complete **only** when all checks below pass with zero errors:

1. **Frontend Build Check:**
   ```bash
   npm run build
   ```
   *Expected:* Vite bundles `dist/` cleanly with exit code `0` and zero warnings or missing imports.

2. **Rust Core Compilation Check:**
   ```bash
   cargo check --manifest-path src-tauri/Cargo.toml
   ```
   *Expected:* `src-tauri/src/lifeos.rs` and updated `main.rs` compile with zero errors.

3. **Native Desktop Smoke Test:**
   - Run `npm run tauri dev` and navigate to **Engines & BYOK (`#settings`)**.
   - Edit the Brand Mission, Forbidden Words, or a Bot's VoiceStudio preset ID, click **Save Brand TELOS**, and verify that `data/lifeos/BRAND_TELOS.md` and `data/lifeos/identity.json` are created on disk and persist across app restarts.
   - Verify `#office` and `#studio` remain clean and unaffected.
