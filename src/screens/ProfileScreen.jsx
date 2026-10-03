import { T } from "../theme/tokens";
import Eyebrow from "../components/Eyebrow";

/* ============================================================================
   SCREEN 5 — PROFILE (lightweight, completes the bottom nav)
   ========================================================================= */
export default function ProfileScreen({ courts, checkedInCourtId, hostedCount, onOpenCourt }) {
  const here = courts.find((c) => c.id === checkedInCourtId);
  const stat = (n, label) => (
    <div style={{ flex: 1, background: T.surface, border: `1px solid ${T.line}`, borderRadius: 10, padding: 16, textAlign: "center" }}>
      <div style={{ fontFamily: T.display, fontSize: 28, color: T.orange }}>{n}</div>
      <div style={{ fontFamily: T.stat, fontSize: 11, letterSpacing: "0.14em", color: T.inkDim }}>{label}</div>
    </div>
  );

  return (
    <div style={{ padding: "26px 18px 110px" }}>
      <h2 style={{ fontFamily: T.display, fontSize: 30, margin: "0 0 22px", color: T.ink, textTransform: "uppercase" }}>
        Your Game
      </h2>

      <div style={{ display: "flex", gap: 10, marginBottom: 22 }}>
        {stat(here ? 1 : 0, "CHECKED IN")}
        {stat(hostedCount, "RUNS HOSTED")}
        {stat(courts.length, "COURTS NEAR YOU")}
      </div>

      <Eyebrow>Current status</Eyebrow>
      {here ? (
        <button onClick={() => onOpenCourt(here.id)} style={{
          width: "100%", textAlign: "left", background: T.surface,
          border: `1px solid ${T.orange}`, borderRadius: 10, padding: 16, cursor: "pointer",
        }}>
          <div style={{ fontFamily: T.stat, fontSize: 11, letterSpacing: "0.16em", color: T.orange, marginBottom: 6 }}>
            ● ON COURT NOW
          </div>
          <div style={{ fontFamily: T.display, fontSize: 20, color: T.ink, textTransform: "uppercase" }}>
            {here.name}
          </div>
          <div style={{ fontFamily: T.body, fontSize: 13, color: T.inkDim, marginTop: 3 }}>
            Tap to view court →
          </div>
        </button>
      ) : (
        <div style={{
          border: `1px dashed ${T.line}`, borderRadius: 10, padding: "22px 16px",
          textAlign: "center", fontFamily: T.body, fontSize: 14, color: T.inkDim,
        }}>
          You're not checked in anywhere. Hit the map and find a run.
        </div>
      )}
    </div>
  );
}
