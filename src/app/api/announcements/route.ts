import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    // Supabase의 announcements 테이블에서 최신 공지사항을 가져옵니다.
    // 날짜 기준 내림차순 정렬, 최근 10개
    const { data, error } = await supabase
      .from('announcements')
      .select('*')
      .order('posted_date', { ascending: false })
      .limit(10);

    if (error) {
      console.error('Error fetching announcements:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    return NextResponse.json({ data });
  } catch (err) {
    console.error('Unexpected error:', err);
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }
}
