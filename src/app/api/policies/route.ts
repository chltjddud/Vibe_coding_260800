import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  // TODO: 추후 온통청년 API 승인이 완료되면 이 곳에서 외부 API를 호출하도록 변경합니다.
  // URLSearchParams를 통해 넘어온 필터 조건(학점, 소득분위 등)을 받아 API에 전달할 수 있습니다.
  
  const { searchParams } = new URL(request.url);
  const gpa = parseFloat(searchParams.get('gpa') || '0');
  const income = parseInt(searchParams.get('income') || '10');

  console.log(`[API Mock] 필터 조건 - 학점: ${gpa}, 소득분위: ${income}`);

  // 임시 더미 데이터 (온통청년 API가 연결되기 전까지 화면에 보여줄 데이터)
  const mockPolicies = [
    {
      id: "api-1",
      type: "policy",
      title: "[온통청년] 청년월세 한시 특별지원",
      description: "경제적 어려움을 겪는 청년층의 주거비 부담 경감을 위해 월세를 지원합니다.",
      min_gpa: 0,
      max_income_quintile: 5,
      deadline: "2026-12-31",
      apply_url: "https://www.youthcenter.go.kr"
    },
    {
      id: "api-2",
      type: "scholarship",
      title: "[온통청년] 청년내일저축계좌",
      description: "일하는 청년이 사회에 안착할 수 있도록 자산형성을 지원합니다.",
      min_gpa: 0,
      max_income_quintile: 3,
      deadline: "2026-10-31",
      apply_url: "https://www.youthcenter.go.kr"
    },
    {
      id: "api-3",
      type: "policy",
      title: "[온통청년] 청년취업성공패키지",
      description: "저소득 취업취약계층에 대하여 통합적인 취업지원 프로그램을 제공합니다.",
      min_gpa: 0,
      max_income_quintile: 8,
      deadline: "상시",
      apply_url: "https://www.youthcenter.go.kr"
    }
  ];

  // 더미 데이터 필터링 (실제 API 연결 시 API에서 자체 필터링을 지원할 수 있음)
  const filtered = mockPolicies.filter(
    (p) => p.min_gpa <= gpa && p.max_income_quintile >= income
  );

  return NextResponse.json({ data: filtered });
}
