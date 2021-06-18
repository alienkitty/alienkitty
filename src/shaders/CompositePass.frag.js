import rgbshift from './modules/rgbshift/rgbshift.glsl.js';

export default /* glsl */`
precision highp float;

uniform sampler2D tScene;
uniform sampler2D tFlow;

varying vec2 vUv;

${rgbshift}

void main() {
    // R and G values are velocity in the X and Y direction
    // B value is the velocity length
    vec3 flow = texture2D(tFlow, vUv).rgb;

    // Use flow to adjust the UV lookup of a texture
    vec2 uv = vUv;
    uv += flow.rg * 0.05;

    float angle = length(vUv - vec2(0.5));
    float amount = length(flow.rg) * 0.025;

    gl_FragColor = getRGB(tScene, uv, angle, amount);
}
`;
