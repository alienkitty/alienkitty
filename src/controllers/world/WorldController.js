import { Color, ColorManagement, LinearSRGBColorSpace, OrthographicCamera, PlaneGeometry, Scene, Vector2, WebGLRenderer } from 'three';
import { Interface, Stage, TextureLoader, getFullscreenTriangle } from '@alienkitty/space.js/three';

export class WorldController {
    static init(loader) {
        this.loader = loader;

        this.initWorld();
        this.initLoaders();

        this.addListeners();
    }

    static initWorld() {
        this.renderer = new WebGLRenderer({
            powerPreference: 'high-performance'
        });

        // Output canvas
        this.element = new Interface(this.renderer.domElement);
        this.element.css({ opacity: 0 });

        // Disable color management
        ColorManagement.enabled = false;
        this.renderer.outputColorSpace = LinearSRGBColorSpace;

        // 2D scene
        this.scene = new Scene();
        this.scene.background = new Color(Stage.rootStyle.getPropertyValue('--bg-color').trim());
        this.camera = new OrthographicCamera(-1, 1, 1, -1, 0, 1);

        // Global geometries
        this.quad = new PlaneGeometry(1, 1);
        this.quad.translate(0.5, -0.5, 0);
        this.screenTriangle = getFullscreenTriangle();

        // Global uniforms
        this.resolution = { value: new Vector2() };
        this.texelSize = { value: new Vector2() };
        this.aspect = { value: 1 };
        this.time = { value: 0 };
        this.frame = { value: 0 };
    }

    static initLoaders() {
        this.textureLoader = new TextureLoader();
    }

    static addListeners() {
        this.renderer.domElement.addEventListener('touchstart', this.onTouchStart);
    }

    // Event handlers

    static onTouchStart = e => {
        e.preventDefault();
    };

    // Public methods

    static resize = (width, height, dpr) => {
        // 2D scene
        this.camera.left = -width / 2;
        this.camera.right = width / 2;
        this.camera.top = height / 2;
        this.camera.bottom = -height / 2;
        this.camera.updateProjectionMatrix();
        this.camera.position.x = width / 2;
        this.camera.position.y = -height / 2;

        width = Math.round(width * dpr);
        height = Math.round(height * dpr);

        this.resolution.value.set(width, height);
        this.texelSize.value.set(1 / width, 1 / height);
        this.aspect.value = width / height;
    };

    static update = (time, delta, frame) => {
        this.time.value = time;
        this.frame.value = frame;
    };

    static animateIn = () => {
        this.element.tween({ opacity: 1 }, 1000, 'easeOutSine', () => {
            this.element.css({ opacity: '' });
        });
    };

    static ready = () => Promise.all([
        this.textureLoader.ready()
    ]);

    // Global handlers

    static loadImage = path => this.loader.loadImage(path);

    static getTexture = (path, callback) => this.textureLoader.load(path, callback);

    static loadTexture = path => this.textureLoader.loadAsync(path);
}
