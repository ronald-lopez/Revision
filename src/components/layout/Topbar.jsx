import { useApp } from '../../context/AppContext.jsx';

const NAV = [
  { key: 'home', label: 'Home' },
  {
    key: 'forge',
    label: 'FORGE',
    color: 'var(--accent)',
    items: [
      { label: 'Practice Questions', desc: 'Generate from your topic checklist', icon: '📝', forgeMode: 'checklist' },
      { label: 'Custom Prompt',       desc: 'Write your own question brief',     icon: '✍️', forgeMode: 'custom'    },
      { label: 'Free Text Entry',     desc: 'Type subject & topic manually',     icon: '📋', forgeMode: 'freetext'  },
    ],
  },
  {
    key: 'atlas',
    label: 'ATLAS',
    color: 'var(--teal)',
    items: [
      { label: 'Tutor Chat',    desc: 'Ask questions, get explanations',   icon: '💬' },
      { label: 'Run Diagnostic', desc: 'Identify your weak areas fast',    icon: '🩺', atlasDiag: true },
    ],
  },
  {
    key: 'flux',
    label: 'FLUX',
    badge: 'PRO',
    color: 'var(--amber)',
    items: [
      { label: 'Weekly Schedule',  desc: 'AI-generated revision plan',     icon: '📅', locked: true },
      { label: 'Exam Countdown',   desc: 'Days until each paper',          icon: '⏱️', locked: true },
      { label: 'Study Analytics',  desc: 'Revision time & efficiency',     icon: '📈', locked: true },
    ],
  },
  { key: 'progress', label: 'Progress' },
  { key: 'settings', label: 'Settings' },
];

export default function Topbar() {
  const { user, currentPage, setCurrentPage, signOut, saveStatus,
          setForgeInitMode, setAtlasTriggerDiag } = useApp();
  const initials = user?.name
    ? user.name.split(' ').map(w => w[0]).join('').toUpperCase().slice(0, 2)
    : '?';

  function handleNav(itemKey, dd = null) {
    if (dd?.locked) return;
    if (dd?.forgeMode)  setForgeInitMode(dd.forgeMode);
    if (dd?.atlasDiag)  setAtlasTriggerDiag(true);
    setCurrentPage(itemKey);
  }

  return (
    <div className="topbar">
      <div className="topbar-left">
        <div className="topbar-logo" onClick={() => setCurrentPage('home')}>LearnInc</div>
        <nav className="topbar-nav">
          {NAV.map(item => (
            <div key={item.key} className="tnav-wrap">
              <button
                className={`tnav-item${currentPage === item.key ? ' active' : ''}`}
                onClick={() => handleNav(item.key)}
              >
                {item.label}
                {item.badge  && <span className="tnav-badge">{item.badge}</span>}
                {item.items  && <span className="tnav-chev">▾</span>}
              </button>

              {item.items && (
                <div className="nav-dropdown">
                  <div className="nav-dd-title" style={{ color: item.color }}>
                    {item.label}
                  </div>
                  {item.items.map((dd, i) => (
                    <div
                      key={i}
                      className={`nav-dd-item${dd.locked ? ' locked' : ''}`}
                      onClick={() => handleNav(item.key, dd)}
                    >
                      <span className="nav-dd-icon">{dd.icon}</span>
                      <div className="nav-dd-text">
                        <div className="nav-dd-label">
                          {dd.label}
                          {dd.locked && <span className="nav-dd-lock"> 🔒</span>}
                        </div>
                        <div className="nav-dd-desc">{dd.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          ))}
        </nav>
      </div>

      <div className="topbar-right">
        {saveStatus && <span className="save-indicator">{saveStatus}</span>}
        <div className="user-chip">
          <div className="user-avatar">{initials}</div>
          <span className="user-name">{user?.name || 'User'}</span>
        </div>
        <button className="signout-btn" onClick={signOut}>Sign out</button>
      </div>
    </div>
  );
}
