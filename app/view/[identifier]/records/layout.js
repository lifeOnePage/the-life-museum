// app/view/layout.tsx
export default function ViewLayout({ children }) {
  return (
    <main
      className="bg-black-100 w-screen text-white"
      style={{ minHeight: "100vh", overflowY: "auto" }}
    >
      {children}
    </main>
  );
}
