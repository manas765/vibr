import { useState, useEffect, useRef } from "react";
import { supabase } from "../supabaseClient";
import vibrLogoDark from "../assets/vibr-logo-dark-theme.png";
import vibrLogoLight from "../assets/vibr-logo-light-theme.png";
import "./AuthPage.css";

function EyeIcon({ open }) {
  return open ? (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M1.5 12S5 5 12 5s10.5 7 10.5 7-3.5 7-10.5 7S1.5 12 1.5 12Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ) : (
    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3 3l18 18" />
      <path d="M10.6 5.2A10.7 10.7 0 0 1 12 5c7 0 10.5 7 10.5 7a13.8 13.8 0 0 1-3.2 4.1M6.7 6.7C3.6 8.8 1.5 12 1.5 12s3.5 7 10.5 7a10.4 10.4 0 0 0 4.3-.9" />
      <path d="M9.9 10a3 3 0 0 0 4.2 4.2" />
    </svg>
  );
}

const NOTE_GLYPHS = ["♪", "♫", "♬"];
const NOTE_COLORS = ["#c6ff3d", "#8b5cf6", "#3dd6ff", "#ff6ec7", "#ff8a3d", "#f5f5f2"];

// Deterministic pseudo-random scatter so the field looks dense but never shifts between renders
function seededRandom(seed) {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

const AUTH_NOTES = Array.from({ length: 260 }, (_, i) => {
  const top = seededRandom(i * 7.13) * 97;
  const left = seededRandom(i * 3.71 + 1) * 97;
  const size = 10 + seededRandom(i * 5.29 + 2) * 20;
  const opacity = 0.12 + seededRandom(i * 2.17 + 3) * 0.26;
  const delay = seededRandom(i * 9.41 + 4) * 6;
  const glyph = NOTE_GLYPHS[i % NOTE_GLYPHS.length];
  const color = NOTE_COLORS[Math.floor(seededRandom(i * 6.02 + 5) * NOTE_COLORS.length)];
  return { top, left, size, opacity, delay, glyph, color };
});

function AuthScene() {
  return (
    <div className="auth-scene" aria-hidden="true">
      <div className="auth-glow auth-glow-purple" />
      <div className="auth-glow auth-glow-blue" />
      <div className="auth-glow auth-glow-lime" />

      {AUTH_NOTES.map((n, i) => (
        <span
          key={i}
          className="auth-note"
          style={{
            top: `${n.top}%`,
            left: `${n.left}%`,
            fontSize: `${n.size}px`,
            opacity: n.opacity,
            color: n.color,
            animationDelay: `${n.delay}s`,
          }}
        >
          {n.glyph}
        </span>
      ))}
    </div>
  );
}

function AuthPage() {
  const [mode, setMode] = useState("login"); // "login" | "signup" | "forgot"
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");

  const [isRecovery, setIsRecovery] = useState(false);
  const [newPassword, setNewPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  const pageRef = useRef(null);
  const cardRef = useRef(null);
  const reduceMotionRef = useRef(false);
  const [tilt, setTilt] = useState({ rx: 0, ry: 0 });

  useEffect(() => {
    if (window.location.hash.includes("type=recovery")) {
      setIsRecovery(true);
    }
    reduceMotionRef.current = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
  }, []);

  function handlePageMove(e) {
    const page = pageRef.current;
    if (!page || reduceMotionRef.current) return;

    const px = (e.clientX / window.innerWidth - 0.5) * 2;
    const py = (e.clientY / window.innerHeight - 0.5) * 2;

    page.style.setProperty("--px", px.toFixed(3));
    page.style.setProperty("--py", py.toFixed(3));
  }

  function handleCardMove(e) {
    const card = cardRef.current;
    if (!card) return;

    const rect = card.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;

    card.style.setProperty("--mx", `${px * 100}%`);
    card.style.setProperty("--my", `${py * 100}%`);

    if (reduceMotionRef.current) return;
    setTilt({
      rx: (0.5 - py) * 7,
      ry: (px - 0.5) * 7,
    });
  }

  function handleCardLeave() {
    setTilt({ rx: 0, ry: 0 });
  }

  const cardStyle = {
    transform: `rotateX(${tilt.rx}deg) rotateY(${tilt.ry}deg)`,
  };

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    if (mode === "signup") {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
      });

      if (signUpError) {
        setError(signUpError.message);
        setLoading(false);
        return;
      }

      if (data.user) {
        const { error: profileError } = await supabase
          .from("profiles")
          .insert({ id: data.user.id, username });

        if (profileError) {
          setError(profileError.message);
          setLoading(false);
          return;
        }
      }
    } else {
      const { error: signInError } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (signInError) {
        setError(signInError.message);
        setLoading(false);
        return;
      }
    }

    setLoading(false);
  }

  async function handleForgotPassword(e) {
    e.preventDefault();
    setError("");
    setMessage("");
    setLoading(true);

    const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: window.location.origin,
    });

    setLoading(false);

    if (resetError) {
      setError(resetError.message);
    } else {
      setMessage("Check your email for a password reset link.");
    }
  }

  async function handleUpdatePassword(e) {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword,
    });

    setLoading(false);

    if (updateError) {
      setError(updateError.message);
    } else {
      setMessage("Password updated! You can now log in.");
      setIsRecovery(false);
      setMode("login");
      window.location.hash = "";
    }
  }

  if (isRecovery) {
    return (
      <div className="auth-page" ref={pageRef} onMouseMove={handlePageMove}>
        <AuthScene />
        <div
          className="auth-card"
          ref={cardRef}
          style={cardStyle}
          onMouseMove={handleCardMove}
          onMouseLeave={handleCardLeave}
        >
          <div className="auth-logo">
            <img src={vibrLogoDark} alt="VIBR" className="auth-logo-mark auth-logo-mark-dark" style={{ height: 40, width: "auto" }} />
            <img src={vibrLogoLight} alt="VIBR" className="auth-logo-mark auth-logo-mark-light" style={{ height: 40, width: "auto" }} />
          </div>

          <h2 className="auth-heading">Set a new password</h2>

          <form onSubmit={handleUpdatePassword} className="auth-form">
            <div className="auth-password-field">
              <input
                type={showNewPassword ? "text" : "password"}
                placeholder="New password"
                aria-label="New password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                required
                minLength={6}
              />
              <button
                type="button"
                className="auth-password-toggle"
                onClick={() => setShowNewPassword((v) => !v)}
                aria-label={showNewPassword ? "Hide password" : "Show password"}
                tabIndex={-1}
              >
                <EyeIcon open={showNewPassword} />
              </button>
            </div>

            {error && <p className="auth-error">{error}</p>}
            {message && <p className="auth-success">{message}</p>}

            <button type="submit" className="auth-submit" disabled={loading}>
              {loading ? "Please wait..." : "Update Password"}
            </button>
          </form>
        </div>
      </div>
    );
  }

  if (mode === "forgot") {
    return (
      <div className="auth-page" ref={pageRef} onMouseMove={handlePageMove}>
        <AuthScene />
        <div
          className="auth-card"
          ref={cardRef}
          style={cardStyle}
          onMouseMove={handleCardMove}
          onMouseLeave={handleCardLeave}
        >
          <div className="auth-logo">
            <img src={vibrLogoDark} alt="VIBR" className="auth-logo-mark auth-logo-mark-dark" style={{ height: 40, width: "auto" }} />
            <img src={vibrLogoLight} alt="VIBR" className="auth-logo-mark auth-logo-mark-light" style={{ height: 40, width: "auto" }} />
          </div>

          <h2 className="auth-heading">Reset your password</h2>

          <form onSubmit={handleForgotPassword} className="auth-form">
            <input
              type="email"
              placeholder="Email"
              aria-label="Email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />

            {error && <p className="auth-error">{error}</p>}
            {message && <p className="auth-success">{message}</p>}

            <button type="submit" className="auth-submit" disabled={loading}>
              {loading ? "Sending..." : "Send Reset Link"}
            </button>

            <button
              type="button"
              className="auth-back-link"
              onClick={() => {
                setMode("login");
                setError("");
                setMessage("");
              }}
            >
              ← Back to Log In
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-page" ref={pageRef} onMouseMove={handlePageMove}>
      <AuthScene />

      <div
        className="auth-card"
        ref={cardRef}
        style={cardStyle}
        onMouseMove={handleCardMove}
        onMouseLeave={handleCardLeave}
      >
        <div className="auth-logo">
          <img src={vibrLogoDark} alt="VIBR" className="auth-logo-mark auth-logo-mark-dark" style={{ height: 40, width: "auto" }} />
          <img src={vibrLogoLight} alt="VIBR" className="auth-logo-mark auth-logo-mark-light" style={{ height: 40, width: "auto" }} />
        </div>

        <p className="auth-slogan">for the vibr's, by the vibr's, to the vibr's</p>

        <div className="auth-tabs">
          <button
            className={mode === "login" ? "auth-tab active" : "auth-tab"}
            onClick={() => setMode("login")}
          >
            Log In
          </button>
          <button
            className={mode === "signup" ? "auth-tab active" : "auth-tab"}
            onClick={() => setMode("signup")}
          >
            Sign Up
          </button>
        </div>

        <form onSubmit={handleSubmit} className="auth-form">
          {mode === "signup" && (
            <input
              type="text"
              placeholder="Username"
              aria-label="Username"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
            />
          )}

          <input
            type="email"
            placeholder="Email"
            aria-label="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <div className="auth-password-field">
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              aria-label="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              minLength={6}
            />
            <button
              type="button"
              className="auth-password-toggle"
              onClick={() => setShowPassword((v) => !v)}
              aria-label={showPassword ? "Hide password" : "Show password"}
              tabIndex={-1}
            >
              <EyeIcon open={showPassword} />
            </button>
          </div>

          {error && <p className="auth-error">{error}</p>}

          <button type="submit" className="auth-submit" disabled={loading}>
            {loading
              ? "Please wait..."
              : mode === "signup"
              ? "Create Account"
              : "Log In"}
          </button>

          {mode === "login" && (
            <button
              type="button"
              className="auth-forgot-link"
              onClick={() => {
                setMode("forgot");
                setError("");
                setMessage("");
              }}
            >
              Forgot password?
            </button>
          )}
        </form>
      </div>
    </div>
  );
}

export default AuthPage;