import Header from "@/app/components/Header";

const T = {
  ko: {
    all: "전체",
    owner: "내 앨범",
    shared: "공유 앨범",
    create: "새로 만들기",
  },
  en: {
    all: "All",
    owner: "My Albums",
    shared: "Shared",
    create: "New Album",
  },
};

export default function InfoBlock({ onClickCreate, onCloseAlbum, filterType, setFilterType, locale }) {
  const t = T[locale] || T.ko;
  return (
    <div>
      <Header />
      <div className="pointer-events-none flex w-full flex-row items-center gap-3 px-4 py-3 sm:px-8 lg:px-16">
        {/* 필터 드롭다운 */}
        <select
          value={filterType}
          onChange={(e) => {
            e.stopPropagation();
            setFilterType?.(e.target.value);
          }}
          className="pointer-events-auto cursor-pointer rounded-full border border-white/20 bg-white/10 px-4 py-2 text-sm text-white backdrop-blur transition hover:bg-white/20 focus:outline-none"
        >
          <option value="all" className="bg-[#1a1510] text-white">{t.all}</option>
          <option value="owner" className="bg-[#1a1510] text-white">{t.owner}</option>
          <option value="shared" className="bg-[#1a1510] text-white">{t.shared}</option>
        </select>

        {/* 새로 만들기 버튼 */}
        <button
          onClick={(e) => {
            e.stopPropagation();
            onClickCreate();
          }}
          className="pointer-events-auto rounded-full bg-white/90 px-5 py-2 text-sm font-medium text-black transition hover:bg-white"
        >
          {t.create}
        </button>
      </div>
    </div>
  );
}
