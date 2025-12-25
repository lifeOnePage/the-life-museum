"use client";
import { HiHome } from "react-icons/hi";
import { norm360, angDist } from "../utils/mathUtils";

export default function TimelineWheel({
  timeline,
  rotation,
  activeIdx,
  onItemClick,
  isMobile = false,
}) {
  const DESKTOP = { START: 0, SWEEP: 120, RADIUS: 200, ANCHOR: 0 };
  const MOBILE = { START: 110, SWEEP: 180, RADIUS: 140, ANCHOR: 110 };
  const CFG = isMobile ? MOBILE : DESKTOP;
  const RADIUS = CFG.RADIUS;
  const getAnchor = () => CFG.ANCHOR;

  const angleForIndex = (i) => {
    const FIXED_STEP = 23;
    return CFG.START + FIXED_STEP * i;
  };

  const getOpacityForAngle = (angle, anchor = getAnchor()) => {
    let diff = Math.abs(norm360(angle) - norm360(anchor));
    if (diff > 180) diff = 360 - diff;

    const normalizedDiff = Math.min(diff / 90, 1);
    const opacity = 1 - normalizedDiff * normalizedDiff * 1.5;
    return Math.max(opacity, 0);
  };

  return (
    <aside className="lr-right" onWheel={(e) => {}}>
      <div className="lp-wrap">
        <img
          className="lp-disc"
          src="/images/records/LP-image.png"
          alt="LP"
          style={{ transform: `rotate(${norm360(rotation)}deg)` }}
        />
        <div className="year-circle">
          {timeline.map((item, i) => {
            const baseAngle = angleForIndex(i);
            const phi = baseAngle + rotation;
            const anchor = getAnchor();
            const relativeAngle = norm360(phi - anchor);
            const opacity = getOpacityForAngle(relativeAngle, 0);
            return (
              <span
                key={item.id}
                className={`year-item ${i === activeIdx ? "active" : ""}`}
                style={{
                  transform: `rotate(${phi}deg) translate(${RADIUS}px) rotate(${-phi}deg)`,
                  opacity: opacity,
                  transition:
                    "opacity 0.25s ease, transform 0.25s ease, color 0.25s ease",
                }}
                onClick={() => onItemClick?.(i)}
              >
                {item.kind === "main" || item.label === "Home" ? (
                  <HiHome size={20} />
                ) : (
                  item.label
                )}
                {item.kind === "main" ? (
                  <span className="year-event">{item.title}</span>
                ) : (
                  <span className="year-event">{item.event}</span>
                )}
              </span>
            );
          })}
        </div>
      </div>
    </aside>
  );
}


