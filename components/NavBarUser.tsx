"use client";
import react from "react";
import Image from "next/image";
import Link from "next/link";
import rocket from "../assets/rocket.png";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { IoIosArrowDropdown } from "react-icons/io";
import { FaEdit } from "react-icons/fa";
import { CiLogout } from "react-icons/ci";
import { CgProfile } from "react-icons/cg";
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
        const userId = localStorage.getItem("user_id");
        if (!userId) {
          console.error("ไม่พบ userId ใน localStorage");
          return;
        }

        // ดึงข้อมูลผู้ใช้จากตาราง user_tb
        const { data, error } = await supabase
          .from("user_tb")
          .select("user_id, fullname, user_image_url")
          .eq("user_id", userId)
          .single();

        if (error) {
          console.error("เกิดข้อผิดพลาดในการดึงข้อมูลผู้ใช้:", error.message);
          return;
        }

        if (data) {
          setUser({
            id: data.user_id,
            fullname: data.fullname,
            user_image_url: data.user_image_url,
          });
        }
      } catch (ex) {
        console.error("เกิดข้อผิดพลาดในการเชื่อมต่อ Supabase:", ex);
      }
    }

    fetchUser();
  }, []);

  async function handleClickSignOut() {
    console.log("ออกกำลังออกจากระบบ...");
    localStorage.removeItem("user_id");
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

  const handleClickViewProfile = () => {
    if (user?.id) {
      router.push(`/userprofile/${user?.id}`);
      console.log("Go to view profile user:", user?.id);
    } else {
      console.error("ไม่พบ user id");
    }
  };

  return (
    <div className="sticky top-0 z-50 bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-500 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* โลโก้ */}
          <div
            onClick={() => window.location.reload()}
            className="flex items-center space-x-2 cursor-pointer transform transition-transform hover:scale-105"
          >
            <Image
              src={rocket}
              alt="Logo"
              className="w-10 h-10 drop-shadow-md"
            />
            <h1 className="text-2xl font-black text-indigo-600 tracking-wide">
              <span className="text-yellow-300">Card</span>{" "}
              <span className="text-red-600">Vocab</span>
            </h1>
          </div>

          {/* เมนูหลัก */}
          <div className="hidden md:flex space-x-8">
            <Link
              href={`/dashboard/${user?.id}`}
              className="text-lg font-semibold text-white hover:text-yellow-300 transition-colors duration-200"
            >
              Dashboard
            </Link>
            <Link
              href={`/dashboardvocab/${user?.id}`}
              className="text-lg font-semibold text-white hover:text-yellow-300 transition-colors duration-200"
            >
              Vocabular
            </Link>
            <Link
              href={`/userhistory/${user?.id}`}
              className="text-lg font-semibold text-white hover:text-yellow-300 transition-colors duration-200"
            >
              History
            </Link>
            <Link
              href={`/usertest/${user?.id}`}
              className="text-lg font-semibold text-white hover:text-yellow-300 transition-colors duration-200"
            >
              Quiz
            </Link>
          </div>

          {/* โปรไฟล์ */}
          <div className="relative">
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center space-x-2 rounded-full bg-white/20 hover:bg-white/30 transition-all duration-200 shadow-md pr-3 pl-1 py-1 border border-white/30"
            >
              <img
                className="w-9 h-9 rounded-full object-cover border-2 border-white shadow"
                src={user?.user_image_url}
                alt="User profile"
              />
              <span className="hidden md:inline font-semibold text-white drop-shadow">
                {user?.fullname}
              </span>
              <IoIosArrowDropdown
                className={`w-5 h-5 text-white transition-transform ${
                  isProfileOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {/* เมนูโปรไฟล์ */}
            {isProfileOpen && (
              <div className="absolute right-0 mt-3 w-52 bg-white rounded-2xl shadow-2xl border border-gray-100 overflow-hidden animate-fade-in">
                <button
                  type="button"
                  onClick={handleClickViewProfile}
                  className="w-full flex items-center px-5 py-3 text-gray-700 hover:bg-indigo-50 transition"
                >
                  <CgProfile className="w-5 h-5 mr-3 text-indigo-500" />
                  View Profile
                </button>
                <button
                  type="button"
                  onClick={handleClickEditProfile}
                  className="w-full flex items-center px-5 py-3 text-gray-700 hover:bg-indigo-50 transition"
                >
                  <FaEdit className="w-5 h-5 mr-3 text-indigo-500" />
                  Edit Profile
                </button>
                <button
                  onClick={handleClickSignOut}
                  type="button"
                  className="w-full flex items-center px-5 py-3 text-gray-700 hover:bg-red-50 transition"
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
  );
}
