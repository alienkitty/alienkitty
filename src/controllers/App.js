import { Stage, ticker } from '@alienkitty/space.js/three';

import { WorldController } from './world/WorldController.js';
import { InputManager } from './world/InputManager.js';
import { RenderManager } from './world/RenderManager.js';
import { SceneView } from '../views/SceneView.js';

export class App {
    static async init(loader) {
        this.loader = loader;

        this.initWorld();
        this.initViews();
        this.initControllers();

        this.addListeners();
        this.onResize();

        await Promise.all([
            this.loader.ready(),
            WorldController.ready(),
            this.view.ready()
        ]);
    }

    static initWorld() {
        WorldController.init(this.loader);
        Stage.add(WorldController.element);
    }

    static initViews() {
        this.view = new SceneView();
        WorldController.scene.add(this.view);
    }

    static initControllers() {
        const { renderer, scene, camera } = WorldController;

        InputManager.init(camera);
        RenderManager.init(renderer, scene, camera);
    }

    static addListeners() {
        window.addEventListener('resize', this.onResize);
        ticker.add(this.onUpdate);
    }

    // Event handlers

    static onResize = () => {
        const width = document.documentElement.clientWidth;
        const height = document.documentElement.clientHeight;
        const dpr = window.devicePixelRatio;

        WorldController.resize(width, height, dpr);
        this.view.resize(width, height, dpr);
        RenderManager.resize(width, height, dpr);
    };

    static onUpdate = (time, delta, frame) => {
        WorldController.update(time, delta, frame);
        this.view.update(time, delta, frame);
        InputManager.update(time);
        RenderManager.update(time, delta, frame);
    };

    // Public methods

    static start = async () => {
        this.view.animateIn();
        WorldController.animateIn();
    };
}
