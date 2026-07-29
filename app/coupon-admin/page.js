"use client";

import { useCallback, useEffect, useState } from "react";

const BASE_URL =
  "https://the-life-museum-backend-production.up.railway.app/api/v1";
const TOKEN_KEY = "tlm_coupon_admin_token";

// ── 스타일 (마이페이지 다크 톤과 통일) ──────────────────────
const pageStyle = {
  fontFamily:
    "pretendard, system-ui, -apple-system, Segoe UI, Roboto, Noto Sans KR, Helvetica, Arial, sans-serif",
  minHeight: "100vh",
  display: "flex",
  justifyContent: "center",
  alignItems: "flex-start",
  color: "#fff",
  background: "linear-gradient(135deg, #37393bff 0%, #1e1f21ff 50%, #000 100%)",
  padding: "60px 20px",
  boxSizing: "border-box",
};
const cardStyle = {
  boxSizing: "border-box",
  border: "1px solid #2e2e2e",
  width: "100%",
  background: "#10101066",
  borderRadius: 10,
  padding: 20,
  color: "#fff",
};
const inputStyle = {
  boxSizing: "border-box",
  width: "100%",
  height: 44,
  borderRadius: 10,
  border: "1px solid #3a3a3a",
  background: "#0f0f0f",
  color: "#fff",
  padding: "10px 12px",
  outline: "none",
  fontSize: 16,
};
const btnStyle = {
  display: "inline-flex",
  alignItems: "center",
  justifyContent: "center",
  gap: 8,
  border: "1px solid #545454",
  background: "#10101066",
  color: "#fff",
  padding: "10px 18px",
  borderRadius: 8,
  cursor: "pointer",
  fontSize: 14,
};

export default function CouponAdminPage() {
  const [token, setToken] = useState(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    setToken(sessionStorage.getItem(TOKEN_KEY));
    setReady(true);
  }, []);

  const onAuthed = (t) => {
    sessionStorage.setItem(TOKEN_KEY, t);
    setToken(t);
  };
  const onExpired = useCallback(() => {
    sessionStorage.removeItem(TOKEN_KEY);
    setToken(null);
  }, []);

  if (!ready) return null;

  return (
    <div style={pageStyle}>
      <div style={{ width: "100%", maxWidth: 720 }}>
        <h1 style={{ fontSize: 22, margin: "0 0 20px" }}>크레딧 쿠폰 발행</h1>
        {token ? (
          <AdminPanel token={token} onExpired={onExpired} />
        ) : (
          <PasswordGate onAuthed={onAuthed} />
        )}
      </div>
    </div>
  );
}

// ── 패스워드 게이트 ─────────────────────────────────────────
function PasswordGate({ onAuthed }) {
  const [password, setPassword] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const submit = async () => {
    if (!password || busy) return;
    setBusy(true);
    setError("");
    try {
      const res = await fetch(`${BASE_URL}/coupon/admin/auth`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json?.detail || "인증에 실패했어요.");
      onAuthed(json.token);
    } catch (e) {
      setError(e?.message || "인증에 실패했어요.");
    } finally {
      setBusy(false);
    }
  };

  return (
    <div style={{ ...cardStyle, display: "grid", gap: 12, maxWidth: 420 }}>
      <p style={{ margin: 0, color: "#bbb", fontSize: 14 }}>
        관리자 패스워드를 입력하세요.
      </p>
      <input
        type="password"
        style={inputStyle}
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && submit()}
        autoFocus
      />
      <button
        style={{ ...btnStyle, opacity: busy || !password ? 0.5 : 1 }}
        onClick={submit}
        disabled={busy || !password}
      >
        {busy ? "확인 중..." : "입장"}
      </button>
      {error && (
        <p style={{ margin: 0, fontSize: 13, color: "#ff7d7d" }}>{error}</p>
      )}
    </div>
  );
}

