import { useState } from 'react';
import { useApp } from '../../context/AppContext.jsx';

export default function SettingsPage() {
  const { prefs, updatePrefs, showToast, screen } = useApp();
  const [geminiKey, setGeminiKey] = useState(prefs.geminiKey || '');
  const [saved, setSaved] = useState(false);

  function saveKey() {
    updatePrefs('geminiKey', geminiKey.trim());
    setSaved(true);
    showToast('Gemini API key saved ✓');
    setTimeout(() => setSaved(false), 2000);
  }

  function handleClearProgress() {
    if (!confirm('Clear all progress data? This cannot be undone.')) return;
    localStorage.removeItem('li_progress');
    localStorage.removeItem('li_chat');
    localStorage.removeItem('li_atlas');
    window.location.reload();
  }

  function handleResetAll() {
    if (!confirm('Reset everything? You will be signed out and all data cleared.')) return;
    localStorage.clear();
    window.location.reload();
  }

  return (
    <div className="page-content">
      <h2 style={{ fontFamily: 'var(--serif)', fontSize: '27px', marginBottom: '24px' }}>Settings</h2>
      <div style={{ maxWidth: '560px' }}>

        {/* API Keys */}
        <div className="settings-section">
          <h3>AI Integration</h3>
          <label style={{ fontSize: '13.5px', fontWeight: 500, display: 'block', marginBottom: '3px' }}>
            Gemini API Key
          </label>
          <p style={{ fontSize: '12px', color: 'var(--text3)', marginBottom: '10px', lineHeight: 1.5 }}>
            Add your Gemini API key to enable live question generation in FORGE. Without a key, FORGE runs in demo mode with sample questions.
            Get a free key at <a href="https://aistudio.google.com" target="_blank" rel="noreferrer" style={{ color: 'var(--accent)' }}>aistudio.google.com</a>.
          </p>
          <input
            className="api-key-input"
            type="password"
            placeholder="AIza..."
            value={geminiKey}
            onChange={e => setGeminiKey(e.target.value)}
          />
          <button className="btn-primary" style={{ fontSize: '12.5px', padding: '8px 18px' }} onClick={saveKey}>
            {saved ? 'Saved ✓' : 'Save key'}
          </button>
          {prefs.geminiKey && (
            <div style={{ marginTop: '8px', fontSize: '12px', color: 'var(--green)' }}>
              ✓ Gemini key set — FORGE live generation enabled
            </div>
          )}
        </div>

        {/* Display */}
        <div className="settings-section">
          <h3>Display</h3>
          <div className="toggle-row">
            <div>
              <div style={{ fontSize: '13.5px', fontWeight: 500 }}>Show marks per part</div>
              <div style={{ fontSize: '12px', color: 'var(--text3)' }}>[n] tags on question parts</div>
            </div>
            <label className="toggle">
              <input type="checkbox" checked={prefs.showMarks} onChange={e => updatePrefs('showMarks', e.target.checked)} />
              <span className="tslider" />
            </label>
          </div>
          <div className="toggle-row">
            <div>
              <div style={{ fontSize: '13.5px', fontWeight: 500 }}>LaTeX rendering</div>
              <div style={{ fontSize: '12px', color: 'var(--text3)' }}>Render maths with MathJax</div>
            </div>
            <label className="toggle">
              <input type="checkbox" checked={prefs.latex} onChange={e => updatePrefs('latex', e.target.checked)} />
              <span className="tslider" />
            </label>
          </div>
        </div>

        {/* Subjects */}
        <div className="settings-section">
          <h3>Subjects</h3>
          <label style={{ fontSize: '13.5px', fontWeight: 500, display: 'block', marginBottom: '3px' }}>Edit your subject checklist</label>
          <p style={{ fontSize: '12px', color: 'var(--text3)', marginBottom: '10px', lineHeight: 1.5 }}>
            Re-run the setup to replace your current subjects and topics.
          </p>
          <button className="btn-secondary" onClick={() => { localStorage.removeItem('li_subjects'); window.location.reload(); }}>
            Edit subjects
          </button>
        </div>

        {/* Data */}
        <div className="settings-section">
          <h3>Data</h3>
          <label style={{ fontSize: '13.5px', fontWeight: 500, display: 'block', marginBottom: '3px' }}>Clear progress data</label>
          <p style={{ fontSize: '12px', color: 'var(--text3)', marginBottom: '10px', lineHeight: 1.5 }}>
            Removes all attempt, marking, and ATLAS session data. Your subjects are kept.
          </p>
          <button className="btn-danger" onClick={handleClearProgress}>Clear progress</button>
          <div style={{ marginTop: '18px' }}>
            <label style={{ fontSize: '13.5px', fontWeight: 500, color: 'var(--red)', display: 'block', marginBottom: '3px' }}>Reset everything</label>
            <p style={{ fontSize: '12px', color: 'var(--text3)', marginBottom: '10px', lineHeight: 1.5 }}>
              Signs you out and clears all data. Cannot be undone.
            </p>
            <button className="btn-danger" onClick={handleResetAll}>Reset all data</button>
          </div>
        </div>

        {/* About */}
        <div className="settings-section">
          <h3>About</h3>
          <div style={{ fontSize: '13px', color: 'var(--text2)', lineHeight: 1.65 }}>
            <strong>LearnInc</strong> prototype · 2026<br />
            <span style={{ color: 'var(--text3)' }}>FORGE · ATLAS · FLUX</span><br />
            <span style={{ fontFamily: 'var(--mono)', fontSize: '11px', color: 'var(--text3)' }}>© Ronald Lopez. All rights reserved.</span>
          </div>
        </div>
      </div>
    </div>
  );
}
