import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  
  // 출처 필터 (콤마로 구분, 예: source=ai,sw)
  const sourceParam = searchParams.get('source');
  const sources = sourceParam ? sourceParam.split(',').filter(Boolean) : null;
  
  const page = parseInt(searchParams.get('page') || '1', 10);
  const limit = parseInt(searchParams.get('limit') || '15', 10);
  const offset = (page - 1) * limit;

  try {
    let query = supabase
      .from('scnu_announcements')
      .select('*', { count: 'exact' })
      .order('posted_date', { ascending: false })
      .order('notice_num', { ascending: false })
      .range(offset, offset + limit - 1);

    // 출처 필터: 여러 값을 OR 조건으로 처리
    if (sources && sources.length > 0) {
      query = query.in('source_id', sources);
    }

    const { data, error, count } = await query;

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ success: false, error: error.message }, { status: 500 });
    }

    return NextResponse.json({
      success: true,
      data: data || [],
      total: count || 0,
      page,
      limit,
      totalPages: Math.ceil((count || 0) / limit),
    });
  } catch (err: any) {
    return NextResponse.json({ success: false, error: err.message }, { status: 500 });
  }
}
