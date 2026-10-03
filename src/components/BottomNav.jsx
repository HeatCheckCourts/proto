import { T } from "../theme/tokens";
import { Icon } from "./Icon";

/* ============================================================================
   FIXED BOTTOM NAVIGATION — Map / Host / Profile
   ========================================================================= */
export default function BottomNav({ active, onNavigate }) {
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
