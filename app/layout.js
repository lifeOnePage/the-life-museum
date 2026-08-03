// app/layout.js
import { AuthProvider } from "./contexts/AuthContext";
import DeepLinkHandler from "./components/DeepLinkHandler";
import "./globals.css";

export const metadata = {
  themeColor: "#121212",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
  },
  icons: {
    icon: "/logo/logo_cropped.svg",
    apple: "/logo/logo_512.png",
  },
};

export const viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
  viewportFit: "cover",
  themeColor: "#121212",
};

export default function RootLayout({ children }) {
  return (
    <html lang="ko">
      <body
        style={{
          margin: 0,
          // minHeight: "100vh",
        }}
      >
        <AuthProvider>
          <DeepLinkHandler />
          {children}
        </AuthProvider>
      </body>
    </html>
  );
}
