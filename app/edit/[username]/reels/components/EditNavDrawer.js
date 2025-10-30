import TitleBlock from "./TitleBlock";

export default function EditNavDrawer({
  desktopShowMenu,
  setDesktopShowMenu,
  section,
}) {
  console.group("editNavigationDrawer");
  console.log("desktopShowMenu", desktopShowMenu);
  console.groupEnd();
  return (
    <div className="w-[200px] border-r border-dashed border-white-200 h-full flex-col">
      {section.map((it, i) => (
        <button
          key={i}
          onClick={() => setDesktopShowMenu(i)}
          className={`${desktopShowMenu === i ? "bg-black-300" : "none"} hover:bg-white-200 transition-bg duration-200 pointer-events-auto px-3 flex items-baseline gap-2 w-full border-b border-white-200 py-4 text-xl font-bold font-serif italic`}
        >
          {it.eng}{" "}
          <p className="font-sans not-italic font-light align-bottom justify-end text-sm">
            {it.kor}
          </p>
        </button>
      ))}
    </div>
  );
}
