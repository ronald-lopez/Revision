import { useApp } from '../../context/AppContext.jsx';

const WEAK_COLORS = ['high', 'medium', 'medium', 'low'];

function timeAgo(iso) {
  if (!iso) return 'Never';
  const diff = Date.now() - new Date(iso).getTime();
  const h = Math.floor(diff / 3600000);
  const d = Math.floor(diff / 86400000);
  if (d > 0) return `${d}d ago`;
  if (h > 0) return `${h}h ago`;
  return 'Just now';
}

export default function MemoryPanel({ onStartDiagnostic }) {
  const { subjects, atlasMemory, chatHistory, navigateToForge } = useApp();
  const subjectNames = subjects.map(s => s.name);
  const msgCount = chatHistory.length;

  return (
    <div className="atlas-sidebar">
      {/* Header */}
      <div style={{ marginBottom: '20px' }}>
        <div style={{ fontFamily: 'var(--mono)', fontSize: '10px', color: 'var(--teal)', textTransform: 'uppercase', letterSpacing: '0.1em', marginBottom: '4px' }}>ATLAS</div>
        <div style={{ fontSize: '13px', fontWeight: 500, color: 'var(--text)' }}>Student Profile</div>
      </div>

      {/* Subjects */}
      <div className="mem-section">
        <div className="mem-section-title">Subjects</div>
        {subjectNames.length > 0
          ? subjectNames.map((n, i) => <span key={i} className="mem-subject-tag">{n}</span>)
          : <span style={{ fontSize: '12px', color: 'var(--text3)' }}>No subjects set up</span>}
      </div>

      {/* Diagnostic & Weak Areas */}
      <div className="mem-section">
        <div className="mem-section-title">Diagnostic</div>
        {atlasMemory ? (
          <>
            <div style={{ fontSize: '12px', color: 'var(--text2)', marginBottom: '10px' }}>
              Completed {timeAgo(atlasMemory.completedAt)}
            </div>
            <div className="mem-section-title">Focus Areas</div>
            <div>
              {atlasMemory.weakAreas?.map((area, i) => (
                <span key={i} className={`weak-tag ${WEAK_COLORS[i] || 'low'}`}>
                  {i === 0 ? '●' : i === 1 ? '●' : '●'} {area}
                </span>
              ))}
            </div>
          </>
        ) : (
          <div>
            <div style={{ fontSize: '12px', color: 'var(--text3)', marginBottom: '10px', lineHeight: 1.5 }}>
              No diagnostic yet. Run a quick diagnostic to let ATLAS identify your weak areas.
            </div>
            <button
              className="btn-primary"
              style={{ fontSize: '12px', padding: '8px 14px', width: '100%', justifyContent: 'center' }}
              onClick={onStartDiagnostic}
            >
              Start Diagnostic
            </button>
          </div>
        )}
      </div>

      {/* Session stats */}
      {atlasMemory && (
        <div className="mem-section">
          <div className="mem-section-title">Session Stats</div>
          <div className="mem-stat">
            <span>Sessions</span>
            <span className="mem-stat-val">{atlasMemory.sessions || 1}</span>
          </div>
          <div className="mem-stat">
            <span>Messages</span>
            <span className="mem-stat-val">{msgCount}</span>
          </div>
          <div className="mem-stat">
            <span>Last session</span>
            <span className="mem-stat-val">{timeAgo(atlasMemory.completedAt)}</span>
          </div>
        </div>
      )}

      {/* FORGE link */}
      {atlasMemory && (
        <div className="mem-section">
          <div className="mem-section-title">Practice</div>
          <button className="mem-forge-btn" onClick={() => navigateToForge()}>
            Generate FORGE paper →
          </button>
          <div style={{ marginTop: '8px', fontSize: '11.5px', color: 'var(--text3)', lineHeight: 1.5 }}>
            Target weak areas with a practice paper
          </div>
        </div>
      )}

      {/* Retake */}
      {atlasMemory && (
        <div style={{ marginTop: 'auto', paddingTop: '16px', borderTop: '1px solid var(--border)' }}>
          <button
            onClick={onStartDiagnostic}
            style={{ background: 'none', border: 'none', fontSize: '11.5px', color: 'var(--text3)', cursor: 'pointer', textDecoration: 'underline' }}
          >
            Retake diagnostic
          </button>
        </div>
      )}
    </div>
  );
}
