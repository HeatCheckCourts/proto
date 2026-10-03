import { T } from "../theme/tokens";

/** +/− stepper button for the spots control. */
export default function StepBtn({ label, onClick }) {
  return (
    <button onClick={onClick} style={{
      width: 44, height: 44, borderRadius: 6, border: `1px solid ${T.line}`,
      background: T.surfaceHi, color: T.ink, fontFamily: T.display, fontSize: 20, cursor: "pointer",
    }}>
      {label}
    </button>
  );
}
