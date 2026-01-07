/**
 * Side navigation for record editing.
 * 레코드 편집용 사이드 네비게이션
 * @param {Object} props
 * @param {number} props.desktopShowMenu
 * @param {Function} props.setDesktopShowMenu
 * @param {Array<{eng: string, kor: string}>} props.section
 */

export default function EditNavDrawer({
  desktopShowMenu,
  setDesktopShowMenu,
  section,
}) {
  return (
    <div className="border-white-200 h-full w-[200px] flex-col border-r border-dashed">
      {section.map((it, i) => (
        <button
          key={i}
          onClick={() => setDesktopShowMenu(i)}
          className={`${
            desktopShowMenu === i ? "bg-black-300" : "none"
          } hover:bg-white-200 transition-bg border-white-200 pointer-events-auto flex w-full items-baseline gap-2 border-b px-3 py-4 font-serif text-xl font-bold italic duration-200`}
        >
          {it.eng}{" "}
          <p className="justify-end align-bottom font-sans text-sm font-light not-italic">
            {it.kor}
          </p>
        </button>
      ))}
    </div>
  );
}
