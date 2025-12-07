const startBtn = document.getElementById("recordStartBtn");
const stopBtn = document.getElementById("recordStopBtn");
const statusBox = document.getElementById("status-box");
const statusText = document.getElementById("status-text");

function showStatus(text) {
  statusText.textContent = text;
  statusBox.style.opacity = "1";
}

function hideStatus() {
  statusBox.style.opacity = "0";
}

startBtn.addEventListener("click", () => {
  const mode = window.appMode;

  if (mode === "수어 → 문자") {
    showStatus("📹 녹화 중...");
  } else {
    showStatus("🎤 녹음 중...");
  }
});

stopBtn.addEventListener("click", () => {
  const mode = window.appMode;

  if (mode === "수어 → 문자") {
    showStatus("⛔ 녹화 중단되었습니다.");

    setTimeout(() => showStatus("녹화 데이터를 전송합니다..."), 2000);
  } else {
    showStatus("⛔ 녹음 중단되었습니다.");

    setTimeout(() => showStatus("녹음 데이터를 전송합니다..."), 2000);
  }

  setTimeout(() => hideStatus(), 4000);
});
