export function mount(container) {
  container.innerHTML = `
    <section class="page-heading" aria-labelledby="engines-title">
      <div class="page-heading-copy">
        <span class="eyebrow">Page 04 · Local tools &amp; preferences</span>
        <h1 id="engines-title">Engines &amp; BYOK</h1>
        <p>Check the local tools that power your studio and choose how optional services fit your workflow.</p>
      </div>
      <span class="status-pill"><span class="status-dot" aria-hidden="true"></span>Local first</span>
    </section>

    <div class="placeholder-layout">
      <section class="card placeholder-hero" aria-labelledby="local-engines-title">
        <div class="placeholder-hero-content">
          <span class="eyebrow">Your workstation</span>
          <h2 id="local-engines-title">Your tools stay close to your work.</h2>
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

    <section class="feature-card-grid section-gap">
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
    </section>

    <footer class="page-footer">
      <span>Secrets are never requested in this foundation phase.</span>
      <span>Diagnostics will be connected in a later phase.</span>
    </footer>
  `;
}

export function unmount() {}
