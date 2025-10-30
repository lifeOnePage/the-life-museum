// app/login/components/Header.js
"use client";
export default function Header({ children }) {
  return (
    <h1 style={{ margin:"20px 0px", fontSize: "1.5rem", fontWeight: 700, lineHeight: 1.3,  }}>
      {children}
    </h1>
  );
}
