import { useRef, useState, useEffect } from "react";
import { motion } from "motion/react";
import { Link } from "react-router-dom";
import vibrLogoDark from "../assets/vibr-logo-dark-theme.png";
import vibrLogoLight from "../assets/vibr-logo-light-theme.png";

const FALLBACK_ALBUMS = [
  { title: "After Hours", artist: "The Weeknd", emoji: "🌃", verdict: "🔥 GOD LEVEL", accent: "purple" },
  { title: "Snooze", artist: "SZA", emoji: "🌊", verdict: "💜 PERFECT", accent: "blue" },
];

function Hero() {
  const stageRef = useRef(null);
  const [tilt, setTilt] = useState({ x: 0, y: 0 });
  const [albums, setAlbums] = useState(FALLBACK_ALBUMS);

  useEffect(() => {
    fetch("/api/youtube-search?q=trending music")
      .then((r) => r.json())
      .then((data) => {
        const tracks = data.tracks || [];
        if (tracks.length >= 2) {
          setAlbums([
            {
              title: tracks[0].title,
              artist: tracks[0].artist,
              thumbnail: tracks[0].thumbnail,
              verdict: "🔥 GOD LEVEL",
              accent: "purple",
            },
            {
              title: tracks[1].title,
              artist: tracks[1].artist,
              thumbnail: tracks[1].thumbnail,
              verdict: "💜 PERFECT",
              accent: "blue",
            },
          ]);
        }
      })
      .catch(() => {
        // keep the fallback data — this is decorative, not worth surfacing an error for
      });
  }, []);

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
          <span className="hero-badge-text">✦ YOUR SOUND. YOUR PEOPLE.</span>
        </motion.div>

        <motion.div
          className="hero-logo"
          initial={{ opacity: 0, y: 35 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{
            duration: 1,
            ease: [0.16, 1, 0.3, 1],
          }}
        >
          <img src={vibrLogoDark} alt="VIBR" className="hero-logo-mark hero-logo-mark-dark" />
          <img src={vibrLogoLight} alt="VIBR" className="hero-logo-mark hero-logo-mark-light" />
          <p className="hero-logo-slogan">for the vibr's, by the vibr's, to the vibr's</p>
        </motion.div>

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

      {/* Right-side visual — the VIBR mark itself, not stock headphone art */}
      <div ref={stageRef} className="hero-visual">
        <motion.div
          className="hero-visual__mark"
          initial={{ opacity: 0, scale: 0.92 }}
          animate={{ opacity: 1, scale: 1, y: [0, -10, 0] }}
          transition={{
            opacity: { duration: 1, delay: 0.2 },
            scale: { duration: 1, delay: 0.2 },
            y: { duration: 7, repeat: Infinity, ease: "easeInOut", delay: 1 },
          }}
        >
          <img src={vibrLogoDark} alt="VIBR" className="hero-visual__logo hero-logo-mark-dark" />
          <img src={vibrLogoLight} alt="VIBR" className="hero-visual__logo hero-logo-mark-light" />
          <p className="hero-visual__slogan">for the vibr's, by the vibr's, to the vibr's</p>
        </motion.div>

        <motion.span
          className="hero-visual__note hero-visual__note--1"
          animate={{ y: [0, -14, 0], opacity: [0.4, 0.9, 0.4] }}
          transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
        >
          ♪
        </motion.span>
        <motion.span
          className="hero-visual__note hero-visual__note--2"
          animate={{ y: [0, 16, 0], opacity: [0.3, 0.8, 0.3] }}
          transition={{ duration: 5, repeat: Infinity, ease: "easeInOut", delay: 0.6 }}
        >
          ♫
        </motion.span>
        <motion.span
          className="hero-visual__note hero-visual__note--3"
          animate={{ y: [0, -10, 0], opacity: [0.35, 0.85, 0.35] }}
          transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut", delay: 1.2 }}
        >
          ♪
        </motion.span>

        {albums.slice(0, 2).map((album, i) => (
          <motion.div
            key={album.title}
            className={i === 0 ? "hero-visual__spin-art spin-art-left" : "hero-visual__spin-art spin-art-right"}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1, rotate: 360 }}
            transition={{
              opacity: { duration: 0.8, delay: 0.5 + i * 0.2 },
              rotate: { duration: 14 + i * 3, repeat: Infinity, ease: "linear" },
            }}
          >
            {album.thumbnail ? (
              <img src={album.thumbnail} alt={album.title} />
            ) : (
              <span>{album.emoji}</span>
            )}
            <span className="hero-visual__spin-art-hole" />
          </motion.div>
        ))}
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