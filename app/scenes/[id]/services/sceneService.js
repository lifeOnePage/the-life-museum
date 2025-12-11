/**
 * Scene 서비스 - API 호출 래퍼
 */

/**
 * Scene 데이터 조회
 * @param {string} sceneId - Scene identifier
 * @returns {Promise<Object>}
 */
export async function getScene(sceneId) {
  const res = await fetch(`/api/scenes/${sceneId}`);
  const data = await res.json();

  if (!data.ok) {
    throw new Error(data.error || "Failed to fetch scene");
  }

  return data.scene;
}

/**
 * Scene 전체 업데이트
 * @param {string} sceneId
 * @param {Object} payload - { profile, items, lifestoryProgress }
 * @returns {Promise<Object>}
 */
export async function updateScene(sceneId, payload) {
  const res = await fetch(`/api/scenes/${sceneId}`, {
    method: "PUT",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = await res.json();

  if (!data.ok) {
    throw new Error(data.error || "Failed to update scene");
  }

  return data.scene;
}

/**
 * 프로필만 업데이트
 * @param {string} sceneId
 * @param {Object} profile - { photo, name, birthDate, birthPlace, biography }
 * @returns {Promise<Object>}
 */
export async function updateProfile(sceneId, profile) {
  const res = await fetch(`/api/scenes/${sceneId}/profile`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(profile),
  });

  const data = await res.json();

  if (!data.ok) {
    throw new Error(data.error || "Failed to update profile");
  }

  return data.scene;
}

/**
 * 생애문 진행상황 저장
 * @param {string} sceneId
 * @param {Object} progressData
 * @returns {Promise<Object>}
 */
export async function saveLifestoryProgress(sceneId, progressData) {
  const res = await fetch(`/api/scenes/${sceneId}/lifestory`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ progressData }),
  });

  const data = await res.json();

  if (!data.ok) {
    throw new Error(data.error || "Failed to save lifestory progress");
  }

  return data.scene;
}

/**
 * 아이템 추가
 * @param {string} sceneId
 * @param {Object} itemData - { title, date, images: [url] }
 * @returns {Promise<Object>}
 */
export async function addItem(sceneId, itemData) {
  const res = await fetch(`/api/scenes/${sceneId}/items`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(itemData),
  });

  const data = await res.json();

  if (!data.ok) {
    throw new Error(data.error || "Failed to add item");
  }

  return data.item;
}

/**
 * 아이템 업데이트
 * @param {string} sceneId
 * @param {number} itemId
 * @param {Object} itemData - { title, date, images }
 * @returns {Promise<Object>}
 */
export async function updateItem(sceneId, itemId, itemData) {
  const res = await fetch(`/api/scenes/${sceneId}/items/${itemId}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(itemData),
  });

  const data = await res.json();

  if (!data.ok) {
    throw new Error(data.error || "Failed to update item");
  }

  return data.item;
}

/**
 * 아이템 삭제
 * @param {string} sceneId
 * @param {number} itemId
 * @returns {Promise<void>}
 */
export async function deleteItem(sceneId, itemId) {
  const res = await fetch(`/api/scenes/${sceneId}/items/${itemId}`, {
    method: "DELETE",
  });

  const data = await res.json();

  if (!data.ok) {
    throw new Error(data.error || "Failed to delete item");
  }
}

/**
 * 이미지/비디오 업로드
 * @param {File} file
 * @returns {Promise<string>} - 업로드된 파일의 public URL
 */
export async function uploadFile(file) {
  const formData = new FormData();
  formData.append("file", file);

  const res = await fetch("/api/scenes/upload", {
    method: "POST",
    body: formData,
  });

  const data = await res.json();

  if (!data.ok) {
    throw new Error(data.error || "Failed to upload file");
  }

  return data.publicUrl;
}

/**
 * Scene 삭제
 * @param {string} sceneId
 * @returns {Promise<void>}
 */
export async function deleteScene(sceneId) {
  const res = await fetch(`/api/scenes/${sceneId}`, {
    method: "DELETE",
  });

  const data = await res.json();

  if (!data.ok) {
    throw new Error(data.error || "Failed to delete scene");
  }
}
