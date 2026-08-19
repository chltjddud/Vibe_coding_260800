const dotenv = require('dotenv');
dotenv.config({ path: '.env.local' });
const { XMLParser } = require('fast-xml-parser');

async function debug() {
  const apiKey = process.env.YOUTH_API_KEY;
  // 코드값 사전 확인: jobCd=13010, mrgSttsCd=55003, schoolCd=49010, plcyMajorCd=11009 가 어떤 의미인지 파악
  // 온통청년 API는 코드 기반이므로 코드 목록을 확인해야 함.
  // 일단 여러 정책의 jobCd, mrgSttsCd, schoolCd 분포 파악
  const url = `https://www.youthcenter.go.kr/go/ythip/getPlcy?apiKeyNm=${apiKey}&pageNum=1&pageSize=20&pageType=1&rtnType=xml`;
  
  const res = await fetch(url);
  const xml = await res.text();
  const parser = new XMLParser({ ignoreAttributes: false, parseTagValue: true });
  const json = parser.parse(xml);
  const list = json.ResultVO.result.youthPolicyList;
  const policies = Array.isArray(list) ? list : [list];
  
  const jobCds = [...new Set(policies.map(p => p.jobCd))];
  const mrgCds = [...new Set(policies.map(p => p.mrgSttsCd))];
  const schoolCds = [...new Set(policies.map(p => p.schoolCd))];
  const majorCds = [...new Set(policies.map(p => p.plcyMajorCd))];
  
  console.log('jobCd 코드값 종류:', jobCds);
  console.log('mrgSttsCd 코드값 종류:', mrgCds);
  console.log('schoolCd 코드값 종류:', schoolCds);
  console.log('plcyMajorCd 코드값 종류:', majorCds);

  // aplyYmd 형식도 확인
  const aplyYmds = policies.map(p => p.aplyYmd).filter(Boolean);
  console.log('\naplyYmd 예시:', aplyYmds.slice(0, 5));
}
debug();
