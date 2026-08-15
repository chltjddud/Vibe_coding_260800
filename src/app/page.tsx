"use client";

import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabase";
import type { Policy, Announcement } from "@/lib/supabase";

export default function Home() {
  const [gpa, setGpa] = useState("");
  const [income, setIncome] = useState("");
  const [hasSearched, setHasSearched] = useState(false);
  const [filteredResults, setFilteredResults] = useState<Policy[]>([]);
  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState(false);

  // 컴포넌트 마운트 시 공지사항 불러오기
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

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setHasSearched(true);
    
    const gpaNum = parseFloat(gpa) || 0;
    const incomeNum = parseInt(income) || 10;
    
    try {
      // Supabase 대신 온통청년 API(현재는 Mock API) 라우트를 호출합니다.
      const res = await fetch(`/api/policies?gpa=${gpaNum}&income=${incomeNum}`);
      if (!res.ok) throw new Error('API 요청에 실패했습니다.');
      
      const json = await res.json();
      setFilteredResults(json.data || []);
    } catch (err) {
      console.error("Error fetching policies:", err);
      alert("데이터를 불러오는 중 오류가 발생했습니다.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <section className="hero" id="search">
        <h2 className="hero-title">내게 딱 맞는 장학금 찾기</h2>
        <p className="hero-subtitle">
          학점, 소득분위 등 내 조건을 입력하고 숨겨진 지원 정책과 장학금을 단 1초만에 찾아보세요.
        </p>

        <form className="glass-card" style={{ maxWidth: '600px', margin: '0 auto' }} onSubmit={handleSearch}>
          <div className="grid-2">
            <div className="form-group">
              <label className="form-label">직전 학점</label>
              <input 
                type="number" 
                step="0.1"
                min="0"
                max="4.5"
                className="form-input" 
                placeholder="예: 3.8"
                value={gpa}
                onChange={(e) => setGpa(e.target.value)}
              />
            </div>
            <div className="form-group">
              <label className="form-label">소득 분위 (구간)</label>
              <select 
                className="form-select"
                value={income}
                onChange={(e) => setIncome(e.target.value)}
              >
                <option value="">선택하세요</option>
                {[1,2,3,4,5,6,7,8,9,10].map(num => (
                  <option key={num} value={num}>{num}구간</option>
                ))}
              </select>
            </div>
          </div>
          
          <button type="submit" className="btn-primary" style={{ marginTop: '10px' }} disabled={loading}>
            {loading ? "조회 중..." : "맞춤형 혜택 조회하기"}
          </button>
        </form>
      </section>

      {hasSearched && (
        <section style={{ marginTop: '20px' }}>
          <h3 style={{ fontSize: '24px', fontWeight: '600', marginBottom: '8px' }}>
            검색 결과 <span className="accent">{filteredResults.length}</span>건
          </h3>
          
          {loading ? (
            <div className="glass-card" style={{ textAlign: 'center', padding: '40px' }}>
              <p style={{ color: 'var(--text-secondary)' }}>데이터를 불러오고 있습니다...</p>
            </div>
          ) : filteredResults.length === 0 ? (
            <div className="glass-card" style={{ textAlign: 'center', padding: '40px' }}>
              <p style={{ color: 'var(--text-secondary)' }}>입력하신 조건에 맞는 장학금이나 정책이 없습니다.</p>
              <p style={{ color: 'var(--text-secondary)', fontSize: '12px', marginTop: '8px' }}>
                (데이터가 없다면 Supabase SQL Editor에서 데이터를 먼저 넣어주세요!)
              </p>
            </div>
          ) : (
            <div className="results-grid">
              {filteredResults.map(item => (
                <div key={item.id} className="glass-card result-card">
                  <span className={`result-badge ${item.type === 'policy' ? 'policy' : ''}`}>
                    {item.type === 'scholarship' ? '🎓 장학금' : '🏛️ 지원정책'}
                  </span>
                  <h4 className="result-title">{item.title}</h4>
                  <p className="result-desc">{item.description}</p>
                  <div className="result-meta">
                    <span>• 조건: 학점 {item.min_gpa} 이상 / 소득분위 {item.max_income_quintile}구간 이하</span>
                    <span>• 마감일: {item.deadline || '상시'}</span>
                  </div>
                  <a href={item.apply_url || '#'} className="result-link">자세히 보기 →</a>
                </div>
              ))}
            </div>
          )}
        </section>
      )}

      <section id="announcements" style={{ marginTop: '80px', marginBottom: '40px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
          <h3 style={{ fontSize: '24px', fontWeight: '600' }}>📌 학교 주요 공지사항</h3>
          <a href="#" style={{ color: 'var(--accent-color)', textDecoration: 'none', fontSize: '14px' }}>전체보기</a>
        </div>
        
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          {announcements.length === 0 ? (
            <div className="glass-card" style={{ padding: '20px', textAlign: 'center', color: 'var(--text-secondary)' }}>
              등록된 공지사항이 없습니다.
            </div>
          ) : (
            announcements.map(ann => (
              <div key={ann.id} className="glass-card" style={{ padding: '20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: '500' }}>{ann.title}</span>
                <span style={{ color: 'var(--text-secondary)', fontSize: '14px' }}>
                  {new Date(ann.posted_date).toLocaleDateString()}
                </span>
              </div>
            ))
          )}
        </div>
      </section>
    </>
  );
}
