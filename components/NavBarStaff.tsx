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
      <div className="sticky bg-blue-200/90 backdrop-blur-sm shadow-md z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* โลโก้/ชื่อแอป */}
            <div
              onClick={() => router.push(`/staffdashboard/${staff?.staff_id}`)}
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
                  src={staff?.staff_image_url}
                  width={32}
                  height={32}
                  alt="User profile"
                />
                <span className="hidden md:inline font-medium text-gray-700">
                  {staff?.fullname}
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
                    onClick={handleClickViewProfile}
                    className="w-full flex items-center px-4 py-3 text-gray-700 hover:bg-indigo-100 cursor-pointer"
                  >
                    <CgProfile className="w-5 h-5 mr-3 text-blue-500" />
                    View Profile
                  </button>
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
