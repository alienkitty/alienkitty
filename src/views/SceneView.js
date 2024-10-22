import { Group } from 'three';

import { InputManager } from '../controllers/world/InputManager.js';
import { AlienKitty } from './AlienKitty.js';

export class SceneView extends Group {
    constructor() {
        super();

        this.initViews();
    }

    initViews() {
        this.alienkitty = new AlienKitty();
        this.add(this.alienkitty);
    }

    addListeners() {
        InputManager.add(this.alienkitty.hitMesh);
    }

    removeListeners() {
        InputManager.remove(this.alienkitty.hitMesh);
    }

    // Public methods

    resize = (width, height, dpr) => {
        this.alienkitty.resize(width, height, dpr);
    };

    update = (time, delta, frame) => {
        this.alienkitty.update(time, delta, frame);
    };

    animateIn = () => {
        this.addListeners();
        this.alienkitty.animateIn();
    };

    ready = () => this.alienkitty.ready();
}
