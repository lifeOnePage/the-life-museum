// app/login/components/Buttons.js
"use client";

export function PrimaryButton({ children, onClick, disabled }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        width: "100%",
        height: 44,
        marginTop: 16,
        border: "1px solid #666",
        borderRadius: 12,
        fontSize: 16,
        fontWeight: 600,
        cursor: disabled ? "not-allowed" : "pointer",
        background: disabled ? "#111" : "#333",
        color: "#fff",
      }}
    >
      {children}
    </button>
  );
}

export function SecondaryButton({ children, onClick, disabled }) {
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      style={{
        width: "100%",
        height: 44,
        marginTop: 10,
        border: "1px solid #cfd8e3",
        borderRadius: 10,
        fontSize: 14,
        fontWeight: 500,
        cursor: disabled ? "not-allowed" : "pointer",
        background: "#fff",
        color: "#374151",
      }}
    >
      {children}
    </button>
  );
}
