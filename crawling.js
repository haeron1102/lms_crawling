const cheerio = require('cheerio');

async function getHtml() {
    const original_html = await fetch("https://klms.kaist.ac.kr/");
    const modified_html = await original_html.text();

    console.log(modified_html);

    const $ = cheerio.load(modified_html);
    console.log($(".main-course-list.student").text());    
}

getHtml();