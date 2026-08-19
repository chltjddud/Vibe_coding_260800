const { XMLParser } = require('fast-xml-parser');
const dotenv = require('dotenv');
dotenv.config({ path: '.env.local' });

async function testParse() {
  const apiKey = process.env.YOUTH_API_KEY;
  const url = `https://www.youthcenter.go.kr/go/ythip/getPlcy?apiKeyNm=${apiKey}&pageNum=1&pageSize=2&pageType=1&rtnType=xml`;
  
  try {
    const res = await fetch(url);
    const text = await res.text();
    
    const parser = new XMLParser({
      ignoreAttributes: false,
      attributeNamePrefix: '@_',
      parseTagValue: true,
    });
    
    const jsonObj = parser.parse(text);
    console.log("JSON Keys:", Object.keys(jsonObj));
    if (jsonObj.ResultVO) {
      console.log("ResultVO Keys:", Object.keys(jsonObj.ResultVO));
      if (jsonObj.ResultVO.result) {
        console.log("Result Keys:", Object.keys(jsonObj.ResultVO.result));
        const list = jsonObj.ResultVO.result.youthPolicyList;
        console.log("Is youthPolicyList Array?", Array.isArray(list));
      }
    }
  } catch(e) {
    console.error(e);
  }
}
testParse();
