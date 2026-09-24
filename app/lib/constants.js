// 추모(memorial) 앨범이 보존하는 미디어 최대 개수.
// 백엔드 tlm_be_py/app/schemas/record.py의 MEMORIAL_MAX_MEDIA와 반드시 동일 값 유지.
// 메모리 탭 3D 링(MediaRing)의 MAX_PLANES가 이 값을 재수출한다 —
// "링에 배치 가능한 최대 플레인 수 = 영속 미디어 상한"은 우연이 아니라 제품 결정.
export const MEMORIAL_MAX_MEDIA = 36;
