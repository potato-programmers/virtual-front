import { convertQwertyToHangul } from "es-hangul";

const input = document.getElementById("subtitleInput");
const subtitle = document.getElementById("subtitle");
const subtitleBox = document.getElementById("subtitle-box");

// 1번 키 → 입력창 포커스
document.addEventListener("keydown", (e) => {
  if (e.key === "1") {
    input.focus();
  }
});

// 엔터 → 숫자 제거 → 영타 → 한글 변환 → 자막 표시
input.addEventListener("keydown", (e) => {
  if (e.key === "Enter") {
    let raw = input.value.trim();

    // 🔥 숫자 필터링 (모든 숫자 제거)
    raw = raw.replace(/[0-9]/g, "");

    // 영타 → 한글 자동 변환
    const text = convertQwertyToHangul(raw);

    subtitle.textContent = text;
    subtitleBox.style.display = "block";

    input.value = "";
  }
});
