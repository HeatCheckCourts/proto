import { T } from "../theme/tokens";
import HeatMeter from "../components/HeatMeter";

/* ============================================================================
   SCREEN 2 — LIVE COURT MAP / DASHBOARD
   List of 5 courts with heat meter + distance. Tap a card → detail view.
   ========================================================================= */
export default function MapScreen({ courts, checkedInCourtId, onOpenCourt }) {
  // Sort nearest first — what a player actually wants on opening the app.
  const sorted = [...courts].sort((a, b) => a.distanceKm - b.distanceKm);
  const liveGames = courts.reduce((n, c) => n + c.runs.length, 0);
  const livePlayers = courts.reduce((n, c) => n + c.players, 0);

  return (
    <div style={{ padding: "26px 18px 110px" }}>
      {/* Header strip */}
      <div style={{ display: "flex", alignItems: "baseline", justifyContent: "space-between", marginBottom: 4 }}>
        <h2 style={{ fontFamily: T.display, fontSize: 30, margin: 0, color: T.ink, textTransform: "uppercase" }}>
          Live Courts
        </h2>
        <span style={{ fontFamily: T.stat, fontSize: 12, letterSpacing: "0.1em", color: T.orange }}>
          ● LONDON
        </span>
      </div>
      <div style={{ fontFamily: T.stat, fontSize: 13, letterSpacing: "0.08em", color: T.inkDim, marginBottom: 20 }}>
        {livePlayers} PLAYERS ON COURT · {liveGames} ACTIVE RUNS
      </div>

      {/* Court cards */}
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {sorted.map((court) => {
          const isHere = court.id === checkedInCourtId;
          return (
            <button
              key={court.id}
              onClick={() => onOpenCourt(court.id)}
              style={{
                textAlign: "left", background: T.surface, borderRadius: 10,
                border: `1px solid ${isHere ? T.orange : T.line}`,
                padding: 16, cursor: "pointer", color: T.ink,
                transition: "border-color 200ms ease",
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                <div>
                  <div style={{ fontFamily: T.display, fontSize: 19, textTransform: "uppercase", letterSpacing: "0.02em" }}>
                    {court.name}
                    {isHere && (
                      <span style={{
                        fontFamily: T.stat, fontSize: 10, letterSpacing: "0.14em",
                        color: "#120700", background: T.orange, borderRadius: 3,
                        padding: "2px 6px", marginLeft: 8, verticalAlign: "middle",
                      }}>
                        YOU'RE HERE
                      </span>
                    )}
                  </div>
                  <div style={{ fontFamily: T.body, fontSize: 13, color: T.inkDim, marginTop: 3 }}>
                    {court.area}
                  </div>
                </div>
                <div style={{ textAlign: "right", flexShrink: 0, marginLeft: 10 }}>
                  <div style={{ fontFamily: T.display, fontSize: 17, color: T.ink }}>
                    {court.distanceKm.toFixed(1)}<span style={{ fontSize: 12, color: T.inkDim }}> km</span>
                  </div>
                  {court.runs.length > 0 && (
                    <div style={{ fontFamily: T.stat, fontSize: 11, letterSpacing: "0.1em", color: T.orange }}>
                      {court.runs.length} RUN{court.runs.length > 1 ? "S" : ""}
                    </div>
                  )}
                </div>
              </div>
              <HeatMeter players={court.players} capacity={court.capacity} compact />
            </button>
          );
        })}
      </div>
    </div>
  );
}
