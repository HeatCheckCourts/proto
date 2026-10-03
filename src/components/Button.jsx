import { T } from "../theme/tokens";

/** Primary CTA button. `tone` switches between orange (act) and outline (undo). */
export default function Button({ children, onClick, tone = "primary", disabled = false, style: extra }) {
  const base = {
    fontFamily: T.display, fontSize: 16, letterSpacing: "0.06em",
    textTransform: "uppercase", border: "none", cursor: disabled ? "not-allowed" : "pointer",
    padding: "14px 20px", borderRadius: 6, width: "100%",
    transition: "transform 80ms ease, background 200ms ease, opacity 200ms",
    opacity: disabled ? 0.45 : 1,
  };
  const tones = {
    primary: { background: T.orange, color: "#120700" },
    ghost: { background: "transparent", color: T.ink, border: `1px solid ${T.line}` },
    danger: { background: "transparent", color: T.heatFull, border: `1px solid ${T.heatFull}` },
  };
  return (
    <button
      onClick={disabled ? undefined : onClick}
      onMouseDown={(e) => !disabled && (e.currentTarget.style.transform = "scale(0.98)")}
      onMouseUp={(e) => (e.currentTarget.style.transform = "scale(1)")}
      onMouseLeave={(e) => (e.currentTarget.style.transform = "scale(1)")}
      style={{ ...base, ...tones[tone], ...extra }}
    >
      {children}
    </button>
  );
}
