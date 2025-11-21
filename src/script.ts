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

// --- VRM 및 애니메이션 설정 ---
const avatarContainer = document.getElementById('avatar-container');
let vrmManager: VRMManager | null = null;

async function initializeVRM() {
  if (!avatarContainer) {
    console.error("Avatar container not found!");
    return;
  }

  vrmManager = new VRMManager(avatarContainer);

  try {
    // VRM 모델 로드
    await vrmManager.loadVRM('3DModel-Kurone/models/Kurone.vrm');

    // JSON 애니메이션 파일들 로드
    const animationUrls = [
      './actions/hello.json',
      './actions/thankyou.json',
      './actions/love.json',
    ];

    for (const url of animationUrls) {
      await vrmManager.loadAnimationFromJSON(url);
    }

    console.log("VRM and JSON animations are ready.");
    const subtitle = document.getElementById("subtitle");
    if (subtitle) {
      subtitle.innerText = "안녕하세요! 스페이스바를 눌러 수어를 시작하세요.";
    }

  } catch (error) {
    console.error("Failed to load VRM or animations:", error);
    alert("모델 또는 애니메이션을 로드하는 데 실패했습니다.");
  }
}

initializeVRM();


// --- 키보드 이벤트 리스너 ---
window.addEventListener('keydown', (e) => {
  if (!vrmManager) return;

  if (e.code === 'Space') {
    e.preventDefault();
    vrmManager.playNextSignAnimation();
  }

  if (e.key.toLowerCase() === 'z') {
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
  subtitle.innerText = "모델을 로드하는 중입니다...";
}
