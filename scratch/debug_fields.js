const dotenv = require('dotenv');
dotenv.config({ path: '.env.local' });
const { XMLParser } = require('fast-xml-parser');

async function debug() {
  const apiKey = process.env.YOUTH_API_KEY;
  const url = `https://www.youthcenter.go.kr/go/ythip/getPlcy?apiKeyNm=${apiKey}&pageNum=1&pageSize=3&pageType=1&rtnType=xml`;
  
  const res = await fetch(url);
  const xml = await res.text();
  
  const parser = new XMLParser({ ignoreAttributes: false, parseTagValue: true });
  const json = parser.parse(xml);
  
  const list = json.ResultVO.result.youthPolicyList;
  const policies = Array.isArray(list) ? list : [list];
  
  // 필터 관련 필드 값 확인
  for (const p of policies) {
    console.log('--- 정책명:', p.plcyNm);
    console.log('  jobCd:', p.jobCd);
    console.log('  mrgSttsCd:', p.mrgSttsCd);
    console.log('  schoolCd:', p.schoolCd);
    console.log('  plcyMajorCd:', p.plcyMajorCd);
    console.log('  earnMinAmt:', p.earnMinAmt);
    console.log('  earnMaxAmt:', p.earnMaxAmt);
    console.log('  aplyPrdSeCd:', p.aplyPrdSeCd);
    console.log('  bizPrdBgngYmd:', p.bizPrdBgngYmd);
    console.log('  bizPrdEndYmd:', p.bizPrdEndYmd);
    console.log('  aplyYmd:', p.aplyYmd);
    console.log('');
  }
}
debug();
