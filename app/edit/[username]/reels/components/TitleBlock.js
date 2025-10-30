export default function TitleBlock({ kor, eng }) {
  return (
    <div className="flex items-baseline gap-2 w-full border-b border-white py-4 text-2xl font-bold font-serif italic">
      {eng}{" "}
      <p className="font-sans not-italic font-light align-bottom justify-end text-sm">
        {kor}
      </p>
    </div>
  );
}
