export function mount(container) {
  container.innerHTML = `
    <section class="page-heading" aria-labelledby="queue-title">
      <div class="page-heading-copy">
        <span class="eyebrow">Page 03 · Publishing plan</span>
        <h1 id="queue-title">Schedule &amp; Queue</h1>
        <p>Review upcoming posts in Manila time and keep your overnight publishing plan easy to follow.</p>
      </div>
      <span class="status-pill">Queue is empty</span>
    </section>

    <div class="placeholder-layout">
      <section class="card placeholder-hero" aria-labelledby="queue-overview-title">
        <div class="placeholder-hero-content">
          <span class="eyebrow">Your publishing desk</span>
          <h2 id="queue-overview-title">A thoughtful schedule starts with a ready video.</h2>
          <p>Finished videos will move here for review before they are assigned a time and destination. The queue will run one job at a time.</p>
          <ul class="milestone-list">
            <li>One active render or upload at a time</li>
            <li>Times shown in Asia/Manila (UTC+8)</li>
            <li>Review destinations before scheduling</li>
          </ul>
        </div>
      </section>

      <section class="card timeline-card" aria-labelledby="timeline-title">
        <div class="card-heading">
          <div>
            <h2 id="timeline-title">Next publishing windows</h2>
            <p>Your calendar is ready for its first post.</p>
          </div>
          <span class="stage-label">PHT</span>
        </div>
        <div class="timeline-track" aria-label="Empty publishing schedule">
          <div class="timeline-row">
            <span class="timeline-time">Next</span>
            <span class="timeline-slot"><span class="status-dot" aria-hidden="true"></span>Time to be set</span>
          </div>
          <div class="timeline-row">
            <span class="timeline-time">Then</span>
            <span class="timeline-slot"><span class="status-dot" aria-hidden="true"></span>Time to be set</span>
          </div>
          <div class="timeline-row">
            <span class="timeline-time">Later</span>
            <span class="timeline-slot"><span class="status-dot" aria-hidden="true"></span>Time to be set</span>
          </div>
        </div>
      </section>
    </div>

    <section class="feature-card-grid section-gap">
      <article class="card feature-card">
        <span class="status-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M16 3v4M8 3v4M3 10h18"/></svg>
        </span>
        <h3>Manila time, by default</h3>
        <p>Scheduling rules will use Asia/Manila so your planned slots stay familiar.</p>
      </article>
      <article class="card feature-card">
        <span class="status-icon" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M4 7h16M4 12h16M4 17h16"/><circle cx="8" cy="7" r="2" fill="var(--bg-card)"/><circle cx="15" cy="12" r="2" fill="var(--bg-card)"/></svg>
        </span>
        <h3>Steady overnight queue</h3>
        <p>Sequential jobs keep local render and publishing work predictable.</p>
      </article>
    </section>

    <footer class="page-footer">
      <span>Nothing is scheduled yet.</span>
      <span>Queue controls arrive with the publishing workflow.</span>
    </footer>
  `;
}

export function unmount() {}
