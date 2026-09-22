import { useRef, useState } from "react";
import { motion } from "motion/react";
import { Link } from "react-router-dom";
import vibrLogoDark from "../assets/vibr-logo-dark-theme.png";
import vibrLogoLight from "../assets/vibr-logo-light-theme.png";

const POSTER_LINES = [
  { text: "WE FOUND", size: "lg" },
  { text: "OUR PEOPLE", size: "md" },
  { text: "THROUGH THE", size: "sm" },
  { text: "SOUND.", size: "xl" },
  { text: "EVERY TRACK WE SHARE,", size: "sm" },
  { text: "EVERY VERDICT WE DROP,", size: "sm" },
  { text: "COMES FROM THE SAME PLACE —", size: "sm" },
  { text: "TASTE THAT WON'T STAY QUIET.", size: "md" },
];

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

      {/* Right-side visual — a static typographic poster, no 3D/spin/orbit motion */}
      <div ref={stageRef} className="hero-poster">
        <motion.div
          className="hero-poster__lines"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.9, delay: 0.2 }}
        >
          {POSTER_LINES.map((line, i) => (
            <span key={i} className={`hero-poster__line hero-poster__line--${line.size}`}>
              {line.text}
            </span>
          ))}

          <span className="hero-poster__vibr">VIBR</span>

          <p className="hero-poster__body">
            is the proof that what you listen to says who you are.
            <br />
            not everyone hears it the same way — and that's the whole point.
          </p>
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