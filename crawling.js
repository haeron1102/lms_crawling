const axios = require('axios');

async function getHtml() {
    const html = await axios.get("https://klms.kaist.ac.kr/");
    console.log(html.data);
}

getHtml();