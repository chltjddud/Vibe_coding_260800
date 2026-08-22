"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Search, Building, Calendar, ChevronRight, Sparkles } from 'lucide-react';
import RegionSelect from '@/components/RegionSelect';
import BookmarkButton from '@/components/BookmarkButton';
import AIAnalysisModal from '@/components/AIAnalysisModal';
import type { Announcement } from "@/lib/supabase";

const REGION_CODES = [
  { code: '', name: '전국' },
  { code: '51000', name: '강원특별자치도' },
  { code: '41000', name: '경기도' },
  { code: '48000', name: '경상남도' },
  { code: '47000', name: '경상북도' },
  { code: '27000', name: '대구광역시' },
  { code: '30000', name: '대전광역시' },
  { code: '26000', name: '부산광역시' },
  { code: '11000', name: '서울특별시' },
  { code: '36110', name: '세종특별자치시' },
  { code: '31000', name: '울산광역시' },
  { code: '28000', name: '인천광역시' },
  { code: '12000', name: '전남광주통합특별시' },
  { code: '52000', name: '전북특별자치도' },
  { code: '50000', name: '제주특별자치도' },
  { code: '44000', name: '충청남도' },
  { code: '43000', name: '충청북도' },
];

const CATEGORIES = [
  { value: '', name: '전체 분야' },
  { value: '일자리', name: '일자리' },
  { value: '주거', name: '주거' },
  { value: '교육', name: '교육' },
  { value: '복지.문화', name: '복지·문화' },
  { value: '참여.권리', name: '참여·권리' },
];

