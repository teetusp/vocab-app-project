"use client";
import React from "react";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import NavBarUser from "../../../components/NavBarUser";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import Footer from "../../../components/Footer";
import { supabase } from "@/lib/supabaseClient";
import SweetAlert from "sweetalert2";
import { IoIosArrowBack } from "react-icons/io";
import { FaRegEdit } from "react-icons/fa";
type User = {
  id: string;
  fullname: string;
  user_image_url: string;
};

export default function page() {
  const router = useRouter();
  const id = useParams().id;

  const [isEditing, setIsEditing] = useState(false);
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [user, setUser] = useState<User | null>(null);

  const [fullname, setFullname] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [birthdate, setBirthdate] = useState<string>("");
  const [image_flie, setImageFile] = useState<File | null>(null);
  const [preview_file, setPreviewFile] = useState<string | null>(null);
  const [old_image_file, setOldImageFile] = useState<string | null>(null);

  useEffect(() => {
    //ดึงข้อมูลจาก supabase
    async function fetchData() {
      const { data, error } = await supabase
        .from("user_tb")
        .select("*")
        .eq("user_id", id)
        .single();

      if (error) {
        alert("พบข้อผิดพลาดในการดึงข้อมูล กรุณาลองใหม่อีกครั้ง...");
        console.log(error);
        return;
      }

      //เอาข้อมูลที่ดึงมาจาก supabase มาแสดงบนหน้าจอ
      setFullname(data.fullname);
      setEmail(data.email);
      setPassword(data.password);
      setBirthdate(data.birthdate);
      setPreviewFile(data.user_image_url);
    }

    fetchData();
  }, []);

  // ดึงข้อมูลผู้ใช้เแบบ 1-1 จากหน้า dashboard + supabase
  useEffect(() => {
    async function fetchUser() {
      try {
        const userId = localStorage.getItem("user_id");
        if (!userId) {
          console.error("ไม่พบ userId ใน localStorage");
          return;
        }

        // ดึงข้อมูลผู้ใช้จากตาราง user_tb
        const { data, error } = await supabase
          .from("user_tb")
          .select("user_id, fullname, user_image_url")
          .eq("user_id", userId)
          .single();

        if (error) {
          console.error("เกิดข้อผิดพลาดในการดึงข้อมูลผู้ใช้:", error.message);
          return;
        }

        if (data) {
          setUser({
            id: data.user_id,
            fullname: data.fullname,
            user_image_url: data.user_image_url,
          });
        }
      } catch (ex) {
        console.error("เกิดข้อผิดพลาดในการเชื่อมต่อ Supabase:", ex);
      }
    }

    fetchUser();
  }, []);

  //ฟังก์ชันเลือกรูปภาพเพื่อพรีวิวก่อนที่จะอัปโหลด
  function handleSelectImagePreview(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] || null;

    setImageFile(file);

    if (file) {
      setPreviewFile(URL.createObjectURL(file as Blob));
    }
  }

  //ฟังก์ชันอัปโหลดรูปภาพ และบันทึกลงฐานข้อมูลที่ Supabase
  async function handleUploadAndUpdate(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    //ตรวจสอบปีเกิด ไม่ให้มากกว่าปีปัจจุบัน
    const birthYear = new Date(birthdate).getFullYear();
    const currentYear = new Date().getFullYear();

    //ตรวจสอบปีเกิด
    if (birthYear >= currentYear) {
      SweetAlert.fire({
        icon: "warning",
        iconColor: "#E30707",
        title: "ปีเกิดไม่ถูกต้อง",
        text: "กรุณาเลือกปีเกิดที่น้อยกว่าปีปัจจุบัน",
        showConfirmButton: true,
        confirmButtonText: "ตกลง",
        confirmButtonColor: "#3085D6",
      });
      return;
    }
    //สร้างตัวแปรเพื่อเก็บ url ของรูปภาพที่อัปโหลด เพื่อจะเอาไปบันทึกตาราง
    let image_url = preview_file || "";

    //ตรวจสอบว่ามีการเลือกรูปภาพเพื่อที่จะอัปโหลดหรือไม่
    if (image_flie) {
      //ลบรูปภาพเก่าออกใน supabase เพื่ออัปโหลดรูปใหม่
      if (old_image_file != "") {
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

      //กรณีมีการเลือกรูป ก็จะทำการอัปโหลดรูปไปยัง storage ของ supabase
      const new_image_flie_name = `${Date.now()}-${image_flie?.name}`;
      //อัปโหลดรูป
      const { data, error } = await supabase.storage
        .from("user_bk")
        .upload(new_image_flie_name, image_flie);

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
    //---------แก้ไขลงตาราง supabase---------
    const { data, error } = await supabase
      .from("user_tb")
      .update({
        fullname: fullname,
        email: email,
        password: password,
        birthdate: birthdate,
        user_image_url: image_url,
      })
      .eq("user_id", id);

    //ตรวจสอบ
    if (error) {
      alert("พบข้อผิดพลาดในการแก้ไขข้อมูล กรุณาลองใหม่อีกครั้ง");
      console.log(error.message);
      return;
    } else {
      SweetAlert.fire({
        icon: "success",
        title: "แก้ไขข้อมูลเรียบร้อย",
        showConfirmButton: true,
        confirmButtonText: "ตกลง",
        confirmButtonColor: "#3085D6",
      });
      //เคลียร์ข้อมูล
      setFullname("");
      setEmail("");
      setPassword("");
      setBirthdate("");
      setImageFile(null);
      setPreviewFile(null);
      image_url = "";
      //redirect กลับไปหน้า แสดงงานทั้งหมด
      router.push(`/dashboard/${user?.id}`);
    }
  }

  return (
    <div className="relative flex flex-col min-h-screen bg-gradient-to-br from-yellow-100 via-pink-100 to-purple-200 overflow-hidden">
      {/*ลาย background*/}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 w-24 h-24 bg-yellow-300 rounded-full opacity-40 animate-bounce"></div>
        <div className="absolute top-32 right-20 w-32 h-32 bg-pink-400 rounded-full opacity-30 animate-pulse"></div>
        <div className="absolute bottom-20 left-1/4 w-20 h-20 bg-blue-300 rounded-full opacity-50 animate-bounce delay-100"></div>
        <div className="absolute top-1/2 right-10 w-28 h-28 bg-purple-300 rounded-full opacity-40 animate-pulse delay-200"></div>
        <div className="absolute bottom-40 right-1/3 w-24 h-24 bg-green-300 rounded-full opacity-30 animate-bounce delay-300"></div>
      </div>
      <NavBarUser />

      <div className="flex-1 flex flex-col items-center justify-center p-6 md:p-12">
        <div className="w-full max-w-3xl">
          {/* Header */}
          <div className="mt-15 flex items-center justify-between mb-8">
            {/* Back Button */}
            <button
              onClick={() => router.back()} // หรือ handleClickBack()
              className="px-6 py-3 bg-gray-700 text-white font-bold rounded-xl shadow-lg hover:bg-gray-800 transition transform hover:scale-105 text-lg flex items-center"
            >
              <IoIosArrowBack className="mr-2 text-lg" />
              Back
            </button>

            {/* Title */}
            <h1 className="text-4xl font-extrabold text-indigo-600 drop-shadow-sm text-center flex-1 mx-4">
              แก้ไขประวัติส่วนตัว
            </h1>

            {/* Edit Profile Button */}
            {!isEditing && (
              <button
                onClick={() => setIsEditing(true)}
                className="px-6 py-3 bg-gray-700 text-white font-bold rounded-xl shadow-lg hover:bg-gray-800 transition transform hover:scale-105 text-lg flex items-center"
              >
                <FaRegEdit className="mr-2 text-lg" /> Edit Profile
              </button>
            )}
          </div>

          {/* Form Card */}
          <div className="bg-white/90 backdrop-blur-md p-8 md:p-12 rounded-3xl shadow-2xl border border-indigo-300/30 space-y-6">
            <form onSubmit={handleUploadAndUpdate} className="space-y-6">
              {/* Full Name */}
              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  ชื่อ-นามสกุล (Full Name)
                </label>
                <input
                  type="text"
                  value={fullname}
                  onChange={(e) => setFullname(e.target.value)}
                  placeholder="Enter your full name"
                  disabled={!isEditing}
                  className={`w-full px-5 py-3 border rounded-2xl shadow-sm text-lg transition duration-200
                ${
                  isEditing
                    ? "border-gray-300 focus:ring-pink-400 focus:border-pink-400 bg-white"
                    : "bg-gray-100 cursor-not-allowed"
                }`}
                />
              </div>

              {/* Email */}
              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  อีเมล (Email)
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="Enter your email"
                  disabled={!isEditing}
                  className={`w-full px-5 py-3 border rounded-2xl shadow-sm text-lg transition duration-200
                ${
                  isEditing
                    ? "border-gray-300 focus:ring-pink-400 focus:border-pink-400 bg-white"
                    : "bg-gray-100 cursor-not-allowed"
                }`}
                />
              </div>

              {/* Password */}
              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  รหัสผ่าน (Password)
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter new password (optional)"
                    disabled={!isEditing}
                    className={`w-full px-5 py-3 border rounded-2xl shadow-sm text-lg pr-12 transition duration-200
                  ${
                    isEditing
                      ? "border-gray-300 focus:ring-pink-400 focus:border-pink-400 bg-white"
                      : "bg-gray-100 cursor-not-allowed"
                  }`}
                  />
                  {isEditing && (
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600 transition duration-200"
                    >
                      {showPassword ? (
                        <FaEyeSlash className="w-6 h-6" />
                      ) : (
                        <FaEye className="w-6 h-6" />
                      )}
                    </button>
                  )}
                </div>
              </div>

              {/* Birthdate */}
              <div>
                <label className="block text-gray-700 font-semibold mb-2">
                  วันเกิด (Birthdate)
                </label>
                <input
                  type="date"
                  value={birthdate}
                  onChange={(e) => setBirthdate(e.target.value)}
                  disabled={!isEditing}
                  className={`w-full px-5 py-3 border rounded-2xl shadow-sm text-lg transition duration-200
                ${
                  isEditing
                    ? "border-gray-300 focus:ring-pink-400 focus:border-pink-400 bg-white"
                    : "bg-gray-100 cursor-not-allowed"
                }`}
                />
              </div>

              {/* User Image */}
              <label className="block text-gray-700 font-semibold mb-2">
                รูปภาพ (Profile Picture)
              </label>
              <div className="flex items-center space-x-4">
                <input
                  type="file"
                  id="FileInput"
                  className="hidden"
                  onChange={handleSelectImagePreview}
                  accept="image/*"
                  disabled={!isEditing}
                />
                {isEditing && (
                  <label
                    htmlFor="FileInput"
                    className="cursor-pointer bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-6 rounded-full transition duration-300 shadow-md"
                  >
                    เลือกรูปภาพ
                  </label>
                )}
                {preview_file && (
                  <img
                    src={preview_file}
                    alt="preview"
                    className="w-24 h-24 rounded-2xl object-cover border border-gray-200 shadow-sm"
                  />
                )}
              </div>

              {/* Buttons */}
              {isEditing && (
                <div className="flex flex-col md:flex-row justify-center gap-4 mt-6">
                  <button
                    type="button"
                    onClick={() => setIsEditing(false)}
                    className="flex-1 py-3 px-6 rounded-2xl text-lg font-bold text-gray-900 bg-gray-300 hover:bg-gray-400 shadow-md transition transform hover:scale-105"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-3 px-6 rounded-2xl text-lg font-bold text-white bg-gradient-to-r from-green-400 to-green-500 hover:from-green-500 hover:to-green-600 shadow-lg transition transform hover:scale-105"
                  >
                    Save Profile
                  </button>
                </div>
              )}
            </form>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
