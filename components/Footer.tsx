"use client";
import React from "react";

export default function Footer() {
  return (
    <div className="bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 text-white mt-auto">
      <div className="max-w-6xl mx-auto px-6 py-8 flex flex-col items-center space-y-3">
        {/* เส้นขีดโปร่งใส */}
        <div className="w-24 h-1 bg-white/30 rounded-full mb-2"></div>

        {/* ข้อความหลัก */}
        <h3 className="text-lg font-semibold tracking-wide">
          🚀 Created with by <span className="text-yellow-300">SAU</span>
        </h3>

        {/* ข้อความล่าง */}
        <h3 className="text-sm text-white/70">
          © {new Date().getFullYear()} All rights reserved.
        </h3>

        {/* เอฟเฟกต์แสง */}
        <div className="absolute inset-x-0 bottom-0 h-[2px] bg-gradient-to-r from-transparent via-white/40 to-transparent blur-sm"></div>
      </div>
    </div>
  );
}
