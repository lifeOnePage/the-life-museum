// app/api/_lib/jwt.js
import jwt from "jsonwebtoken";

const SECRET = process.env.JWT_SECRET;

export function signJwt(payload, opts = {}) {
  return jwt.sign(payload, SECRET, { algorithm: "HS256", expiresIn: "7d", ...opts });
}

export function verifyJwt(token) {
  try {
    return jwt.verify(token, SECRET);
  } catch {
    return null;
  }
}
