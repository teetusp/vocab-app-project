"use client";
import React from "react";
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

type Staff = {
  staff_id: string;
  fullname: string;
  staff_image_url: string;
};

export default function NavBarStaff() {
  const router = useRouter();

  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [staff, setStaff] = useState<Staff | null>(null);

  // ดึงข้อมูลผู้ดูแลระบบแบบ 1-1 จากหน้า login + supabase
  useEffect(() => {
    async function fetchStaff() {
      try {
        const staffId = localStorage.getItem("staff_id");
        if (!staffId) {
          console.error("ไม่พบ staff_id ใน localStorage");
          return;
        }

        // ดึงข้อมูลผู้ใช้จากตาราง user_tb
        const { data, error } = await supabase
          .from("staff_tb")
          .select("staff_id, fullname, staff_image_url")
          .eq("staff_id", staffId)
          .single();

        if (error) {
          console.error("เกิดข้อผิดพลาดในการดึงข้อมูลผู้ใช้:", error.message);
          return;
        }

        if (data) {
          setStaff({
            staff_id: data.staff_id,
            fullname: data.fullname,
            staff_image_url: data.staff_image_url,
          });
        }
      } catch (ex) {
        console.error("เกิดข้อผิดพลาดในการเชื่อมต่อ Supabase:", ex);
      }
    }

    fetchStaff();
  }, []);

  async function handleClickSignOut() {
    console.log("ออกกำลังออกจากระบบ...");
    localStorage.removeItem("staff_id");
    console.log("localStorage ลบเรียบร้อย");
    //redirect to home page
    router.push("/");
  }
  const handleClickEditProfile = () => {
    if (staff?.staff_id) {
      router.push(`/staffedit/${staff?.staff_id}`);
      console.log("Go to edit user:", staff?.staff_id);
    } else {
      console.error("ไม่พบ user id");
    }
  };

  const handleClickViewProfile = () => {
    if (staff?.staff_id) {
      router.push(`/staffprofile/${staff?.staff_id}`);
      console.log("Go to view profile user:", staff?.staff_id);
    } else {
      console.error("ไม่พบ user id");
    }
  };
  return (
    <div>
      {/* ส่วน NavBar */}
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
                <span className="text-yellow-300">Vocab</span>{" "}
                <span className="text-red-600">Card</span>
              </h1>
            </div>

            {/* เมนูหลัก */}
            <div className="hidden md:flex space-x-8">
              <Link
                href={`/staffdashboard/${staff?.staff_id}`}
                className="text-lg font-semibold text-white hover:text-yellow-300 transition-colors duration-200"
              >
                Dashboard
              </Link>
              <Link
                href={`/showalluser/${staff?.staff_id}`}
                className="text-lg font-semibold text-white hover:text-yellow-300 transition-colors duration-200"
              >
                User List
              </Link>
              <Link
                href={`/showallcat/${staff?.staff_id}`}
                className="text-lg font-semibold text-white hover:text-yellow-300 transition-colors duration-200"
              >
                Categories
              </Link>
              <Link
                href={`/showallvocab/${staff?.staff_id}`}
                className="text-lg font-semibold text-white hover:text-yellow-300 transition-colors duration-200"
              >
                Vocabulary
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
                  src={staff?.staff_image_url}
                  alt="User profile"
                />
                <span className="hidden md:inline font-semibold text-white drop-shadow">
                  {staff?.fullname}
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
    </div>
  );
}
