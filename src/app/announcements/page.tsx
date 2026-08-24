"use client";

import { useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { RefreshCw, Search, Sparkles, Building, Calendar, CheckCircle2 } from 'lucide-react';
import BookmarkButton from '@/components/BookmarkButton';
import AIAnalysisModal from '@/components/AIAnalysisModal';
import { useToast } from '@/components/Toast';

type Announcement = {
  id: string;
  source_id: string;
  source_name: string;
  title: string;
  link: string;
  posted_date: string;
  notice_num: number;
};

export default function AnnouncementsPage() {
  const { showToast } = useToast();
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(true);
  const [isSyncing, setIsSyncing] = useState(false);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);

  // 필터 상태 (기본적으로 모두 선택)
  const [filters, setFilters] = useState({
    ai: true,
    sw: true,
    main: true,
  });

  // 페이지네이션 상태
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  // AI 분석 모달 상태
  const [selectedAnn, setSelectedAnn] = useState<Announcement | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleAIAnalyze = (ann: Announcement) => {
    setSelectedAnn(ann);
    setIsModalOpen(true);
  };

  // 서버사이드에서 필터링된 데이터 가져오기
  const fetchAnnouncements = useCallback(async (page: number, activeFilters: typeof filters) => {
    setLoading(true);
    try {
      const selectedSources = Object.entries(activeFilters)
        .filter(([, v]) => v)
        .map(([k]) => k);

      const sourceParam = selectedSources.length > 0 ? `&source=${selectedSources.join(',')}` : '';
      const res = await fetch(`/api/announcements?page=${page}&limit=${itemsPerPage}${sourceParam}`);
      const json = await res.json();

      if (json.success) {
        setAnnouncements(json.data || []);
        setTotal(json.total || 0);
        setTotalPages(json.totalPages || 1);
      }
    } catch (err) {
      console.error("Failed to fetch announcements", err);
    } finally {
      setLoading(false);
    }
  }, [itemsPerPage]);

  // 필터 또는 페이지 변경 시 재요청
  useEffect(() => {
    fetchAnnouncements(currentPage, filters);
  }, [currentPage, filters, fetchAnnouncements]);

  // 필터 토글 핸들러
  const toggleFilter = (key: keyof typeof filters) => {
    const newFilters = { ...filters, [key]: !filters[key] };
    setFilters(newFilters);
    setCurrentPage(1); // 필터가 바뀌면 1페이지로 리셋
  };

  // 페이지 변경
  const goToPage = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // 표시할 페이지 번호 목록 (최대 10개)
  const pageNumbers = (() => {
    const delta = 4;
    const start = Math.max(1, currentPage - delta);
    const end = Math.min(totalPages, currentPage + delta);
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  })();

  // 최신 공지사항 수동 실시간 동기화
  const handleSyncNow = async () => {
    if (isSyncing) return;
    setIsSyncing(true);
    showToast({
      message: '순천대 공지사항 크롤링 및 Supabase 동기화를 시작합니다...',
      type: 'info',
    });

    try {
      const res = await fetch('/api/cron/scrape', { method: 'POST' });
      const data = await res.json();
      if (data.success) {
        showToast({
          message: data.message || '최신 공지사항이 Supabase에 성공적으로 갱신되었습니다!',
          type: 'success',
        });
        // 최신 목록 다시 불러오기
        await fetchAnnouncements(currentPage, filters);
      } else {
        showToast({
          message: `동기화 완료 (일부 오류): ${data.message}`,
          type: 'info',
        });
      }
    } catch (err: any) {
      showToast({
        message: '동기화 요청 중 오류가 발생했습니다.',
        type: 'info',
      });
    } finally {
      setIsSyncing(false);
    }
  };

  return (
    <div style={{ maxWidth: '1000px', margin: '0 auto', padding: '20px 12px', width: '100%', boxSizing: 'border-box' }}>
      <div style={{ marginBottom: '24px' }}>
        <Link href="/" style={{ color: 'var(--text-secondary)', textDecoration: 'none', fontSize: '13px', display: 'inline-block', marginBottom: '12px' }}>
          ← 메인으로 돌아가기
        </Link>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: '16px', marginBottom: '8px' }}>
          <div style={{ flex: 1, minWidth: '240px' }}>
            <h1 style={{ fontSize: 'clamp(22px, 4vw, 32px)', fontWeight: '700', margin: '0 0 8px 0', wordBreak: 'keep-all', lineHeight: '1.3' }}>
              학교 주요 공지사항 전체보기
            </h1>
            <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '14px', wordBreak: 'keep-all' }}>
              학교 본부, SW중심대학, AI인재양성 사업단의 공지사항을 한 곳에서 모아보세요.
              {!loading && <span style={{ marginLeft: '8px' }}>총 <strong>{total}</strong>개</span>}
            </p>
          </div>
          <button
            onClick={handleSyncNow}
            disabled={isSyncing}
            className="sync-btn"
            title="순천대 최신 공지사항을 지금 즉시 스크래핑하여 Supabase에 저장합니다."
            style={{ flexShrink: 0 }}
          >
            <RefreshCw className={`w-4 h-4 text-blue-400 ${isSyncing ? 'animate-spin' : ''}`} />
            <span>{isSyncing ? '동기화 중...' : '최신 공지 동기화'}</span>
          </button>
        </div>
      </div>

      {/* 필터 영역 */}
      <div className="glass-card" style={{ marginBottom: '24px', padding: '16px 20px', display: 'flex', gap: '20px', flexWrap: 'wrap', alignItems: 'center' }}>
        <span style={{ fontWeight: '600', fontSize: '14px' }}>출처 필터:</span>
        {([
          { key: 'main', label: '학교 메인 공지' },
          { key: 'ai', label: 'AI인재양성' },
          { key: 'sw', label: 'SW중심대학' },
        ] as const).map(({ key, label }) => (
          <label key={key} style={{ display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', userSelect: 'none', fontSize: '14px' }}>
            <input
              type="checkbox"
              checked={filters[key]}
              onChange={() => toggleFilter(key)}
              style={{ width: '16px', height: '16px', accentColor: 'var(--accent-color)' }}
            />
            {label}
          </label>
        ))}
      </div>

      {/* 목록 영역 */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', minHeight: '400px' }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-secondary)' }}>
            공지사항을 불러오는 중입니다...
          </div>
        ) : announcements.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '60px 0', color: 'var(--text-secondary)' }}>
            선택된 출처의 공지사항이 없습니다.
          </div>
        ) : (
          announcements.map(ann => (
            <div key={ann.id} className="glass-card announcement-row">
              <div className="announcement-main">
                <span className="announcement-source">
                  {ann.source_name}
                </span>
                <a
                  href={ann.link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="announcement-title"
                >
                  {ann.title}
                </a>
              </div>
              <div className="announcement-actions">
                <span className="announcement-date">
                  {ann.posted_date ? ann.posted_date.replace(/-/g, '.').slice(0, 10) : '-'}
                </span>
                <button
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleAIAnalyze(ann); }}
                  className="ai-analyze-btn"
                >
                  <Sparkles className="w-3 h-3" /> AI 분석
                </button>
                <BookmarkButton 
                  id={ann.id.toString()}
                  title={ann.title}
                  desc={ann.source_name}
                  link={ann.link}
                  type="announcement"
                />
              </div>
            </div>
          ))
        )}
      </div>

      {/* 페이지네이션 컨트롤 */}
      {!loading && totalPages > 1 && (
        <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '40px', flexWrap: 'wrap' }}>
          <button
            onClick={() => goToPage(Math.max(1, currentPage - 1))}
            disabled={currentPage === 1}
            style={{
              padding: '8px 16px', borderRadius: '8px',
              border: '1px solid rgba(255,255,255,0.1)', background: 'transparent',
              color: currentPage === 1 ? 'var(--text-secondary)' : 'var(--text-primary)',
              cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
            }}
          >
            이전
          </button>

          <div style={{ display: 'flex', gap: '4px', alignItems: 'center' }}>
            {pageNumbers.map(page => (
              <button
                key={page}
                onClick={() => goToPage(page)}
                style={{
                  width: '36px', height: '36px', borderRadius: '8px', border: 'none',
                  background: currentPage === page ? 'var(--accent-color)' : 'transparent',
                  color: currentPage === page ? '#fff' : 'var(--text-primary)',
                  fontWeight: currentPage === page ? 'bold' : 'normal',
                  cursor: 'pointer',
                }}
              >
                {page}
              </button>
            ))}
          </div>

          <button
            onClick={() => goToPage(Math.min(totalPages, currentPage + 1))}
            disabled={currentPage === totalPages}
            style={{
              padding: '8px 16px', borderRadius: '8px',
              border: '1px solid rgba(255,255,255,0.1)', background: 'transparent',
              color: currentPage === totalPages ? 'var(--text-secondary)' : 'var(--text-primary)',
              cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
            }}
          >
            다음
          </button>
        </div>
      )}
      {/* AI 모달 */}
      <AIAnalysisModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        announcement={selectedAnn}
      />
    </div>
  );
}
