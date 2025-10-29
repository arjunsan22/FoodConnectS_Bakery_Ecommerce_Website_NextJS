// src/app/layout.js
import "./globals.css";

import LayoutContent from "./components/LayoutContent";
import SessionWrapper from "./components/SessionWrapper"; // ✅

export const metadata = {
  title: "FoodConnects",
  description: "Order delicious cakes, breads & pastries online",
  icons: "/favicon.ico",
};
export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="icon" href="/favicon.ico" sizes="any" />
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link
          rel="preconnect"
          href="https://fonts.gstatic.com"
          crossOrigin="anonymous"
        />
        <link
          href="https://fonts.googleapis.com/css2?family=Playwrite+DE+SAS:wght@100..400&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="font-playwrite-de antialiased">
        {/* ✅ Wrap everything that needs auth in SessionWrapper */}
        <SessionWrapper>
          <LayoutContent>{children}</LayoutContent>
        </SessionWrapper>
      </body>
    </html>
  );
}
