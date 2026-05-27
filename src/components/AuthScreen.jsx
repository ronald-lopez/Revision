import { useApp } from '../context/AppContext.jsx';

export default function AuthScreen() {
  const { signIn, signInDemo } = useApp();

  function handleGoogle() {
    // In production: real OAuth. For prototype, prompt for name.
    const name = prompt('Enter your name for this demo:') || 'Student';
    signIn(name, `${name.toLowerCase().replace(/\s/g, '.')}@demo.com`);
  }

  return (
    <div className="auth-screen">
      <div className="auth-card">
        <div className="auth-logo">LearnInc</div>
        <div className="auth-engines">
          <span className="engine-pill forge">FORGE</span>
          <span style={{ color: 'var(--text3)', fontSize: '12px' }}>·</span>
          <span className="engine-pill atlas">ATLAS</span>
          <span style={{ color: 'var(--text3)', fontSize: '12px' }}>·</span>
          <span className="engine-pill flux">FLUX</span>
        </div>
        <p className="auth-desc">
          The complete AI revision platform. FORGE generates exam papers on demand.
          ATLAS is your personalised AI tutor. Together they close the full revision loop.
        </p>
        <button className="google-btn" onClick={handleGoogle}>
          <svg viewBox="0 0 48 48" width="20" height="20">
            <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
            <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
            <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
            <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
          </svg>
          Sign in with Google
        </button>
        <a className="demo-link" onClick={signInDemo}>
          Continue with demo account →
        </a>
        <p className="auth-note">Your progress is saved locally to your browser. No data is shared with anyone.</p>
        <p style={{ fontSize: '10px', color: 'var(--text3)', marginTop: '12px', fontFamily: 'var(--mono)' }}>
          © 2026 Ronald Lopez · LearnInc Prototype
        </p>
      </div>
    </div>
  );
}
