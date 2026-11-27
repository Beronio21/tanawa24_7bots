use serde::{de::DeserializeOwned, Deserialize, Serialize};
use std::{
    env, fs,
    path::{Path, PathBuf},
};
use tauri::{AppHandle, Manager};

const IDENTITY_FILE: &str = "identity.json";
const PERSONAS_FILE: &str = "bot_personas.json";
const GUARDRAILS_FILE: &str = "guardrails.json";
const MARKDOWN_FILE: &str = "BRAND_TELOS.md";

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(default)]
pub struct BrandTelosProfile {
    pub creator_name: String,
    pub brand_mission: String,
    pub target_audience: String,
    pub voice_tone: String,
    pub default_cta_url: String,
    pub forbidden_words: Vec<String>,
}

impl Default for BrandTelosProfile {
    fn default() -> Self {
        Self {
            creator_name: "Tanawa Creator".to_string(),
            brand_mission: "Automate daily short-form videos locally with $0 recurring AI bloat."
                .to_string(),
            target_audience: "Solo creators, indie builders, and small business owners".to_string(),
            voice_tone: "Clear, practical, energetic, zero-fluff".to_string(),
            default_cta_url: "https://tanawa.app".to_string(),
            forbidden_words: vec!["guarantee".to_string(), "get rich quick".to_string()],
        }
    }
}

#[derive(Debug, Clone, Default, Serialize, Deserialize)]
#[serde(default)]
pub struct BotPersona {
    pub bot_id: String,
    pub display_name: String,
    pub role_focus: String,
    pub voicestudio_voice_id: String,
    pub speaking_style: String,
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(default)]
pub struct GuardrailRules {
    pub require_cta_link: bool,
    pub max_short_seconds: u32,
    pub enforce_vertical_9_16: bool,
    pub banned_hashtags: Vec<String>,
}

impl Default for GuardrailRules {
    fn default() -> Self {
        Self {
            require_cta_link: true,
            max_short_seconds: 58,
            enforce_vertical_9_16: true,
            banned_hashtags: vec!["#f4f".to_string(), "#followforfollow".to_string()],
        }
    }
}

#[derive(Debug, Clone, Serialize, Deserialize)]
#[serde(default)]
pub struct LifeOsBundle {
    pub brand_telos: BrandTelosProfile,
    pub bot_personas: Vec<BotPersona>,
    pub guardrails: GuardrailRules,
}

impl Default for LifeOsBundle {
    fn default() -> Self {
        Self {
            brand_telos: BrandTelosProfile::default(),
            bot_personas: default_bot_personas(),
            guardrails: GuardrailRules::default(),
        }
    }
}

fn default_bot_personas() -> Vec<BotPersona> {
    vec![
        BotPersona {
            bot_id: "manager".to_string(),
            display_name: "Studio Manager".to_string(),
            role_focus:
                "Coordinates the batch, protects the schedule, and keeps every handoff moving."
                    .to_string(),
            voicestudio_voice_id: "Studio_Narrator_Warm_EN".to_string(),
            speaking_style: "Calm, brisk, and reassuring with short status updates.".to_string(),
        },
        BotPersona {
            bot_id: "editor".to_string(),
            display_name: "Video Editor".to_string(),
            role_focus:
                "Trims pacing, crops framing, burns captions, and normalizes the final cut."
                    .to_string(),
            voicestudio_voice_id: "Studio_Cutter_Punchy_EN".to_string(),
            speaking_style: "Fast, rhythmic, and decisive with clean beat changes.".to_string(),
        },
        BotPersona {
            bot_id: "animator".to_string(),
            display_name: "Scene Animator".to_string(),
            role_focus:
                "Directs sprite blocking, camera moves, and dialogue cues inside Three.js scenes."
                    .to_string(),
            voicestudio_voice_id: "Anime_Mascot_Bright_JP_EN".to_string(),
            speaking_style: "Bright, playful, and energetic with clear cue calls.".to_string(),
        },
        BotPersona {
            bot_id: "seo_writer".to_string(),
            display_name: "SEO Writer".to_string(),
            role_focus: "Writes titles, descriptions, keywords, and CTA-aware social copy."
                .to_string(),
            voicestudio_voice_id: "Studio_Scribe_Clear_EN".to_string(),
            speaking_style: "Crisp, benefit-led, and SEO aware without hype.".to_string(),
        },
        BotPersona {
            bot_id: "thumbnails".to_string(),
            display_name: "Thumbnail Artist".to_string(),
            role_focus: "Chooses cover frames and composition that stay readable in feeds."
                .to_string(),
            voicestudio_voice_id: "Studio_Designer_Bold_EN".to_string(),
            speaking_style: "Punchy, visual, and confident about composition choices.".to_string(),
        },
        BotPersona {
            bot_id: "scheduler".to_string(),
            display_name: "Queue Scheduler".to_string(),
            role_focus: "Assigns Asia/Manila slots and keeps overnight publishing sequential."
                .to_string(),
            voicestudio_voice_id: "Studio_Planner_Steady_EN".to_string(),
            speaking_style: "Organized, calm, and precise about dates and times.".to_string(),
        },
        BotPersona {
            bot_id: "poster_cta".to_string(),
            display_name: "Poster + CTA".to_string(),
            role_focus: "Publishes approved media and naturally places the configured CTA link."
                .to_string(),
            voicestudio_voice_id: "Studio_Closer_Friendly_EN".to_string(),
            speaking_style: "Friendly, transparent, and never spammy when mentioning the CTA."
                .to_string(),
        },
    ]
}

