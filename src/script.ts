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

// ▶ 아바타 영상 설정 (더블 버퍼로 전환 시 깜빡임 방지)
const v1 = document.getElementById("avatarVideo") as HTMLVideoElement;
const v2 = document.getElementById("avatarVideo2") as HTMLVideoElement;

// 재생할 영상 목록 (원하는 경로로 교체/추가하세요)
const playlist = [
  "test.mp4",
  "test2.mp4",
  "test3.mp4",
];

let currentIndex = 0; // vShow에 표시 중인 인덱스
let videoEnded = false; // 현재 표시 중인 영상이 끝났는지 플래그

// 현재 표시 비디오와 숨김 비디오 참조
let vShow = v1;
let vHide = v2;

// 숨김 비디오의 사전 로드 준비 상태
let hideReady = false;

function setSrcAndLoad(videoEl: HTMLVideoElement, src: string) {
  hideReady = false;
  videoEl.src = src;
  videoEl.currentTime = 0;
  videoEl.load();
  const onReady = () => {
    hideReady = true;
    videoEl.removeEventListener("canplaythrough", onReady);
    videoEl.removeEventListener("loadeddata", onReady);
  };
  // 브라우저별 호환: canplaythrough 또는 loadeddata 중 먼저 오는 이벤트 사용
  videoEl.addEventListener("canplaythrough", onReady, { once: true });
  videoEl.addEventListener("loadeddata", onReady, { once: true });
}

// 초기: vShow에 첫 영상 지정 (자동재생 안 함), vHide에 다음 영상 사전 로드
function initPlaylist() {
  vShow.src = playlist[currentIndex];
  vShow.currentTime = 0;
  // 다음 영상 프리로드
  const nextIdx = (currentIndex + 1) % playlist.length;
  setSrcAndLoad(vHide, playlist[nextIdx]);
}

initPlaylist();

// 표시 중 영상이 끝나면 플래그만 설정 (화면은 정지 상태 유지)
vShow.addEventListener("ended", () => {
  videoEnded = true;
});

// 다음 영상으로 스무스 전환
async function switchToNext() {
  // 프리로드가 아직이면 잠깐 대기
  if (!hideReady) {
    await new Promise((r) => setTimeout(r, 50));
  }
  if (!hideReady) {
    // 여전히 준비 안됐다면 준비될 때까지 대기
    await new Promise<void>((resolve) => {
      const onReady = () => resolve();
      vHide.addEventListener("canplaythrough", onReady, { once: true });
      vHide.addEventListener("loadeddata", onReady, { once: true });
    });
  }

  // 숨겨진 비디오를 재생 시작 후 표시로 전환 (첫 프레임 렌더 보장)
  try {
    vHide.currentTime = 0;
    await vHide.play();
  } catch (e) {
    // 사용자의 제스처 조건 등으로 play 실패할 경우 무시
  }

  // DOM 표시 전환 (깜빡임 최소화)
  vShow.style.display = "none";
  vHide.style.display = "block";

  // 이전 표시 비디오 정지
  try {
    vShow.pause();
  } catch {}

  // 참조 교체
  const prevShow = vShow;
  vShow = vHide;
  vHide = prevShow;

  // 인덱스 갱신 및 다음 영상 프리로드
  currentIndex = (currentIndex + 1) % playlist.length;
  const nextIdx = (currentIndex + 1) % playlist.length;
  setSrcAndLoad(vHide, playlist[nextIdx]);

  // 새 표시 비디오의 ended 이벤트 재연결 보장
  vShow.onended = () => {
    videoEnded = true;
  };

  videoEnded = false;
}

// 스페이스바 제어: 처음 누르면 재생, 끝나면 멈춤, 다시 누르면 다음 영상(사전 로드됨)으로 전환
window.addEventListener("keydown", async (e) => {
  if (e.code === "Space" || e.key === " ") {
    e.preventDefault(); // 스페이스바 페이지 스크롤 방지

    if (videoEnded) {
      await switchToNext();
      return;
    }

    if (vShow.paused) {
      try {
        await vShow.play();
      } catch {}
    }
  }
});

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
