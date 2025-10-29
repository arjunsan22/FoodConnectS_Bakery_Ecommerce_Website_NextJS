"use client";

import { usePathname } from "next/navigation";
import Header from "./Header";
import Footer from "./Footer";

export default function LayoutContent({ children }) {
  const pathname = usePathname();

  // ✅ Show Header/Footer on all routes except '/admin' ones
  const hideForAdmin = pathname.startsWith("/admin");
  const showHeaderFooter = !hideForAdmin;

  return (
    <>
      {showHeaderFooter && <Header />}
      <main className={showHeaderFooter ? "pt-24" : ""}>{children}</main>
      {showHeaderFooter && <Footer />}
    </>
  );
}
