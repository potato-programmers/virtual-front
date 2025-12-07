import { convertQwertyToHangul } from "es-hangul";

console.log("🔥 subtle.js loaded");

let buffer = "";
const subtitle = document.getElementById("subtitle");

console.log("subtitle 요소:", subtitle);

// 자막 업데이트 함수
function updateSubtitle(text) {
  console.log("updateSubtitle called:", text);
  if (!subtitle) return;
  subtitle.style.opacity = "1";
  subtitle.textContent = text;
}

// 버퍼를 변환해 자막에 반영
function updateSubtitleFromBuffer() {
  console.log("updateSubtitleFromBuffer(), buffer =", buffer);
  let raw = buffer.replace(/[0-9]/g, "");
  const text = convertQwertyToHangul(raw).trim();
  updateSubtitle(text || "입력된 문장이 없습니다.");
}

document.addEventListener("keydown", (e) => {
  console.log("keydown:", e.key);

  if (e.key === "1") {
    e.preventDefault();
    buffer = "";
    subtitle.style.opacity = "0";
    console.log("1번 → 버퍼 초기화");
    return;
  }

  if (e.key === "Enter") {
    e.preventDefault();
    console.log("Enter pressed, buffer =", buffer);
    updateSubtitleFromBuffer();
    buffer = "";
    return;
  }

  if (e.key === "Backspace") {
    buffer = buffer.slice(0, -1);
    console.log("Backspace → buffer:", buffer);
    return;
  }

  if (e.key === "Escape") {
    buffer = "";
    subtitle.style.opacity = "0";
    console.log("ESC → 초기화");
    return;
  }

  if (e.key.length === 1) {
    buffer += e.key;
    console.log("문자 입력:", e.key, "→ buffer:", buffer);
  }
});

// 카메라 배경 실행
async function startCameraBackground() {
  const video = document.getElementById("camera-bg");

  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: { facingMode: "user" },
      audio: false,
    });

    video.srcObject = stream;
  } catch (err) {
    console.error("카메라 접근 실패:", err);
  }
}

startCameraBackground();
