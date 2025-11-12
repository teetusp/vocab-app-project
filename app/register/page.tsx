"use client"
import type React from "react"
import { useState, useEffect } from "react"
import Link from "next/link"
import Footer from "../../components/Footer"
import Image from "next/image"
import rocket from "../../assets/rocket.png"
import SweetAlert from "sweetalert2"
import { useRouter } from "next/navigation"
import { IoArrowBackCircleSharp } from "react-icons/io5"
import { CiUser } from "react-icons/ci"
import { CiMail } from "react-icons/ci"
import { CiLock } from "react-icons/ci"
import { FaEye } from "react-icons/fa"
import { FaEyeSlash } from "react-icons/fa"
import { SlCalender } from "react-icons/sl"
import { supabase } from "./../../lib/supabaseClient"

export default function page() {
  const router = useRouter()

  const [fullname, setFullname] = useState<string>("")
  const [email, setEmail] = useState<string>("")
  const [password, setPassword] = useState<string>("")
  const [birthdate, setBirthdate] = useState<string>("")
  const [showPassword, setShowPassword] = useState<boolean>(false)
  const [gender, setGender] = useState<string>("male")

  const [user_image_file, setUserImageFile] = useState<File | null>(null)
  const [userimagePreviewUrl, setUserImagePreview] = useState<string | null>(null)

  useEffect(() => {
    const { data } = supabase.storage.from("user_bk").getPublicUrl("user.png")
    setUserImagePreview(data.publicUrl)
  }, [])

  function handleSelectImagePreview(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] || null
    setUserImageFile(file)

    if (file) {
      setUserImagePreview(URL.createObjectURL(file as Blob))
    }
  }

  async function handleUploadAndSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()

    // ตรวจสอบว่ากรอกข้อมูลครบถ้วนหรือไม่
    if (fullname.trim() == "" || email.trim() == "" || password.trim() == "" || birthdate == "") {
      SweetAlert.fire({
        icon: "warning",
        iconColor: "#E30707",
        title: "กรุณากรอกข้อมูลให้ครบถ้วน",
        showConfirmButton: true,
        confirmButtonText: "ตกลง",
        confirmButtonColor: "#3085D6",
      })
      return
    }

    // ตรวจสอบปีเกิดว่าไม่มากกว่าปีปัจจุบัน
    const birthYear = new Date(birthdate).getFullYear()
    const currentYear = new Date().getFullYear()

    if (birthYear >= currentYear) {
      SweetAlert.fire({
        icon: "warning",
        iconColor: "#E30707",
        title: "ปีเกิดไม่ถูกต้อง",
        text: "กรุณาเลือกปีเกิดที่น้อยกว่าปีปัจจุบัน",
        showConfirmButton: true,
        confirmButtonText: "ตกลง",
        confirmButtonColor: "#3085D6",
      })
      return
    }

    // แสดงข้อความกำลังโหลด
    SweetAlert.fire({
      icon: "success",
      title: "กำลังอัปโหลดข้อมูล...",
      showConfirmButton: false,
      timer: 1500,
    })

    let image_url = ""

    // ตรวจสอบว่ามีการเลือกรูปภาพหรือไม่
    if (user_image_file) {
      const new_image_file_name = `${Date.now()}-${user_image_file?.name}`

      // อัปโหลดรูปภาพไปยัง Supabase Storage
      const { data, error } = await supabase.storage.from("user_bk").upload(new_image_file_name, user_image_file)

      if (error) {
        alert("พบข้อผิดพลาดในการอัปโหลดรูปภาพ กรุณาลองใหม่อีกครั้ง")
        console.log(error.message)
        return
      } else {
        // ดึง URL ของรูปภาพที่อัปโหลดสำเร็จ
        const { data } = supabase.storage.from("user_bk").getPublicUrl(new_image_file_name)
        image_url = data.publicUrl
      }
    } else if (!image_url) {
      // ถ้าไม่ได้เลือกรูป ให้ใช้รูปเริ่มต้น user.png
      const { data: defaultImg } = supabase.storage.from("user_bk").getPublicUrl("user.png")

      image_url = defaultImg.publicUrl
    }

    // บันทึกข้อมูลลงในตาราง user_tb ของ Supabase
    const { data, error } = await supabase.from("user_tb").insert({
      fullname: fullname,
      email: email,
      password: password,
      birthdate: birthdate,
      gender: gender,
      user_image_url: image_url,
    })

    // ตรวจสอบผลลัพธ์การบันทึก
    if (error) {
      alert("พบข้อผิดพลาดในการบันทึกข้อมูล กรุณาลองใหม่อีกครั้ง")
      console.log(error.message)
      return
    } else {
      SweetAlert.fire({
        icon: "success",
        title: "สมัครสมาชิกสำเร็จ",
        showConfirmButton: true,
        confirmButtonText: "ตกลง",
        confirmButtonColor: "#3085D6",
      })

      // เคลียร์ข้อมูลในฟอร์มหลังจากสมัครสำเร็จ
      setFullname("")
      setEmail("")
      setPassword("")
      setBirthdate("")
      setGender("")
      setUserImageFile(null)
      setUserImagePreview(null)
      image_url = ""

      // เปลี่ยนหน้าไปยังหน้า login
      router.push("/login")
    }
  }

  const genderOptions = [
    { value: "male", label: "ชาย" },
    { value: "female", label: "หญิง" },
    { value: "other", label: "อื่นๆ" },
  ]

  return (
    <div className="relative overflow-hidden">
      <div
        className="floating-circle"
        style={{
          top: "5%",
          left: "5%",
          width: "80px",
          height: "80px",
          background: "linear-gradient(135deg, #FCD34D, #F59E0B)",
          animationDelay: "0s",
        }}
      ></div>
      <div
        className="floating-circle"
        style={{
          top: "15%",
          right: "8%",
          width: "60px",
          height: "60px",
          background: "linear-gradient(135deg, #F472B6, #EC4899)",
          animationDelay: "1s",
        }}
      ></div>
      <div
        className="floating-circle"
        style={{
          top: "40%",
          left: "3%",
          width: "100px",
          height: "100px",
          background: "linear-gradient(135deg, #A78BFA, #8B5CF6)",
          animationDelay: "2s",
        }}
      ></div>
      <div
        className="floating-circle"
        style={{
          top: "70%",
          right: "5%",
          width: "70px",
          height: "70px",
          background: "linear-gradient(135deg, #60A5FA, #3B82F6)",
          animationDelay: "1.5s",
        }}
      ></div>
      <div
        className="floating-circle"
        style={{
          top: "85%",
          left: "10%",
          width: "90px",
          height: "90px",
          background: "linear-gradient(135deg, #34D399, #10B981)",
          animationDelay: "0.5s",
        }}
      ></div>

      <div className="sticky top-0 z-50 bg-gradient-to-r from-yellow-400 via-pink-400 to-purple-500 shadow-2xl">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* โลโก้/ชื่อแอป */}
            <div
              onClick={() => (window.location.href = "/")}
              className="flex items-center space-x-2 cursor-pointer transform transition-all duration-300 hover:scale-110 hover:rotate-3"
            >
              <Image src={rocket} alt="Logo" className="w-12 h-12 mr-2 animate-bounce" />
              <h1 className="text-3xl font-black tracking-wide">
                <span className="text-yellow-100 drop-shadow-lg">Card</span>{" "}
                <span className="text-white drop-shadow-lg">Vocab</span>
              </h1>
            </div>
          </div>
        </div>
      </div>

      {/* ฟอร์มสมัครสมาชิก */}
      {/* พื้นหลัง มี emoji */}
      <div className="min-h-screen bg-gradient-to-br from-yellow-200 via-pink-300 to-purple-400 p-4 sm:p-8 flex items-center justify-center relative">
        <div className="absolute top-10 left-10 text-5xl animate-pulse">⭐</div>
        <div className="absolute top-20 right-20 text-4xl animate-bounce">🎨</div>
        <div className="absolute bottom-20 left-20 text-5xl animate-spin-slow">✨</div>
        <div className="absolute bottom-10 right-10 text-4xl animate-pulse">🚀</div>

        <div className="w-full max-w-lg bg-gradient-to-br from-white to-pink-50 p-6 sm:p-10 rounded-3xl shadow-2xl transform transition duration-500 border-8 border-yellow-300 relative z-10">
          <div className="flex items-center justify-between mb-8">
            <button
              onClick={() => (window.location.href = "/login")}
              className="flex items-center p-3 pr-5 space-x-2 rounded-full bg-gradient-to-r from-blue-400 to-cyan-400 text-white hover:from-blue-500 hover:to-cyan-500 transition duration-300 transform hover:scale-110 hover:-rotate-3 text-base font-bold shadow-lg"
            >
              <IoArrowBackCircleSharp className="w-7 h-7" />
              <span>กลับไปหน้า Login</span>
            </button>
          </div>

          <h1 className="text-center mb-8 text-5xl font-black bg-gradient-to-r from-purple-600 via-pink-500 to-yellow-500 bg-clip-text text-transparent drop-shadow-md">
            สมัครสมาชิก
            <br />
            <span className="text-lg text-gray-600 font-semibold">ลงทะเบียนเพื่อเริ่มต้นใช้งาน Card Vocab 🎉</span>
          </h1>

          <form onSubmit={handleUploadAndSave} className="space-y-6">
            {/* ช่องกรอกชื่อ-นามสกุล */}
            <div>
              <label className="block text-gray-800 font-bold mb-2 text-lg flex items-center space-x-2">
                <span>👤</span>
                <span>ชื่อ-นามสกุล</span>
              </label>
              <div className="relative">
                <CiUser className="absolute left-4 top-1/2 transform -translate-y-1/2 w-6 h-6 text-purple-500" />
                <input
                  type="text"
                  placeholder="ชื่อเต็มของคุณ"
                  value={fullname}
                  onChange={(e) => setFullname(e.target.value)}
                  className="w-full pl-14 pr-4 py-4 border-4 border-purple-300 rounded-2xl focus:ring-4 focus:ring-yellow-400 focus:border-yellow-400 outline-none transition duration-200 text-gray-800 font-semibold text-lg bg-white"
                />
              </div>
            </div>

            {/* ช่องกรอกอีเมล */}
            <div>
              <label className="block text-gray-800 font-bold mb-2 text-lg flex items-center space-x-2">
                <span>📧</span>
                <span>อีเมล</span>
              </label>
              <div className="relative">
                <CiMail className="absolute left-4 top-1/2 transform -translate-y-1/2 w-6 h-6 text-pink-500" />
                <input
                  type="email"
                  placeholder="กรอกอีเมลของคุณ"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-14 pr-4 py-4 border-4 border-pink-300 rounded-2xl focus:ring-4 focus:ring-yellow-400 focus:border-yellow-400 outline-none transition duration-200 text-gray-800 font-semibold text-lg bg-white"
                />
              </div>
            </div>

            {/* ช่องกรอกรหัสผ่าน */}
            <div>
              <label className="block text-gray-800 font-bold mb-2 text-lg flex items-center space-x-2">
                <span>🔒</span>
                <span>รหัสผ่าน</span>
              </label>
              <div className="relative">
                <CiLock className="absolute left-4 top-1/2 transform -translate-y-1/2 w-6 h-6 text-blue-500" />
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="ตั้งรหัสผ่าน"
                  className="w-full pl-14 pr-14 py-4 border-4 border-blue-300 rounded-2xl focus:ring-4 focus:ring-yellow-400 focus:border-yellow-400 outline-none transition duration-200 text-gray-800 font-semibold text-lg bg-white"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-4 top-1/2 transform -translate-y-1/2 text-gray-600 hover:text-gray-800 transition duration-200 p-2 hover:scale-110"
                  aria-label={showPassword ? "ซ่อนรหัสผ่าน" : "แสดงรหัสผ่าน"}
                >
                  {showPassword ? <FaEyeSlash className="w-6 h-6" /> : <FaEye className="w-6 h-6" />}
                </button>
              </div>
            </div>

            {/* ช่องกรอกวันเกิด */}
            <div>
              <label className="block text-gray-800 font-bold mb-2 text-lg flex items-center space-x-2">
                <span>🎂</span>
                <span>วันเกิดของคุณ</span>
              </label>
              <div className="relative">
                <SlCalender className="absolute left-4 top-1/2 transform -translate-y-1/2 w-6 h-6 text-green-500" />
                <input
                  type="date"
                  value={birthdate}
                  placeholder="เลือก"
                  onChange={(e) => setBirthdate(e.target.value)}
                  className={`w-full pl-14 pr-4 py-4 border-4 border-green-300 rounded-2xl focus:ring-4 focus:ring-yellow-400 focus:border-yellow-400 outline-none transition duration-200 font-semibold text-lg bg-white ${
                    birthdate ? "text-gray-800" : "text-gray-400"
                  }`}
                />
              </div>
            </div>

            {/* เลือกเพศ */}
            <div>
              <label className="block text-gray-800 font-bold mb-3 text-lg flex items-center space-x-2">
                <span>👥</span>
                <span>เพศของคุณ</span>
              </label>
              <div className="flex space-x-6">
                {genderOptions.map((option) => (
                  <label key={option.value} className="inline-flex items-center cursor-pointer">
                    <input
                      type="radio"
                      name="gender"
                      value={option.value}
                      checked={gender === option.value}
                      onChange={(e) => setGender(e.target.value)}
                      className="form-radio h-6 w-6 text-pink-500 transition duration-150 ease-in-out border-gray-400 focus:ring-pink-500"
                    />
                    <span className="ml-3 text-gray-800 font-bold text-lg">{option.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* อัปโหลดรูปภาพ */}
            <div className="mt-2">
              <label className="block text-gray-800 font-bold mb-3 text-lg flex items-center space-x-2">
                <span>📸</span>
                <span>รูปโปรไฟล์</span>
              </label>
              <div className="flex items-center space-x-4">
                <input
                  type="file"
                  id="userImage"
                  className="hidden"
                  onChange={handleSelectImagePreview}
                  accept="image/*"
                />
                <label
                  htmlFor="userImage"
                  className="cursor-pointer bg-gradient-to-r from-green-400 to-emerald-500 hover:from-green-500 hover:to-emerald-600 text-white font-bold py-3 px-6 rounded-full transition-all duration-300 shadow-lg transform hover:scale-110 hover:rotate-2 text-lg"
                >
                  เลือกรูปภาพ 🖼️
                </label>
                {userimagePreviewUrl && (
                  <img
                    src={userimagePreviewUrl}
                    alt="preview"
                    className="w-28 h-28 rounded-2xl object-cover border-4 border-yellow-400 shadow-lg"
                  />
                )}
              </div>
            </div>

            {/* ปุ่มลงทะเบียน */}
            <button
              type="submit"
              className="w-full py-5 bg-gradient-to-r from-pink-500 via-red-500 to-yellow-500 text-white font-black text-2xl rounded-2xl shadow-2xl transition duration-300 hover:from-pink-600 hover:via-red-600 hover:to-yellow-600 transform hover:scale-105 hover:rotate-1 active:scale-95 focus:outline-none focus:ring-4 focus:ring-yellow-400 flex items-center justify-center space-x-3 border-4 border-white"
            >
              <span>ลงทะเบียนเลย!</span>
              <span className="text-3xl">🚀</span>
            </button>
          </form>

          {/* ลิงก์ไปหน้า login */}
          <div className="text-center text-lg text-gray-700 mt-8 font-semibold">
            มีบัญชีอยู่แล้ว?{" "}
            <Link
              href="/login"
              className="text-purple-600 font-black hover:underline text-xl hover:text-pink-600 transition duration-200"
            >
              เข้าสู่ระบบที่นี่ 👉
            </Link>
          </div>
        </div>
      </div>
      <Footer />

      <style jsx>{`
        .floating-circle {
          position: absolute;
          border-radius: 50%;
          opacity: 0.6;
          animation: float 6s ease-in-out infinite;
          z-index: 1;
        }
        
        @keyframes float {
          0%, 100% {
            transform: translateY(0) scale(1);
          }
          50% {
            transform: translateY(-30px) scale(1.1);
          }
        }
        
        @keyframes spin-slow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }
        
        .animate-spin-slow {
          animation: spin-slow 10s linear infinite;
        }
      `}</style>
    </div>
  )
}
