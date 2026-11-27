const icons = {
  office:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="m3 10 9-7 9 7v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><path d="M9 21v-6h6v6"/></svg>',
  folder:
    '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" aria-hidden="true"><path d="M3 6.5A1.5 1.5 0 0 1 4.5 5h5l2 2h8A1.5 1.5 0 0 1 21 8.5v9a1.5 1.5 0 0 1-1.5 1.5h-15A1.5 1.5 0 0 1 3 17.5z"/></svg>',
};

export function mount(container) {
  container.innerHTML = `
    <section class="page-heading" aria-labelledby="office-title">
      <div class="page-heading-copy">
        <span class="eyebrow">Page 01 · Mission control</span>
        <h1 id="office-title">Virtual Office</h1>
        <p>Keep every step of your video pipeline in view, from a raw clip to a ready to post cut.</p>
      </div>
      <span class="status-pill"><span class="status-dot" aria-hidden="true"></span>Workspace ready</span>
    </section>

    <div class="office-grid">
      <section class="card stage-card" aria-labelledby="office-stage-title">
        <div class="stage-card-header">
          <div class="stage-header-copy">
            <strong id="office-stage-title">Studio floor</strong>
            <span>Your production overview lives here</span>
          </div>
          <span class="stage-label">Virtual Office</span>
        </div>
        <div class="stage-art">
          <div class="stage-scene" data-office-stage>
            <div class="scene-orbit" aria-hidden="true"></div>
            <div class="scene-copy">
              <span class="decorative-icon">${icons.office}</span>
              <h3>Your office is ready to take shape</h3>
              <p>The interactive studio floor and production specialists arrive in a later phase.</p>
            </div>
          </div>
        </div>
        <div class="stage-footer" aria-label="Pipeline folders">
          <span class="stage-tag">raw-videos/</span>
          <span class="stage-tag">voiceovers/</span>
          <span class="stage-tag">ready-to-post/</span>
        </div>
      </section>

      <div class="stack">
        <section class="card panel-card" aria-labelledby="pipeline-title">
          <div class="card-heading">
            <div>
              <h2 id="pipeline-title">Your video pipeline</h2>
              <p>A clear path from source clip to scheduled post.</p>
            </div>
          </div>
          <ol class="pipeline-list">
            <li class="pipeline-step">
              <span class="step-number">01</span>
              <span><strong>Bring in a raw clip</strong><span>Start with a recording in your project folder.</span></span>
            </li>
            <li class="pipeline-step">
              <span class="step-number">02</span>
              <span><strong>Shape the story</strong><span>Prepare voice, captions, and a cover frame.</span></span>
            </li>
            <li class="pipeline-step">
              <span class="step-number">03</span>
              <span><strong>Choose when to share</strong><span>Review a post before it joins your queue.</span></span>
            </li>
          </ol>
        </section>

        <section class="card panel-card" aria-labelledby="raw-video-title">
          <div class="card-heading">
            <div>
              <h2 id="raw-video-title">Raw video inbox</h2>
              <p>Project media stays on this device.</p>
            </div>
          </div>
          <div class="folder-card section-gap">
            <span class="status-icon">${icons.folder}</span>
            <div>
              <strong>raw-videos/</strong>
              <p>No clips yet. Add videos here when ingestion is available.</p>
            </div>
          </div>
        </section>
      </div>
    </div>

    <section class="card telemetry-card" aria-labelledby="telemetry-title">
      <div class="card-heading">
        <div>
          <h2 id="telemetry-title">Live studio activity</h2>
          <p>Worker updates will appear here while a batch is running.</p>
        </div>
        <span class="status-pill">Waiting for first job</span>
      </div>
      <div class="telemetry-empty" role="status">
        <span class="status-dot" aria-hidden="true"></span>
        Nothing is running right now. Your local studio is standing by.
      </div>
    </section>

    <footer class="page-footer">
      <span>Built for a calm, local first production workflow.</span>
      <span>Posting destinations are configured in your project.</span>
    </footer>
  `;
}

export function unmount() {}
