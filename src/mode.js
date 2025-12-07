const modeBtn = document.getElementById("modeBtn");
const video = document.getElementById("camera-bg");
const canvas = document.getElementById("canvas");
const panelDescription = document.querySelector(".panel-description");

const subtitle = document.getElementById("subtitle");
const subtitleBox = document.getElementById("subtitle-box");

let mode = "문자 → 수어";
window.appMode = mode; // 최초 등록

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

function updateUi() {
  if (mode === "수어 → 문자") {
    video.classList.remove("hidden");
    canvas.classList.remove("hidden");

    recordStartBtn.textContent = "녹화 시작";
    recordStopBtn.textContent = "녹화 중단";
  } else {
    video.classList.add("hidden");
    canvas.classList.add("hidden");

    recordStartBtn.textContent = "녹음 시작";
    recordStopBtn.textContent = "녹음 중단";
  }

  updateDescription();
}

// 초기 UI + 설명
updateUi();

modeBtn.addEventListener("click", () => {
  mode = mode === "문자 → 수어" ? "수어 → 문자" : "문자 → 수어";
  window.appMode = mode; // 🔥🔥🔥 여기 추가해야 한다!!
  modeBtn.textContent = mode;
  updateUi();
});
