import { useApp } from '../../context/AppContext.jsx';

const MOCK_TASKS = [
  { name: 'FORGE paper — Enzymes (AQA Biology)', time: '45 min', priority: 'high', done: true, tag: 'FORGE', tagColor: 'var(--accent)' },
  { name: 'ATLAS session — Extended writing technique', time: '30 min', priority: 'high', done: true, tag: 'ATLAS', tagColor: 'var(--teal)' },
  { name: 'FORGE paper — Organic Chemistry mechanisms', time: '45 min', priority: 'medium', done: false, tag: 'FORGE', tagColor: 'var(--accent)' },
  { name: 'Review examiner report from this morning', time: '15 min', priority: 'medium', done: false, tag: 'Review', tagColor: 'var(--purple)' },
  { name: 'ATLAS — Cell signalling flashcards', time: '20 min', priority: 'low', done: false, tag: 'ATLAS', tagColor: 'var(--teal)' },
  { name: 'Past paper — June 2023 Section B ⚠ Deferred', time: '60 min', priority: 'low', done: false, tag: 'Deferred', tagColor: 'var(--amber)', deferred: true },
];

const PRIORITY_COLORS = {
  high: 'var(--red)',
  medium: 'var(--amber)',
  low: 'var(--green)',
};

const FEATURES = [
  { icon: '⏱', title: 'Real-time reprioritisation', desc: 'When you overrun on one task, FLUX automatically reschedules what\'s left — deferring lower-priority items and surfacing the most important remaining work.' },
  { icon: '📅', title: 'Exam countdown logic', desc: 'FLUX knows your exam dates. As each exam approaches, it automatically increases the priority of relevant subjects and reduces others.' },
  { icon: '🔗', title: 'Connected to FORGE & ATLAS', desc: 'FLUX sees what papers FORGE has generated, what topics ATLAS has flagged as weak, and builds a schedule that closes the gaps before your exams.' },
];

export default function FluxPage() {
  const { setCurrentPage } = useApp();

  return (
    <div className="flux-page">
      {/* Header */}
      <div className="flux-hero">
        <h1>FLUX</h1>
        <span className="flux-pro-badge">PRO</span>
        <span style={{ fontSize: '10px', color: 'var(--text3)', fontFamily: 'var(--mono)', background: 'var(--bg3)', padding: '3px 8px', borderRadius: '5px', border: '1px solid var(--border)' }}>
          COMING SOON
        </span>
      </div>
      <p className="flux-sub">
        FORGE tells you what paper to do. ATLAS tells you what to focus on. FLUX tells you <em>when</em> to do it — and what to do when your plan falls apart, which it always does.
        FLUX manages your revision schedule in real time, adapting as the day progresses.
      </p>

      {/* Locked schedule preview */}
      <div className="flux-preview">
        <div className="flux-schedule-mock">
          <div className="flux-day-header">
            <div className="flux-day-title">Tuesday 3 June · 6 tasks remaining</div>
            <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
              <div className="flux-exam-countdown">AQA Biology · 14 days</div>
              <div className="flux-exam-countdown" style={{ color: 'var(--amber)', background: 'var(--amber-bg)', borderColor: 'rgba(217,119,6,0.25)' }}>AQA Chem · 16 days</div>
            </div>
          </div>
          {MOCK_TASKS.map((task, i) => (
            <div key={i} className={`flux-task${task.done ? ' done' : ''}`}
              style={{ opacity: task.deferred ? 0.6 : 1 }}>
              <div className="flux-task-priority" style={{ background: PRIORITY_COLORS[task.priority] }} />
              <span className="flux-task-name">{task.name}</span>
              <span className="flux-task-time">{task.time}</span>
              <span className="flux-task-tag" style={{ background: `${task.tagColor}18`, color: task.tagColor, border: `1px solid ${task.tagColor}44` }}>
                {task.tag}
              </span>
            </div>
          ))}
          <div style={{ marginTop: '12px', padding: '10px 0', borderTop: '1px solid var(--border)', fontSize: '12px', color: 'var(--text3)', display: 'flex', alignItems: 'center', gap: '8px' }}>
            <span style={{ color: 'var(--amber)', fontFamily: 'var(--mono)', fontSize: '11px' }}>⚠ FLUX detected you ran over on task 2 by 8 min — schedule adjusted, 1 task deferred to tomorrow.</span>
          </div>
        </div>
        <div className="flux-locked-overlay">
          <div className="flux-lock-icon">🔒</div>
          <div style={{ fontFamily: 'var(--serif)', fontSize: '20px' }}>Available on Pro</div>
          <div className="flux-locked-text">
            FLUX is coming to the Pro tier. FORGE and ATLAS are available now on Core at £9.99/month.
          </div>
          <div style={{ display: 'flex', gap: '10px' }}>
            <button className="btn-primary" onClick={() => setCurrentPage('forge')}>
              Use FORGE now →
            </button>
            <button className="btn-secondary" onClick={() => setCurrentPage('atlas')}>
              Use ATLAS →
            </button>
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="flux-features">
        {FEATURES.map((f, i) => (
          <div key={i} className="flux-feature-card">
            <div className="flux-feature-icon">{f.icon}</div>
            <h4>{f.title}</h4>
            <p>{f.desc}</p>
          </div>
        ))}
      </div>

      {/* Pricing reminder */}
      <div style={{ marginTop: '28px', background: 'var(--bg2)', border: '1px solid var(--border)', borderRadius: 'var(--rl)', padding: '22px 26px', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '16px' }}>
        <div>
          <div style={{ fontFamily: 'var(--serif)', fontSize: '18px', marginBottom: '4px' }}>LearnInc Pro — £16.99/month</div>
          <div style={{ fontSize: '13px', color: 'var(--text2)' }}>Unlimited FORGE + full ATLAS + FLUX when it launches. Cancel anytime.</div>
        </div>
        <button className="btn-primary" style={{ opacity: 0.6, cursor: 'not-allowed' }} disabled>
          Coming soon
        </button>
      </div>
    </div>
  );
}
