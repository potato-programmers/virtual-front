import { convertQwertyToHangul } from "es-hangul";

console.log("🔥 subtle.js loaded");

let buffer = "";
const subtitle = document.getElementById("subtitle");
const subtitleBox = document.getElementById("subtitle-box");

function updateSubtitle(text) {
  if (!subtitle) return;
  subtitle.style.opacity = "1";
  subtitleBox.style.opacity = "1";
  subtitle.textContent = text;
}

function updateSubtitleFromBuffer() {
  const mode = window.appMode; // 🔥 항상 최신 모드 가져오기

  if (mode === "문자 → 수어") {
    console.log("❌ 문자→수어 모드이므로 입력 차단");
    return;
  }

  let raw = buffer.replace(/[0-9]/g, "");
  const text = convertQwertyToHangul(raw).trim();
  updateSubtitle(text || "입력된 문장이 없습니다.");
}

document.addEventListener("keydown", (e) => {
  const mode = window.appMode; // 🔥 최신 모드 다시 체크
  console.log("keydown:", e.key, "mode:", mode);

  // ⛔ 문자 → 수어 모드에서는 입력 자체 차단
  if (mode === "문자 → 수어") {
    console.log("❌ 문자→수어 모드 - 키입력 차단됨");
    return;
  }

  // 입력 허용 구간 (수어 → 문자일 때만)
  if (e.key === "1") {
    e.preventDefault();
    buffer = "";
    subtitle.style.opacity = "0";
    return;
  }

  if (e.key === "Enter") {
    e.preventDefault();
    updateSubtitleFromBuffer();
    buffer = "";
    return;
  }

  if (e.key === "Backspace") {
    buffer = buffer.slice(0, -1);
    return;
  }

  if (e.key === "Escape") {
    buffer = "";
    subtitle.style.opacity = "0";
    return;
  }

  if (e.key.length === 1) {
    buffer += e.key;
  }
});
