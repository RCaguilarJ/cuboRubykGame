import * as THREE from 'three';
import { ColorCode, MoveNotation } from '../../types';
import { COLOR_HEX_MAP } from './cubeState';

export interface Rubik3DOptions {
  container: HTMLDivElement;
  onMoveComplete?: (move: MoveNotation) => void;
  onAnimationStateChange?: (animating: boolean) => void;
}

export class Rubik3DRenderer {
  private scene: THREE.Scene;
  private camera: THREE.PerspectiveCamera;
  private renderer: THREE.WebGLRenderer;
  private container: HTMLDivElement;

  private cubies: THREE.Mesh[] = [];
  private isAnimating = false;
  private animationQueue: MoveNotation[] = [];
  private animationSpeed = 350; // ms per turn

  // Dragging / Camera Orbit control states
  private isDraggingCamera = false;
  private previousMousePosition = { x: 0, y: 0 };
  private cameraAngle = { theta: Math.PI / 4, phi: Math.PI / 6, radius: 8 };

  private onMoveComplete?: (move: MoveNotation) => void;
  private onAnimationStateChange?: (animating: boolean) => void;
  private animationFrameId: number | null = null;

  constructor(options: Rubik3DOptions) {
    this.container = options.container;
    this.onMoveComplete = options.onMoveComplete;
    this.onAnimationStateChange = options.onAnimationStateChange;

    // 1. Scene setup
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color('#0F172A'); // Deep slate blue backdrop

    // 2. Camera setup
    const aspect = this.container.clientWidth / (this.container.clientHeight || 1);
    this.camera = new THREE.PerspectiveCamera(45, aspect, 0.1, 100);
    this.updateCameraPosition();

    // 3. Renderer setup
    this.renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
    this.renderer.setSize(this.container.clientWidth, this.container.clientHeight);
    this.renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    this.renderer.shadowMap.enabled = true;
    this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

    // Clear previous children
    while (this.container.firstChild) {
      this.container.removeChild(this.container.firstChild);
    }
    this.container.appendChild(this.renderer.domElement);

    // 4. Lights
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.85);
    this.scene.add(ambientLight);

    const dirLight1 = new THREE.DirectionalLight(0xffffff, 1.2);
    dirLight1.position.set(10, 15, 10);
    dirLight1.castShadow = true;
    this.scene.add(dirLight1);

    const dirLight2 = new THREE.DirectionalLight(0xffffff, 0.5);
    dirLight2.position.set(-10, -10, -10);
    this.scene.add(dirLight2);

    // Subtle soft floor shadow plane
    const shadowGeo = new THREE.PlaneGeometry(15, 15);
    const shadowMat = new THREE.ShadowMaterial({ opacity: 0.25 });
    const shadowPlane = new THREE.Mesh(shadowGeo, shadowMat);
    shadowPlane.rotation.x = -Math.PI / 2;
    shadowPlane.position.y = -2.8;
    shadowPlane.receiveShadow = true;
    this.scene.add(shadowPlane);

    // 5. Build 3x3x3 Cubies
    this.buildCube();

    // 6. Bind User Interaction Events
    this.bindEvents();

