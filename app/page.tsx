import React from "react";
import Link from "next/link";
import Image from "next/image";
import design from "../assets/design.png";
import card from "../assets/card.png";
import follow from "../assets/follow.png";
import Footer from "../components/Footer";
import NavBar from "../components/NavBarHome";

export default function page() {
  return (
    <div >
      {/* Navigation bar */}
      <NavBar />

      <div>
        {/* Hero Section */}
        <div className="relative bg-yellow-200/80 pt-16 pb-28 md:pt-28 md:pb-36 overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            {/* Main title with colorful letters */}
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold py-4 inline-block transition-transform duration-300 hover:scale-110">
              {Array.from("เรียนรู้คำศัพท์ ด้วย Flashcard แสนสนุก!").map(
                (char, i) => {
                  const colors = [
                    "text-red-600",
                    "text-orange-600",
                    "text-yellow-600",
                    "text-green-600",
                    "text-indigo-600",
                    "text-teal-600",
                    "text-purple-600",
                  ];
                  const colorClass = colors[i % colors.length];
                  return (
                    <span key={i} className={`${colorClass} drop-shadow-md`}>
                      {char}
                    </span>
                  );
                }
              )}
            </h1>

            {/* Subtitle */}
            <h3 className="mt-6 max-w-2xl mx-auto text-xl md:text-2xl text-gray-700 font-medium">
              แอปสำหรับเด็กโดยเฉพาะ เปลี่ยนการท่องจำให้เป็นการเล่นเกมผ่าน
              Flashcard แบบโต้ตอบ!
            </h3>

            {/* CTA Button */}
            <div className="mt-12 flex flex-col sm:flex-row justify-center gap-4">
              <Link href="/login">
                <button className="px-10 py-4 text-lg font-bold rounded-full shadow-2xl text-white bg-gradient-to-r from-indigo-500 to-purple-500 hover:from-purple-500 hover:to-indigo-500 transition-transform duration-300 transform hover:scale-105 ring-4 ring-indigo-300/50">
                  เข้าสู่ระบบเพื่อเริ่มต้น
                </button>
              </Link>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="py-24 bg-pink-50/90 border-t-4 border-pink-300">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-4xl font-extrabold text-center text-red-600 drop-shadow-lg mb-16">
              ทำไมถึงต้องใช้ Card Vocab?
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              {/* Feature 1 */}
              <div className="bg-gradient-to-br from-indigo-300 to-indigo-400 p-8 rounded-3xl shadow-2xl hover:shadow-3xl transition-transform duration-300 transform hover:-translate-y-2 border-b-8 border-indigo-600">
                <div className="flex items-center justify-center mb-4">
                  <Image src={card} alt="card" className="w-20 h-20" />
                </div>
                <h2 className="text-2xl font-bold text-center text-indigo-600 mb-3">
                  1. Flashcard แบบโต้ตอบ
                </h2>
                <h3 className="text-gray-700 text-center">
                  การ์ดคำศัพท์มีภาพและเสียง ให้เด็กๆ ได้พลิกและโต้ตอบ
                  ทำให้จดจำง่ายขึ้น
                </h3>
              </div>

              {/* Feature 2 */}
              <div className="bg-gradient-to-br from-orange-300 to-yellow-300 p-8 rounded-3xl shadow-2xl hover:shadow-3xl transition-transform duration-300 transform hover:-translate-y-2 border-b-8 border-yellow-500">
                <div className="flex items-center justify-center mb-4">
                  <Image src={design} alt="design" className="w-20 h-20" />
                </div>
                <h2 className="text-2xl font-bold text-center text-yellow-600 mb-3">
                  2. ดีไซน์สดใสสำหรับเด็ก
                </h2>
                <h3 className="text-gray-700 text-center">
                  ใช้สีสันสดใส ตัวอักษรใหญ่ และเกมสั้นๆ เหมาะกับเด็กเล็กและประถม
                </h3>
              </div>

              {/* Feature 3 */}
              <div className="bg-gradient-to-br from-green-300 to-green-400 p-8 rounded-3xl shadow-2xl hover:shadow-3xl transition-transform duration-300 transform hover:-translate-y-2 border-b-8 border-green-600">
                <div className="flex items-center justify-center mb-4">
                  <Image src={follow} alt="follow" className="w-20 h-20" />
                </div>
                <h2 className="text-2xl font-bold text-center text-green-600 mb-3">
                  3. ติดตามความก้าวหน้า
                </h2>
                <h3 className="text-gray-700 text-center">
                  ระบบช่วยให้ผู้ปกครองและเด็กๆ
                  ติดตามจำนวนคำศัพท์และความก้าวหน้าได้ง่าย
                </h3>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}
