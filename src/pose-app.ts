// CDN으로 로드된 라이브러리들에 대한 타입 선언 (TypeScript 컴파일러를 위함)
declare const tf: any;
declare const poseDetection: any;
declare const handPoseDetection: any;

// --- DOM 요소 가져오기 ---
const video = document.getElementById("camera-bg") as HTMLVideoElement; // ID 변경에 맞춰 수정
const canvas = document.getElementById("canvas") as HTMLCanvasElement;
const ctx = canvas.getContext("2d")!;

let poseDetector: any, handDetector: any;

/**
 * 사용자의 웹캠을 설정하고, 비디오와 캔버스의 크기를 전체 화면에 맞게 동적으로 조절합니다.
 */
async function setupCamera(): Promise<HTMLVideoElement> {
  let stream;
  try {
    stream = await navigator.mediaDevices.getUserMedia({
      video: {
        facingMode: "user", // 전면 카메라
        // width: { ideal: 1280 }, // 원하는 해상도
        // height: { ideal: 720 }
      },
      audio: false,
    });
    video.srcObject = stream;
  } catch (e) {
    console.error(e);
    alert("웹캠 접근이 거부되었습니다. 설정을 확인해주세요.");
    throw e;
  }

  return new Promise((resolve) => {
    video.onloadedmetadata = () => {
      // --- ✨ 전체 화면 대응을 위한 수정 ✨ ---
      // 1. 비디오의 실제 크기를 가져옵니다.
      const videoWidth = video.videoWidth;
      const videoHeight = video.videoHeight;

      // 2. 비디오의 크기를 HTML 요소에 명시적으로 설정합니다.
      video.width = videoWidth;
      video.height = videoHeight;

      // 3. 캔버스의 크기를 비디오의 실제 크기와 동일하게 맞춥니다.
      //    이렇게 해야 CSS의 object-fit으로 인해 좌표가 어긋나는 것을 방지할 수 있습니다.
      canvas.width = videoWidth;
      canvas.height = videoHeight;

      console.log(`카메라 설정 완료: ${videoWidth}x${videoHeight}`);
      resolve(video);
    };
  });
}

/**
 * 몸과 손 포즈 감지를 위한 모델들을 로드합니다.
 */
async function loadModels(): Promise<void> {
  console.log("모델 로딩...");
  // 1. 몸 포즈 감지 모델 (MoveNet)
  const poseDetectorConfig = {
    modelType: poseDetection.movenet.modelType.SINGLEPOSE_LIGHTNING,
  };
  poseDetector = await poseDetection.createDetector(
    poseDetection.SupportedModels.MoveNet,
    poseDetectorConfig
  );

  // 2. 손 포즈 감지 모델 (MediaPipeHands)
  const handDetectorConfig = {
    runtime: "mediapipe",
    solutionPath: "https://cdn.jsdelivr.net/npm/@mediapipe/hands",
    modelType: "full",
  };
  handDetector = await handPoseDetection.createDetector(
    handPoseDetection.SupportedModels.MediaPipeHands,
    handDetectorConfig
  );

  console.log("모든 모델 로딩 완료.");
}

/**
 * 예측된 몸 포즈를 캔버스에 그립니다.
 * @param pose - pose-detection 모델의 예측 결과
 */
function drawPose(pose: any): void {
  if (!pose) return;
  // 몸 관절 그리기
  for (const keypoint of pose.keypoints) {
    if (keypoint.score > 0.3) {
      ctx.beginPath();
      ctx.arc(keypoint.x, keypoint.y, 5, 0, 2 * Math.PI);
      ctx.fillStyle = "aqua";
      ctx.fill();
    }
  }
  // 몸 뼈대 그리기
  const adjacentPairs = poseDetection.util.getAdjacentPairs(
    poseDetection.SupportedModels.MoveNet
  );
  for (const [startIdx, endIdx] of adjacentPairs) {
    const startPoint = pose.keypoints[startIdx];
    const endPoint = pose.keypoints[endIdx];
    if (startPoint.score > 0.3 && endPoint.score > 0.3) {
      ctx.beginPath();
      ctx.moveTo(startPoint.x, startPoint.y);
      ctx.lineTo(endPoint.x, endPoint.y);
      ctx.strokeStyle = "lime";
      ctx.lineWidth = 2;
      ctx.stroke();
    }
  }
}

/**
 * 예측된 손 포즈를 캔버스에 그립니다.
 * @param hands - hand-pose-detection 모델의 예측 결과
 */
function drawHands(hands: any[]): void {
  if (!hands || hands.length === 0) return;

  const fingerLookup: { [key: string]: number[] } = {
    thumb: [0, 1, 2, 3, 4],
    indexFinger: [0, 5, 6, 7, 8],
    middleFinger: [0, 9, 10, 11, 12],
    ringFinger: [0, 13, 14, 15, 16],
    pinky: [0, 17, 18, 19, 20],
  };

  for (const hand of hands) {
    // 손 관절 그리기
    for (const keypoint of hand.keypoints) {
      ctx.beginPath();
      ctx.arc(keypoint.x, keypoint.y, 5, 0, 2 * Math.PI);
      ctx.fillStyle = "red";
      ctx.fill();
    }

    // 손 뼈대 그리기
    ctx.strokeStyle = "orange";
    ctx.lineWidth = 2;
    for (const finger in fingerLookup) {
      const points = fingerLookup[finger].map((idx) => hand.keypoints[idx]);
      for (let i = 0; i < points.length - 1; i++) {
        const start = points[i];
        const end = points[i + 1];
        ctx.beginPath();
        ctx.moveTo(start.x, start.y);
        ctx.lineTo(end.x, end.y);
        ctx.stroke();
      }
    }
  }
}

/**
 * 매 프레임마다 모델 예측 및 렌더링을 수행합니다.
 */
async function render(): Promise<void> {
  // 1. 비디오에서 몸과 손 포즈 동시 예측
  const [poses, hands] = await Promise.all([
    poseDetector.estimatePoses(video),
    handDetector.estimateHands(video),
  ]);

  // 2. 캔버스 초기화
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  // 3. 예측된 포즈들 그리기
  if (poses.length > 0) {
    drawPose(poses[0]);
  }
  if (hands.length > 0) {
    drawHands(hands);
  }

  // 4. 다음 프레임에서 반복
  requestAnimationFrame(render);
}

/**
 * 메인 실행 함수
 */
async function main(): Promise<void> {
  const loadingBox = document.getElementById("loading-box");
  loadingBox!.style.display = "flex"; // 로딩 표시

  await tf.setBackend("webgl");

  await setupCamera();
  video.play();

  await loadModels(); // 모델 로딩 끝날 때까지 기다림

  loadingBox!.style.display = "none"; // 로딩 숨김

  render();
}

main();
