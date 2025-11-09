"use client";
import React from "react";
import NavBarStaff from "@/components/NavBarStaff";
import Footer from "@/components/Footer";
import { useState, useEffect } from "react";
import { supabase } from "@/lib/supabaseClient";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { IoIosArrowBack } from "react-icons/io";

type User = {
  user_id: number;
  fullname: string;
  email: string;
  password: string;
  created_at: string;
  birthdate: string;
  gender: string;
  user_image_url: string;
};

type Staff = {
  staff_id: string;
  fullname: string;
  staff_image_url: string;
};

export default function page() {
  const router = useRouter();
  const [staff, setStaff] = useState<Staff | null>(null);
  const [users, setUsers] = useState<User[]>([]);

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

  //เมื่อเพจถูกโหลด ให้ดึงข้อมูลจาก supabase เพื่อมาแสดงผลที่หน้าเพจ
  useEffect(() => {
    async function fetchUsers() {
      const { data, error } = await supabase
        .from("user_tb")
        .select(
          "user_id, fullname, email, password, created_at, birthdate, gender, user_image_url"
        )
        .order("created_at", { ascending: false });

      //หลังจากดึงข้อมูลมาตรวจสอบ error
      if (error) {
        alert("พบข้อผิดพลาดในการดึงข้อมูล กรุณาลองใหม่อีกครั้ง...");
        console.error(error);
        return;
      }
      //ไม่พบ error
      if (data) {
        setUsers(data as User[]);
      }
    }

    fetchUsers();
  }, []);

  const handleClickBack = () => {
    router.push(`/staffdashboard/${staff?.staff_id}`);
  };

  async function handleDeleteTaskClick(id: number, image_url: string) {
    if (confirm("คุณต้องการลบผู้ใช้นี้ใช่หรือไม่?")) {
      // 1️⃣ ลบรูปก่อน (ถ้ามี)
      if (image_url) {
        const image_name = image_url.split("/").pop() as string;
        const { error: storageError } = await supabase.storage
          .from("user_bk")
          .remove([image_name]);

        if (storageError) {
          alert("พบข้อผิดพลาดในการลบรูปภาพ");
          console.log(storageError);
          return;
        }
      }

      // ลบข้อมูลในตารางที่มี FK ก่อน เช่น vocab_tb
      const { error } = await supabase
        .from("history_tb")
        .delete()
        .eq("user_id", id);

      if (error) {
        alert("ไม่สามารถลบข้อมูลคำศัพท์ของผู้ใช้นี้ได้");
        console.log(error);
        return;
      }

      // ลบผู้ใช้จาก user_tb
      const { error: userError } = await supabase
        .from("user_tb")
        .delete()
        .eq("user_id", id);

      if (userError) {
        alert("ไม่สามารถลบผู้ใช้นี้ได้");
        console.log(userError);
        return;
      }

      // ลบผู้ใช้ออกจาก state เพื่ออัปเดตหน้าจอ
      setUsers(users.filter((u) => u.user_id !== id));
    }
  }

  return (
    <div>
      <div className="min-h-screen bg-pink-100">
        <NavBarStaff />
        <div className="p-6 md:p-10">
          {/* 1. ตกแต่งหัวข้อ "Dashboard" ให้มีสีสันไล่ระดับ */}
          <h1 className="text-4xl font-bold mb-6 bg-gradient-to-r from-blue-500 via-green-500 to-yellow-500 bg-clip-text text-transparent drop-shadow-lg">
            Admin Dashboard
          </h1>
          <div className="bg-white/95 backdrop-blur-sm p-6 rounded-2xl shadow-2xl border-2 border-pink-200">
            <div className="flex items-center justify-between mb-6">
              <div>
                <h2 className="text-2xl font-bold text-indigo-600 mb-2">
                  ผู้ใช้ทั้งหมด
                </h2>
                <h3 className="text-gray-600 text-sm">รายชื่อผู้ใช้ทั้งหมด</h3>
              </div>

              <button
                onClick={handleClickBack}
                className="px-8 py-3 bg-gray-600 text-white font-bold rounded-full shadow-xl hover:bg-gray-800 transition duration-150 transform hover:scale-105 text-lg flex items-center"
              >
                <IoIosArrowBack className="text-xl mr-2" /> ย้อนกลับ
              </button>
            </div>

            {/* ตารางผู้ใช้ทั้งหมด*/}
            <div className="mt-5 text-center">
              <table className="min-w-full border border-gray-400 rounded-lg overflow-hidden shadow-lg">
                <thead className="bg-indigo-100">
                  <tr>
                    <th className="border-b border-r border-gray-400 p-3 text-sm font-semibold text-gray-700 text-center">
                      รูปผู้ใช้
                    </th>
                    <th className="border-b border-r border-gray-400 p-3 text-sm font-semibold text-gray-700 text-center">
                      Fullname
                    </th>
                    <th className="border-b border-r border-gray-400 p-3 text-sm font-semibold text-gray-700 text-center">
                      Email
                    </th>
                    <th className="border-b border-r border-gray-400 p-3 text-sm font-semibold text-gray-700 text-center">
                      Password
                    </th>
                    <th className="border-b border-r border-gray-400 p-3 text-sm font-semibold text-gray-700 text-center">
                      วันที่สมัคร
                    </th>
                    <th className="border-b border-r border-gray-400 p-3 text-sm font-semibold text-gray-700 text-center">
                      วันที่เกิด
                    </th>
                    <th className="border-b border-r border-gray-400 p-3 text-sm font-semibold text-gray-700 text-center">
                      เพศ
                    </th>
                    <th className="border-b border-r border-gray-400 p-3 text-sm font-semibold text-gray-700 text-center">
                      ลบบัญชีผู้ใช้
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-400">
                  {users.map((user) => (
                    <tr
                      key={user.user_id}
                      className="hover:bg-indigo-50 transition-colors duration-200"
                    >
                      <td className="p-2 text-center border-r border-gray-400">
                        {user.user_image_url ? (
                          <Image
                            src={user.user_image_url}
                            alt="logo"
                            width={50}
                            height={50}
                            className="mx-auto rounded-full border-2 border-indigo-200 shadow-sm"
                          />
                        ) : (
                          <div className="w-12 h-12 mx-auto bg-gray-200 rounded-full flex items-center justify-center text-gray-500">
                            -
                          </div>
                        )}
                      </td>
                      <td className="p-2 text-gray-800 font-medium border-r border-gray-400 text-center">
                        {user.fullname}
                      </td>
                      <td className="p-2 text-gray-700 border-r border-gray-400 text-center">
                        {user.email}
                      </td>
                      <td className="p-2 text-gray-700 border-r border-gray-400 text-center">
                        {user.password}
                      </td>
                      <td className="p-2 text-gray-600 border-r border-gray-400 text-center">
                        {new Date(user.created_at).toLocaleDateString()}
                      </td>
                      <td className="p-2 text-gray-600 border-r border-gray-400 text-center">
                        {new Date(user.birthdate).toLocaleDateString()}
                      </td>
                      <td className="p-2 text-gray-600 border-r border-gray-400 text-center">
                        {user.gender}
                      </td>
                      <td className="p-2 text-gray-600 border-r border-gray-400 text-center">
                        <button
                          className="text-red-700 font-bold cursor-pointer"
                          onClick={() =>
                            handleDeleteTaskClick(
                              user.user_id,
                              user.user_image_url
                            )
                          }
                        >
                          ลบ
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
