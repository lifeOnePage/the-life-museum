"use client";
import { Canvas, useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import { useMemo, useRef } from "react";

const isPOT = (n) => (n & (n - 1)) === 0;

/** 텍스처 로드 + cover 크롭 + NPOT 안전 설정 */
function makeMaterialFromImage(url, planeAspect, maxAniso) {
  const loader = new THREE.TextureLoader();
  const tex = loader.load(url, (t) => {
    console.log(url);
    const w = t.image?.width || 1;
    const h = t.image?.height || 1;
    const pot = isPOT(w) && isPOT(h);

    // NPOT 안전 설정
    t.generateMipmaps = pot;
    t.minFilter = pot ? THREE.LinearMipmapLinearFilter : THREE.LinearFilter;
    t.magFilter = THREE.LinearFilter;
    t.wrapS = THREE.ClampToEdgeWrapping;
    t.wrapT = THREE.ClampToEdgeWrapping;
    t.anisotropy = Math.min(8, maxAniso || 1);
    t.colorSpace = THREE.SRGBColorSpace;

    // object-fit: cover (UV 크롭)
    const imgAspect = w / h;
    t.center.set(0.5, 0.5);
    if (imgAspect > planeAspect) {
      const repX = planeAspect / imgAspect;
      t.repeat.set(repX, 1);
      t.offset.set((1 - repX) / 2, 0);
    } else {
      const repY = imgAspect / planeAspect;
      t.repeat.set(1, repY);
      t.offset.set(0, (1 - repY) / 2);
    }
    t.needsUpdate = true;
  });

  // 기본은 불투명(겹침/깜빡임 최소화). 필요 시 opacity만 조절.
  const mat = new THREE.MeshBasicMaterial({
    map: tex,
    opacity: 0.5,
    transparent: false,
    depthWrite: true,
    side: THREE.DoubleSide,
  });
  return mat;
}

function Ring({
  frames, // [{url, kind:'image', cat?:string}, ...]  ← 실제 프레임
  targetIndex, // 슬라이더에서 오는 '정수 스냅' 인덱스
  minSlots = 100, // 전체 슬롯 하한(요구사항 1)
  lerp = 0.12, // 부드러운 회전
  radius = 11,
  planeW = 5.0,
  planeH = 5.0,
  yOffset = 0,
  ringOffsetX = -15, // 화면 오른쪽으로 이동
  tiltY = 0.0, // 살짝 기울임을 원할 때만 사용
  chooseSide = "left", // 'left' | 'right' : 스프라이트 선택 기준
  activeCategory = null, // 선택된 카테고리(없으면 null)
  onChooseIndex, // 선택된(왼/오른) 슬롯 인덱스
  onProjectChoose, // 선택된 슬롯의 스크린 좌표
}) {
  const nReal = Math.max(frames.length, 0);
  const slots = Math.max(nReal, minSlots); // 100 미만이면 100 슬롯
  const step = (Math.PI * 2) / slots;
  const planeAspect = planeW / planeH;

  const group = useRef();
  const planes = useRef([]);
  const mats = useRef([]);
  const { camera, size, gl } = useThree();
  const maxAniso = gl.capabilities.getMaxAnisotropy();

  // 슬롯별 데이터(실제 프레임 or placeholder)
  const slotData = useMemo(() => {
    const arr = new Array(slots).fill(null).map((_, i) => {
      if (i < nReal) {
        return { type: "real", frame: frames[i], realIndex: i };
      }
      return { type: "placeholder", frame: null, realIndex: -1 };
    });
    return arr;
  }, [frames, slots, nReal]);
  // console.log(slotData)

  // 고정 위치
  const positions = useMemo(() => {
    const arr = [];
    for (let i = 0; i < slots; i++) {
      const a = i * step;
      arr.push([Math.cos(a) * radius, yOffset, Math.sin(a) * radius]);
    }
    return arr;
  }, [slots, step, radius, yOffset]);

  // 머티리얼 준비
  const materials = useMemo(() => {
    const list = [];
    for (let i = 0; i < slots; i++) {
      const s = slotData[i];
      if (s.type === "real" && s.frame?.url) {
        // console.log(s.frame.url)
        list[i] = makeMaterialFromImage(s.frame.url, planeAspect, maxAniso);
      } else {
        // placeholder: 반투명 흰색
        list[i] = new THREE.MeshBasicMaterial({
          color: 0xffffff,
          opacity: 0.1,
          transparent: true,
          depthWrite: false,
          side: THREE.DoubleSide,
        });
      }
    }
    return list;
  }, [slotData, planeAspect, maxAniso, slots]);

  // 현재 각도(연속 보간)
  const currentAngle = useRef(0);

  useFrame(() => {
    if (!group.current) return;

    // 그룹 회전(연속)
    const targetAngle = (targetIndex % slots) * step;
    currentAngle.current = THREE.MathUtils.lerp(
      currentAngle.current,
      targetAngle,
      lerp,
    );
    group.current.rotation.set(0, currentAngle.current + tiltY, 0);
    group.current.position.x = ringOffsetX;

    // 그룹 월드 회전 상쇄 → 모든 패널이 '정면'을 바라보게
    const gwq = group.current.getWorldQuaternion(new THREE.Quaternion());
    const invGwq = gwq.clone().invert(); // 이걸 각 mesh 로컬 quat에 곱해 월드 회전을 0에 가깝게
    planes.current.forEach((m) => {
      if (!m) return;
      m.quaternion.copy(invGwq); // 월드에서 (0,0,0) 정면향
    });

    // 카테고리/placeholder 반투명 처리
    for (let i = 0; i < slots; i++) {
      const s = slotData[i];
      const mat = mats.current[i];
      if (!mat) continue;

      // placeholder는 이미 반투명
      if (s.type === "placeholder") continue;

      const inCategory = !activeCategory || s.frame?.cat === activeCategory;

      const wantDim = !inCategory; // 선택 카테고리가 있고 그에 속하지 않으면 dim
      // 투명 처리(깊이 충돌 줄이기 위해 dim일 때만 transparent)
      if (wantDim) {
        mat.transparent = true;
        mat.depthWrite = false;
        mat.opacity = 0.35;
      } else {
        mat.opacity = 1.0;
        mat.transparent = false;
        mat.depthWrite = true;
      }
    }

    // 화면 좌표로 왼쪽/오른쪽 가장자리 슬롯 선택
    let pick = 0;
    let best = chooseSide === "left" ? Infinity : -Infinity;
    const tmp = new THREE.Vector3();
    for (let i = 0; i < slots; i++) {
      const m = planes.current[i];
      // console.log(m)
      if (!m) continue;
      // 선택 기준은 placeholder도 포함(원하면 여기서 제외 가능)
      const wp = m.getWorldPosition(new THREE.Vector3());
      tmp.copy(wp).project(camera);
      const sx = (tmp.x * 0.5 + 0.5) * size.width;
      if (chooseSide === "left") {
        if (sx < best) {
          best = sx;
          pick = i;
        }
      } else {
        if (sx > best) {
          best = sx;
          pick = i;
        }
      }
    }
    onChooseIndex?.(pick);

    // DOM 연결선용 좌표
    const chosen = planes.current[pick];
    if (chosen) {
      const v = chosen.getWorldPosition(new THREE.Vector3()).project(camera);
      onProjectChoose?.({
        x: (v.x * 0.5 + 0.5) * size.width,
        y: (-v.y * 0.5 + 0.5) * size.height,
      });
    }
  });

  return (
    <group ref={group}>
      {positions.map(([x, y, z], i) => (
        <mesh
          key={i}
          ref={(el) => (planes.current[i] = el)}
          position={[x, y, z]}
          frustumCulled={false}
        >
          <planeGeometry args={[planeW, planeH]} />
          <primitive
            object={(mats.current[i] = materials[i])}
            attach="material"
          />
        </mesh>
      ))}
    </group>
  );
}

export default function ImageRing3D({
  frames,
  index, // 정수 스냅 값
  onChooseIndex,
  onProjectChoose,
  // 옵션
  minSlots = 100,
  radius = 5.6,
  planeW = 2.4,
  planeH = 2.4,
  yOffset = 0,
  ringOffsetX = -8,
  tiltY = 0.0,
  camZ = 26,
  lerp = 0.12,
  chooseSide = "left",
  activeCategory = null,
}) {
  return (
    <div style={{bottom:-400}} className="absolute inset-0">
      <Canvas camera={{ position: [0, 6, camZ], fov: 50 }}>
        <ambientLight intensity={0.95} />
        <directionalLight position={[6, 10, 6]} intensity={0.7} />
        <Ring
          frames={frames}
          targetIndex={index}
          minSlots={minSlots}
          lerp={lerp}
          radius={radius}
          planeW={planeW}
          planeH={planeH}
          yOffset={yOffset}
          ringOffsetX={ringOffsetX}
          tiltY={tiltY}
          chooseSide={chooseSide}
          activeCategory={activeCategory}
          onChooseIndex={onChooseIndex}
          onProjectChoose={onProjectChoose}
        />
      </Canvas>
    </div>
  );
}
