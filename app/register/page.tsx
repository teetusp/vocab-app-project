"use client";
import React from "react";
import { useState } from "react";
import Link from "next/link";
import Footer from "../../components/Footer";
import Image from "next/image";
import rocket from "../../assets/rocket.png";
import SweetAlert from "sweetalert2";
import { useRouter } from "next/navigation";
import { IoArrowBackCircleSharp } from "react-icons/io5";
import { CiUser } from "react-icons/ci";
import { CiMail } from "react-icons/ci";
import { CiLock } from "react-icons/ci";
import { FaEye } from "react-icons/fa";
import { FaEyeSlash } from "react-icons/fa";
import { SlCalender } from "react-icons/sl";
import { supabase } from "./../../lib/supabaseClient";

export default function page() {
  const router = useRouter();

  const [fullname, setFullname] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [birthdate, setBirthdate] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [gender, setGender] = useState<string>("");

  const [user_image_flie, setUserImageFile] = useState<File | null>(null);
  const [userimagePreviewUrl, setUserImagePreview] = useState<string | null>(
    null
  );

  ///ฟังก์ชันเลือกรูปภาพเพื่อพรีวิวก่อนที่จะอัปโหลด
  function handleSelectImagePreview(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] || null;

    setUserImageFile(file);

    if (file) {
      setUserImagePreview(URL.createObjectURL(file as Blob));
    }
  }
  async function handleUploadAndSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    //ตรวจสอบการกรอกข้อมูล
    if (!fullname || !email || !password || !birthdate || !gender) {
      SweetAlert.fire({
        icon: "warning",
        iconColor: "#E30707",
        title: "กรุณากรอกข้อมูลให้ครบถ้วน",
        showConfirmButton: true,
        confirmButtonText: "ตกลง",
        confirmButtonColor: "#3085D6",
      });
      return;
    }
    // show dialog loading
    SweetAlert.fire({
      icon: "success",
      title: "กำลังอัปโหลดข้อมูล...",
      showConfirmButton: false,
      timer: 1500,
    });

    let image_url = "";
    //ตรวจสอบว่ามีการเลือกรูปภาพเพื่อที่จะอัปโหลดหรือไม่
    if (user_image_flie) {
      const new_image_flie_name = `${Date.now()}-${user_image_flie?.name}`;
      //อัปโหลดรูป
      const { data, error } = await supabase.storage
        .from("user_bk")
        .upload(new_image_flie_name, user_image_flie);

      if (error) {
        alert("พบข้อผิดพลาดในการอัปโหลดรูปภาพ กรุณาลองใหม่อีกครั้ง");
        console.log(error.message);
        return;
      } else {
        // get url ของรูปที่
        const { data } = supabase.storage
          .from("user_bk")
          .getPublicUrl(new_image_flie_name);
        image_url = data.publicUrl;
      }
    }
    //--------บันทึกลงตาราง supabase---------
    const { data, error } = await supabase.from("user_tb").insert({
      fullname: fullname,
      email: email,
      password: password,
      birthdate: birthdate,
      gender: gender,
      user_image_url: image_url,
    });
    //ตรวจสอบ
    if (error) {
      alert("พบข้อผิดพลาดในการบันทึกข้อมูล กรุณาลองใหม่อีกครั้ง");
      console.log(error.message);
      return;
    } else {
      SweetAlert.fire({
        icon: "success",
        title: "สมัครสมาชิกสำเร็จ",
        showConfirmButton: true,
        confirmButtonText: "ตกลง",
        confirmButtonColor: "#3085D6",
      });
      //เคลียร์ข้อมูล
      setFullname("");
      setEmail("");
      setPassword("");
      setBirthdate("");
      setGender("");
      setUserImageFile(null);
      setUserImagePreview(null);
      image_url = "";
      //redirect กลับไปหน้า แสดงงานทั้งหมด
    }
  }

  ///กำหนดเลือกเพศ
  const genderOptions = [
    { value: "male", label: "ชาย" },
    { value: "female", label: "หญิง" },
    { value: "other", label: "อื่นๆ" },
  ];
  return (
    <div>
      {/* --- Navbar --- */}
      <div className="sticky bg-blue-200/90 backdrop-blur-sm shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* โลโก้/ชื่อแอป */}
            <div
              onClick={() => (window.location.href = "/")}
              className="flex items-center space-x-2 cursor-pointer"
            >
              <Image src={rocket} alt="Logo" className="w-10 h-10 mr-2" />
              <h1 className="text-2xl font-black text-indigo-600 tracking-wide">
                <span className="text-yellow-500">Card</span>{" "}
                <span className="text-red-500">Vocab</span>
              </h1>
            </div>
          </div>
        </div>
      </div>

      {/* --- Registration Page --- */}
      <div className="min-h-screen bg-gradient-to-br from-purple-400 via-pink-300 to-yellow-300 p-4 sm:p-8 flex items-center justify-center font-inter">
        {/* Container หลักที่มีสีสันและเงา */}
        <div className="w-full max-w-lg bg-white p-6 sm:p-10 rounded-3xl  transform transition duration-500 ">
          {/* ส่วนหัวและปุ่มย้อนกลับ */}
          <div className="flex items-center justify-between mb-8">
            <button
              onClick={() => (window.location.href = "/login")}
              className="flex items-center p-2 pr-4 space-x-1 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200 transition duration-150 transform hover:scale-105 text-sm font-semibold"
            >
              <IoArrowBackCircleSharp className="w-6 h-6" />
              <span>ย้อนกลับไปหน้าล็อกอิน</span>
            </button>
            {/* Spacer ให้ตำแหน่งของหัวข้อดูดีขึ้น */}
            <div className="w-1/2"></div>
          </div>

          <h1 className="text-center text-gray-500 mb-8 text-4xl font-bold">
            Create Your Account
            <br />
            <span className="text-sm text-gray-400">
              {" "}
              ลงทะเบียนเพื่อเริ่มต้นใช้งาน Card Vocab
            </span>
          </h1>

          {/* --- Registration Form --- */}
          <form onSubmit={handleUploadAndSave} className="space-y-6">
            {/* Full Name Input */}
            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                ชื่อ-นามสกุล
              </label>
              <div className="relative">
                <CiUser className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="ชื่อเต็มของคุณ"
                  value={fullname}
                  onChange={(e) => setFullname(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-red-300 focus:border-red-500 outline-none transition duration-150 text-gray-700"
                />
              </div>
            </div>

            {/* Email Input */}
            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                อีเมล
              </label>
              <div className="relative">
                <CiMail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  placeholder="กรอกอีเมลของคุณ"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-red-300 focus:border-red-500 outline-none transition duration-150 text-gray-700"
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                รหัสผ่าน
              </label>
              <div className="relative">
                <CiLock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="ตั้งรหัสผ่าน"
                  className="w-full pl-12 pr-12 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-red-300 focus:border-red-500 outline-none transition duration-150 text-gray-700"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-500 hover:text-gray-700 transition duration-150 p-1"
                  aria-label={showPassword ? "ซ่อนรหัสผ่าน" : "แสดงรหัสผ่าน"}
                >
                  {showPassword ? (
                    <FaEyeSlash className="w-5 h-5" />
                  ) : (
                    <FaEye className="w-5 h-5" />
                  )}
                </button>
              </div>
            </div>

            {/* Date of Birth Input */}
            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                วัน/เดือน/ปี เกิด
              </label>
              <div className="relative">
                <SlCalender className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="date"
                  value={birthdate}
                  onChange={(e) => setBirthdate(e.target.value)}
                  // ใช้ Tailwind utility เพื่อให้ placeholder หายไปเมื่อเลือกวันที่แล้ว
                  className={`w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-red-300 focus:border-red-500 outline-none transition duration-150 ${
                    birthdate ? "text-gray-700" : "text-gray-400"
                  }`}
                />
              </div>
            </div>

            {/* Gender Selection (Radio Buttons) */}
            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                เพศ
              </label>
              <div className="flex space-x-6">
                {genderOptions.map((option) => (
                  <label
                    key={option.value}
                    className="inline-flex items-center cursor-pointer"
                  >
                    <input
                      type="radio"
                      name="gender"
                      value={option.value}
                      checked={gender === option.value}
                      onChange={(e) => setGender(e.target.value)}
                      className="form-radio h-5 w-5 text-red-500 transition duration-150 ease-in-out border-gray-300 focus:ring-red-500"
                    />
                    <span className="ml-2 text-gray-700 font-medium">
                      {option.label}
                    </span>
                  </label>
                ))}
              </div>
            </div>
            <div className="mt-1 flex items-center space-x-4">
              <input
                type="file"
                id="userImage"
                className="hidden"
                onChange={handleSelectImagePreview}
                accept="image/*"
              />
              <label
                htmlFor="userImage"
                className="cursor-pointer bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-full transition-colors duration-300"
              >
                เลือกรูปภาพ
              </label>
              {userimagePreviewUrl && (
                <img
                  src={userimagePreviewUrl}
                  alt="preview"
                  className="w-24 h-24 rounded-lg object-cover border-2 border-green-500"
                />
              )}
            </div>

            {/* Register Button */}
            <button
              type="submit"
              className="w-full py-3 bg-red-500 text-white font-extrabold text-lg rounded-xl shadow-lg transition duration-200 hover:bg-red-600 transform hover:scale-[1.01] active:scale-[0.98] focus:outline-none focus:ring-4 focus:ring-red-300 flex items-center justify-center space-x-2"
            >
              <h1>ลงทะเบียน</h1>
            </button>
          </form>

          <div className="text-center text-sm text-gray-500 mt-8">
            มีบัญชีอยู่แล้ว?{" "}
            <Link
              href="/login"
              className="text-red-500 font-semibold hover:underline"
            >
              เข้าสู่ระบบที่นี่
            </Link>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
