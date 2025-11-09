"use client";
import React from "react";
import NavBarHome from "../..//components/NavBarHome";
import Footer from "../../components/Footer";
import { useRouter } from "next/navigation";

export default function page() {
  const router = useRouter();
  return (
    <div className="flex flex-col min-h-screen bg-pink-100">
      <NavBarHome />

      {/* เนื้อหาหลัก */}
      <div className="flex-1 px-6 sm:px-10 lg:px-20 py-24">
        {/* Header */}
        <div className="text-center mb-20">
          <h1 className="text-5xl font-extrabold text-indigo-600 mb-4 drop-shadow-sm">
            About Us
          </h1>
          <p className="text-lg text-gray-600 max-w-2xl mx-auto leading-relaxed">
            เราเชื่อว่าการเรียนคำศัพท์ต้องสนุก เข้าใจง่าย
            และเหมาะกับทุกเพศทุกวัย
          </p>
        </div>

        {/* Mission */}
        <div className="max-w-3xl mx-auto mb-24 text-center bg-white rounded-3xl shadow-xl p-10 border border-indigo-100">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Our Mission</h2>
          <p className="text-gray-600 leading-relaxed text-lg">
            เป้าหมายของเราคือช่วยให้ผู้เรียนทุกคนจดจำคำศัพท์ได้อย่างรวดเร็ว
            และสนุกสนานผ่านแบบทดสอบและระบบเรียนรู้ที่ทันสมัย
          </p>
        </div>

        {/* Call to Action */}
        <div className="text-center mt-10">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">
            Ready to Learn?
          </h2>
          <p className="text-gray-600 mb-8">
            เริ่มต้นพัฒนาภาษาอังกฤษของคุณวันนี้กับเรา
          </p>
          <button
            onClick={() => router.push("/login")}
            className="px-10 py-4 bg-indigo-600 text-white font-bold rounded-full shadow-lg 
                   hover:bg-indigo-700 transition-transform duration-200 hover:scale-105"
          >
            เริ่มเรียนเลย 🚀
          </button>
        </div>
      </div>

      <Footer />
    </div>
  );
}
