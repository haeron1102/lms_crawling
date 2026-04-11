async function getHtml(url) {
    const class_html = await fetch(url);  // class url
    const text_html = await class_html.text();

    const parser = new DOMParser();
    const dom_html = parser.parseFromString(text_html, "text/html");

    const notice_url = dom_html.querySelector('.activity.courseboard .aalink');

    if (!notice_url || !notice_url.href) {
        return [];
    }
    
    const notice_html = await fetch(notice_url.href);  // 공지사항 url
    const text_html2 = await notice_html.text();

    const dom_html2 = parser.parseFromString(text_html2, "text/html");

    const detail_html = dom_html2.querySelectorAll('.text-left.isnew a');

    let notice_list = [];
    for (let i = 0; i < detail_html.length; i++) {
        const res = await fetch(detail_html[i].href);
        const text = await res.text();
        const dom = parser.parseFromString(text, "text/html");

        const notice_text = dom.querySelector('.courseboard_view .content');
        if (notice_text) {
            notice_list.push(notice_text.innerText.trim());
        }
    }

    return notice_list;
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "crawl") {
        const class_urls = document.querySelectorAll('.fullname');

        (async () => {
            for (let i = 0; i < class_urls.length; i++) {
                if (class_urls[i].parentNode.parentNode.parentNode.parentNode.className == 'main-course-list'){
                    break;
                }
                const className = class_urls[i].innerText.trim();
                const result = await getHtml(class_urls[i].href);

                console.log("과목명:", className);
                console.log("공지:", result);
            }
        })();
    }
});