document.querySelector('#crawlBtn').addEventListener("click", async () => {
    const [tab] = await chrome.tabs.query( {active : true, currentWindow : true });

    chrome.tabs.sendMessage(tab.id, { action : "crawl"} );
    document.querySelector('#result').innerText = "";
});

document.querySelector('#saveKey').addEventListener("click", () => {
    const input = document.getElementById("apiKeyInput");
    chrome.storage.local.set({ apiKey : input.value });
    
    input.value = "";
    input.placeholder = "저장되었습니다.";
});

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "notice") {
        document.querySelector('#result').innerText += `${request.className}\n${request.result}\n`;
    }
});