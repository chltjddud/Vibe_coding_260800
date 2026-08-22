"use client";

import { useState, useEffect } from "react";
import Link from "next/link";

export default function Header() {
  const [theme, setTheme] = useState<"dark" | "light">("dark");

  // 로컬스토리지에서 저장된 테마 불러오기
  useEffect(() => {
    const saved = localStorage.getItem("theme") as "dark" | "light" | null;
    if (saved) {
      setTheme(saved);
      document.documentElement.setAttribute("data-theme", saved);
    }
  }, []);

  const toggleTheme = () => {
    const next = theme === "dark" ? "light" : "dark";
    setTheme(next);
    document.documentElement.setAttribute("data-theme", next);
    localStorage.setItem("theme", next);
  };

  return (
    <header className="glass-header">
      <div className="header-content">
        <Link href="/" className="logo-link">
          <h1 className="logo">
            Scholar<span className="accent">.</span>
          </h1>
        </Link>
        <nav>
          <Link href="/" className="nav-link">맞춤 검색</Link>
          <Link href="/policies" className="nav-link">정책 전체보기</Link>
          <Link href="/announcements" className="nav-link">공지사항</Link>
          <Link href="/bookmarks" className="nav-link">내 보관함</Link>
          <button onClick={toggleTheme} className="theme-toggle" aria-label="테마 변경">
            {theme === "dark" ? "라이트 모드" : "다크 모드"}
          </button>
        </nav>
      </div>
    </header>
  );
}
