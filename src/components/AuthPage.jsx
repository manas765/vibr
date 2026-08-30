import { useState, useEffect, useRef } from "react";
import { supabase } from "../supabaseClient";
import "./AuthPage.css";

const CHIP_LAYOUT = [
  { top: "9%", left: "5%", rotate: -9, depth: 12 },
  { top: "15%", right: "7%", rotate: 7, depth: 18 },
  { top: "58%", left: "4%", rotate: 6, depth: 22 },
  { top: "63%", right: "5%", rotate: -7, depth: 16 },
  { top: "82%", left: "22%", rotate: 4, depth: 26, hideOnMobile: true },
  { top: "80%", right: "20%", rotate: -5, depth: 20, hideOnMobile: true },
];

function AuthScene({ tracks }) {
  return (
    <div className="auth-scene" aria-hidden="true">
      <div className="auth-glow auth-glow-purple" />
      <div className="auth-glow auth-glow-blue" />
      <div className="auth-glow auth-glow-lime" />

      <span className="auth-note auth-note-1">♪</span>
      <span className="auth-note auth-note-2">♫</span>
      <span className="auth-note auth-note-3">♪</span>

      {tracks.slice(0, CHIP_LAYOUT.length).map((track, i) => {
        const layout = CHIP_LAYOUT[i];
        return (
          <div
            key={track.id}
            className={
              "auth-chip" + (layout.hideOnMobile ? " auth-chip-hide-sm" : "")
            }
            style={{
              top: layout.top,
              left: layout.left,
              right: layout.right,
              transform: `rotate(${layout.rotate}deg) translate(calc(var(--px, 0) * ${layout.depth}px), calc(var(--py, 0) * ${layout.depth}px))`,
            }}
          >
            <img
              src={track.thumbnail}
              alt=""
              className="auth-chip-art"
              loading="lazy"
            />
            <div className="auth-chip-text">
              <strong>{track.title}</strong>
              <small>{track.artist}</small>
            </div>
          </div>
        );
      })}
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

  const [tracks, setTracks] = useState([]);

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

    fetch("/api/youtube-search?q=trending music")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data.tracks)) setTracks(data.tracks);
      })
      .catch(() => {
        // floating chips are decorative — fail silently, page still works
      });
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
        <AuthScene tracks={tracks} />
        <div
          className="auth-card"
          ref={cardRef}
          style={cardStyle}
          onMouseMove={handleCardMove}
          onMouseLeave={handleCardLeave}
        >
          <div className="auth-logo">
            VIBR<span>•</span>
          </div>

          <h2 className="auth-heading">Set a new password</h2>

          <form onSubmit={handleUpdatePassword} className="auth-form">
            <input
              type="password"
              placeholder="New password"
              aria-label="New password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              required
              minLength={6}
            />

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
        <AuthScene tracks={tracks} />
        <div
          className="auth-card"
          ref={cardRef}
          style={cardStyle}
          onMouseMove={handleCardMove}
          onMouseLeave={handleCardLeave}
        >
          <div className="auth-logo">
            VIBR<span>•</span>
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
      <AuthScene tracks={tracks} />
      <div
        className="auth-card"
        ref={cardRef}
        style={cardStyle}
        onMouseMove={handleCardMove}
        onMouseLeave={handleCardLeave}
      >
        <div className="auth-logo">
          VIBR<span>•</span>
        </div>

        <p className="auth-tagline">
          {mode === "signup" ? "Join your sound, your people." : "Feel the vibration again."}
        </p>

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

          <input
            type="password"
            placeholder="Password"
            aria-label="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            minLength={6}
          />

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