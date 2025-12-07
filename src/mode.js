const modeBtn = document.getElementById("modeBtn");
const video = document.getElementById("camera-bg");

// 초기 모드
let mode = "문자 → 수어"; // 버튼에 적힌 모드

// 비디오 초기 상태: "수어 → 문자"일 때만 보이게
updateVideoVisibility();

modeBtn.addEventListener("click", () => {
  // 🔄 모드 토글
  mode = mode === "문자 → 수어" ? "수어 → 문자" : "문자 → 수어";
  modeBtn.textContent = mode;

  // 비디오 표시 갱신
  updateVideoVisibility();
});

function updateVideoVisibility() {
  if (mode === "수어 → 문자") {
    video.classList.remove("hidden"); // ✔ 보여준다
  } else {
    video.classList.add("hidden"); // ✘ 숨긴다
  }
}
