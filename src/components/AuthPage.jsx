import { useState, useEffect, useRef } from "react";
import { supabase } from "../supabaseClient";
import "./AuthPage.css";

function AuthBackdrop() {
  return (
    <div className="auth-backdrop" aria-hidden="true">
      <div className="auth-ring auth-ring-1" />
      <div className="auth-ring auth-ring-2" />
      <div className="auth-ring auth-ring-3" />
      <div className="auth-eq">
        {Array.from({ length: 28 }).map((_, i) => (
          <span key={i} style={{ "--i": i }} />
        ))}
      </div>
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
      rx: (0.5 - py) * 8,
      ry: (px - 0.5) * 8,
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
      <div className="auth-page">
        <AuthBackdrop />
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
      <div className="auth-page">
        <AuthBackdrop />
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
    <div className="auth-page">
      <AuthBackdrop />
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