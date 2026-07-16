"use client";
import { useState } from "react";
import { FiGift } from "react-icons/fi";
import { cardStyle, iconBtn, inputStyle } from "./styles";
import { useAuth } from "@/app/contexts/AuthContext";
import { authedFetch } from "@/app/utils/authedFetch";

const BASE_URL =
  "https://the-life-museum-backend-production.up.railway.app/api/v1";

export default function CouponCard() {
  const { user, refreshCredits } = useAuth();
  const [code, setCode] = useState("");
  const [busy, setBusy] = useState(false);
  const [message, setMessage] = useState(null); // { type: 'ok' | 'error', text }

  const onRedeem = async () => {
    const trimmed = code.trim();
    if (!trimmed || busy) return;
    setBusy(true);
    setMessage(null);
    try {
      const res = await authedFetch(`${BASE_URL}/coupon/redeem`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: trimmed }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(json?.detail || "쿠폰 등록에 실패했어요.");
      }
      setMessage({
        type: "ok",
        text: `${json.added.toLocaleString()} 크레딧이 지급되었어요! (보유: ${json.credits.toLocaleString()})`,
      });
      setCode("");
      await refreshCredits();
    } catch (e) {
      setMessage({
        type: "error",
        text: e?.message || "쿠폰 등록에 실패했어요.",
      });
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={{ ...cardStyle, display: "grid", gap: 12 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
        <FiGift />
        <strong style={{ color: "#fff" }}>쿠폰 등록</strong>
        {typeof user?.credits === "number" && (
          <span
            style={{
              marginLeft: "auto",
              fontSize: 13,
              color: "#bbb",
              border: "1px solid #333",
              padding: "2px 8px",
              borderRadius: 999,
            }}
          >
            보유 {user.credits.toLocaleString()} 크레딧
          </span>
        )}
      </div>
      <p style={{ margin: 0, color: "#bbb", fontSize: 14 }}>
        쿠폰 코드를 입력하면 크레딧이 바로 지급돼요.
      </p>
      <div style={{ display: "flex", gap: 8 }}>
        <input
          style={{ ...inputStyle, flex: 1, textTransform: "uppercase" }}
          placeholder="예: TLM-XXXX-XXXX"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && onRedeem()}
          disabled={busy}
        />
        <button
          style={{
            ...iconBtn,
            whiteSpace: "nowrap",
            opacity: busy || !code.trim() ? 0.5 : 1,
          }}
          onClick={onRedeem}
          disabled={busy || !code.trim()}
        >
          {busy ? "등록 중..." : "등록"}
        </button>
      </div>
      {message && (
        <p
          style={{
            margin: 0,
            fontSize: 13,
            color: message.type === "ok" ? "#7dff9b" : "#ff7d7d",
          }}
        >
          {message.text}
        </p>
      )}
    </div>
  );
}
