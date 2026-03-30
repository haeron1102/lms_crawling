chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "getPageText") {
    const text = document.body.innerText.slice(0, 1500);
    sendResponse({ text });
    }
});