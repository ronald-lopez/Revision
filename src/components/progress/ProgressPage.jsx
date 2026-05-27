import { useApp } from '../../context/AppContext.jsx';

const COLORS = ['var(--accent)', 'var(--teal)', 'var(--purple)', 'var(--green)', 'var(--amber)', 'var(--red)'];

export default function ProgressPage() {
  const { subjects, progress, atlasMemory, attempted, marked, totalSubtopics } = useApp();

  return (
    <div className="page-content">
      <h2 style={{ fontFamily: 'var(--serif)', fontSize: '27px', marginBottom: '24px' }}>Progress</h2>

      {/* Summary stats */}
      <div className="prog-grid">
        <div className="prog-cell">
          <div className="prog-n" style={{ color: 'var(--accent)' }}>{attempted}</div>
          <div className="prog-lbl">Topics attempted</div>
        </div>
        <div className="prog-cell">
          <div className="prog-n" style={{ color: 'var(--green)' }}>{marked}</div>
          <div className="prog-lbl">Pieces marked</div>
        </div>
        <div className="prog-cell">
          <div className="prog-n">{totalSubtopics}</div>
          <div className="prog-lbl">Total subtopics</div>
        </div>
      </div>

      {/* ATLAS insights */}
      {atlasMemory && (
        <div style={{ background: 'var(--teal-bg)', border: '1px solid var(--teal-border)', borderRadius: 'var(--rl)', padding: '18px 22px', marginBottom: '20px' }}>
          <div style={{ fontFamily: 'var(--mono)', fontSize: '10px', color: 'var(--teal)', textTransform: 'uppercase', letterSpacing: '0.08em', marginBottom: '10px' }}>ATLAS Insights</div>
          <div style={{ fontSize: '13.5px', color: 'var(--text2)', marginBottom: '10px' }}>
            Based on your diagnostic, these areas need the most attention:
          </div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            {atlasMemory.weakAreas?.map((area, i) => (
              <span key={i} className={`weak-tag ${['high','medium','medium','low'][i] || 'low'}`}>
                {area}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Per-subject progress */}
      {subjects.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '48px 24px', color: 'var(--text3)' }}>
          <div style={{ fontSize: '36px', marginBottom: '12px' }}>📊</div>
          <div style={{ fontSize: '15px', fontWeight: 500, color: 'var(--text2)', marginBottom: '6px' }}>No progress yet</div>
          <div style={{ fontSize: '13px' }}>Start practising with FORGE to see your progress here.</div>
        </div>
      ) : (
        subjects.map((s, si) => {
          let sAtt = 0, sMark = 0, sTotal = 0;
          for (const ts of Object.values(s.papers)) {
            for (const t of ts) {
              sTotal += t.subs.length;
              for (const sub of t.subs) {
                const pk = `${si}|${t.name}|${sub}`;
                if (progress[pk]?.attempts) sAtt++;
                if (progress[pk]?.marked) sMark++;
              }
            }
          }
          const pct = sTotal ? Math.round(sAtt / sTotal * 100) : 0;

          return (
            <div key={si} className="prog-card">
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '10px' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <div style={{ width: '10px', height: '10px', borderRadius: '50%', background: COLORS[si % COLORS.length], flexShrink: 0 }} />
                  <div>
                    <div style={{ fontSize: '14px', fontWeight: 500 }}>{s.name}</div>
                    <div style={{ fontSize: '11px', color: 'var(--text3)', fontFamily: 'var(--mono)', marginTop: '1px' }}>{s.code || 'A-Level'}</div>
                  </div>
                </div>
                <div style={{ textAlign: 'right' }}>
                  <div style={{ fontSize: '20px', fontWeight: 600, fontFamily: 'var(--mono)', color: COLORS[si % COLORS.length] }}>{pct}%</div>
                  <div style={{ fontSize: '11px', color: 'var(--text3)' }}>{sAtt}/{sTotal}</div>
                </div>
              </div>
              <div className="prog-bar-bg">
                <div className="prog-bar" style={{ width: `${pct}%`, background: COLORS[si % COLORS.length] }} />
              </div>
              <div style={{ marginTop: '6px', fontSize: '12px', color: 'var(--text3)' }}>
                {sMark} piece{sMark !== 1 ? 's' : ''} marked
              </div>
            </div>
          );
        })
      )}
    </div>
  );
}
