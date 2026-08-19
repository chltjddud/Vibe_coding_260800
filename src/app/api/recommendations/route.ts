import { NextResponse } from 'next/server';
import { GoogleGenerativeAI } from '@google/generative-ai';

// Initialize the Google Generative AI SDK
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || '');

export async function POST(request: Request) {
  try {
    if (!process.env.GEMINI_API_KEY) {
      return NextResponse.json(
        { error: 'Gemini API 키가 설정되지 않았습니다. .env.local 파일을 확인해주세요.' },
        { status: 500 }
      );
    }

    const { userProfile, situation, keyword, policies } = await request.json();

    if (!policies || policies.length === 0) {
      return NextResponse.json(
        { error: '분석할 정책 데이터가 없습니다.' },
        { status: 400 }
      );
    }

    // Prepare the model
    const model = genAI.getGenerativeModel({ model: 'gemini-3.6-flash' });

    // Prepare the prompt
    const prompt = `
당신은 청년 정책을 추천해주는 친절하고 전문적인 맞춤형 AI 상담사입니다.

[사용자 기본 프로필]
- 나이: ${userProfile?.age ? userProfile.age + '세' : '미입력'}
- 거주 지역(우편번호): ${userProfile?.zipCd || '미입력'}
- 관심 키워드: ${keyword || '없음'}

[사용자가 직접 작성한 현재 상황 및 고민]
"${situation || '상황 설명 없음'}"

[분석할 정책 목록]
${policies.map((p: any, index: number) => `
${index + 1}. 정책명: ${p.plcyNm}
   - 담당기관: ${p.sprvsnInstCdNm || p.operInstCdNm || '알 수 없음'}
   - 요약: ${p.plcyExplnCn || p.plcySprtCn || '설명 없음'}
`).join('\n')}

위 사용자 프로필과 현재 상황을 바탕으로 분석할 정책 목록 중에서 이 사용자에게 가장 도움이 될 만한 정책 3가지를 골라주세요.
반드시 아래의 JSON 배열 형식으로만 응답해주세요. 마크다운(backticks)이나 다른 텍스트는 포함하지 마세요.

[
  {
    "plcyNm": "추천하는 정책명 (위 목록과 정확히 일치해야 함)",
    "reason": "이 사용자에게 이 정책을 추천하는 이유 (친절하고 구체적인 말투로 1~2문장)",
    "conditions": "주요 제한 사항 또는 자격 조건 (간략하게 1문장)"
  }
]
`;

    // Call the model
    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();
    
    // Parse the JSON response
    let recommendations = [];
    try {
      // Remove any potential markdown formatting (like ```json ... ```)
      const cleanText = text.replace(/```json\n?/g, '').replace(/```\n?/g, '').trim();
      recommendations = JSON.parse(cleanText);

      // Attach original URLs
      recommendations = recommendations.map((rec: any) => {
        const original = policies.find((p: any) => p.plcyNm === rec.plcyNm);
        return {
          ...rec,
          url: original?.aplyUrlAddr || original?.refUrlAddr1 || '#'
        };
      });
    } catch (parseError) {
      console.error('Failed to parse AI response:', text);
      return NextResponse.json(
        { error: 'AI 응답을 처리하는 중 오류가 발생했습니다.' },
        { status: 500 }
      );
    }

    return NextResponse.json({ recommendations });
  } catch (error) {
    console.error('AI Recommendation Error:', error);
    return NextResponse.json(
      { error: 'AI 추천을 가져오는 중 오류가 발생했습니다.' },
      { status: 500 }
    );
  }
}
