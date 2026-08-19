const dotenv = require('dotenv');
dotenv.config({ path: '.env.local' });

async function testApi() {
  const apiKey = process.env.YOUTH_API_KEY;
  console.log('Using API Key:', apiKey);
  const url = `https://www.youthcenter.go.kr/go/ythip/getPlcy?apiKeyNm=${apiKey}&pageNum=1&pageSize=5&pageType=1&rtnType=xml`;
  
  try {
    const res = await fetch(url);
    const text = await res.text();
    console.log('--- API Response ---');
    console.log(text.substring(0, 1000));
  } catch(e) {
    console.error(e);
  }
}

testApi();
