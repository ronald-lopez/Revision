import { useApp } from '../../context/AppContext.jsx';

const COLORS = ['var(--accent)', 'var(--teal)', 'var(--purple)', 'var(--green)', 'var(--amber)', 'var(--red)'];

const LOOP_STEPS = [
  { label: 'Diagnose', desc: 'ATLAS identifies weak areas' },
  { label: 'Learn', desc: 'ATLAS teaches the content' },
  { label: 'Test', desc: 'FORGE generates a paper' },
  { label: 'Mark', desc: 'Answers marked in real time' },
  { label: 'Reflect', desc: 'Examiner report generated' },
  { label: 'Update', desc: 'ATLAS memory refreshed' },
];

function getLoopStep(atlasMemory, attempted) {
  if (!atlasMemory) return 0;          // Need to diagnose
  if (attempted === 0) return 1;       // Diagnosed, now learn
  if (attempted > 0) return 2;        // Tested, now mark
  return 3;
}

export default function HomePage() {
  const { user, subjects, atlasMemory, attempted, marked, totalSubtopics, navigateToForge, setCurrentPage } = useApp();
  const firstName = user?.name?.split(' ')[0] || 'there';
  const currentStep = getLoopStep(atlasMemory, attempted);

  return (
    <div className="page-content">
      {/* Hero */}
      <div className="home-hero">
        <h2>Welcome back,<br /><span>{firstName}.</span></h2>
        <p>
          {atlasMemory
            ? `ATLAS has your profile ready — ${atlasMemory.weakAreas?.length || 0} focus areas identified.`
            : 'Start your diagnostic to let ATLAS build your revision profile.'}
        </p>
      </div>

      {/* Quick actions */}
      <div className="quick-actions">
        <div className="qa-card forge-card" onClick={() => setCurrentPage('forge')}>
          <div className="qa-icon">📄</div>
          <div className="qa-info">
            <h3>FORGE — Practice Paper</h3>
            <p>Generate an exam-styled paper on any topic, with full mark scheme and examiner report.</p>
          </div>
          <div className="qa-arrow">›</div>
        </div>
        <div className="qa-card atlas-card" onClick={() => setCurrentPage('atlas')}>
          <div className="qa-icon">🧠</div>
          <div className="qa-info">
            <h3>ATLAS — AI Tutor</h3>
            <p>{atlasMemory ? 'Continue your session — ATLAS remembers your weak areas.' : 'Run your diagnostic and get a personalised revision plan.'}</p>
          </div>
          <div className="qa-arrow">›</div>
        </div>
      </div>

      {/* The Loop */}
      <div className="loop-card">
        <div className="loop-card-header">
          <h3>The Revision Loop</h3>
          <span className="loop-label">
            {atlasMemory
              ? `Step ${currentStep + 1} of 6 — ${LOOP_STEPS[currentStep].label}`
              : 'Start your diagnostic to begin'}
          </span>
        </div>
        <div className="loop-steps">
          {LOOP_STEPS.map((step, i) => {
            const state = i < currentStep ? 'done' : i === currentStep ? 'current' : 'todo';
            return (
              <div key={i} className="loop-step">
                <div className={`loop-circle ${state}`}>
                  {state === 'done' ? '✓' : i + 1}
                </div>
                <div className={`loop-step-name${state === 'current' ? ' current-name' : ''}`}>
                  {step.label}
                </div>
              </div>
            );
          })}
        </div>
        {!atlasMemory && (
          <div style={{ marginTop: '18px', paddingTop: '16px', borderTop: '1px solid var(--border)' }}>
            <button className="btn-primary" onClick={() => setCurrentPage('atlas')}>
              Start ATLAS Diagnostic →
            </button>
            <span style={{ fontSize: '12px', color: 'var(--text3)', marginLeft: '12px' }}>Takes ~2 minutes</span>
          </div>
        )}
      </div>

      {/* Stats */}
      <div className="stats-row">
        <div className="stat-box">
          <div className="stat-n">{totalSubtopics || '—'}</div>
          <div className="stat-lbl">Total subtopics</div>
        </div>
        <div className="stat-box">
          <div className="stat-n" style={{ color: attempted > 0 ? 'var(--accent)' : 'var(--text3)' }}>{attempted}</div>
          <div className="stat-lbl">Topics attempted</div>
        </div>
        <div className="stat-box">
          <div className="stat-n" style={{ color: marked > 0 ? 'var(--green)' : 'var(--text3)' }}>{marked}</div>
          <div className="stat-lbl">Pieces marked</div>
        </div>
      </div>

      {/* Subject grid */}
      {subjects.length > 0 && (
        <>
          <div className="section-label">Your subjects</div>
          <div className="subject-grid">
            {subjects.map((s, i) => {
              const count = Object.values(s.papers).reduce((a, ts) => a + ts.reduce((b, t) => b + t.subs.length, 0), 0);
              return (
                <div key={i} className="subj-card" onClick={() => { navigateToForge(i); }}>
                  <div className="subj-card-accent" style={{ background: COLORS[i % COLORS.length] }} />
                  <h3>{s.name}</h3>
                  <div className="sc-code">{s.code || 'A-Level'}</div>
                  <div className="sc-count">{count} subtopics</div>
                  <div className="sc-go">Practice →</div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </div>
  );
}
