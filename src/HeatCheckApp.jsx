/**
 * ============================================================================
 *  HEATCHECK — London Pickup Basketball Prototype
 * ============================================================================
 *  Single-file, high-fidelity interactive prototype.
 *
 *  PURPOSE
 *  -------
 *  Simulates the complete core user journey for HeatCheck:
 *    1. Landing / Onboarding  → email capture + "Find Courts" CTA
 *    2. Live Court Map list   → 5 London courts w/ live heat meters + distance
 *    3. Court Detail          → checked-in players, active runs, Check In toggle
 *    4. Host a Run form       → time / skill / format / spots → adds run live
 *
 *  STATE ARCHITECTURE (React useState — no external APIs)
 *  ------------------------------------------------------
 *  • `screen`           — simple view router: 'landing' | 'map' | 'detail' | 'host' | 'profile'
 *  • `courts`           — single source of truth. Player counts + runs live here,
 *                         so a check-in or a new run updates EVERY view instantly.
 *  • `checkedInCourtId` — the one court the user is currently checked in at (or null).
 *  • Busyness is DERIVED from live player count vs. capacity (deriveHeat),
 *    so checking in can genuinely push a court from EMPTY → BUSY → FULL.
 *
 *  DESIGN SYSTEM ("Asphalt")
 *  -------------------------
 *  • Asphalt Black  #0B0B0D / surfaces #16161A
 *  • Electric Orange #FF5A1F (the "heat")
 *  • Concrete Gray  #8E8E96 / hairlines #26262C
 *  • Display type: Anton (condensed athletic block caps)
 *  • Body type: Barlow / Barlow Condensed for stat readouts
 *  • Signature element: the segmented HEAT METER — a court-paint style gauge
 *    with a live pulse dot, used consistently on cards and detail headers.
 *  • Mobile-first, max-width 450px frame centered on desktop.
 *
 *  NOTE: This React build is the interactive spec. Every screen, token and
 *  state behaviour maps 1:1 to FlutterFlow constructs (Page States ↔ useState,
 *  App State `courts` list ↔ the courts array, Conditional Visibility ↔ the
 *  derived heat levels). A migration map is included in the accompanying notes.
 * ============================================================================
 */

import { useState } from "react";

/* ============================================================================
   DESIGN TOKENS
   ========================================================================= */
const T = {
  // Color
  bgPage: "#060607",        // outermost page (behind the phone frame)
  bgApp: "#0B0B0D",         // asphalt black — app canvas
  surface: "#16161A",       // raised cards
  surfaceHi: "#1E1E24",     // inputs / pressed states
  line: "#26262C",          // hairline borders
  ink: "#F4F2EC",           // chalk white — primary text
  inkDim: "#8E8E96",        // concrete gray — secondary text
  inkFaint: "#55555E",      // tertiary / placeholders
  orange: "#FF5A1F",        // electric orange — the heat
  orangeDim: "#7A2D10",
  // Heat states
  heatEmpty: "#4ADE80",     // green — court is open, go run
  heatBusy: "#FFB020",      // amber — game on
  heatFull: "#FF4040",      // red — rammed
  // Type
  display: "'Anton', 'Arial Narrow', sans-serif",
  body: "'Barlow', -apple-system, sans-serif",
  stat: "'Barlow Condensed', 'Arial Narrow', sans-serif",
};

/* ============================================================================
   MOCK DATA — 5 real London courts. No external APIs.
   `capacity` drives the derived heat level; `players` is the live count.
   ========================================================================= */
