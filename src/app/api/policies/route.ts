import { NextResponse } from 'next/server';
import { XMLParser } from 'fast-xml-parser';

// 온통청년 API 코드 테이블 (실제 API 응답값 기준)
// jobCd: 13001~13009 = 제한없음, 재직자, 자영업자, 미취업자, 창업자, 단기근로자, 일용근로자, 영농종사자, 기타
// mrgSttsCd: 55001=미혼, 55002=기혼, 55003=제한없음
// schoolCd: 49001=제한없음, 49002=고졸미만, 49003=고교재학, 49004=고졸, 49005=대학재학, 49006=대졸, 49007=석박사재학이상
// 실제 확인된 값: jobCd=13010(제한없음/기타), mrgSttsCd=55003(제한없음), schoolCd=49010(제한없음)

const JOB_CODE_MAP: Record<string, number[]> = {
  '재직자': [13002],
  '자영업자': [13003],
  '미취업자': [13004],
  '창업자': [13005],
  '단기근로자': [13006],
  '일용근로자': [13007],
  '농어업인': [13008],
};

const MARRIAGE_CODE_MAP: Record<string, number[]> = {
  '미혼': [55001],
  '기혼': [55002],
};

const EDU_CODE_MAP: Record<string, number[]> = {
  '고졸': [49002, 49003, 49004],
  '대졸': [49005, 49006],
  '석사': [49007],
};

