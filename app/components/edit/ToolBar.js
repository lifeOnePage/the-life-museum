"use client";
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { IoIosArrowBack, IoIosArrowForward, IoIosLogOut } from "react-icons/io";
import { MdPerson } from "react-icons/md";
import { FiEye, FiSave } from "react-icons/fi";

// 필요시 부모 컨테이너 너비 클래스를 prop으로 바꿀 수 있게 해둠
export default function Toolbar({
  mypage,
  preview,
  save,
  logout,
  containerClass = "max-w-5xl",
}) {
  const [collapsed, setCollapsed] = useState(false);
  const [hovered, setHovered] = useState("");

  const items = [
    {
      key: "mypage",
      icon: <MdPerson size={20} />,
      label: "계정 설정",
      onClick: mypage,
      onTouchEnd: () => setHovered(null),
    },
    {
      key: "preview",
      icon: <FiEye size={20} />,
      label: "미리보기",
      onClick: preview,
      onmousedown: () => {
        console.log("end");
        setHovered(null);
      },
    },
    {
      key: "save",
      icon: <FiSave size={20} />,
      label: "저장",
      onClick: save,
      onTouchEnd: () => setHovered(null),
    },
    {
      key: "logout",
      icon: <IoIosLogOut size={20} />,
      label: "로그아웃",
      onClick: logout,
      onTouchEnd: () => setHovered(null),
    },
  ];

  return (
    // 뷰포트 기준으로 '항상 따라옴'
    <div className="pointer-events-none fixed inset-x-0 bottom-[36px] z-[1000] box-border">
      {/* 부모 컨테이너와 동일한 폭으로 제한 */}
      <div
        className={`mx-auto w-full ${containerClass} flex justify-start pl-6`}
      >
        <motion.div
          initial={{ y: 100 }}
          animate={{ y: 0 }}
          className="pointer-events-auto"
        >
          <motion.div
            animate={{ width: collapsed ? 68 : "auto" }}
            transition={{ duration: 0.3 }}
            className="bg-black-200 flex origin-left items-center gap-7 rounded-full px-6 py-2.5 text-white shadow-[0_4px_16px_rgba(0,0,0,0.4)]"
          >
            {/* 접기/펼치기 버튼 */}
            <div
              className="relative mx-auto inline-block"
              onMouseEnter={() =>
                setHovered(collapsed ? "maximize" : "minimize")
              }
              onMouseLeave={() => setHovered(null)}
            >
              {(hovered === "minimize" || hovered === "maximize") && (
                <div className="absolute bottom-[150%] left-1/2 z-10 -translate-x-1/2 rounded bg-black/70 px-2.5 py-1 text-[12px] whitespace-nowrap text-white">
                  {collapsed ? "툴바 펼치기" : "툴바 접기"}
                </div>
              )}
              <button
                onClick={() => setCollapsed(!collapsed)}
                className="cursor-pointer border-0 bg-transparent p-0"
                aria-label={collapsed ? "툴바 펼치기" : "툴바 접기"}
              >
                {collapsed ? (
                  <IoIosArrowForward size={20} />
                ) : (
                  <IoIosArrowBack size={20} />
                )}
              </button>
            </div>

            {/* 아이콘 그룹 */}
            <AnimatePresence>
              {!collapsed && (
                <>
                  {items.map((item, i) => (
                    <motion.div
                      key={item.key}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 10 }}
                      transition={{ delay: i * 0.05, duration: 0.2 }}
                      className="relative mx-auto inline-block"
                      onMouseEnter={() => setHovered(item.key)}
                      onMouseLeave={() => setHovered(null)}
                      onClick={item.onClick}
                      onTouchEnd={() => setHovered(null)}
                    >
                      {hovered === item.key && (
                        <div className="absolute bottom-[150%] left-1/2 z-10 -translate-x-1/2 rounded bg-black/70 px-2.5 py-1 text-[12px] whitespace-nowrap text-white">
                          {item.label}
                        </div>
                      )}
                      <button
                        className="cursor-default border-0 bg-transparent p-0"
                        tabIndex={-1}
                      >
                        {item.icon}
                      </button>
                    </motion.div>
                  ))}
                </>
              )}
            </AnimatePresence>
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
