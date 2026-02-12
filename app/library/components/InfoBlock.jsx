export default function InfoBlock({ onClickCreate }) {
  return (
    <div className="pointer-events-auto relative flex h-[20vh] w-full flex-row bg-white p-4">
      <button
        onClick={onClickCreate}
        className="absolute top-4 right-4 rounded-lg bg-black px-4 py-2 text-sm font-medium text-white transition hover:bg-black/80"
      >
        새로 만들기
      </button>
      <div className="flex-1 border border-black">ddd</div>
      <div className="flex-2 border border-black">ddd</div>
      <div className="flex-auto border border-black">ddd</div>
    </div>
  );
}
