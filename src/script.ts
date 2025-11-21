import { VRMManager } from './vrm';

// ▶ 카메라 시작
async function startCamera() {
  try {
    const stream = await navigator.mediaDevices.getUserMedia({
      video: true,
    });
    const video = document.getElementById("camera-bg") as HTMLVideoElement;
    video.srcObject = stream;
  } catch (error) {
    alert("카메라 접근 실패: " + error);
  }
}
startCamera();

// ▶ VRM 모델 로드
const avatarContainer = document.getElementById('avatar-container');
if (avatarContainer) {
  const vrmManager = new VRMManager(avatarContainer);
  vrmManager.loadVRM('3DModel-Kurone/models/Kurone_all.vrm');
}


// ▶ 모드 토글 버튼
let modeIndex = 0;
const modes = ["기본", "캐주얼", "프로", "게임"];

document.getElementById("modeBtn")!.addEventListener("click", () => {
  modeIndex = (modeIndex + 1) % modes.length;
  document.getElementById("modeBtn")!.innerText = `모드: ${modes[modeIndex]}`;
});

// ▶ 자막 바꾸는 예시 (5초마다 변경)
const subtitles = [
  "안녕하세요!",
  "카메라가 활성화되었습니다.",
  "아바타 모드를 설정해보세요.",
  "자막은 여기 표시됩니다.",
];

let subIndex = 0;
setInterval(() => {
  const subtitle = document.getElementById("subtitle")!;
  subtitle.innerText = subtitles[subIndex];
  subIndex = (subIndex + 1) % subtitles.length;
}, 5000);
