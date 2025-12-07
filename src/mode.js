const modeBtn = document.getElementById("modeBtn");
const video = document.getElementById("camera-bg");
const canvas = document.getElementById("canvas");
const panelDescription = document.querySelector(".panel-description");

let mode = "문자 → 수어";

const recordStartBtn = document.getElementById("recordStartBtn");
const recordStopBtn = document.getElementById("recordStopBtn");

// 설명 문구 업데이트 함수
function updateDescription() {
  if (mode === "수어 → 문자") {
    panelDescription.textContent =
      "카메라로 인식된 수어를 실시간 문장으로 확인할 수 있습니다.";
  } else {
    panelDescription.textContent =
      "음성으로 입력된 문장을 자막으로 확인하고 수어로 활용할 수 있습니다.";
  }
}

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

  updateDescription();
}

// 초기 UI + 설명
updateUi();

modeBtn.addEventListener("click", () => {
  mode = mode === "문자 → 수어" ? "수어 → 문자" : "문자 → 수어";
  modeBtn.textContent = mode;

  updateUi();
});
