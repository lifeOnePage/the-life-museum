// app/login/components/SlideScreen.js
"use client";

import { motion } from "framer-motion"; // external

function SlideScreen({ children }, ref) {
  return (
    <motion.div
      ref={ref}
      initial={{ x: 40, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: -40, opacity: 0 }}
      transition={{ duration: 0.28, ease: "easeOut" }}
      style={{ }}
    >
      {children}
    </motion.div>
  );
}

const Row = ({ children }) => (
  <motion.div
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    exit={{ opacity: 0, y: -12 }}
    transition={{ duration: 0.22 }}
    style={{ marginBottom: 12 }}
  >
    {children}
  </motion.div>
);

export default Object.assign(/** default export */ SlideScreen, { Row });
