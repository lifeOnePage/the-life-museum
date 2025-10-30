export default function Skel({ height = 44 }) {
  return (
    <div
      style={{
        height,
        borderRadius: 10,
        background:
          "linear-gradient(90deg,#101010 0%,#202020 50%,#101010 100%)",
        backgroundSize: "200% 100%",
        animation: "skel 1.2s ease-in-out infinite",
      }}
    />
  );
}