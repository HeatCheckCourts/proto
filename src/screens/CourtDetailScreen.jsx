import { T } from "../theme/tokens";
import { deriveHeat } from "../lib/heat";
import Button from "../components/Button";
import Eyebrow from "../components/Eyebrow";
import HeatMeter from "../components/HeatMeter";
import { Icon } from "../components/Icon";

/* ============================================================================
   SCREEN 3 — COURT DETAIL VIEW
   Who's checked in, active runs, and the Check In / Leave toggle.
   ========================================================================= */
export default function CourtDetailScreen({ court, isCheckedIn, canCheckIn, onBack, onToggleCheckIn, onHostHere, toast }) {
  const heat = deriveHeat(court.players, court.capacity);

  return (
    <div style={{ padding: "20px 18px 110px" }}>
      {/* Back + breadcrumb */}
      <button onClick={onBack} style={{
        display: "inline-flex", alignItems: "center", gap: 6, background: "none",
        border: "none", color: T.inkDim, cursor: "pointer",
        fontFamily: T.stat, fontSize: 13, letterSpacing: "0.1em", padding: 0, marginBottom: 18,
      }}>
        {Icon.Back(T.inkDim)} ALL COURTS
      </button>

      {/* Court header */}
      <h2 style={{ fontFamily: T.display, fontSize: 34, lineHeight: 1, margin: "0 0 6px", color: T.ink, textTransform: "uppercase" }}>
        {court.name}
      </h2>
      <div style={{ fontFamily: T.body, fontSize: 14, color: T.inkDim, marginBottom: 18 }}>
        {court.area} · {court.distanceKm.toFixed(1)} km away · {court.surface}
      </div>

      {/* Live heat panel */}
      <div style={{ background: T.surface, border: `1px solid ${T.line}`, borderRadius: 10, padding: 16, marginBottom: 14 }}>
        <HeatMeter players={court.players} capacity={court.capacity} />
        <div style={{ fontFamily: T.body, fontSize: 13, color: T.inkDim, marginTop: 10 }}>
          {heat.hint}
        </div>
      </div>

      {/* CHECK IN TOGGLE — the core interaction */}
      <Button
        tone={isCheckedIn ? "danger" : "primary"}
        disabled={!isCheckedIn && !canCheckIn}
        onClick={onToggleCheckIn}
        style={{ marginBottom: 8 }}
      >
        {isCheckedIn ? "Checked in ✓ — Leave court" : "Check in to this court"}
      </Button>
      {!isCheckedIn && !canCheckIn && (
        <div style={{ fontFamily: T.stat, fontSize: 12, letterSpacing: "0.06em", color: T.inkDim, textAlign: "center", marginBottom: 8 }}>
          You're checked in elsewhere — leave that court first.
        </div>
      )}

      {/* Success / status toast */}
      {toast && (
        <div style={{
          fontFamily: T.stat, fontSize: 13, letterSpacing: "0.06em", color: T.heatEmpty,
          background: "rgba(74,222,128,0.08)", border: "1px solid rgba(74,222,128,0.3)",
          borderRadius: 6, padding: "10px 14px", marginBottom: 8, textAlign: "center",
        }}>
          {toast}
        </div>
      )}

      {/* Active runs */}
      <div style={{ marginTop: 22 }}>
        <Eyebrow>Active runs · {court.runs.length}</Eyebrow>
        {court.runs.length === 0 ? (
          <div style={{
            border: `1px dashed ${T.line}`, borderRadius: 10, padding: "22px 16px",
            textAlign: "center", fontFamily: T.body, fontSize: 14, color: T.inkDim,
          }}>
            No runs scheduled here yet. Be the first to call one.
          </div>
        ) : (
          <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
            {court.runs.map((run) => (
              <div key={run.id} style={{
                background: T.surface, border: `1px solid ${T.line}`, borderRadius: 10,
                padding: 14, display: "flex", justifyContent: "space-between", alignItems: "center",
              }}>
                <div>
                  <div style={{ fontFamily: T.display, fontSize: 16, color: T.ink, textTransform: "uppercase" }}>
                    {run.format} · {run.time}
                  </div>
                  <div style={{ fontFamily: T.body, fontSize: 13, color: T.inkDim, marginTop: 3 }}>
                    {run.skill} · hosted by {run.host}
                  </div>
                </div>
                <div style={{
                  fontFamily: T.stat, fontWeight: 600, fontSize: 12, letterSpacing: "0.08em",
                  color: run.spotsLeft > 0 ? T.orange : T.inkFaint,
                  border: `1px solid ${run.spotsLeft > 0 ? T.orangeDim : T.line}`,
                  borderRadius: 4, padding: "5px 9px", flexShrink: 0, marginLeft: 10, textAlign: "center",
                }}>
                  {run.spotsLeft > 0 ? `${run.spotsLeft} SPOTS` : "FULL"}
                </div>
              </div>
            ))}
          </div>
        )}
        <Button tone="ghost" onClick={onHostHere} style={{ marginTop: 12 }}>
          + Host a run here
        </Button>
      </div>

      {/* Checked-in players */}
      <div style={{ marginTop: 26 }}>
        <Eyebrow>On court now · {court.checkedIn.length}</Eyebrow>
        {court.checkedIn.length === 0 ? (
          <div style={{ fontFamily: T.body, fontSize: 14, color: T.inkDim }}>
            Nobody checked in. First one there gets winners.
          </div>
        ) : (
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
            {court.checkedIn.map((name, i) => (
              <span key={i} style={{
                fontFamily: T.stat, fontWeight: 500, fontSize: 13, letterSpacing: "0.04em",
                color: name === "You" ? "#120700" : T.ink,
                background: name === "You" ? T.orange : T.surfaceHi,
                border: `1px solid ${name === "You" ? T.orange : T.line}`,
                borderRadius: 999, padding: "6px 12px",
                display: "inline-flex", alignItems: "center", gap: 6,
              }}>
                {Icon.Ball(name === "You" ? "#120700" : T.inkDim, 13)} {name}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
