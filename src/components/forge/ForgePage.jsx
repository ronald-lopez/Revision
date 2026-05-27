import { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext.jsx';
import QuestionCard from './QuestionCard.jsx';
import { generateWithGemini, getMockQuestions, buildForgePrompt } from '../../utils/gemini.js';

// ─── Subject-type detection ────────────────────────────────────────────────
const HUMANITIES_KW = [
  'history', 'english', 'literature', 'lit', 'philosophy', 'sociology',
  'politics', 'law', 'art', 'music', 'media', 'religious', 'religion',
  'french', 'spanish', 'german', 'latin', 'arabic', 'classics', 'theology',
  'ethics', 'rs', 'film', 'drama', 'theatre',
];
function detectType(name) {
  if (!name) return 'stem';
  const n = name.toLowerCase();
  return HUMANITIES_KW.some(kw => n.includes(kw)) ? 'humanities' : 'stem';
}

const OPTIONS = {
  stem: {
    difficulties: ['accessible', 'medium', 'harder', 'exam-hard', 'mixed'],
    styles:       ['multi-part', 'proof / derivation', 'show that', 'applied context', 'calculation', 'mixed'],
    defaultDiff:  'medium',
    defaultStyle: 'multi-part',
  },
  humanities: {
    difficulties: ['AO1 recall', 'AO2 application', 'AO3 analysis', 'essay level', 'mixed'],
    styles:       ['source analysis', '12-mark essay', '25-mark essay', 'compare & contrast', 'mixed'],
    defaultDiff:  'AO2 application',
    defaultStyle: '12-mark essay',
  },
};

// ─── Topic tree ────────────────────────────────────────────────────────────
function TopicTree({ subjects, currentSubjectIdx, progress, onSelectSub, onQuickGen }) {
  const [openGroups, setOpenGroups] = useState({});
  if (currentSubjectIdx === null) return null;
  const s = subjects[currentSubjectIdx];

  return (
    <div>
      <div className="tree-label">Topic tree — click a subtopic to select it</div>
      {Object.entries(s.papers).map(([paper, topics]) => (
        <div key={paper}>
          {Object.keys(s.papers).length > 1 && (
            <div style={{ fontSize: '10px', color: 'var(--text3)', fontFamily: 'var(--mono)', textTransform: 'uppercase', letterSpacing: '0.06em', padding: '10px 0 4px' }}>{paper}</div>
          )}
          {topics.map((t, ti) => {
            const gkey = `${currentSubjectIdx}-${ti}`;
            const done = t.subs.filter(sub => progress[`${currentSubjectIdx}|${t.name}|${sub}`]?.attempts).length;
            const isOpen = openGroups[gkey];
            return (
              <div key={ti} className="topic-group">
                <div className="tg-head" onClick={() => setOpenGroups(g => ({ ...g, [gkey]: !g[gkey] }))}>
                  <h4>{t.name}</h4>
                  <div className="tg-meta">
                    <span className="tg-count">{t.subs.length} subtopics{done ? ` · ${done} done` : ''}</span>
                    <span className={`tg-arr${isOpen ? ' open' : ''}`}>▼</span>
                  </div>
                </div>
                {isOpen && (
                  <div className="tg-subs">
                    {t.subs.map((sub, si) => {
                      const pk = `${currentSubjectIdx}|${t.name}|${sub}`;
                      return (
                        <div key={si} className="sub-row" onClick={() => onSelectSub(currentSubjectIdx, t.name, sub)}>
                          <span className="sub-name">{sub}</span>
                          {progress[pk]?.attempts && <span className="done-badge">✓</span>}
                          <div className="sub-actions">
                            <button className="sub-btn" onClick={e => { e.stopPropagation(); onQuickGen(currentSubjectIdx, t.name, sub); }}>
                              Prompt →
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      ))}
    </div>
  );
}

// ─── Main page ─────────────────────────────────────────────────────────────
export default function ForgePage() {
  const {
    subjects, progress, prefs,
    forgeTarget, setForgeTarget,
    forgeInitMode, setForgeInitMode,
    updateProgress, showToast,
  } = useApp();

  const [currentSubjectIdx, setCurrentSubjectIdx] = useState(null);
  const [currentTopic,      setCurrentTopic]      = useState(null);
  const [currentSubtopic,   setCurrentSubtopic]   = useState(null);
  const [diff,  setDiff]  = useState('medium');
  const [num,   setNum]   = useState('5');
  const [style, setStyle] = useState('multi-part');
  const [mode,  setMode]  = useState('checklist'); // 'checklist' | 'freetext' | 'custom'

  // Free-text mode fields
  const [ftSubject,  setFtSubject]  = useState('');
  const [ftTopic,    setFtTopic]    = useState('');
  const [ftSubtopic, setFtSubtopic] = useState('');

  // Custom-prompt mode field
  const [customPrompt, setCustomPrompt] = useState('');

  // Subject-type override (null = auto)
  const [manualType, setManualType] = useState(null);

  const [questions,   setQuestions]   = useState([]);
  const [loading,     setLoading]     = useState(false);
  const [pasteText,   setPasteText]   = useState('');
  const [pasteStatus, setPasteStatus] = useState('');
  const [showImport,  setShowImport]  = useState(false);

  // Consume nav-dropdown mode hint
  useEffect(() => {
    if (forgeInitMode) { setMode(forgeInitMode); setForgeInitMode(null); }
  }, [forgeInitMode, setForgeInitMode]);

  // Consume ATLAS → FORGE target
  useEffect(() => {
    if (forgeTarget) {
      setCurrentSubjectIdx(forgeTarget.subjectIdx);
      setCurrentTopic(forgeTarget.topic);
      setCurrentSubtopic(forgeTarget.subtopic);
      setForgeTarget(null);
    }
  }, [forgeTarget, setForgeTarget]);

  // Determine effective subject name for type detection
  const autoNameForType = mode === 'freetext'
    ? ftSubject
    : (currentSubjectIdx !== null ? subjects[currentSubjectIdx]?.name : '');
  const autoType    = detectType(autoNameForType);
  const subjectType = manualType || autoType;
  const opts        = OPTIONS[subjectType];

  // Reset diff/style when they become invalid for the new type
  useEffect(() => {
    if (!opts.difficulties.includes(diff))  setDiff(opts.defaultDiff);
    if (!opts.styles.includes(style))       setStyle(opts.defaultStyle);
  }, [subjectType]); // eslint-disable-line react-hooks/exhaustive-deps

  // Convenience
  const selSubjectName = currentSubjectIdx !== null ? subjects[currentSubjectIdx]?.name : '';
  const selSubjectCode = currentSubjectIdx !== null ? subjects[currentSubjectIdx]?.code : '';
  const isMaths        = selSubjectName?.toLowerCase().includes('math');

  function selectSub(si, tname, sub) {
    setCurrentSubjectIdx(si);
    setCurrentTopic(tname);
    setCurrentSubtopic(sub);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
  function quickGen(si, tname, sub) {
    selectSub(si, tname, sub);
    setTimeout(generate, 100);
  }

  async function generate() {
    if (mode === 'checklist' && (!selSubjectName || !currentTopic || !currentSubtopic)) {
      showToast('Select a subtopic first'); return;
    }
    if (mode === 'freetext' && (!ftSubject || !ftTopic || !ftSubtopic)) {
      showToast('Fill in subject, topic and subtopic'); return;
    }
    if (mode === 'custom' && !customPrompt.trim()) {
      showToast('Enter a custom prompt first'); return;
    }

    setLoading(true);
    setQuestions([]);
    setShowImport(true);

    try {
      let qs;
      if (prefs.geminiKey) {
        let prompt;
        if (mode === 'custom') {
          prompt = `${customPrompt.trim()}

IMPORTANT: Return ONLY a JSON array — no markdown, no explanation. Each item must follow this schema exactly:
[{"question":"...","answer":"...","hints":["..."],"difficulty":"${diff}","marks":5,"parts":[{"label":"a","text":"...","marks":3}]}]
Use an empty parts array if there are no sub-parts.`;
        } else {
          const subjName = mode === 'freetext' ? ftSubject : selSubjectName;
          const topic    = mode === 'freetext' ? ftTopic    : currentTopic;
          const subtopic = mode === 'freetext' ? ftSubtopic : currentSubtopic;
          prompt = buildForgePrompt(subjName, selSubjectCode, topic, subtopic, diff, style, num, isMaths);
        }
        qs = await generateWithGemini(prefs.geminiKey, prompt);
      } else {
        await new Promise(r => setTimeout(r, 1200));
        qs = getMockQuestions(parseInt(num), diff);
      }
      renderQuestions(qs);
    } catch (err) {
      showToast('Generation failed: ' + err.message);
      setLoading(false);
    }
  }

  function renderQuestions(qs) {
    const topic    = mode === 'freetext' ? ftTopic    : mode === 'custom' ? 'Custom' : currentTopic;
    const subtopic = mode === 'freetext' ? ftSubtopic : mode === 'custom' ? 'Prompt' : currentSubtopic;
    setQuestions(qs);
    setLoading(false);
    const pk = mode === 'freetext'
      ? `ft|${ftSubject}|${ftTopic}|${ftSubtopic}`
      : mode === 'custom'
      ? `custom|${Date.now()}`
      : `${currentSubjectIdx}|${topic}|${subtopic}`;
    updateProgress(pk, { attempts: (progress[pk]?.attempts || 0) + 1, last: new Date().toISOString() });
    showToast(`${qs.length} question${qs.length !== 1 ? 's' : ''} generated ✓`);
    setTimeout(() => document.getElementById('questions-out')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 200);
  }

  function importPaste() {
    try {
      let text = pasteText.trim().replace(/^```json\s*/, '').replace(/^```\s*/, '').replace(/\s*```$/, '').trim();
      const s = text.indexOf('['), e = text.lastIndexOf(']');
      if (s === -1 || e === -1) throw new Error('No JSON array found');
      const qs = JSON.parse(text.slice(s, e + 1));
      if (!Array.isArray(qs) || !qs.length) throw new Error('Empty array');
      renderQuestions(qs);
      setPasteStatus('✓ ' + qs.length + ' questions loaded');
    } catch (err) {
      setPasteStatus('Parse error: ' + err.message);
      showToast('Could not parse — copy the full response');
    }
  }

  const subjectTitle = currentSubjectIdx !== null ? subjects[currentSubjectIdx]?.name : 'Practice Questions';
  const topicLine    = currentTopic ? `${currentTopic} · ${currentSubtopic}` : 'Select a topic from the tree below, or use free text / custom prompt.';

  // Subject-type toggle row (shown in freetext + custom; in checklist it's auto but still overridable)
  const showTypeRow = mode !== 'checklist' || true; // always show
  const autoDetectedMsg = autoNameForType
    ? `auto · "${autoNameForType}"`
    : mode === 'custom' ? 'set manually below' : 'auto';

  return (
    <div className="page-content">
      <div className="practice-header">
        <div>
          <h2 style={{ fontFamily: 'var(--serif)' }}>
            <span style={{ color: 'var(--accent)', fontFamily: 'var(--mono)', fontSize: '13px', display: 'block', marginBottom: '2px' }}>FORGE</span>
            {subjectTitle}
          </h2>
          <p>{topicLine}</p>
        </div>
        {!prefs.geminiKey && (
          <div style={{ background: 'var(--amber-bg)', border: '1px solid var(--amber-border)', borderRadius: '8px', padding: '8px 14px', fontSize: '12px', color: 'var(--amber)', maxWidth: '240px' }}>
            Demo mode — add a Gemini key in Settings for live generation
          </div>
        )}
      </div>

      {/* Subject selector */}
      {subjects.length > 1 && (
        <div style={{ marginBottom: '16px' }}>
          <div className="qlabel">Subject</div>
          <div className="chip-group">
            {subjects.map((s, i) => (
              <div
                key={i}
                className={`chip${currentSubjectIdx === i ? ' sel' : ''}`}
                onClick={() => { setCurrentSubjectIdx(i); setCurrentTopic(null); setCurrentSubtopic(null); setManualType(null); }}
              >
                {s.name}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Config panel */}
      <div className="qgen-panel">
        {/* Panel header + mode switcher */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '16px', flexWrap: 'wrap', gap: '8px' }}>
          <h3 style={{ fontSize: '14px', fontWeight: 500 }}>Configure questions</h3>
          <div style={{ display: 'flex', gap: '6px' }}>
            <button className={`mode-btn${mode === 'checklist' ? ' active' : ''}`} onClick={() => setMode('checklist')}>From topics</button>
            <button className={`mode-btn${mode === 'freetext'  ? ' active' : ''}`} onClick={() => setMode('freetext')}>Free text</button>
            <button className={`mode-btn${mode === 'custom'    ? ' active' : ''}`} onClick={() => setMode('custom')}>Custom prompt</button>
          </div>
        </div>

        {/* Mode-specific input */}
        {mode === 'checklist' && (
          <div className={`topic-sel-box${currentSubtopic ? ' has-topic' : ''}`} style={{ marginBottom: '16px' }}>
            {currentSubtopic
              ? `${selSubjectName} › ${currentTopic} › ${currentSubtopic}`
              : 'No topic selected — pick one from the tree below'}
          </div>
        )}

        {mode === 'freetext' && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '10px', marginBottom: '16px' }}>
            <div>
              <div className="qlabel">Subject</div>
              <input className="freetext-input" placeholder="e.g. AQA Biology" value={ftSubject} onChange={e => { setFtSubject(e.target.value); setManualType(null); }} />
            </div>
            <div>
              <div className="qlabel">Topic</div>
              <input className="freetext-input" placeholder="e.g. Cell Division" value={ftTopic} onChange={e => setFtTopic(e.target.value)} />
            </div>
            <div>
              <div className="qlabel">Subtopic</div>
              <input className="freetext-input" placeholder="e.g. Mitosis" value={ftSubtopic} onChange={e => setFtSubtopic(e.target.value)} />
            </div>
          </div>
        )}

        {mode === 'custom' && (
          <div style={{ marginBottom: '16px' }}>
            <div className="qlabel">Your question brief</div>
            <textarea
              className="custom-prompt-ta"
              placeholder={`Describe exactly what you want — e.g.\n\n"Generate 5 A-Level History questions about the causes of WWI. Focus on the alliance system and nationalist tensions. Include a 12-mark essay question and four shorter recall questions. AQA style."`}
              value={customPrompt}
              onChange={e => setCustomPrompt(e.target.value)}
              rows={5}
            />
            <div style={{ fontSize: '11.5px', color: 'var(--text3)', marginTop: '5px' }}>
              Mention subject, topic, difficulty, mark allocations and any style preferences in your brief.
              Difficulty &amp; style chips below will be appended to your prompt.
            </div>
          </div>
        )}

        {/* Subject-type toggle */}
        <div className="subtype-row">
          <span className="subtype-label">Subject type</span>
          <button
            className={`subtype-btn${subjectType === 'stem' ? ' active stem' : ''}`}
            onClick={() => setManualType(manualType === 'stem' ? null : 'stem')}
          >STEM</button>
          <button
            className={`subtype-btn${subjectType === 'humanities' ? ' active humanities' : ''}`}
            onClick={() => setManualType(manualType === 'humanities' ? null : 'humanities')}
          >Humanities</button>
          {!manualType && (
            <span className="subtype-auto">{autoDetectedMsg}</span>
          )}
          {manualType && (
            <button className="subtype-clear" onClick={() => setManualType(null)}>reset to auto ×</button>
          )}
        </div>

        {/* Difficulty + Number */}
        <div className="qrow">
          <div>
            <div className="qlabel">Difficulty</div>
            <div className="chip-group">
              {opts.difficulties.map(d => (
                <div key={d} className={`chip${diff === d ? ' sel' : ''}`} onClick={() => setDiff(d)}>
                  {d}
                </div>
              ))}
            </div>
          </div>
          <div>
            <div className="qlabel">Number</div>
            <div className="chip-group">
              {['1', '3', '5', '8', '10'].map(n => (
                <div key={n} className={`chip${num === n ? ' sel' : ''}`} onClick={() => setNum(n)}>{n}</div>
              ))}
            </div>
          </div>
        </div>

        {/* Style */}
        {mode !== 'custom' && (
          <div className="qrow">
            <div>
              <div className="qlabel">Style</div>
              <div className="chip-group">
                {opts.styles.map(s => (
                  <div key={s} className={`chip${style === s ? ' sel' : ''}`} onClick={() => setStyle(s)}>
                    {s}
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        <button className="btn-primary" style={{ marginTop: '4px' }} onClick={generate} disabled={loading}>
          {loading ? 'Generating…' : 'Generate questions →'}
        </button>
      </div>

      {/* Loading */}
      {loading && (
        <div style={{ padding: '48px', textAlign: 'center', color: 'var(--text3)', fontSize: '13px' }}>
          <div style={{ width: '32px', height: '32px', border: '3px solid var(--border2)', borderTopColor: 'var(--accent)', borderRadius: '50%', animation: 'spin 0.8s linear infinite', margin: '0 auto 14px' }} />
          Generating questions…
        </div>
      )}

      {/* Questions */}
      <div id="questions-out">
        {questions.length > 0 && (
          <>
            <div style={{ fontSize: '10px', color: 'var(--text3)', fontFamily: 'var(--mono)', marginBottom: '12px', textTransform: 'uppercase', letterSpacing: '0.06em' }}>
              {questions.length} question{questions.length !== 1 ? 's' : ''} ·{' '}
              {mode === 'freetext' ? `${ftTopic} · ${ftSubtopic}` : mode === 'custom' ? 'Custom prompt' : `${currentTopic} · ${currentSubtopic}`}
            </div>
            {questions.map((q, i) => (
              <QuestionCard
                key={i} q={q} idx={i}
                topic={mode === 'freetext' ? ftTopic : mode === 'custom' ? 'Custom' : currentTopic}
                subtopic={mode === 'freetext' ? ftSubtopic : mode === 'custom' ? 'Prompt' : currentSubtopic}
              />
            ))}
          </>
        )}
      </div>

      {/* Paste import fallback */}
      {showImport && (
        <div className="import-box">
          <h4 style={{ fontSize: '13.5px', fontWeight: 500, marginBottom: '10px' }}>Paste a response manually (optional)</h4>
          <p style={{ fontSize: '12px', color: 'var(--text3)', marginBottom: '10px' }}>If auto-generation fails, paste a JSON response here as a fallback.</p>
          <textarea className="import-ta" value={pasteText} onChange={e => setPasteText(e.target.value)} placeholder="Paste JSON response here…" />
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginTop: '8px' }}>
            <button className="btn-primary" onClick={importPaste}>Import</button>
            {pasteStatus && <span style={{ fontSize: '12px', color: pasteStatus.startsWith('✓') ? 'var(--green)' : 'var(--red)' }}>{pasteStatus}</span>}
          </div>
        </div>
      )}

      {/* Topic tree — only in checklist mode */}
      {mode === 'checklist' && (
        <TopicTree
          subjects={subjects}
          currentSubjectIdx={currentSubjectIdx ?? (subjects.length > 0 ? 0 : null)}
          progress={progress}
          onSelectSub={selectSub}
          onQuickGen={quickGen}
        />
      )}
    </div>
  );
}