fn project_root() -> Option<PathBuf> {
    let current_dir = env::current_dir().ok()?;
    current_dir
        .ancestors()
        .find(|ancestor| {
            ancestor.join("src-tauri").is_dir() || ancestor.join("package.json").is_file()
        })
        .map(|path| path.to_path_buf())
}

fn lifeos_dir(app: &AppHandle) -> Result<PathBuf, String> {
    if let Some(root) = project_root() {
        return Ok(root.join("data").join("lifeos"));
    }

    let app_data_dir = app
        .path()
        .app_data_dir()
        .map_err(|error| format!("Could not resolve the app data directory: {error}"))?;
    Ok(app_data_dir.join("data").join("lifeos"))
}

fn write_json<T: Serialize>(path: &Path, value: &T) -> Result<(), String> {
    let json = serde_json::to_string_pretty(value)
        .map_err(|error| format!("Could not serialize {}: {error}", path.display()))?;
    fs::write(path, format!("{json}\n"))
        .map_err(|error| format!("Could not write {}: {error}", path.display()))
}

fn read_or_create_json<T>(path: &Path, default: &T) -> Result<T, String>
where
    T: Serialize + DeserializeOwned + Clone,
{
    if !path.exists() {
        write_json(path, default)?;
        return Ok(default.clone());
    }

    let text = fs::read_to_string(path)
        .map_err(|error| format!("Could not read {}: {error}", path.display()))?;
    serde_json::from_str(&text)
        .map_err(|error| format!("Could not parse {}: {error}", path.display()))
}

fn clean_text(value: &str) -> String {
    value.split_whitespace().collect::<Vec<_>>().join(" ")
}

fn clean_list(values: &[String]) -> Vec<String> {
    values
        .iter()
        .map(|value| clean_text(value))
        .filter(|value| !value.is_empty())
        .collect()
}

fn normalize_personas(personas: &[BotPersona]) -> Vec<BotPersona> {
    default_bot_personas()
        .into_iter()
        .map(|default| {
            personas
                .iter()
                .find(|persona| persona.bot_id == default.bot_id)
                .cloned()
                .unwrap_or(default)
        })
        .collect()
}