const INITIAL_COURTS = [
  {
    id: "clissold",
    name: "Clissold Park",
    area: "Stoke Newington · N16",
    distanceKm: 0.8,
    surface: "Tarmac · 2 full courts",
    players: 9,
    capacity: 12,
    checkedIn: ["Marcus T.", "Deyo", "Lil Rich", "Ana B.", "Kofi", "JJ", "Smiley", "Tariq", "Bea"],
    runs: [
      { id: "r1", time: "Today · 6:30 PM", skill: "Intermediate", format: "5v5", spotsLeft: 2, host: "Marcus T." },
      { id: "r2", time: "Sat · 10:00 AM", skill: "All levels", format: "3v3", spotsLeft: 4, host: "Ana B." },
    ],
  },
  {
    id: "londonfields",
    name: "London Fields",
    area: "Hackney · E8",
    distanceKm: 1.4,
    surface: "Painted concrete · 1 full court",
    players: 4,
    capacity: 10,
    checkedIn: ["Femi", "Oscar W.", "Dre", "Maya"],
    runs: [
      { id: "r3", time: "Today · 7:00 PM", skill: "Advanced", format: "5v5", spotsLeft: 1, host: "Femi" },
    ],
  },
  {
    id: "clapham",
    name: "Clapham Common",
    area: "Clapham · SW4",
    distanceKm: 6.2,
    surface: "Tarmac · 2 half courts",
    players: 0,
    capacity: 10,
    checkedIn: [],
    runs: [],
  },
  {
    id: "haggerston",
    name: "Haggerston Park",
    area: "Hackney · E2",
    distanceKm: 2.1,
    surface: "Rubberised · 1 full court",
    players: 10,
    capacity: 10,
    checkedIn: ["Big Sam", "Nia", "Carlos", "Teo", "Ravi", "Jords", "Elle", "Moses", "Kwame", "Pat"],
    runs: [
      { id: "r4", time: "Today · 8:00 PM", skill: "Intermediate", format: "21 / King of Court", spotsLeft: 0, host: "Big Sam" },
    ],
  },
  {
    id: "finsbury",
    name: "Finsbury Park",
    area: "Finsbury Park · N4",
    distanceKm: 2.9,
    surface: "Tarmac · 3 hoops",
    players: 2,
    capacity: 9,
    checkedIn: ["Leon", "Ish"],
    runs: [
      { id: "r5", time: "Sun · 2:00 PM", skill: "Beginner friendly", format: "3v3", spotsLeft: 5, host: "Leon" },
    ],
  },
];

/* ============================================================================
   HEAT LOGIC — busyness is derived, never stored, so it reacts to check-ins.
   ========================================================================= */
function deriveHeat(players, capacity) {
  const ratio = players / capacity;
  if (players === 0) return { label: "EMPTY", color: T.heatEmpty, level: 0, hint: "Court is open" };
  if (ratio < 0.75) return { label: "BUSY", color: T.heatBusy, level: 1, hint: "Game on — space left" };
  return { label: "FULL", color: T.heatFull, level: 2, hint: "Rammed — expect a wait" };
}

/* ============================================================================
   SHARED ATOMS
   ========================================================================= */

/** Pulsing live indicator dot, tinted to the current heat color. */
function LiveDot({ color }) {
  return (
    <span style={{ position: "relative", display: "inline-block", width: 8, height: 8 }}>
      <span style={{
        position: "absolute", inset: 0, borderRadius: "50%",
        background: color, animation: "hcPulse 1.6s ease-out infinite",
      }} />
      <span style={{ position: "absolute", inset: 0, borderRadius: "50%", background: color }} />
    </span>
  );
}

/**
 * SIGNATURE ELEMENT — the Heat Meter.
 * Three court-paint segments (EMPTY / BUSY / FULL); segments at or below the
 * current level light up in the heat color, the rest stay as faded asphalt.
 */
