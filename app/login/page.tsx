"use client";

import React from "react";
import Link from "next/link";
import { useState } from "react";
import Footer from "../../components/Footer";
import Image from "next/image";
import rocket from "../../assets/rocket.png";
import { useRouter } from "next/navigation";
import { IoArrowBackCircleSharp } from "react-icons/io5";
import { FcGoogle } from "react-icons/fc";
import { FaFacebookF } from "react-icons/fa";
import { CiMail } from "react-icons/ci";
import { CiLock } from "react-icons/ci";
import { FaEye } from "react-icons/fa";
import { FaEyeSlash } from "react-icons/fa";
import { supabase } from "../../lib/supabaseClient";
import SweetAlert from "sweetalert2";
export default function page() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);

  // ฟังก์ชัน Login
  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!email || !password) {
      SweetAlert.fire({
        icon: "warning",
        iconColor: "#E30707",
        title: "กรุณากรอกอีเมลและรหัสผ่านให้ครบถ้วน",
        showConfirmButton: true,
        confirmButtonText: "ตกลง",
        confirmButtonColor: "#3085D6",
      });
      return;
    }

    const { data, error } = await supabase
      .from("user_tb")
      .select("*")
      .eq("email", email)
      .eq("password", password);

    if (error) {
      alert("พบข้อผิดพลาดในการเข้าสู่ระบบ กรุณาลองใหม่อีกครั้ง");
      console.log(error.message);
      return;
    }

    //ตรวจสอบว่าพบผู้ใช้หรือไม่
    if (!data || data.length === 0) {
      SweetAlert.fire({
        icon: "error",
        iconColor: "#E30707",
        title: "อีเมลหรือรหัสผ่านไม่ถูกต้อง",
        showConfirmButton: true,
        confirmButtonText: "ตกลง",
        confirmButtonColor: "#3085D6",
      });
      return;
    }

    router.push("/dashboard");
  }

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
      {/* --- Login Page --- */}
      <div className="min-h-screen bg-gradient-to-br from-yellow-300 via-pink-300 to-purple-400 p-4 sm:p-8 flex items-center justify-center font-inter">
        {/* Container หลักที่มีสีสันและเงา */}
        <div className="w-full max-w-md bg-white p-6 sm:p-10 rounded-3xl shadow-[0_20px_50px_rgba(0,0,0,0.15)] transform transition duration-500 hover:shadow-[0_20px_60px_rgba(0,0,0,0.2)]">
          {/* ส่วนปุ่มย้อนกลับ */}
          <div className="flex items-center justify-between mb-8">
            <Link
              href="/"
              className="flex items-center p-2 pr-4 space-x-1 rounded-full bg-blue-100 text-blue-600 hover:bg-blue-200 transition duration-150 transform hover:scale-105 text-sm font-semibold"
              aria-label="ย้อนกลับไปหน้าหลัก"
            >
              <IoArrowBackCircleSharp className="w-6 h-6" />
              <span>ย้อนกลับไปหน้าหลัก</span>
            </Link>
            <div className="w-10"></div>
          </div>

          <h1 className="text-center text-gray-500 mb-8 text-4xl font-bold">
            Welcome Back
            <br />
            <span className="text-sm text-gray-400">
              {" "}
              Sign in to your account{" "}
            </span>
          </h1>

          {/* --- Social Sign-in Options --- */}
          <div className="space-y-4 mb-8">
            <button className="w-full py-3 bg-white border-2 border-gray-300 rounded-xl shadow-sm flex items-center justify-center space-x-3 hover:shadow-md transition duration-150 transform hover:scale-[1.01] active:scale-[0.98] focus:outline-none focus:ring-4 focus:ring-blue-200">
              <FcGoogle className="w-6 h-6 font-bold" />
              <span className="text-gray-700 font-medium">
                เข้าสู่ระบบด้วย Google
              </span>
            </button>

            <button className="w-full py-3 bg-blue-600 border-2 border-gray-300 rounded-xl shadow-sm flex items-center justify-center space-x-3 hover:shadow-md transition duration-150 transform hover:scale-[1.01] active:scale-[0.98] focus:outline-none focus:ring-4 focus:ring-blue-200">
              <FaFacebookF className="w-6 h-6 font-bold text-white" />
              <span className="text-white">เข้าสู่ระบบด้วย Facebook</span>
            </button>
          </div>

          {/* ตัวแบ่ง (Divider) */}
          <div className="flex items-center my-6">
            <div className="flex-grow border-t border-gray-300"></div>
            <span className="flex-shrink mx-4 text-gray-500 font-medium">
              หรือ
            </span>
            <div className="flex-grow border-t border-gray-300"></div>
          </div>

          {/* --- Email and Password Form --- */}
          <form onSubmit={handleLogin} className="space-y-6">
            {/* Email Input */}
            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                อีเมล
              </label>
              <div className="relative">
                <CiMail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-800 font-bold" />
                <input
                  type="email"
                  placeholder="กรอกอีเมลของคุณ"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-green-300 focus:border-green-500 outline-none transition duration-150 text-gray-700"
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-gray-700 font-semibold mb-2">
                รหัสผ่าน
              </label>
              <div className="relative">
                <CiLock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-800 font-bold" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="กรอกรหัสผ่านของคุณ"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-12 pr-12 py-3 border-2 border-gray-200 rounded-xl focus:ring-4 focus:ring-green-300 focus:border-green-500 outline-none transition duration-150 text-gray-700"
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

            {/* Login Button */}
            <button
              type="submit"
              className="w-full py-3 bg-green-500 text-white font-extrabold text-lg rounded-xl shadow-lg transition duration-200 hover:bg-green-600 transform hover:scale-[1.01] active:scale-[0.98] focus:outline-none focus:ring-4 focus:ring-green-300"
            >
              เข้าสู่ระบบ
            </button>
          </form>

          <div className="text-center text-sm text-gray-500 mt-8">
            <Link
              href="/forgot-password"
              className="text-green-500 hover:text-green-600 font-medium"
            >
              ลืมรหัสผ่าน?{" "}
            </Link>
            หรือ{" "}
            <Link
              href="/register"
              className="text-green-500 hover:text-green-600 font-medium"
            >
              สมัครสมาชิกใหม่
            </Link>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
