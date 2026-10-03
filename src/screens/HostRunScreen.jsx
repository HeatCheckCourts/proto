import { useState } from "react";
import { T } from "../theme/tokens";
import { formatTime } from "../lib/time";
import Button from "../components/Button";
import Chip from "../components/Chip";
import StepBtn from "../components/StepBtn";

/* ============================================================================
   SCREEN 4 — HOST A RUN FORM
   Inputs: court, time, skill level, format, spots. Submit → run is appended
   to the chosen court's run list and we navigate to that court's detail view.
   ========================================================================= */
export default function HostRunScreen({ courts, defaultCourtId, onSubmit, onCancel }) {
  const [courtId, setCourtId] = useState(defaultCourtId || courts[0].id);
  const [day, setDay] = useState("Today");
  const [time, setTime] = useState("18:30");
  const [skill, setSkill] = useState("All levels");
  const [format, setFormat] = useState("5v5");
  const [spots, setSpots] = useState(4);
  const [error, setError] = useState("");

  const SKILLS = ["Beginner friendly", "All levels", "Intermediate", "Advanced"];
  const FORMATS = ["3v3", "5v5", "21 / King of Court"];
  const DAYS = ["Today", "Tomorrow", "Sat", "Sun"];

  const fieldLabel = {
    fontFamily: T.stat, fontWeight: 600, fontSize: 12, letterSpacing: "0.16em",
    color: T.inkDim, textTransform: "uppercase", display: "block", marginBottom: 8,
  };
  const fieldBox = { marginBottom: 22 };
  const selectStyle = {
    width: "100%", background: T.surface, border: `1px solid ${T.line}`,
    borderRadius: 6, padding: "13px 14px", color: T.ink,
    fontFamily: T.body, fontSize: 15, outline: "none", appearance: "none",
  };

  const handleSubmit = () => {
    // Validate all fields are set (chips always are; guard time + spots).
    if (!time) return setError("Pick a start time for the run.");
    if (spots < 1) return setError("A run needs at least 1 open spot.");
    setError("");
    onSubmit({
      courtId,
      run: {
        id: `run-${Date.now()}`, // unique id for React keys
        time: `${day} · ${formatTime(time)}`,
        skill,
        format,
        spotsLeft: spots,
        host: "You",
      },
    });
  };

  return (
    <div style={{ padding: "26px 18px 110px" }}>
      <h2 style={{ fontFamily: T.display, fontSize: 30, margin: "0 0 4px", color: T.ink, textTransform: "uppercase" }}>
        Host a Run
      </h2>
      <p style={{ fontFamily: T.body, fontSize: 14, color: T.inkDim, margin: "0 0 26px" }}>
        Call the game. Players nearby get notified the second you post.
      </p>

      {/* Court picker */}
      <div style={fieldBox}>
        <label style={fieldLabel}>Court</label>
        <div style={{ position: "relative" }}>
          <select value={courtId} onChange={(e) => setCourtId(e.target.value)} style={selectStyle}>
            {courts.map((c) => (
              <option key={c.id} value={c.id}>{c.name} — {c.area}</option>
            ))}
          </select>
          <span style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", color: T.inkDim, pointerEvents: "none" }}>▾</span>
        </div>
      </div>

      {/* Day + time */}
      <div style={fieldBox}>
        <label style={fieldLabel}>When</label>
        <div style={{ display: "flex", gap: 8, marginBottom: 10, flexWrap: "wrap" }}>
          {DAYS.map((d) => <Chip key={d} label={d} selected={day === d} onClick={() => setDay(d)} />)}
        </div>
        <input
          type="time"
          value={time}
          onChange={(e) => setTime(e.target.value)}
          style={{ ...selectStyle, colorScheme: "dark" }}
        />
      </div>

      {/* Skill level */}
      <div style={fieldBox}>
        <label style={fieldLabel}>Skill level</label>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {SKILLS.map((s) => <Chip key={s} label={s} selected={skill === s} onClick={() => setSkill(s)} />)}
        </div>
      </div>

      {/* Format */}
      <div style={fieldBox}>
        <label style={fieldLabel}>Format</label>
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          {FORMATS.map((f) => <Chip key={f} label={f} selected={format === f} onClick={() => setFormat(f)} />)}
        </div>
      </div>

      {/* Spots remaining — stepper */}
      <div style={fieldBox}>
        <label style={fieldLabel}>Open spots</label>
        <div style={{
          display: "flex", alignItems: "center", justifyContent: "space-between",
          background: T.surface, border: `1px solid ${T.line}`, borderRadius: 6, padding: "8px 10px",
        }}>
          <StepBtn label="−" onClick={() => setSpots((s) => Math.max(1, s - 1))} />
          <span style={{ fontFamily: T.display, fontSize: 26, color: T.ink }}>{spots}</span>
          <StepBtn label="+" onClick={() => setSpots((s) => Math.min(20, s + 1))} />
        </div>
      </div>

      {error && (
        <div style={{ fontFamily: T.body, fontSize: 13, color: T.heatFull, marginBottom: 12 }}>{error}</div>
      )}

      <Button onClick={handleSubmit}>Post this run</Button>
      <Button tone="ghost" onClick={onCancel} style={{ marginTop: 10 }}>Cancel</Button>
    </div>
  );
}
