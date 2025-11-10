"use client";
import Image from "next/image";
import design from "../assets/design.png";
import card from "../assets/card.png";
import follow from "../assets/follow.png";
import Footer from "../components/Footer";
import NavBar from "../components/NavBarHome";
import Link from "next/link";

export default function Page() {
  return (
    <div className="relative overflow-hidden">
      {/* Fun floating shapes decoration */}
      <div className="fixed inset-0 pointer-events-none z-0 opacity-30">
        <div
          className="absolute top-20 left-10 w-16 h-16 bg-yellow-400 rounded-full animate-bounce"
          style={{ animationDelay: "0s", animationDuration: "3s" }}
        />
        <div
          className="absolute top-40 right-20 w-12 h-12 bg-pink-400 rounded-full animate-bounce"
          style={{ animationDelay: "0.5s", animationDuration: "2.5s" }}
        />
        <div
          className="absolute bottom-40 left-1/4 w-20 h-20 bg-blue-400 rounded-full animate-bounce"
          style={{ animationDelay: "1s", animationDuration: "3.5s" }}
        />
        <div
          className="absolute top-1/3 right-1/4 w-14 h-14 bg-green-400 rounded-full animate-bounce"
          style={{ animationDelay: "1.5s", animationDuration: "2.8s" }}
        />
        <div
          className="absolute bottom-20 right-10 w-16 h-16 bg-purple-400 rounded-full animate-bounce"
          style={{ animationDelay: "0.8s", animationDuration: "3.2s" }}
        />
      </div>

      {/* Navigation bar */}
      <NavBar />

      <div className="relative z-10">
        {/* Hero Section */}
        <div className="relative bg-gradient-to-br from-yellow-200 via-pink-200 to-purple-200 pt-20 pb-32 md:pt-32 md:pb-40 overflow-hidden">
          {/* Decorative stars */}
          <div className="absolute inset-0 overflow-hidden pointer-events-none">
            {[...Array(15)].map((_, i) => (
              <div
                key={i}
                className="absolute text-yellow-400 animate-pulse"
                style={{
                  left: `${Math.random() * 100}%`,
                  top: `${Math.random() * 100}%`,
                  fontSize: `${Math.random() * 20 + 15}px`,
                  animationDelay: `${Math.random() * 2}s`,
                }}
              >
                ★
              </div>
            ))}
          </div>

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
            {/* Cute emoji decoration */}
            <div className="text-6xl mb-4 animate-bounce">🎉</div>

            {/* Main title with colorful letters */}
            <h1 className="text-5xl md:text-6xl lg:text-6xl font-black py-4 inline-block">
              {Array.from("เรียนรู้คำศัพท์ ด้วย Flashcard แสนสนุก!").map(
                (char, i) => {
                  const colors = [
                    "text-red-600",
                    "text-orange-500",
                    "text-yellow-600",
                    "text-green-500",
                    "text-blue-600",
                    "text-indigo-600",
                    "text-purple-600",
                  ];
                  const colorClass = colors[i % colors.length];
                  return (
                    <span
                      key={i}
                      className={`${colorClass} drop-shadow-lg inline-block hover:scale-125 transition-transform duration-200`}
                      style={{
                        animation: `bounce 0.6s ease-in-out infinite`,
                        animationDelay: `${i * 0.05}s`,
                      }}
                    >
                      {char}
                    </span>
                  );
                }
              )}
            </h1>

            {/* Subtitle with fun styling */}
            <div className="mt-8 max-w-3xl mx-auto">
              <div className="bg-white/90 backdrop-blur-sm rounded-3xl p-6 shadow-2xl border-4 border-dashed border-pink-400 transform hover:rotate-1 transition-transform duration-300">
                <h3 className="text-xl md:text-2xl text-gray-800 font-bold leading-relaxed">
                  🌈 แอปสำหรับเด็กโดยเฉพาะ
                  <br />
                  เปลี่ยนการท่องจำให้เป็นการเล่นเกม
                  <br />
                  ผ่าน Flashcard แบบโต้ตอบ! 🎮
                </h3>
              </div>
            </div>

            {/* CTA Button with extra fun */}
            <div className="mt-14 flex flex-col sm:flex-row justify-center gap-4">
              <Link href="/login">
                <button className="relative px-12 py-5 text-xl font-black rounded-full shadow-2xl text-white bg-gradient-to-r from-pink-500 via-purple-500 to-indigo-500 hover:from-indigo-500 hover:via-purple-500 hover:to-pink-500 transition-all duration-300 transform hover:scale-110 ring-8 ring-purple-300/60 hover:ring-pink-400/60 animate-pulse">
                  <span className="relative z-10">🚀 เริ่มเลย!</span>
                  <div className="absolute inset-0 rounded-full bg-white/20 blur-xl animate-ping" />
                </button>
              </Link>
            </div>

            {/* Fun characters/decorations */}
            <div className="mt-8 flex justify-center gap-4 text-6xl">
              <span className="animate-bounce" style={{ animationDelay: "0s" }}>
                📚
              </span>
              <span
                className="animate-bounce"
                style={{ animationDelay: "0.2s" }}
              >
                ✨
              </span>
              <span
                className="animate-bounce"
                style={{ animationDelay: "0.4s" }}
              >
                🎨
              </span>
            </div>
          </div>
        </div>

        {/* Features Section */}
        <div className="py-28 bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 border-t-8 border-rainbow relative">
          {/* Rainbow border effect */}
          <div className="absolute top-0 left-0 right-0 h-2 bg-gradient-to-r from-red-500 via-yellow-500 via-green-500 via-blue-500 to-purple-500" />

          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            {/* Section title */}
            <div className="text-center mb-20">
              <div className="inline-block bg-gradient-to-r from-yellow-400 to-orange-400 rounded-full px-8 py-3 mb-4 transform -rotate-2 shadow-xl">
                <h2 className="text-5xl font-black text-white drop-shadow-lg">
                  ✨ ทำไมต้อง Card Vocab? ✨
                </h2>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
              {/* Feature 1 */}
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-blue-400 to-indigo-500 rounded-3xl blur opacity-75 group-hover:opacity-100 transition duration-300" />
                <div className="relative bg-white p-10 rounded-3xl shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:-translate-y-3 border-8 border-blue-300 hover:border-indigo-400">
                  <div className="flex items-center justify-center mb-6 transform group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300">
                    <div className="bg-gradient-to-br from-blue-200 to-indigo-300 rounded-full p-6">
                      <Image
                        src={card || "/placeholder.svg"}
                        alt="card"
                        className="w-20 h-20"
                      />
                    </div>
                  </div>
                  <div className="bg-blue-100 rounded-2xl p-2 mb-4">
                    <h2 className="text-3xl font-black text-center text-blue-600">
                      🎴 Flashcard โต้ตอบ
                    </h2>
                  </div>
                  <h3 className="text-gray-700 text-center text-lg font-semibold leading-relaxed">
                    การ์ดคำศัพท์มีภาพและเสียง 🔊
                    <br />
                    ให้เด็กๆ พลิกและโต้ตอบได้
                    <br />
                    จดจำง่ายขึ้น! 🧠
                  </h3>
                </div>
              </div>

              {/* Feature 2 */}
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-orange-400 to-yellow-500 rounded-3xl blur opacity-75 group-hover:opacity-100 transition duration-300" />
                <div className="relative bg-white p-10 rounded-3xl shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:-translate-y-3 border-8 border-orange-300 hover:border-yellow-400">
                  <div className="flex items-center justify-center mb-6 transform group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300">
                    <div className="bg-gradient-to-br from-orange-200 to-yellow-300 rounded-full p-6">
                      <Image
                        src={design || "/placeholder.svg"}
                        alt="design"
                        className="w-20 h-20"
                      />
                    </div>
                  </div>
                  <div className="bg-yellow-100 rounded-2xl p-2 mb-4">
                    <h2 className="text-3xl font-black text-center text-orange-600">
                      🎨 ดีไซน์สดใส
                    </h2>
                  </div>
                  <h3 className="text-gray-700 text-center text-lg font-semibold leading-relaxed">
                    ใช้สีสันสดใส 🌈
                    <br />
                    ตัวอักษรใหญ่และเกมสั้นๆ
                    <br />
                    เหมาะกับเด็กทุกวัย! 👶
                  </h3>
                </div>
              </div>

              {/* Feature 3 */}
              <div className="relative group">
                <div className="absolute -inset-1 bg-gradient-to-r from-green-400 to-teal-500 rounded-3xl blur opacity-75 group-hover:opacity-100 transition duration-300" />
                <div className="relative bg-white p-10 rounded-3xl shadow-2xl hover:shadow-3xl transition-all duration-300 transform hover:-translate-y-3 border-8 border-green-300 hover:border-teal-400">
                  <div className="flex items-center justify-center mb-6 transform group-hover:scale-110 group-hover:rotate-6 transition-transform duration-300">
                    <div className="bg-gradient-to-br from-green-200 to-teal-300 rounded-full p-6">
                      <Image
                        src={follow || "/placeholder.svg"}
                        alt="follow"
                        className="w-20 h-20"
                      />
                    </div>
                  </div>
                  <div className="bg-green-100 rounded-2xl p-2 mb-4">
                    <h2 className="text-3xl font-black text-center text-green-600">
                      📊 ติดตามความก้าวหน้า
                    </h2>
                  </div>
                  <h3 className="text-gray-700 text-center text-lg font-semibold leading-relaxed">
                    ระบบช่วยให้ผู้ปกครอง 👨‍👩‍👧
                    <br />
                    และเด็กๆ ติดตามผล
                    <br />
                    ได้ง่ายและสนุก! 🏆
                  </h3>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer />

      <style jsx>{`
        @keyframes bounce {
          0%,
          100% {
            transform: translateY(0);
          }
          50% {
            transform: translateY(-10px);
          }
        }
      `}</style>
    </div>
  );
}
