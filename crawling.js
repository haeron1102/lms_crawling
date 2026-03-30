async function getHtml() {
    // const original_html = await fetch("https://klms.kaist.ac.kr/");
    // const modified_html = await original_html.text();

    // console.log(modified_html);

    const urls = document.querySelectorAll('.fullname')
    
    for(let i = 0; i < urls.length; i++) {
        console.log(urls[i].href)
    }
}

getHtml();