import { useState } from 'react';
import { useApp } from '../context/AppContext.jsx';

function newSubject() {
  return { id: Date.now(), name: '', code: '', topics: [newTopic()] };
}
function newTopic() {
  return { id: Date.now() + Math.random(), name: '', subs: [''] };
}

export default function SetupScreen() {
  const { finishSetup, signOut } = useApp();
  const [option, setOption] = useState(null); // 'manual' | 'upload'
  const [manualData, setManualData] = useState([newSubject()]);
  const [uploadMsg, setUploadMsg] = useState('');
  const [uploadedSubjects, setUploadedSubjects] = useState(null);
  const [error, setError] = useState('');

  function selectOption(opt) {
    setOption(opt);
    setError('');
  }

  // ── MANUAL BUILDER ────────────────────────────────────────────────────────
  function updateSubjectName(sid, val) {
    setManualData(d => d.map(s => s.id === sid ? { ...s, name: val } : s));
  }
  function removeSubject(sid) {
    setManualData(d => d.filter(s => s.id !== sid));
  }
  function addSubject() {
    setManualData(d => [...d, newSubject()]);
  }
  function addTopic(sid) {
    setManualData(d => d.map(s => s.id === sid ? { ...s, topics: [...s.topics, newTopic()] } : s));
  }
  function updateTopicName(sid, tid, val) {
    setManualData(d => d.map(s => s.id === sid ? {
      ...s, topics: s.topics.map(t => t.id === tid ? { ...t, name: val } : t)
    } : s));
  }
  function removeTopic(sid, tid) {
    setManualData(d => d.map(s => s.id === sid ? { ...s, topics: s.topics.filter(t => t.id !== tid) } : s));
  }
  function updateSub(sid, tid, idx, val) {
    setManualData(d => d.map(s => s.id === sid ? {
      ...s, topics: s.topics.map(t => t.id === tid ? {
        ...t, subs: t.subs.map((sv, i) => i === idx ? val : sv)
      } : t)
    } : s));
  }
  function addSub(sid, tid) {
    setManualData(d => d.map(s => s.id === sid ? {
      ...s, topics: s.topics.map(t => t.id === tid ? { ...t, subs: [...t.subs, ''] } : t)
    } : s));
  }
  function removeSub(sid, tid, idx) {
    setManualData(d => d.map(s => s.id === sid ? {
      ...s, topics: s.topics.map(t => t.id === tid ? { ...t, subs: t.subs.filter((_, i) => i !== idx) } : t)
    } : s));
  }

  function buildSubjectsFromManual() {
    return manualData
      .filter(s => s.name.trim())
      .map(s => ({
        name: s.name.trim(),
        code: s.code.trim(),
        papers: {
          'All Topics': s.topics
            .filter(t => t.name.trim())
            .map(t => ({
              name: t.name.trim(),
              subs: t.subs.filter(sv => sv.trim()),
            }))
            .filter(t => t.subs.length > 0),
        }
      }))
      .filter(s => Object.values(s.papers).flat().length > 0);
  }

  // ── UPLOAD ────────────────────────────────────────────────────────────────
  function handleFile(file) {
    if (!file) return;
    // Only CSV support for now (no XLSX dependency to keep bundle small)
    const reader = new FileReader();
    reader.onload = e => {
      const lines = e.target.result.split('\n').slice(1).filter(l => l.trim());
      const built = {};
      for (const line of lines) {
        const [subj, topic, subtopic] = line.split(',').map(x => x.trim().replace(/^"|"$/g, ''));
        if (!subj || !topic || !subtopic) continue;
        if (!built[subj]) built[subj] = { name: subj, code: '', papers: { 'All Topics': [] } };
        let t = built[subj].papers['All Topics'].find(x => x.name === topic);
        if (!t) { t = { name: topic, subs: [] }; built[subj].papers['All Topics'].push(t); }
        t.subs.push(subtopic);
      }
      const result = Object.values(built);
      if (result.length === 0) { setUploadMsg('Could not parse file — check format'); return; }
      setUploadedSubjects(result);
      const total = result.reduce((a, s) => a + Object.values(s.papers).reduce((b, ts) => b + ts.reduce((c, t) => c + t.subs.length, 0), 0), 0);
      setUploadMsg(`✓ Parsed ${result.length} subject${result.length !== 1 ? 's' : ''}, ${total} subtopics`);
    };
    reader.readAsText(file);
  }

  function downloadTemplate() {
    const csv = 'Subject,Topic,Subtopic\nAQA Biology,Cell Biology,Cell structure\nAQA Biology,Cell Biology,Cell membrane\nAQA Chemistry,Physical Chemistry,Bonding\n';
    const a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }));
    a.download = 'learninc-template.csv';
    a.click();
  }

  function handleContinue() {
    setError('');
    if (option === 'manual') {
      const subjects = buildSubjectsFromManual();
      if (subjects.length === 0) { setError('Add at least one subject with at least one topic and subtopic.'); return; }
      finishSetup(subjects);
    } else if (option === 'upload') {
      if (!uploadedSubjects) { setError('Upload a file first.'); return; }
      finishSetup(uploadedSubjects);
    } else {
      setError('Select an option above.');
    }
  }

  return (
    <div style={{ minHeight: '100vh', background: 'var(--bg)' }}>
      <div style={{ background: 'var(--bg2)', borderBottom: '1px solid var(--border)', padding: '0 24px', height: '52px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <div style={{ fontFamily: 'var(--serif)', fontSize: '19px', color: 'var(--accent)' }}>LearnInc</div>
        <button onClick={signOut} style={{ background: 'none', border: 'none', color: 'var(--text3)', fontSize: '12px', cursor: 'pointer' }}>Sign out</button>
      </div>
      <div className="setup-wrap">
        <h2>Set up your subjects</h2>
        <p className="setup-intro">Add the subjects and topics you're revising. You can edit these at any time in Settings.</p>

        <div className="setup-options">
          <div className={`setup-option${option === 'upload' ? ' selected' : ''}`} onClick={() => selectOption('upload')}>
            <div className="opt-icon">📄</div>
            <h3>Upload a spreadsheet</h3>
            <p>Upload a CSV file with columns: Subject, Topic, Subtopic.</p>
          </div>
          <div className={`setup-option${option === 'manual' ? ' selected' : ''}`} onClick={() => selectOption('manual')}>
            <div className="opt-icon">✏️</div>
            <h3>Build manually</h3>
            <p>Add your subjects, topics, and subtopics using the form below.</p>
          </div>
        </div>

        {option === 'upload' && (
          <div className="setup-panel active">
            <div className="drop-zone-setup"
              onClick={() => document.getElementById('setup-file-input').click()}
              onDragOver={e => e.preventDefault()}
              onDrop={e => { e.preventDefault(); handleFile(e.dataTransfer.files[0]); }}>
              <div style={{ fontSize: '28px', marginBottom: '8px' }}>📂</div>
              <p>Click to upload or drag your CSV file here</p>
              <p style={{ marginTop: '4px', fontSize: '11px', color: 'var(--text3)' }}>Supported: .csv</p>
            </div>
            <input id="setup-file-input" type="file" accept=".csv" style={{ display: 'none' }} onChange={e => handleFile(e.target.files[0])} />
            <div style={{ marginTop: '10px', fontSize: '12px', color: 'var(--accent)', cursor: 'pointer', textDecoration: 'underline' }} onClick={downloadTemplate}>
              Download template CSV →
            </div>
            {uploadMsg && (
              <div style={{ marginTop: '12px', fontSize: '13px', color: uploadMsg.startsWith('✓') ? 'var(--green)' : 'var(--red)' }}>
                {uploadMsg}
              </div>
            )}
          </div>
        )}

        {option === 'manual' && (
          <div className="setup-panel active">
            <div className="manual-subjects">
              {manualData.map(s => (
                <div key={s.id} className="manual-subject">
                  <div className="manual-subject-header">
                    <input
                      placeholder="Subject name (e.g. AQA Biology)"
                      value={s.name}
                      onChange={e => updateSubjectName(s.id, e.target.value)}
                    />
                    <button className="manual-del" onClick={() => removeSubject(s.id)}>✕</button>
                  </div>
                  <div className="manual-topics">
                    {s.topics.map(t => (
                      <div key={t.id} className="manual-topic">
                        <div className="manual-topic-header">
                          <input
                            placeholder="Topic name (e.g. Cell Biology)"
                            value={t.name}
                            onChange={e => updateTopicName(s.id, t.id, e.target.value)}
                          />
                          <button className="manual-del" onClick={() => removeTopic(s.id, t.id)}>✕</button>
                        </div>
                        <div className="manual-subs">
                          {t.subs.map((sv, idx) => (
                            <div key={idx} className="manual-sub-row">
                              <input
                                placeholder="Subtopic (e.g. Cell structure)"
                                value={sv}
                                onChange={e => updateSub(s.id, t.id, idx, e.target.value)}
                              />
                              <button className="manual-del" onClick={() => removeSub(s.id, t.id, idx)}>✕</button>
                            </div>
                          ))}
                        </div>
                        <div style={{ padding: '0 8px 6px' }}>
                          <button className="add-sub-btn" onClick={() => addSub(s.id, t.id)}>+ Add subtopic</button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div style={{ padding: '0 14px 10px' }}>
                    <button className="add-topic-btn" onClick={() => addTopic(s.id)}>+ Add topic</button>
                  </div>
                </div>
              ))}
            </div>
            <button className="add-subject-btn" onClick={addSubject}>+ Add subject</button>
          </div>
        )}

        <div style={{ marginTop: '24px' }}>
          <button className="btn-primary" onClick={handleContinue} disabled={!option}>
            Continue to app →
          </button>
          {error && <div style={{ fontSize: '12px', color: 'var(--red)', marginTop: '8px' }}>{error}</div>}
        </div>
      </div>
    </div>
  );
}
