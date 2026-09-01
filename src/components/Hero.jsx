import { useRef, useState } from "react";
import { motion } from "motion/react";
import { Link } from "react-router-dom";

function Hero() {
  const stageRef = useRef(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });

  function handleMouseMove(e) {
    const rect = e.currentTarget.getBoundingClientRect();
    const px = (e.clientX - rect.left) / rect.width;
    const py = (e.clientY - rect.top) / rect.height;
    setTilt({
      x: (0.5 - py) * 12,
      y: (px - 0.5) * 16,
    });
  }

  function handleMouseLeave() {
    setTilt({ x: 0, y: 0 });
  }

  return (
    <section
      className="vibr-hero"
      onMouseMove={handleMouseMove}
      onMouseLeave={handleMouseLeave}
    >
      {/* Ambient lighting */}
      <div
        className="hero-glow hero-glow-purple"
        style={{ transform: `translate(${tilt.y * -1.5}px, ${tilt.x * -1.5}px)` }}
      />
      <div
        className="hero-glow hero-glow-blue"
        style={{ transform: `translate(${tilt.y * 1.5}px, ${tilt.x * -1.5}px)` }}
      />
      <div
        className="hero-glow hero-glow-lime"
        style={{ transform: `translate(${tilt.y * -1}px, ${tilt.x * 1}px)` }}
      />

      {/* Floating particles */}
      <div className="music-particle particle-1">♪</div>
      <div className="music-particle particle-2">♫</div>
      <div className="music-particle particle-3">✦</div>
      <div className="music-particle particle-4">♪</div>

      {/* Main hero */}
      <div className="hero-content">
        <motion.div
          className="hero-badge liquid-glass"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7 }}
        >
          ✦ YOUR SOUND. YOUR PEOPLE.
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 35 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 1,
            ease: [0.16, 1, 0.3, 1],
          }}
        >
          Feel the
          <span>Vibration.</span>
        </motion.h1>

        <motion.p
          initial={{ opacity: 0, y: 25 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
        >
          Discover new music, share your verdicts,
          <br />
          and connect with people who just get your taste.
        </motion.p>

        <Link to="/explore" style={{ textDecoration: "none" }}>
          <motion.button
            className="hero-explore"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.4 }}
            whileHover={{
              scale: 1.05,
              boxShadow: "0 0 45px rgba(198,255,61,0.45)",
            }}
            whileTap={{ scale: 0.97 }}
          >
            Explore Now
            <span>→</span>
          </motion.button>
        </Link>
      </div>

      {/* 3D headphone stage */}
      <div
        ref={stageRef}
        className="headphone-stage"
        style={{
          transform: `rotateX(${tilt.x}deg) rotateY(${tilt.y}deg)`,
        }}
      >
        <motion.div
          className="headphone-orbit orbit-purple"
          animate={{ rotate: 360 }}
          transition={{
            duration: 18,
            repeat: Infinity,
            ease: "linear",
          }}
        />

        <motion.div
          className="headphone-orbit orbit-lime"
          animate={{ rotate: -360 }}
          transition={{
            duration: 13,
            repeat: Infinity,
            ease: "linear",
          }}
        />

        <motion.div
          className="headphone"
          animate={{
            y: [0, -18, 0],
            rotate: [0, 2, 0, -2, 0],
          }}
          transition={{
            duration: 5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <div className="headphone-band" />

          <div className="earcup earcup-left">
            <div className="earcup-inner">〽</div>
          </div>

          <div className="earcup earcup-right">
            <div className="earcup-inner">〽</div>
          </div>
        </motion.div>

        {/* Floating album card */}
        <motion.div
          className="floating-album album-left liquid-glass"
          animate={{
            y: [0, -12, 0],
            rotate: [-6, -3, -6],
          }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <div className="album-art album-purple">🌃</div>
          <strong>After Hours</strong>
          <small>The Weeknd</small>
          <span className="album-verdict">🔥 GOD LEVEL</span>
        </motion.div>

        <motion.div
          className="floating-album album-right liquid-glass"
          animate={{
            y: [0, 14, 0],
            rotate: [5, 2, 5],
          }}
          transition={{
            duration: 4.5,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        >
          <div className="album-art album-blue">🌊</div>
          <strong>Snooze</strong>
          <small>SZA</small>
          <span className="album-verdict purple">💜 PERFECT</span>
        </motion.div>
      </div>

      <div className="hero-tagline">
        Good music.
        <br />
        <strong>Better people.</strong>
      </div>
    </section>
  );
}

export default Hero;