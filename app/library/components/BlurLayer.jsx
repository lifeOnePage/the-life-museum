"use client";

import { useRef, useMemo, useEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { useFBO } from "@react-three/drei";
import * as THREE from "three";

// RawShaderMaterial + GLSL ES 3.0 사용 이유:
// ShaderMaterial은 Three.js r152+에서 tone mapping(ACES 포함) + colorspace 변환 코드를
// 모든 fragment shader에 자동 주입함. blur 패스가 3개이므로 ACES가 4번 적용됨 → 극단적으로 어두워짐.
// RawShaderMaterial은 주입이 없으므로, sceneFBO에 캡처된 ACES+sRGB 값이 그대로 통과됨.

const VERT = `
  in vec3 position;
  in vec2 uv;
  out vec2 vUv;
  void main() {
    vUv = uv;
    // clip-space fullscreen quad: PlaneGeometry(2,2) 꼭짓점 ±1 → NDC ±1
    gl_Position = vec4(position.xy, 0.0, 1.0);
  }
`;

const FRAG_H = `
  precision highp float;
  uniform sampler2D tDiffuse;
  uniform vec2 uResolution;
  uniform float uBlurAmount;
  in vec2 vUv;
  out vec4 fragColor;

  void main() {
    vec2 texelSize = 1.0 / uResolution;
    vec4 result = vec4(0.0);

    // 9-tap Gaussian weights (σ≈3, 정규화 합계 = 1.0)
    float weights[9];
    weights[0] = 0.13357;
    weights[1] = 0.12635;
    weights[2] = 0.10695;
    weights[3] = 0.08101;
    weights[4] = 0.05491;
    weights[5] = 0.03332;
    weights[6] = 0.01808;
    weights[7] = 0.00881;
    weights[8] = 0.00382;

    result += texture(tDiffuse, vUv) * weights[0];
    for (int i = 1; i < 9; i++) {
      float offset = float(i) * uBlurAmount;
      result += texture(tDiffuse, vUv + vec2(texelSize.x * offset, 0.0)) * weights[i];
      result += texture(tDiffuse, vUv - vec2(texelSize.x * offset, 0.0)) * weights[i];
    }
    fragColor = result;
  }
`;

const FRAG_V = `
  precision highp float;
  uniform sampler2D tDiffuse;
  uniform vec2 uResolution;
  uniform float uBlurAmount;
  in vec2 vUv;
  out vec4 fragColor;

  void main() {
    vec2 texelSize = 1.0 / uResolution;
    vec4 result = vec4(0.0);

    // 9-tap Gaussian weights (σ≈3, 정규화 합계 = 1.0)
    float weights[9];
    weights[0] = 0.13357;
    weights[1] = 0.12635;
    weights[2] = 0.10695;
    weights[3] = 0.08101;
    weights[4] = 0.05491;
    weights[5] = 0.03332;
    weights[6] = 0.01808;
    weights[7] = 0.00881;
    weights[8] = 0.00382;

    // float bias = texture(tDiffuse, vUv) * weights[0] > 0.5 ? 0 : 0.2;
    result += texture(tDiffuse, vUv) * weights[0]+0.01;
    for (int i = 1; i < 9; i++) {
      float offset = float(i) * uBlurAmount;
      result += texture(tDiffuse, vUv + vec2(0.0, texelSize.y * offset)) * weights[i];
      result += texture(tDiffuse, vUv - vec2(0.0, texelSize.y * offset)) * weights[i];
    }
    fragColor = result;
  }
`;

const FRAG_COMPOSITE = `
  precision highp float;
  uniform sampler2D tDiffuse;
  uniform float uOpacity;
  in vec2 vUv;
  out vec4 fragColor;

  void main() {
    vec4 blurred = texture(tDiffuse, vUv);
    fragColor = vec4(blurred.rgb, uOpacity);
  }
`;

export default function BlurLayer({
  isActive = false,
  blurStrength = 3.0,
  hiddenDuringBlur = null,
}) {
  const meshRef = useRef();
  const { gl, scene, camera, size } = useThree();

  // 물리 픽셀 해상도 FBO
  // size.width/height는 CSS 픽셀 단위 → Retina(dpr=2)에서는 화면 절반 해상도
  // → 2×2 블록 업스케일 패턴 원인. getPixelRatio()를 곱해 물리 픽셀 기준으로 생성
  const dpr = gl.getPixelRatio();
  const physW = Math.round(size.width * dpr);
  const physH = Math.round(size.height * dpr);
  const sceneFBO = useFBO(physW, physH);
  const blurFBO1 = useFBO(physW, physH);
  const blurFBO2 = useFBO(physW, physH);

  const animState = useRef({ currentOpacity: 0, targetOpacity: 0 });

  const blurMaterialH = useMemo(
    () =>
      new THREE.RawShaderMaterial({
        glslVersion: THREE.GLSL3,
        uniforms: {
          tDiffuse: { value: null },
          uResolution: { value: new THREE.Vector2() },
          uBlurAmount: { value: 3.0 },
        },
        vertexShader: VERT,
        fragmentShader: FRAG_H,
        depthTest: false,
        depthWrite: false,
      }),
    [],
  );

  const blurMaterialV = useMemo(
    () =>
      new THREE.RawShaderMaterial({
        glslVersion: THREE.GLSL3,
        uniforms: {
          tDiffuse: { value: null },
          uResolution: { value: new THREE.Vector2() },
          uBlurAmount: { value: 3.0 },
        },
        vertexShader: VERT,
        fragmentShader: FRAG_V,
        depthTest: false,
        depthWrite: false,
      }),
    [],
  );

  const compositeMaterial = useMemo(
    () =>
      new THREE.RawShaderMaterial({
        glslVersion: THREE.GLSL3,
        uniforms: {
          tDiffuse: { value: null },
          uOpacity: { value: 0.0 },
        },
        vertexShader: VERT,
        fragmentShader: FRAG_COMPOSITE,
        transparent: true,
        depthTest: false,
        depthWrite: false,
      }),
    [],
  );

  const blurQuad = useMemo(() => new THREE.PlaneGeometry(2, 2), []);
  const blurScene = useMemo(() => new THREE.Scene(), []);
  const blurCamera = useMemo(
    () => new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1),
    [],
  );
  const blurMesh = useMemo(
    () => new THREE.Mesh(blurQuad, blurMaterialH),
    [blurQuad, blurMaterialH],
  );

  useEffect(() => {
    blurScene.add(blurMesh);
    return () => blurScene.remove(blurMesh);
  }, [blurScene, blurMesh]);

  // composite mesh는 FBO 캡처 중 useFrame에서 visible=false로 제외됨
  // 별도 layer 조작 불필요

  animState.current.targetOpacity = isActive ? 1.0 : 0.0;

  useFrame((_, delta) => {
    if (!meshRef.current) return;

    const anim = animState.current;
    const lerpFactor = 1 - Math.pow(0.001, delta);
    anim.currentOpacity +=
      (anim.targetOpacity - anim.currentOpacity) * lerpFactor;

    if (anim.currentOpacity < 0.01) {
      meshRef.current.visible = false;
      return;
    }
    meshRef.current.visible = false; // FBO 캡처 중 숨김

    // uResolution: 물리 픽셀 기준 (FBO 실제 크기와 일치해야 texelSize 정확)
    const curDpr = gl.getPixelRatio();
    const pw = size.width * curDpr;
    const ph = size.height * curDpr;
    blurMaterialH.uniforms.uResolution.value.set(pw, ph);
    blurMaterialH.uniforms.uBlurAmount.value = blurStrength;
    blurMaterialV.uniforms.uResolution.value.set(pw, ph);
    blurMaterialV.uniforms.uBlurAmount.value = blurStrength;

    // 1. 씬을 sceneFBO에 렌더링
    //    - composite 메시: 이미 visible=false (위에서 처리)
    //    - 선택된 앨범 그룹: 임시 숨김 → 블러에서 제외
    if (hiddenDuringBlur?.current) hiddenDuringBlur.current.visible = false;
    gl.setRenderTarget(sceneFBO);
    gl.render(scene, camera);
    if (hiddenDuringBlur?.current) hiddenDuringBlur.current.visible = true;

    // 2. Round 1 – Horizontal
    blurMesh.material = blurMaterialH;
    blurMaterialH.uniforms.tDiffuse.value = sceneFBO.texture;
    gl.setRenderTarget(blurFBO1);
    gl.render(blurScene, blurCamera);

    // 3. Round 1 – Vertical
    blurMesh.material = blurMaterialV;
    blurMaterialV.uniforms.tDiffuse.value = blurFBO1.texture;
    gl.setRenderTarget(blurFBO2);
    gl.render(blurScene, blurCamera);

    // 4. Round 2 – Horizontal (ping-pong: blurFBO2 → blurFBO1)
    blurMesh.material = blurMaterialH;
    blurMaterialH.uniforms.tDiffuse.value = blurFBO2.texture;
    gl.setRenderTarget(blurFBO1);
    gl.render(blurScene, blurCamera);

    // 5. Round 2 – Vertical (ping-pong: blurFBO1 → blurFBO2)
    blurMesh.material = blurMaterialV;
    blurMaterialV.uniforms.tDiffuse.value = blurFBO1.texture;
    gl.setRenderTarget(blurFBO2);
    gl.render(blurScene, blurCamera);

    gl.setRenderTarget(null);

    compositeMaterial.uniforms.tDiffuse.value = blurFBO2.texture;
    compositeMaterial.uniforms.uOpacity.value = anim.currentOpacity;

    meshRef.current.visible = true;
  });

  return (
    <mesh ref={meshRef} renderOrder={999} frustumCulled={false}>
      <planeGeometry args={[2, 2]} />
      <primitive object={compositeMaterial} attach="material" />
    </mesh>
  );
}
