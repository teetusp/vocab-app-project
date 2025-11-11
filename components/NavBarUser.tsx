"use client";
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

export default function Navbar() {
  const router = useRouter();

  const [isMiniGameOpen, setIsMiniGameOpen] = useState(false);
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
    <div className="fixed top-0 left-0 w-full z-50 bg-gradient-to-r from-blue-400 via-purple-400 to-pink-400 shadow-xl">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-2 left-10 w-8 h-8 bg-yellow-300 rounded-full opacity-50 animate-bounce"></div>
        <div className="absolute top-3 right-20 w-6 h-6 bg-pink-300 rounded-full opacity-50 animate-pulse"></div>
        <div className="absolute top-4 left-1/3 w-5 h-5 bg-green-300 rounded-full opacity-50 animate-bounce delay-100"></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="flex justify-between items-center h-20">
          <div
            onClick={() => router.push("/dashboard/" + user?.id)}
            className="flex items-center space-x-3 cursor-pointer transform transition-all hover:scale-110 hover:rotate-3 duration-300"
          >
            <div className="relative">
              <Image
                src={rocket || "/placeholder.svg"}
                alt="Logo"
                className="w-12 h-12 drop-shadow-2xl animate-bounce"
              />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-yellow-400 rounded-full animate-ping"></div>
            </div>
            <h1 className="text-3xl font-black tracking-wide drop-shadow-lg">
              <span className="text-yellow-300 text-shadow">Card</span>{" "}
              <span className="text-white text-shadow">Vocab</span>
            </h1>
          </div>

          <div className="hidden md:flex space-x-6">
            <Link
              href={`/dashboard/${user?.id}`}
              className="relative text-lg font-bold text-white hover:text-yellow-300 transition-all duration-200 px-3 py-2 rounded-xl hover:bg-white/20 hover:scale-110 transform"
            >
              Dashboard
            </Link>
            <Link
              href={`/dashboardvocab/${user?.id}`}
              className="relative text-lg font-bold text-white hover:text-yellow-300 transition-all duration-200 px-3 py-2 rounded-xl hover:bg-white/20 hover:scale-110 transform"
            >
              Vocabular
            </Link>
            <Link
              href={`/userhistory/${user?.id}`}
              className="relative text-lg font-bold text-white hover:text-yellow-300 transition-all duration-200 px-3 py-2 rounded-xl hover:bg-white/20 hover:scale-110 transform"
            >
              History
            </Link>
            <Link
              href={`/usertest/${user?.id}`}
              className="relative text-lg font-bold text-white hover:text-yellow-300 transition-all duration-200 px-3 py-2 rounded-xl hover:bg-white/20 hover:scale-110 transform"
            >
              Quiz
            </Link>
            <div className="relative">
              <button
                onClick={() => setIsMiniGameOpen(!isMiniGameOpen)}
                className="flex items-center space-x-1 text-lg font-bold text-white hover:text-yellow-300 transition-all duration-200 px-3 py-2 rounded-xl hover:bg-white/20 hover:scale-110 transform"
              >
                <span>Mini Game</span>
                <IoIosArrowDropdown
                  className={`w-5 h-5 transition-transform duration-300 ${
                    isMiniGameOpen ? "rotate-180" : ""
                  }`}
                />
              </button>

              {isMiniGameOpen && (
                <div className="absolute right-0 mt-3 w-55 bg-gradient-to-br from-white to-purple-50 rounded-2xl shadow-2xl border-4 border-purple-300 overflow-hidden animate-in slide-in-from-top-2">
                  <Link
                    href={`/matchinggame/${user?.id}`}
                    className="w-full flex justify-center px-5 py-4 text-gray-800 hover:bg-purple-200 transition-all font-bold hover:pl-7 duration-200"
                  >
                  🎮 Matching Game
                  </Link>
                </div>
              )}
            </div>
          </div>

          <div className="relative">
            <button
              onClick={() => setIsProfileOpen(!isProfileOpen)}
              className="flex items-center space-x-2 rounded-full bg-white hover:bg-yellow-100 transition-all duration-300 shadow-lg hover:shadow-2xl pr-4 pl-1 py-1 border-4 border-yellow-300 transform hover:scale-105"
            >
              <img
                className="w-10 h-10 rounded-full object-cover border-4 border-white shadow-md"
                src={user?.user_image_url || "/placeholder.svg"}
                alt="User profile"
              />
              <span className="hidden md:inline font-bold text-gray-800">
                {user?.fullname}
              </span>
              <IoIosArrowDropdown
                className={`w-6 h-6 text-gray-800 transition-transform duration-300 ${
                  isProfileOpen ? "rotate-180" : ""
                }`}
              />
            </button>

            {isProfileOpen && (
              <div className="absolute right-0 mt-3 w-56 bg-gradient-to-br from-white to-purple-50 rounded-3xl shadow-2xl border-4 border-purple-300 overflow-hidden animate-in slide-in-from-top-2">
                <button
                  type="button"
                  onClick={handleClickViewProfile}
                  className="w-full flex items-center px-5 py-4 text-gray-800 hover:bg-purple-200 transition-all font-bold hover:pl-7 duration-200"
                >
                  <CgProfile className="w-6 h-6 mr-3 text-purple-600" />
                  View Profile
                </button>
                <button
                  type="button"
                  onClick={handleClickEditProfile}
                  className="w-full flex items-center px-5 py-4 text-gray-800 hover:bg-blue-200 transition-all font-bold hover:pl-7 duration-200"
                >
                  <FaEdit className="w-6 h-6 mr-3 text-blue-600" />
                  Edit Profile
                </button>
                <button
                  onClick={handleClickSignOut}
                  type="button"
                  className="w-full flex items-center px-5 py-4 text-gray-800 hover:bg-red-200 transition-all font-bold hover:pl-7 duration-200"
                >
                  <CiLogout className="w-6 h-6 mr-3 text-red-600" />
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
