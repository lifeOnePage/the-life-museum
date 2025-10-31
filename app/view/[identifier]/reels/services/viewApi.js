export async function fetchPreview(identifier) {
  const res = await fetch(`/api/reel/view/${encodeURIComponent(identifier)}`, {
    cache: "no-store",
  });
  const json = await res.json().catch(() => ({}));
  if (!res.ok || !json?.ok) throw new Error(json?.error || "failed");
  return json.item;
}
