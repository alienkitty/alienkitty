import { NoBlending, RawShaderMaterial, Uniform } from 'three';

import vertexShader from '../shaders/CompositePass.vert.js';
import fragmentShader from '../shaders/CompositePass.frag.js';

export class CompositeMaterial extends RawShaderMaterial {
    constructor() {
        super({
            uniforms: {
                tScene: new Uniform(null),
                tFlow: new Uniform(null)
            },
            vertexShader,
            fragmentShader,
            blending: NoBlending,
            depthWrite: false,
            depthTest: false
        });
    }
}
