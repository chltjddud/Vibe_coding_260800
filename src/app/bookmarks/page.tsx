"use client";

import { useBookmarks } from '@/hooks/useBookmarks';
import Link from 'next/link';
import { Bookmark, Building, Calendar, ExternalLink } from 'lucide-react';
import BookmarkButton from '@/components/BookmarkButton';

export default function BookmarksPage() {
  const { bookmarks, isLoaded } = useBookmarks();

  if (!isLoaded) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] text-center">
        <p style={{ color: 'var(--text-secondary)' }}>내 보관함을 불러오는 중입니다...</p>
      </div>
    );
  }

  const policies = bookmarks.filter(b => b.type === 'policy');
  const announcements = bookmarks.filter(b => b.type === 'announcement');

  return (
    <div style={{ maxWidth: '1200px', margin: '40px auto', padding: '0 20px' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '40px' }}>
        <Bookmark className="w-8 h-8 text-blue-500" />
        <div>
          <h2 style={{ fontSize: '28px', fontWeight: 'bold', margin: '0' }}>내 보관함</h2>
          <p style={{ margin: '4px 0 0', color: 'var(--text-secondary)' }}>찜해둔 정책과 공지사항을 확인하세요.</p>
        </div>
      </div>

      {bookmarks.length === 0 ? (
        <div className="glass-card" style={{ padding: '60px 20px', textAlign: 'center' }}>
          <Bookmark className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <p style={{ color: 'var(--text-secondary)', fontSize: '16px' }}>아직 찜한 항목이 없습니다.<br/>맞춤 검색이나 정책 전체보기에서 마음에 드는 정책을 찜해보세요!</p>
          <Link href="/" className="btn-primary" style={{ display: 'inline-block', marginTop: '20px' }}>
            정책 찾아보기
          </Link>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '40px' }}>
          
          {/* 찜한 정책 섹션 */}
          {policies.length > 0 && (
            <section>
              <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '20px', borderBottom: '1px solid var(--glass-border)', paddingBottom: '12px' }}>
                저장된 청년 정책 ({policies.length})
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
                {policies.map(policy => (
                  <div key={policy.id} className="glass-card hover:border-[var(--accent-color)] transition-colors" style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <div style={{ flex: 1 }}>
                        <span style={{ fontSize: '12px', padding: '4px 10px', backgroundColor: 'rgba(255, 255, 255, 0.05)', color: 'var(--text-secondary)', borderRadius: '100px', display: 'inline-flex', alignItems: 'center', gap: '4px', marginBottom: '10px' }}>
                          <Building className="w-3 h-3" />
                          지원 정책
                        </span>
                        <h4 style={{ fontSize: '18px', fontWeight: 'bold', margin: '0', color: 'var(--text-primary)' }}>
                          {policy.title}
                        </h4>
                      </div>
                      <BookmarkButton 
                        id={policy.id}
                        title={policy.title}
                        desc={policy.desc}
                        link={policy.link}
                        type="policy"
                      />
                    </div>
                    
                    <p style={{ color: 'var(--text-secondary)', fontSize: '14px', margin: 0, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {policy.desc}
                    </p>
                    
                    <div style={{ marginTop: '8px' }}>
                      <a href={policy.link} target="_blank" rel="noopener noreferrer" style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '14px', color: 'var(--accent-color)', textDecoration: 'none', fontWeight: '500' }}>
                        자세히 보기 <ExternalLink className="w-4 h-4" />
                      </a>
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* 찜한 공지사항 섹션 */}
          {announcements.length > 0 && (
            <section>
              <h3 style={{ fontSize: '20px', fontWeight: 'bold', marginBottom: '20px', borderBottom: '1px solid var(--glass-border)', paddingBottom: '12px' }}>
                저장된 학교 공지사항 ({announcements.length})
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                {announcements.map(ann => (
                  <div key={ann.id} className="glass-card" style={{ padding: '16px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, overflow: 'hidden' }}>
                      <span style={{ fontSize: '12px', padding: '4px 8px', borderRadius: '4px', backgroundColor: 'rgba(255, 255, 255, 0.1)', color: 'var(--accent-color)', whiteSpace: 'nowrap', flexShrink: 0 }}>
                        {ann.desc} {/* desc is used for source_name in announcements */}
                      </span>
                      <a href={ann.link} target="_blank" rel="noopener noreferrer" style={{ fontWeight: '500', color: 'inherit', textDecoration: 'none', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }} className="hover:text-[var(--accent-color)] transition-colors">
                        {ann.title}
                      </a>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginLeft: '16px' }}>
                      <span style={{ color: 'var(--text-secondary)', fontSize: '12px' }}>
                        저장일: {ann.dateSaved.slice(0, 10).replace(/-/g, '.')}
                      </span>
                      <BookmarkButton 
                        id={ann.id}
                        title={ann.title}
                        desc={ann.desc}
                        link={ann.link}
                        type="announcement"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </section>
          )}

        </div>
      )}
    </div>
  );
}
