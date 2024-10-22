import { GLSL3, NoBlending, RawShaderMaterial } from 'three';

import rgbshift from '@alienkitty/alien.js/src/shaders/modules/rgbshift/rgbshift.glsl.js';

const vertexShader = /* glsl */ `
in vec3 position;
in vec2 uv;

out vec2 vUv;

void main() {
    vUv = uv;

    gl_Position = vec4(position, 1.0);
}
`;

const fragmentShader = /* glsl */ `
precision highp float;

uniform sampler2D tScene;
uniform sampler2D tFlow;

in vec2 vUv;

out vec4 FragColor;

${rgbshift}

void main() {
    // R and G values are velocity in the X and Y direction
    // B value is the velocity length
    vec3 flow = texture(tFlow, vUv).rgb;

    // Use flow to adjust the UV lookup of a texture
    vec2 uv = vUv - flow.rg * 0.05;

    float angle = length(vUv - 0.5);
    float amount = length(flow.rg) * 0.025;

    FragColor = getRGB(tScene, uv, angle, amount);
}
`;

export class CompositeMaterial extends RawShaderMaterial {
    constructor() {
        super({
            glslVersion: GLSL3,
            uniforms: {
                tScene: { value: null },
                tFlow: { value: null }
            },
            vertexShader,
            fragmentShader,
            blending: NoBlending,
            depthTest: false,
            depthWrite: false
        });
    }
}
