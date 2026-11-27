import {
  getLifeOsState,
  isTauriRuntime,
  previewPromptBrief,
  saveLifeOsProfile,
  updateBotPersona,
  updateBrandTelos,
  updateGuardrails,
} from "../state/lifeosStore.js";

let disposeCurrentPage = () => {};

const escapeHtml = (value = "") =>
  String(value).replace(/[&<>"']/g, (character) => {
    const entities = {
      "&": "&amp;",
      "<": "&lt;",
      ">": "&gt;",
      '"': "&quot;",
      "'": "&#39;",
    };
    return entities[character];
  });

const listToInput = (values) => (Array.isArray(values) ? values : []).join(", ");

const parseListInput = (value) =>
  String(value || "")
    .split(",")
    .map((item) => item.trim())
    .filter(Boolean);

function personaCard(persona, index) {
  return `
    <article class="persona-card" data-bot-id="${escapeHtml(persona.bot_id)}">
      <header class="persona-card-header">
        <span class="persona-index" aria-hidden="true">${String(index + 1).padStart(2, "0")}</span>
        <div>
          <h3>${escapeHtml(persona.display_name)}</h3>
          <span>${escapeHtml(persona.bot_id)}</span>
        </div>
      </header>
      <label class="field">
        <span>Role focus</span>
        <input data-persona-field="role_focus" type="text" value="${escapeHtml(persona.role_focus)}" autocomplete="off" />
      </label>
      <label class="field">
        <span>VoiceStudio voice ID</span>
        <input data-persona-field="voicestudio_voice_id" type="text" value="${escapeHtml(persona.voicestudio_voice_id)}" autocomplete="off" />
      </label>
      <label class="field">
        <span>Speaking style</span>
        <input data-persona-field="speaking_style" type="text" value="${escapeHtml(persona.speaking_style)}" autocomplete="off" />
      </label>
    </article>
  `;
}

