import { T } from "../theme/tokens";

/* ============================================================================
   HEAT LOGIC — busyness is derived, never stored, so it reacts to check-ins.
   ========================================================================= */
export function deriveHeat(players, capacity) {
  const ratio = players / capacity;
  if (players === 0) return { label: "EMPTY", color: T.heatEmpty, level: 0, hint: "Court is open" };
  if (ratio < 0.75) return { label: "BUSY", color: T.heatBusy, level: 1, hint: "Game on — space left" };
  return { label: "FULL", color: T.heatFull, level: 2, hint: "Rammed — expect a wait" };
}
