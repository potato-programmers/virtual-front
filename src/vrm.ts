import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { VRM, VRMExpressionPresetName, VRMHumanBoneName, VRMLoaderPlugin, VRMUtils } from '@pixiv/three-vrm';

// 포즈 데이터 타입을 Quaternion으로 변경
type Pose = { [boneName in VRMHumanBoneName]?: THREE.Quaternion };
type SignAnimation = {
  name: string;
  pose: Pose;
};

export class VRMManager {
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private clock = new THREE.Clock();
  public vrm: VRM | null = null;

  // 애니메이션 상태 관리
  private state: 'idle' | 'signing' | 'transitioning' = 'idle';
  private signAnimations: SignAnimation[] = [];
  private currentAnimationIndex = -1;
  private transitionState: {
    startTime: number;
    duration: number;
    startPose: Pose;
    endPose: Pose;
    onComplete: () => void;
  } | null = null;

  // 기본 동작(눈 깜빡임) 관리
  private blinkTime = 0;
  private nextBlinkTime = 0;

  constructor(private container: HTMLElement) {
    const { width, height } = container.getBoundingClientRect();

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(30.0, width / height, 0.1, 20.0);
    this.camera.position.set(0.0, 1.4, 1.5);
    this.camera.lookAt(0.0, 1.2, 0.0);

    this.renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.container.appendChild(this.renderer.domElement);

    const light = new THREE.DirectionalLight(0xffffff, 3);
    light.position.set(1.0, 1.0, 1.0).normalize();
    this.scene.add(light);

    this.animate = this.animate.bind(this);
    this.setBlinkTime();
    this.createSignAnimations();
  }

  public loadVRM(modelUrl: string): void {
    const loader = new GLTFLoader();
    loader.register((parser) => new VRMLoaderPlugin(parser));

    loader.load(
      modelUrl,
      (gltf) => {
        this.vrm = gltf.userData.vrm;
        this.scene.add(this.vrm.scene);
        VRMUtils.rotateVRM0(this.vrm);
        console.log('VRM model loaded successfully');
        this.animate();
      },
      (progress) => console.log('Loading model...', 100.0 * (progress.loaded / progress.total), '%'),
      (error) => console.error(error)
    );
  }

  // --- 애니메이션 및 상태 제어 ---

  public playNextSignAnimation(): void {
    if (!this.vrm || this.state === 'transitioning' || this.signAnimations.length === 0) return;

    this.currentAnimationIndex = (this.currentAnimationIndex + 1) % this.signAnimations.length;
    const nextAnimation = this.signAnimations[this.currentAnimationIndex];
    console.log(`Transitioning to animation: ${nextAnimation.name}`);

    this.startTransition(nextAnimation.pose, 0.5, () => {
      this.state = 'signing';
    });
  }

  public resetToIdle(): void {
    if (!this.vrm || this.state === 'transitioning') return;
    console.log('Transitioning to idle state');

    // T-Pose (기본 자세)는 빈 포즈 객체로 표현
    this.startTransition({}, 0.5, () => {
      this.state = 'idle';
      this.currentAnimationIndex = -1;
    });
  }

  private startTransition(endPose: Pose, duration: number, onComplete: () => void): void {
    if (!this.vrm) return;

    this.state = 'transitioning';
    this.transitionState = {
      startTime: this.clock.getElapsedTime(),
      duration,
      startPose: this.getCurrentPose(),
      endPose,
      onComplete,
    };
  }

  private getCurrentPose(): Pose {
    if (!this.vrm) return {};
    const currentPose: Pose = {};
    for (const boneName of Object.values(VRMHumanBoneName)) {
      const boneNode = this.vrm.humanoid?.getNormalizedBoneNode(boneName);
      if (boneNode) {
        currentPose[boneName] = boneNode.quaternion.clone();
      }
    }
    return currentPose;
  }

  // --- 기본 동작 (숨쉬기, 눈 깜빡임) ---

  private setBlinkTime(): void {
    this.nextBlinkTime = this.blinkTime + 2.0 + Math.random() * 4.0;
  }

