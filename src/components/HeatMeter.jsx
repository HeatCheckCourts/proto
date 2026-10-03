import { T } from "../theme/tokens";
import { deriveHeat } from "../lib/heat";
import LiveDot from "./LiveDot";

/**
 * SIGNATURE ELEMENT — the Heat Meter.
 * Three court-paint segments (EMPTY / BUSY / FULL); segments at or below the
 * current level light up in the heat color, the rest stay as faded asphalt.
 */
export default function HeatMeter({ players, capacity, compact = false }) {
  const heat = deriveHeat(players, capacity);
  return (
    <div>
      <div style={{ display: "flex", gap: 3 }}>
        {[0, 1, 2].map((seg) => (
          <span key={seg} style={{
            height: compact ? 5 : 7,
            flex: 1,
            borderRadius: 2,
            background: seg <= heat.level ? heat.color : "#222228",
            transition: "background 300ms ease",
          }} />
        ))}
      </div>
      <div style={{
        display: "flex", justifyContent: "space-between", alignItems: "center",
        marginTop: compact ? 4 : 6,
      }}>
        <span style={{
          display: "inline-flex", alignItems: "center", gap: 6,
          fontFamily: T.stat, fontWeight: 600, letterSpacing: "0.14em",
          fontSize: compact ? 11 : 12, color: heat.color,
        }}>
          <LiveDot color={heat.color} /> {heat.label}
        </span>
        <span style={{ fontFamily: T.stat, fontSize: compact ? 11 : 12, color: T.inkDim, letterSpacing: "0.06em" }}>
          {players}/{capacity} ON COURT
        </span>
      </div>
    </div>
  );
}
