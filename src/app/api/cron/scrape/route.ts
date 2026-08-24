import { NextResponse } from 'next/server';
import * as cheerio from 'cheerio';
import { createClient } from '@supabase/supabase-js';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const TARGET_SITES = [
  { id: 'ai', name: 'AI인재양성', baseUrl: 'https://www.scnu.ac.kr/scnuai/na/ntt/selectNttList.do?mi=10241&bbsId=5045', maxPages: 5 },
  { id: 'sw', name: 'SW중심대학', baseUrl: 'https://www.scnu.ac.kr/scnusw/na/ntt/selectNttList.do?mi=8889&bbsId=4548', maxPages: 3 },
  { id: 'main', name: '순천대 공지사항', baseUrl: 'https://www.scnu.ac.kr/SCNU/na/ntt/selectNttList.do?mi=1131&bbsId=1040', maxPages: 5 },
];

async function scrapeOnePage(site: { id: string; name: string; baseUrl: string; maxPages: number }, page: number) {
  const url = `${site.baseUrl}&currPage=${page}`;
  const res = await fetch(url, { cache: 'no-store' });
  if (!res.ok) throw new Error(`Failed to fetch ${url}: ${res.status}`);

  const html = await res.text();
  const $ = cheerio.load(html);

  const notices: any[] = [];
  const seenIds = new Set<string>();

  $('table tbody tr').each((i, element) => {
    const $row = $(element);

    const numText = $row.find('td').eq(0).text().trim();
    let noticeNum = parseInt(numText, 10);
    
    if (site.id === 'sw' && isNaN(noticeNum)) {
      return; // SW중심대학의 공지글은 제외
    }

    if (isNaN(noticeNum)) {
      noticeNum = 999999000 - i; // 공지글은 큰 가상 번호 부여 (페이지 내 인덱스로 구분)
    }

    const $titleLink = $row.find('td.ta_l a');
    if (!$titleLink.length) return;

    let title = $titleLink.text().trim().replace(/\s+/g, ' ');
    const href = $titleLink.attr('href') || '';
    if (!href) return;

    // nttSn을 href에서 추출하여 고유 ID로 사용 (공지글 중복 방지)
    const nttSnMatch = href.match(/nttSn=(\d+)/);
    const nttSn = nttSnMatch ? nttSnMatch[1] : null;
    const uniqueId = nttSn ? `${site.id}-${nttSn}` : `${site.id}-${noticeNum}-${i}`;

    if (seenIds.has(uniqueId)) return; // 같은 페이지 내 중복 제거
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

export async function GET() {
  const results = { total: 0, inserted: 0, deleted: 0, errors: [] as string[] };

  for (const site of TARGET_SITES) {
    const siteLiveNotices: any[] = [];
    const siteLiveIds = new Set<string>();
    let minNoticeNum = Infinity;
    let maxNoticeNum = -Infinity;

    for (let page = 1; page <= site.maxPages; page++) {
      try {
        const notices = await scrapeOnePage(site, page);
        if (notices.length === 0) break;

        for (const n of notices) {
          siteLiveNotices.push(n);
          siteLiveIds.add(n.id);
          if (n.notice_num < 999990000) { // 일반 공지 번호 범위만 추적
            if (n.notice_num < minNoticeNum) minNoticeNum = n.notice_num;
            if (n.notice_num > maxNoticeNum) maxNoticeNum = n.notice_num;
          }
        }

        const { error } = await supabase
          .from('scnu_announcements')
          .upsert(notices, { onConflict: 'id' });

        if (error) {
          results.errors.push(`${site.name} 페이지${page}: ${error.message}`);
        } else {
          results.inserted += notices.length;
        }
        results.total += notices.length;
      } catch (err: any) {
        results.errors.push(`${site.name} 페이지${page}: ${err.message}`);
      }
    }

    // ─── 삭제된 공지사항 감지 및 제거 처리 ───
    if (minNoticeNum !== Infinity && maxNoticeNum !== -Infinity) {
      try {
        // 기존 DB에서 해당 출처의 탐색 범위 내 공지사항 조회
        const { data: existingNotices } = await supabase
          .from('scnu_announcements')
          .select('*')
          .eq('source_id', site.id)
          .gte('notice_num', minNoticeNum)
          .lte('notice_num', maxNoticeNum);

        if (existingNotices && existingNotices.length > 0) {
          const deletedNotices = existingNotices.filter(n => !siteLiveIds.has(n.id));

          if (deletedNotices.length > 0) {
            console.log(`[${site.name}] 삭제된 공지사항 ${deletedNotices.length}건 감지! DB에서 제거 중...`);

            // 활성 공지사항 테이블(scnu_announcements)에서 즉시 삭제
            const deletedIds = deletedNotices.map(n => n.id);
            await supabase
              .from('scnu_announcements')
              .delete()
              .in('id', deletedIds);

            results.deleted += deletedNotices.length;
          }
        }
      } catch (archErr: any) {
        console.error(`[${site.name}] 삭제 공지 정리 중 에러:`, archErr.message);
      }
    }
  }

  return NextResponse.json({
    success: results.errors.length === 0,
    message: `총 ${results.total}개 처리 (${results.inserted}개 갱신/저장, ${results.deleted}개 삭제 공지 정리 완료)`,
    errors: results.errors,
    updatedAt: new Date().toISOString(),
  });
}

export async function POST() {
  return GET();
}


