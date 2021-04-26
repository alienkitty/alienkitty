import { Group } from 'three';

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

    /**
     * Public methods
     */

    resize = (width, height, dpr) => {
        this.alienkitty.resize(width, height, dpr);
    };

    update = (time, delta, frame) => {
        this.alienkitty.update(time, delta, frame);
    };

    animateIn = () => {
        this.alienkitty.animateIn();
    };

    ready = () => this.alienkitty.ready();
}