fn normalize_bundle(bundle: &LifeOsBundle) -> LifeOsBundle {
    let mut normalized = bundle.clone();
    normalized.brand_telos.creator_name = clean_text(&normalized.brand_telos.creator_name);
    normalized.brand_telos.brand_mission = clean_text(&normalized.brand_telos.brand_mission);
    normalized.brand_telos.target_audience = clean_text(&normalized.brand_telos.target_audience);
    normalized.brand_telos.voice_tone = clean_text(&normalized.brand_telos.voice_tone);
    normalized.brand_telos.default_cta_url = clean_text(&normalized.brand_telos.default_cta_url);
    normalized.brand_telos.forbidden_words = clean_list(&normalized.brand_telos.forbidden_words);

    for persona in &mut normalized.bot_personas {
        persona.bot_id = clean_text(&persona.bot_id);
        persona.display_name = clean_text(&persona.display_name);
        persona.role_focus = clean_text(&persona.role_focus);
        persona.voicestudio_voice_id = clean_text(&persona.voicestudio_voice_id);
        persona.speaking_style = clean_text(&persona.speaking_style);
    }
    normalized.bot_personas = normalize_personas(&normalized.bot_personas);

    normalized.guardrails.banned_hashtags = clean_list(&normalized.guardrails.banned_hashtags);
    if normalized.guardrails.max_short_seconds == 0 {
        normalized.guardrails.max_short_seconds = GuardrailRules::default().max_short_seconds;
    }

    normalized
}

fn inline(value: &str) -> String {
    clean_text(value)
}

fn table_cell(value: &str) -> String {
    inline(value).replace('|', "\\|")
}

fn render_markdown(bundle: &LifeOsBundle) -> String {
    let bundle = normalize_bundle(bundle);
    let brand = &bundle.brand_telos;
    let guardrails = &bundle.guardrails;
    let mut markdown = String::new();

    markdown.push_str("# Brand TELOS\n\n");
    markdown.push_str("Persistent brand identity for Tanawa 24/7 Bot. Workers should read the compact prompt context generated from this profile instead of repeating long instructions.\n\n");

    markdown.push_str("## Creator identity\n\n");
    markdown.push_str(&format!(
        "- **Creator / brand:** {}\n",
        inline(&brand.creator_name)
    ));
    markdown.push_str(&format!(
        "- **Mission:** {}\n",
        inline(&brand.brand_mission)
    ));
    markdown.push_str(&format!(
        "- **Target audience:** {}\n",
        inline(&brand.target_audience)
    ));
    markdown.push_str(&format!(
        "- **Voice and tone:** {}\n",
        inline(&brand.voice_tone)
    ));
    markdown.push_str(&format!(
        "- **Default CTA URL:** {}\n",
        inline(&brand.default_cta_url)
    ));

    markdown.push_str("\n## Forbidden words and topics\n\n");
    if brand.forbidden_words.is_empty() {
        markdown.push_str("- None configured.\n");
    } else {
        for word in &brand.forbidden_words {
            markdown.push_str(&format!("- {}\n", inline(word)));
        }
    }

    markdown.push_str("\n## Studio bot voice personas\n\n");
    markdown.push_str("| Bot | Role focus | VoiceStudio voice | Speaking style |\n");
    markdown.push_str("| --- | --- | --- | --- |\n");
    for persona in &bundle.bot_personas {
        markdown.push_str(&format!(
            "| {} | {} | {} | {} |\n",
            table_cell(&persona.display_name),
            table_cell(&persona.role_focus),
            table_cell(&persona.voicestudio_voice_id),
            table_cell(&persona.speaking_style)
        ));
    }

    markdown.push_str("\n## Pre-flight guardrails\n\n");
    markdown.push_str(&format!(
        "- **Require CTA link in captions:** {}\n",
        if guardrails.require_cta_link {
            "yes"
        } else {
            "no"
        }
    ));
    markdown.push_str(&format!(
        "- **Maximum short duration:** {} seconds\n",
        guardrails.max_short_seconds
    ));
    markdown.push_str(&format!(
        "- **Enforce 9:16 vertical framing:** {}\n",
        if guardrails.enforce_vertical_9_16 {
            "yes"
        } else {
            "no"
        }
    ));
    if guardrails.banned_hashtags.is_empty() {
        markdown.push_str("- **Banned hashtags:** none configured.\n");
    } else {
        markdown.push_str(&format!(
            "- **Banned hashtags:** {}\n",
            guardrails
                .banned_hashtags
                .iter()
                .map(|tag| inline(tag))
                .collect::<Vec<_>>()
                .join(", ")
        ));
    }

    markdown
}