// "제한없음" 코드값 (이 경우 모든 사람에게 해당되므로 필터링에서 통과시킴)
const NO_RESTRICT_JOB = [13001, 13009, 13010];
const NO_RESTRICT_MARRIAGE = [55003];
const NO_RESTRICT_EDU = [49001, 49010];

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  
  const keyword = searchParams.get('keyword') || '';
  const zipCd = searchParams.get('zipCd') || '';
  const category = searchParams.get('category') || '';
  
  const age = searchParams.get('age') ? parseInt(searchParams.get('age') as string) : null;
  const income = searchParams.get('income') ? parseInt(searchParams.get('income') as string) : null;
  const major = searchParams.get('major') || '';
  const edu = searchParams.get('edu') || '';
  const job = searchParams.get('job') || '';
  const marriage = searchParams.get('marriage') || '';

  const apiKey = process.env.YOUTH_API_KEY;

  if (!apiKey) {
    return NextResponse.json({ error: 'API 키가 설정되지 않았습니다.' }, { status: 500 });
  }

  try {
    let apiUrl = `https://www.youthcenter.go.kr/go/ythip/getPlcy?apiKeyNm=${apiKey}&pageNum=1&pageSize=100&pageType=1&rtnType=xml`;
    
    const isTitleOnly = searchParams.get('titleOnly') !== 'false';
    
    // 일반 검색일 때만 외부 API에 키워드를 넘깁니다. 
    // AI 검색(titleOnly=false)일 때는 외부 API의 엄격한 키워드 필터링 때문에 0건이 반환되는 것을 막기 위해
    // 일단 지역/나이로 100건을 가져온 뒤, 아래의 자체 로직(제목+내용 검색)으로 필터링합니다.
    if (keyword && isTitleOnly) {
      apiUrl += `&plcyKywdNm=${encodeURIComponent(keyword)}`;
    }
    
    if (zipCd) apiUrl += `&zipCd=${encodeURIComponent(zipCd)}`;
    if (category) apiUrl += `&lclsfNm=${encodeURIComponent(category)}`;

    const response = await fetch(apiUrl);
    if (!response.ok) throw new Error(`API 통신 에러: ${response.status}`);

    const xmlData = await response.text();
    const parser = new XMLParser({ ignoreAttributes: false, attributeNamePrefix: '@_', parseTagValue: true });
    const jsonObj = parser.parse(xmlData);

    if (jsonObj?.ResultVO?.result?.youthPolicyList) {
      let list = jsonObj.ResultVO.result.youthPolicyList;
      list = Array.isArray(list) ? list : [list];

      // 현재 날짜
      const today = new Date();
      const todayStr = today.getFullYear().toString()
        + String(today.getMonth() + 1).padStart(2, '0')
        + String(today.getDate()).padStart(2, '0'); // "20260818" 형식

      const filteredList = list.filter((policy: any) => {
        // ─── 1. 신청기간 만료 정책 제외 ───
        if (policy.aplyYmd) {
          // "20260807 ~ 20260930" 형식에서 종료일 추출
          const parts = String(policy.aplyYmd).replace(/\s/g, '').split('~');
          if (parts.length === 2) {
            const endDate = parts[1].trim();
            if (endDate && endDate.length === 8 && endDate < todayStr) {
              return false;
            }
          }
        }

        // ─── 2. 나이 필터 ───
        if (age !== null) {
          const minAge = parseInt(policy.sprtTrgtMinAge);
          const maxAge = parseInt(policy.sprtTrgtMaxAge);
          if (!isNaN(minAge) && minAge > 0 && age < minAge) return false;
          if (!isNaN(maxAge) && maxAge > 0 && age > maxAge) return false;
        }

        // ─── 3. 연소득 필터 (만원 단위) ───
        if (income !== null) {
          const minEarn = parseInt(policy.earnMinAmt);
          const maxEarn = parseInt(policy.earnMaxAmt);
          if (!isNaN(minEarn) && minEarn > 0 && income < minEarn) return false;
          if (!isNaN(maxEarn) && maxEarn > 0 && income > maxEarn) return false;
        }

        // ─── 4. 취업 상태 필터 (코드 기반) ───
        if (job) {
          const policyJobCd = parseInt(policy.jobCd);
          // 제한없음 코드면 통과
          if (!NO_RESTRICT_JOB.includes(policyJobCd)) {
            const allowedCodes = JOB_CODE_MAP[job] || [];
            if (!allowedCodes.includes(policyJobCd)) return false;
          }
        }

        // ─── 5. 결혼 상태 필터 (코드 기반) ───
        if (marriage) {
          const policyMrgCd = parseInt(policy.mrgSttsCd);
          if (!NO_RESTRICT_MARRIAGE.includes(policyMrgCd)) {
            const allowedCodes = MARRIAGE_CODE_MAP[marriage] || [];
            if (!allowedCodes.includes(policyMrgCd)) return false;
          }
        }

        // ─── 6. 학력 필터 (코드 기반) ───
        if (edu) {
          const policyEduCd = parseInt(policy.schoolCd);
          if (!NO_RESTRICT_EDU.includes(policyEduCd)) {
            const allowedCodes = EDU_CODE_MAP[edu] || [];
            if (!allowedCodes.includes(policyEduCd)) return false;
          }
        }

        // ─── 7. 제목 필터 (키워드 입력 시) ───
        const isTitleOnly = searchParams.get('titleOnly') !== 'false';
        if (keyword) {
          const inTitle = policy.plcyNm && policy.plcyNm.includes(keyword);
          
          if (isTitleOnly) {
            // 일반 검색: 제목에만 있어야 함
            if (!inTitle) return false;
          } else {
            // AI 검색 (titleOnly=false): 제목이나 설명, 지원내용 중 하나라도 있어야 함
            const inDesc = policy.plcyExplnCn && policy.plcyExplnCn.includes(keyword);
            const inSupport = policy.plcySprtCn && policy.plcySprtCn.includes(keyword);
            
            if (!inTitle && !inDesc && !inSupport) return false;
          }
        }

        return true;
      });

      jsonObj.ResultVO.result.youthPolicyList = filteredList;
      jsonObj.ResultVO.result.pagging.totCount = filteredList.length;
    }

    return NextResponse.json(jsonObj);
  } catch (error) {
    console.error('청년 정책 API 에러:', error);
    return NextResponse.json({ error: '정책을 불러오는데 실패했습니다.' }, { status: 500 });
  }
}
