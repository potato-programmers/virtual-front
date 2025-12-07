import { convertQwertyToHangul } from "es-hangul";

const input = document.getElementById("subtitleInput");
const subtitle = document.getElementById("subtitle");
const subtitleBox = document.getElementById("subtitle-box");

if (!(input instanceof HTMLInputElement) || !subtitle || !subtitleBox) {
  console.warn("자막 입력 요소를 찾을 수 없습니다.");
} else {
  let isManualInputActive = false;

  const openManualInput = () => {
    isManualInputActive = true;
    input.classList.add("is-active");
    input.value = "";
    subtitle.textContent = "자판으로 문장을 입력한 뒤 Enter를 누르세요.";
    input.focus();
  };

  const closeManualInput = () => {
    isManualInputActive = false;
    input.value = "";
    input.classList.remove("is-active");
    if (document.activeElement === input) {
      input.blur();
    }
  };

  // 1번 키 → 입력창 표시 + 포커스
  document.addEventListener("keydown", (e) => {
    if (e.key === "1" && !isManualInputActive) {
      e.preventDefault();
      openManualInput();
      return;
    }

    if (e.key === "Escape" && isManualInputActive) {
      e.preventDefault();
      closeManualInput();
    }
  });

  // 엔터 → 숫자 제거 → 영타 → 한글 변환 → 자막 표시
  input.addEventListener("keydown", (e) => {
    if (e.key !== "Enter" || e.isComposing) {
      return;
    }

    e.preventDefault();
    let raw = input.value.trim();

    // 🔥 숫자 필터링 (모든 숫자 제거)
    raw = raw.replace(/[0-9]/g, "");

    // 영타 → 한글 자동 변환
    const text = convertQwertyToHangul(raw);

    subtitle.textContent = text || raw || "입력된 문장이 없습니다.";
    input.value = "";
    closeManualInput();
  });
}
