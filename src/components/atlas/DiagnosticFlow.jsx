import { useState } from 'react';
import { useApp } from '../../context/AppContext.jsx';
import { DIAGNOSTIC_QUESTIONS, computeWeakAreas } from '../../utils/mockAtlas.js';

export default function DiagnosticFlow({ onClose }) {
  const { completeAtlasDiagnostic, showToast } = useApp();
  const [step, setStep] = useState(0); // 0..N-1 = questions, N = loading, N+1 = results
  const [answers, setAnswers] = useState([]);
  const [selected, setSelected] = useState(null);
  const [weakAreas, setWeakAreas] = useState([]);

  const total = DIAGNOSTIC_QUESTIONS.length;
  const isLoading = step === total;
  const isResults = step === total + 1;
  const q = step < total ? DIAGNOSTIC_QUESTIONS[step] : null;

  function selectOption(idx) {
    setSelected(idx);
  }

  function next() {
    if (selected === null) { showToast('Select an answer first'); return; }
    const newAnswers = [...answers, selected];
    setAnswers(newAnswers);
    setSelected(null);

    if (step + 1 === total) {
      // Go to loading state
      setStep(total);
      setTimeout(() => {
        const areas = computeWeakAreas(newAnswers);
        setWeakAreas(areas);
        setStep(total + 1);
      }, 2200);
    } else {
      setStep(step + 1);
    }
  }

  function finish() {
    completeAtlasDiagnostic(weakAreas);
    showToast('ATLAS profile saved ✓');
    onClose();
  }

  const weakColors = ['high', 'medium', 'medium', 'low'];

  return (
    <div className="diag-overlay">
      <div className="diag-card">
        {!isLoading && !isResults && q && (
          <>
            <div className="diag-progress-bar-bg">
              <div className="diag-progress-bar" style={{ width: `${(step / total) * 100}%` }} />
            </div>
            <div className="diag-q-num">Question {step + 1} of {total} · Exam Technique Diagnostic</div>
            <div className="diag-question">{q.q}</div>
            <div className="diag-options">
              {q.opts.map((opt, i) => (
                <div
                  key={i}
                  className={`diag-option${selected === i ? ' selected' : ''}`}
                  onClick={() => selectOption(i)}
                >
                  <div className="diag-opt-letter">{String.fromCharCode(65 + i)}</div>
                  <div className="diag-opt-text">{opt}</div>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span style={{ fontSize: '12px', color: 'var(--text3)' }}>
                Select an answer, then click Next →
              </span>
              <button className="btn-primary" onClick={next} disabled={selected === null}>
                {step + 1 === total ? 'Finish →' : 'Next →'}
              </button>
            </div>
          </>
        )}

        {isLoading && (
          <div className="diag-loading">
            <div className="diag-spinner" />
            <p>Analysing your responses…</p>
            <p style={{ marginTop: '8px', fontSize: '12px', color: 'var(--text3)' }}>Building your ATLAS profile</p>
          </div>
        )}

        {isResults && (
          <div className="diag-results">
            <div style={{ fontSize: '36px', marginBottom: '12px' }}>🧠</div>
            <h2>Your ATLAS profile is ready</h2>
            <p>
              Based on your diagnostic, ATLAS has identified <strong>{weakAreas.length} focus area{weakAreas.length !== 1 ? 's' : ''}</strong> to prioritise in your revision.
            </p>
            <div className="weak-areas-list">
              {weakAreas.map((area, i) => (
                <span key={i} className={`weak-tag ${weakColors[i] || 'low'}`}>
                  {i === 0 ? '🔴' : i === 1 ? '🟡' : '🔵'} {area}
                </span>
              ))}
            </div>
            <p style={{ marginBottom: '24px', fontSize: '13px', color: 'var(--text3)' }}>
              ATLAS will use this profile to calibrate all content it delivers. You can retake the diagnostic at any time.
            </p>
            <button className="btn-primary" onClick={finish}>
              Start learning with ATLAS →
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
