/**
 * Section title block.
 * 섹션 제목 블록.
 * @param {{ kor: string, eng: string }} props
 * @returns {JSX.Element}
 */
export default function TitleBlock({ kor, eng }) {
  return (
    <div className="flex w-full items-baseline gap-2 border-b border-white py-4 font-serif text-2xl font-bold italic">
      {eng}{" "}
      <p className="justify-end align-bottom font-sans text-sm font-light not-italic">
        {kor}
      </p>
    </div>
  );
}
