import { T } from "../theme/tokens";

/** Web fonts + keyframes + minimal global polish. */
export default function GlobalStyles() {
  return (
    <style>{`
      @import url('https://fonts.googleapis.com/css2?family=Anton&family=Barlow:wght@400;500;600&family=Barlow+Condensed:wght@500;600&display=swap');
      @keyframes hcPulse {
        0% { transform: scale(1); opacity: 0.8; }
        100% { transform: scale(2.6); opacity: 0; }
      }
      * { box-sizing: border-box; }
      button:focus-visible, input:focus-visible, select:focus-visible {
        outline: 2px solid ${T.orange}; outline-offset: 2px;
      }
      input::placeholder { color: ${T.inkFaint}; }
      @media (prefers-reduced-motion: reduce) {
        * { animation: none !important; transition: none !important; }
      }
    `}</style>
  );
}
