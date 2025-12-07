import { convertQwertyToHangul } from "es-hangul";

let buffer = "";
const subtitleText = document.getElementById("subtitle-text");
const subtitleBox = document.getElementById("subtitle-box");

// 자막 표시
function showSubtitle(text) {
  subtitleBox.style.opacity = "1";
  subtitleText.textContent = text;
}

// 자막 숨기기
function hideSubtitle() {
  subtitleBox.style.opacity = "0";
}

function updateSubtitleFromBuffer() {
  const mode = window.appMode;
  if (mode === "문자 → 수어") return; // 입력 차단

  const clean = buffer.replace(/[0-9]/g, "");
  const text = convertQwertyToHangul(clean).trim();
  showSubtitle(text || "입력된 문장이 없습니다.");
}

document.addEventListener("keydown", (e) => {
  const mode = window.appMode;

  if (mode === "문자 → 수어") return; // 입력 불가 모드

  if (e.key === "1") {
    e.preventDefault();
    console.log("1번 → 버퍼 초기화 & 자막 숨김");
    buffer = "";
    hideSubtitle();
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
    hideSubtitle();
    return;
  }

  if (e.key.length === 1) {
    buffer += e.key;
  }
});
