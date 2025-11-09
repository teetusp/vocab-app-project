"use client";
import React from "react";
import NavBarStaff from "@/components/NavBarStaff";
import Footer from "@/components/Footer";
import Image from "next/image";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useParams } from "next/navigation";
import showalluser from "../../../assets/showalluser.png";
import showallvocab from "../../../assets/showallvocab.png";
import showallcat from "../../../assets/showallcat.png";
type Staff = {
  staff_id: string;
  fullname: string;
  staff_image_url: string;
};

export default function page() {
  const router = useRouter();

  const [staff, setStaff] = useState<Staff | null>(null);

  // ดึงข้อมูลผู้ใช้เแบบ 1-1 จากหน้า login + supabase
  useEffect(() => {
    async function fetchStaff() {
      try {
        const staffId = localStorage.getItem("staff_id");
        if (!staffId) {
          console.error("ไม่พบ staff_id ใน localStorage");
          return;
        }

        // ดึงข้อมูลผู้ใช้จากตาราง staff
        const { data, error } = await supabase
          .from("staff_tb")
          .select("staff_id, fullname, staff_image_url")
          .eq("staff_id", staffId)
          .single();

        if (error) {
          console.error("เกิดข้อผิดพลาดในการดึงข้อมูลผู้ใช้:", error.message);
          return;
        }

        setStaff({
          staff_id: data.staff_id,
          fullname: data.fullname,
          staff_image_url: data.staff_image_url,
        });
      } catch (ex) {
        console.error("เกิดข้อผิดพลาดในการเชื่อมต่อ Supabase:", ex);
      }
    }

    fetchStaff();
  }, []);

  const handleClickShowAllVocab = () => {
    if (staff?.staff_id) {
      router.push(`/showallvocab/${staff?.staff_id}`);
      console.log("Go to show all vocab staff:", staff?.staff_id);
    } else {
      console.error("ไม่พบ staff id");
    }
  };
  const handleClickShowAllCat = () => {
    if (staff?.staff_id) {
      router.push(`/showallcat/${staff?.staff_id}`);
      console.log("Go to show all cat staff:", staff?.staff_id);
    } else {
      console.error("ไม่พบ staff id");
    }
  };

  const handleClickShowAllUser = () => {
    if (staff?.staff_id) {
      router.push(`/showalluser/${staff?.staff_id}`);
      console.log("Go to show all staff:", staff?.staff_id);
    } else {
      console.error("ไม่พบ staff id");
    }
  };
  return (
    <div>
      <div className="min-h-screen bg-pink-100">
        <NavBarStaff />
        {/* ส่วนของ Dashboard */}
        <div className="p-6 md:p-10">
          {/* 1. ตกแต่งหัวข้อ "Dashboard" ให้มีสีสันไล่ระดับ */}
          <h1 className="text-4xl font-bold mb-6 bg-gradient-to-r from-blue-500 via-green-500 to-yellow-500 bg-clip-text text-transparent drop-shadow-lg">
            Admin Dashboard
          </h1>
          {/* 2. ตกแต่งการ์ดต้อนรับให้กึ่งโปร่งใส และเปลี่ยนสีข้อความต้อนรับ */}
          <div className="bg-white/95 backdrop-blur-sm p-6 rounded-2xl shadow-2xl border-2 border-pink-200">
            <h2 className="text-2xl font-bold text-indigo-600 mb-4">
              Hello!!, {staff?.fullname}!
            </h2>
            <h3 className="text-gray-600">
              จัดการข้อมูลผู้ใช้และคําศัพท์ทั้งหมดได้ที่นี่
            </h3>

            {/* Placeholder สำหรับเนื้อหา Dashboard (อัปเดตแล้ว) */}
            <div className="mt-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Link
                href={`/showalluser/${staff?.staff_id}`}
                onClick={handleClickShowAllUser}
              >
                <div className="h-40 bg-blue-100 rounded-xl flex flex-col items-center justify-center text-blue-800 font-bold transition transform hover:scale-105 hover:shadow-lg">
                  <Image
                    src={showalluser}
                    alt="showalluser"
                    className="w-12 h-12 text-blue-600 mb-2"
                  />
                  <span className="text-lg">ผู้ใช้ทั้งหมด</span>
                </div>
              </Link>

              <Link
                href={`/showallcat/${staff?.staff_id}`}
                onClick={handleClickShowAllCat}
              >
                <div className="h-40 bg-green-100 rounded-xl flex flex-col items-center justify-center text-green-800 font-bold transition transform hover:scale-105 hover:shadow-lg">
                  <Image
                    src={showallcat}
                    alt="showallcat"
                    className="w-12 h-12 text-green-600 mb-2"
                  />
                  <span className="text-lg">ประเภทคําศัพท์ทั้งหมด</span>
                </div>
              </Link>

              <Link href={`/showallvocab/${staff?.staff_id}`} onClick={handleClickShowAllVocab}>
                <div className="h-40 bg-yellow-100 rounded-xl flex flex-col items-center justify-center text-yellow-800 font-bold transition transform hover:scale-105 hover:shadow-lg">
                  <Image
                    src={showallvocab}
                    alt="showallvocab"
                    className="w-12 h-12 text-red-600 mb-2"
                  />
                  <span className="text-lg">คำศัพท์ทั้งหมด</span>
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
