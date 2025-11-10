"use client";
import React, { useState, useEffect, use } from "react";
import { useRouter, useParams } from "next/navigation";
import Footer from "../../../components/Footer";
import { supabase } from "@/lib/supabaseClient";
import Image from "next/image";
import { CiUser } from "react-icons/ci";
import { CiMail } from "react-icons/ci";
import SweetAlert from "sweetalert2";
import NavBarStaff from "@/components/NavBarStaff";
import { CiEdit } from "react-icons/ci";
import { IoIosArrowBack } from "react-icons/io";
import { CiTrash } from "react-icons/ci";


type Staff = {
  staff_id: string;
  fullname: string;
  email: string;
  birthdate: string;
  password: string;
  gender: string;
  phonenumber: string;
  staff_image_url: string;
};

export default function page() {
  const router = useRouter();
  const staff_id = useParams().id;

  const [staffs, setStaffs] = useState<Staff[]>([]);
  const [staff, setStaff] = useState<Staff | null>(null);
  const [fullname, setFullname] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [birthdate, setBirthdate] = useState<string>("");
  const [gender, setGender] = useState<string>("");
  const [phonenumber, setPhoneNumber] = useState<string>("");
  const [staff_preview_file, setStaffPreviewFile] = useState<string | null>(
    null
  );

  //ดึงข้อมูลจาก supabase มาแสดงหน้าจอตาม id ที่ได้มาจาก url
  useEffect(() => {
    //ดึงข้อมูลจาก supabase
    async function fetchData() {
      const { data, error } = await supabase
        .from("staff_tb")
        .select("*")
        .eq("staff_id", staff_id)
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
      setPhoneNumber(data.phonenumber);
      setStaffPreviewFile(data.staff_image_url);
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
          .from("staff_bk")
          .remove([image_name]);

        if (error) {
          alert("พบข้อผิดพลาดในการลบรูปภาพ กรุณาลองใหม่อีกครั้ง...");
          console.log(error);
          return;
        }
      }

      //--------- ลบรายการงานออกจากตาราง supabase -----------
      const { data, error } = await supabase
        .from("staff_tb")
        .delete()
        .eq("staff_id", staff_id);

      if (error) {
        alert("พบข้อผิดพลาดในการลบข้อมูล กรุณาลองใหม่อีกครั้ง...");
        console.log(error);
        return;
      }

      router.push(`/staffdashboard/${id}`);
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-pink-100">
      {/* Navbar */}
      <NavBarStaff />

      {/* เนื้อหาหลัก */}
      <div className="flex-grow max-w-2xl mx-auto pt-24 p-4 sm:p-8">
        <div className="bg-white p-10 rounded-3xl shadow-2xl border-b-4 border-teal-500 text-center">
          <h2 className="text-3xl font-extrabold text-indigo-800 mb-6 border-b pb-4">
            ข้อมูลส่วนตัวของพนักงาน
          </h2>

          {/* รูปโปรไฟล์ */}
          <div className="mb-8 flex justify-center">
            <Image
              src={staff_preview_file || "/user.png"}
              alt="file Input"
              width={240}
              height={240}
              className="w-40 h-40 object-cover rounded-full border-4 border-teal-400 shadow-xl ring-4 ring-teal-100"
            />
          </div>

          {/* รายละเอียด */}
          <div className="space-y-5 text-left text-lg mb-8">
            <div className="flex items-center space-x-2">
              <CiUser className="text-xl text-teal-600" />
              <span className="font-medium text-gray-700">ชื่อพนักงาน:</span>
              <span className="text-gray-900">{fullname}</span>
            </div>
            <div className="flex items-center space-x-2">
              <CiMail className="text-xl text-teal-600" />
              <span className="font-medium text-gray-700">อีเมล:</span>
              <span className="text-gray-900">{email}</span>
            </div>
            <div className="flex items-center space-x-2">
              <CiUser className="text-xl text-teal-600" />
              <span className="font-medium text-gray-700">เพศ:</span>
              <span className="text-gray-900">{gender}</span>
            </div>
            <div className="flex items-center space-x-2">
              <CiUser className="text-xl text-teal-600" />
              <span className="font-medium text-gray-700">เบอร์โทร:</span>
              <span className="text-gray-900">{phonenumber}</span>
            </div>
            <div className="flex items-center space-x-2">
              <CiUser className="text-xl text-teal-600" />
              <span className="font-medium text-gray-700">วันเกิด:</span>
              <span className="text-gray-900">{birthdate}</span>
            </div>
          </div>

          {/* ปุ่มคำสั่ง */}
          <div className="flex flex-wrap justify-center gap-4">
            {/* ปุ่มย้อนกลับ */}
            <button
              className="px-6 py-3 bg-gray-400 text-white rounded-2xl font-semibold hover:bg-gray-500 shadow-lg transition transform hover:scale-105 flex items-center gap-2"
              onClick={() => router.back()}
            >
             <IoIosArrowBack className="text-xl" />ย้อนกลับ
            </button>
            {/* ปุ่มแก้ไข */}
            <button
              className="px-6 py-3 bg-indigo-600 text-white rounded-2xl font-semibold hover:bg-indigo-700 shadow-lg transition transform hover:scale-105 flex items-center gap-2"
              onClick={() => router.push(`/staffedit/${staff_id}`)}
            >
             <CiEdit className="text-xl" />แก้ไขข้อมูลส่วนตัว
            </button>
            {/* ปุ่มลบ */}
            <button
              className="px-6 py-3 bg-red-600 text-white rounded-2xl font-semibold hover:bg-red-700 shadow-lg transition transform hover:scale-105 flex items-center gap-2"
              onClick={() =>
                handleDeleteUserClick(
                  staff?.staff_id || "",
                  staff_preview_file || ""
                )
              }
            >
             <CiTrash className="text-xl" />ลบบัญชี
            </button>
          </div>
        </div>
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}
