"use client";

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Search, Building, Calendar, Tag, Filter, RotateCcw, X, ChevronRight, SlidersHorizontal } from 'lucide-react';
import RegionSelect from '@/components/RegionSelect';
import BookmarkButton from '@/components/BookmarkButton';
import { getDDayBadge } from '@/utils/date';
import { useIsMobile } from '@/hooks/useIsMobile';

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
  { value: '', name: '전체', icon: '✨' },
  { value: '일자리', name: '일자리', icon: '💼' },
  { value: '주거', name: '주거', icon: '🏠' },
  { value: '교육', name: '교육', icon: '🎓' },
  { value: '복지.문화', name: '복지·문화', icon: '🎨' },
  { value: '참여.권리', name: '참여·권리', icon: '⚖️' },
];

function PoliciesContent() {
  const searchParams = useSearchParams();
  const { isMobile, isMounted } = useIsMobile(768);
  
  const [keyword, setKeyword] = useState(searchParams.get('keyword') || '');
  const [zipCd, setZipCd] = useState(searchParams.get('zipCd') || '');
  const [category, setCategory] = useState(searchParams.get('category') || '');
  const [age, setAge] = useState(searchParams.get('age') || '');
  const [income, setIncome] = useState(searchParams.get('income') || '');
  const [major, setMajor] = useState(searchParams.get('major') || '');
  const [edu, setEdu] = useState(searchParams.get('edu') || '');
  const [job, setJob] = useState(searchParams.get('job') || '');
  const [marriage, setMarriage] = useState(searchParams.get('marriage') || '');
  
  const [policies, setPolicies] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [isMobileFilterOpen, setIsMobileFilterOpen] = useState(false);
  
  // 페이지네이션 상태
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 15;

  const searchPolicies = async (overrideCategory?: string) => {
    setLoading(true);
    setError('');
    setIsMobileFilterOpen(false);
    setPolicies([]);
    setCurrentPage(1);
    
    const activeCategory = overrideCategory !== undefined ? overrideCategory : category;

    try {
      const queryParams = new URLSearchParams();
      if (keyword.trim()) queryParams.append('keyword', keyword.trim());
      if (zipCd) queryParams.append('zipCd', zipCd);
      if (activeCategory) queryParams.append('category', activeCategory);
      if (age) queryParams.append('age', age);
      if (income) queryParams.append('income', income);
      if (major) queryParams.append('major', major);
      if (edu) queryParams.append('edu', edu);
      if (job) queryParams.append('job', job);
      if (marriage) queryParams.append('marriage', marriage);

      const res = await fetch(`/api/policies?${queryParams.toString()}`);
      const data = await res.json();
      
      if (res.ok) {
        let foundPolicies: any[] = [];
        if (data && data.ResultVO && data.ResultVO.result && data.ResultVO.result.youthPolicyList) {
          const list = data.ResultVO.result.youthPolicyList;
          foundPolicies = Array.isArray(list) ? list : [list];
        } else if (data && data.youthPolicyList) {
          const list = data.youthPolicyList;
          foundPolicies = Array.isArray(list) ? list : [list];
        }
        setPolicies(foundPolicies);
      } else {
        setError(data.error || '검색에 실패했습니다.');
      }
    } catch (err) {
      setError('네트워크 오류가 발생했습니다.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    searchPolicies();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCategoryClick = (catVal: string) => {
    setCategory(catVal);
    searchPolicies(catVal);
  };

  const paginatedPolicies = policies.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );
  const totalPages = Math.ceil(policies.length / ITEMS_PER_PAGE);

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleResetFilters = () => {
    setKeyword('');
    setZipCd('');
    setCategory('');
    setAge('');
    setIncome('');
    setMajor('');
    setEdu('');
    setJob('');
    setMarriage('');
  };

  const activeFilterCount = [
    zipCd, category, age, income, major, edu, job, marriage, keyword
  ].filter(Boolean).length;

  // ─────────────────────────────────────────────────────────────
  // 📱 모바일 전용 뷰 렌더러
  // ─────────────────────────────────────────────────────────────
  const renderMobileView = () => (
    <div className="mobile-policies-container" style={{ padding: '0 4px 40px', width: '100%', boxSizing: 'border-box' }}>
      
      {/* 모바일 헤더 */}
      <div style={{ marginBottom: '16px' }}>
        <h2 style={{ fontSize: '22px', fontWeight: '800', margin: '0 0 6px 0', letterSpacing: '-0.5px' }}>
          청년 정책 둘러보기
        </h2>
        <p style={{ color: 'var(--text-secondary)', fontSize: '13px', margin: 0 }}>
          현재 <span className="accent" style={{ fontWeight: '700' }}>{policies.length}건</span>의 지원 정책이 있습니다.
        </p>
      </div>

      {/* 1. 모바일 검색창 */}
      <form 
        onSubmit={(e) => { e.preventDefault(); searchPolicies(); }}
        style={{ position: 'relative', width: '100%', marginBottom: '12px' }}
      >
        <input
          type="text"
          className="form-input"
          placeholder="정책명 또는 키워드 (예: 월세, 면접, 자격증)"
          value={keyword}
          onChange={(e) => setKeyword(e.target.value)}
          style={{
            paddingLeft: '40px',
            paddingRight: keyword ? '70px' : '44px',
            height: '46px',
            borderRadius: '12px',
            fontSize: '14px',
          }}
        />
        <Search className="w-4 h-4 text-gray-400" style={{ position: 'absolute', left: '14px', top: '50%', transform: 'translateY(-50%)' }} />
        {keyword && (
          <button
            type="button"
            onClick={() => setKeyword('')}
            style={{ position: 'absolute', right: '42px', top: '50%', transform: 'translateY(-50%)', background: 'transparent', border: 'none', color: 'var(--text-secondary)', padding: '4px', cursor: 'pointer' }}
          >
            <X className="w-4 h-4" />
          </button>
        )}
        <button
          type="submit"
          style={{
            position: 'absolute',
            right: '6px',
            top: '50%',
            transform: 'translateY(-50%)',
            background: 'var(--accent-color)',
            color: 'white',
            border: 'none',
            borderRadius: '8px',
            padding: '6px 10px',
            fontSize: '12px',
            fontWeight: '700',
            cursor: 'pointer',
          }}
        >
          검색
        </button>
      </form>

      {/* 2. 원터치 카테고리 칩 가로 스크롤 */}
      <div className="category-scroll-container" style={{ marginBottom: '14px' }}>
        {CATEGORIES.map((cat) => {
          const isActive = category === cat.value;
          return (
            <button
              key={cat.value}
              type="button"
              className={`category-chip ${isActive ? 'active' : ''}`}
              onClick={() => handleCategoryClick(cat.value)}
            >
              <span>{cat.icon}</span>
              <span>{cat.name}</span>
            </button>
          );
        })}
      </div>

      {/* 3. 모바일 상세 필터 바텀시트 열기 버튼 */}
      <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '16px' }}>
        <button
          type="button"
          onClick={() => setIsMobileFilterOpen(true)}
          className="glass-card"
          style={{
            flex: 1,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            padding: '10px 14px',
            borderRadius: '12px',
            cursor: 'pointer',
            border: activeFilterCount > 0 ? '1px solid var(--accent-color)' : '1px solid var(--glass-border)',
            background: activeFilterCount > 0 ? 'rgba(59, 130, 246, 0.12)' : 'var(--glass-bg)',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            <SlidersHorizontal className="w-4 h-4 text-[var(--accent-color)]" />
            <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-primary)' }}>상세 조건 필터</span>
            {activeFilterCount > 0 && (
              <span style={{ background: 'var(--accent-color)', color: 'white', fontSize: '11px', fontWeight: 'bold', padding: '2px 6px', borderRadius: '20px' }}>
                {activeFilterCount}
              </span>
            )}
          </div>
          <span style={{ fontSize: '12px', color: 'var(--accent-color)', fontWeight: '600' }}>
            설정 ⚙️
          </span>
        </button>

        {activeFilterCount > 0 && (
          <button
            type="button"
            onClick={() => { handleResetFilters(); searchPolicies(); }}
            className="glass-card"
            style={{
              padding: '10px 12px',
              borderRadius: '12px',
              color: 'var(--text-secondary)',
              fontSize: '12px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              whiteSpace: 'nowrap',
            }}
            title="필터 초기화"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            초기화
          </button>
        )}
      </div>

      {/* 4. 모바일 정책 결과 목록 */}
      {loading ? (
        <div className="glass-card" style={{ textAlign: 'center', padding: '60px 20px' }}>
          <div className="w-8 h-8 border-4 border-[var(--accent-color)] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>맞춤 정책을 불러오는 중입니다...</p>
        </div>
      ) : error ? (
        <div className="glass-card" style={{ padding: '20px', textAlign: 'center', color: '#ef4444' }}>
          {error}
        </div>
      ) : policies.length === 0 ? (
        <div className="glass-card" style={{ textAlign: 'center', padding: '60px 20px' }}>
          <Search className="w-10 h-10 text-gray-400 mx-auto mb-3" />
          <p style={{ color: 'var(--text-primary)', fontWeight: '600', marginBottom: '4px' }}>조건에 맞는 정책이 없습니다</p>
          <p style={{ color: 'var(--text-secondary)', fontSize: '13px' }}>상세 필터 조건을 조금 완화하여 검색해보세요.</p>
          <button
            type="button"
            onClick={() => { handleResetFilters(); searchPolicies(); }}
            className="btn-primary"
            style={{ marginTop: '16px', maxWidth: '160px', padding: '10px', fontSize: '13px' }}
          >
            필터 전체 초기화
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          {paginatedPolicies.map((policy, idx) => {
            const dday = getDDayBadge(policy.aplyYmd);
            return (
              <div 
                key={idx} 
                className="glass-card"
                style={{
                  padding: '16px',
                  borderRadius: '16px',
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '12px',
                  width: '100%',
                  boxSizing: 'border-box',
                }}
              >
                {/* 상단 뱃지 & 찜하기 */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <div style={{ display: 'flex', gap: '6px', flexWrap: 'wrap', alignItems: 'center' }}>
                    <span className="result-badge policy" style={{ fontSize: '11px', padding: '3px 8px' }}>
                      {policy.lclsfNm || '지원정책'}
                    </span>
                    <span className={`dday-badge dday-${dday.type}`} style={{ fontSize: '11px', padding: '2px 7px' }}>
                      {dday.text}
                    </span>
                  </div>
                  <BookmarkButton 
                    id={policy.bizId || policy.plcyNm}
                    title={policy.plcyNm || '정책명 없음'}
                    desc={policy.plcyExplnCn || policy.plcySprtCn || '정책 소개가 없습니다.'}
                    link={policy.aplyUrlAddr || policy.refUrlAddr1 || '#'}
                    type="policy"
                  />
                </div>

                {/* 정책 제목 */}
                <h3 style={{ fontSize: '16px', fontWeight: '700', margin: 0, color: 'var(--text-primary)', lineHeight: '1.4', wordBreak: 'break-word' }}>
                  {policy.plcyNm || '정책명 없음'}
                </h3>

                {/* 설명 요약 */}
                <p style={{ color: 'var(--text-secondary)', fontSize: '13px', lineHeight: '1.5', margin: 0, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                  {policy.plcyExplnCn || policy.plcySprtCn || '정책 소개가 없습니다.'}
                </p>

                {/* 메타 정보 칩들 */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', padding: '8px 10px', background: 'rgba(255, 255, 255, 0.03)', borderRadius: '8px', fontSize: '12px', color: 'var(--text-secondary)' }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    <Building className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis' }}>{policy.sprvsnInstCdNm || policy.operInstCdNm || '기관명 없음'}</span>
                  </div>
                  {policy.aplyYmd && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Calendar className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                      <span>신청기간: {policy.aplyYmd}</span>
                    </div>
                  )}
                  {policy.sprtTrgtMinAge && policy.sprtTrgtMaxAge && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <Tag className="w-3.5 h-3.5 text-gray-400 flex-shrink-0" />
                      <span>연령: 만 {policy.sprtTrgtMinAge}세 ~ {policy.sprtTrgtMaxAge}세</span>
                    </div>
                  )}
                </div>

                {/* 상세 바로가기 버튼 */}
                <a 
                  href={policy.aplyUrlAddr || policy.refUrlAddr1 || '#'} 
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn-primary"
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '4px',
                    padding: '10px',
                    fontSize: '13px',
                    fontWeight: '700',
                    borderRadius: '10px',
                    textDecoration: 'none',
                    marginTop: '2px',
                  }}
                >
                  상세보기 바로가기 <ChevronRight className="w-4 h-4" />
                </a>
              </div>
            );
          })}

          {/* 모바일 페이지네이션 */}
          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '8px', marginTop: '24px' }}>
              <button
                onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="glass-card"
                style={{ padding: '8px 14px', cursor: currentPage === 1 ? 'not-allowed' : 'pointer', opacity: currentPage === 1 ? 0.4 : 1, fontSize: '13px', fontWeight: 'bold' }}
              >
                이전
              </button>
              <span style={{ fontSize: '13px', fontWeight: '700', color: 'var(--text-secondary)' }}>
                <strong style={{ color: 'var(--accent-color)' }}>{currentPage}</strong> / {totalPages}
              </span>
              <button
                onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="glass-card"
                style={{ padding: '8px 14px', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer', opacity: currentPage === totalPages ? 0.4 : 1, fontSize: '13px', fontWeight: 'bold' }}
              >
                다음
              </button>
            </div>
          )}
        </div>
      )}
    </div>
  );

  // ─────────────────────────────────────────────────────────────
  // 🖥️ 데스크톱 전용 뷰 렌더러
  // ─────────────────────────────────────────────────────────────
  const renderDesktopView = () => (
    <div className="desktop-policies-container">
      
      {/* 데스크톱 좌측 사이드바 필터 */}
      <aside className="glass-card policies-sidebar sidebar-scroll">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', paddingBottom: '14px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Filter className="w-5 h-5 text-gray-300" />
            <h2 style={{ fontSize: '18px', fontWeight: 'bold', margin: 0 }}>상세 필터</h2>
          </div>
          <button
            type="button"
            onClick={handleResetFilters}
            style={{
              background: 'transparent',
              border: 'none',
              color: 'var(--text-secondary)',
              fontSize: '12px',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
              padding: '4px 6px',
              borderRadius: '4px',
            }}
            className="hover:text-[var(--accent-color)] transition-colors"
            title="필터 초기화"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            초기화
          </button>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); searchPolicies(); }} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-gray-300">거주 지역</label>
            <RegionSelect options={REGION_CODES} value={zipCd} onChange={setZipCd} className="form-select w-full text-sm" />
          </div>
          
          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-gray-300">나이 (만)</label>
            <div style={{ position: 'relative', width: '100%' }}>
              <input 
                type="number" 
                className="form-input w-full text-sm" 
                placeholder="예: 25"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                style={{ paddingRight: '30px', boxSizing: 'border-box' }}
              />
              <span style={{ position: 'absolute', right: '12px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)', fontSize: '13px', pointerEvents: 'none' }}>세</span>
            </div>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-gray-300">취업 상태</label>
            <select className="form-select w-full text-sm" value={job} onChange={(e) => setJob(e.target.value)}>
              <option value="">전체 (선택 안함)</option>
              <option value="미취업자">미취업자 (구직자)</option>
              <option value="재직자">재직자</option>
              <option value="창업자">창업자 (예비창업자)</option>
              <option value="단기근로자">단기근로자 (프리랜서 등)</option>
              <option value="농어업인">농어업인</option>
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-gray-300">정책 분야</label>
            <select className="form-select w-full text-sm" value={category} onChange={(e) => setCategory(e.target.value)}>
              {CATEGORIES.map(cat => (
                <option key={cat.value} value={cat.value}>{cat.name}</option>
              ))}
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-gray-300">결혼 상태</label>
            <select className="form-select w-full text-sm" value={marriage} onChange={(e) => setMarriage(e.target.value)}>
              <option value="">전체 (선택 안함)</option>
              <option value="미혼">미혼</option>
              <option value="기혼">기혼</option>
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-gray-300">연소득 (만원)</label>
            <input 
              type="number" 
              className="form-input w-full text-sm" 
              placeholder="예: 3000"
              value={income}
              onChange={(e) => setIncome(e.target.value)}
            />
          </div>
          
          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-gray-300">전공분야</label>
            <select className="form-select w-full text-sm" value={major} onChange={(e) => setMajor(e.target.value)}>
              <option value="">제한없음</option>
              <option value="인문">인문계열</option>
              <option value="사회">사회계열</option>
              <option value="교육">교육계열</option>
              <option value="공학">공학계열</option>
              <option value="자연">자연계열</option>
              <option value="의약">의약계열</option>
              <option value="예체능">예체능계열</option>
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-gray-300">학력</label>
            <select className="form-select w-full text-sm" value={edu} onChange={(e) => setEdu(e.target.value)}>
              <option value="">제한없음</option>
              <option value="고졸">고졸 미만/고졸</option>
              <option value="대졸">대학(교) 재학/졸업</option>
              <option value="석사">석사 이상</option>
            </select>
          </div>

          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-gray-300">관심 키워드</label>
            <input 
              type="text" 
              className="form-input w-full text-sm" 
              placeholder="예: 창업, 월세"
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
            />
          </div>
          
          <button type="submit" className="btn-primary" style={{ width: '100%', marginTop: '12px', padding: '12px' }} disabled={loading}>
            {loading ? '검색 중...' : '조건 적용하기'}
          </button>
        </form>
      </aside>

      {/* 데스크톱 본문 결과 리스트 */}
      <main className="policies-main">
        {error && (
          <div className="glass-card" style={{ border: '1px solid #ef4444', color: '#ef4444', marginBottom: '20px' }}>
            {error}
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid rgba(255,255,255,0.1)', flexWrap: 'wrap', gap: '12px' }}>
          <div>
            <h1 style={{ fontSize: '28px', fontWeight: 'bold', margin: '0 0 8px 0' }}>청년 정책 검색 결과</h1>
            <p style={{ color: 'var(--text-secondary)', margin: 0, fontSize: '15px' }}>선택하신 상세 조건에 맞는 정책 <span className="accent">{policies.length}건</span>을 찾았습니다.</p>
          </div>
        </div>

        {loading ? (
          <div className="glass-card" style={{ textAlign: 'center', padding: '80px' }}>
            <div className="w-8 h-8 border-4 border-[var(--accent-color)] border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p style={{ color: 'var(--text-secondary)' }}>맞춤형 정책을 상세하게 분석 중입니다...</p>
          </div>
        ) : policies.length === 0 ? (
          <div className="glass-card" style={{ textAlign: 'center', padding: '80px' }}>
            <Search className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <p style={{ color: 'var(--text-secondary)' }}>입력하신 상세 조건에 맞는 정책이 없습니다.<br/>필터 조건을 조금 완화하여 다시 검색해보세요.</p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {paginatedPolicies.map((policy, idx) => {
              const dday = getDDayBadge(policy.aplyYmd);
              return (
                <div key={idx} className="glass-card result-card hover:border-[var(--accent-color)] transition-colors" style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '24px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                      <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', alignItems: 'center' }}>
                        <span className="result-badge policy">
                          {policy.lclsfNm || '지원정책'} {policy.mclsfNm ? `> ${policy.mclsfNm}` : ''}
                        </span>
                        <span className={`dday-badge dday-${dday.type}`}>
                          {dday.text}
                        </span>
                        <span style={{ fontSize: '12px', padding: '4px 10px', backgroundColor: 'rgba(255, 255, 255, 0.05)', color: 'var(--text-secondary)', borderRadius: '100px', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Building className="w-3 h-3" />
                          {policy.sprvsnInstCdNm || policy.operInstCdNm || '기관명 없음'}
                        </span>
                      </div>
                      
                      <h4 style={{ fontSize: '20px', fontWeight: 'bold', margin: '0', color: 'var(--text-primary)' }}>
                        {policy.plcyNm || '정책명 없음'}
                      </h4>
                    </div>
                    <BookmarkButton 
                      id={policy.bizId || policy.plcyNm}
                      title={policy.plcyNm || '정책명 없음'}
                      desc={policy.plcyExplnCn || policy.plcySprtCn || '정책 소개가 없습니다.'}
                      link={policy.aplyUrlAddr || policy.refUrlAddr1 || '#'}
                      type="policy"
                    />
                  </div>
                
                  <p style={{ color: 'var(--text-secondary)', fontSize: '15px', lineHeight: '1.6', margin: 0 }}>
                    {policy.plcyExplnCn || policy.plcySprtCn || '정책 소개가 없습니다.'}
                  </p>
                  
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', fontSize: '13px', color: 'var(--text-secondary)', padding: '12px 0', borderTop: '1px solid rgba(255,255,255,0.1)' }}>
                    {policy.aplyYmd && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Calendar className="w-4 h-4" />
                        신청기간: {policy.aplyYmd}
                      </div>
                    )}
                    {policy.sprtTrgtMinAge && policy.sprtTrgtMaxAge && (
                      <div style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                        <Tag className="w-4 h-4" />
                        연령: 만 {policy.sprtTrgtMinAge}세 ~ {policy.sprtTrgtMaxAge}세
                      </div>
                    )}
                  </div>

                  <div>
                    <a 
                      href={policy.aplyUrlAddr || policy.refUrlAddr1 || '#'} 
                      target="_blank"
                      rel="noopener noreferrer"
                      className="btn-primary"
                      style={{ display: 'inline-block', padding: '10px 24px', fontSize: '14px', background: 'var(--accent-color)' }}
                    >
                      상세보기 바로가기
                    </a>
                  </div>
                </div>
              );
            })}
            
            {/* 데스크톱 페이지네이션 */}
            {totalPages > 1 && (
              <div style={{ display: 'flex', justifyContent: 'center', gap: '8px', marginTop: '32px' }}>
                <button
                  onClick={() => handlePageChange(Math.max(1, currentPage - 1))}
                  disabled={currentPage === 1}
                  className="glass-card"
                  style={{ padding: '8px 16px', cursor: currentPage === 1 ? 'not-allowed' : 'pointer', opacity: currentPage === 1 ? 0.5 : 1, border: 'none', color: 'var(--text-primary)', fontWeight: 'bold' }}
                >
                  이전
                </button>
                
                {Array.from({ length: totalPages }).map((_, i) => (
                  <button
                    key={i}
                    onClick={() => handlePageChange(i + 1)}
                    className="glass-card"
                    style={{ 
                      padding: '8px 16px', 
                      cursor: 'pointer', 
                      border: currentPage === i + 1 ? '1px solid var(--accent-color)' : 'none',
                      color: currentPage === i + 1 ? 'var(--accent-color)' : 'var(--text-secondary)',
                      fontWeight: currentPage === i + 1 ? 'bold' : 'normal'
                    }}
                  >
                    {i + 1}
                  </button>
                ))}

                <button
                  onClick={() => handlePageChange(Math.min(totalPages, currentPage + 1))}
                  disabled={currentPage === totalPages}
                  className="glass-card"
                  style={{ padding: '8px 16px', cursor: currentPage === totalPages ? 'not-allowed' : 'pointer', opacity: currentPage === totalPages ? 0.5 : 1, border: 'none', color: 'var(--text-primary)', fontWeight: 'bold' }}
                >
                  다음
                </button>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );

  return (
    <div style={{ width: '100%', maxWidth: '1200px', margin: '0 auto', boxSizing: 'border-box' }}>
      
      {/* 
        React 마운트 완료 후 화면 너비에 맞춰 단 하나의 뷰만 렌더링.
        마운트 전(SSR)에는 CSS 클래스를 통해 적절히 분기 처리.
      */}
      {isMounted ? (
        isMobile ? renderMobileView() : renderDesktopView()
      ) : (
        <>
          {renderMobileView()}
          {renderDesktopView()}
        </>
      )}

      {/* ═══════════════════════════════════════════════════════════
          📱 모바일 바텀시트 상세 필터 모달 (공통)
          ═══════════════════════════════════════════════════════════ */}
      {isMobileFilterOpen && (
        <div
          style={{
            position: 'fixed',
            inset: 0,
            zIndex: 99999,
            backgroundColor: 'rgba(0, 0, 0, 0.75)',
            backdropFilter: 'blur(10px)',
            WebkitBackdropFilter: 'blur(10px)',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'flex-end',
          }}
          onClick={() => setIsMobileFilterOpen(false)}
        >
          <div
            style={{
              backgroundColor: 'var(--bg-color)',
              borderTop: '2px solid var(--accent-color)',
              borderTopLeftRadius: '24px',
              borderTopRightRadius: '24px',
              padding: '20px 18px 24px',
              maxHeight: '85vh',
              display: 'flex',
              flexDirection: 'column',
              width: '100%',
              boxSizing: 'border-box',
              boxShadow: '0 -10px 40px rgba(0,0,0,0.6)',
            }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* 상단 드래그 바 & 헤더 */}
            <div style={{ width: '40px', height: '4px', backgroundColor: 'rgba(255,255,255,0.2)', borderRadius: '10px', margin: '0 auto 14px' }}></div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px', paddingBottom: '12px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <SlidersHorizontal className="w-5 h-5 text-[var(--accent-color)]" />
                <h3 style={{ fontSize: '17px', fontWeight: 'bold', margin: 0, color: 'var(--text-primary)' }}>상세 조건 필터</h3>
              </div>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <button
                  type="button"
                  onClick={handleResetFilters}
                  style={{ background: 'transparent', border: 'none', color: 'var(--text-secondary)', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '4px' }}
                >
                  <RotateCcw className="w-3.5 h-3.5" /> 초기화
                </button>
                <button
                  type="button"
                  onClick={() => setIsMobileFilterOpen(false)}
                  style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: 'var(--text-primary)', width: '28px', height: '28px', borderRadius: '50%', cursor: 'pointer', fontSize: '13px', fontWeight: 'bold', display: 'flex', alignItems: 'center', justifyContent: 'center' }}
                >
                  ✕
                </button>
              </div>
            </div>

            {/* 필터 폼 스크롤 영역 */}
            <div style={{ overflowY: 'auto', flex: 1, paddingRight: '2px', display: 'flex', flexDirection: 'column', gap: '14px', marginBottom: '18px' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label className="form-label" style={{ fontWeight: '600', fontSize: '13px' }}>거주 지역</label>
                <RegionSelect options={REGION_CODES} value={zipCd} onChange={setZipCd} />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label className="form-label" style={{ fontWeight: '600', fontSize: '13px' }}>나이 (만)</label>
                <div style={{ position: 'relative', width: '100%' }}>
                  <input 
                    type="number" 
                    className="form-input" 
                    placeholder="예: 25"
                    value={age}
                    onChange={(e) => setAge(e.target.value)}
                    style={{ width: '100%', paddingRight: '36px', boxSizing: 'border-box' }}
                  />
                  <span style={{ position: 'absolute', right: '14px', top: '50%', transform: 'translateY(-50%)', color: 'var(--text-secondary)', fontSize: '13px', pointerEvents: 'none' }}>세</span>
                </div>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label className="form-label" style={{ fontWeight: '600', fontSize: '13px' }}>취업 상태</label>
                <select className="form-select" value={job} onChange={(e) => setJob(e.target.value)} style={{ width: '100%', boxSizing: 'border-box' }}>
                  <option value="">전체 (선택 안함)</option>
                  <option value="미취업자">미취업자 (구직자)</option>
                  <option value="재직자">재직자</option>
                  <option value="창업자">창업자 (예비창업자)</option>
                  <option value="단기근로자">단기근로자 (프리랜서 등)</option>
                  <option value="농어업인">농어업인</option>
                </select>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label className="form-label" style={{ fontWeight: '600', fontSize: '13px' }}>정책 분야</label>
                <select className="form-select" value={category} onChange={(e) => setCategory(e.target.value)} style={{ width: '100%', boxSizing: 'border-box' }}>
                  {CATEGORIES.map(cat => (
                    <option key={cat.value} value={cat.value}>{cat.name}</option>
                  ))}
                </select>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label className="form-label" style={{ fontWeight: '600', fontSize: '13px' }}>결혼 상태</label>
                <select className="form-select" value={marriage} onChange={(e) => setMarriage(e.target.value)} style={{ width: '100%', boxSizing: 'border-box' }}>
                  <option value="">전체 (선택 안함)</option>
                  <option value="미혼">미혼</option>
                  <option value="기혼">기혼</option>
                </select>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label className="form-label" style={{ fontWeight: '600', fontSize: '13px' }}>연소득 (만원)</label>
                <input 
                  type="number" 
                  className="form-input" 
                  placeholder="예: 3000"
                  value={income}
                  onChange={(e) => setIncome(e.target.value)}
                  style={{ width: '100%', boxSizing: 'border-box' }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label className="form-label" style={{ fontWeight: '600', fontSize: '13px' }}>전공분야</label>
                <select className="form-select" value={major} onChange={(e) => setMajor(e.target.value)} style={{ width: '100%', boxSizing: 'border-box' }}>
                  <option value="">제한없음</option>
                  <option value="인문">인문계열</option>
                  <option value="사회">사회계열</option>
                  <option value="교육">교육계열</option>
                  <option value="공학">공학계열</option>
                  <option value="자연">자연계열</option>
                  <option value="의약">의약계열</option>
                  <option value="예체능">예체능계열</option>
                </select>
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                <label className="form-label" style={{ fontWeight: '600', fontSize: '13px' }}>학력</label>
                <select className="form-select" value={edu} onChange={(e) => setEdu(e.target.value)} style={{ width: '100%', boxSizing: 'border-box' }}>
                  <option value="">제한없음</option>
                  <option value="고졸">고졸 미만/고졸</option>
                  <option value="대졸">대학(교) 재학/졸업</option>
                  <option value="석사">석사 이상</option>
                </select>
              </div>
            </div>

            {/* 모달 적용 버튼 */}
            <button
              type="button"
              onClick={() => searchPolicies()}
              className="btn-primary"
              style={{ width: '100%', padding: '14px', fontSize: '15px', fontWeight: 'bold', borderRadius: '12px' }}
              disabled={loading}
            >
              {loading ? '정책 검색 중...' : '조건 적용하여 결과 보기'}
            </button>
          </div>
        </div>
      )}

    </div>
  );
}

export default function PoliciesPage() {
  return (
    <Suspense fallback={<div style={{ textAlign: 'center', padding: '100px' }}>Loading...</div>}>
      <PoliciesContent />
    </Suspense>
  );
}
