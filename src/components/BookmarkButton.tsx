"use client";

import { useBookmarks } from '@/hooks/useBookmarks';
import { useToast } from '@/components/Toast';

interface BookmarkButtonProps {
  id: string;
  title: string;
  desc: string;
  link: string;
  type: 'policy' | 'announcement';
}

export default function BookmarkButton({ id, title, desc, link, type }: BookmarkButtonProps) {
  const { isLoaded, isBookmarked, toggleBookmark } = useBookmarks();
  const { showToast } = useToast();

  if (!isLoaded) return null; // Hydration 렌더링 시 깜빡임 방지

  const bookmarked = isBookmarked(id);

  const handleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    toggleBookmark({ id, title, desc, link, type });

    if (!bookmarked) {
      showToast({
        message: `'${title.slice(0, 18)}${title.length > 18 ? '...' : ''}' 항목이 내 보관함에 저장되었습니다!`,
        type: 'bookmark',
        action: {
          label: '내 보관함 보기',
          href: '/bookmarks',
        },
      });
    } else {
      showToast({
        message: '보관함에서 삭제되었습니다.',
        type: 'info',
      });
    }
  };

  return (
    <button
      onClick={handleClick}
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
      title={bookmarked ? "보관함에서 제거" : "보관함에 저장"}
    >
      {bookmarked ? '❤️' : '🤍'}
    </button>
  );
}

