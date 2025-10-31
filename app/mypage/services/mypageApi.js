// app/mypage/services/mypageApi.js
export async function fetchMyReels(token) {
  const res = await fetch("/api/reel", {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  const json = await res.json();
  if (!json.ok) throw new Error("failed to fetch reel");
  return json;
}

export async function fetchMyRecords(token) {
  const res = await fetch("/api/records", {
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  const json = await res.json();
  if (!json.ok) throw new Error("failed to fetch records");
  return json;
}

export async function fetchMyDatas({ token }) {
  const res = await fetch("/api/data", {
    method: "GET",
    headers: { Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  const json = await res.json();
  if (!json.ok) throw new Error("failed to fetch reel");
  return json;
}

export async function createReel(token, identifier, name) {
  console.group("----createReel----");
  console.log("identifier: ", identifier);
  console.log("name: ", name);
  console.groupEnd();
  const data = { identifier, name };
  const res = await fetch("/api/reel", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },

    body: JSON.stringify(data),
  });
  if (res.status === 409) throw new Error("409");
  const json = await res.json();
  console.group("createReel response");
  console.log("ok: ", await json.ok);
  console.log("message: ", await json.error);
  console.log("status: ", await json.status);
  console.groupEnd();
  if (!json.ok) throw new Error("create reel failed");
  return json;
}

export async function createRecord(token, identifier, name) {
  const res = await fetch("/api/records", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ identifier, name }),
  });
  if (res.status === 409) throw new Error("409");
  const json = await res.json();
  if (!json.ok) throw new Error("create record failed");
  return json;
}

export async function updateReelIdentifier(token, id, identifier, name) {
  const data = { identifier, name };
  const res = await fetch(`/api/reel/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(data),
  });
  if (res.status === 409) throw new Error("409");
  const json = await res.json();
  if (!json.ok) throw new Error("update reel failed");
  return json;
}

export async function updateRecordIdentifier(token, id, identifier) {
  const res = await fetch(`/api/records/${id}`, {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({ identifier }),
  });
  if (res.status === 409) throw new Error("409");
  const json = await res.json();
  if (!json.ok) throw new Error("update record failed");
  return json;
}

export async function updateMyProfile(token, payload) {
  // payload: { name?, mobile?, email? }
  const res = await fetch("/api/users", {
    method: "PATCH",
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify(payload),
  });
  const json = await res.json();
  if (!json.ok) throw new Error("update profile failed");
  return json; // { ok: true, user }
}
