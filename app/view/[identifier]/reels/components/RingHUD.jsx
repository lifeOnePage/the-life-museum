"use client";
import { useEffect, useMemo, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { SlArrowUp } from "react-icons/sl";

export default function RingHUD({
  index,
  setIndex,
  range,
  setRange,
  categories,
  onClickSound,
}) {
  const [open, setOpen] = useState(false);

  const currentLabel = useMemo(() => {
    const [min, max] = range;
    const hit = categories?.find((c) => c.start === min && c.end === max);
    return hit?.label || "범위";
  }, [range, categories]);

  const [min, max] = range;
  const valRef = useRef(index);

  const onChange = (e) => {
    const raw = Number(e.target.value);
    const v = Math.round(raw); // 스냅
    if (v !== valRef.current) {
      valRef.current = v;
      setIndex(v); // → 3D에는 targetIndex만 전달 (연속 회전은 r3f에서)
      onClickSound?.();
    }
  };

  const onChangeEnd = () => {
    // 이미 onChange에서 스냅 적용됨. 안전하게 한 번 더 보정.
    setIndex(valRef.current);
  };

  const onPickCat = (c) => {
    setRange([c.start, c.end]);
    valRef.current = c.start;
    setIndex(c.start);
    setOpen(false);
  };

  useEffect(() => {
    // 범위 바뀔 때 현재 index 보정
    const [mn, mx] = range;
    if (index < mn || index > mx) {
      valRef.current = mn;
      setIndex(mn);
    } else {
      valRef.current = index;
    }
  }, [range, index, setIndex]);

  return (
    <div className="absolute inset-x-0 bottom-0 z-30 flex flex-col items-center gap-2 p-4">
      <div className="bg-black-200/80 flex w-[92vw] max-w-[520px] items-center gap-3 rounded-2xl border border-white/15 p-3 backdrop-blur">
        <span className="text-xs text-white/50">{min}</span>
        <input
          type="range"
          min={min}
          max={max}
          step={1}
          value={valRef.current}
          onChange={onChange}
          className="h-1 flex-1 appearance-none rounded-full bg-white/15 accent-white"
        />
        <span className="text-xs text-white/50">{max}</span>

        <button
          onClick={() => setOpen((p) => !p)}
          className="bg-black-300/70 hover:bg-black-300 ml-2 flex items-center gap-1 rounded-full border border-white/20 px-2 py-1 text-xs"
        >
          {currentLabel}
          <SlArrowUp size={12} />
        </button>
      </div>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 16 }}
            className="bg-black-200/95 max-h-[44vh] w-[92vw] max-w-[520px] overflow-auto rounded-2xl border border-white/15 p-3 backdrop-blur"
          >
            <div className="grid grid-cols-2 gap-2 text-sm">
              {categories?.map((c, i) => (
                <button
                  key={i}
                  onClick={() => onPickCat(c)}
                  className="bg-black-300/60 hover:bg-black-300 rounded-lg border border-white/10 px-3 py-2 text-left"
                >
                  {c.label}
                  <div className="mt-1 text-[10px] text-white/40">
                    {c.start}–{c.end}
                  </div>
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
