document.querySelector('#crawlBtn').addEventListener("click", async () => {
    const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });

    await chrome.storage.local.remove(['lmsProgress', 'lmsDone', 'lmsResults', 'lmsError']);

    document.querySelector('#result').innerHTML = `
        <div class="loading">
            <div class="spinner"></div>
            <span class="progress-text">과목 목록 불러오는 중...</span>
            <div class="progress-bar-wrap">
                <div class="progress-bar" style="width: 0%"></div>
            </div>
        </div>`;

    chrome.tabs.sendMessage(tab.id, { action: "crawl" });
});

document.querySelector('#saveKey').addEventListener("click", async () => {
    const input = document.getElementById("apiKeyInput");
    const key = input.value.trim();
    if (!key) return;

    const btn = document.querySelector('#saveKey');
    btn.textContent = "확인 중...";
    btn.disabled = true;

    try {
        const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
            method: "POST",
            headers: {
                "Authorization": `Bearer ${key}`,
                "Content-Type": "application/json",
            },
            body: JSON.stringify({
                model: "llama-3.1-8b-instant",
                messages: [{ role: "user", content: "hi" }],
                max_tokens: 1,
            }),
        });

        if (res.ok) {
            chrome.storage.local.set({ apiKey: key });
            input.value = "";
            input.placeholder = "✓ 저장되었습니다.";
            input.style.borderColor = "#16a34a";
        } else {
            input.placeholder = "✗ 유효하지 않은 키입니다.";
            input.style.borderColor = "#dc2626";
        }
    } catch (e) {
        input.placeholder = "✗ 네트워크 오류";
        input.style.borderColor = "#dc2626";
    }

    input.value = "";
    btn.textContent = "확인";
    btn.disabled = false;

    setTimeout(() => {
        input.placeholder = "API key를 입력하세요";
        input.style.borderColor = "";
    }, 3000);
});

chrome.storage.onChanged.addListener((changes, area) => {
    if (area !== 'local') return;

    if (changes.lmsProgress?.newValue) {
        const { current, total, label } = changes.lmsProgress.newValue;
        const pct = total > 0 ? Math.round((current / total) * 100) : 0;
        const text = document.querySelector('.progress-text');
        const bar = document.querySelector('.progress-bar');
        if (text) text.textContent = label ?? `${current} / ${total} 과목 처리 중...`;
        if (bar) bar.style.width = `${pct}%`;
    }

    if (changes.lmsDone?.newValue === true) {
        chrome.storage.local.get(['lmsResults', 'lmsError'], ({ lmsResults, lmsError }) => {
            const resultEl = document.querySelector('#result');
            if (lmsError) {
                resultEl.innerText = `오류 발생: ${lmsError}`;
            } else if (!lmsResults || lmsResults.length === 0) {
                resultEl.innerText = "공지사항이 없습니다.";
            } else {
                resultEl.innerText = lmsResults.map(r => `${r.className}\n${r.result}`).join('\n\n');
            }
        });
    }
});