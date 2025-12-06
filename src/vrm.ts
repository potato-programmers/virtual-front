import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { VRM, VRMExpressionPresetName, VRMHumanBoneName, VRMLoaderPlugin, VRMUtils } from '@pixiv/three-vrm';

// JSON 애니메이션 데이터 타입을 위한 인터페이스
interface AnimationData {
  name: string;
  duration: number;
  tracks: Array<{
    bone: VRMHumanBoneName;
    type: 'vector';
    times: number[];
    values: number[];
  }>;
}

export class VRMManager {
  private declare scene: THREE.Scene;
  private declare camera: THREE.PerspectiveCamera;
  private declare renderer: THREE.WebGLRenderer;
  private clock: THREE.Clock;
  public vrm: VRM | null;

  private mixer: THREE.AnimationMixer | null;
  private animations: Map<string, THREE.AnimationClip>;
  private animationNames: string[];
  private currentAction: THREE.AnimationAction | null;

  private state: 'idle' | 'signing';
  private blinkTime: number;
  private nextBlinkTime: number;

  constructor(container: HTMLElement) {
    this.clock = new THREE.Clock();
    this.vrm = null;
    this.mixer = null;
    this.animations = new Map();
    this.animationNames = [];
    this.currentAction = null;
    this.state = 'idle';
    this.blinkTime = 0;
    this.nextBlinkTime = 0;

    const { width, height } = container.getBoundingClientRect();

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(30.0, width / height, 0.1, 20.0);
    this.camera.position.set(0.0, 1.0, 2.5);
    this.camera.lookAt(0.0, 1.05, 0.0);

    this.renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    container.appendChild(this.renderer.domElement);

    const light = new THREE.DirectionalLight(0xffffff, 3);
    light.position.set(1.0, 1.0, 1.0).normalize();
    this.scene.add(light);

    this.setBlinkTime();
  }

  public async loadVRM(modelUrl: string): Promise<void> {
    const loader = new GLTFLoader();
    loader.register((parser) => new VRMLoaderPlugin(parser));
    const gltf = await loader.loadAsync(modelUrl);
    const loadedVrm = gltf.userData.vrm as VRM | undefined;

    if (!loadedVrm) {
      throw new Error('VRM 데이터를 가져오지 못했습니다.');
    }

    this.vrm = loadedVrm;
    this.scene.add(loadedVrm.scene);
    VRMUtils.rotateVRM0(loadedVrm);

    this.mixer = new THREE.AnimationMixer(loadedVrm.scene);
    
    console.log('VRM model loaded successfully');
    this.animate();
  }

  public async loadAnimationFromJSON(url: string): Promise<void> {
    const response = await fetch(url);
    const data: AnimationData = await response.json();
    
    if (!this.vrm) {
      console.error("VRM model not loaded before loading animations.");
      return;
    }

    const tracks: THREE.KeyframeTrack[] = [];
    for (const trackData of data.tracks) {
      const boneNode = this.vrm.humanoid?.getNormalizedBoneNode(trackData.bone);
      if (!boneNode) {
        console.warn(`Bone "${trackData.bone}" not found in VRM model.`);
        continue;
      }
      
      const euler = new THREE.Euler();
      const quaternion = new THREE.Quaternion();
      const values: number[] = [];

      for (let i = 0; i < trackData.values.length; i += 3) {
        euler.set(trackData.values[i], trackData.values[i+1], trackData.values[i+2]);
        quaternion.setFromEuler(euler);
        values.push(quaternion.x, quaternion.y, quaternion.z, quaternion.w);
      }

      const track = new THREE.QuaternionKeyframeTrack(
        `${boneNode.name}.quaternion`,
        trackData.times,
        values
      );
      tracks.push(track);
    }

    const clip = new THREE.AnimationClip(data.name, data.duration, tracks);
    this.animations.set(data.name, clip);
    this.animationNames.push(data.name);
    console.log(`Animation "${data.name}" loaded and converted from JSON.`);
  }

  public playNextSignAnimation(): void {
    if (!this.mixer || this.animations.size === 0) return;

    this.state = 'signing';
    
    const currentIndex = this.currentAction ? this.animationNames.indexOf(this.currentAction.getClip().name) : -1;
    const nextIndex = (currentIndex + 1) % this.animationNames.length;
    const nextAnimationName = this.animationNames[nextIndex];
    
    const clip = this.animations.get(nextAnimationName);
    if (!clip) return;

    const nextAction = this.mixer.clipAction(clip);
    
    // 애니메이션을 처음부터 재생하기 위해 리셋
    nextAction.reset();
    
    nextAction.setLoop(THREE.LoopOnce, 1);
    nextAction.clampWhenFinished = true;
    
    console.log(`Playing animation: ${nextAnimationName}`);

    // 현재 재생중인 액션이 있으면 부드럽게 전환, 없으면 그냥 페이드인
    if (this.currentAction) {
      this.currentAction.crossFadeTo(nextAction, 0.3, true);
    } else {
      nextAction.fadeIn(0.3);
    }
    
    nextAction.play();
    this.currentAction = nextAction;
  }

  public resetToIdle(): void {
    if (!this.mixer || !this.currentAction) return;
    
    console.log('Resetting to idle state');
    this.currentAction.fadeOut(0.5);
    this.currentAction = null;
    this.state = 'idle';
  }

  private setBlinkTime(): void {
    this.nextBlinkTime = this.blinkTime + 2.0 + Math.random() * 4.0;
  }

  private updateIdleState(delta: number): void {
    if (!this.vrm) return;

    this.blinkTime += delta;
    if (this.blinkTime > this.nextBlinkTime) {
      this.vrm.expressionManager?.setValue(VRMExpressionPresetName.Blink, 1);
      setTimeout(() => {
        this.vrm?.expressionManager?.setValue(VRMExpressionPresetName.Blink, 0);
      }, 150);
      this.blinkTime = 0;
      this.setBlinkTime();
    }

    const breathingValue = (Math.sin(this.clock.elapsedTime * 0.7) * 0.5 + 0.5) * 0.05;
    this.vrm.expressionManager?.setValue(VRMExpressionPresetName.Aa, breathingValue);
  }

  private animate(): void {
    requestAnimationFrame(() => this.animate());
    const delta = this.clock.getDelta();

    if (this.vrm) {
      if (this.state === 'idle') {
        this.updateIdleState(delta);
      }
      
      this.mixer?.update(delta);
      this.vrm.update(delta);
    }

    this.renderer.render(this.scene, this.camera);
  }
}
