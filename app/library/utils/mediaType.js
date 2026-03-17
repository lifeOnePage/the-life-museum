export function getMediaType(url) {
  if (!url) return null;
  const lower = url.toLowerCase().split("?")[0];
  if (lower.endsWith(".gif")) return "gif";
  if (
    lower.endsWith(".mp4") ||
    lower.endsWith(".webm") ||
    lower.endsWith(".mov")
  )
    return "video";
  return "image";
}
