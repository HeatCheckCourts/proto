import { T } from "../theme/tokens";

/** Uppercase section label — the structural "eyebrow" used across screens. */
export default function Eyebrow({ children }) {
  return (
    <div style={{
      fontFamily: T.stat, fontWeight: 600, fontSize: 11, letterSpacing: "0.22em",
      color: T.inkDim, textTransform: "uppercase",
      display: "flex", alignItems: "center", gap: 10, margin: "0 0 10px",
    }}>
      <span style={{ width: 14, height: 2, background: T.orange, display: "inline-block" }} />
      {children}
    </div>
  );
}
