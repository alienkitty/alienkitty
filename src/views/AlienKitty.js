import { BufferAttribute, BufferGeometry, Group, LinearFilter, Mesh, Texture } from 'three';
import { BasicMaterial, Text, TextMaterial } from '@alienkitty/alien.js/three';

import { WorldController } from '../controllers/world/WorldController.js';
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

        const material = new BasicMaterial({ map: this.texture });

        const mesh = new Mesh(quad, material);
        mesh.frustumCulled = false;
        mesh.scale.set(this.width, this.height, 1);
        this.add(mesh);

        const hitMesh = new Mesh(quad);
        hitMesh.frustumCulled = false;
        hitMesh.scale.set(this.width, this.height, 1);
        hitMesh.visible = false;
        this.add(hitMesh);

        this.hitMesh = hitMesh;
    }

    async loadText() {
        const { loadTexture } = WorldController;

        const map = await loadTexture('assets/fonts/Roboto-Bold.png');
        map.minFilter = LinearFilter;
        map.generateMipmaps = false;

        const material = new TextMaterial({ map });
        material.uniforms.uAlpha.value = 0.94;

        const font = await (await fetch('assets/fonts/Roboto-Bold.json')).json();

        const text = new Text({
            font,
            text: 'EST. 2020',
            size: 10.5,
            lineHeight: 1.1,
            letterSpacing: -0.05
        });

        const geometry = new BufferGeometry();
        geometry.setAttribute('position', new BufferAttribute(text.buffers.position, 3));
        geometry.setAttribute('uv', new BufferAttribute(text.buffers.uv, 2));
        geometry.setAttribute('id', new BufferAttribute(text.buffers.id, 1));
        geometry.setIndex(new BufferAttribute(text.buffers.index, 1));

        const mesh = new Mesh(geometry, material);
        mesh.frustumCulled = false;
        mesh.position.x = (this.width - 48) / 2;
        mesh.position.y = -(this.height + 10);
        this.add(mesh);

        // Adjust height of hit mesh
        this.hitMesh.scale.set(this.width, this.height + 10 + text.height, 1);
    }

    // Event handlers

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

    // Public methods

    resize = (width, height, dpr) => {
        // Y flipped
        this.position.x = (width - this.width) / 2;
        this.position.y = 1 - ((height - this.height) / 2 - 65);

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
        this.alienkitty.animateIn();
        this.texture.needsUpdate = true;
        this.visible = true;
    };

    ready = () => Promise.all([
        this.alienkitty.ready(),
        this.loadText()
    ]);
}
