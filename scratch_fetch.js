const dotenv = require('dotenv');
dotenv.config({ path: '.env.local' });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

async function truncateAndRescrape() {
  console.log('=== 1단계: 테이블 전체 삭제 ===');
  // neq 트릭: 모든 행 삭제 (id가 비어있지 않은 모든 행)
  const deleteRes = await fetch(`${SUPABASE_URL}/rest/v1/scnu_announcements?id=neq.IMPOSSIBLE_VALUE_THAT_NEVER_EXISTS`, {
    method: 'DELETE',
    headers: {
      'apikey': SUPABASE_ANON_KEY,
      'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
      'Prefer': 'return=minimal',
    },
  });
  console.log('삭제 상태코드:', deleteRes.status);

  // 확인
  const checkRes = await fetch(`${SUPABASE_URL}/rest/v1/scnu_announcements?select=count`, {
    headers: { 'apikey': SUPABASE_ANON_KEY, 'Authorization': `Bearer ${SUPABASE_ANON_KEY}`, 'Prefer': 'count=exact' },
  });
  console.log('남은 데이터:', await checkRes.text());
  console.log('\n=== 2단계: 스크래핑 API 재호출 ===');
  console.log('브라우저에서 http://localhost:3000/api/cron/scrape 를 방문해주세요!');
}

truncateAndRescrape();
