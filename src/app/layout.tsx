import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Scholar | 맞춤형 장학금 및 정책 필터링",
  description: "개인 조건에 맞는 장학금과 학교 정책을 쉽게 찾아보세요.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className={outfit.variable}>
      <body>
        <div className="app-container">
          <header className="glass-header">
            <div className="header-content">
              <h1 className="logo">Scholar<span className="accent">.</span></h1>
              <nav>
                <a href="#search" className="nav-link">맞춤 검색</a>
                <a href="#announcements" className="nav-link">공지사항</a>
              </nav>
            </div>
          </header>
          <main className="main-content">
            {children}
          </main>
          <footer className="footer">
            <p>© 2026 Scholar. All rights reserved.</p>
          </footer>
        </div>
      </body>
    </html>
  );
}
