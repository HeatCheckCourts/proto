import { useState } from "react";
import { T } from "../theme/tokens";
import Button from "../components/Button";

/* ============================================================================
   SCREEN 1 — LANDING / ONBOARDING
   Minimalist: wordmark, one-line pitch, email capture, court discovery CTA.
   ========================================================================= */
export default function LandingScreen({ onEnter }) {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleEmail = () => {
    // Lightweight validation — prototype only.
    if (/^\S+@\S+\.\S+$/.test(email)) setSubmitted(true);
  };

  return (
    <div style={{
      minHeight: "100%", display: "flex", flexDirection: "column",
      justifyContent: "flex-end", padding: "0 24px 48px", position: "relative",
    }}>
      {/* Background court-key arc — gritty court-paint motif */}
      <svg viewBox="0 0 450 450" style={{ position: "absolute", top: -60, right: -90, width: 380, opacity: 0.12 }}>
        <circle cx="225" cy="225" r="160" fill="none" stroke={T.orange} strokeWidth="3" />
        <circle cx="225" cy="225" r="60" fill="none" stroke={T.orange} strokeWidth="3" />
        <path d="M65 225h320M225 65v320" stroke={T.orange} strokeWidth="3" />
      </svg>

      <div style={{ position: "relative" }}>
        <div style={{
          fontFamily: T.stat, fontWeight: 600, letterSpacing: "0.3em", fontSize: 12,
          color: T.orange, marginBottom: 14,
        }}>
          LONDON · LIVE COURTS
        </div>

        {/* Wordmark */}
        <h1 style={{
          fontFamily: T.display, fontSize: 64, lineHeight: 0.95, margin: 0,
          color: T.ink, textTransform: "uppercase",
        }}>
          Heat<span style={{ color: T.orange }}>Check</span>
        </h1>

        <p style={{
          fontFamily: T.body, fontSize: 16, lineHeight: 1.5, color: T.inkDim,
          margin: "18px 0 30px", maxWidth: 330,
        }}>
          See which London courts are running right now. Check in, find a game,
          or host your own run.
        </p>

        {/* Email capture */}
        {submitted ? (
          <div style={{
            fontFamily: T.stat, fontSize: 14, letterSpacing: "0.08em", color: T.heatEmpty,
            border: `1px solid ${T.line}`, borderRadius: 6, padding: "13px 16px",
            marginBottom: 12, background: T.surface,
          }}>
            ✓ You're on the list — {email}
          </div>
        ) : (
          <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
            <input
              type="email"
              value={email}
              placeholder="you@email.com"
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleEmail()}
              style={{
                flex: 1, background: T.surface, border: `1px solid ${T.line}`,
                borderRadius: 6, padding: "13px 14px", color: T.ink,
                fontFamily: T.body, fontSize: 15, outline: "none",
              }}
            />
            <button onClick={handleEmail} style={{
              fontFamily: T.stat, fontWeight: 600, fontSize: 13, letterSpacing: "0.1em",
              background: T.surfaceHi, color: T.ink, border: `1px solid ${T.line}`,
              borderRadius: 6, padding: "0 16px", cursor: "pointer",
            }}>
              JOIN
            </button>
          </div>
        )}

        {/* Court discovery CTA */}
        <Button onClick={onEnter}>Find courts near me →</Button>

        <div style={{
          fontFamily: T.stat, fontSize: 11, letterSpacing: "0.14em",
          color: T.inkFaint, textAlign: "center", marginTop: 14,
        }}>
          5 COURTS LIVE · UPDATED IN REAL TIME
        </div>
      </div>
    </div>
  );
}
