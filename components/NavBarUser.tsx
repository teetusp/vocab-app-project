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

  return (
    <div>
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
            <Link
              href={`/dashboard/${user?.id}`}
              className="text-xl font-extrabold text-indigo-900 hover:text-indigo-500 transition duration-150"
            >
              Dashbaord
            </Link>
            <Link
              href={`/userhistory/${user?.id}`}
              className="text-xl font-extrabold text-indigo-900 hover:text-indigo-500 transition duration-150"
            >
              History
            </Link>
            <Link
              href={`/usertest/${user?.id}`}
              className="text-xl font-extrabold text-indigo-900 hover:text-indigo-500 transition duration-150"
            >
              Quiz
            </Link>
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
    </div>
  );
}
