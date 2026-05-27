import { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';

const AppContext = createContext(null);

const DEFAULT_PREFS = { showMarks: true, latex: true, geminiKey: '' };

const DEMO_SUBJECTS = [
  {
    name: 'AQA Biology',
    code: 'A-Level',
    papers: {
      'All Topics': [
        { name: 'Cell Biology', subs: ['Cell structure', 'Cell membrane', 'Cell division', 'Cell transport'] },
        { name: 'Biological Molecules', subs: ['Carbohydrates', 'Proteins', 'Lipids', 'Enzymes', 'DNA & RNA'] },
        { name: 'Genetics', subs: ['DNA replication', 'Protein synthesis', 'Inheritance', 'Gene expression'] },
        { name: 'Ecology', subs: ['Ecosystems', 'Biodiversity', 'Energy flow', 'Nutrient cycles'] },
      ]
    }
  },
  {
    name: 'AQA Chemistry',
    code: 'A-Level',
    papers: {
      'All Topics': [
        { name: 'Physical Chemistry', subs: ['Atomic structure', 'Amount of substance', 'Bonding', 'Energetics', 'Kinetics'] },
        { name: 'Inorganic Chemistry', subs: ['Periodicity', 'Group 2', 'Group 7', 'Transition metals'] },
        { name: 'Organic Chemistry', subs: ['Alkanes', 'Alkenes', 'Alcohols', 'Carboxylic acids', 'Aromatic chemistry'] },
      ]
    }
  }
];

function load(key, fallback) {
  try { const v = localStorage.getItem(key); return v ? JSON.parse(v) : fallback; } catch { return fallback; }
}
function save(key, val) {
  try { localStorage.setItem(key, JSON.stringify(val)); } catch {}
}

export function AppProvider({ children }) {
  const [screen, setScreen] = useState('auth'); // 'auth' | 'setup' | 'app'
  const [user, setUser] = useState(null);
  const [subjects, setSubjects] = useState([]);
  const [progress, setProgress] = useState({});
  const [prefs, setPrefs] = useState(DEFAULT_PREFS);
  const [atlasMemory, setAtlasMemory] = useState(null); // null = no diagnostic done
  const [chatHistory, setChatHistory] = useState([]);
  const [currentPage, setCurrentPage] = useState('home');
  const [forgeTarget, setForgeTarget] = useState(null); // {subjectIdx, topic, subtopic}
  const [forgeInitMode, setForgeInitMode] = useState(null); // 'checklist' | 'freetext' | 'custom'
  const [atlasTriggerDiag, setAtlasTriggerDiag] = useState(false);
  const [saveStatus, setSaveStatus] = useState('');
  const [toast, setToast] = useState({ msg: '', show: false });
  const toastTimer = useRef(null);

  // Load persisted state on mount
  useEffect(() => {
    const savedUser = load('li_user', null);
    const savedSubjects = load('li_subjects', []);
    const savedProgress = load('li_progress', {});
    const savedPrefs = load('li_prefs', DEFAULT_PREFS);
    const savedAtlas = load('li_atlas', null);
    const savedChat = load('li_chat', []);
    if (savedUser) {
      setUser(savedUser);
      setPrefs({ ...DEFAULT_PREFS, ...savedPrefs });
      setProgress(savedProgress);
      setAtlasMemory(savedAtlas);
      setChatHistory(savedChat);
      if (savedSubjects && savedSubjects.length > 0) {
        setSubjects(savedSubjects);
        setScreen('app');
      } else {
        setScreen('setup');
      }
    }
  }, []);

  const showToast = useCallback((msg) => {
    if (toastTimer.current) clearTimeout(toastTimer.current);
    setToast({ msg, show: true });
    toastTimer.current = setTimeout(() => setToast(t => ({ ...t, show: false })), 2800);
  }, []);

  const signIn = useCallback((name, email) => {
    const u = { name, email };
    setUser(u);
    save('li_user', u);
    const savedSubjects = load('li_subjects', []);
    if (savedSubjects && savedSubjects.length > 0) {
      setSubjects(savedSubjects);
      setProgress(load('li_progress', {}));
      setPrefs({ ...DEFAULT_PREFS, ...load('li_prefs', DEFAULT_PREFS) });
      setAtlasMemory(load('li_atlas', null));
      setChatHistory(load('li_chat', []));
      setScreen('app');
    } else {
      setScreen('setup');
    }
  }, []);

  const signInDemo = useCallback(() => {
    const u = { name: 'Demo User', email: 'demo@learninc.io' };
    setUser(u);
    save('li_user', u);
    setSubjects(DEMO_SUBJECTS);
    save('li_subjects', DEMO_SUBJECTS);
    setScreen('app');
  }, []);

  const signOut = useCallback(() => {
    setUser(null); setSubjects([]); setProgress({}); setAtlasMemory(null); setChatHistory([]);
    setScreen('auth'); setCurrentPage('home');
  }, []);

  const finishSetup = useCallback((newSubjects) => {
    setSubjects(newSubjects);
    save('li_subjects', newSubjects);
    setScreen('app');
    showToast('Subjects saved ✓');
  }, [showToast]);

  const updateProgress = useCallback((key, data) => {
    setProgress(prev => {
      const next = { ...prev, [key]: { ...(prev[key] || {}), ...data } };
      save('li_progress', next);
      return next;
    });
  }, []);

  const updatePrefs = useCallback((key, val) => {
    setPrefs(prev => {
      const next = { ...prev, [key]: val };
      save('li_prefs', next);
      return next;
    });
  }, []);

  const completeAtlasDiagnostic = useCallback((weakAreas) => {
    const mem = {
      completedAt: new Date().toISOString(),
      weakAreas,
      sessions: 1,
      topicsCovered: [],
      examDate: null,
    };
    setAtlasMemory(mem);
    save('li_atlas', mem);
  }, []);

  const addChatMessage = useCallback((msg) => {
    setChatHistory(prev => {
      const next = [...prev, msg];
      save('li_chat', next);
      return next;
    });
  }, []);

  const navigateToForge = useCallback((subjectIdx = null, topic = null, subtopic = null) => {
    if (subjectIdx !== null) setForgeTarget({ subjectIdx, topic, subtopic });
    setCurrentPage('forge');
  }, []);

  const totalSubtopics = subjects.reduce((a, s) =>
    a + Object.values(s.papers).reduce((b, ts) => b + ts.reduce((c, t) => c + t.subs.length, 0), 0), 0);
  const attempted = Object.values(progress).filter(v => v.attempts).length;
  const marked = Object.values(progress).filter(v => v.marked).length;

  return (
    <AppContext.Provider value={{
      screen, user, subjects, progress, prefs, atlasMemory, chatHistory,
      currentPage, setCurrentPage, forgeTarget, setForgeTarget,
      forgeInitMode, setForgeInitMode, atlasTriggerDiag, setAtlasTriggerDiag,
      saveStatus, toast, showToast,
      signIn, signInDemo, signOut,
      finishSetup,
      updateProgress, updatePrefs,
      completeAtlasDiagnostic, addChatMessage,
      navigateToForge,
      totalSubtopics, attempted, marked,
    }}>
      {children}
    </AppContext.Provider>
  );
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
}
