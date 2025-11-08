"use client";
import React from "react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import alpahabet from "../../../assets/alphabet.png";
import history from "../../../assets/history.png";
import test from "../../../assets/test.png";
import Footer from "../../../components/Footer";
import { supabase } from "@/lib/supabaseClient";
import NavBarUser from "../../../components/NavBarUser";
type User = {
  id: string;
  fullname: string;
  user_image_url: string;
};

export default function page() {
  const router = useRouter();

  const [user, setUser] = useState<User | null>(null);

  // ดึงข้อมูลผู้ใช้เแบบ 1-1 จากหน้า login + supabase
  useEffect(() => {
    async function fetchUser() {
      try {
        const userId = localStorage.getItem("user_id");
        if (!userId) {
          console.error("ไม่พบ userId ใน localStorage");
          return;
        }

        // 🔹 ดึงข้อมูลผู้ใช้จากตาราง user_tb
        const { data, error } = await supabase
          .from("user_tb")
          .select("user_id, fullname, user_image_url")
          .eq("user_id", userId)
          .single();

        if (error) {
          console.error("เกิดข้อผิดพลาดในการดึงข้อมูลผู้ใช้:", error.message);
          return;
        }

        setUser({
          id: data.user_id,
          fullname: data.fullname,
          user_image_url: data.user_image_url,
        });
      } catch (ex) {
        console.error("เกิดข้อผิดพลาดในการเชื่อมต่อ Supabase:", ex);
      }
    }

    fetchUser();
  }, []);

  const handleClickVocab = () => {
    if (user?.id) {
      router.push(`/dashboardvocab/${user?.id}`);
      console.log("Go to showvocab user:", user?.id);
    } else {
      console.error("ไม่พบ user id");
    }
  };
   const handleClickHistory = () => {
    if (user?.id) {
      router.push(`/history/${user?.id}`);
      console.log("Go to history user:", user?.id);
    } else {
      console.error("ไม่พบ user id");
    }
  };

  const handleClickTest = () => {
    if (user?.id) {
      router.push(`/test/${user?.id}`);
      console.log("Go to test user:", user?.id);
    } else {
      console.error("ไม่พบ user id");
    }
  };

  return (
    <div>
      <div className="min-h-screen bg-pink-100">
        <NavBarUser />
        {/* ส่วนของ Dashboard */}
        <div className="p-6 md:p-10">
          {/* 1. ตกแต่งหัวข้อ "Dashboard" ให้มีสีสันไล่ระดับ */}
          <h1 className="text-4xl font-bold mb-6 bg-gradient-to-r from-blue-500 via-green-500 to-yellow-500 bg-clip-text text-transparent drop-shadow-lg">
            Dashboard
          </h1>
          {/* 2. ตกแต่งการ์ดต้อนรับให้กึ่งโปร่งใส และเปลี่ยนสีข้อความต้อนรับ */}
          <div className="bg-white/95 backdrop-blur-sm p-6 rounded-2xl shadow-2xl border-2 border-pink-200">
            <h2 className="text-2xl font-bold text-indigo-600 mb-4">
              Welcome, {user?.fullname}!
            </h2>
            <h3 className="text-gray-600">
              นี่คือพื้นที่ Dashboard ของคุณ เริ่มเรียนรู้คำศัพท์ใหม่ได้เลย!
            </h3>

            {/* Placeholder สำหรับเนื้อหา Dashboard (อัปเดตแล้ว) */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Link href={`/dashboardvocab/${user?.id}`} onClick={handleClickVocab}>
                <div className="h-40 bg-blue-100 rounded-xl flex flex-col items-center justify-center text-blue-800 font-bold transition transform hover:scale-105 hover:shadow-lg">
                  <Image
                    src={alpahabet}
                    alt="alphabet"
                    className="w-12 h-12 text-blue-600 mb-2"
                  />
                  <span className="text-lg">คำศัพท์ทั้งหมด</span>
                </div>
              </Link>

              <Link href={`/userhistory/${user?.id}`} onClick={handleClickHistory}>
                <div className="h-40 bg-green-100 rounded-xl flex flex-col items-center justify-center text-green-800 font-bold transition transform hover:scale-105 hover:shadow-lg">
                  <Image
                    src={history}
                    alt="history"
                    className="w-12 h-12 text-green-600 mb-2"
                  />
                  <span className="text-lg">คำศัพท์ที่เรียนแล้ว</span>
                </div>
              </Link>

              <Link href={`/usertest/${user?.id}`} onClick={handleClickTest}>
                <div className="h-40 bg-red-100 rounded-xl flex flex-col items-center justify-center text-red-800 font-bold transition transform hover:scale-105 hover:shadow-lg">
                  <Image
                    src={test}
                    alt="test"
                    className="w-12 h-12 text-red-600 mb-2"
                  />
                  <span className="text-lg">แบบทดสอบ</span>
                </div>
              </Link>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
