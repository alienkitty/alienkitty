import { Group, LinearFilter, Mesh, Texture } from 'three';

import { BasicMaterial, TextMaterial } from 'alien.js/all';

import { WorldController } from '../controllers/world/WorldController.js';
import { InputManager } from '../controllers/world/InputManager.js';
import { AlienKittyCanvas } from './AlienKittyCanvas.js';

export class AlienKitty extends Group {
    constructor() {
        super();

        this.visible = false;

        this.width = 90;
        this.height = 86;

        this.initTexture();
        this.initMesh();
    }

    initTexture() {
        this.alienkitty = new AlienKittyCanvas();

        this.texture = new Texture(this.alienkitty.element);
        this.texture.minFilter = LinearFilter;
        this.texture.generateMipmaps = false;
    }

    initMesh() {
        const { quad } = WorldController;

        this.material = new BasicMaterial(this.texture);

        this.mesh = new Mesh(quad, this.material);
        this.mesh.frustumCulled = false;
        this.mesh.scale.set(this.width, this.height, 1);

        this.add(this.mesh);

        this.hitMesh = new Mesh(quad);
        this.hitMesh.frustumCulled = false;
        this.hitMesh.scale.set(this.width, this.height, 1);
        this.hitMesh.visible = false;

        this.add(this.hitMesh);
    }

    async loadText() {
        const { getTexture, loadTextGeometry } = WorldController;

        const map = getTexture('assets/fonts/Roboto-Bold.png');
        map.minFilter = LinearFilter;
        map.generateMipmaps = false;

        const material = new TextMaterial({ map });
        material.uniforms.uAlpha.value = 0.94;

        const { text, geometry } = await loadTextGeometry('assets/fonts/Roboto-Bold.json', {
            text: 'EST. 2020',
            size: 10.5,
            lineHeight: 1.1,
            letterSpacing: -0.05
        });

        const mesh = new Mesh(geometry, material);
        mesh.frustumCulled = false;
        mesh.position.x = Math.round((this.width - 48) / 2);
        mesh.position.y = -(this.height + 10);

        this.add(mesh);

        // Adjust height of hit mesh
        this.hitMesh.scale.set(this.width, this.height + 10 + text.height, 1);
    }

    addListeners() {
        InputManager.add(this);
    }

    removeListeners() {
        InputManager.remove(this);
    }

    /**
     * Event handlers
     */

    onHover = (/* { type } */) => {
        /* console.log('onHover', type);
        if (type === 'over') {
        } else {
        } */
    };

    onClick = () => {
        // open('https://alien.js.org/');
        location.href = 'mailto:hello@alienkitty.com';
    };

    /**
     * Public methods
     */

    resize = (width, height, dpr) => {
        this.position.x = Math.round((width - this.width) / 2);
        this.position.y = -(Math.round((height - this.height) / 2) - 65);

        this.alienkitty.resize(width, height, dpr);

        this.texture.needsUpdate = true;
    };

    update = () => {
        if (!this.visible) {
            return;
        }

        if (this.alienkitty.needsUpdate) {
            this.texture.needsUpdate = true;
        }
    };

    animateIn = () => {
        this.addListeners();
        this.alienkitty.animateIn();
        this.texture.needsUpdate = true;
        this.visible = true;
    };

    ready = () => Promise.all([
        this.loadText(),
        this.alienkitty.ready()
    ]);
}
