import { VRMManager } from './vrm';

// --- 기본 UI 및 카메라 설정 ---
async function startCamera() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({ video: true });
    const video = document.getElementById("camera-bg") as HTMLVideoElement;
    video.srcObject = stream;
  } catch (error) {
    console.error("Camera access failed:", error);
    alert("카메라에 접근할 수 없습니다.");
  }
}
startCamera();

// --- VRM 설정 ---
const avatarContainer = document.getElementById('avatar-container');
let vrmManager: VRMManager | null = null;

if (avatarContainer) {
  vrmManager = new VRMManager(avatarContainer);
  vrmManager.loadVRM('3DModel-Kurone/models/Kurone_all.vrm');
}

// --- 키보드 이벤트 리스너 ---
window.addEventListener('keydown', (e) => {
  if (!vrmManager) return;

  // 스페이스바: 다음 수어 동작
  if (e.code === 'Space') {
    console.log('Space key pressed');
    e.preventDefault(); // 페이지 스크롤 방지
    vrmManager.playNextSignAnimation();
  }

  // 'Z' 키: 기본 상태로 돌아가기
  if (e.key.toLowerCase() === 'z') {
    console.log('Z key pressed');
    vrmManager.resetToIdle();
  }
});


// --- UI 요소 (모드 토글, 자막) ---
const modeBtn = document.getElementById("modeBtn");
if (modeBtn) {
  let modeIndex = 0;
  const modes = ["기본", "캐주얼", "프로", "게임"];
  modeBtn.addEventListener("click", () => {
    modeIndex = (modeIndex + 1) % modes.length;
    modeBtn.innerText = `모드: ${modes[modeIndex]}`;
  });
}

const subtitle = document.getElementById("subtitle");
if (subtitle) {
  const subtitles = [
    "안녕하세요! 스페이스바를 눌러 수어를 시작하세요.",
    "Z 키를 누르면 기본 자세로 돌아갑니다.",
    "다양한 수어 동작을 확인해보세요.",
  ];
  let subIndex = 0;
  setInterval(() => {
    subtitle.innerText = subtitles[subIndex];
    subIndex = (subIndex + 1) % subtitles.length;
  }, 5000);
}
