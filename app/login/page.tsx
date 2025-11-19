"use client";

import type React from "react";
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

  async function handleLogin(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    try {
      if (email.trim() == "" || password.trim() == "") {
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
        .select("user_id, email, password")
        .eq("email", email)
        .eq("password", password)
        .single();

      if (error) {
        SweetAlert.fire({
          icon: "error",
          iconColor: "#E30707",
          title: "อีเมลหรือรหัสผ่านไม่ถูกต้อง",
          showConfirmButton: true,
          confirmButtonText: "ตกลง",
          confirmButtonColor: "#3085D6",
        });
        console.log(error.message);
        return;
      }

      if (!data) {
        alert("อีเมลหรือรหัสผ่านไม่ถูกต้อง กรุณาลองใหม่อีกครั้ง");
        console.log("ไม่พบผู้ใช้ที่ตรงกับอีเมลหรือรหัสผ่านที่กรอก");
        return;
      }

      localStorage.setItem("user_id", data.user_id);
      router.push(`/dashboard/${data.user_id}`);
    } catch (ex) {
      console.error("เกิดข้อผิดพลาดในการเข้าสู่ระบบ:", ex);
      alert("เกิดข้อผิดพลาดในการเข้าสู่ระบบ กรุณาลองใหม่อีกครั้ง");
    }
  }

  return (
    <div className="relative min-h-screen">
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div
          className="absolute top-20 left-10 w-16 h-16 bg-yellow-400 rounded-full opacity-60 animate-bounce"
          style={{ animationDelay: "0s", animationDuration: "3s" }}
        ></div>
        <div
          className="absolute top-40 right-20 w-12 h-12 bg-pink-400 rounded-full opacity-60 animate-bounce"
          style={{ animationDelay: "1s", animationDuration: "2.5s" }}
        ></div>
        <div
          className="absolute bottom-40 left-20 w-20 h-20 bg-purple-400 rounded-full opacity-60 animate-bounce"
          style={{ animationDelay: "0.5s", animationDuration: "3.5s" }}
        ></div>
        <div
          className="absolute top-60 left-1/3 w-10 h-10 bg-blue-400 rounded-full opacity-60 animate-bounce"
          style={{ animationDelay: "1.5s", animationDuration: "2s" }}
        ></div>
        <div
          className="absolute bottom-20 right-1/4 w-14 h-14 bg-green-400 rounded-full opacity-60 animate-bounce"
          style={{ animationDelay: "2s", animationDuration: "3s" }}
        ></div>

        {/* Stars */}
        <div
          className="absolute top-32 right-1/3 text-4xl animate-pulse"
          style={{ animationDuration: "2s" }}
        >
          ⭐
        </div>
        <div
          className="absolute bottom-60 left-1/4 text-3xl animate-pulse"
          style={{ animationDuration: "2.5s" }}
        >
          ✨
        </div>
        <div
          className="absolute top-1/2 right-10 text-2xl animate-pulse"
          style={{ animationDuration: "3s" }}
        >
          🌟
        </div>
      </div>

      <div className="sticky top-0 z-50 bg-gradient-to-r from-yellow-400 via-pink-400 to-purple-500 shadow-xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            <div
              onClick={() => router.push("/")}
              className="flex items-center space-x-2 cursor-pointer transform transition-transform hover:scale-110 hover:rotate-3"
            >
              <Image
                src={rocket}
                alt="Logo"
                className="w-12 h-12 drop-shadow-lg animate-pulse"
              />
              <h1 className="text-3xl font-black tracking-wide drop-shadow-md">
                <span className="text-white">Vocab</span>{" "}
                <span className="text-yellow-300">Card</span>
              </h1>
            </div>
          </div>
        </div>
      </div>

      <div className="relative min-h-screen bg-gradient-to-br from-blue-200 via-purple-200 to-pink-200 p-4 sm:p-8 flex items-center justify-center">
        <div className="relative w-full max-w-md bg-gradient-to-br from-white to-blue-50 p-8 sm:p-12 rounded-[2.5rem] shadow-[0_20px_60px_rgba(0,0,0,0.2)] border-4 border-yellow-400 transform transition duration-500 hover:shadow-[0_25px_70px_rgba(0,0,0,0.25)] hover:scale-[1.02] z-10">
          <div
            className="absolute -top-6 -right-6 text-6xl animate-spin"
            style={{ animationDuration: "10s" }}
          >
            🚀
          </div>
          <div
            className="absolute -bottom-6 -left-6 text-5xl animate-bounce"
            style={{ animationDuration: "2s" }}
          >
            🎨
          </div>

          <div className="flex items-center justify-between mb-8">
            <Link
              href="/"
              className="flex items-center px-4 py-2 space-x-2 rounded-full bg-gradient-to-r from-blue-400 to-blue-600 text-white hover:from-blue-500 hover:to-blue-700 transition duration-150 transform hover:scale-110 hover:-rotate-3 text-base font-bold shadow-lg"
              aria-label="ย้อนกลับไปหน้าหลัก"
            >
              <IoArrowBackCircleSharp className="w-7 h-7" />
              <span>Home</span>
            </Link>
          </div>

          <h1 className="text-center mb-10">
            <div className="text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r from-purple-600 via-pink-600 to-red-600 mb-2 animate-pulse">
              ยินดีต้อนรับ!
            </div>
            <span className="text-lg text-gray-600 font-semibold">
              เข้าสู่โลกแห่งการเรียนรู้
            </span>
          </h1>

          {/*<div className="space-y-4 mb-8">
            <button className="w-full py-4 bg-white border-4 border-red-400 rounded-2xl shadow-lg flex items-center justify-center space-x-3 hover:shadow-xl hover:border-red-500 transition duration-150 transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-4 focus:ring-red-300">
              <FcGoogle className="w-7 h-7" />
              <span className="text-gray-800 font-bold text-lg">
                เข้าด้วย Google
              </span>
            </button>

            <button className="w-full py-4 bg-gradient-to-r from-blue-500 to-blue-700 border-4 border-blue-800 rounded-2xl shadow-lg flex items-center justify-center space-x-3 hover:shadow-xl hover:from-blue-600 hover:to-blue-800 transition duration-150 transform hover:scale-105 active:scale-95 focus:outline-none focus:ring-4 focus:ring-blue-300">
              <FaFacebookF className="w-7 h-7 text-white" />
              <span className="text-white font-bold text-lg">
                เข้าด้วย Facebook
              </span>
            </button>
          </div>

          <div className="flex items-center my-8">
            <div className="flex-grow border-t-4 border-purple-300 border-dotted"></div>
            <span className="flex-shrink mx-4 text-purple-600 font-black text-xl">
              หรือ ⭐
            </span>
            <div className="flex-grow border-t-4 border-purple-300 border-dotted"></div>
          </div>*/}

          <form onSubmit={handleLogin} className="space-y-6">
            {/* Email Input */}
            <div>
              <label className="block text-purple-700 font-black mb-3 text-lg flex items-center space-x-2">
                <span>📧</span>
                <span>อีเมลของคุณ</span>
              </label>
              <div className="relative">
                <CiMail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-6 h-6 text-purple-600 font-bold" />
                <input
                  type="email"
                  placeholder="ใส่อีเมลที่นี่"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-14 pr-4 py-4 border-4 border-purple-300 rounded-2xl focus:ring-4 focus:ring-yellow-400 focus:border-yellow-400 outline-none transition duration-150 text-gray-800 font-semibold text-lg shadow-inner"
                />
              </div>
            </div>

            {/* Password Input */}
            <div>
              <label className="block text-purple-700 font-black mb-3 text-lg flex items-center space-x-2">
                <span>🔐</span>
                <span>รหัสผ่าน</span>
              </label>
              <div className="relative">
                <CiLock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-6 h-6 text-purple-600 font-bold" />
                <input
                  type={showPassword ? "text" : "password"}
                  placeholder="ใส่รหัสผ่านที่นี่"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-14 pr-14 py-4 border-4 border-purple-300 rounded-2xl focus:ring-4 focus:ring-yellow-400 focus:border-yellow-400 outline-none transition duration-150 text-gray-800 font-semibold text-lg shadow-inner"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-purple-600 hover:text-purple-800 transition duration-150 p-2 hover:scale-110"
                  aria-label={showPassword ? "ซ่อนรหัสผ่าน" : "แสดงรหัสผ่าน"}
                >
                  {showPassword ? (
                    <FaEyeSlash className="w-6 h-6" />
                  ) : (
                    <FaEye className="w-6 h-6" />
                  )}
                </button>
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-5 bg-gradient-to-r from-green-400 via-emerald-500 to-teal-500 text-white font-black text-2xl rounded-2xl shadow-xl transition duration-200 hover:from-green-500 hover:via-emerald-600 hover:to-teal-600 transform hover:scale-105 hover:-rotate-1 active:scale-95 focus:outline-none focus:ring-4 focus:ring-green-400 border-4 border-green-600"
            >
              เข้าสู่ระบบ 🚀
            </button>
          </form>

          <div className="text-center text-base font-semibold text-gray-600 mt-8">
            <Link
              href="/forgot-password"
              className="text-orange-500 hover:text-orange-600 hover:underline font-bold"
            >
              ลืมรหัสผ่าน? 🤔
            </Link>
            <span className="mx-2">หรือ</span>
            <Link
              href="/register"
              className="text-pink-500 hover:text-pink-600 hover:underline font-bold"
            >
              สมัครสมาชิก ✨
            </Link>
          </div>
          <div className="flex justify-center mt-6">
            <Link
              href="/stafflogin"
              className="text-blue-600 text-base font-bold hover:text-blue-700 hover:underline px-4 py-2 rounded-full bg-blue-100 hover:bg-blue-200 transition transform hover:scale-105"
            >
              👨‍💼 สำหรับเจ้าหน้าที่
            </Link>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
