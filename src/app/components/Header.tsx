"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Search, Compass, Bell, Bookmark, Sun, Moon } from "lucide-react";

export default function Header() {
  const [theme, setTheme] = useState<"dark" | "light">("dark");
  const pathname = usePathname();

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

  const navLinks = [
    { href: "/", label: "맞춤 검색", icon: Search },
    { href: "/policies", label: "정책 전체보기", icon: Compass },
    { href: "/announcements", label: "공지사항", icon: Bell },
    { href: "/bookmarks", label: "내 보관함", icon: Bookmark },
  ];

  return (
    <header className="glass-header">
      <div className="header-content">
        <Link href="/" className="logo-link">
          <h1 className="logo">
            Scholar<span className="accent">.</span>
          </h1>
        </Link>
        <nav className="header-nav">
          {navLinks.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href;
            return (
              <Link
                key={href}
                href={href}
                className={`nav-link ${isActive ? "active" : ""}`}
              >
                <Icon className="w-4 h-4 nav-icon" />
                <span>{label}</span>
              </Link>
            );
          })}
          <button
            onClick={toggleTheme}
            className="theme-toggle"
            aria-label="테마 변경"
            title={theme === "dark" ? "라이트 모드로 전환" : "다크 모드로 전환"}
          >
            {theme === "dark" ? (
              <>
                <Sun className="w-4 h-4 text-amber-400" />
                <span className="theme-toggle-text">라이트</span>
              </>
            ) : (
              <>
                <Moon className="w-4 h-4 text-blue-500" />
                <span className="theme-toggle-text">다크</span>
              </>
            )}
          </button>
        </nav>
      </div>
    </header>
  );
}

