import React, { useEffect } from "react";

export default function useIsMobile(bp = 768) {
  const [m, setM] = React.useState(
    typeof window !== "undefined" ? window.innerWidth <= bp : false,
  );
  useEffect(() => {
    const on = () => setM(window.innerWidth <= bp);
    window.addEventListener("resize", on);
    on();
    return () => window.removeEventListener("resize", on);
  }, [bp]);

  return m;
}
