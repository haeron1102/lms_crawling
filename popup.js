const summarizeBtn = document.getElementById("summarizeBtn");
const statusEl = document.getElementById("status");
const resultEl = document.getElementById("result");

summarizeBtn.addEventListener("click", async () => {
  try {
    statusEl.textContent = "현재 탭 확인 중...";
    resultEl.textContent = "";

    const [tab] = await chrome.tabs.query({
      active: true,
      currentWindow: true
    });

    if (!tab || !tab.id) {
      statusEl.textContent = "현재 탭을 찾을 수 없습니다.";
      return;
    }

    if (!tab.url || !tab.url.startsWith("https://klms.kaist.ac.kr/")) {
      statusEl.textContent = "KLMS 페이지를 열어둔 상태에서 실행해주세요.";
      return;
    }

    statusEl.textContent = "공지 내용 추출 중...";

    const response = await chrome.tabs.sendMessage(tab.id, {
      type: "EXTRACT_NOTICE"
    });

    if (!response || !response.success) {
      statusEl.textContent = response?.error || "공지 추출에 실패했습니다.";
      return;
    }

    statusEl.textContent = "요약 생성 중...";

    const summary = summarizeNotice(response.data);

    statusEl.textContent = "완료";
    resultEl.textContent = summary;
  } catch (error) {
    console.error(error);
    statusEl.textContent = "오류가 발생했습니다.";
    resultEl.textContent = String(error);
  }
});

function summarizeNotice(data) {
  const { title, content } = data;

  const clean = content
    .replace(/\s+/g, " ")
    .trim();

  const sentences = clean
    .split(/(?<=[.!?다요])\s+/)
    .filter(Boolean);

  const topSentences = sentences.slice(0, 3);

  return [
    `[제목] ${title}`,
    "",
    `[핵심 요약]`,
    ...topSentences.map((s, i) => `${i + 1}. ${s}`)
  ].join("\n");
}