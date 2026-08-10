import { useRef, useEffect, useCallback } from "react";
import { useFrame, useThree } from "@react-three/fiber";
import * as THREE from "three";
import {
  getProxiedUrl,
  BASE_HEIGHT,
  DISPLAY_SCALE,
  CAMERA_SPEED,
  SLIDE_DWELL_SEC,
  SLIDE_START_DIST,
  SLIDE_END_DIST,
  SLIDE_FADE_IN,
  SLIDE_APPROACH_EASE,
  SLIDE_TERMINAL_SPEED_RATIO,
  SLIDE_FADE_OUT_START_DIST,
  SLIDE_FADE_OUT_END_DIST,
  FLING_LOAD_PAUSE_SPEED,
} from "../lib/constants";

// ease-out(감속) + 선형 블렌드: 멀리서는 빠르게 → 가까워질수록 감속하되, 끝에서
// 멈추지 않고 종단 속도(평균의 m배)를 유지한다. 순수 ease-out(m=0)은 종단 기울기가
// 0이라 플레인이 카메라 앞에서 정지한 것처럼 보이는 문제가 있었음.
function easeOutTerminal(p, k, m) {
  const e = k <= 1 ? p : 1 - Math.pow(1 - p, k);
  return (1 - m) * e + m * p;
}

// easeOutTerminal의 역함수(단조증가 → 이분법). 수동 이동(거리 도메인)을 진행 시간에
// 되매핑할 때 사용. 24회 반복 = 2^-24 정밀도, 수동 입력 프레임에만 호출되어 저렴.
function invertEase(peTarget, k, m) {
  let lo = 0;
  let hi = 1;
  for (let i = 0; i < 24; i++) {
    const mid = (lo + hi) / 2;
    if (easeOutTerminal(mid, k, m) < peTarget) lo = mid;
    else hi = mid;
  }
  return (lo + hi) / 2;
}

/**
 * 복도(카메라)와 분리된 중앙 독립 슬라이드쇼.
 * 자체 타이머로 imageList를 0→끝 순서대로 재생하며, 각 사진 텍스처를 온디맨드로
 * 로딩(프록시·maxTextureSize로 다운스케일)하고 창(window) 밖은 dispose한다.
 * 카메라 속도와 무관하게 SLIDE_DWELL_SEC / SLIDE_START_DIST 등으로만 페이스·거리 결정.
 */
