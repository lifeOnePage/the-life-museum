// app/login/components/FieldBlock.js
"use client";

export default function FieldBlock({
  isUserId,
  label,
  subLabel,
  value,
  onChange,
  placeholder,
  type = "text",
  autoFocus,
  disabled,
  inputRef,
}) {
  return (
    <div
      style={{color: "#fff" }}
    >
      {/* {label && (
        <label style={{ display: "block", fontSize: 14, color: "#ddd", marginBottom: 6 }}>
          {label}
        </label>
      )} */}

      {/* {isUserId &&
        Array.isArray(subLabel) &&
        subLabel.map((l, i) => (
          <label
            key={i}
            style={{ display: "block", fontSize: 12, color: "#aaa" }}
          >
            {l}
          </label>
        ))} */}

      <input
        ref={inputRef}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        type={type}
        autoFocus={autoFocus}
        disabled={disabled}
        style={{
          color:"#fff",
          boxSizing:"border-box",
          width: "100%",
          height: 50,
          border: "1px solid #aaa",
          borderRadius: 10,
          padding: "4px 16px",
          fontSize: 16,
          outline: "none",
          opacity: disabled ? 0.8 : 1,
          background: disabled ? "#333" : "none",
          transition: "box-shadow 0.2s ease",
        }}
        onFocus={(e) =>
          (e.currentTarget.style.boxShadow = "0 0 0 3px rgba(109,172,255,0.25)")
        }
        onBlur={(e) => (e.currentTarget.style.boxShadow = "none")}
      />

      {/* {isUserId && (
        <label
          style={{
            display: "block",
            fontSize: 12,
            color: "#aaa",
            marginTop: 8,
          }}
        >
          {`https://theLifeGallery/wheel/${value}`} <br />
          {`https://theLifeGallery/card/${value}`}
        </label>
      )} */}
    </div>
  );
}
