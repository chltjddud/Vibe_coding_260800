"use client";

import { useState, useEffect } from 'react';

export interface Bookmark {
  id: string;
  title: string;
  desc: string;
  link: string;
  type: 'policy' | 'announcement';
  dateSaved: string;
}

export function useBookmarks() {
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);
  const [isLoaded, setIsLoaded] = useState(false);

  // 컴포넌트 마운트 시 로컬스토리지에서 찜 목록 불러오기
  useEffect(() => {
    const saved = localStorage.getItem('scholar_bookmarks');
    if (saved) {
      try {
        setBookmarks(JSON.parse(saved));
      } catch (e) {
        console.error('Failed to parse bookmarks:', e);
      }
    }
    setIsLoaded(true);
  }, []);

  // 북마크 상태가 변경될 때마다 로컬스토리지에 저장
  useEffect(() => {
    if (isLoaded) {
      localStorage.setItem('scholar_bookmarks', JSON.stringify(bookmarks));
    }
  }, [bookmarks, isLoaded]);

  const addBookmark = (bookmark: Omit<Bookmark, 'dateSaved'>) => {
    setBookmarks(prev => {
      // 이미 존재하는지 확인
      if (prev.some(b => b.id === bookmark.id)) return prev;
      return [{ ...bookmark, dateSaved: new Date().toISOString() }, ...prev];
    });
  };

  const removeBookmark = (id: string) => {
    setBookmarks(prev => prev.filter(b => b.id !== id));
  };

  const isBookmarked = (id: string) => {
    return bookmarks.some(b => b.id === id);
  };

  const toggleBookmark = (bookmark: Omit<Bookmark, 'dateSaved'>) => {
    if (isBookmarked(bookmark.id)) {
      removeBookmark(bookmark.id);
    } else {
      addBookmark(bookmark);
    }
  };

  return {
    bookmarks,
    isLoaded,
    addBookmark,
    removeBookmark,
    isBookmarked,
    toggleBookmark
  };
}
