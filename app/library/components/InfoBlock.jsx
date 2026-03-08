import Header from "@/app/components/Header";

const FILTER_LABELS = { all: "전체", owner: "내 앨범", shared: "공유 앨범" };

export default function InfoBlock({ onClickCreate, onCloseAlbum, filterType, setFilterType }) {
  return (
    <div>
      <Header />
      <div className="pointer-events-none relative flex h-[20vh] w-full flex-row items-center p-8 px-16">
        {/* 필터 칩 */}
        <div className="pointer-events-auto flex gap-2">
          {["all", "owner", "shared"].map((type) => (
            <button
              key={type}
              onClick={(e) => {
                e.stopPropagation();
                setFilterType?.(type);
              }}
              className={`rounded-full px-4 py-1.5 text-sm font-medium transition ${
                filterType === type
                  ? "bg-black text-white"
                  : "bg-white/20 text-black hover:bg-white/40"
              }`}
            >
              {FILTER_LABELS[type]}
            </button>
          ))}
        </div>

        {/* 새로 만들기 버튼 */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onClickCreate();
          }}
          className="pointer-events-auto absolute right-16 rounded-full bg-black px-6 py-2 text-sm text-white transition hover:bg-black/50"
        >
          새로 만들기
        </button>
      </div>
    </div>
  );
}