export default function CenterSlideshow({
  imageList,
  isPlaying,
  active,
  stateRef,
  maxTextureSize = 1024,
  // 속도 슬라이더 값 — 기본 속도(CAMERA_SPEED) 대비 비율로 중앙 페이스에 반영.
  // (중앙은 복도와 분리된 자체 타이머지만, 슬라이더 조절은 체감상 함께 빨라져야 함)
  cameraSpeed = CAMERA_SPEED,
}) {
  const { camera } = useThree();
  const meshRef = useRef();
  const matRef = useRef();

  const idxRef = useRef(0);
  const elapsedRef = useRef(0);
  // mediaIndex → { texture, aspect }
  const cacheRef = useRef(new Map());
  const loadingRef = useRef(new Set());
  // imageList 세대 — 리스트 교체 후 도착하는 in-flight 로드(낡은 텍스처)를 폐기해
  // 새 리스트의 인덱스에 엉뚱한 사진이 캐시되거나 누수되는 레이스를 막는다.
  const genRef = useRef(0);
  // 로드 실패 지수 백오프(mi → { fails, nextAt }) — 실패 시 loadTex가 매 프레임
  // 재요청(최대 3건/프레임)하는 폭주를 차단. 2s→4s→…→최대 16s 후 재시도.
  const retryRef = useRef(new Map());
  // 수동 클릭 포커스 세션당 '사진 1장 소비'를 1회만 수행하기 위한 래치.
  // boolean이 아니라 포커스 대상 planeId를 담아, 수동 포커스 중 다른 plane을
  // 다시 클릭(manual→manual 재타겟)해도 새 세션으로 인식되게 한다.
  const manualHoldRef = useRef(null);

  const len = imageList?.length || 0;

  const disposeTex = useCallback((mi) => {
    const e = cacheRef.current.get(mi);
    if (e) {
      e.texture.dispose();
      cacheRef.current.delete(mi);
    }
  }, []);

  const loadTex = useCallback(
    (mi) => {
      if (len === 0) return;
      const m = imageList[mi];
      if (!m) return;
      if (cacheRef.current.has(mi) || loadingRef.current.has(mi)) return;
      const rt = retryRef.current.get(mi);
      if (rt && performance.now() < rt.nextAt) return; // 실패 백오프 대기 중
      const url = m.original_url || m.thumbnail_url;
      if (!url) return;

      loadingRef.current.add(mi);
      const gen = genRef.current;
      const img = new Image();
      img.crossOrigin = "anonymous";
      const onLoaded = () => {
        if (gen !== genRef.current) return; // 리스트 교체 이후 도착한 낡은 로드 — 폐기
        loadingRef.current.delete(mi);
        try {
          // maxTextureSize로 다운스케일해 GPU 메모리 제한(모바일 보호)
          let dw = img.width;
          let dh = img.height;
          const maxDim = Math.max(dw, dh);
          if (maxDim > maxTextureSize) {
            const r = maxTextureSize / maxDim;
            dw = Math.round(dw * r);
            dh = Math.round(dh * r);
          }
          const canvas = document.createElement("canvas");
          canvas.width = dw;
          canvas.height = dh;
          canvas.getContext("2d").drawImage(img, 0, 0, dw, dh);
          const tex = new THREE.CanvasTexture(canvas);
          tex.colorSpace = THREE.SRGBColorSpace;
          // 이미 목표 크기로 프리스케일됨 — NPOT 밉맵 체인 생성(업로드 +33%) 생략
          tex.generateMipmaps = false;
          tex.minFilter = THREE.LinearFilter;
          tex.needsUpdate = true;
          const prev = cacheRef.current.get(mi);
          if (prev) prev.texture.dispose(); // 덮어쓰기 시 기존 텍스처 누수 방지
          cacheRef.current.set(mi, { texture: tex, aspect: img.width / img.height });
          retryRef.current.delete(mi); // 성공 — 백오프 초기화
        } catch {
          /* ignore */
        }
      };
      img.onload = () => {
        // 디코드 비동기화 — 원본(=w2000급) drawImage의 메인 스레드 동기 디코드
        // (3.5초 주기 히칭) 방지. 미지원/실패 시 동기 경로 폴백.
        if (img.decode) img.decode().then(onLoaded).catch(onLoaded);
        else onLoaded();
      };
      img.onerror = () => {
        if (gen !== genRef.current) return;
        loadingRef.current.delete(mi);
        const cur = retryRef.current.get(mi) || { fails: 0, nextAt: 0 };
        cur.fails += 1;
        cur.nextAt = performance.now() + Math.min(16000, 1000 * 2 ** cur.fails);
        retryRef.current.set(mi, cur);
      };
      img.src = getProxiedUrl(url);
    },
    [imageList, len, maxTextureSize],
  );

  // imageList 변경 시 초기화 + 텍스처 전부 해제
  useEffect(() => {
    genRef.current += 1; // in-flight 로드 무효화
    retryRef.current = new Map();
    idxRef.current = 0;
    elapsedRef.current = 0;
    for (const e of cacheRef.current.values()) e.texture.dispose();
    cacheRef.current.clear();
    loadingRef.current.clear();
  }, [imageList]);

  // 언마운트 시 정리
  useEffect(() => {
    return () => {
      for (const e of cacheRef.current.values()) e.texture.dispose();
      cacheRef.current.clear();
    };
  }, []);

  useFrame((_, delta) => {
    const mesh = meshRef.current;
    const mat = matRef.current;
    if (!mesh || !mat) return;

    // Scene.useFrame(마지막 실행)이 이번 프레임 최종 cameraZ로 위치를 확정할 수 있도록 등록
    stateRef.current.centerMesh = mesh;

    if (!active || !isPlaying || len === 0) {
      mesh.visible = false;
      stateRef.current.centerActive = false;
      stateRef.current.centerManualDz = 0; // 비활성 동안 쌓인 수동 이동량 폐기(복귀 시 점프 방지)

      // 수동 클릭 포커스(active=false인데 재생 중)로 중앙이 가려지는 경우:
      // 현재 사진 A를 '소비'하고 타이머를 리셋한다. 클릭한 벽면 사진이 A를
      // 대신해 지나가고, 포커스 해제 뒤에는 A+1이 먼 거리(SLIDE_START_DIST)에서
      // 새로 등장한다. (리셋하지 않으면 얼어붙은 진행도 그대로 재개돼 사진이
      // 카메라 코앞에서 튀어나온다 — 진행도 0.5만 돼도 이미 98유닛 거리)
      // 일시정지(!isPlaying)는 해당 없음 — 멈춘 지점에서 이어서 진행해야 한다.
      if (!active && isPlaying && len > 0) {
        const holdId = stateRef.current.targetPlaneId ?? "manual";
        if (manualHoldRef.current !== holdId) {
          manualHoldRef.current = holdId;
          idxRef.current = (idxRef.current + 1) % len;
          elapsedRef.current = 0;
        }
        // 비활성 중에도 다음 사진은 미리 로드해 둔다 — 로딩이 안 끝나면 복귀 후
        // 표시가 밀리는 동안에도 타이머는 흘러 다시 '코앞 등장'이 된다.
        loadTex(idxRef.current);
        loadTex((idxRef.current + 1) % len);
      }
      return;
    }
    manualHoldRef.current = null;

    const cur = idxRef.current;
    // 현재 + 다음 2장 미리 로드 (강한 플링 중에는 신규 로드 보류 — 잔렉 방지,
    // 플링이 감쇠하면 다음 프레임부터 자동 재개)
    const flinging =
      (stateRef.current.manualSpeed || 0) > FLING_LOAD_PAUSE_SPEED;
    if (!flinging) {
      loadTex(cur);
      loadTex((cur + 1) % len);
      loadTex((cur + 2) % len);
    }

    // 수동 이동량(스크롤/방향키) 소비 — '거리 도메인'에서 보정: 현재 거리에서
    // manualDz만큼 뺀 거리를 ease 역산으로 진행 시간에 되매핑한다. (평균속도로
    // 시간 환산만 하면 ease-out 초반엔 과보정=달려듦, 후반엔 미보정=달아남이 남음.)
    // 결과: 수동 이동 시 중앙 플레인이 전 구간에서 이동 거리만큼 정확히 가까워짐.
    const manualDz = stateRef.current.centerManualDz || 0;
    if (manualDz !== 0) {
      stateRef.current.centerManualDz = 0;
      const span = SLIDE_START_DIST - SLIDE_END_DIST;
      const p0 = Math.max(0, Math.min(1, elapsedRef.current / SLIDE_DWELL_SEC));
      const dist0 = THREE.MathUtils.lerp(
        SLIDE_START_DIST,
        SLIDE_END_DIST,
        easeOutTerminal(p0, SLIDE_APPROACH_EASE, SLIDE_TERMINAL_SPEED_RATIO),
      );
      const dist1 = dist0 - manualDz;
      if (dist1 <= SLIDE_END_DIST) {
        // 통과 완료 — 슬라이드 전환 트리거(초과분은 '프레임당 1장 전진' 정책에 따라 폐기)
        elapsedRef.current = SLIDE_DWELL_SEC;
      } else if (dist1 >= SLIDE_START_DIST) {
        elapsedRef.current = 0; // 뒤로 스크롤: 현재 슬라이드 시작점에서 클램프
      } else {
        const pe1 = (SLIDE_START_DIST - dist1) / span;
        const p1 = invertEase(pe1, SLIDE_APPROACH_EASE, SLIDE_TERMINAL_SPEED_RATIO);
        elapsedRef.current = p1 * SLIDE_DWELL_SEC;
      }
    }
    // delta 스파이크 클램프(탭 백그라운드 복귀 시 delta=숨김 시간 전체) — 없으면
    // 복귀 프레임에 elapsed가 폭증해 사진이 무표시로 연쇄 스킵된다.
    // 속도 슬라이더 반영: 기본 속도 대비 비율(pace)로 자체 타이머를 가감속 —
    // 슬라이더를 올리면 중앙 사진도 비례해서 빨리 다가온다(QA#5).
    const pace = Math.max(0.05, (cameraSpeed || CAMERA_SPEED) / CAMERA_SPEED);
    elapsedRef.current += Math.min(delta, 0.25) * pace;
    // 전진 판정: 시간 만료 '또는' 페이드아웃 완료 지점 통과. 후자가 먼저 오면
    // (현재 상수 기준 p≈0.74) opacity 0인 꼬리 구간을 스킵해 다음 사진이 바로
    // 등장한다(전환 공백 ~0.5초 제거).
    const pNow = Math.min(1, elapsedRef.current / SLIDE_DWELL_SEC);
    const distNow = THREE.MathUtils.lerp(
      SLIDE_START_DIST,
      SLIDE_END_DIST,
      easeOutTerminal(pNow, SLIDE_APPROACH_EASE, SLIDE_TERMINAL_SPEED_RATIO),
    );
    if (
      elapsedRef.current >= SLIDE_DWELL_SEC ||
      distNow <= SLIDE_FADE_OUT_END_DIST
    ) {
      // 프레임당 최대 1장만 전진하고 잔여는 폐기 — 강한 플링/프레임 히치 시
      // progress=1(opacity 0) 상태로 여러 장이 무표시로 넘어가는 churn 방지
      elapsedRef.current = 0;
      const next = (cur + 1) % len;
      idxRef.current = next;
      // 유지 창({idx-1, idx, idx+1, idx+2}) 밖 텍스처 스윕 해제.
      // (기존 (next-2+len)%len 단건 해제는 len<=4 소형 앨범에서 표시 중/방금
      //  프리로드한 텍스처를 지워 재로딩이 무한 반복되는 버그가 있었음)
      const keep = new Set([
        (next - 1 + len) % len,
        next,
        (next + 1) % len,
        (next + 2) % len,
      ]);
      for (const key of Array.from(cacheRef.current.keys())) {
        if (!keep.has(key)) disposeTex(key);
      }
    }

    const i = idxRef.current;
    const entry = cacheRef.current.get(i);
    if (!entry) {
      // 아직 로딩 중이면 이 프레임은 숨김(dwell은 계속 흐름 — 다음 프레임 로드되면 표시)
      mesh.visible = false;
      stateRef.current.centerActive = false;
      return;
    }

    const progress = Math.max(0, Math.min(1, elapsedRef.current / SLIDE_DWELL_SEC));
    const pe = easeOutTerminal(progress, SLIDE_APPROACH_EASE, SLIDE_TERMINAL_SPEED_RATIO);
    const dist = THREE.MathUtils.lerp(SLIDE_START_DIST, SLIDE_END_DIST, pe);

    const camZ = stateRef.current.cameraZ;
    mesh.visible = true;
    mesh.position.set(0, camera.position.y, camZ - dist);
    // 이 컴포넌트의 useFrame은 Scene의 useFrame보다 먼저 실행될 수 있어 위 camZ는
    // '지난 프레임' 값일 수 있다(1프레임 지연 → 빠른 접근 시 뚝뚝 끊김). dist를
    // stateRef에 기록해 두면 Scene이 이번 프레임 최종 cameraZ 확정 직후 Z를 재확정한다.
    stateRef.current.centerActive = true;
    stateRef.current.centerDist = dist;

    const h = BASE_HEIGHT * DISPLAY_SCALE;
    const w = h * (entry.aspect || 1);
    mesh.scale.set(w, h, 1);

    if (mat.map !== entry.texture) {
      mat.map = entry.texture;
      mat.needsUpdate = true;
    }
    // fade-in: 진행도 기반(등장 구간). fade-out: 거리 기반 — 카메라 80유닛 앞부터
    // 감소해 지나치는 순간 반투명(~33%), 카메라 뒤 40유닛에서 0. '반투명해진
    // 플레인을 카메라가 스쳐 지나가는' 느낌을 위해 정지·소멸이 아니라 관통시킨다.
    const fadeIn =
      progress <= 0 ? 0 : Math.min(1, progress / SLIDE_FADE_IN);
    const fadeOut = Math.max(
      0,
      Math.min(
        1,
        (dist - SLIDE_FADE_OUT_END_DIST) /
          (SLIDE_FADE_OUT_START_DIST - SLIDE_FADE_OUT_END_DIST),
      ),
    );
    const opacity = Math.min(fadeIn, fadeOut);
    mat.opacity = opacity;
    // 사실상 투명한 구간(등장 직전·통과 직후)은 드로우 자체를 생략 —
    // 통과 직전 전화면 크기의 DoubleSide 알파 쿼드 오버드로(타일 GPU 부담) 제거
    if (opacity <= 0.01) mesh.visible = false;
  });

  return (
    <mesh ref={meshRef} visible={false}>
      <planeGeometry args={[1, 1]} />
      <meshBasicMaterial ref={matRef} side={THREE.DoubleSide} transparent opacity={0} />
    </mesh>
  );
}
