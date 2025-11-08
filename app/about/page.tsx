"use client";
import React from "react";
import NavBarHome from "../..//components/NavBarHome";
import Footer from "../../components/Footer";
import { useRouter } from "next/navigation";

export default function page() {
  const router = useRouter();
  return (
    <div>
      <NavBarHome />
      <div className="relative bg-yellow-100/70 pt-12 pb-20 md:pt-24 md:pb-32 overflow-hidden">
          {/* Header */}
          <div className="text-center mb-16">
            <h1 className="text-5xl font-extrabold text-indigo-600 mb-4">
              About Us
            </h1>
            <p className="text-lg text-gray-600">
              เราเชื่อว่าการเรียนคำศัพท์ต้องสนุกและเข้าใจง่าย
            </p>
          </div>

          {/* Mission */}
          <div className="max-w-3xl mx-auto mb-16 text-center">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              Our Mission
            </h2>
            <h3 className="text-gray-600">
              เป้าหมายของเราคือช่วยให้ผู้เรียนทุกคนจำคำศัพท์ได้อย่างรวดเร็ว
              และสนุกสนานผ่านแบบทดสอบและระบบเรียนรู้ที่ทันสมัย
            </h3>
          </div>

          {/* Call to Action */}
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-800 mb-4">
              Ready to Learn?
            </h2>
            <h2 className="text-gray-600 mb-6">
              เริ่มเรียนคำศัพท์กับเราและพัฒนาภาษาอังกฤษของคุณวันนี้
            </h2>
            <button onClick={() => router.push("/login")}
            className="px-8 py-3 bg-indigo-600 text-white font-bold rounded-full shadow hover:bg-indigo-700 transition">
              เริ่มเรียนเลย
            </button>
          </div>
        </div>
        <Footer />
      </div>
  );
}
