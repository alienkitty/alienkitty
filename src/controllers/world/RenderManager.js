import { Mesh, OrthographicCamera, Vector2, WebGLRenderTarget } from 'three';
import { Flowmap } from '@alienkitty/alien.js/three';

import { WorldController } from './WorldController.js';
import { CompositeMaterial } from '../../materials/CompositeMaterial.js';

import { breakpoint } from '../../config/Config.js';

export class RenderManager {
    static init(renderer, scene, camera) {
        this.renderer = renderer;
        this.scene = scene;
        this.camera = camera;

        this.width = 1;
        this.height = 1;

        // Flowmap
        this.mouse = new Vector2(-1, -1);
        this.velocity = new Vector2();
        this.lastTime = 0;
        this.lastMouse = new Vector2();
        this.multiplier = 1;

        this.initRenderer();

        this.addListeners();
    }

    static initRenderer() {
        const { screenTriangle, aspect } = WorldController;

        // Fullscreen triangle
        this.screenCamera = new OrthographicCamera(-1, 1, 1, -1, 0, 1);
        this.screen = new Mesh(screenTriangle);
        this.screen.frustumCulled = false;

        // Render targets
        this.renderTarget = new WebGLRenderTarget(1, 1, {
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
        window.addEventListener('pointermove', this.onPointerMove);
    }

    // Event handlers

    static onPointerMove = ({ clientX, clientY }) => {
        const event = {
            x: clientX,
            y: clientY
        };

        // Get mouse value in 0 to 1 range, with Y flipped
        this.mouse.set(
            event.x / this.width,
            1 - event.y / this.height
        );

        // First frame
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

        // Calculate velocity
        this.velocity.x = (deltaX / delta) * this.multiplier;
        this.velocity.y = (deltaY / delta) * this.multiplier;

        // Flag update to prevent hanging velocity values when not moving
        this.velocity.needsUpdate = true;
    };

    // Public methods

    static resize = (width, height, dpr) => {
        this.width = width;
        this.height = height;

        if (width < breakpoint) {
            this.multiplier = 2;
        } else {
            this.multiplier = 1;
        }

        this.renderer.setPixelRatio(dpr);
        this.renderer.setSize(width, height);

        width = Math.round(width * dpr);
        height = Math.round(height * dpr);

        this.renderTarget.setSize(width, height);
    };

    static update = () => {
        const renderer = this.renderer;
        const scene = this.scene;
        const camera = this.camera;

        const renderTarget = this.renderTarget;

        // Reset velocity when mouse not moving
        if (!this.velocity.needsUpdate) {
            this.mouse.set(-1, -1);
            this.velocity.set(0, 0);
            this.lastTime = 0;
        }
        this.velocity.needsUpdate = false;

        // Update flowmap inputs
        this.flowmap.mouse.copy(this.mouse);

        // Ease velocity input, slower when fading out
        this.flowmap.velocity.lerp(this.velocity, this.velocity.length() ? 0.5 : 0.1);
        this.flowmap.update();

        // Scene pass
        renderer.setRenderTarget(renderTarget);
        renderer.render(scene, camera);

        // Composite pass (render to screen)
        this.compositeMaterial.uniforms.tScene.value = renderTarget.texture;
        this.screen.material = this.compositeMaterial;
        renderer.setRenderTarget(null);
        renderer.render(this.screen, this.screenCamera);
    };
}
