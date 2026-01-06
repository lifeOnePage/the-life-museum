export function toE164(phoneNumber, countryCode = "+82") {
  const cleaned = phoneNumber.replace(/\D/g, "");

  // 한국 번호 (+82) - 010으로 시작하는 경우 0 제거
  if (countryCode === "+82") {
    if (cleaned.startsWith("010")) {
      return "+82" + cleaned.substring(1); // 01012345678 → +821012345678
    }
    if (cleaned.startsWith("10")) {
      return "+82" + cleaned; // 이미 0이 없는 경우
    }
    throw new Error("한국 번호는 010으로 시작해야 합니다");
  }

  // 미국/캐나다 (+1) - 10자리 숫자
  if (countryCode === "+1") {
    if (cleaned.length === 10) {
      return "+1" + cleaned;
    }
    if (cleaned.length === 11 && cleaned.startsWith("1")) {
      return "+" + cleaned; // 1로 시작하면 +를 붙임
    }
    throw new Error("미국/캐나다 번호는 10자리여야 합니다");
  }

  // 기타 국가 - 국가 코드 + 번호
  // 번호가 0으로 시작하면 제거 (대부분의 국가에서 국제 전화 시 0 제거)
  const numberWithoutLeadingZero = cleaned.startsWith("0")
    ? cleaned.substring(1)
    : cleaned;

  return countryCode + numberWithoutLeadingZero;
}

export function formatPhoneWithHyphen(value) {
  const numbers = value.replace(/\D/g, "").slice(0, 11);
  if (numbers.length < 4) return numbers;
  if (numbers.length < 8) return `${numbers.slice(0, 3)}-${numbers.slice(3)}`;
  return `${numbers.slice(0, 3)}-${numbers.slice(3, 7)}-${numbers.slice(7)}`;
}