function HeatMeter({ players, capacity, compact = false }) {
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

/** Uppercase section label — the structural "eyebrow" used across screens. */
function Eyebrow({ children }) {
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

/** Primary CTA button. `tone` switches between orange (act) and outline (undo). */
function Button({ children, onClick, tone = "primary", disabled = false, style: extra }) {
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

/** Selectable chip used in the Host a Run form (skill + format pickers). */
function Chip({ label, selected, onClick }) {
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

/* Simple inline SVG icons (no external icon dependency needed). */
const Icon = {
  Map: (c) => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8">
      <path d="M9 4 3 6v14l6-2 6 2 6-2V4l-6 2-6-2z" /><path d="M9 4v14M15 6v14" />
    </svg>
  ),
  Host: (c) => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8">
      <circle cx="12" cy="12" r="9" /><path d="M12 8v8M8 12h8" />
    </svg>
  ),
  Profile: (c) => (
    <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.8">
      <circle cx="12" cy="8" r="4" /><path d="M4 21c1.5-4 5-5.5 8-5.5s6.5 1.5 8 5.5" />
    </svg>
  ),
  Back: (c) => (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="2">
      <path d="M15 5l-7 7 7 7" />
    </svg>
  ),
  Ball: (c, size = 18) => (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={c} strokeWidth="1.6">
      <circle cx="12" cy="12" r="9" />
      <path d="M3.5 9c3 1.5 5 3 5 6.5M20.5 9c-3 1.5-5 3-5 6.5M12 3v18M3 12h18" />
    </svg>
  ),
};

/* ============================================================================
   SCREEN 1 — LANDING / ONBOARDING
   Minimalist: wordmark, one-line pitch, email capture, court discovery CTA.
   ========================================================================= */
function LandingScreen({ onEnter }) {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleEmail = () => {
    // Lightweight validation — prototype only.
    if (/^\S+@\S+\.\S+$/.test(email)) setSubmitted(true);
  };

  return (
    <div style={{
      minHeight: "100%", display: "flex", flexDirection: "column",
      justifyContent: "flex-end", padding: "0 24px 48px", position: "relative",
    }}>
      {/* Background court-key arc — gritty court-paint motif */}
      <svg viewBox="0 0 450 450" style={{ position: "absolute", top: -60, right: -90, width: 380, opacity: 0.12 }}>
        <circle cx="225" cy="225" r="160" fill="none" stroke={T.orange} strokeWidth="3" />
        <circle cx="225" cy="225" r="60" fill="none" stroke={T.orange} strokeWidth="3" />
        <path d="M65 225h320M225 65v320" stroke={T.orange} strokeWidth="3" />
      </svg>

      <div style={{ position: "relative" }}>
        <div style={{
          fontFamily: T.stat, fontWeight: 600, letterSpacing: "0.3em", fontSize: 12,
          color: T.orange, marginBottom: 14,
        }}>
          LONDON · LIVE COURTS
        </div>

        {/* Wordmark */}
        <h1 style={{
          fontFamily: T.display, fontSize: 64, lineHeight: 0.95, margin: 0,
          color: T.ink, textTransform: "uppercase",
        }}>
          Heat<span style={{ color: T.orange }}>Check</span>
        </h1>

        <p style={{
          fontFamily: T.body, fontSize: 16, lineHeight: 1.5, color: T.inkDim,
          margin: "18px 0 30px", maxWidth: 330,
        }}>
          See which London courts are running right now. Check in, find a game,
          or host your own run.
        </p>

        {/* Email capture */}
        {submitted ? (
          <div style={{
            fontFamily: T.stat, fontSize: 14, letterSpacing: "0.08em", color: T.heatEmpty,
            border: `1px solid ${T.line}`, borderRadius: 6, padding: "13px 16px",
            marginBottom: 12, background: T.surface,
          }}>
            ✓ You're on the list — {email}
          </div>
        ) : (
          <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
            <input
              type="email"
              value={email}
              placeholder="you@email.com"
              onChange={(e) => setEmail(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && handleEmail()}
              style={{
                flex: 1, background: T.surface, border: `1px solid ${T.line}`,
                borderRadius: 6, padding: "13px 14px", color: T.ink,
                fontFamily: T.body, fontSize: 15, outline: "none",
              }}
            />
            <button onClick={handleEmail} style={{
              fontFamily: T.stat, fontWeight: 600, fontSize: 13, letterSpacing: "0.1em",
              background: T.surfaceHi, color: T.ink, border: `1px solid ${T.line}`,
              borderRadius: 6, padding: "0 16px", cursor: "pointer",
            }}>
              JOIN
            </button>
          </div>
        )}

        {/* Court discovery CTA */}
        <Button onClick={onEnter}>Find courts near me →</Button>

        <div style={{
          fontFamily: T.stat, fontSize: 11, letterSpacing: "0.14em",
          color: T.inkFaint, textAlign: "center", marginTop: 14,
        }}>
          5 COURTS LIVE · UPDATED IN REAL TIME
        </div>
      </div>
    </div>
  );
}

/* ============================================================================
   SCREEN 2 — LIVE COURT MAP / DASHBOARD
   List of 5 courts with heat meter + distance. Tap a card → detail view.
   ========================================================================= */
function MapScreen({ courts, checkedInCourtId, onOpenCourt }) {
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

/* ============================================================================
   SCREEN 3 — COURT DETAIL VIEW
   Who's checked in, active runs, and the Check In / Leave toggle.
   ========================================================================= */
function CourtDetailScreen({ court, isCheckedIn, canCheckIn, onBack, onToggleCheckIn, onHostHere, toast }) {
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

/* ============================================================================
   SCREEN 4 — HOST A RUN FORM
   Inputs: court, time, skill level, format, spots. Submit → run is appended
   to the chosen court's run list and we navigate to that court's detail view.
   ========================================================================= */
function HostRunScreen({ courts, defaultCourtId, onSubmit, onCancel }) {
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

/** +/− stepper button for the spots control. */
function StepBtn({ label, onClick }) {
  return (
    <button onClick={onClick} style={{
      width: 44, height: 44, borderRadius: 6, border: `1px solid ${T.line}`,
      background: T.surfaceHi, color: T.ink, fontFamily: T.display, fontSize: 20, cursor: "pointer",
    }}>
      {label}
    </button>
  );
}

/** "18:30" → "6:30 PM" for run cards. */
function formatTime(hhmm) {
  const [h, m] = hhmm.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const hour12 = h % 12 === 0 ? 12 : h % 12;
  return `${hour12}:${String(m).padStart(2, "0")} ${period}`;
}

/* ============================================================================
   SCREEN 5 — PROFILE (lightweight, completes the bottom nav)
   ========================================================================= */
function ProfileScreen({ courts, checkedInCourtId, hostedCount, onOpenCourt }) {
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

/* ============================================================================
   FIXED BOTTOM NAVIGATION — Map / Host / Profile
   ========================================================================= */
function BottomNav({ active, onNavigate }) {
  const items = [
    { key: "map", label: "MAP", icon: Icon.Map },
    { key: "host", label: "HOST", icon: Icon.Host },
    { key: "profile", label: "PROFILE", icon: Icon.Profile },
  ];
  return (
    <nav style={{
      position: "absolute", bottom: 0, left: 0, right: 0,
      background: "rgba(11,11,13,0.96)", backdropFilter: "blur(8px)",
      borderTop: `1px solid ${T.line}`,
      display: "flex", justifyContent: "space-around", padding: "10px 0 18px",
    }}>
      {items.map(({ key, label, icon }) => {
        const isActive = active === key;
        const color = isActive ? T.orange : T.inkFaint;
        return (
          <button key={key} onClick={() => onNavigate(key)} style={{
            background: "none", border: "none", cursor: "pointer",
            display: "flex", flexDirection: "column", alignItems: "center", gap: 4,
            padding: "4px 18px",
          }}>
            {icon(color)}
            <span style={{ fontFamily: T.stat, fontWeight: 600, fontSize: 10, letterSpacing: "0.18em", color }}>
              {label}
            </span>
            {/* active indicator tick */}
            <span style={{ width: 16, height: 2, background: isActive ? T.orange : "transparent", borderRadius: 1 }} />
          </button>
        );
      })}
    </nav>
  );
}

/* ============================================================================
   ROOT APP — owns all state + the view router
   ========================================================================= */
export default function HeatCheckApp() {
  // ---- Global state -------------------------------------------------------
  const [screen, setScreen] = useState("landing");          // current view
  const [courts, setCourts] = useState(INITIAL_COURTS);     // single source of truth
  const [activeCourtId, setActiveCourtId] = useState(null); // court open in detail view
  const [checkedInCourtId, setCheckedInCourtId] = useState(null);
  const [hostedCount, setHostedCount] = useState(0);
  const [toast, setToast] = useState("");

  const activeCourt = courts.find((c) => c.id === activeCourtId);

  // ---- Actions ------------------------------------------------------------

  /** Open a court's detail view (from list or profile). */
  const openCourt = (id) => {
    setActiveCourtId(id);
    setToast("");
    setScreen("detail");
  };

  /**
   * CHECK IN / LEAVE toggle.
   * Increments/decrements the live player count and adds/removes "You" from
   * the checked-in roster. Heat level updates automatically (it's derived).
   */
  const toggleCheckIn = () => {
    const id = activeCourtId;
    const leaving = checkedInCourtId === id;

    setCourts((prev) =>
      prev.map((c) => {
        if (c.id !== id) return c;
        return leaving
          ? { ...c, players: Math.max(0, c.players - 1), checkedIn: c.checkedIn.filter((n) => n !== "You") }
          : { ...c, players: c.players + 1, checkedIn: [...c.checkedIn, "You"] };
      })
    );
    setCheckedInCourtId(leaving ? null : id);
    setToast(leaving ? "" : "You're on the board — players can see you're here.");
  };

  /**
   * HOST A RUN submit handler.
   * Appends the new run to the chosen court, then routes to that court's
   * detail view so the user immediately sees their run in the list.
   */
  const handleHostSubmit = ({ courtId, run }) => {
    setCourts((prev) =>
      prev.map((c) => (c.id === courtId ? { ...c, runs: [run, ...c.runs] } : c))
    );
    setHostedCount((n) => n + 1);
    setActiveCourtId(courtId);
    setToast(`Run posted ✓ — ${run.format}, ${run.time}`);
    setScreen("detail");
  };

  /** Bottom nav routing. "Host" pre-selects the open court when relevant. */
  const navigate = (key) => {
    setToast("");
    setScreen(key);
  };

  // ---- Render -------------------------------------------------------------
  const showNav = screen !== "landing";

  return (
    <div style={{
      minHeight: "100vh", background: T.bgPage,
      display: "flex", justifyContent: "center", alignItems: "stretch",
      fontFamily: T.body,
    }}>
      {/* Web fonts + keyframes + minimal global polish */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Anton&family=Barlow:wght@400;500;600&family=Barlow+Condensed:wght@500;600&display=swap');
        @keyframes hcPulse {
          0% { transform: scale(1); opacity: 0.8; }
          100% { transform: scale(2.6); opacity: 0; }
        }
        * { box-sizing: border-box; }
        button:focus-visible, input:focus-visible, select:focus-visible {
          outline: 2px solid ${T.orange}; outline-offset: 2px;
        }
        input::placeholder { color: ${T.inkFaint}; }
        @media (prefers-reduced-motion: reduce) {
          * { animation: none !important; transition: none !important; }
        }
      `}</style>

      {/* Phone frame: mobile-first, max 450px centered for desktop */}
      <div style={{
        width: "100%", maxWidth: 450, background: T.bgApp,
        position: "relative", display: "flex", flexDirection: "column",
        minHeight: "100vh", borderLeft: `1px solid ${T.line}`, borderRight: `1px solid ${T.line}`,
        overflow: "hidden",
      }}>
        {/* Scrollable screen content */}
        <div style={{ flex: 1, overflowY: "auto" }}>
          {screen === "landing" && <LandingScreen onEnter={() => setScreen("map")} />}

          {screen === "map" && (
            <MapScreen courts={courts} checkedInCourtId={checkedInCourtId} onOpenCourt={openCourt} />
          )}

          {screen === "detail" && activeCourt && (
            <CourtDetailScreen
              court={activeCourt}
              isCheckedIn={checkedInCourtId === activeCourt.id}
              canCheckIn={checkedInCourtId === null}
              onBack={() => setScreen("map")}
              onToggleCheckIn={toggleCheckIn}
              onHostHere={() => setScreen("host")}
              toast={toast}
            />
          )}

          {screen === "host" && (
            <HostRunScreen
              courts={courts}
              defaultCourtId={activeCourtId}
              onSubmit={handleHostSubmit}
              onCancel={() => setScreen(activeCourtId ? "detail" : "map")}
            />
          )}

          {screen === "profile" && (
            <ProfileScreen
              courts={courts}
              checkedInCourtId={checkedInCourtId}
              hostedCount={hostedCount}
              onOpenCourt={openCourt}
            />
          )}
        </div>

        {/* Fixed bottom nav (hidden on landing for a clean first impression) */}
        {showNav && (
          <BottomNav
            active={screen === "detail" ? "map" : screen}
            onNavigate={navigate}
          />
        )}
      </div>
    </div>
  );
}