fn compact(value: &str, max_chars: usize) -> String {
    let cleaned = clean_text(value);
    let chars: Vec<char> = cleaned.chars().collect();
    if chars.len() <= max_chars {
        return cleaned;
    }
    let mut shortened: String = chars
        .into_iter()
        .take(max_chars.saturating_sub(1))
        .collect();
    shortened.push('…');
    shortened
}

fn compact_list(values: &[String], max_items: usize, max_chars: usize) -> String {
    let items: Vec<String> = values
        .iter()
        .map(|value| compact(value, max_chars))
        .filter(|value| !value.is_empty())
        .take(max_items)
        .collect();
    if items.is_empty() {
        "none".to_string()
    } else {
        items.join("; ")
    }
}

pub fn prompt_context(bundle: &LifeOsBundle) -> String {
    let bundle = normalize_bundle(bundle);
    let brand = &bundle.brand_telos;
    let guardrails = &bundle.guardrails;

    format!(
        "BRAND_TELOS\nCreator: {}\nMission: {}\nAudience: {}\nVoice: {}\nCTA: {}\nAvoid: {}\nRules: CTA {}; max {}s; {} vertical; banned hashtags: {}",
        compact(&brand.creator_name, 80),
        compact(&brand.brand_mission, 120),
        compact(&brand.target_audience, 100),
        compact(&brand.voice_tone, 80),
        compact(&brand.default_cta_url, 80),
        compact_list(&brand.forbidden_words, 8, 32),
        if guardrails.require_cta_link { "required" } else { "optional" },
        guardrails.max_short_seconds,
        if guardrails.enforce_vertical_9_16 { "9:16" } else { "any" },
        compact_list(&guardrails.banned_hashtags, 8, 32)
    )
}

fn load_bundle(dir: &Path) -> Result<LifeOsBundle, String> {
    fs::create_dir_all(dir)
        .map_err(|error| format!("Could not create {}: {error}", dir.display()))?;

    let brand_telos = read_or_create_json(&dir.join(IDENTITY_FILE), &BrandTelosProfile::default())?;
    let bot_personas = read_or_create_json(&dir.join(PERSONAS_FILE), &default_bot_personas())?;
    let guardrails = read_or_create_json(&dir.join(GUARDRAILS_FILE), &GuardrailRules::default())?;
    let bundle = normalize_bundle(&LifeOsBundle {
        brand_telos,
        bot_personas,
        guardrails,
    });

    let markdown_path = dir.join(MARKDOWN_FILE);
    if !markdown_path.exists() {
        fs::write(&markdown_path, render_markdown(&bundle))
            .map_err(|error| format!("Could not write {}: {error}", markdown_path.display()))?;
    }

    Ok(bundle)
}

fn save_bundle(dir: &Path, bundle: &LifeOsBundle) -> Result<String, String> {
    fs::create_dir_all(dir)
        .map_err(|error| format!("Could not create {}: {error}", dir.display()))?;

    let bundle = normalize_bundle(bundle);
    write_json(&dir.join(IDENTITY_FILE), &bundle.brand_telos)?;
    write_json(&dir.join(PERSONAS_FILE), &bundle.bot_personas)?;
    write_json(&dir.join(GUARDRAILS_FILE), &bundle.guardrails)?;
    fs::write(dir.join(MARKDOWN_FILE), render_markdown(&bundle)).map_err(|error| {
        format!(
            "Could not write {}: {error}",
            dir.join(MARKDOWN_FILE).display()
        )
    })?;

    Ok(format!("Saved Brand TELOS to {}", dir.display()))
}

pub fn initialize(app: &AppHandle) -> Result<(), String> {
    load_bundle(&lifeos_dir(app)?).map(|_| ())
}

#[tauri::command]
pub fn load_lifeos_profile(app: AppHandle) -> Result<LifeOsBundle, String> {
    load_bundle(&lifeos_dir(&app)?)
}

#[tauri::command]
pub fn save_lifeos_profile(bundle: LifeOsBundle, app: AppHandle) -> Result<String, String> {
    save_bundle(&lifeos_dir(&app)?, &bundle)
}

#[tauri::command]
pub fn get_lifeos_prompt_context(app: AppHandle) -> Result<String, String> {
    let bundle = load_bundle(&lifeos_dir(&app)?)?;
    Ok(prompt_context(&bundle))
}
