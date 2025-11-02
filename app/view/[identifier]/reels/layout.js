// app/view/layout.tsx  ← 여기서 html/body 쓰지 마세요
export default function ViewLayout({ children }) {
  return (
    <div className="h-screen overflow-hidden">{children}</div>
  );
}
