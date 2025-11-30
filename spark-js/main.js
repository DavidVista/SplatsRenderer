import * as THREE from "three";
import { SplatMesh } from "@sparkjsdev/spark";

class SplatViewer {
    constructor() {
        this.scene = null;
        this.camera = null;
        this.renderer = null;
        this.splatMesh = null;
        
        // Camera controls
        this.moveState = {
            forward: false,
            backward: false,
            left: false,
            right: false,
            up: false,
            down: false
        };
        
        this.cameraVelocity = new THREE.Vector3();
        this.cameraDirection = new THREE.Vector3();
        this.moveSpeed = 5.0;
        
        // Mouse look
        this.isMouseDown = false;
        this.previousMouseX = 0;
        this.previousMouseY = 0;
        this.pitch = 0;
        this.yaw = 0;
        this.mouseSensitivity = 0.002;
        
        this.init();
    }

    async init() {
        await this.initScene();
        this.initEventListeners();
        
        // Load example on startup
        await this.loadSplatFromUrl('https://sparkjs.dev/assets/splats/butterfly.spz');
        
        this.animate();
    }

    async initScene() {
        // Create Three.js scene
        this.scene = new THREE.Scene();
        this.scene.background = new THREE.Color(0x1e1e1e);
        
        // Create camera
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.set(0, 1.7, 5); // Eye-level height
        
        // Create renderer
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        this.renderer.setPixelRatio(window.devicePixelRatio);
        document.body.appendChild(this.renderer.domElement);
        
        // Add basic lighting
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.6);
        this.scene.add(ambientLight);
        
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(1, 1, 1);
        this.scene.add(directionalLight);
        
