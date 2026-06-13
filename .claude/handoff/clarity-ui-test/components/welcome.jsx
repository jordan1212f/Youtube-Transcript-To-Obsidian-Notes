/* Onboarding entry — Welcome + Sign-up (with a Google sign-up prototype) */

function GoogleG({ size = 18 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 48 48" aria-hidden="true">
      <path fill="#4285F4" d="M45.12 24.5c0-1.56-.14-3.06-.4-4.5H24v8.51h11.84c-.51 2.75-2.06 5.08-4.39 6.64v5.52h7.11c4.16-3.83 6.56-9.47 6.56-16.17z" />
      <path fill="#34A853" d="M24 46c5.94 0 10.92-1.97 14.56-5.33l-7.11-5.52c-1.97 1.32-4.49 2.1-7.45 2.1-5.73 0-10.58-3.87-12.31-9.07H4.34v5.7C7.96 41.07 15.4 46 24 46z" />
      <path fill="#FBBC05" d="M11.69 28.18C11.25 26.86 11 25.45 11 24s.25-2.86.69-4.18v-5.7H4.34A22.02 22.02 0 0 0 2 24c0 3.55.85 6.91 2.34 9.88l7.35-5.7z" />
      <path fill="#EA4335" d="M24 10.75c3.23 0 6.13 1.11 8.41 3.29l6.31-6.31C34.91 4.18 29.93 2 24 2 15.4 2 7.96 6.93 4.34 14.12l7.35 5.7c1.73-5.2 6.58-9.07 12.31-9.07z" />
    </svg>
  );
}

function WelcomeScreen({ onStart }) {
  return (
    <div className="onboard-screen dot-bg ob-entry">
      <div className="ob-welcome">
        <div className="ob-entry-mark ob-rise ob-rise-mark">Clarity<span>.</span></div>
        <h1 className="ob-welcome-h">
          <span className="ob-welcome-line ob-rise ob-rise-l1">Stop saving.</span>
          <span className="ob-welcome-line ob-rise ob-rise-l2">Start doing.</span>
        </h1>
        <p className="ob-welcome-sub ob-rise ob-rise-sub">
          Clarity turns the content you save into real actions with deadlines,
          so what you consume actually becomes what you do.
        </p>
        <div className="ob-welcome-actions ob-rise ob-rise-act">
          <button className="btn btn-accent ob-cta" onClick={onStart}>
            Get started <Ico.arrow width={13} height={13} />
          </button>
          <button className="ob-textlink" onClick={onStart}>I already have an account</button>
        </div>
      </div>
    </div>
  );
}

function SignupScreen({ onDone }) {
  const [email, setEmail] = React.useState('');
  const [gstep, setGstep] = React.useState(null); // null | 'choose' | 'signing'
  const validEmail = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim());

  function pickAccount() {
    setGstep('signing');
    setTimeout(() => onDone(), 1300);
  }

  return (
    <div className="onboard-screen dot-bg ob-entry">
      <div className="ob-signup iv-fade-up">
        <div className="ob-entry-mark">Clarity<span>.</span></div>
        <h1 className="ob-signup-h">Create your account</h1>
        <p className="ob-signup-sub mono">One account. Everything you save, working for you.</p>

        <button className="ob-google-btn" onClick={() => setGstep('choose')}>
          <GoogleG /> <span>Continue with Google</span>
        </button>

        <div className="ob-divider"><span>or</span></div>

        <label className="ob-field">
          <span className="ob-field-label mono">Email</span>
          <input
            type="email"
            className={`ob-input ${email.trim() ? 'has-text' : ''}`}
            placeholder="you@email.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter' && validEmail) onDone(); }}
          />
        </label>
        <button className="btn btn-gate ob-email-btn" disabled={!validEmail} onClick={onDone}>
          Continue with email <Ico.arrow width={13} height={13} />
        </button>

        <p className="ob-legal mono">
          By continuing you agree to our <a href="#" onClick={(e) => e.preventDefault()}>Terms</a> and{' '}
          <a href="#" onClick={(e) => e.preventDefault()}>Privacy Policy</a>.
        </p>
      </div>

      {gstep && <GoogleChooser step={gstep} onPick={pickAccount} onClose={() => setGstep(null)} />}
    </div>
  );
}

/* A tasteful mock of the "Sign in with Google" account chooser — prototype only */
function GoogleChooser({ step, onPick, onClose }) {
  React.useEffect(() => {
    function onKey(e) { if (e.key === 'Escape' && step === 'choose') onClose(); }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [step, onClose]);

  return (
    <div className="ob-gscrim" onClick={() => step === 'choose' && onClose()}>
      <div className="ob-gsheet" onClick={(e) => e.stopPropagation()}>
        <div className="ob-gsheet-head">
          <GoogleG size={20} />
          <span className="ob-gsheet-brand">Sign in with Google</span>
        </div>

        {step === 'choose' ? (
          <div className="ob-gsheet-body">
            <h2 className="ob-gsheet-h">Choose an account</h2>
            <p className="ob-gsheet-to">to continue to <strong>Clarity</strong></p>

            <button className="ob-gaccount" onClick={onPick}>
              <span className="ob-gavatar">J</span>
              <span className="ob-gacct-info">
                <span className="ob-gacct-name">Jordan Lee</span>
                <span className="ob-gacct-email">jordan@gmail.com</span>
              </span>
            </button>
            <button className="ob-gaccount ob-gaccount-other" onClick={onPick}>
              <span className="ob-gicon-other"><Ico.plus width={16} height={16} /></span>
              <span className="ob-gacct-name">Use another account</span>
            </button>

            <p className="ob-gsheet-foot">Prototype — no real sign-in happens.</p>
          </div>
        ) : (
          <div className="ob-gsheet-body ob-gsigning">
            <span className="ob-gspinner"></span>
            <p className="ob-gsigning-text">Signing you in…</p>
          </div>
        )}
      </div>
    </div>
  );
}

Object.assign(window, { WelcomeScreen, SignupScreen, GoogleChooser, GoogleG });
