"use client";

export default function AppName({ className = "", style = {} }) {
  return (
    <span
      className={className}
      style={{
        fontFamily: "'Futura', 'Futura PT', sans-serif",
        ...style,
      }}
    >
      the
      <span style={{ fontSize: "1.25em", textTransform: "uppercase" }}>
        LIFE
      </span>
      memory
    </span>
  );
}
