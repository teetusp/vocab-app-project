"use client";
import React, { useState, useEffect, use } from "react";
import { useRouter, useParams } from "next/navigation";
import NavBarUser from "../../../components/NavBarUser";
import Footer from "../../../components/Footer";
import { supabase } from "@/lib/supabaseClient";
import Image from "next/image";
import { CiUser } from "react-icons/ci";
import { CiMail } from "react-icons/ci";
import SweetAlert from "sweetalert2";
import { CiEdit } from "react-icons/ci";
import { IoIosArrowBack } from "react-icons/io";
import { CiTrash } from "react-icons/ci";
type User = {
  user_id: string;
  fullname: string;
  email: string;
  birthdate: string;
  password: string;
  gender: string;
  user_image_url: string;
};

export default function page() {
  const router = useRouter();
  const user_id = useParams().id;

  const [users, setUsers] = useState<User[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [fullname, setFullname] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [birthdate, setBirthdate] = useState<string>("");
  const [gender, setGender] = useState<string>("");
  const [user_preview_file, setUserPreviewFile] = useState<string | null>(null);

  //ดึงข้อมูลจาก supabase มาแสดงหน้าจอตาม id ที่ได้มาจาก url
  useEffect(() => {
    //ดึงข้อมูลจาก supabase
    async function fetchData() {
      const { data, error } = await supabase
        .from("user_tb")
        .select("*")
        .eq("user_id", user_id)
        .single();

      if (error) {
        alert("พบข้อผิดพลาดในการดึงข้อมูล กรุณาลองใหม่อีกครั้ง...");
        console.log(error);
        return;
      }
      //เอาข้อมูลที่ดึงมาจาก supabase มาแสดงบนหน้าจอ
      setFullname(data.fullname);
      setEmail(data.email);
      setBirthdate(
        new Date(data.birthdate).toLocaleDateString("th-TH", {
          year: "numeric",
          month: "long",
          day: "numeric",
        })
      );
      setGender(data.gender);
      setUserPreviewFile(data.user_image_url);
    }

    fetchData();
  }, []);

  //สร้างฟังก์ชั้น สําหรับการลบงานออกจากตาราง
  async function handleDeleteUserClick(id: string, image_url: string) {
    //แสดง confirm dialog เพื่อยืนยันการลบ
    const result = await SweetAlert.fire({
      title: "คุณแน่ใจหรือไม่?",
      text: "คุณต้องการลบบัญชีนี้หรือไม่?",
      icon: "warning",
      showCancelButton: true,
      iconColor: "#d33",
      confirmButtonColor: "#3085d6",
      cancelButtonColor: "#d33",
      confirmButtonText: "ยืนยัน",
      cancelButtonText: "ยกเลิก",
    });

    if (result.isConfirmed) {
      //--------- ลบรูปภาพออกจาก storage (ถ้ามี) -----------
      if (image_url != "") {
        //เอาเฉพาะชื่อของรูปภาพจาก image_url
        const image_name = image_url.split("/").pop() as string;
        const { data, error } = await supabase.storage
          .from("user_bk")
          .remove([image_name]);

        if (error) {
          alert("พบข้อผิดพลาดในการลบรูปภาพ กรุณาลองใหม่อีกครั้ง...");
          console.log(error);
          return;
        }
      }

      //--------- ลบรายการงานออกจากตาราง supabase -----------
      const { data, error } = await supabase
        .from("user_tb")
        .delete()
        .eq("user_id", user_id);

      if (error) {
        alert("พบข้อผิดพลาดในการลบข้อมูล กรุณาลองใหม่อีกครั้ง...");
        console.log(error);
        return;
      }

      router.push(`/dashboard/${id}`);
    }
  }
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-indigo-50">
      {/* Navbar */}
      <NavBarUser />

      {/* เนื้อหาหลัก */}
      <div className="flex-grow max-w-2xl mx-auto pt-24 p-4 sm:p-8">
        <div className="bg-white/90 backdrop-blur-md p-10 rounded-3xl shadow-2xl border-l-4 border-teal-500 text-center transition transform hover:scale-[1.01]">
          {/* Header */}
          <h2 className="text-3xl font-extrabold text-indigo-800 mb-6 border-b pb-4 drop-shadow-sm">
            Personal Profile
          </h2>

          {/* รูปโปรไฟล์ */}
          <div className="mb-8 flex justify-center">
            <Image
              src={user_preview_file || "/user.png"}
              alt="file Input"
              width={240}
              height={240}
              className="w-40 h-40 object-cover  border-4 border-teal-400 shadow-xl ring-4 ring-teal-100 transition-transform duration-300 hover:scale-105"
            />
          </div>

          {/* รายละเอียด */}
          <div className="space-y-5 text-left text-lg mb-8">
            <div className="flex items-center space-x-3">
              <CiUser className="text-2xl text-teal-600" />
              <span className="font-medium text-gray-700">ชื่อผู้ใช้:</span>
              <span className="text-gray-900 font-semibold">{fullname}</span>
            </div>
            <div className="flex items-center space-x-3">
              <CiMail className="text-2xl text-teal-600" />
              <span className="font-medium text-gray-700">อีเมล:</span>
              <span className="text-gray-900 font-semibold">{email}</span>
            </div>
            <div className="flex items-center space-x-3">
              <CiUser className="text-2xl text-teal-600" />
              <span className="font-medium text-gray-700">เพศ:</span>
              <span className="text-gray-900 font-semibold">{gender}</span>
            </div>
            <div className="flex items-center space-x-3">
              <CiUser className="text-2xl text-teal-600" />
              <span className="font-medium text-gray-700">วันเกิดผู้ใช้:</span>
              <span className="text-gray-900 font-semibold">{birthdate}</span>
            </div>
          </div>

          {/* ปุ่มคำสั่ง */}
          <div className="flex flex-wrap justify-center gap-4">
            {/* ปุ่มย้อนกลับ */}
            <button
              className="px-6 py-3 bg-gray-400 text-white rounded-2xl font-semibold hover:bg-gray-500 shadow-lg transition transform hover:scale-105 flex items-center gap-2"
              onClick={() => router.back()}
            >
              <IoIosArrowBack className="text-lg" /> Back
            </button>
            {/* ปุ่มลบ */}

            {/* ปุ่มแก้ไข */}
            <button
              className="px-6 py-3 bg-indigo-600 text-white rounded-2xl font-semibold hover:bg-indigo-700 shadow-lg transition transform hover:scale-105 flex items-center gap-2"
              onClick={() => router.push(`/edituser/${user_id}`)}
            >
              <CiEdit className="text-lg" /> Edit Profile
            </button>

            <button
              className="px-6 py-3 bg-red-600 text-white rounded-2xl font-semibold hover:bg-red-700 shadow-lg transition transform hover:scale-105 flex items-center gap-2"
              onClick={() =>
                handleDeleteUserClick(
                  user?.user_id || "",
                  user_preview_file || ""
                )
              }
            >
              <CiTrash className="text-lg" /> Delete Account
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}
