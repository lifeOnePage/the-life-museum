import Header from "@/app/components/Header";
import { Fragment, useState } from "react";

export default function InfoBlock({ user, onClickCreate, onCloseAlbum }) {
  const [mode, setMode] = useState("view");
  const [draft, setDraft] = useState({
    name: user?.name || "",
    phone: user?.phone || "",
    email: user?.email || "",
  });
  const [local, setLocal] = useState({
    name: user?.name || "",
    phone: user?.phone || "",
    email: user?.email || "",
  });

  const isEdit = mode === "edit";

  const handleSave = () => {
    setLocal({ ...draft });
    setMode("view");
  };

  const handleEdit = () => {
    setDraft({ ...local });
    setMode("edit");
  };

  const fields = [
    { key: "name", label: "이름" },
    { key: "phone", label: "전화번호" },
    { key: "email", label: "Email" },
  ];

  return (
    <div>
      <Header />
      <div
        className="pointer-events-auto relative flex h-[20vh] w-full flex-row p-8 px-16"
        onClick={onCloseAlbum}
      >
        <button
          onClick={(e) => {
            e.stopPropagation();
            onClickCreate();
          }}
          className="absolute right-16 rounded-full bg-black px-6 py-2 text-sm text-white transition hover:bg-black/50"
        >
          새로 만들기
        </button>
        <div className="flex-1">
          <div>Information</div>
          <div
            className="mt-2 cursor-pointer text-sm font-semibold text-black/50 underline"
            onClick={(e) => {
              e.stopPropagation();
              isEdit ? handleSave() : handleEdit();
            }}
          >
            {isEdit ? "저장" : "편집하기"}
          </div>
        </div>
        <div
          className="flex-8 px-6"
          // onClick={(e) => e.stopPropagation()}
          style={{
            display: "inline-grid",
            padding: "0 12px",
            rowGap: 10,
            columnGap: 26,
            gridTemplateRows: "repeat(3, fit-content(100%))",
            gridTemplateColumns: "repeat(2, fit-content(100%))",
          }}
        >
          {fields.map(({ key, label }) => (
            <Fragment key={key}>
              <h1 className="text-sm font-semibold text-black/50">{label}</h1>
              {isEdit ? (
                <input
                  type="text"
                  value={draft[key]}
                  onChange={(e) =>
                    setDraft((d) => ({ ...d, [key]: e.target.value }))
                  }
                  className="border-b border-black/20 bg-transparent text-sm outline-none focus:border-black"
                />
              ) : (
                <span>{local[key] || "-"}</span>
              )}
            </Fragment>
          ))}
        </div>
        <div className="flex-auto" />
      </div>
    </div>
  );
}
