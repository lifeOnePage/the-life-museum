"use client";

import { useRef, useMemo, useEffect } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import { useFBO } from "@react-three/drei";
import * as THREE from "three";

// Gaussian Blur Shader - Horizontal Pass
const blurShaderH = {
  uniforms: {
    tDiffuse: { value: null },
    uResolution: { value: new THREE.Vector2() },
    uBlurAmount: { value: 4.0 },
  },
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform sampler2D tDiffuse;
    uniform vec2 uResolution;
    uniform float uBlurAmount;
    varying vec2 vUv;

    void main() {
      vec2 texelSize = 1.0 / uResolution;
      vec4 result = vec4(0.0);

      // 9-tap Gaussian blur (horizontal)
      float weights[5];
      weights[0] = 0.227027;
      weights[1] = 0.1945946;
      weights[2] = 0.1216216;
      weights[3] = 0.054054;
      weights[4] = 0.016216;

      result += texture2D(tDiffuse, vUv) * weights[0];

      for (int i = 1; i < 5; i++) {
        float offset = float(i) * uBlurAmount;
        result += texture2D(tDiffuse, vUv + vec2(texelSize.x * offset, 0.0)) * weights[i];
        result += texture2D(tDiffuse, vUv - vec2(texelSize.x * offset, 0.0)) * weights[i];
      }

      gl_FragColor = result;
    }
  `,
};

// Gaussian Blur Shader - Vertical Pass
const blurShaderV = {
  uniforms: {
    tDiffuse: { value: null },
    uResolution: { value: new THREE.Vector2() },
    uBlurAmount: { value: 4.0 },
  },
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform sampler2D tDiffuse;
    uniform vec2 uResolution;
    uniform float uBlurAmount;
    varying vec2 vUv;

    void main() {
      vec2 texelSize = 0.1 / uResolution;
      vec4 result = vec4(0.0);

      // 9-tap Gaussian blur (vertical)
      float weights[5];
      weights[0] = 0.227027;
      weights[1] = 0.1945946;
      weights[2] = 0.1216216;
      weights[3] = 0.054054;
      weights[4] = 0.016216;

      result += texture2D(tDiffuse, vUv) * weights[0];

      for (int i = 1; i < 5; i++) {
        float offset = float(i) * uBlurAmount;
        result += texture2D(tDiffuse, vUv + vec2(0.0, texelSize.y * offset)) * weights[i];
        result += texture2D(tDiffuse, vUv - vec2(0.0, texelSize.y * offset)) * weights[i];
      }

      gl_FragColor = result;
    }
  `,
};

// Final composite shader with fade
const compositeShader = {
  uniforms: {
    tDiffuse: { value: null },
    uOpacity: { value: 0.0 },
  },
  vertexShader: `
    varying vec2 vUv;
    void main() {
      vUv = uv;
      gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
    }
  `,
  fragmentShader: `
    uniform sampler2D tDiffuse;
    uniform float uOpacity;
    varying vec2 vUv;

    void main() {
      vec4 blurred = texture2D(tDiffuse, vUv);
      gl_FragColor = vec4(blurred.rgb, uOpacity);
    }
  `,
};

// Layer 설정 (AlbumCover.jsx와 동일)
const BACKGROUND_LAYER = 0;
const FOREGROUND_LAYER = 1;

