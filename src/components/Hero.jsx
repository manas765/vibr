import { motion, useReducedMotion } from "motion/react";
import { Link } from "react-router-dom";
import vibrLogoDark from "../assets/vibr-logo-dark-theme.png";
import vibrLogoLight from "../assets/vibr-logo-light-theme.png";

function Hero() {
  const reduceMotion = useReducedMotion();

  const fadeUp = (delay = 0) =>
    reduceMotion
      ? {}
      : {
          initial: { opacity: 0, y: 18 },
          animate: { opacity: 1, y: 0 },
          transition: { duration: 0.8, delay, ease: [0.22, 1, 0.36, 1] },
        };

  return (
    <section className="hero2" aria-labelledby="hero-title">
      <motion.div {...fadeUp(0)}>
        <img src={vibrLogoDark} alt="" className="hero-logo-mark hero-logo-mark-dark" />
        <img src={vibrLogoLight} alt="" className="hero-logo-mark hero-logo-mark-light" />
      </motion.div>

      <motion.p className="hero2__eyebrow" {...fadeUp(0.05)}>
        Your sound. Your people.
      </motion.p>

      <motion.h2 id="hero-title" className="hero2__title" {...fadeUp(0.1)}>
        Music is better
        <br />
        when it&rsquo;s shared.
      </motion.h2>

      <motion.p className="hero2__sub" {...fadeUp(0.2)}>
        Discover new music, share your verdicts, and connect with people who just get your taste.
      </motion.p>

      <motion.div className="hero2__actions" {...fadeUp(0.3)}>
        <Link to="/explore" className="hero2__btn hero2__btn--primary">
          Explore now
        </Link>
        <Link to="/?page=feed" className="hero2__btn hero2__btn--secondary">
          Open your feed
        </Link>
      </motion.div>

      <p className="hero2__slogan">for the vibr&rsquo;s, by the vibr&rsquo;s, to the vibr&rsquo;s</p>
    </section>
  );
}

export default Hero;