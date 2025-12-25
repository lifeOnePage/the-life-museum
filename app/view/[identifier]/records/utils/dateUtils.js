import { MONTHS } from "./constants";

export const toMonthDay = (str) => {
  if (!str) return "";
  const parts = str.split(".").map((s) => parseInt(s, 10));
  const [y, m, d] = parts;

  if (!y) return "";
  if (!m) return "";
  if (!d) return ` ${MONTHS[m - 1]}`;

  return ` ${MONTHS[m - 1]} ${String(d).padStart(2, "0")}`;
};

export const getYear = (str) => {
  if (!str) return "";
  const [y] = str.split(".");
  return y ? y + " " : "";
};

export const formatDate = (str) => {
  if (!str) return "";
  const parts = str.split(".").map((s) => parseInt(s, 10));
  const [y, m, d] = parts;

  if (!y) return "";
  if (!m) return String(y);
  if (!d) return `${y} ${MONTHS[m - 1]}`;

  const monthName = MONTHS[m - 1] || "";
  const day = String(d).padStart(2, "0");
  return `${y} ${monthName} ${day}`;
};

// 생년월일과 이벤트 날짜로 나이 계산
export const calculateAge = (birthDate, eventDate) => {
  if (!birthDate || !eventDate) return null;

  const [birthY, birthM, birthD] = birthDate.split(".").map(Number);
  const [eventY, eventM, eventD] = eventDate.split(".").map(Number);

  if (!birthY || !eventY) return null;

  let age = eventY - birthY;

  // 월과 일이 있으면 더 정확하게 계산
  if (birthM && eventM) {
    if (
      eventM < birthM ||
      (eventM === birthM && eventD && birthD && eventD < birthD)
    ) {
      age--;
    }
  }

  return age >= 0 ? age : null;
};


