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
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">
      {/* Navbar */}
      <NavBarUser />

      {/* ขยายเต็มพื้นที่ว่างใน flex container โดยใช้ flex-grow */}
      <div className="flex-grow p-6 md:p-10 max-w-6xl mx-auto w-full ">
        {/* หัวข้อ Dashboard */}
        <h1 className="text-5xl font-extrabold text-center mb-10 text-gray-800 tracking-tight drop-shadow-sm">
          Dashboard
        </h1>

        {/* กล่องต้อนรับ */}
        <div className="bg-white/80 backdrop-blur-md border border-white/40 shadow-2xl rounded-3xl p-8 text-center transition-all duration-500 hover:shadow-pink-200">
          <h2 className="text-3xl font-semibold text-indigo-600 mb-3">
            👋 Welcome, {user?.fullname}!
          </h2>
          <p className="text-gray-600 mb-8 text-lg">
            พร้อมเรียนรู้คำศัพท์ใหม่หรือยัง? เลือกหมวดหมู่ที่คุณสนใจได้เลย 💡
          </p>

          {/* การ์ดเมนู */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            <Link
              href={`/dashboardvocab/${user?.id}`}
              onClick={handleClickVocab}
            >
              <div className="group h-44 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-2xl flex flex-col items-center justify-center text-white font-bold transition-transform transform hover:-translate-y-2 hover:shadow-2xl hover:shadow-indigo-300 relative overflow-hidden">
                <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <Image
                  src={alpahabet}
                  alt="alphabet"
                  className="w-14 h-14 mb-3 drop-shadow-md"
                />
                <span className="text-lg">คำศัพท์ทั้งหมด</span>
              </div>
            </Link>

            <Link
              href={`/userhistory/${user?.id}`}
              onClick={handleClickHistory}
            >
              <div className="group h-44 bg-gradient-to-br from-green-400 to-emerald-500 rounded-2xl flex flex-col items-center justify-center text-white font-bold transition-transform transform hover:-translate-y-2 hover:shadow-2xl hover:shadow-green-300 relative overflow-hidden">
                <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <Image
                  src={history}
                  alt="history"
                  className="w-14 h-14 mb-3 drop-shadow-md"
                />
                <span className="text-lg">คำศัพท์ที่เรียนแล้ว</span>
              </div>
            </Link>

            <Link href={`/usertest/${user?.id}`} onClick={handleClickTest}>
              <div className="group h-44 bg-gradient-to-br from-pink-400 to-red-500 rounded-2xl flex flex-col items-center justify-center text-white font-bold transition-transform transform hover:-translate-y-2 hover:shadow-2xl hover:shadow-pink-300 relative overflow-hidden">
                <div className="absolute inset-0 bg-white/10 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <Image
                  src={test}
                  alt="test"
                  className="w-14 h-14 mb-3 drop-shadow-md"
                />
                <span className="text-lg">แบบทดสอบ</span>
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}