function loadedPage(state) {
  const brand = state.brand_telos;
  const guardrails = state.guardrails;

  return `
    <section class="page-heading" aria-labelledby="engines-title">
      <div class="page-heading-copy">
        <span class="eyebrow">Page 04 · Identity, guardrails &amp; local tools</span>
        <h1 id="engines-title">Engines &amp; BYOK</h1>
        <p>Keep your brand voice, publishing rules, and studio specialists consistent while local engines stay close to your work.</p>
      </div>
      <span class="status-pill ready"><span class="status-dot" aria-hidden="true"></span>TELOS active</span>
    </section>

    <div class="lifeos-layout">
      <section class="card lifeos-card" aria-labelledby="brand-telos-title">
        <div class="card-heading">
          <div>
            <h2 id="brand-telos-title">Brand TELOS &amp; creator identity</h2>
            <p>The compact identity every worker should inherit before writing or speaking.</p>
          </div>
          <span class="stage-label">data/lifeos</span>
        </div>

        <form id="brand-telos-form" class="lifeos-form" novalidate>
          <div class="form-grid">
            <label class="field">
              <span>Creator / brand name</span>
              <input name="creator_name" type="text" value="${escapeHtml(brand.creator_name)}" autocomplete="organization" />
            </label>
            <label class="field">
              <span>Default CTA URL</span>
              <input name="default_cta_url" type="url" value="${escapeHtml(brand.default_cta_url)}" autocomplete="url" />
            </label>
            <label class="field field-wide">
              <span>Brand mission</span>
              <textarea name="brand_mission" rows="3">${escapeHtml(brand.brand_mission)}</textarea>
            </label>
            <label class="field">
              <span>Target audience</span>
              <input name="target_audience" type="text" value="${escapeHtml(brand.target_audience)}" autocomplete="off" />
            </label>
            <label class="field">
              <span>Voice and tone</span>
              <input name="voice_tone" type="text" value="${escapeHtml(brand.voice_tone)}" autocomplete="off" />
            </label>
            <label class="field field-wide">
              <span>Forbidden words</span>
              <input name="forbidden_words" type="text" value="${escapeHtml(listToInput(brand.forbidden_words))}" autocomplete="off" />
              <small>Separate entries with commas. Workers should avoid these phrases.</small>
            </label>
          </div>

          <div class="lifeos-actions">
            <button class="primary-button" type="submit">Save Brand TELOS</button>
            <p class="save-status" id="lifeos-save-status" role="status" aria-live="polite">Edits stay local until you save.</p>
          </div>
        </form>

        <div class="prompt-preview-card" aria-labelledby="prompt-preview-title">
          <div class="prompt-preview-heading">
            <strong id="prompt-preview-title">Prompt Context Preview</strong>
            <span>Compact worker brief</span>
          </div>
          <pre class="prompt-preview" id="prompt-preview"></pre>
        </div>
      </section>

      <div class="lifeos-side">
        <section class="card lifeos-card" aria-labelledby="guardrails-title">
          <div class="card-heading">
            <div>
              <h2 id="guardrails-title">Pre-flight guardrails</h2>
              <p>Rules checked before media is rendered or posted.</p>
            </div>
            <span class="stage-label">guardrails.json</span>
          </div>

          <div class="guardrail-list">
            <label class="switch-control">
              <input class="sr-only" id="require_cta_link" type="checkbox" ${guardrails.require_cta_link ? "checked" : ""} />
              <span class="switch-track" aria-hidden="true"><span class="switch-thumb"></span></span>
              <span class="switch-label">
                <strong>Require CTA URL in captions</strong>
                <small>Descriptions and first comments must include the default CTA.</small>
              </span>
            </label>

            <label class="switch-control">
              <input class="sr-only" id="enforce_vertical_9_16" type="checkbox" ${guardrails.enforce_vertical_9_16 ? "checked" : ""} />
              <span class="switch-track" aria-hidden="true"><span class="switch-thumb"></span></span>
              <span class="switch-label">
                <strong>Enforce 9:16 vertical framing</strong>
                <small>Short-form renders should stay portrait unless a project overrides it.</small>
              </span>
            </label>

            <label class="field">
              <span>Max short duration</span>
              <input id="max_short_seconds" type="number" min="1" max="600" step="1" value="${escapeHtml(guardrails.max_short_seconds)}" />
              <small>Seconds for short-form outputs.</small>
            </label>

            <label class="field">
              <span>Banned hashtags</span>
              <input id="banned_hashtags" type="text" value="${escapeHtml(listToInput(guardrails.banned_hashtags))}" autocomplete="off" />
              <small>Separate entries with commas.</small>
            </label>
          </div>
        </section>

        <section class="card lifeos-note" aria-labelledby="lifeos-files-title">
          <span class="status-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M6 3h9l3 3v15H6z"/><path d="M14 3v4h4M9 12h6M9 16h6"/></svg>
          </span>
          <h2 id="lifeos-files-title">Readable local memory</h2>
          <p>Brand identity, guardrails, and bot personas are stored as Markdown and JSON so future workers can reuse them without repeating prompts.</p>
          <ul class="lifeos-file-list">
            <li>BRAND_TELOS.md</li>
            <li>identity.json</li>
            <li>guardrails.json</li>
            <li>bot_personas.json</li>
          </ul>
        </section>
      </div>
    </div>

    <section class="card lifeos-card persona-section section-gap" aria-labelledby="personas-title">
      <div class="card-heading">
        <div>
          <h2 id="personas-title">Studio bot voice personas</h2>
          <p>Seven specialists with VoiceStudio presets for localhost:3900.</p>
        </div>
        <span class="stage-label">7 roles</span>
      </div>
      <div class="persona-grid">
        ${state.bot_personas.map(personaCard).join("")}
      </div>
    </section>

    <section class="lifeos-secondary section-gap" aria-labelledby="local-tools-title">
      <div class="section-heading">
        <span class="eyebrow">Local engines &amp; optional services</span>
        <h2 id="local-tools-title">Tools that stay close to your work</h2>
        <p>Check the local engines that power your studio and keep optional providers separate from your media workflow.</p>
      </div>

      <div class="placeholder-layout">
        <section class="card placeholder-hero" aria-labelledby="local-engines-title">
          <div class="placeholder-hero-content">
            <span class="eyebrow">Your workstation</span>
            <h3 id="local-engines-title">Your tools stay close to your work.</h3>
            <p>Local engines will be checked here before a pipeline starts. Optional bring your own key providers remain separate from your local media workflow.</p>
            <ul class="milestone-list">
              <li>See which local engines are ready</li>
              <li>Keep optional provider keys private</li>
              <li>Review subscription status in one place</li>
            </ul>
          </div>
        </section>

        <section class="card settings-card" aria-labelledby="engine-status-title">
          <div class="card-heading">
            <div>
              <h2 id="engine-status-title">Local engine status</h2>
              <p>Connection checks are not active yet.</p>
            </div>
          </div>
          <dl class="engine-list">
            <div class="engine-row"><dt>VoiceStudio</dt><dd>localhost:3900 · Not checked</dd></div>
            <div class="engine-row"><dt>FFmpeg</dt><dd>Media tools · Not checked</dd></div>
            <div class="engine-row"><dt>Ollama</dt><dd>localhost:11434 · Not checked</dd></div>
            <div class="engine-row"><dt>Chrome profile</dt><dd>Browser session · Not checked</dd></div>
          </dl>
        </section>
      </div>

      <div class="feature-card-grid">
        <article class="card feature-card">
          <span class="status-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="4" y="10" width="16" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3M12 14v3"/></svg>
          </span>
          <h3>Private key storage</h3>
          <p>Provider secrets will use the operating system key store when vault setup is available.</p>
        </article>
        <article class="card feature-card">
          <span class="status-icon" aria-hidden="true">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M12 3 5 6v5c0 4.5 3 8 7 10 4-2 7-5.5 7-10V6z"/><path d="m9 12 2 2 4-4"/></svg>
          </span>
          <h3>Subscription status</h3>
          <p>Activation and license details will appear here in a future phase.</p>
        </article>
      </div>
    </section>

    <footer class="page-footer">
      <span>Brand TELOS is saved locally for workers to reuse.</span>
      <span>Secrets are never requested in this foundation phase.</span>
    </footer>
  `;
}