// ── 발행 패널 ───────────────────────────────────────────────
function AdminPanel({ token, onExpired }) {
  const [couponType, setCouponType] = useState("credit"); // "credit" | "discount"
  const [creditAmount, setCreditAmount] = useState(1000);
  const [discountPercent, setDiscountPercent] = useState(10);
  const [maxDiscount, setMaxDiscount] = useState(5000);
  const [count, setCount] = useState(1);
  const [prefix, setPrefix] = useState("TLM");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [generated, setGenerated] = useState([]);
  const [list, setList] = useState({ total: 0, used: 0, items: [] });
  const [copied, setCopied] = useState(false);

  const authedRequest = useCallback(
    async (path, opts = {}) => {
      const res = await fetch(`${BASE_URL}${path}`, {
        ...opts,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
          ...(opts.headers || {}),
        },
      });
      if (res.status === 401) {
        onExpired();
        throw new Error("세션이 만료되었어요. 다시 로그인해주세요.");
      }
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json?.detail || "요청에 실패했어요.");
      return json;
    },
    [token, onExpired],
  );

  const refreshList = useCallback(async () => {
    try {
      const json = await authedRequest("/coupon/admin/list?limit=100");
      setList(json);
    } catch (e) {
      setError(e?.message || "목록을 불러오지 못했어요.");
    }
  }, [authedRequest]);

  useEffect(() => {
    refreshList();
  }, [refreshList]);

  const generate = async () => {
    if (busy) return;
    setBusy(true);
    setError("");
    setCopied(false);
    try {
      const json = await authedRequest("/coupon/admin/generate", {
        method: "POST",
        body: JSON.stringify({
          coupon_type: couponType,
          ...(couponType === "credit"
            ? { credit_amount: Number(creditAmount) }
            : {
                discount_percent: Number(discountPercent),
                max_discount_krw: Number(maxDiscount),
              }),
          count: Number(count),
          prefix,
        }),
      });
      setGenerated(json.coupons || []);
      await refreshList();
    } catch (e) {
      setError(e?.message || "발행에 실패했어요.");
    } finally {
      setBusy(false);
    }
  };

  const copyAll = async () => {
    try {
      await navigator.clipboard.writeText(
        generated.map((c) => c.code).join("\n"),
      );
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {}
  };

  return (
    <div style={{ display: "grid", gap: 16 }}>
      {/* 발행 폼 */}
      <div style={{ ...cardStyle, display: "grid", gap: 12 }}>
        <strong>새 쿠폰 발행</strong>
        {/* 타입 선택 */}
        <div style={{ display: "flex", gap: 8 }}>
          {[
            { key: "credit", label: "크레딧 쿠폰 (즉시 지급)" },
            { key: "discount", label: "할인 쿠폰 (결제 시 % 차감)" },
          ].map((tab) => (
            <button
              key={tab.key}
              onClick={() => setCouponType(tab.key)}
              style={{
                ...btnStyle,
                padding: "8px 14px",
                fontSize: 13,
                borderColor: couponType === tab.key ? "#7dff9b" : "#545454",
                color: couponType === tab.key ? "#7dff9b" : "#fff",
              }}
            >
              {tab.label}
            </button>
          ))}
        </div>
        <div
          style={{
            display: "grid",
            gridTemplateColumns:
              couponType === "credit" ? "1fr 1fr 1fr" : "1fr 1fr 1fr 1fr",
            gap: 8,
          }}
        >
          {couponType === "credit" ? (
            <label style={{ display: "grid", gap: 4, fontSize: 13, color: "#bbb" }}>
              크레딧 수량
              <input
                type="number"
                min={1}
                style={inputStyle}
                value={creditAmount}
                onChange={(e) => setCreditAmount(e.target.value)}
              />
            </label>
          ) : (
            <>
              <label style={{ display: "grid", gap: 4, fontSize: 13, color: "#bbb" }}>
                할인율 (%)
                <input
                  type="number"
                  min={1}
                  max={100}
                  style={inputStyle}
                  value={discountPercent}
                  onChange={(e) => setDiscountPercent(e.target.value)}
                />
              </label>
              <label style={{ display: "grid", gap: 4, fontSize: 13, color: "#bbb" }}>
                최대 할인 (원)
                <input
                  type="number"
                  min={1}
                  style={inputStyle}
                  value={maxDiscount}
                  onChange={(e) => setMaxDiscount(e.target.value)}
                />
              </label>
            </>
          )}
          <label style={{ display: "grid", gap: 4, fontSize: 13, color: "#bbb" }}>
            발행 개수 (최대 100)
            <input
              type="number"
              min={1}
              max={100}
              style={inputStyle}
              value={count}
              onChange={(e) => setCount(e.target.value)}
            />
          </label>
          <label style={{ display: "grid", gap: 4, fontSize: 13, color: "#bbb" }}>
            코드 프리픽스
            <input
              style={{ ...inputStyle, textTransform: "uppercase" }}
              value={prefix}
              maxLength={10}
              onChange={(e) => setPrefix(e.target.value)}
            />
          </label>
        </div>
        <button
          style={{ ...btnStyle, opacity: busy ? 0.5 : 1 }}
          onClick={generate}
          disabled={busy}
        >
          {busy ? "발행 중..." : "쿠폰 발행"}
        </button>
        {error && (
          <p style={{ margin: 0, fontSize: 13, color: "#ff7d7d" }}>{error}</p>
        )}
      </div>

      {/* 방금 발행된 코드 */}
      {generated.length > 0 && (
        <div style={{ ...cardStyle, display: "grid", gap: 10 }}>
          <div style={{ display: "flex", alignItems: "center" }}>
            <strong>발행된 코드 ({generated.length}개)</strong>
            <button
              style={{ ...btnStyle, marginLeft: "auto", padding: "6px 12px" }}
              onClick={copyAll}
            >
              {copied ? "복사됨!" : "전체 복사"}
            </button>
          </div>
          <div
            style={{
              display: "grid",
              gap: 6,
              maxHeight: 240,
              overflow: "auto",
              fontFamily: "ui-monospace, SFMono-Regular, Menlo, monospace",
              fontSize: 14,
            }}
          >
            {generated.map((c) => (
              <div
                key={c.code}
                style={{
                  display: "flex",
                  justifyContent: "space-between",
                  padding: "8px 10px",
                  background: "#0f0f0f",
                  borderRadius: 8,
                  border: "1px solid #2a2a2a",
                }}
              >
                <span>{c.code}</span>
                <span style={{ color: "#7dff9b" }}>
                  {c.coupon_type === "discount"
                    ? `${c.discount_percent}% 할인 (최대 ₩${(c.max_discount_krw || 0).toLocaleString()})`
                    : `${(c.credit_amount || 0).toLocaleString()} 크레딧`}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* 전체 목록 */}
      <div style={{ ...cardStyle, display: "grid", gap: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <strong>발행 내역</strong>
          <span style={{ fontSize: 13, color: "#bbb" }}>
            총 {list.total}개 · 사용됨 {list.used}개
          </span>
          <button
            style={{ ...btnStyle, marginLeft: "auto", padding: "6px 12px" }}
            onClick={refreshList}
          >
            새로고침
          </button>
        </div>
        <div style={{ overflowX: "auto" }}>
          <table
            style={{
              width: "100%",
              borderCollapse: "collapse",
              fontSize: 13,
              whiteSpace: "nowrap",
            }}
          >
            <thead>
              <tr style={{ color: "#888", textAlign: "left" }}>
                <th style={{ padding: "6px 8px" }}>코드</th>
                <th style={{ padding: "6px 8px" }}>혜택</th>
                <th style={{ padding: "6px 8px" }}>상태</th>
                <th style={{ padding: "6px 8px" }}>사용자</th>
                <th style={{ padding: "6px 8px" }}>발행일</th>
              </tr>
            </thead>
            <tbody>
              {list.items.map((c) => (
                <tr key={c.id} style={{ borderTop: "1px solid #222" }}>
                  <td
                    style={{
                      padding: "6px 8px",
                      fontFamily:
                        "ui-monospace, SFMono-Regular, Menlo, monospace",
                    }}
                  >
                    {c.code}
                  </td>
                  <td style={{ padding: "6px 8px" }}>
                    {c.coupon_type === "discount"
                      ? `${c.discount_percent}% (최대 ₩${(c.max_discount_krw || 0).toLocaleString()})`
                      : `${(c.credit_amount || 0).toLocaleString()} 크레딧`}
                  </td>
                  <td
                    style={{
                      padding: "6px 8px",
                      color: c.is_used
                        ? "#ff7d7d"
                        : c.claimed_by_email
                          ? "#ffd97d"
                          : "#7dff9b",
                    }}
                  >
                    {c.is_used
                      ? "사용됨"
                      : c.claimed_by_email
                        ? "등록됨"
                        : "미사용"}
                  </td>
                  <td style={{ padding: "6px 8px", color: "#bbb" }}>
                    {c.used_by_email || c.claimed_by_email || "-"}
                  </td>
                  <td style={{ padding: "6px 8px", color: "#bbb" }}>
                    {new Date(c.created_at).toLocaleDateString("ko-KR")}
                  </td>
                </tr>
              ))}
              {list.items.length === 0 && (
                <tr>
                  <td
                    colSpan={5}
                    style={{ padding: 16, color: "#888", textAlign: "center" }}
                  >
                    발행된 쿠폰이 없어요.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
