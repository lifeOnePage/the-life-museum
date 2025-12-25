export const norm360 = (a) => ((a % 360) + 360) % 360;
export const wrapTo180 = (d) => ((d + 540) % 360) - 180;
export const angDist = (a, b) => {
  const d = Math.abs(norm360(a) - norm360(b));
  return Math.min(d, 360 - d);
};


