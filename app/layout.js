// app/layout.js
import { AuthProvider } from "./contexts/AuthContext";
import "./globals.css";

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body
        style={{
          margin: 0,
          // minHeight: "100vh",
          
        }}
      >
        <AuthProvider>{children}</AuthProvider>
      </body>
    </html>
  );
}
