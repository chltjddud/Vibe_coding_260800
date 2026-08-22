import type { Metadata, Viewport } from "next";
import { Outfit } from "next/font/google";
import "./globals.css";
import Header from "./components/Header";
import { ToastProvider } from "@/components/Toast";

const outfit = Outfit({
  variable: "--font-outfit",
  subsets: ["latin"],
});

export const viewport: Viewport = {
  themeColor: "#0b0f19",
  width: "device-width",
  initialScale: 1,
};

export const metadata: Metadata = {
  title: "Scholar | 맞춤형 청년 정책 & AI 공지사항 분석 플랫폼",
  description: "거주지, 나이, 취업상태 등 내 조건을 입력하고 딱 맞는 국가 청년 정책과 학교 장학 공지사항을 AI로 분석/탐색하세요.",
  keywords: ["청년정책", "장학금", "맞춤형지원", "온통청년", "공지사항요약", "AI분석", "Scholar"],
  authors: [{ name: "Scholar Team" }],
  openGraph: {
    title: "Scholar | 내게 딱 맞는 청년 정책 & 장학금 찾기",
    description: "복잡한 공지사항은 AI로 3초 요약! 조건만 넣으면 숨겨진 국가 정책과 교내 혜택을 찾아드립니다.",
    type: "website",
    locale: "ko_KR",
    siteName: "Scholar",
  },
  twitter: {
    card: "summary_large_image",
    title: "Scholar | 맞춤형 청년 정책 & AI 공지사항 분석",
    description: "복잡한 공지사항은 AI로 3초 요약! 조건만 넣으면 숨겨진 국가 정책과 교내 혜택을 찾아드립니다.",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="ko" className={outfit.variable} data-theme="dark">
      <body>
        <ToastProvider>
          <div className="app-container">
            <Header />
            <main className="main-content">
              {children}
            </main>
            <footer className="footer">
              <p>© 2026 Scholar. 온통청년 API & AI 기반 맞춤형 청년 정책 플랫폼.</p>
            </footer>
          </div>
        </ToastProvider>
      </body>
    </html>
  );
}

