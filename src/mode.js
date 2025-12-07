const modeBtn = document.getElementById("modeBtn");
const video = document.getElementById("camera-bg");
const canvas = document.getElementById("canvas");

let mode = "문자 → 수어";

const recordStartBtn = document.getElementById("recordStartBtn");
const recordStopBtn = document.getElementById("recordStopBtn");

// UI 전체 업데이트 함수
function updateUi() {
  if (mode === "수어 → 문자") {
    // 카메라 모드
    video.classList.remove("hidden");
    canvas.classList.remove("hidden");
    document.body.classList.add("video-active");
    document.body.classList.remove("no-video");

    recordStartBtn.disabled = true;
    recordStopBtn.disabled = true;
  } else {
    // 텍스트 입력 모드
    video.classList.add("hidden");
    canvas.classList.add("hidden");
    document.body.classList.remove("video-active");
    document.body.classList.add("no-video");

    recordStartBtn.disabled = false;
    recordStopBtn.disabled = false;
  }
}

// 초기 UI 설정
updateUi();

modeBtn.addEventListener("click", () => {
  mode = mode === "문자 → 수어" ? "수어 → 문자" : "문자 → 수어";
  modeBtn.textContent = mode;

  updateUi(); // 🔥 반드시 호출해야 함
});
