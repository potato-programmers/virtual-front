const startBtn = document.getElementById("recordStartBtn");
const stopBtn = document.getElementById("recordStopBtn");
const subtitleEl = document.getElementById("subtitle");

function updateSubtitle(text) {
  if (!subtitleEl) return;
  subtitleEl.style.opacity = "1";
  subtitleEl.innerText = text;
}

startBtn?.addEventListener("click", () => {
  updateSubtitle("🎤 녹음 중...");
});

stopBtn?.addEventListener("click", () => {
  updateSubtitle("⛔ 녹음 중단되었습니다.");

  setTimeout(() => {
    updateSubtitle("녹음 전송하겠습니다.");
  }, 2000);

  setTimeout(() => {
    subtitleEl.style.opacity = "0";
  }, 4000);
});
