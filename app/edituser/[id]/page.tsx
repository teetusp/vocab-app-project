"use client";
import React from "react";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import Image from "next/image";
import rocket from "../../../assets/rocket.png";
import { IoIosArrowDropdown } from "react-icons/io";
import { FaEdit } from "react-icons/fa";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import { CiLogout } from "react-icons/ci";
import Footer from "../../../components/Footer";
import { supabase } from "@/lib/supabaseClient";
import SweetAlert from "sweetalert2";
type User = {
  id: string;
  fullname: string;
  user_image_url: string;
};

export default function page() {
  const router = useRouter();
  const id = useParams().id;

  const [isProfileOpen, setIsProfileOpen] = useState(false);
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
        .eq("id", id)
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

  // ดึงข้อมูลผู้ใช้เแบบ 1-1 จากหน้า login + supabase
  useEffect(() => {
    async function fetchUser() {
      try {
        const userId = localStorage.getItem("id");
        if (!userId) {
          console.error("ไม่พบ userId ใน localStorage");
          return;
        }

        // 🔹 ดึงข้อมูลผู้ใช้จากตาราง user_tb
        const { data, error } = await supabase
          .from("user_tb")
          .select("id, fullname, user_image_url")
          .eq("id", userId)
          .single();

        if (error) {
          console.error("เกิดข้อผิดพลาดในการดึงข้อมูลผู้ใช้:", error.message);
          return;
        }

        if (data) {
          setUser(data);
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
        birthdate: new Date().toISOString(),
        user_image_url: image_url,
      })
      .eq("id", id);

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
      setImageFile(null);
      setPreviewFile(null);
      image_url = "";
      //redirect กลับไปหน้า แสดงงานทั้งหมด
      router.push(`/dashboard/${user?.id}`);
    }
  }

  // ฟังก์ชันออกจากระบบ
  async function handleClickSignOut() {
    console.log("ออกกำลังออกจากระบบ...");
    localStorage.removeItem("id");
    console.log("localStorage ลบเรียบร้อย");
    //redirect to home page
    router.push("/");
  }

  const handleClickEditProfile = () => {
    if (user?.id) {
      router.push(`/edituser/${user.id}`);
      console.log("Go to edit user:", user.id);
    } else {
      console.error("ไม่พบ user id");
    }
  };
  return (
    <div className="min-h-screen bg-pink-100">
      {/* ส่วน NavBar */}
      <div className="sticky bg-blue-200/90 backdrop-blur-sm shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-20">
            {/* โลโก้/ชื่อแอป */}
            <div
              onClick={() => window.location.reload()}
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
                  src={user?.user_image_url}
                  width={32}
                  height={32}
                  alt="User profile"
                />
                <span className="hidden md:inline font-medium text-gray-700">
                  {user?.fullname}
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
      {/* ส่วนแก้ไขข้อมูลส่วนตัว */}
      <div className="p-6 md:p-10">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <h1 className="text-4xl font-bold mb-8 text-center bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent drop-shadow-md">
            แก้ไขข้อมูลส่วนตัว
          </h1>
          <div className="bg-white p-6 md:p-10 rounded-3xl shadow-2xl border-4 border-indigo-300/50">
            <form onSubmit={handleUploadAndUpdate} className="space-y-6">
              {/* Full Name  */}
              <div className="mb-6">
                <label className="block">
                  <span className="text-gray-700 font-medium">
                    ชื่อเต็ม (Full Name)
                  </span>
                  <input
                    type="text"
                    value={fullname}
                    onChange={(e) => setFullname(e.target.value)}
                    className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-xl shadow-inner focus:ring-pink-500 focus:border-pink-500 text-lg"
                    placeholder="Enter your full name"
                  />
                </label>
              </div>

              {/* Email */}
              <div className="mb-6">
                <label className="block">
                  <span className="text-gray-700 font-medium">
                    อีเมล (New Email)
                  </span>
                  <input
                    type="text"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-xl shadow-inner focus:ring-pink-500 focus:border-pink-500 text-lg"
                  />
                </label>
              </div>

              {/* Password */}
              <div className="mb-6">
                <label className="block">
                  <span className="text-gray-700 font-medium">
                    รหัสผ่าน (New Password)
                  </span>
                  <div className="relative mt-1">
                    <input
                      type={showPassword ? "text" : "password"} // สลับประเภท input
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="block w-full px-4 py-3 border border-gray-300 rounded-xl shadow-inner focus:ring-pink-500 focus:border-pink-500 text-lg pr-12" // เพิ่ม padding ขวา
                      placeholder="Enter new password (optional)"
                    />
                    {/* ปุ่มสลับการแสดงรหัสผ่าน */}
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400 hover:text-gray-600"
                      aria-label={
                        showPassword ? "Hide password" : "Show password"
                      }
                    >
                      {showPassword ? (
                        <FaEyeSlash className="w-6 h-6" />
                      ) : (
                        <FaEye className="w-6 h-6" />
                      )}
                    </button>
                  </div>
                </label>
              </div>

              {/* Birthdate */}
              <div className="mb-8">
                <label className="block">
                  <span className="text-gray-700 font-medium">
                    วันเกิด (Birthdate)
                  </span>
                  <input
                    type="date"
                    value={birthdate}
                    onChange={(e) => setBirthdate(e.target.value)}
                    className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-xl shadow-inner focus:ring-pink-500 focus:border-pink-500 text-lg"
                  />
                </label>
              </div>

              {/*  User Image */}
              <div className="mt-1 flex items-center space-x-4">
                <input
                  type="file"
                  id="FileInput"
                  className="hidden"
                  onChange={handleSelectImagePreview}
                  accept="image/*"
                />
                <label
                  htmlFor="FileInput"
                  className="cursor-pointer bg-green-500 hover:bg-green-600 text-white font-semibold py-2 px-4 rounded-full transition-colors duration-300"
                >
                  เลือกรูปภาพ
                </label>
                {preview_file && (
                  <img
                    src={preview_file}
                    alt="preview"
                    className="w-24 h-24 rounded-lg object-cover "
                  />
                )}
              </div>

              {/* Submit Button */}
              <div className="flex justify-between items-center space-x-4">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="w-1/2 py-3 px-4 rounded-xl text-lg font-bold text-gray-900 bg-gray-400 hover:bg-gray-500 transition duration-200 shadow-md transform hover:scale-[1.02]"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-3 px-4 rounded-xl text-lg font-bold text-gray-900 bg-green-400 hover:bg-green-500 transition duration-200 shadow-md transform hover:scale-[1.02]"
                >
                  บันทึกการเปลี่ยนแปลง
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}