export default function Home() {
  const [keyword, setKeyword] = useState("");
  const [zipCd, setZipCd] = useState("");
  const [age, setAge] = useState("");
  const [category, setCategory] = useState("");
  const [job, setJob] = useState("");
  
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [previewPolicies, setPreviewPolicies] = useState<any[]>([]);
  const [hasSearched, setHasSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [aiLoading, setAiLoading] = useState(false);
  const [aiRecommendations, setAiRecommendations] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'normal' | 'ai'>('normal');
  const [situation, setSituation] = useState('');
  const [selectedAIKeyword, setSelectedAIKeyword] = useState('');
  const [customAIKeyword, setCustomAIKeyword] = useState('');
  const [progressMsg, setProgressMsg] = useState('상황 분석 중...');
  const router = useRouter();

  // AI 분석 모달 상태
  const [selectedAnn, setSelectedAnn] = useState<Announcement | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const handleAIAnalyze = (ann: Announcement) => {
    setSelectedAnn(ann);
    setIsModalOpen(true);
  };

  useEffect(() => {
    const fetchAnnouncements = async () => {
      try {
        const res = await fetch('/api/announcements');
        const json = await res.json();
        if (json.data) {
          setAnnouncements(json.data);
        }
      } catch (err) {
        console.error("Failed to fetch announcements", err);
      }
    };
    fetchAnnouncements();
  }, []);

  const buildQueryString = () => {
    const params = new URLSearchParams();
    if (keyword.trim()) params.append('keyword', keyword.trim());
    if (zipCd) params.append('zipCd', zipCd);
    if (age) params.append('age', age);
    if (category) params.append('category', category);
    if (job) params.append('job', job);
    return params.toString();
  };

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setHasSearched(true);
    
    try {
      const qs = buildQueryString();
      const res = await fetch(`/api/policies?${qs}`);
      const data = await res.json();
      
      let foundPolicies: any[] = [];
      if (data && data.ResultVO && data.ResultVO.result && data.ResultVO.result.youthPolicyList) {
        const list = data.ResultVO.result.youthPolicyList;
        foundPolicies = Array.isArray(list) ? list : [list];
      }
      
      setPreviewPolicies(foundPolicies.slice(0, 6));
    } catch (err) {
      console.error("Error fetching policies preview:", err);
      alert("데이터를 불러오는 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  const handleViewAll = () => {
    const qs = buildQueryString();
    router.push(`/policies?${qs}`);
  };

  const handleAIRecommend = async () => {
    if (!situation.trim()) {
      alert("현재 상황을 입력해 주세요.");
      return;
    }
    setAiLoading(true);
    setAiRecommendations([]);
    setProgressMsg("상황 분석 중...");
    
    const messages = ["상황 분석 중...", "관련 정책 탐색 중...", "최적의 정책 선정 중...", "추천 이유 작성 중..."];
    let msgIndex = 0;
    const interval = setInterval(() => {
      msgIndex = (msgIndex + 1) % messages.length;
      setProgressMsg(messages[msgIndex]);
    }, 2500);

    try {
      const params = new URLSearchParams();
      if (zipCd) params.append('zipCd', zipCd);
      if (age) params.append('age', age);
      
      const finalKeyword = selectedAIKeyword === '기타' ? customAIKeyword : selectedAIKeyword;
      if (finalKeyword) params.append('keyword', finalKeyword);
      params.append('titleOnly', 'false');
      
      const fetchRes = await fetch(`/api/policies?${params.toString()}`);
      const fetchData = await fetchRes.json();
      
      let candidatePolicies: any[] = [];
      if (fetchData && fetchData.ResultVO && fetchData.ResultVO.result && fetchData.ResultVO.result.youthPolicyList) {
        const list = fetchData.ResultVO.result.youthPolicyList;
        candidatePolicies = Array.isArray(list) ? list : [list];
      }
      
      const userProfile = { age, zipCd };
      
      const res = await fetch('/api/recommendations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userProfile, situation, keyword: finalKeyword, policies: candidatePolicies.slice(0, 50) })
      });
      const data = await res.json();
      if (data.error) {
        alert(data.error);
      } else {
        setAiRecommendations(data.recommendations || []);
      }
    } catch (err) {
      console.error(err);
      alert("AI 추천 중 오류가 발생했습니다.");
    } finally {
      clearInterval(interval);
      setAiLoading(false);
    }
  };

  return (
    <>
      <section className="hero" id="search">
        <h2 className="hero-title">내게 딱 맞는 청년 정책 찾기</h2>
        <p className="hero-subtitle">
          핵심 정보만 입력하고 나에게 꼭 맞는 지원 정책과 혜택을 1초만에 찾아보세요.
        </p>

        <div style={{ display: 'flex', gap: '8px', justifyContent: 'center', marginBottom: '24px' }}>
          <button 
            type="button"
            className={activeTab === 'normal' ? 'btn-primary' : 'glass-card'} 
            style={{ padding: '12px 24px', flex: 1, maxWidth: '200px' }}
            onClick={() => { setActiveTab('normal'); setAiRecommendations([]); }}
          >
            일반 맞춤 검색
          </button>
          <button 
            type="button"
            className={activeTab === 'ai' ? 'btn-primary' : 'glass-card'} 
            style={{ padding: '12px 24px', flex: 1, maxWidth: '200px', background: activeTab === 'ai' ? 'linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%)' : '', color: activeTab === 'ai' ? 'white' : '' }}
            onClick={() => { setActiveTab('ai'); setHasSearched(false); }}
          >
            AI 상황 맞춤 추천
          </button>
        </div>

        <form className="glass-card" style={{ maxWidth: '720px', margin: '0 auto' }} onSubmit={activeTab === 'normal' ? handleSearch : (e) => { e.preventDefault(); handleAIRecommend(); }}>
          {activeTab === 'normal' ? (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
              <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '-8px' }}>
                <button 
                  type="button" 
                  onClick={handleViewAll} 
                  style={{ background: 'transparent', border: 'none', color: 'var(--accent-color)', fontSize: '14px', fontWeight: '600', cursor: 'pointer', transition: 'opacity 0.2s' }}
                  className="hover:opacity-80"
                >
                  더 많은 조건으로 찾기(상세 필터) →
                </button>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px', textAlign: 'left' }}>
                <div className="flex gap-3 items-center">
                  <label className="form-label" style={{ whiteSpace: 'nowrap', margin: 0, minWidth: '65px' }}>거주 지역</label>
                  <div style={{ flex: 1 }}>
                    <RegionSelect options={REGION_CODES} value={zipCd} onChange={setZipCd} />
                  </div>
                </div>
                
                <div className="flex gap-3 items-center">
                  <label className="form-label" style={{ whiteSpace: 'nowrap', margin: 0, minWidth: '65px' }}>나이 (만)</label>
                  <div style={{ flex: 1 }}>
                    <input 
                      type="number" 
                      className="form-input w-full" 
                      placeholder="예: 25"
                      value={age}
                      onChange={(e) => setAge(e.target.value)}
                    />
                  </div>
                </div>

                <div className="flex gap-3 items-center">
                  <label className="form-label" style={{ whiteSpace: 'nowrap', margin: 0, minWidth: '65px' }}>취업 상태</label>
                  <div style={{ flex: 1 }}>
                    <select className="form-select w-full" value={job} onChange={(e) => setJob(e.target.value)}>
                      <option value="">전체 (선택 안함)</option>
                      <option value="미취업자">미취업자 (구직자)</option>
                      <option value="재직자">재직자</option>
                      <option value="창업자">창업자 (예비창업자)</option>
                      <option value="단기근로자">단기근로자 (프리랜서 등)</option>
                      <option value="농어업인">농어업인</option>
                    </select>
                  </div>
                </div>

                <div className="flex gap-3 items-center">
                  <label className="form-label" style={{ whiteSpace: 'nowrap', margin: 0, minWidth: '65px' }}>관심 분야</label>
                  <div style={{ flex: 1 }}>
                    <select className="form-select w-full" value={category} onChange={(e) => setCategory(e.target.value)}>
                      {CATEGORIES.map(cat => (
                        <option key={cat.value} value={cat.value}>{cat.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
              </div>

              <div style={{ display: 'flex', gap: '16px', alignItems: 'center', textAlign: 'left', marginTop: '4px' }}>
                <label className="form-label" style={{ whiteSpace: 'nowrap', margin: 0 }}>키워드 검색</label>
                <textarea 
                  className="form-input" 
                  style={{ flex: 1, height: '48px', boxSizing: 'border-box', resize: 'none' }}
                  placeholder="예: 전세금, 자격증, 면접"
                  value={keyword}
                  onChange={(e) => setKeyword(e.target.value)}
                />
              </div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '20px', textAlign: 'left', width: '100%' }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
                <div className="flex gap-3 items-center">
                  <label className="form-label" style={{ whiteSpace: 'nowrap', margin: 0, minWidth: '65px' }}>거주 지역</label>
                  <div style={{ flex: 1 }}>
                    <RegionSelect options={REGION_CODES} value={zipCd} onChange={setZipCd} />
                  </div>
                </div>
                
                <div className="flex gap-3 items-center">
                  <label className="form-label" style={{ whiteSpace: 'nowrap', margin: 0, minWidth: '65px' }}>나이 (만)</label>
                  <div style={{ flex: 1 }}>
                    <input 
                      type="number" 
                      className="form-input w-full" 
                      placeholder="예: 25"
                      value={age}
                      onChange={(e) => setAge(e.target.value)}
                    />
                  </div>
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="form-label">관심 키워드 선택 (추천 속도 UP)</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', alignItems: 'center' }}>
                  {['월세', '전세', '취업', '면접', '자격증', '창업', '심리상담', '기타'].map(kw => (
                    <button
                      key={kw}
                      type="button"
                      onClick={() => setSelectedAIKeyword(selectedAIKeyword === kw ? '' : kw)}
                      style={{
                        padding: '6px 14px',
                        borderRadius: '20px',
                        border: selectedAIKeyword === kw ? '1px solid var(--accent-color)' : '1px solid rgba(255,255,255,0.1)',
                        background: selectedAIKeyword === kw ? 'rgba(255, 107, 107, 0.1)' : 'transparent',
                        color: selectedAIKeyword === kw ? 'var(--accent-color)' : 'var(--text-secondary)',
                        fontSize: '14px',
                        fontWeight: selectedAIKeyword === kw ? '600' : '400',
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                    >
                      #{kw}
                    </button>
                  ))}
                  {selectedAIKeyword === '기타' && (
                    <input 
                      type="text" 
                      className="form-input" 
                      placeholder="키워드 직접 입력"
                      value={customAIKeyword}
                      onChange={(e) => setCustomAIKeyword(e.target.value)}
                      style={{ padding: '4px 12px', height: '34px', borderRadius: '16px', fontSize: '14px', width: '130px' }}
                    />
                  )}
                </div>
              </div>

              <div className="flex flex-col gap-1" style={{ width: '100%' }}>
                <label className="form-label">현재 상황 및 고민</label>
                <textarea 
                  className="form-input" 
                  placeholder="예: 25살 대학생인데 월세가 너무 비싸서 주거비 지원을 받고 싶어요."
                  value={situation}
                  onChange={(e) => setSituation(e.target.value)}
                  style={{ width: '100%', resize: 'none', height: '120px', padding: '16px', boxSizing: 'border-box' }}
                />
              </div>
            </div>
          )}
          
          {activeTab === 'normal' ? (
            <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '20px' }} disabled={loading}>
              {loading ? '맞춤형 정책 찾는 중...' : '맞춤형 정책 조회하기'}
            </button>
          ) : (
            <button 
              type="submit" 
              style={{ 
                width: '100%', 
                marginTop: '20px', 
                padding: '16px', 
                background: 'linear-gradient(135deg, #FF6B6B 0%, #FF8E53 100%)', 
                color: 'white', 
                fontWeight: 'bold', 
                border: 'none', 
                borderRadius: '12px', 
                cursor: 'pointer',
                opacity: aiLoading ? 0.7 : 1,
                transition: 'opacity 0.2s'
              }} 
              disabled={aiLoading}
            >
              {aiLoading ? progressMsg : 'AI 맞춤 정책 추천받기'}
            </button>
          )}
        </form>
      </section>

      {aiLoading && (
        <section style={{ marginTop: '40px', maxWidth: '800px', margin: '40px auto 0' }}>
          <div className="glass-card" style={{ padding: '32px', textAlign: 'center', border: '1px solid var(--accent-color)' }}>
            <h3 style={{ color: 'var(--accent-color)', marginBottom: '16px', fontSize: '20px', fontWeight: 'bold' }}>AI가 최적의 정책을 분석하고 있습니다</h3>
            <p style={{ color: 'var(--text-secondary)', fontWeight: '500' }}>{progressMsg}</p>
          </div>
        </section>
      )}

      {aiRecommendations.length > 0 && !aiLoading && (
        <section style={{ marginTop: '40px', maxWidth: '800px', margin: '40px auto 0' }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px', gap: '8px' }}>
            <h3 style={{ fontSize: '24px', fontWeight: '600', color: 'var(--accent-color)' }}>
              AI 추천 맞춤 정책 Top 3
            </h3>
          </div>
          <div className="results-grid" style={{ gridTemplateColumns: '1fr' }}>
            {aiRecommendations.map((rec, idx) => {
              return (
                <div key={idx} className="glass-card" style={{ padding: '24px', borderLeft: '4px solid var(--accent-color)' }}>
                  <h4 style={{ fontSize: '18px', fontWeight: 'bold', marginBottom: '12px' }}>{rec.plcyNm}</h4>
                  <div style={{ padding: '16px', background: 'rgba(255,255,255,0.03)', borderRadius: '8px', marginBottom: '16px' }}>
                    <p style={{ color: 'var(--text-primary)', lineHeight: '1.6', marginBottom: '8px' }}><strong>추천 이유:</strong> {rec.reason}</p>
                    {rec.conditions && (
                      <p style={{ color: '#F87171', fontSize: '14px', lineHeight: '1.5' }}><strong>제한 사항 / 가능 조건:</strong> {rec.conditions}</p>
                    )}
                  </div>
                  {rec.url && rec.url !== '#' && (
                    <a 
                      href={rec.url} 
                      target="_blank"
                      rel="noopener noreferrer"
                      className="result-link"
                    >
                      상세보기 페이지로 이동 →
                    </a>
                  )}
                </div>
              );
            })}
          </div>
        </section>
      )}

      {hasSearched && (
        <section style={{ marginTop: '20px', maxWidth: '800px', margin: '40px auto 0' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
            <h3 style={{ fontSize: '24px', fontWeight: '600' }}>
              검색 결과 미리보기 <span className="accent">{previewPolicies.length}건</span>
            </h3>
            <button 
              onClick={handleViewAll}
              style={{ color: 'var(--accent-color)', background: 'transparent', border: 'none', cursor: 'pointer', fontSize: '15px', fontWeight: '600' }}
            >
              상세 필터 및 전체 보기 →
            </button>
          </div>
          
          {loading ? (
            <div className="glass-card" style={{ textAlign: 'center', padding: '40px' }}>
              <p style={{ color: 'var(--text-secondary)' }}>정책을 찾고 있습니다...</p>
            </div>
          ) : previewPolicies.length === 0 ? (
            <div className="glass-card" style={{ textAlign: 'center', padding: '40px' }}>
              <p style={{ color: 'var(--text-secondary)' }}>입력하신 조건에 맞는 정책이 없습니다.</p>
            </div>
          ) : (
            <div className="results-grid">
              {previewPolicies.map((policy, idx) => (
                <div key={idx} className="glass-card result-card">
                  <span className="result-badge policy">
                    {policy.lclsfNm || '지원정책'}
                  </span>
                  <h4 className="result-title" style={{ marginTop: '12px' }}>{policy.plcyNm || '정책명 없음'}</h4>
                  <p className="result-desc" style={{ display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                    {policy.plcyExplnCn || policy.plcySprtCn || '정책 소개가 없습니다.'}
                  </p>
                  <div className="result-meta">
                    <span>• 기관: {policy.sprvsnInstCdNm || policy.operInstCdNm || '기관명 없음'}</span>
                    {policy.aplyYmd && <span>• 마감일: {policy.aplyYmd}</span>}
                  </div>
                  <a 
                    href={policy.aplyUrlAddr || policy.refUrlAddr1 || '#'} 
                    target="_blank"
                    rel="noopener noreferrer"
                    className="result-link"
                  >
                    자세히 보기 →
                  </a>
                </div>
              ))}
            </div>
          )}
          {previewPolicies.length > 0 && (
            <button 
              onClick={handleViewAll}
              className="glass-card hover:bg-[rgba(255,255,255,0.05)] transition-colors" 
              style={{ padding: '16px', textAlign: 'center', cursor: 'pointer', border: '1px solid var(--accent-color)', color: 'var(--accent-color)', fontWeight: 'bold', background: 'transparent', width: '100%', marginTop: '16px' }}
            >
              조건 유지하고 전체 정책 보기
            </button>
          )}
        </section>
      )}

      <section id="announcements" style={{ marginTop: '80px', marginBottom: '40px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h3 style={{ fontSize: '24px', fontWeight: '600' }}>학교 주요 공지사항 통합</h3>
          <a href="/announcements" style={{ color: 'var(--accent-color)', textDecoration: 'none', fontSize: '14px', fontWeight: '500' }}>전체보기 →</a>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {announcements.length === 0 ? (
            <div className="glass-card" style={{ padding: '20px', textAlign: 'center', color: 'var(--text-secondary)' }}>
              공지사항을 불러오는 중이거나 없습니다.
            </div>
          ) : (
            announcements.slice(0, 5).map((ann: any) => (
              <div key={ann.id} className="glass-card" style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px', flex: 1, overflow: 'hidden' }}>
                  <span style={{ 
                    fontSize: '12px', 
                    padding: '4px 8px', 
                    borderRadius: '4px', 
                    backgroundColor: 'rgba(255, 255, 255, 0.1)',
                    color: 'var(--accent-color)',
                    whiteSpace: 'nowrap'
                  }}>
                    {ann.source_name}
                  </span>
                  <a 
                    href={ann.link} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    style={{ fontWeight: '500', color: 'inherit', textDecoration: 'none', textOverflow: 'ellipsis', overflow: 'hidden', whiteSpace: 'nowrap' }}
                    className="hover:text-[var(--accent-color)] transition-colors"
                  >
                    {ann.title}
                  </a>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '16px', marginLeft: '16px' }}>
                  <span style={{ color: 'var(--text-secondary)', fontSize: '14px', whiteSpace: 'nowrap' }}>
                    {ann.posted_date ? ann.posted_date.replace(/-/g, '.').slice(0, 10) : '-'}
                  </span>
                  <button
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); handleAIAnalyze(ann); }}
                    style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '12px', fontWeight: 'bold', padding: '6px 10px', borderRadius: '100px', background: 'var(--accent-color)', color: 'white', border: 'none', cursor: 'pointer', whiteSpace: 'nowrap' }}
                    className="hover:scale-105 transition-transform"
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
      </section>

      {/* AI 모달 */}
      <AIAnalysisModal 
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        announcement={selectedAnn}
      />
    </>
  );
}
