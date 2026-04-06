async function getHtml(url) {
    const class_html = await fetch(url);
    const text_html = await class_html.text();

    const parser = new DOMParser();
    const dom_html = parser.parseFromString(text_html, "text/html");

    const notice_url = dom_html.querySelector('.activity.courseboard .aalink');
    
    if (!notice_url) {
        return null
    } else {
        return notice_url.href         
    }
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "crawl") {
        const class_urls = document.querySelectorAll('.fullname');
        
        for(let i = 0; i < class_urls.length; i++) {
            getHtml(class_urls[i].href);
        }
    }
});