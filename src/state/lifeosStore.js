import { invoke } from "@tauri-apps/api/core";

const STORAGE_KEY = "tanawa.lifeos.bundle.v1";

const DEFAULT_BUNDLE = {
  brand_telos: {
    creator_name: "Tanawa Creator",
    brand_mission: "Automate daily short-form videos locally with $0 recurring AI bloat.",
    target_audience: "Solo creators, indie builders, and small business owners",
    voice_tone: "Clear, practical, energetic, zero-fluff",
    default_cta_url: "https://tanawa.app",
    forbidden_words: ["guarantee", "get rich quick"],
  },
  bot_personas: [
    {
      bot_id: "manager",
      display_name: "Studio Manager",
      role_focus: "Coordinates the batch, protects the schedule, and keeps every handoff moving.",
      voicestudio_voice_id: "Studio_Narrator_Warm_EN",
      speaking_style: "Calm, brisk, and reassuring with short status updates.",
    },
    {
      bot_id: "editor",
      display_name: "Video Editor",
      role_focus: "Trims pacing, crops framing, burns captions, and normalizes the final cut.",
      voicestudio_voice_id: "Studio_Cutter_Punchy_EN",
      speaking_style: "Fast, rhythmic, and decisive with clean beat changes.",
    },
    {
      bot_id: "animator",
      display_name: "Scene Animator",
      role_focus: "Directs sprite blocking, camera moves, and dialogue cues inside Three.js scenes.",
      voicestudio_voice_id: "Anime_Mascot_Bright_JP_EN",
      speaking_style: "Bright, playful, and energetic with clear cue calls.",
    },
    {
      bot_id: "seo_writer",
      display_name: "SEO Writer",
      role_focus: "Writes titles, descriptions, keywords, and CTA-aware social copy.",
      voicestudio_voice_id: "Studio_Scribe_Clear_EN",
      speaking_style: "Crisp, benefit-led, and SEO aware without hype.",
    },
    {
      bot_id: "thumbnails",
      display_name: "Thumbnail Artist",
      role_focus: "Chooses cover frames and composition that stay readable in feeds.",
      voicestudio_voice_id: "Studio_Designer_Bold_EN",
      speaking_style: "Punchy, visual, and confident about composition choices.",
    },
    {
      bot_id: "scheduler",
      display_name: "Queue Scheduler",
      role_focus: "Assigns Asia/Manila slots and keeps overnight publishing sequential.",
      voicestudio_voice_id: "Studio_Planner_Steady_EN",
      speaking_style: "Organized, calm, and precise about dates and times.",
    },
    {
      bot_id: "poster_cta",
      display_name: "Poster + CTA",
      role_focus: "Publishes approved media and naturally places the configured CTA link.",
      voicestudio_voice_id: "Studio_Closer_Friendly_EN",
      speaking_style: "Friendly, transparent, and never spammy when mentioning the CTA.",
    },
  ],
  guardrails: {
    require_cta_link: true,
    max_short_seconds: 58,
    enforce_vertical_9_16: true,
    banned_hashtags: ["#f4f", "#followforfollow"],
  },
};

let cachedBundle = null;
let statePromise = null;
let mutationQueue = Promise.resolve();
const listeners = new Set();

function cloneBundle(bundle) {
  return JSON.parse(JSON.stringify(bundle));
}

function defaultBundle() {
  return cloneBundle(DEFAULT_BUNDLE);
}

function cleanString(value, fallback = "") {
  if (typeof value === "string") return value;
  if (value === undefined || value === null) return fallback;
  return String(value);
}

function cleanList(value, fallback) {
  if (!Array.isArray(value)) return [...fallback];
  return value
    .map((item) => cleanString(item).trim())
    .filter(Boolean);
}

function normalizeBundle(input) {
  const fallback = defaultBundle();
  if (!input || typeof input !== "object") return fallback;

  const brandInput = input.brand_telos && typeof input.brand_telos === "object" ? input.brand_telos : {};
  const guardrailInput = input.guardrails && typeof input.guardrails === "object" ? input.guardrails : {};
  const personaInput = Array.isArray(input.bot_personas) ? input.bot_personas : [];
  const personasById = new Map();

  for (const persona of personaInput) {
    if (persona && typeof persona === "object" && persona.bot_id) {
      personasById.set(String(persona.bot_id), persona);
    }
  }

  const maxShortSeconds = Number(guardrailInput.max_short_seconds);

  return {
    brand_telos: {
      creator_name: cleanString(brandInput.creator_name, fallback.brand_telos.creator_name),
      brand_mission: cleanString(brandInput.brand_mission, fallback.brand_telos.brand_mission),
      target_audience: cleanString(brandInput.target_audience, fallback.brand_telos.target_audience),
      voice_tone: cleanString(brandInput.voice_tone, fallback.brand_telos.voice_tone),
      default_cta_url: cleanString(brandInput.default_cta_url, fallback.brand_telos.default_cta_url),
      forbidden_words: cleanList(brandInput.forbidden_words, fallback.brand_telos.forbidden_words),
    },
    bot_personas: fallback.bot_personas.map((fallbackPersona) => {
      const incoming = personasById.get(fallbackPersona.bot_id) || {};
      return {
        bot_id: fallbackPersona.bot_id,
        display_name: cleanString(incoming.display_name, fallbackPersona.display_name),
        role_focus: cleanString(incoming.role_focus, fallbackPersona.role_focus),
        voicestudio_voice_id: cleanString(
          incoming.voicestudio_voice_id,
          fallbackPersona.voicestudio_voice_id,
        ),
        speaking_style: cleanString(incoming.speaking_style, fallbackPersona.speaking_style),
      };
    }),
    guardrails: {
      require_cta_link:
        typeof guardrailInput.require_cta_link === "boolean"
          ? guardrailInput.require_cta_link
          : fallback.guardrails.require_cta_link,
      max_short_seconds:
        Number.isFinite(maxShortSeconds) && maxShortSeconds > 0
          ? Math.floor(maxShortSeconds)
          : fallback.guardrails.max_short_seconds,
      enforce_vertical_9_16:
        typeof guardrailInput.enforce_vertical_9_16 === "boolean"
          ? guardrailInput.enforce_vertical_9_16
          : fallback.guardrails.enforce_vertical_9_16,
      banned_hashtags: cleanList(guardrailInput.banned_hashtags, fallback.guardrails.banned_hashtags),
    },
  };
}

