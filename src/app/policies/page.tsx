"use client";

import { useState, useEffect, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Search, Building, Calendar, Tag, Filter } from 'lucide-react';
import RegionSelect from '@/components/RegionSelect';
import BookmarkButton from '@/components/BookmarkButton';

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

function PoliciesContent() {
  const searchParams = useSearchParams();
  
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
  
  // 페이지네이션 상태
  const [currentPage, setCurrentPage] = useState(1);
  const ITEMS_PER_PAGE = 15;

  const searchPolicies = async () => {
    setLoading(true);
    setError('');
    setPolicies([]);
    setCurrentPage(1); // 검색 시 1페이지로 초기화
    
    try {
      const queryParams = new URLSearchParams();
      if (keyword) queryParams.append('keyword', keyword);
      if (zipCd) queryParams.append('zipCd', zipCd);
      if (category) queryParams.append('category', category);
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

  // 컴포넌트 로드 시 
  useEffect(() => {
    searchPolicies();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 현재 페이지에 보여줄 데이터 계산
  const paginatedPolicies = policies.slice(
    (currentPage - 1) * ITEMS_PER_PAGE,
    currentPage * ITEMS_PER_PAGE
  );
  const totalPages = Math.ceil(policies.length / ITEMS_PER_PAGE);

  // 페이지 변경 핸들러: 페이지 상단으로 스크롤
  const handlePageChange = (page: number) => {
    setCurrentPage(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div style={{ maxWidth: '1200px', margin: '40px auto', padding: '0 20px', display: 'flex', gap: '30px', alignItems: 'flex-start' }} className="flex-col md:flex-row">
      
      {/* 좌측 사이드바 (상세 필터 영역) */}
      <aside className="glass-card" style={{ width: '100%', maxWidth: '320px', padding: '24px', flexShrink: 0, position: 'sticky', top: '20px', maxHeight: 'calc(100vh - 40px)', overflowY: 'auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
          <Filter className="w-5 h-5 text-gray-300" />
          <h2 style={{ fontSize: '18px', fontWeight: 'bold', margin: 0 }}>상세 필터</h2>
        </div>

        <form onSubmit={(e) => { e.preventDefault(); searchPolicies(); }} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
          
          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-gray-300">거주 지역</label>
            <RegionSelect options={REGION_CODES} value={zipCd} onChange={setZipCd} className="form-select w-full text-sm" />
          </div>
          
          <div className="flex flex-col gap-1">
            <label className="text-sm font-semibold text-gray-300">나이 (만)</label>
            <input 
              type="number" 
              className="form-input w-full text-sm" 
              placeholder="예: 25"
              value={age}
              onChange={(e) => setAge(e.target.value)}
            />
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

      {/* 우측 본문 (결과 리스트) */}
      <main style={{ flex: 1, minWidth: 0 }}>
        {error && (
          <div className="glass-card" style={{ border: '1px solid #ef4444', color: '#ef4444', marginBottom: '20px' }}>
            {error}
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: '24px', paddingBottom: '16px', borderBottom: '1px solid rgba(255,255,255,0.1)' }}>
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
            {paginatedPolicies.map((policy, idx) => (
              <div key={idx} className="glass-card result-card hover:border-[var(--accent-color)] transition-colors" style={{ display: 'flex', flexDirection: 'column', gap: '16px', padding: '24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                  <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                    <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                      <span className="result-badge policy">
                        {policy.lclsfNm || '지원정책'} {policy.mclsfNm ? `> ${policy.mclsfNm}` : ''}
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
            ))}
            
            {/* 페이지네이션 UI */}
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
}

export default function PoliciesPage() {
  return (
    <Suspense fallback={<div style={{ textAlign: 'center', padding: '100px' }}>Loading...</div>}>
      <PoliciesContent />
    </Suspense>
  );
}
