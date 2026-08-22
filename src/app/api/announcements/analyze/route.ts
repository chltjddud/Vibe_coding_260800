import { NextResponse } from 'next/server';
import * as cheerio from 'cheerio';
import { GoogleGenerativeAI } from '@google/generative-ai';

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(request: Request) {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json({ error: 'Gemini API 키가 설정되지 않았습니다.' }, { status: 500 });
    }

    const { link, title } = await request.json();

    if (!link) {
      return NextResponse.json({ error: '링크가 제공되지 않았습니다.' }, { status: 400 });
    }

    // 1. 공지사항 웹페이지 HTML 가져오기
    const response = await fetch(link, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
      }
    });
    
    if (!response.ok) {
      throw new Error('웹페이지를 불러오는데 실패했습니다.');
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    // 공지사항 본문 추출 시도 (주로 사용하는 클래스나 태그)
    let textContent = '';
    const possibleSelectors = ['.bd_view', '.board_view', '#print_area', 'article', '.content', 'table'];
    
    for (const selector of possibleSelectors) {
      const el = $(selector);
      if (el.length > 0) {
        textContent = el.text().replace(/\s+/g, ' ').trim();
        if (textContent.length > 100) break; // 본문으로 간주될 만큼 충분히 길면 채택
      }
    }

    if (!textContent || textContent.length < 50) {
      // 본문을 못 찾은 경우 전체 텍스트에서 불필요한 태그 제거하고 가져오기
      $('script, style, noscript, header, footer, nav').remove();
      textContent = $('body').text().replace(/\s+/g, ' ').trim();
    }

    // 너무 길면 자르기 (Gemini 토큰 제한 고려 및 처리 속도 향상)
    const truncatedText = textContent.slice(0, 3000);

    // 2. Gemini AI에게 분석 요청
    const model = genAI.getGenerativeModel({ model: 'gemini-3.6-flash' });
    
    const prompt = `
다음은 대학교/기관의 공지사항 원문 텍스트입니다.
공지사항 제목: "${title}"
공지사항 내용:
"""
${truncatedText}
"""

위 내용을 읽고 다음 정보를 JSON 형식으로만 응답해주세요. 마크다운이나 백틱 없이 순수 JSON 형태여야 합니다.
- deadline: 신청 기한 또는 마감일 (정확한 날짜, 없으면 "상시" 또는 "본문 참조")
- target: 지원 대상 또는 자격 요건 (간략하게 1줄로 요약)
- summary: 공지사항의 핵심 요약 (1~2줄)
- keywords: 이 공지사항과 관련된 국가 청년 정책을 검색하기 위한 핵심 키워드 배열 (최대 2개, 예: ["장학금", "주거"], 없으면 빈 배열)

응답 예시:
{
  "deadline": "2026.08.31 18:00까지",
  "target": "전체 학부 재학생 (휴학생 제외)",
  "summary": "2026학년도 2학기 국가장학금 1유형 신청 안내입니다.",
  "keywords": ["장학금"]
}
`;

    const result = await model.generateContent(prompt);
    const responseText = result.response.text().trim();
    
    // JSON 파싱 시도
    let parsedData;
    try {
      // 가끔 백틱(```json ... ```)이 섞여올 수 있으므로 제거
      const cleanedText = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
      parsedData = JSON.parse(cleanedText);
    } catch (parseError) {
      console.error('JSON Parse Error:', responseText);
      throw new Error('AI 응답을 해석할 수 없습니다.');
    }

    return NextResponse.json(parsedData);

  } catch (error: any) {
    console.error('AI 분석 에러:', error);
    return NextResponse.json({ error: error.message || '분석 중 오류가 발생했습니다.' }, { status: 500 });
  }
}