  private updateIdleState(delta: number): void {
    if (!this.vrm) return;
    this.vrm.humanoid?.resetNormalizedPose(); // 매 프레임 T-pose로 초기화 후 표정 적용

    // 눈 깜빡임
    this.blinkTime += delta;
    if (this.blinkTime > this.nextBlinkTime) {
      this.vrm.expressionManager?.setValue(VRMExpressionPresetName.Blink, 1);
      setTimeout(() => {
        this.vrm?.expressionManager?.setValue(VRMExpressionPresetName.Blink, 0);
      }, 150);
      this.blinkTime = 0;
      this.setBlinkTime();
    }

    // 숨쉬기
    const breathingValue = (Math.sin(this.clock.elapsedTime * 0.7) * 0.5 + 0.5) * 0.05;
    this.vrm.expressionManager?.setValue(VRMExpressionPresetName.A, breathingValue);
  }

  // --- 렌더링 루프 ---

  private updateTransition(): void {
    if (!this.transitionState || !this.vrm) return;

    const { startTime, duration, startPose, endPose, onComplete } = this.transitionState;
    const elapsedTime = this.clock.getElapsedTime() - startTime;
    const progress = Math.min(elapsedTime / duration, 1.0);

    // 모든 Humanoid 뼈에 대해 보간 적용
    for (const boneName of Object.values(VRMHumanBoneName)) {
      const boneNode = this.vrm.humanoid?.getNormalizedBoneNode(boneName);
      if (!boneNode) continue;

      const startQuat = startPose[boneName] || new THREE.Quaternion();
      const endQuat = endPose[boneName] || new THREE.Quaternion();
      
      // <<< 여기를 수정했습니다. >>>
      boneNode.quaternion.copy(startQuat).slerp(endQuat, progress);
    }

    if (progress >= 1.0) {
      this.transitionState = null;
      onComplete();
    }
  }

  private animate(): void {
    requestAnimationFrame(this.animate);
    const delta = this.clock.getDelta();

    if (this.vrm) {
      if (this.state === 'idle') {
        this.updateIdleState(delta);
      } else if (this.state === 'transitioning') {
        this.updateTransition();
      }
      // 'signing' 상태에서는 마지막 포즈가 유지됨

      this.vrm.update(delta);
    }

    this.renderer.render(this.scene, this.camera);
  }

  // --- 수어 애니메이션 정의 (Quaternion 사용) ---

  private createSignAnimations(): void {
    const PI = Math.PI;

    const createQuat = (x: number, y: number, z: number) => new THREE.Quaternion().setFromEuler(new THREE.Euler(x, y, z));

    // 수어 1: "안녕"
    this.signAnimations.push({
      name: 'Hello',
      pose: {
        [VRMHumanBoneName.RightShoulder]: createQuat(0, 0, -PI * 0.2),
        [VRMHumanBoneName.RightUpperArm]: createQuat(0, 0, -PI * 0.6),
        [VRMHumanBoneName.RightLowerArm]: createQuat(0, 0, -PI * 0.1),
      },
    });

    // 수어 2: "감사합니다"
    this.signAnimations.push({
      name: 'Thank you',
      pose: {
        [VRMHumanBoneName.RightShoulder]: createQuat(0, 0, 0),
        [VRMHumanBoneName.RightUpperArm]: createQuat(PI * 0.1, -PI * 0.2, PI * 0.3),
        [VRMHumanBoneName.RightLowerArm]: createQuat(0, -PI * 0.6, 0),
        [VRMHumanBoneName.LeftUpperArm]: createQuat(0, PI * 0.1, 0),
        [VRMHumanBoneName.LeftLowerArm]: createQuat(0, PI * 0.1, 0),
      },
    });

    // 수어 3: "사랑합니다"
    this.signAnimations.push({
        name: 'Love',
        pose: {
            [VRMHumanBoneName.RightShoulder]: createQuat(0, 0, -PI * 0.2),
            [VRMHumanBoneName.RightUpperArm]: createQuat(PI * 0.2, -PI * 0.2, -PI * 0.5),
            [VRMHumanBoneName.RightLowerArm]: createQuat(-PI * 0.5, -PI * 0.5, 0),
            [VRMHumanBoneName.LeftShoulder]: createQuat(0, 0, PI * 0.2),
            [VRMHumanBoneName.LeftUpperArm]: createQuat(PI * 0.2, PI * 0.2, PI * 0.5),
            [VRMHumanBoneName.LeftLowerArm]: createQuat(-PI * 0.5, PI * 0.5, 0),
        }
    });
  }
}
