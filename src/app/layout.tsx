import type { Metadata } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import Header from "./components/Header";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Scholar | 맞춤형 청년 정책 찾기",
  description: "거주지, 나이, 취업상태 등 내 조건을 입력하고 맞춤형 청년 지원 정책을 찾아보세요.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className={outfit.variable} data-theme="dark">
      <body>
        <div className="app-container">
          <Header />
          <main className="main-content">
            {children}
          </main>
          <footer className="footer">
            <p>© 2026 Scholar. 온통청년 API 기반 맞춤형 청년 정책 플랫폼.</p>
          </footer>
        </div>
      </body>
    </html>
  );
}
