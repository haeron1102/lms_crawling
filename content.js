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

async function return_summarize(content, className) {
    const saveKey = await chrome.storage.local.get(["apiKey"]);
    const OPENROUTER_API_KEY = saveKey.apiKey;

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
            "Authorization": `Bearer ${OPENROUTER_API_KEY}`,
            "Content-Type": "application/json",
        },
        body: JSON.stringify({
            "model": "llama-3.1-8b-instant",
            "messages": [
                {
                    "role": "system",
                    "content": "공지사항을 요약해줘 날짜가 있다면 포함해주고 퀴즈나 시험관련 내용인 경우에는 시험 범위도 포함해줘 공지사항은 대학교 강의에 대한 공지이니 과목과 관련된 내용일거야 링크같이 자잘한 거는 포함하지 않아도돼 있는 내용 그대로 요약하면돼 영문설명은 하지 않아도돼"
                },
                {
                    "role": "user",
                    "content": `과목명: ${className}\n\n${content}`
                }
            ]
        })
    });

    if (!response.ok) {
        const err = await response.json().catch(() => ({}));
        throw new Error(`API 오류 ${response.status}: ${err?.error?.message ?? '알 수 없는 오류'}`);
    }

    const result = await response.json();
    return result.choices?.[0]?.message?.content ?? '요약 실패';
}

function setProgress(current, total, label) {
    chrome.storage.local.set({ lmsProgress: { current, total, label } });
}

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (request.action === "crawl") {
        const class_urls = document.querySelectorAll('.fullname');

        (async () => {
            try {
                const validUrls = [];
                for (let i = 0; i < class_urls.length; i++) {
                    const node = class_urls[i].parentNode?.parentNode?.parentNode?.parentNode;
                    if (!node || node.className === 'main-course-list') break;
                    validUrls.push(class_urls[i]);
                }

                const total = validUrls.length;
                setProgress(0, total, `총 ${total}개 과목 처리 시작...`);

                const allResults = [];
                for (let i = 0; i < validUrls.length; i++) {
                    const className = validUrls[i].innerText.trim();

                    setProgress(i, total, `(${i + 1}/${total}) ${className} 공지 확인 중...`);
                    const content = await getHtml(validUrls[i].href);

                    if (content.length != 0) {
                        setProgress(i, total, `(${i + 1}/${total}) ${className} 요약 중...`);
                        const result = await return_summarize(content.join('\n\n'), className);
                        allResults.push({ className: "과목명 : " + className, result: "공지 : " + result });
                    }

                    setProgress(i + 1, total, `${i + 1} / ${total} 완료`);
                }

                chrome.storage.local.set({ lmsDone: true, lmsResults: allResults });
            } catch (e) {
                chrome.storage.local.set({ lmsDone: true, lmsResults: [], lmsError: e.message });
            }
        })();
    }
});