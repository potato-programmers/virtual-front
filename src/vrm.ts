import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { VRM, VRMExpressionPresetName, VRMLoaderPlugin, VRMUtils } from '@pixiv/three-vrm';

export class VRMManager {
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private clock = new THREE.Clock();
  private vrm: VRM | null = null;

  // For blinking
  private blinkTime = 0;
  private nextBlinkTime = 0;

  constructor(private container: HTMLElement) {
    const { width, height } = container.getBoundingClientRect();

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(30.0, width / height, 0.1, 20.0);
    // 카메라 위치를 조정하고 모델의 상반신을 바라보도록 설정
    this.camera.position.set(0.0, 1.4, 1.5);
    this.camera.lookAt(0.0, 1.2, 0.0);

    this.renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true });
    this.renderer.setSize(width, height);
    this.renderer.setPixelRatio(window.devicePixelRatio);
    this.container.appendChild(this.renderer.domElement);

    const light = new THREE.DirectionalLight(0xffffff, 3);
    light.position.set(1.0, 1.0, 1.0).normalize();
    this.scene.add(light);

    // --- 디버깅용 Helper 추가 ---
    const gridHelper = new THREE.GridHelper(10, 10);
    this.scene.add(gridHelper);
    const axesHelper = new THREE.AxesHelper(5);
    this.scene.add(axesHelper);
    // --------------------------

    this.animate = this.animate.bind(this);
    this.setBlinkTime();
  }

  public loadVRM(modelUrl: string): void {
    const loader = new GLTFLoader();
    loader.register((parser) => new VRMLoaderPlugin(parser));

    loader.load(
      modelUrl,
      (gltf) => {
        this.vrm = gltf.userData.vrm;
        this.scene.add(this.vrm.scene);
        // VRM 0.0 모델의 경우, 카메라를 향하도록 회전
        VRMUtils.rotateVRM0(this.vrm);
        console.log('VRM model loaded successfully');
        this.animate();
      },
      (progress) => console.log('Loading model...', 100.0 * (progress.loaded / progress.total), '%'),
      (error) => console.error(error)
    );
  }

  private setBlinkTime(): void {
    this.nextBlinkTime = this.blinkTime + 2.0 + Math.random() * 4.0; // Blink every 2-6 seconds
  }

  private updateBlinking(delta: number): void {
    if (!this.vrm) return;

    this.blinkTime += delta;

    if (this.blinkTime > this.nextBlinkTime) {
      this.vrm.expressionManager?.setValue(VRMExpressionPresetName.Blink, 1);
      setTimeout(() => {
        this.vrm?.expressionManager?.setValue(VRMExpressionPresetName.Blink, 0);
      }, 100); // Blink duration
      this.setBlinkTime();
    }
  }

  private updateBreathing(delta: number): void {
    if (!this.vrm) return;
    const breathingValue = (Math.sin(this.clock.elapsedTime * 0.5) * 0.5 + 0.5) * 0.05;
    this.vrm.expressionManager?.setValue(VRMExpressionPresetName.A, breathingValue);
  }

  private animate(): void {
    requestAnimationFrame(this.animate);
    const delta = this.clock.getDelta();

    if (this.vrm) {
      this.updateBlinking(delta);
      this.updateBreathing(delta);
      this.vrm.update(delta);
    }

    this.renderer.render(this.scene, this.camera);
  }
}