        // Add a simple ground grid for reference
        this.addGroundGrid();
    }

    addGroundGrid() {
        const gridHelper = new THREE.GridHelper(20, 20, 0x444444, 0x222222);
        gridHelper.position.y = -0.5;
        this.scene.add(gridHelper);
        
        const axesHelper = new THREE.AxesHelper(5);
        this.scene.add(axesHelper);
    }

    initEventListeners() {
        // File input handler
        const fileInput = document.getElementById('fileInput');
        fileInput.addEventListener('change', (e) => {
            this.loadSplatFile(e.target.files[0]);
        });

        // Keyboard controls
        document.addEventListener('keydown', (e) => {
            this.onKeyDown(e);
        });
        
        document.addEventListener('keyup', (e) => {
            this.onKeyUp(e);
        });

        // Mouse look - only when left button is held
        this.renderer.domElement.addEventListener('mousedown', (e) => {
            if (e.button === 0) { // Left mouse button
                this.isMouseDown = true;
                this.previousMouseX = e.clientX;
                this.previousMouseY = e.clientY;
                this.renderer.domElement.style.cursor = 'grabbing';
            }
        });
        
        this.renderer.domElement.addEventListener('mousemove', (e) => {
            if (this.isMouseDown) {
                this.onMouseMove(e);
            }
        });
        
        document.addEventListener('mouseup', (e) => {
            if (e.button === 0) {
                this.isMouseDown = false;
                this.renderer.domElement.style.cursor = 'default';
            }
        });

        // Prevent context menu on right click
        this.renderer.domElement.addEventListener('contextmenu', (e) => {
            e.preventDefault();
        });

        // Window resize
        window.addEventListener('resize', () => {
            this.onWindowResize();
        });
    }

    onMouseMove(e) {
        if (!this.isMouseDown) return;
        
        const deltaX = e.clientX - this.previousMouseX;
        const deltaY = e.clientY - this.previousMouseY;
        
        this.yaw -= deltaX * this.mouseSensitivity;
        this.pitch -= deltaY * this.mouseSensitivity;
        
        // Clamp pitch to avoid flipping
        this.pitch = Math.max(-Math.PI/2, Math.min(Math.PI/2, this.pitch));
        
        // Update camera rotation
        this.camera.quaternion.setFromEuler(new THREE.Euler(this.pitch, this.yaw, 0, 'YXZ'));
        
        this.previousMouseX = e.clientX;
        this.previousMouseY = e.clientY;
    }

    onKeyDown(e) {
        switch (e.code) {
            case 'KeyW':
                this.moveState.forward = true;
                break;
            case 'KeyS':
                this.moveState.backward = true;
                break;
            case 'KeyA':
                this.moveState.left = true;
                break;
            case 'KeyD':
                this.moveState.right = true;
                break;
            case 'Space':
                this.moveState.up = true;
                break;
            case 'ShiftLeft':
            case 'ShiftRight':
                this.moveState.down = true;
                break;
        }
    }

    onKeyUp(e) {
        switch (e.code) {
            case 'KeyW':
                this.moveState.forward = false;
                break;
            case 'KeyS':
                this.moveState.backward = false;
                break;
            case 'KeyA':
                this.moveState.left = false;
                break;
            case 'KeyD':
                this.moveState.right = false;
                break;
            case 'Space':
                this.moveState.up = false;
                break;
            case 'ShiftLeft':
            case 'ShiftRight':
                this.moveState.down = false;
                break;
        }
    }

    updateCamera(deltaTime) {
        // Get camera direction vectors
        this.camera.getWorldDirection(this.cameraDirection);
        const right = new THREE.Vector3().crossVectors(this.cameraDirection, this.camera.up).normalize();
        const up = new THREE.Vector3(0, 1, 0);
        
        // Reset velocity
        this.cameraVelocity.set(0, 0, 0);
        
        // Apply movement based on input state
        if (this.moveState.forward) {
            this.cameraVelocity.add(this.cameraDirection);
        }
        if (this.moveState.backward) {
            this.cameraVelocity.sub(this.cameraDirection);
        }
        if (this.moveState.left) {
            this.cameraVelocity.sub(right);
        }
        if (this.moveState.right) {
            this.cameraVelocity.add(right);
        }
        if (this.moveState.up) {
            this.cameraVelocity.add(up);
        }
        if (this.moveState.down) {
            this.cameraVelocity.sub(up);
        }
        
        // Normalize and apply speed
        if (this.cameraVelocity.lengthSq() > 0) {
            this.cameraVelocity.normalize().multiplyScalar(this.moveSpeed * deltaTime);
            this.camera.position.add(this.cameraVelocity);
        }
    }

    onWindowResize() {
        this.camera.aspect = window.innerWidth / window.innerHeight;
        this.camera.updateProjectionMatrix();
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    async loadSplatFile(file) {
        if (!file) return;
        
        try {
            this.showLoading();
            
            // Create object URL from file
            const objectUrl = URL.createObjectURL(file);
            await this.createSplatMesh(objectUrl);
            URL.revokeObjectURL(objectUrl);
            
            this.hideLoading();
        } catch (error) {
            console.error('Failed to load splat file:', error);
            this.showError('Failed to load SPZ file');
        }
    }

    async loadSplatFromUrl(url) {
        try {
            this.showLoading();
            await this.createSplatMesh(url);
            this.hideLoading();
        } catch (error) {
            console.error('Failed to load splat from URL:', error);
            this.showError('Failed to load from URL');
        }
    }

    async createSplatMesh(url) {
        // Remove existing splat mesh
        if (this.splatMesh) {
            this.scene.remove(this.splatMesh);
        }

        // Create new splat mesh using Spark.js
        this.splatMesh = new SplatMesh({ url: url });
        this.splatMesh.quaternion.set(1, 0, 0, 0);
        this.splatMesh.position.set(0, 0, 0);
        this.scene.add(this.splatMesh);

        // Reset camera to view the new mesh
        this.resetCamera();
    }

    resetCamera() {
        this.camera.position.set(0, 1.7, 5);
        this.camera.rotation.set(0, 0, 0);
        this.pitch = 0;
        this.yaw = 0;
    }

    animate() {
        const clock = new THREE.Clock();
        
        const animateLoop = () => {
            requestAnimationFrame(animateLoop);
            
            const deltaTime = clock.getDelta();
            
            // Update camera movement
            this.updateCamera(deltaTime);
            
            // Removed automatic rotation - splats remain stationary
            
            this.renderer.render(this.scene, this.camera);
        };
        
        animateLoop();
    }

    showLoading() {
        document.getElementById('loading').style.display = 'flex';
    }

    hideLoading() {
        document.getElementById('loading').style.display = 'none';
    }

    showError(message) {
        const loading = document.getElementById('loading');
        loading.innerHTML = `
            <div style="font-size: 40px; margin-bottom: 20px;">⚠️</div>
            <div style="font-size: 18px; text-align: center;">${message}</div>
            <button onclick="this.parentElement.style.display='none'" style="margin-top: 20px; padding: 10px 20px; background: #e74c3c; color: white; border: none; border-radius: 5px; cursor: pointer;">
                Close
            </button>
        `;
        loading.style.display = 'flex';
    }
}

// Initialize the application when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    new SplatViewer();
});

export default SplatViewer;