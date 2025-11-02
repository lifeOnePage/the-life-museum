export async function fetchRecordPreview(identifier) {
  const res = await fetch(
    `/api/records/view/${encodeURIComponent(identifier)}`,
    {
      cache: "no-store",
    },
  );
  const json = await res.json().catch(() => ({}));
  if (!res.ok || !json?.ok) {
    const errorMsg = json?.error || "failed";
    console.error("[fetchRecordPreview] error:", errorMsg, json);
    throw new Error(errorMsg);
  }
  return json.item;
}
