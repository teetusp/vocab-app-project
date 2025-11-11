"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import alpahabet from "../../../assets/alphabet.png";
import history from "../../../assets/history.png";
import test from "../../../assets/test.png";
import matching from "../../../assets/matching.png";
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

  const handleClickMatchingGame = () => {
    if (user?.id) {
      router.push(`/matchinggame/${user?.id}`);
      console.log("Go to matching game user:", user?.id);
    } else {
      console.error("ไม่พบ user id");
    }
  };

  return (
    <div className="relative flex flex-col min-h-screen bg-gradient-to-br from-yellow-100 via-pink-100 to-purple-200 overflow-hidden">
      {/*ลาย background*/}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 w-24 h-24 bg-yellow-300 rounded-full opacity-40 animate-bounce"></div>
        <div className="absolute top-32 right-20 w-32 h-32 bg-pink-400 rounded-full opacity-30 animate-pulse"></div>
        <div className="absolute bottom-20 left-1/4 w-20 h-20 bg-blue-300 rounded-full opacity-50 animate-bounce delay-100"></div>
        <div className="absolute top-1/2 right-10 w-28 h-28 bg-purple-300 rounded-full opacity-40 animate-pulse delay-200"></div>
        <div className="absolute bottom-40 right-1/3 w-24 h-24 bg-green-300 rounded-full opacity-30 animate-bounce delay-300"></div>
      </div>

      {/* Navbar */}
      <NavBarUser />

      <div className="relative z-10 flex-grow p-6 md:p-10 max-w-6xl mx-auto w-full mb-10">
        {/* หัวข้อ Dashboard - ปรับให้สนุกและมีสีสันมากขึ้น */}
        <div className="text-center mb-10 mt-15 ">
          <h1 className="text-6xl md:text-7xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 via-purple-500 to-blue-500 tracking-tight drop-shadow-lg mb-4">
            Dashboard
          </h1>
        </div>

        {/* กล่องต้อนรับ - ปรับให้สดใสและมีชีวิตชีวามากขึ้น */}
        <div className="bg-white/90 backdrop-blur-lg border-4 border-yellow-300 shadow-2xl rounded-3xl p-8 text-center transition-all duration-500 hover:shadow-pink-400 hover:scale-105 hover:rotate-1">
          <div className="flex items-center justify-center gap-3 mb-4">
            <span className="text-5xl ">👋</span>
            <h2 className="text-4xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-600">
              สวัสดี, {user?.fullname}!
            </h2>
          </div>
          <p className="text-gray-700 mb-8 text-xl font-medium">
            พร้อมเรียนรู้คำศัพท์ใหม่หรือยัง? เลือกหมวดหมู่ที่คุณสนใจได้เลย 💡
          </p>

          {/* การ์ดเมนู - ปรับให้สีสันสดใสและมีแอนิเมชั่นที่สนุกขึ้น */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
            {/* การ์ดคำศัพท์ทั้งหมด */}
            <Link
              href={`/dashboardvocab/${user?.id}`}
              onClick={handleClickVocab}
            >
              <div className="group h-52 bg-gradient-to-br from-blue-400 via-cyan-400 to-indigo-500 rounded-3xl flex flex-col items-center justify-center text-white font-bold transition-all duration-300 transform hover:-translate-y-3 hover:shadow-2xl hover:shadow-blue-400 hover:rotate-2 relative overflow-hidden border-4 border-white">
                <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <Image
                  src={alpahabet || "/placeholder.svg"}
                  alt="alphabet"
                  className="w-20 h-20 mb-3 drop-shadow-2xl group-hover:scale-110 transition-transform"
                />
                <span className="text-2xl group-hover:scale-110 transition-transform">
                  คำศัพท์ทั้งหมด
                </span>
              </div>
            </Link>

            {/* การ์ดคำศัพท์ที่เรียนแล้ว */}
            <Link
              href={`/userhistory/${user?.id}`}
              onClick={handleClickHistory}
            >
              <div className="group h-52 bg-gradient-to-br from-green-400 via-lime-400 to-emerald-500 rounded-3xl flex flex-col items-center justify-center text-white font-bold transition-all duration-300 transform hover:-translate-y-3 hover:shadow-2xl hover:shadow-green-400 hover:rotate-2 relative overflow-hidden border-4 border-white">
                <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <Image
                  src={history || "/placeholder.svg"}
                  alt="history"
                  className="w-20 h-20 mb-3 drop-shadow-2xl group-hover:scale-110 transition-transform"
                />
                <span className="text-2xl group-hover:scale-110 transition-transform">
                  คำศัพท์ที่เรียนแล้ว
                </span>
              </div>
            </Link>

            {/* การ์ดแบบทดสอบ */}
            <Link href={`/usertest/${user?.id}`} onClick={handleClickTest}>
              <div className="group h-52 bg-gradient-to-br from-pink-400 via-rose-400 to-red-500 rounded-3xl flex flex-col items-center justify-center text-white font-bold transition-all duration-300 transform hover:-translate-y-3 hover:shadow-2xl hover:shadow-pink-400 hover:rotate-2 relative overflow-hidden border-4 border-white">
                <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>

                <Image
                  src={test || "/placeholder.svg"}
                  alt="test"
                  className="w-20 h-20 mb-3 drop-shadow-2xl group-hover:scale-110 transition-transform"
                />
                <span className="text-2xl group-hover:scale-110 transition-transform">
                  แบบทดสอบ
                </span>
              </div>
            </Link>
            <Link href={`/matchinggame/${user?.id}`} onClick={handleClickMatchingGame}>
              <div className="group h-52 bg-gradient-to-br from-blue-400 via-indigo-400 to-purple-500 rounded-3xl flex flex-col items-center justify-center text-white font-bold transition-all duration-300 transform hover:-translate-y-3 hover:shadow-2xl hover:shadow-pink-400 hover:rotate-2 relative overflow-hidden border-4 border-white">
                <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity"></div>

                <Image
                  src={matching || "/placeholder.svg"}
                  alt="test"
                  className="w-20 h-20 mb-3 drop-shadow-2xl group-hover:scale-110 transition-transform"
                />
                <span className="text-2xl group-hover:scale-110 transition-transform">
                  เกมจับคู่
                </span>
              </div>
            </Link>
          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer />

      <style jsx>{`
        .delay-100 {
          animation-delay: 0.1s;
        }
        .delay-200 {
          animation-delay: 0.2s;
        }
        .delay-300 {
          animation-delay: 0.3s;
        }
        @keyframes spin-slow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        .animate-spin-slow {
          animation: spin-slow 3s linear infinite;
        }
      `}</style>
    </div>
  );
}
