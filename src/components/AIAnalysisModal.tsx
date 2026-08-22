"use client";

import { useState, useEffect } from 'react';
import { Sparkles, X, RefreshCw, Copy, Check } from 'lucide-react';
import { useToast } from '@/components/Toast';

import type { Announcement } from '@/lib/supabase';

interface AIAnalysisModalProps {
  isOpen: boolean;
  onClose: () => void;
  announcement: Announcement | null;
}

export default function AIAnalysisModal({ isOpen, onClose, announcement }: AIAnalysisModalProps) {
  const { showToast } = useToast();
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [aiResult, setAiResult] = useState<any>(null);
  const [aiError, setAiError] = useState<string | null>(null);
  const [recommendedPolicies, setRecommendedPolicies] = useState<any[]>([]);
  const [isCopied, setIsCopied] = useState(false);

  useEffect(() => {
    if (isOpen && announcement) {
      handleAIAnalyze(announcement);
    } else {
      setAiResult(null);
      setAiError(null);
      setRecommendedPolicies([]);
      setIsAnalyzing(false);
    }
  }, [isOpen, announcement]);

  const handleAIAnalyze = async (ann: Announcement) => {
    setIsAnalyzing(true);
    setAiResult(null);
    setAiError(null);
    setRecommendedPolicies([]);

    try {
      const res = await fetch('/api/announcements/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ link: ann.link || ann.source_url || '', title: ann.title })
      });
      
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || '분석 실패');
      
      setAiResult(data);

      // 하이브리드 추천 로직: 첫 번째 키워드로 정책 검색
      if (data.keywords && data.keywords.length > 0) {
        const keyword = data.keywords[0];
        const policyRes = await fetch(`/api/policies?keyword=${encodeURIComponent(keyword)}`);
        const policyData = await policyRes.json();
        
        if (policyData?.ResultVO?.result?.youthPolicyList) {
          let list = policyData.ResultVO.result.youthPolicyList;
          list = Array.isArray(list) ? list : [list];
          setRecommendedPolicies(list.slice(0, 2)); // 상위 2개만 추출
        }
      }
    } catch (err: any) {
      setAiError(err.message);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleCopySummary = async () => {
    if (!aiResult || !announcement) return;

    const copyText = `📌 [Scholar AI 공지 요약]
제목: ${announcement.title}
⏰ 마감일: ${aiResult.deadline || '일정 확인 필요'}
🎯 지원대상: ${aiResult.target || '해당자'}
📝 핵심요약:
${aiResult.summary}

🔗 원문 링크: ${announcement.link || announcement.source_url || ''}`;

    try {
      await navigator.clipboard.writeText(copyText);
      setIsCopied(true);
      showToast({
        message: 'AI 공지 요약이 클립보드에 복사되었습니다!',
        type: 'success',
      });
      setTimeout(() => setIsCopied(false), 2500);
    } catch (err) {
      showToast({
        message: '클립보드 복사에 실패했습니다.',
        type: 'info',
      });
    }
  };

  if (!isOpen || !announcement) return null;

  return (
    <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, backgroundColor: 'rgba(0,0,0,0.7)', zIndex: 9999, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '20px' }} onClick={onClose}>
      <div style={{ width: '100%', maxWidth: '600px', padding: '0', overflow: 'hidden', position: 'relative', display: 'flex', flexDirection: 'column', maxHeight: '90vh', backgroundColor: 'var(--bg-color)', borderRadius: 'var(--radius-lg)', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)', border: '1px solid var(--glass-border)' }} onClick={e => e.stopPropagation()}>
        <div style={{ padding: '20px', borderBottom: '1px solid var(--glass-border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', backgroundColor: 'rgba(255, 255, 255, 0.03)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Sparkles className="w-5 h-5 text-blue-400" />
            <h3 style={{ margin: 0, fontSize: '18px', fontWeight: 'bold', color: 'var(--text-primary)' }}>AI 공지사항 분석</h3>
          </div>
          <button onClick={onClose} style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', padding: '4px' }} className="hover:text-white transition-colors">
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div style={{ padding: '24px', overflowY: 'auto' }}>
          <h4 style={{ margin: '0 0 16px 0', fontSize: '16px', lineHeight: 1.4 }}>{announcement.title}</h4>
          
          {isAnalyzing ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', padding: '40px 0', gap: '16px' }}>
              <RefreshCw className="w-8 h-8 text-blue-400 animate-spin" />
              <p style={{ color: 'var(--text-secondary)' }}>AI가 웹페이지 본문을 읽고 분석 중입니다...</p>
            </div>
          ) : aiError ? (
            <div style={{ padding: '20px', background: 'rgba(239, 68, 68, 0.1)', color: '#ef4444', borderRadius: '8px', textAlign: 'center' }}>
              {aiError}
            </div>
          ) : aiResult ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
              <div style={{ background: 'rgba(255,255,255,0.03)', padding: '16px', borderRadius: '8px', border: '1px solid var(--glass-border)' }}>
                <div style={{ marginBottom: '12px' }}>
                  <span style={{ fontSize: '13px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>신청 기한 / 마감일</span>
                  <strong style={{ fontSize: '15px' }}>{aiResult.deadline}</strong>
                </div>
                <div style={{ marginBottom: '12px' }}>
                  <span style={{ fontSize: '13px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>지원 대상</span>
                  <strong style={{ fontSize: '15px' }}>{aiResult.target}</strong>
                </div>
                <div>
                  <span style={{ fontSize: '13px', color: 'var(--text-secondary)', display: 'block', marginBottom: '4px' }}>핵심 요약</span>
                  <p style={{ margin: 0, fontSize: '15px', lineHeight: 1.5 }}>{aiResult.summary}</p>
                </div>
              </div>

              {recommendedPolicies.length > 0 && (
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '12px' }}>
                    <h4 style={{ margin: 0, fontSize: '15px', fontWeight: 'bold' }}>연관 국가 청년 정책 추천</h4>
                    <span style={{ fontSize: '11px', background: 'var(--accent-color)', color: 'white', padding: '2px 6px', borderRadius: '4px' }}>매칭 완료</span>
                  </div>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                    {recommendedPolicies.map(policy => (
                      <div key={policy.bizId || policy.plcyNm} style={{ background: 'rgba(255,255,255,0.05)', padding: '16px', borderRadius: '8px', border: '1px solid rgba(59, 130, 246, 0.3)' }}>
                        <div style={{ display: 'flex', gap: '8px', marginBottom: '8px' }}>
                          <span style={{ fontSize: '11px', padding: '2px 6px', backgroundColor: 'rgba(255, 255, 255, 0.1)', color: 'var(--text-secondary)', borderRadius: '4px' }}>
                            {policy.lclsfNm}
                          </span>
                        </div>
                        <h5 style={{ margin: '0 0 8px 0', fontSize: '14px', color: 'var(--text-primary)' }}>{policy.plcyNm}</h5>
                        <p style={{ margin: '0 0 12px 0', fontSize: '12px', color: 'var(--text-secondary)', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>{policy.plcyExplnCn || policy.plcySprtCn}</p>
                        <a href={policy.aplyUrlAddr || policy.refUrlAddr1 || '#'} target="_blank" rel="noopener noreferrer" style={{ fontSize: '12px', color: 'var(--accent-color)', textDecoration: 'none', fontWeight: 'bold' }}>자세히 보기 →</a>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '10px', marginTop: '10px', flexWrap: 'wrap' }}>
                <button
                  onClick={handleCopySummary}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '6px',
                    padding: '10px 16px',
                    borderRadius: '8px',
                    background: isCopied ? 'rgba(16, 185, 129, 0.2)' : 'var(--glass-bg)',
                    border: `1px solid ${isCopied ? 'rgba(16, 185, 129, 0.5)' : 'var(--glass-border)'}`,
                    color: isCopied ? '#34d399' : 'var(--text-primary)',
                    fontSize: '14px',
                    fontWeight: '600',
                    cursor: 'pointer',
                    transition: 'all 0.2s ease',
                  }}
                  className="hover:scale-105"
                >
                  {isCopied ? (
                    <>
                      <Check className="w-4 h-4 text-emerald-400" />
                      <span>요약 복사완료!</span>
                    </>
                  ) : (
                    <>
                      <Copy className="w-4 h-4 text-blue-400" />
                      <span>요약 내용 복사</span>
                    </>
                  )}
                </button>

                <a href={announcement.link || announcement.source_url || '#'} target="_blank" rel="noopener noreferrer" className="btn-primary" style={{ padding: '10px 20px', textDecoration: 'none', width: 'auto', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
                  공지사항 원문 보기
                </a>
              </div>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
}
