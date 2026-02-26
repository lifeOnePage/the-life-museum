import Header from "@/app/components/Header";

export default function InfoBlock({ onClickCreate, onCloseAlbum }) {
  return (
    <div>
      <Header />
      <div
        className="pointer-events-auto relative flex h-[20vh] w-full flex-row items-center p-8 px-16"
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
      </div>
    </div>
  );
}
