// app/view/layout.tsx
export default function ViewLayout({ children }) {
  return (
    <main className="w-screen bg-black-100 text-white">
      {children}
    </main>
  );
}

