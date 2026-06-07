import { useState, useCallback, useRef, useEffect } from "react";
import { TV_OFF_DURATION_MS, STATIC_DURATION_MS } from "./constants";

/**
 * Scene state machine for VHS exhibition.
 * Flow: "intro" → "insert" → "tvOff" → "static" → "playback"
 */
export function useVHSScene() {
  const [scene, setScene] = useState("intro");
  const timers = useRef([]);

  const clearTimers = useCallback(() => {
    timers.current.forEach(clearTimeout);
    timers.current = [];
  }, []);

  const startInsert = useCallback(() => {
    setScene("insert");
  }, []);

  const onInsertEnded = useCallback(() => {
    clearTimers();
    setScene("tvOff");

    const t1 = setTimeout(() => {
      setScene("static");

      const t2 = setTimeout(() => {
        setScene("playback");
      }, STATIC_DURATION_MS);
      timers.current.push(t2);
    }, TV_OFF_DURATION_MS);
    timers.current.push(t1);
  }, [clearTimers]);

  useEffect(() => {
    return clearTimers;
  }, [clearTimers]);

  return { scene, startInsert, onInsertEnded };
}
