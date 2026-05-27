import { useState } from 'react';
import { useApp } from '../../context/AppContext.jsx';

function mdToHtml(text) {
  if (!text) return '';
  return text
    .replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>')
    .replace(/\*([^*]+?)\*/g, '<em>$1</em>')
    .replace(/`([^`]+)`/g, '<code style="font-family:var(--mono);font-size:0.88em;background:var(--bg4);padding:1px 5px;border-radius:3px;">$1</code>')
    .replace(/\n\n/g, '</p><p style="margin:0 0 8px;">')
    .replace(/\n/g, '<br />');
}

export default function QuestionCard({ q, idx, topic, subtopic }) {
  const { prefs, showToast } = useApp();
  const [showHint, setShowHint] = useState(false);
  const [showAnswer, setShowAnswer] = useState(false);
  const [showMark, setShowMark] = useState(false);
  const [imgSrc, setImgSrc] = useState(null);
  const [copyOk, setCopyOk] = useState(false);
  const [feedbackText, setFeedbackText] = useState('');
  const [savedFeedback, setSavedFeedback] = useState('');
  const [showFBInput, setShowFBInput] = useState(false);

  const diffClass = {
    accessible: 'd-accessible',
    medium: 'd-medium',
    harder: 'd-harder',
    'exam-hard': 'd-exam',
  }[q.difficulty] || 'd-medium';

  const parts = (q.parts || []).filter(p => p.label);

  function handleImg(file) {
    const r = new FileReader();
    r.onload = e => setImgSrc(e.target.result);
    r.readAsDataURL(file);
  }

  const markPrompt = imgSrc ? `I am a student practising ${topic} — ${subtopic}.

Question I answered:
${q.stem}
${parts.map(p => `${p.label} ${p.text}`).join('\n')}

Mark scheme / worked answer:
${q.answer}

I have attached a photo of my handwritten working. Please:
1. Assess my method — what did I do correctly and what was wrong or incomplete?
2. Give a rough mark or grade indication
3. Identify specific errors or misconceptions
4. Give one clear piece of advice to improve

Be direct and specific, like an examiner giving feedback.` : '';

  function copyPrompt() {
    navigator.clipboard.writeText(markPrompt).then(() => {
      setCopyOk(true);
      showToast('Copied! Attach your photo in Claude.');
      setTimeout(() => setCopyOk(false), 2000);
    }).catch(() => showToast('Copy failed — check clipboard permissions'));
  }

  function saveFeedback() {
    if (!feedbackText.trim()) { showToast('Paste feedback first'); return; }
    setSavedFeedback(feedbackText.trim());
    setShowFBInput(false);
    showToast('Feedback saved ✓');
  }

  return (
    <div className="q-card">
      <div className="q-card-head">
        <span className="qnum">Q{idx + 1}</span>
        <span className={`dbadge ${diffClass}`}>{q.difficulty}</span>
        <span className="ttag">{subtopic}</span>
      </div>
      <div className="q-body">
        <div className="q-text" dangerouslySetInnerHTML={{ __html: `<p style="margin:0 0 8px;">${mdToHtml(q.stem)}</p>` }} />
        {parts.length > 0 && (
          <div className="q-parts">
            {parts.map((p, pi) => (
              <div key={pi} className="q-part">
                <span className="q-part-lbl">{p.label}</span>
                <span>
                  <span dangerouslySetInnerHTML={{ __html: mdToHtml(p.text) }} />
                  {prefs.showMarks && p.marks > 0 && <span className="marks">[{p.marks}]</span>}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
      <div className="q-actions">
        <button className="ract-btn" onClick={() => setShowHint(h => !h)}>
          {showHint ? 'Hide hint' : 'Show hint'}
        </button>
        <button className="ract-btn" onClick={() => setShowAnswer(a => !a)}>
          {showAnswer ? 'Hide answer' : 'Show answer'}
        </button>
        <button className="mark-trigger" onClick={() => setShowMark(m => !m)}>
          📷 Get marking prompt
        </button>
      </div>

      {showHint && (
        <div className="coll open">
          <div className="hint-box" dangerouslySetInnerHTML={{ __html: `<p style="margin:0">${mdToHtml(q.hint)}</p>` }} />
        </div>
      )}
      {showAnswer && (
        <div className="coll open">
          <div className="ans-box" dangerouslySetInnerHTML={{ __html: `<p style="margin:0 0 8px;">${mdToHtml(q.answer)}</p>` }} />
        </div>
      )}
      {savedFeedback && (
        <div className="coll open">
          <div className="fb-box" dangerouslySetInnerHTML={{ __html: `<p style="margin:0">${mdToHtml(savedFeedback)}</p>` }} />
        </div>
      )}

      {showMark && (
        <div className="mark-panel open">
          <h5 style={{ fontSize: '12.5px', fontWeight: 500, color: 'var(--text2)', marginBottom: '10px' }}>Get your work marked</h5>
          <div
            className="drop-z"
            onClick={() => document.getElementById(`fi-${idx}`).click()}
            onDragOver={e => e.preventDefault()}
            onDrop={e => { e.preventDefault(); if (e.dataTransfer.files[0]) handleImg(e.dataTransfer.files[0]); }}
          >
            <div style={{ fontSize: '22px', marginBottom: '6px' }}>📷</div>
            <p>{imgSrc ? 'Photo uploaded — marking prompt ready below' : 'Click to upload or drag your photo of working'}</p>
          </div>
          <input id={`fi-${idx}`} type="file" accept="image/*" style={{ display: 'none' }} onChange={e => { if (e.target.files[0]) handleImg(e.target.files[0]); }} />
          {imgSrc && (
            <div style={{ marginTop: '10px' }}>
              <img src={imgSrc} style={{ maxWidth: '100%', maxHeight: '220px', borderRadius: '6px', border: '1px solid var(--border)' }} alt="working" />
            </div>
          )}
          {imgSrc && (
            <div className="mprompt-out" style={{ marginTop: '12px' }}>
              <div className="mprompt-header">
                <h4>Copy this into Claude — attach your photo too</h4>
                <button className={`copy-btn${copyOk ? ' ok' : ''}`} onClick={copyPrompt}>
                  {copyOk ? 'Copied ✓' : 'Copy'}
                </button>
              </div>
              <div className="mprompt-text">{markPrompt}</div>
            </div>
          )}
          {imgSrc && !showFBInput && !savedFeedback && (
            <div style={{ marginTop: '10px', fontSize: '12px', color: 'var(--text3)', lineHeight: 1.6 }}>
              <strong style={{ color: 'var(--text2)' }}>Steps:</strong> Copy → go to Claude → attach photo → paste prompt → send → come back and paste feedback.
              <div style={{ marginTop: '8px' }}>
                <button
                  onClick={() => setShowFBInput(true)}
                  style={{ background: 'var(--bg4)', border: '1px solid var(--border2)', color: 'var(--text2)', borderRadius: '6px', padding: '5px 12px', fontSize: '12px', cursor: 'pointer' }}
                >
                  Paste feedback →
                </button>
              </div>
            </div>
          )}
          {showFBInput && (
            <div className="fb-import" style={{ marginTop: '12px' }}>
              <p style={{ fontSize: '12px', color: 'var(--text3)', marginBottom: '6px' }}>Paste Claude's feedback:</p>
              <textarea
                placeholder="Paste feedback here…"
                value={feedbackText}
                onChange={e => setFeedbackText(e.target.value)}
              />
              <button onClick={saveFeedback}>Save feedback</button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