function bindLoadedPage(container, isDisposed) {
  const form = container.querySelector("#brand-telos-form");
  const preview = container.querySelector("#prompt-preview");
  const saveStatus = container.querySelector("#lifeos-save-status");
  let previewToken = 0;

  const refreshPreview = async () => {
    const token = ++previewToken;
    const brief = await previewPromptBrief();
    if (token === previewToken && !isDisposed() && preview) {
      preview.textContent = brief;
    }
  };

  const queueUpdate = (update) => {
    void update
      .then(() => refreshPreview())
      .catch(() => {});
  };

  void refreshPreview();

  const brandFields = {
    creator_name: "creator_name",
    default_cta_url: "default_cta_url",
    brand_mission: "brand_mission",
    target_audience: "target_audience",
    voice_tone: "voice_tone",
    forbidden_words: "forbidden_words",
  };

  for (const [elementName, fieldName] of Object.entries(brandFields)) {
    const input = form.elements[elementName];
    if (!input) continue;
    input.addEventListener("input", () => {
      const value = elementName === "forbidden_words" ? parseListInput(input.value) : input.value;
      queueUpdate(updateBrandTelos({ [fieldName]: value }));
    });
  }

  const requireCta = container.querySelector("#require_cta_link");
  const vertical = container.querySelector("#enforce_vertical_9_16");
  const maxSeconds = container.querySelector("#max_short_seconds");
  const bannedHashtags = container.querySelector("#banned_hashtags");

  requireCta?.addEventListener("change", () => {
    queueUpdate(updateGuardrails({ require_cta_link: requireCta.checked }));
  });
  vertical?.addEventListener("change", () => {
    queueUpdate(updateGuardrails({ enforce_vertical_9_16: vertical.checked }));
  });
  maxSeconds?.addEventListener("input", () => {
    const parsed = Number(maxSeconds.value);
    if (Number.isFinite(parsed) && parsed > 0) {
      queueUpdate(updateGuardrails({ max_short_seconds: Math.floor(parsed) }));
    }
  });
  bannedHashtags?.addEventListener("input", () => {
    queueUpdate(updateGuardrails({ banned_hashtags: parseListInput(bannedHashtags.value) }));
  });

  for (const input of container.querySelectorAll("[data-persona-field]")) {
    input.addEventListener("input", () => {
      const card = input.closest("[data-bot-id]");
      const botId = card?.dataset.botId;
      if (!botId) return;
      queueUpdate(
        updateBotPersona(botId, {
          [input.dataset.personaField]: input.value,
        }),
      );
    });
  }

  form.addEventListener("submit", async (event) => {
    event.preventDefault();
    saveStatus.textContent = "Saving Brand TELOS…";
    saveStatus.dataset.state = "";

    try {
      await saveLifeOsProfile();
      if (isDisposed()) return;
      saveStatus.textContent = isTauriRuntime()
        ? "Brand TELOS saved to data/lifeos."
        : "Brand TELOS saved in this browser preview.";
      saveStatus.dataset.state = "success";
      await refreshPreview();
    } catch (error) {
      if (isDisposed()) return;
      saveStatus.textContent = `Could not save Brand TELOS: ${error?.message || error}`;
      saveStatus.dataset.state = "error";
    }
  });
}