    // 7. Start Render Loop
    this.animate = this.animate.bind(this);
    this.animate();
  }

  private updateCameraPosition() {
    const { theta, phi, radius } = this.cameraAngle;
    this.camera.position.x = radius * Math.sin(theta) * Math.cos(phi);
    this.camera.position.y = radius * Math.sin(phi);
    this.camera.position.z = radius * Math.cos(theta) * Math.cos(phi);
    this.camera.lookAt(0, 0, 0);
  }

  // Create 27 individual cubies with materials and stickers
  private buildCube() {
    // Clear existing
    this.cubies.forEach((c) => this.scene.remove(c));
    this.cubies = [];

    const cubieSize = 0.95;
    const geometry = new THREE.BoxGeometry(cubieSize, cubieSize, cubieSize);

    const innerMat = new THREE.MeshStandardMaterial({
      color: 0x18181b, // Dark charcoal plastic
      roughness: 0.5,
      metalness: 0.1,
    });

    const createStickerMat = (colorHex: string) => {
      return new THREE.MeshStandardMaterial({
        color: new THREE.Color(colorHex),
        roughness: 0.2,
        metalness: 0.05,
      });
    };

    for (let x = -1; x <= 1; x++) {
      for (let y = -1; y <= 1; y++) {
        for (let z = -1; z <= 1; z++) {
          // 6 materials per box: [ +X, -X, +Y, -Y, +Z, -Z ]
          // +X = Red (Right), -X = Orange (Left)
          // +Y = White (Up), -Y = Yellow (Down)
          // +Z = Green (Front), -Z = Blue (Back)
          const materials: THREE.MeshStandardMaterial[] = [
            x === 1 ? createStickerMat(COLOR_HEX_MAP.R) : innerMat,
            x === -1 ? createStickerMat(COLOR_HEX_MAP.O) : innerMat,
            y === 1 ? createStickerMat(COLOR_HEX_MAP.W) : innerMat,
            y === -1 ? createStickerMat(COLOR_HEX_MAP.Y) : innerMat,
            z === 1 ? createStickerMat(COLOR_HEX_MAP.G) : innerMat,
            z === -1 ? createStickerMat(COLOR_HEX_MAP.B) : innerMat,
          ];

          const cubie = new THREE.Mesh(geometry, materials);
          cubie.position.set(x * 1.02, y * 1.02, z * 1.02);
          cubie.castShadow = true;
          cubie.receiveShadow = true;

          // Attach black edge outline for sharp high-contrast 3D appearance
          const edgesGeo = new THREE.EdgesGeometry(geometry);
          const edgesMat = new THREE.LineBasicMaterial({ color: 0x09090b, linewidth: 2 });
          const wireframe = new THREE.LineSegments(edgesGeo, edgesMat);
          cubie.add(wireframe);

          this.cubies.push(cubie);
          this.scene.add(cubie);
        }
      }
    }
  }

  // Reset cube back to standard initial state
  public resetCube() {
    if (this.isAnimating) return;
    this.animationQueue = [];
    this.buildCube();
  }

  public setSpeed(msPerMove: number) {
    this.animationSpeed = Math.max(100, Math.min(1500, msPerMove));
  }

  public queueMove(move: MoveNotation) {
    this.animationQueue.push(move);
    this.processQueue();
  }

  public queueMoves(moves: MoveNotation[]) {
    moves.forEach((m) => this.animationQueue.push(m));
    this.processQueue();
  }

  public getIsAnimating(): boolean {
    return this.isAnimating;
  }

  private processQueue() {
    if (this.isAnimating || this.animationQueue.length === 0) return;

    const nextMove = this.animationQueue.shift();
    if (!nextMove) return;

    this.executeMove(nextMove);
  }

  // Execute animated turn for a face
  private executeMove(move: MoveNotation) {
    this.isAnimating = true;
    if (this.onAnimationStateChange) this.onAnimationStateChange(true);

    const baseFace = move[0] as 'U' | 'D' | 'R' | 'L' | 'F' | 'B';
    const isPrime = move.includes("'");
    const is2 = move.includes('2');

    // Filter cubies that belong to target face
    const selectedCubies: THREE.Mesh[] = [];
    const threshold = 0.4;

    this.cubies.forEach((cubie) => {
      const pos = cubie.position;
      switch (baseFace) {
        case 'U': if (pos.y > threshold) selectedCubies.push(cubie); break;
        case 'D': if (pos.y < -threshold) selectedCubies.push(cubie); break;
        case 'R': if (pos.x > threshold) selectedCubies.push(cubie); break;
        case 'L': if (pos.x < -threshold) selectedCubies.push(cubie); break;
        case 'F': if (pos.z > threshold) selectedCubies.push(cubie); break;
        case 'B': if (pos.z < -threshold) selectedCubies.push(cubie); break;
      }
    });

    // Pivot group
    const pivot = THREE.Object3D ? new THREE.Group() : new THREE.Group();
    this.scene.add(pivot);

    selectedCubies.forEach((cubie) => {
      pivot.attach(cubie);
    });

    // Rotation angle
    // Standard Rubik notation: Clockwise looking directly at the face
    let targetAngle = Math.PI / 2;
    if (baseFace === 'U' || baseFace === 'R' || baseFace === 'F') {
      targetAngle = isPrime ? Math.PI / 2 : -Math.PI / 2;
    } else {
      // D, L, B
      targetAngle = isPrime ? -Math.PI / 2 : Math.PI / 2;
    }

    if (is2) targetAngle *= 2;

    // Rotation axis
    let axis = new THREE.Vector3(0, 1, 0);
    switch (baseFace) {
      case 'U': case 'D': axis = new THREE.Vector3(0, 1, 0); break;
      case 'R': case 'L': axis = new THREE.Vector3(1, 0, 0); break;
      case 'F': case 'B': axis = new THREE.Vector3(0, 0, 1); break;
    }

    const startTime = performance.now();
    const duration = this.animationSpeed;

    const animateRotation = (now: number) => {
      const elapsed = now - startTime;
      const progress = Math.min(elapsed / duration, 1.0);

      // Smooth easeInOutCubic easing
      const ease = progress < 0.5
        ? 4 * progress * progress * progress
        : 1 - Math.pow(-2 * progress + 2, 3) / 2;

      const currentAngle = targetAngle * ease;
      pivot.rotation.set(0, 0, 0);
      pivot.rotateOnAxis(axis, currentAngle);

      if (progress < 1.0) {
        requestAnimationFrame(animateRotation);
      } else {
        // Animation finished
        pivot.rotation.set(0, 0, 0);
        pivot.rotateOnAxis(axis, targetAngle);
        pivot.updateMatrixWorld(true);

        // Re-attach cubies to scene with exact positions
        selectedCubies.forEach((cubie) => {
          this.scene.attach(cubie);
          // Snap cubie coordinates to clean rounded numbers
          cubie.position.x = Math.round(cubie.position.x * 100) / 100;
          cubie.position.y = Math.round(cubie.position.y * 100) / 100;
          cubie.position.z = Math.round(cubie.position.z * 100) / 100;
        });

        this.scene.remove(pivot);
        this.isAnimating = false;

        if (this.onMoveComplete) this.onMoveComplete(move);
        if (this.onAnimationStateChange) this.onAnimationStateChange(false);

        // Process next item in queue
        this.processQueue();
      }
    };

    requestAnimationFrame(animateRotation);
  }

  private bindEvents() {
    const dom = this.container;

    const onPointerDown = (e: PointerEvent) => {
      this.isDraggingCamera = true;
      this.previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!this.isDraggingCamera) return;

      const deltaX = e.clientX - this.previousMousePosition.x;
      const deltaY = e.clientY - this.previousMousePosition.y;

      this.cameraAngle.theta -= deltaX * 0.008;
      // Clamp vertical phi to prevent camera flipping upside down
      this.cameraAngle.phi = Math.max(
        -Math.PI / 2 + 0.1,
        Math.min(Math.PI / 2 - 0.1, this.cameraAngle.phi + deltaY * 0.008)
      );

      this.updateCameraPosition();
      this.previousMousePosition = { x: e.clientX, y: e.clientY };
    };

    const onPointerUp = () => {
      this.isDraggingCamera = false;
    };

    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      this.cameraAngle.radius = Math.max(5, Math.min(14, this.cameraAngle.radius + e.deltaY * 0.005));
      this.updateCameraPosition();
    };

    dom.addEventListener('pointerdown', onPointerDown);
    window.addEventListener('pointermove', onPointerMove);
    window.addEventListener('pointerup', onPointerUp);
    dom.addEventListener('wheel', onWheel, { passive: false });

    // Window resize observer
    const handleResize = () => {
      if (!this.container) return;
      const width = this.container.clientWidth;
      const height = this.container.clientHeight || 1;
      this.camera.aspect = width / height;
      this.camera.updateProjectionMatrix();
      this.renderer.setSize(width, height);
    };

    window.addEventListener('resize', handleResize);
  }

  private animate() {
    this.animationFrameId = requestAnimationFrame(this.animate);
    this.renderer.render(this.scene, this.camera);
  }

  // Predefined camera view presets (e.g., Front Top, Left, Right)
  public setCameraPreset(preset: 'DEFAULT' | 'TOP' | 'FRONT' | 'BOTTOM') {
    switch (preset) {
      case 'TOP':
        this.cameraAngle = { theta: 0, phi: Math.PI / 2 - 0.1, radius: 8 };
        break;
      case 'FRONT':
        this.cameraAngle = { theta: 0, phi: 0.2, radius: 8 };
        break;
      case 'BOTTOM':
        this.cameraAngle = { theta: 0, phi: -Math.PI / 2 + 0.1, radius: 8 };
        break;
      case 'DEFAULT':
      default:
        this.cameraAngle = { theta: Math.PI / 4, phi: Math.PI / 6, radius: 8 };
        break;
    }
    this.updateCameraPosition();
  }

  public dispose() {
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
    this.cubies.forEach((c) => {
      c.geometry.dispose();
      if (Array.isArray(c.material)) {
        c.material.forEach((m) => m.dispose());
      }
    });
    this.renderer.dispose();
    while (this.container.firstChild) {
      this.container.removeChild(this.container.firstChild);
    }
  }
}
