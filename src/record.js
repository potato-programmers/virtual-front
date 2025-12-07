const startBtn = document.getElementById("recordStartBtn");
const stopBtn = document.getElementById("recordStopBtn");
const subtitleEl = document.getElementById("subtitle");
const subtitleBox = document.getElementById("subtitle-box");

// 자막 출력 함수
function updateSubtitle(text) {
  subtitleBox.style.opacity = "1"; // 부모 박스 보이기
  subtitleEl.innerText = text;
}

// start 버튼
startBtn?.addEventListener("click", () => {
  const mode = window.appMode;

  if (mode === "수어 → 문자") {
    updateSubtitle("📹 녹화 중...");
  } else {
    updateSubtitle("🎤 녹음 중...");
  }
});

// stop 버튼
stopBtn?.addEventListener("click", () => {
  const mode = window.appMode;

  if (mode === "수어 → 문자") {
    updateSubtitle("⛔ 녹화 중단되었습니다.");

    setTimeout(() => {
      updateSubtitle("녹화 데이터를 전송하겠습니다.");
    }, 2000);
  } else {
    updateSubtitle("⛔ 녹음 중단되었습니다.");

    setTimeout(() => {
      updateSubtitle("녹음 데이터를 전송하겠습니다.");
    }, 2000);
  }

  // 4초 후 자막 숨기기
  setTimeout(() => {
    subtitleBox.style.opacity = "0";
  }, 4000);
});
