import React from "react";
import Link from "next/link";
import Image from "next/image";
import design from "../assets/design.png";
import card from "../assets/card.png";
import follow from "../assets/follow.png";
import Footer from "../components/Footer";
import NavBar from "../components/NavBar";

export default function page() {
  return (
    <div>
      <NavBar />
      <div>
        {/* เนื้อหาของหน้าเพจ  */}
        <div className="relative bg-yellow-100/70 pt-12 pb-20 md:pt-24 md:pb-32 overflow-hidden">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h1 className="text-5xl md:text-6xl lg:text-7xl font-extrabold text-center py-4 inline-block transition duration-300 hover:scale-110">
              {Array.from("เรียนรู้คำศัพท์ ด้วย Flashcard แสนสนุก!").map(
                (char, i) => {
                  const colors = [
                    "text-yellow-500",
                    "text-orange-500",
                    "text-red-500",
                    "text-indigo-500",
                  ];
                  const colorClass = colors[i % colors.length];
                  return (
                    <span key={i} className={colorClass}>
                      {char}
                    </span>
                  );
                }
              )}
            </h1>

            <h3 className="mt-4 max-w-2xl mx-auto text-xl text-gray-700 font-medium">
              แอปพลิเคชันที่ออกแบบมาสำหรับเด็กโดยเฉพาะ
              เปลี่ยนการท่องจำให้เป็นการเล่นเกมผ่าน Flashcard แบบโต้ตอบ!
            </h3>

            <div className="mt-10 flex flex-col sm:flex-row justify-center space-y-4 sm:space-y-0 sm:space-x-4">
              <Link href="/login">
                <button className="px-8 py-3 text-lg font-bold rounded-full shadow-xl text-white bg-indigo-500 hover:bg-indigo-600 transition duration-300 transform hover:scale-105 ring-4 ring-indigo-300">
                  เช้าสู่ระบบเพื่อเริ่มต้น
                </button>
              </Link>
            </div>
          </div>
        </div>

        {/* เนื้อหาของหน้าเพจสําหรับคุณสมบัติ  */}
        <div
          className="py-20 bg-pink-50/70 border-t-4 border-pink-200"
        >
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <h2 className="text-4xl font-extrabold text-center text-red-600 drop-shadow-md mb-12">
              ทำไมถึงต้องใช้ Card Vocab?
            </h2>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
              {/* Feature 1: Interactive Flashcard Learning */}
              <div className="bg-indigo-300 p-8 rounded-3xl shadow-xl hover:shadow-2xl transition duration-300 border-b-8 border-indigo-600">
                <div className="flex items-center justify-center mb-4">
                  <Image
                    src={card}
                    alt="card"
                    className="w-15 h-15 "
                  />
                </div>
                <h2 className="text-2xl font-bold text-center text-indigo-600 mb-3">
                  1. Flashcard แบบโต้ตอบ
                </h2>
                <h3 className="text-gray-600 text-center">
                  การ์ดคำศัพท์ที่มีภาพ เสียง ให้เด็กๆ
                  ได้พลิกและโต้ตอบ ทำให้จดจำง่ายขึ้น
                </h3>
              </div>

              {/* Feature 2: Child-Friendly Design */}
              <div className="bg-orange-300 p-8 rounded-3xl shadow-xl hover:shadow-2xl transition duration-300 border-b-8 border-yellow-600">
                <div className="flex items-center justify-center mb-4">
                  <Image
                    src={design}
                    alt="design"
                    className="w-15 h-15 "
                  />
                </div>
                <h2 className="text-2xl font-bold text-center text-yellow-600 mb-3">
                  2. ดีไซน์สดใสสำหรับเด็ก
                </h2>
                <h3 className="text-gray-600 text-center">
                  ใช้สีสันสดใส ตัวอักษรใหญ่ และเกมสั้นๆ
                  ที่เหมาะสมกับพัฒนาการของเด็กเล็กและเด็กประถม
                </h3>
              </div>

              {/* Feature 3: Quick Login */}
              <div className="bg-green-300 p-8 rounded-3xl shadow-xl hover:shadow-2xl transition duration-300 border-b-8 border-green-600">
                <div className="flex items-center justify-center mb-4">
                  <Image
                    src={follow}
                    alt="follow"
                    className="w-15 h-15"
                  />
                </div>
                <h2 className="text-2xl font-bold text-center text-green-600 mb-3">
                  3. ติดตามความก้าวหน้า
                </h2>
                <h3 className="text-gray-600 text-center">
                  ระบบเข้าสู่ระบบช่วยให้ผู้ปกครองและเด็กๆ
                  สามารถติดตามจำนวนคำศัพท์ที่เรียนรู้และความก้าวหน้าได้
                </h3>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
