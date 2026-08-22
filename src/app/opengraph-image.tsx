import { ImageResponse } from 'next/og';

export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';
export const alt = 'Scholar - 맞춤형 청년 정책 & AI 공지사항 분석 플랫폼';

export default async function OpenGraphImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: '100%',
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          background: 'linear-gradient(135deg, #EFF6FF 0%, #DBEAFE 45%, #BFDBFE 100%)',
          fontFamily: 'sans-serif',
          position: 'relative',
          padding: '60px',
        }}
      >
        {/* 장식용 은은한 배경 원 */}
        <div
          style={{
            position: 'absolute',
            top: '-50px',
            right: '-50px',
            width: '400px',
            height: '400px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(59,130,246,0.2) 0%, rgba(255,255,255,0) 70%)',
          }}
        />
        <div
          style={{
            position: 'absolute',
            bottom: '-50px',
            left: '-50px',
            width: '350px',
            height: '350px',
            borderRadius: '50%',
            background: 'radial-gradient(circle, rgba(99,102,241,0.15) 0%, rgba(255,255,255,0) 70%)',
          }}
        />

        {/* 메인 화이트 글래스 카드 */}
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(255, 255, 255, 0.88)',
            border: '2px solid rgba(59, 130, 246, 0.25)',
            borderRadius: '32px',
            padding: '48px 64px',
            boxShadow: '0 20px 45px rgba(37, 99, 235, 0.12)',
            maxWidth: '1000px',
            width: '100%',
            textAlign: 'center',
          }}
        >
          {/* 상단 뱃지 태그들 */}
          <div style={{ display: 'flex', gap: '12px', marginBottom: '24px' }}>
            <div
              style={{
                backgroundColor: 'rgba(37, 99, 235, 0.1)',
                color: '#2563eb',
                padding: '8px 18px',
                borderRadius: '100px',
                fontSize: '20px',
                fontWeight: '700',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              🏛️ 온통청년 국가 정책 통합
            </div>
            <div
              style={{
                backgroundColor: 'rgba(147, 51, 234, 0.1)',
                color: '#7c3aed',
                padding: '8px 18px',
                borderRadius: '100px',
                fontSize: '20px',
                fontWeight: '700',
                display: 'flex',
                alignItems: 'center',
              }}
            >
              ✨ Google Gemini AI 공지 분석
            </div>
          </div>

          {/* 메인 로고 타이틀 */}
          <div
            style={{
              fontSize: '68px',
              fontWeight: '900',
              color: '#0f172a',
              letterSpacing: '-1.5px',
              display: 'flex',
              alignItems: 'center',
              marginBottom: '16px',
            }}
          >
            Scholar
            <span style={{ color: '#2563eb' }}>.</span>
          </div>

          {/* 서브 슬로건 */}
          <div
            style={{
              fontSize: '30px',
              fontWeight: '700',
              color: '#1e293b',
              marginBottom: '14px',
            }}
          >
            내게 딱 맞는 청년 정책 & 장학금 1초 탐색
          </div>

          {/* 상세 설명 */}
          <div
            style={{
              fontSize: '20px',
              color: '#64748b',
              lineHeight: 1.5,
            }}
          >
            복잡한 공지사항은 AI로 3초 요약 • 맞춤 지역·조건별 실시간 혜택 추천
          </div>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
