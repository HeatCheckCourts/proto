import { T } from "../theme/tokens";

/** Selectable chip used in the Host a Run form (skill + format pickers). */
export default function Chip({ label, selected, onClick }) {
  return (
    <button onClick={onClick} style={{
      fontFamily: T.stat, fontWeight: 600, fontSize: 13, letterSpacing: "0.08em",
      textTransform: "uppercase", padding: "9px 14px", borderRadius: 999,
      cursor: "pointer", transition: "all 150ms ease",
      background: selected ? T.orange : T.surfaceHi,
      color: selected ? "#120700" : T.inkDim,
      border: `1px solid ${selected ? T.orange : T.line}`,
    }}>
      {label}
    </button>
  );
}
