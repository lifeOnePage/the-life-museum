"use client";
import { HiHome } from "react-icons/hi";
import { FaAngleLeft, FaAngleRight } from "react-icons/fa6";
import { IoMenu } from "react-icons/io5";
import { formatDate } from "../utils/dateUtils";

export default function MobileNavigation({
  timeline,
  activeIdx,
  activeItem,
  onPrev,
  onNext,
  onHome,
  onMenuClick,
  showMenu,
  onSelectItem,
  onCloseMenu,
}) {
  const mainIdx = timeline.findIndex((it) => it.kind === "main");

  return (
    <>
      <nav className="lr-mobile-nav">
        <span
          onClick={onHome}
          style={{
            cursor: activeIdx === mainIdx ? "default" : "pointer",
            opacity: activeIdx === mainIdx ? 0 : 1,
            pointerEvents: activeIdx === mainIdx ? "none" : "auto",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <HiHome size={25} />
        </span>
        <div className="lr-mobile-nav-timeline">
          <span
            onClick={onPrev}
            style={{
              cursor: activeIdx === 0 ? "default" : "pointer",
              opacity: activeIdx === 0 ? 0 : 1,
              pointerEvents: activeIdx === 0 ? "none" : "auto",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <FaAngleLeft size={20} />
          </span>
          <span className="lr-mobile-nav-label">
            {activeItem.kind === "main" ||
            activeItem.label === "home" ||
            activeItem.label === "Home" ||
            activeItem.id === "home" ? (
              <HiHome size={20} />
            ) : (
              activeItem.label
            )}
          </span>
          <span
            onClick={onNext}
            style={{
              cursor: activeIdx === timeline.length - 1 ? "default" : "pointer",
              opacity: activeIdx === timeline.length - 1 ? 0 : 1,
              pointerEvents:
                activeIdx === timeline.length - 1 ? "none" : "auto",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <FaAngleRight size={20} />
          </span>
        </div>
        <span
          onClick={onMenuClick}
          style={{
            cursor: "pointer",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <IoMenu size={28} />
        </span>
      </nav>

      {showMenu && (
        <div className="lr-mobile-menu-overlay" onClick={onCloseMenu}>
          <div className="lr-mobile-menu" onClick={(e) => e.stopPropagation()}>
            <div className="lr-mobile-menu-header">
              <h3>타임라인 목록</h3>
              <button
                className="lr-mobile-menu-close"
                onClick={onCloseMenu}
              >
                ✕
              </button>
            </div>
            <div className="lr-mobile-menu-list">
              {timeline.map((item, index) => (
                <div
                  key={item.id}
                  className={`lr-mobile-menu-item ${
                    index === activeIdx ? "active" : ""
                  }`}
                  onClick={() => onSelectItem(index)}
                >
                  <div className="lr-mobile-menu-item-cover">
                    <img
                      src={item.cover || "/images/records/No image.png"}
                      alt={item.kind === "year" ? item.event : item.title}
                    />
                  </div>
                  <div className="lr-mobile-menu-item-info">
                    <div className="lr-mobile-menu-item-label">
                      {item.kind === "main" ||
                      item.label === "home" ||
                      item.label === "Home" ||
                      item.id === "home" ? (
                        <HiHome size={16} />
                      ) : (
                        item.label
                      )}
                    </div>
                    <div className="lr-mobile-menu-item-title">
                      {item.kind === "main"
                        ? item.title
                        : item.kind === "year"
                          ? item.event
                          : item.title}
                    </div>
                    {item.kind === "year" && item.date && (
                      <div className="lr-mobile-menu-item-date">
                        {formatDate(item.date)}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </>
  );
}



