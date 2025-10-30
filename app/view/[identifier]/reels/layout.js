// app/view/layout.tsx  ← 여기서 html/body 쓰지 마세요
export default function ViewLayout({ children }) {
  return (
    <main className="h-screen w-screen overflow-hidden bg-black-100 text-white">
      {children}
    </main>
  );
}