export function isTauriRuntime() {
  return (
    typeof window !== "undefined" &&
    Boolean(window.__TAURI_INTERNALS__ || window.__TAURI__)
  );
}

async function loadInitialBundle() {
  if (isTauriRuntime()) {
    return invoke("load_lifeos_profile");
  }

  if (typeof localStorage === "undefined") {
    return defaultBundle();
  }

  const stored = localStorage.getItem(STORAGE_KEY);
  if (!stored) return defaultBundle();

  try {
    return JSON.parse(stored);
  } catch {
    return defaultBundle();
  }
}

async function ensureLoaded() {
  if (!statePromise) {
    statePromise = loadInitialBundle()
      .then((bundle) => {
        cachedBundle = normalizeBundle(bundle);
        return cachedBundle;
      })
      .catch((error) => {
        statePromise = null;
        throw error;
      });
  }

  await statePromise;
  return cachedBundle;
}

function notifyListeners() {
  const snapshot = cloneBundle(cachedBundle);
  for (const listener of listeners) {
    listener(snapshot);
  }
}

function enqueueMutation(task) {
  const result = mutationQueue.then(task);
  mutationQueue = result.then(
    () => undefined,
    () => undefined,
  );
  return result;
}

export function subscribeLifeOs(listener) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

export async function getLifeOsState() {
  await ensureLoaded();
  return cloneBundle(cachedBundle);
}

export function updateBrandTelos(patch) {
  return enqueueMutation(async () => {
    const current = await ensureLoaded();
    cachedBundle = normalizeBundle({
      ...current,
      brand_telos: {
        ...current.brand_telos,
        ...patch,
      },
    });
    notifyListeners();
    return cloneBundle(cachedBundle);
  });
}

export function updateBotPersona(botId, patch) {
  return enqueueMutation(async () => {
    const current = await ensureLoaded();
    cachedBundle = normalizeBundle({
      ...current,
      bot_personas: current.bot_personas.map((persona) =>
        persona.bot_id === botId ? { ...persona, ...patch } : persona,
      ),
    });
    notifyListeners();
    return cloneBundle(cachedBundle);
  });
}

export function updateGuardrails(patch) {
  return enqueueMutation(async () => {
    const current = await ensureLoaded();
    cachedBundle = normalizeBundle({
      ...current,
      guardrails: {
        ...current.guardrails,
        ...patch,
      },
    });
    notifyListeners();
    return cloneBundle(cachedBundle);
  });
}

export function saveLifeOsProfile() {
  return enqueueMutation(async () => {
    const bundle = normalizeBundle(await ensureLoaded());

    if (isTauriRuntime()) {
      await invoke("save_lifeos_profile", { bundle: cloneBundle(bundle) });
    } else if (typeof localStorage !== "undefined") {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(bundle));
    }

    cachedBundle = bundle;
    notifyListeners();
    return cloneBundle(bundle);
  });
}

function cleanPromptText(value) {
  return String(value ?? "").trim().replace(/\s+/g, " ");
}

function compactPromptText(value, maxChars) {
  const cleaned = cleanPromptText(value);
  const chars = Array.from(cleaned);
  if (chars.length <= maxChars) return cleaned;
  return `${chars.slice(0, Math.max(0, maxChars - 1)).join("")}…`;
}

function compactPromptList(values, maxItems, maxChars) {
  const items = (Array.isArray(values) ? values : [])
    .map((value) => compactPromptText(value, maxChars))
    .filter(Boolean)
    .slice(0, maxItems);
  return items.length ? items.join("; ") : "none";
}

export function buildPromptBrief(bundle) {
  const normalized = normalizeBundle(bundle);
  const brand = normalized.brand_telos;
  const guardrails = normalized.guardrails;

  return [
    "BRAND_TELOS",
    `Creator: ${compactPromptText(brand.creator_name, 80)}`,
    `Mission: ${compactPromptText(brand.brand_mission, 120)}`,
    `Audience: ${compactPromptText(brand.target_audience, 100)}`,
    `Voice: ${compactPromptText(brand.voice_tone, 80)}`,
    `CTA: ${compactPromptText(brand.default_cta_url, 80)}`,
    `Avoid: ${compactPromptList(brand.forbidden_words, 8, 32)}`,
    `Rules: CTA ${guardrails.require_cta_link ? "required" : "optional"}; max ${guardrails.max_short_seconds}s; ${guardrails.enforce_vertical_9_16 ? "9:16" : "any"} vertical; banned hashtags: ${compactPromptList(guardrails.banned_hashtags, 8, 32)}`,
  ].join("\n");
}

export async function previewPromptBrief(bundle) {
  const source = bundle === undefined ? await ensureLoaded() : bundle;
  return buildPromptBrief(source);
}
