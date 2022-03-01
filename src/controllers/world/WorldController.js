import { Color, OrthographicCamera, PlaneBufferGeometry, Scene, Uniform, Vector2, WebGL1Renderer } from 'three';

import { Config } from '../../config/Config.js';
import { TextureLoader } from '../../loaders/world/TextureLoader.js';
import { TextGeometryLoader } from '../../loaders/world/TextGeometryLoader.js';
import { Interface } from '../../utils/Interface.js';

import { getFullscreenTriangle } from '../../utils/world/Utils3D.js';

export class WorldController {
    static init() {
        this.initWorld();
        this.initLoaders();

        this.addListeners();
    }

    static initWorld() {
        this.renderer = new WebGL1Renderer({
            powerPreference: 'high-performance',
            stencil: false
        });
        this.element = new Interface(this.renderer.domElement);
        this.element.css({ opacity: 0 });

        // 2D scene
        this.scene = new Scene();
        this.scene.background = new Color(Config.BG_COLOR);
        this.camera = new OrthographicCamera(-1, 1, 1, -1, 0, 1);

        // Global geometries
        this.quad = new PlaneBufferGeometry(1, 1);
        this.quad.translate(0.5, -0.5, 0);
        this.screenTriangle = getFullscreenTriangle();

        // Global uniforms
        this.resolution = new Uniform(new Vector2());
        this.aspect = new Uniform(1);
        this.time = new Uniform(0);
        this.frame = new Uniform(0);
    }

    static initLoaders() {
        this.textureLoader = new TextureLoader();
        this.textGeometryLoader = new TextGeometryLoader();
    }

    static addListeners() {
        this.renderer.domElement.addEventListener('touchstart', this.onTouchStart);
    }

    /**
     * Event handlers
     */

    static onTouchStart = e => {
        e.preventDefault();
    };

    /**
     * Public methods
     */

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
        this.aspect.value = width / height;
    };

    static update = (time, delta, frame) => {
        this.time.value = time;
        this.frame.value = frame;
    };

    static getTexture = path => this.textureLoader.load(path);

    static getTextGeometry = (path, options = {}, callback) => {
        this.textGeometryLoader.setOptions(options);
        this.textGeometryLoader.load(path, callback);
    };

    static loadTextGeometry = (path, options = {}) => {
        this.textGeometryLoader.setOptions(options);
        return this.textGeometryLoader.loadAsync(path);
    };

    static animateIn = () => {
        this.element.tween({ opacity: 1 }, 250, 'easeOutSine', () => {
            this.element.css({ opacity: '' });
        });
    };
}
