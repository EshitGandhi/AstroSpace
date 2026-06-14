"use client";

import { motion } from "framer-motion";

export default function HouseGridTexture() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none opacity-20 z-0">
      <svg
        width="100%"
        height="100%"
        viewBox="0 0 800 800"
        preserveAspectRatio="xMidYMid slice"
        xmlns="http://www.w3.org/2000/svg"
        className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-[1200px] text-gold"
      >
        {/* Diamond Chart Outline (North Indian Style Kundli) */}
        <motion.path
          d="M 400 100 L 700 400 L 400 700 L 100 400 Z"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 0.5 }}
          transition={{ duration: 2, ease: "easeInOut" }}
        />
        {/* Internal Cross Lines */}
        <motion.path
          d="M 100 100 L 700 700 M 100 700 L 700 100 M 400 100 L 400 700 M 100 400 L 700 400"
          fill="none"
          stroke="currentColor"
          strokeWidth="1"
          opacity="0.3"
          initial={{ pathLength: 0, opacity: 0 }}
          animate={{ pathLength: 1, opacity: 0.3 }}
          transition={{ duration: 2.5, ease: "easeInOut", delay: 0.5 }}
        />
        {/* Floating Stars / Nodes */}
        <motion.circle cx="400" cy="100" r="4" fill="currentColor" animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 3, delay: 0 }} />
        <motion.circle cx="700" cy="400" r="4" fill="currentColor" animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 3, delay: 1 }} />
        <motion.circle cx="400" cy="700" r="4" fill="currentColor" animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 3, delay: 2 }} />
        <motion.circle cx="100" cy="400" r="4" fill="currentColor" animate={{ opacity: [0.3, 1, 0.3] }} transition={{ repeat: Infinity, duration: 3, delay: 1.5 }} />
        <motion.circle cx="400" cy="400" r="6" fill="currentColor" animate={{ opacity: [0.5, 1, 0.5] }} transition={{ repeat: Infinity, duration: 4 }} />
      </svg>
      {/* Subtle radial gradient to fade edges */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_20%,var(--night)_70%)]" />
    </div>
  );
}
