document.querySelector('#crawlBtn').addEventListener("click", async () => {
    const [tab] = await chrome.tabs.query( {active : true, currentWindow : true });

    chrome.tabs.sendMessage(tab.id, { action : "crawl"} );
    document.querySelector('#result').innerText = "잠시만 기다려주세요..";
});

document.querySelector('#saveKey').addEventListener("click", () => {
    const key = document.getElementById("apiKeyInput").value;
    chrome.storage.local.set({ apiKey : key });
});