export function mount(container) {
  let disposed = false;

  const renderError = (error) => {
    container.innerHTML = `
      <section class="page-heading" aria-labelledby="engines-title">
        <div class="page-heading-copy">
          <span class="eyebrow">Page 04 · Identity, guardrails &amp; local tools</span>
          <h1 id="engines-title">Engines &amp; BYOK</h1>
          <p>Keep your brand voice, publishing rules, and studio specialists consistent while local engines stay close to your work.</p>
        </div>
      </section>
      <section class="card lifeos-card lifeos-error" role="alert">
        <h2>Brand TELOS could not be loaded</h2>
        <p>${escapeHtml(error?.message || error)}</p>
        <button class="secondary-button" id="lifeos-retry" type="button">Try again</button>
      </section>
    `;
    container.querySelector("#lifeos-retry")?.addEventListener("click", () => {
      loadProfile();
    });
  };

  const loadProfile = async () => {
    container.innerHTML = `
      <section class="page-heading" aria-labelledby="engines-title">
        <div class="page-heading-copy">
          <span class="eyebrow">Page 04 · Identity, guardrails &amp; local tools</span>
          <h1 id="engines-title">Engines &amp; BYOK</h1>
          <p>Keep your brand voice, publishing rules, and studio specialists consistent while local engines stay close to your work.</p>
        </div>
        <span class="status-pill"><span class="status-dot" aria-hidden="true"></span>Loading TELOS</span>
      </section>
      <section class="card lifeos-card lifeos-loading" aria-live="polite">
        <span class="status-dot" aria-hidden="true"></span>
        <div>
          <h2>Loading Brand TELOS</h2>
          <p>Reading your local identity profile and studio personas.</p>
        </div>
      </section>
    `;

    try {
      const state = await getLifeOsState();
      if (disposed) return;
      container.innerHTML = loadedPage(state);
      bindLoadedPage(container, () => disposed);
    } catch (error) {
      if (!disposed) renderError(error);
    }
  };

  void loadProfile();

  disposeCurrentPage = () => {
    disposed = true;
    container.replaceChildren();
  };
}

export function unmount() {
  disposeCurrentPage();
  disposeCurrentPage = () => {};
}
