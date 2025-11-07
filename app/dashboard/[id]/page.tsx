"use client";
import React from "react";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import rocket from "../../../assets/rocket.png";
import Link from "next/link";
import { IoIosArrowDropdown } from "react-icons/io";
import { FaEdit } from "react-icons/fa";
import { CiLogout } from "react-icons/ci";
import alpahabet from "../../../assets/alphabet.png";
import history from "../../../assets/history.png";
import test from "../../../assets/test.png";
import Footer from "../../../components/Footer";
import { supabase } from "@/lib/supabaseClient";
type User = {
  id: string;
  fullname: string;
  user_image_url: string;
};

export default function page() {
  const router = useRouter();

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);

  // ดึงข้อมูลผู้ใช้เแบบ 1-1 จากหน้า login + supabase
  useEffect(() => {
    async function fetchUser() {
      try {
        const userId = localStorage.getItem("id");
        if (!userId) {
          console.error("ไม่พบ userId ใน localStorage");
          return;
        }

        // 🔹 ดึงข้อมูลผู้ใช้จากตาราง user_tb
        const { data, error } = await supabase
          .from("user_tb")
          .select("id, fullname, user_image_url")
          .eq("id", userId)
          .single();

        if (error) {
          console.error("เกิดข้อผิดพลาดในการดึงข้อมูลผู้ใช้:", error.message);
          return;
        }

        if (data) {
          setUser(data);
        }
      } catch (ex) {
        console.error("เกิดข้อผิดพลาดในการเชื่อมต่อ Supabase:", ex);
      }
    }

    fetchUser();
  }, []);

  // ฟังก์ชันออกจากระบบ
  async function handleClickSignOut() {
    console.log("ออกกำลังออกจากระบบ...");
    localStorage.removeItem("id");
    console.log("localStorage ลบเรียบร้อย");
    //redirect to home page
    router.push("/");
  }

  const handleClickEditProfile = () => {
    if (user?.id) {
      router.push(`/edituser/${user?.id}`);
      console.log("Go to edit user:", user?.id);
    } else {
      console.error("ไม่พบ user id");
    }
  };

  return (
    <div>
      <div className="min-h-screen bg-pink-100">
        {/* ส่วน NavBar */}
        <div className="sticky bg-blue-200/90 backdrop-blur-sm shadow-md">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-20">
              {/* โลโก้/ชื่อแอป */}
              <div
                onClick={() => window.location.reload()}
                className="flex items-center space-x-2 cursor-pointer"
              >
                <Image src={rocket} alt="Logo" className="w-10 h-10 mr-2" />
                <h1 className="text-2xl font-black text-indigo-600 tracking-wide">
                  <span className="text-yellow-500">Card</span>{" "}
                  <span className="text-red-500">Vocab</span>
                </h1>
              </div>

              <div className="relative ">
                <button
                  onClick={() => setIsProfileOpen(!isProfileOpen)}
                  className="flex items-center space-x-2 rounded-full p-1 pr-3 bg-gray-100 hover:bg-gray-200 transition cursor-pointer"
                >
                  {/* รูปภาพโปรไฟล์ (Placeholder) */}
                  <img
                    className="w-8 h-8 rounded-full object-cover "
                    src={user?.user_image_url}
                    width={32}
                    height={32}
                    alt="User profile"
                  />
                  <span className="hidden md:inline font-medium text-gray-700">
                    {user?.fullname}
                  </span>
                  <IoIosArrowDropdown
                    className={`w-5 h-5 text-gray-500 transition-transform ${
                      isProfileOpen ? "rotate-180" : ""
                    }`}
                  />
                </button>

                {/* Dropdown Menu */}
                {isProfileOpen && (
                  <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl overflow-hidden border">
                    <button
                      type="button"
                      onClick={handleClickEditProfile}
                      className="w-full flex items-center px-4 py-3 text-gray-700 hover:bg-indigo-100 cursor-pointer"
                    >
                      <FaEdit className="w-5 h-5 mr-3 text-blue-500" />
                      Edit Profile
                    </button>

                    <button
                      onClick={handleClickSignOut}
                      type="button"
                      className="w-full flex items-center px-4 py-3 text-gray-700 hover:bg-red-200 cursor-pointer"
                    >
                      <CiLogout className="w-5 h-5 mr-3 text-red-500" />
                      Sign Out
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
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
              <Link href="/showvocab">
                <div className="h-40 bg-blue-100 rounded-xl flex flex-col items-center justify-center text-blue-800 font-bold transition transform hover:scale-105 hover:shadow-lg">
                  <Image
                    src={alpahabet}
                    alt="alphabet"
                    className="w-12 h-12 text-blue-600 mb-2"
                  />
                  <span className="text-lg">คำศัพท์ทั้งหมด</span>
                </div>
              </Link>

              <Link href="/history">
                <div className="h-40 bg-green-100 rounded-xl flex flex-col items-center justify-center text-green-800 font-bold transition transform hover:scale-105 hover:shadow-lg">
                  <Image
                    src={history}
                    alt="history"
                    className="w-12 h-12 text-green-600 mb-2"
                  />
                  <span className="text-lg">คำศัพท์ที่เรียนแล้ว</span>
                </div>
              </Link>

              <Link href="/test">
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
