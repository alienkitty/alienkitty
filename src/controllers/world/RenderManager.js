import { Mesh, OrthographicCamera, RGBFormat, Scene, Vector2, WebGLRenderTarget } from 'three';

import { Config } from '../../config/Config.js';
import { Flowmap } from '../../utils/world/Flowmap.js';
import { WorldController } from './WorldController.js';
import { CompositeMaterial } from '../../materials/CompositeMaterial.js';
import { Stage } from '../Stage.js';

export class RenderManager {
    static init(renderer, scene, camera) {
        this.renderer = renderer;
        this.scene = scene;
        this.camera = camera;

        this.mouse = new Vector2(-1, -1);
        this.velocity = new Vector2();
        this.lastTime = null;
        this.lastMouse = new Vector2();
        this.multiplier = 1;

        this.initRenderer();

        this.addListeners();
    }

    static initRenderer() {
        const { aspect, screenTriangle } = WorldController;

        // Fullscreen triangle
        this.screenScene = new Scene();
        this.screenCamera = new OrthographicCamera(-1, 1, 1, -1, 0, 1);

        this.screen = new Mesh(screenTriangle);
        this.screen.frustumCulled = false;
        this.screenScene.add(this.screen);

        // Render targets
        this.renderTargetA = new WebGLRenderTarget(1, 1, {
            format: RGBFormat,
            anisotropy: 0,
            depthBuffer: false
        });

        // Flowmap
        this.flowmap = new Flowmap(this.renderer, {
            falloff: 0.098,
            alpha: 0.25,
            dissipation: 0.8
        });
        this.flowmap.material.uniforms.uAspect = aspect;

        // Composite material
        this.compositeMaterial = new CompositeMaterial();
        this.compositeMaterial.uniforms.tFlow = this.flowmap.uniform;
    }

    static addListeners() {
        Stage.element.addEventListener('pointerdown', this.onPointerDown);
        window.addEventListener('pointermove', this.onPointerMove);
    }

    /**
     * Event handlers
     */

    static onPointerDown = e => {
        e.preventDefault();

        this.onPointerMove(e);
    };

    static onPointerMove = e => {
        const event = {};

        if (e.changedTouches && e.changedTouches.length) {
            event.x = e.changedTouches[0].clientX;
            event.y = e.changedTouches[0].clientY;
        } else {
            event.x = e.clientX;
            event.y = e.clientY;
        }

        // Get mouse value in 0 to 1 range, with Y flipped
        this.mouse.set(
            event.x / this.width,
            1 - event.y / this.height
        );

        // Calculate velocity
        if (!this.lastTime) {
            this.lastTime = performance.now();
            this.lastMouse.copy(event);
        }

        const deltaX = event.x - this.lastMouse.x;
        const deltaY = event.y - this.lastMouse.y;

        this.lastMouse.copy(event);

        const time = performance.now();

        // Avoid dividing by 0
        const delta = Math.max(14, time - this.lastTime);
        this.lastTime = time;

        this.velocity.x = (deltaX / delta) * this.multiplier;
        this.velocity.y = (deltaY / delta) * this.multiplier;

        // Flag update to prevent hanging velocity values when not moving
        this.velocity.needsUpdate = true;
    };

    /**
     * Public methods
     */

    static resize = (width, height, dpr) => {
        this.width = width;
        this.height = height;

        this.renderer.setPixelRatio(dpr);
        this.renderer.setSize(width, height);

        width = Math.round(width * dpr);
        height = Math.round(height * dpr);

        this.renderTargetA.setSize(width, height);

        if (Stage.width < Config.BREAKPOINT) {
            this.multiplier = 2;
        } else {
            this.multiplier = 1;
        }
    };

    static update = () => {
        const renderer = this.renderer;
        const scene = this.scene;
        const camera = this.camera;

        const screenScene = this.screenScene;
        const screenCamera = this.screenCamera;

        const renderTargetA = this.renderTargetA;

        // Reset velocity when mouse not moving
        if (!this.velocity.needsUpdate) {
            this.mouse.set(-1, -1);
            this.velocity.set(0, 0);
            this.lastTime = null;
        }
        this.velocity.needsUpdate = false;

        // Update flowmap inputs
        this.flowmap.mouse.copy(this.mouse);

        // Ease velocity input, slower when fading out
        this.flowmap.velocity.lerp(this.velocity, this.velocity.length() ? 0.5 : 0.1);
        this.flowmap.update();

        // Scene pass
        renderer.setRenderTarget(renderTargetA);
        renderer.render(scene, camera);

        // Composite pass (render to screen)
        this.compositeMaterial.uniforms.tScene.value = renderTargetA.texture;
        this.screen.material = this.compositeMaterial;
        renderer.setRenderTarget(null);
        renderer.render(screenScene, screenCamera);
    };
}
