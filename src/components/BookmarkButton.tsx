"use client";

import { useBookmarks } from '@/hooks/useBookmarks';

interface BookmarkButtonProps {
  id: string;
  title: string;
  desc: string;
  link: string;
  type: 'policy' | 'announcement';
}

export default function BookmarkButton({ id, title, desc, link, type }: BookmarkButtonProps) {
  const { isLoaded, isBookmarked, toggleBookmark } = useBookmarks();

  if (!isLoaded) return null; // Hydration 렌더링 시 깜빡임 방지

  const bookmarked = isBookmarked(id);

  return (
    <button
      onClick={(e) => {
        e.preventDefault();
        e.stopPropagation();
        toggleBookmark({ id, title, desc, link, type });
      }}
      style={{
        background: 'transparent',
        border: 'none',
        cursor: 'pointer',
        fontSize: '20px',
        padding: '4px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        color: bookmarked ? '#ef4444' : 'var(--text-secondary)',
        transition: 'transform 0.2s',
      }}
      className="hover:scale-110"
      aria-label="북마크"
    >
      {bookmarked ? '❤️' : '🤍'}
    </button>
  );
}