export default function BlurLayer({ isActive = false, blurStrength = 6.0 }) {
  const meshRef = useRef();
  const { gl, scene, camera, size } = useThree();

  // 블러 렌더링용 카메라 (layer 0만 렌더링)
  const blurRenderCamera = useMemo(() => {
    const cam = camera.clone();
    cam.layers.set(BACKGROUND_LAYER); // layer 0만 활성화
    return cam;
  }, [camera]);

  // FBO for rendering scene
  const sceneFBO = useFBO(size.width, size.height);
  const blurFBO1 = useFBO(size.width / 2, size.height / 2); // Half resolution for performance
  const blurFBO2 = useFBO(size.width / 2, size.height / 2);

  // Animation state
  const animState = useRef({
    currentOpacity: 0,
    targetOpacity: 0,
  });

  // Blur materials
  const blurMaterialH = useMemo(() => {
    const mat = new THREE.ShaderMaterial({
      ...blurShaderH,
      depthTest: false,
      depthWrite: false,
    });
    return mat;
  }, []);

  const blurMaterialV = useMemo(() => {
    const mat = new THREE.ShaderMaterial({
      ...blurShaderV,
      depthTest: false,
      depthWrite: false,
    });
    return mat;
  }, []);

  const compositeMaterial = useMemo(() => {
    const mat = new THREE.ShaderMaterial({
      ...compositeShader,
      transparent: true,
      depthTest: false,
      depthWrite: false,
    });
    return mat;
  }, []);

  // Fullscreen quad for blur passes
  const blurQuad = useMemo(() => {
    const geometry = new THREE.PlaneGeometry(2, 2);
    return geometry;
  }, []);

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
    return () => {
      blurScene.remove(blurMesh);
    };
  }, [blurScene, blurMesh]);

  // 메인 카메라가 양쪽 layer를 볼 수 있도록 설정
  useEffect(() => {
    camera.layers.enable(BACKGROUND_LAYER);
    camera.layers.enable(FOREGROUND_LAYER);
  }, [camera]);

  // BlurLayer 메시를 foreground layer로 설정 (블러 렌더링에서 제외)
  useEffect(() => {
    if (meshRef.current) {
      meshRef.current.layers.set(FOREGROUND_LAYER);
    }
  }, []);

  // Update target opacity
  animState.current.targetOpacity = isActive ? 1.0 : 0.0;

  useFrame((state, delta) => {
    if (!meshRef.current) return;

    // Animate opacity
    const anim = animState.current;
    const lerpFactor = 1 - Math.pow(0.001, delta);
    anim.currentOpacity +=
      (anim.targetOpacity - anim.currentOpacity) * lerpFactor;

    // Skip rendering if fully transparent
    if (anim.currentOpacity < 0.01) {
      meshRef.current.visible = false;
      return;
    }
    meshRef.current.visible = true;

    // Temporarily hide the blur layer mesh
    meshRef.current.visible = false;

    // Update resolution uniforms
    const halfWidth = size.width / 2;
    const halfHeight = size.height / 2;
    blurMaterialH.uniforms.uResolution.value.set(halfWidth, halfHeight);
    blurMaterialH.uniforms.uBlurAmount.value = blurStrength;
    blurMaterialV.uniforms.uResolution.value.set(halfWidth, halfHeight);
    blurMaterialV.uniforms.uBlurAmount.value = blurStrength;

    // 1. Render scene to FBO (layer 0만 - 선택된 앨범 제외)
    // 카메라 위치/회전 동기화
    blurRenderCamera.position.copy(camera.position);
    blurRenderCamera.rotation.copy(camera.rotation);
    blurRenderCamera.updateMatrixWorld();

    gl.setRenderTarget(sceneFBO);
    gl.render(scene, blurRenderCamera);

    // 2. Horizontal blur pass
    blurMesh.material = blurMaterialH;
    blurMaterialH.uniforms.tDiffuse.value = sceneFBO.texture;
    gl.setRenderTarget(blurFBO1);
    gl.render(blurScene, blurCamera);

    // 3. Vertical blur pass
    blurMesh.material = blurMaterialV;
    blurMaterialV.uniforms.tDiffuse.value = blurFBO1.texture;
    gl.setRenderTarget(blurFBO2);
    gl.render(blurScene, blurCamera);

    // 4. Additional blur passes for stronger effect
    for (let i = 0; i < 1; i++) {
      blurMesh.material = blurMaterialH;
      blurMaterialH.uniforms.tDiffuse.value = blurFBO2.texture;
      gl.setRenderTarget(blurFBO1);
      gl.render(blurScene, blurCamera);

      blurMesh.material = blurMaterialV;
      blurMaterialV.uniforms.tDiffuse.value = blurFBO1.texture;
      gl.setRenderTarget(blurFBO2);
      gl.render(blurScene, blurCamera);
    }

    // Reset render target
    gl.setRenderTarget(null);

    // Update composite material
    compositeMaterial.uniforms.tDiffuse.value = blurFBO2.texture;
    compositeMaterial.uniforms.uOpacity.value = anim.currentOpacity;

    // Show the blur layer mesh
    meshRef.current.visible = true;
  });

  return (
    <mesh ref={meshRef} position={[0, 0.5, 3.5]} renderOrder={999}>
      <planeGeometry args={[20, 20]} />
      <primitive object={compositeMaterial} attach="material" />
    </mesh>
  );
}
