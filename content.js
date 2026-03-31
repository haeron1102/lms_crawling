 chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "crawl") {
        const urls = document.querySelectorAll('.fullname');
        
        for (let i = 0; i < urls.length; i++) {
            console.log(urls[i].href);
        }
    }
});