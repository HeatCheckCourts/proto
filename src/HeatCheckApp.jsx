/**
 * ============================================================================
 *  HEATCHECK — London Pickup Basketball Prototype
 * ============================================================================
 *  High-fidelity interactive prototype. This file is the root: it owns app
 *  state and maps routes to screens. Tokens live in theme/, heat rules in
 *  lib/, shared atoms in components/ and one file per view in screens/.
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
 *  • Routing (React Router) — / landing · /courts list · /court/:courtId detail
 *                         · /host form · /profile. The URL replaces the old
 *                         `screen` state, so every view is linkable/refreshable.
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
import { Navigate, Route, Routes, useLocation, useMatch, useNavigate, useParams } from "react-router";
import { T } from "./theme/tokens";
import { INITIAL_COURTS } from "./data/mockCourts";
import BottomNav from "./components/BottomNav";
import GlobalStyles from "./components/GlobalStyles";
import LandingScreen from "./screens/LandingScreen";
import MapScreen from "./screens/MapScreen";
import CourtDetailScreen from "./screens/CourtDetailScreen";
import HostRunScreen from "./screens/HostRunScreen";
import ProfileScreen from "./screens/ProfileScreen";

/** Bottom-nav keys ↔ routes. */
const NAV_PATHS = { map: "/courts", host: "/host", profile: "/profile" };

/** Which bottom-nav tab is lit for a given path (court detail lives under MAP). */
function navKeyFor(pathname) {
  if (pathname === "/courts" || pathname.startsWith("/court/")) return "map";
  if (pathname === "/host") return "host";
  if (pathname === "/profile") return "profile";
  return null;
}

/** /court/:courtId — resolves the court from the URL; unknown ids go back to the list. */
function CourtRoute({ courts, checkedInCourtId, ...handlers }) {
  const { courtId } = useParams();
  const court = courts.find((c) => c.id === courtId);
  if (!court) return <Navigate to="/courts" replace />;
  return (
    <CourtDetailScreen
      court={court}
      isCheckedIn={checkedInCourtId === court.id}
      canCheckIn={checkedInCourtId === null}
      {...handlers}
    />
  );
}

/* ============================================================================
   ROOT APP — owns all state + the route table
   ========================================================================= */
export default function HeatCheckApp() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const courtMatch = useMatch("/court/:courtId");

  // ---- Global state -------------------------------------------------------
  const [courts, setCourts] = useState(INITIAL_COURTS);     // single source of truth
  const [activeCourtId, setActiveCourtId] = useState(null); // last court opened in detail view
  const [checkedInCourtId, setCheckedInCourtId] = useState(null);
  const [hostedCount, setHostedCount] = useState(0);
  const [toast, setToast] = useState("");

  // Track the court in the URL (including deep links / refreshes) so Host
  // pre-selects it and Cancel returns to it, exactly as before routing.
  const urlCourtId = courtMatch?.params.courtId;
  if (urlCourtId && urlCourtId !== activeCourtId && courts.some((c) => c.id === urlCourtId)) {
    setActiveCourtId(urlCourtId);
  }

  // ---- Actions ------------------------------------------------------------

  /** Open a court's detail view (from list or profile). */
  const openCourt = (id) => {
    setActiveCourtId(id);
    setToast("");
    navigate(`/court/${id}`);
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
    navigate(`/court/${courtId}`);
  };

  /** Bottom nav routing. */
  const navigateTab = (key) => {
    setToast("");
    navigate(NAV_PATHS[key]);
  };

  // ---- Render -------------------------------------------------------------
  const navKey = navKeyFor(pathname);
  const showNav = navKey !== null; // hidden on landing for a clean first impression

  return (
    <div style={{
      minHeight: "100vh", background: T.bgPage,
      display: "flex", justifyContent: "center", alignItems: "stretch",
      fontFamily: T.body,
    }}>
      <GlobalStyles />

      {/* Phone frame: mobile-first, max 450px centered for desktop */}
      <div style={{
        width: "100%", maxWidth: 450, background: T.bgApp,
        position: "relative", display: "flex", flexDirection: "column",
        minHeight: "100vh", borderLeft: `1px solid ${T.line}`, borderRight: `1px solid ${T.line}`,
        overflow: "hidden",
      }}>
        {/* Scrollable screen content */}
        <div style={{ flex: 1, overflowY: "auto" }}>
          <Routes>
            <Route path="/" element={<LandingScreen onEnter={() => navigate("/courts")} />} />

            <Route path="/courts" element={
              <MapScreen courts={courts} checkedInCourtId={checkedInCourtId} onOpenCourt={openCourt} />
            } />

            <Route path="/court/:courtId" element={
              <CourtRoute
                courts={courts}
                checkedInCourtId={checkedInCourtId}
                onBack={() => navigate("/courts")}
                onToggleCheckIn={toggleCheckIn}
                onHostHere={() => navigate("/host")}
                toast={toast}
              />
            } />

            <Route path="/host" element={
              <HostRunScreen
                courts={courts}
                defaultCourtId={activeCourtId}
                onSubmit={handleHostSubmit}
                onCancel={() => navigate(activeCourtId ? `/court/${activeCourtId}` : "/courts")}
              />
            } />

            <Route path="/profile" element={
              <ProfileScreen
                courts={courts}
                checkedInCourtId={checkedInCourtId}
                hostedCount={hostedCount}
                onOpenCourt={openCourt}
              />
            } />

            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </div>

        {/* Fixed bottom nav */}
        {showNav && <BottomNav active={navKey} onNavigate={navigateTab} />}
      </div>
    </div>
  );
}
