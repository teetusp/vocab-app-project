"use client";
import React from "react";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { FaEye, FaEyeSlash } from "react-icons/fa";
import Footer from "../../../components/Footer";
import { supabase } from "@/lib/supabaseClient";
import SweetAlert from "sweetalert2";
import NavBarStaff from "@/components/NavBarStaff";

type Staff = {
  id: string;
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
  const id = useParams().id;

  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [user, setUser] = useState<Staff | null>(null);

  const [fullname, setFullname] = useState<string>("");
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [birthdate, setBirthdate] = useState<string>("");
  const [phonenumber, setPhonenumber] = useState<string>("");
  const [image_file, setImageFile] = useState<File | null>(null);
  const [preview_file, setPreviewFile] = useState<string | null>(null);
  const [old_image_file, setOldImageFile] = useState<string | null>(null);

  useEffect(() => {
    //ดึงข้อมูลจาก supabase
    async function fetchData() {
      const { data, error } = await supabase
        .from("staff_tb")
        .select("*")
        .eq("staff_id", id)
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
      setPhonenumber(data.phonenumber);
      setPreviewFile(data.staff_image_url);
    }

    fetchData();
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
    if (image_file) {
      //ลบรูปภาพเก่าออกใน supabase เพื่ออัปโหลดรูปใหม่
      if (old_image_file != "") {
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

      //กรณีมีการเลือกรูป ก็จะทำการอัปโหลดรูปไปยัง storage ของ supabase
      const new_image_file_name = `${Date.now()}-${image_file?.name}`;
      //อัปโหลดรูป
      const { data, error } = await supabase.storage
        .from("staff_bk")
        .upload(new_image_file_name, image_file);

      if (error) {
        alert("พบข้อผิดพลาดในการอัปโหลดรูปภาพ กรุณาลองใหม่อีกครั้ง");
        console.log(error.message);
        return;
      } else {
        // get url ของรูปที่
        const { data } = supabase.storage
          .from("staff_bk")
          .getPublicUrl(new_image_file_name);
        image_url = data.publicUrl;
      }
    }
    //---------แก้ไขลงตาราง supabase---------
    const { data, error } = await supabase
      .from("staff_tb")
      .update({
        fullname: fullname,
        email: email,
        password: password,
        birthdate: birthdate,
        phonenumber: phonenumber,
        user_image_url: image_url,
      })
      .eq("staff_id", id);

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
      setPhonenumber("");
      setImageFile(null);
      setPreviewFile(null);
      image_url = "";
      //redirect กลับไปหน้า แสดงงานทั้งหมด
      router.push(`/staffdashboard/${user?.id}`);
    }
  }

  return (
    <div className="min-h-screen bg-pink-100">
      {/* ส่วน NavBar */}
      <NavBarStaff />
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
                    ชื่อ-นามสกุล (Full Name)
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
                      placeholder="Enter new password"
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

              {/* Phonenumber */}
              <div className="mb-6">
                <label className="block">
                  <span className="text-gray-700 font-medium">
                    หมายเลขโทรศัพท์ (Phone Number)
                  </span>
                  <input
                    type="text"
                    value={email}
                    onChange={(e) => setPhonenumber(e.target.value)}
                    className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-xl shadow-inner focus:ring-pink-500 focus:border-pink-500 text-lg"
                  />
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
      <Footer />
    </div>
  );
}
