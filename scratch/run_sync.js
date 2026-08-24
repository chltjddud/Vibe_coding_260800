const { createClient } = require('@supabase/supabase-js');
require('dotenv').config({ path: '.env.local' });
const cheerio = require('cheerio');

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
);

const TARGET_SITES = [
  { id: 'ai', name: 'AI인재양성', baseUrl: 'https://www.scnu.ac.kr/scnuai/na/ntt/selectNttList.do?mi=10241&bbsId=5045', maxPages: 5 },
  { id: 'sw', name: 'SW중심대학', baseUrl: 'https://www.scnu.ac.kr/scnusw/na/ntt/selectNttList.do?mi=8889&bbsId=4548', maxPages: 3 },
  { id: 'main', name: '순천대 공지사항', baseUrl: 'https://www.scnu.ac.kr/SCNU/na/ntt/selectNttList.do?mi=1131&bbsId=1040', maxPages: 5 },
];

async function scrapeOnePage(site, page) {
  const url = `${site.baseUrl}&currPage=${page}`;
  const res = await fetch(url, { headers: { 'User-Agent': 'Mozilla/5.0' } });
  if (!res.ok) throw new Error(`HTTP ${res.status}`);

  const html = await res.text();
  const $ = cheerio.load(html);

  const notices = [];
  const seenIds = new Set();

  $('table tbody tr').each((i, element) => {
    const $row = $(element);

    const numText = $row.find('td').eq(0).text().trim();
    let noticeNum = parseInt(numText, 10);

    if (site.id === 'sw' && isNaN(noticeNum)) {
      return; // SW중심대학 공지글 제외
    }

    if (isNaN(noticeNum)) {
      noticeNum = 999999000 - i;
    }

    const $titleLink = $row.find('td.ta_l a');
    if (!$titleLink.length) return;

    let title = $titleLink.text().trim().replace(/\s+/g, ' ');
    const href = $titleLink.attr('href') || '';
    if (!href) return;

    const nttSnMatch = href.match(/nttSn=(\d+)/);
    const nttSn = nttSnMatch ? nttSnMatch[1] : null;
    const uniqueId = nttSn ? `${site.id}-${nttSn}` : `${site.id}-${noticeNum}-${i}`;

    if (seenIds.has(uniqueId)) return;
    seenIds.add(uniqueId);

    const link = href.startsWith('http') ? href : `https://www.scnu.ac.kr${href}`;
    const rawDate = $row.find('td').eq(3).text().trim();

    if (!title || !link) return;

    notices.push({
      id: uniqueId,
      source_id: site.id,
      source_name: site.name,
      title,
      link,
      posted_date: rawDate ? rawDate.replace(/\./g, '-') : null,
      notice_num: noticeNum,
    });
  });

  return notices;
}

async function run() {
  console.log('=== 순천대 최신 공지사항 Supabase 즉시 동기화 시작 ===');
  let totalInserted = 0;
  const allCurrentIds = new Set();

  for (const site of TARGET_SITES) {
    console.log(`[${site.name}] 스크래핑 중... (최대 ${site.maxPages}페이지)`);
    for (let page = 1; page <= site.maxPages; page++) {
      try {
        const notices = await scrapeOnePage(site, page);
        if (notices.length === 0) break;

        notices.forEach(n => allCurrentIds.add(n.id));

        const { error } = await supabase
          .from('scnu_announcements')
          .upsert(notices, { onConflict: 'id' });

        if (error) {
          console.error(`  ❌ ${site.name} ${page}페이지 에러:`, error.message);
        } else {
          totalInserted += notices.length;
          console.log(`  ✅ ${site.name} ${page}페이지: ${notices.length}개 업로드 완료`);
        }
      } catch (err) {
        console.error(`  ❌ ${site.name} ${page}페이지 실패:`, err.message);
      }
    }
  }

  // 총 데이터 개수 확인
  const { count } = await supabase
    .from('scnu_announcements')
    .select('*', { count: 'exact', head: true });

  console.log('==================================================');
  console.log(`🎉 동기화 완료!`);
  console.log(`- 이번에 갱신/추가된 공지사항: ${totalInserted}건`);
  console.log(`- 현재 Supabase에 저장된 총 공지사항: ${count}건`);
  console.log('==================================================');
}

run();
