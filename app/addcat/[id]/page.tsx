"use client";
import React, { useState, useEffect } from "react";
import NavBarStaff from "@/components/NavBarStaff";
import Footer from "@/components/Footer";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import SweetAlert from "sweetalert2";

type Staff = {
  staff_id: string;
  fullname: string;
  staff_image_url: string;
};


export default function page() {
  const router = useRouter();
  const params = useParams();
  const searchParams = useSearchParams();

  // ดึง staff_id จากทั้ง 2 แหล่ง (path param หรือ query param)
  const staff_id = params?.staff_id || searchParams.get("staff_id") || null;
  const [staff, setStaff] = useState<Staff | null>(null);

  const [category_name, setCategoryName] = useState<string>("");
  const [image_file, setImageFile] = useState<File | null>(null);
  const [preview_file, setPreviewFile] = useState<string | null>(null);
  

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

  // แสดงรูป preview ก่อนอัปโหลด
  function handleSelectImagePreview(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0] || null;
    setImageFile(file);
    if (file) {
      setPreviewFile(URL.createObjectURL(file));
    }
  }

  // ฟังก์ชันอัปโหลดและบันทึกข้อมูล
  async function handleUploadAndSave(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!category_name.trim() || !image_file) {
      SweetAlert.fire({
        icon: "warning",
        iconColor: "#E30707",
        title: "กรุณากรอกข้อมูลให้ครบถ้วน",
        confirmButtonText: "ตกลง",
        confirmButtonColor: "#3085D6",
      });
      return;
    }

    let image_url = "";

    // อัปโหลดรูปไปยัง Supabase Storage
    if (image_file) {
      const new_image_file_name = `${Date.now()}-${image_file.name}`;
      const { error: uploadError } = await supabase.storage
        .from("cat_bk")
        .upload(new_image_file_name, image_file);

      if (uploadError) {
        alert("พบข้อผิดพลาดในการอัปโหลดรูปภาพ กรุณาลองใหม่อีกครั้ง");
        console.error(uploadError.message);
        return;
      }

      // ดึง Public URL ของรูปที่อัปโหลด
      const { data: publicData } = supabase.storage
        .from("cat_bk")
        .getPublicUrl(new_image_file_name);

      image_url = publicData.publicUrl;
    }

    // เพิ่มคำศัพท์ลงตาราง vocab_tb
    const { error: insertError } = await supabase.from("categories_tb").insert([
      {
        category_name: category_name,
        cat_image_url: image_url,
        staff_id: staff?.staff_id,
      },
    ]);

    if (insertError) {
      alert("พบข้อผิดพลาดในการบันทึกข้อมูล กรุณาลองใหม่อีกครั้ง");
      console.error(insertError.message);
      return;
    }

    SweetAlert.fire({
      icon: "success",
      title: "บันทึกข้อมูลเรียบร้อย",
      showConfirmButton: false,
      timer: 1500,
    });

    // เคลียร์ค่าฟอร์ม
    setCategoryName("");
    setImageFile(null);
    setPreviewFile(null);

    router.back();
  }

  return (
    <div className="min-h-screen bg-pink-100">
      <NavBarStaff />

      <div className="p-6 md:p-10">
        <div className="max-w-4xl mx-auto">
          <h1 className="text-4xl font-bold mb-8 text-center bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent drop-shadow-md">
            เพิ่มประเภทคําใหม่
          </h1>

          <div className="bg-white p-6 md:p-10 rounded-3xl shadow-2xl border-4 border-indigo-300/50">
            <form onSubmit={handleUploadAndSave} className="space-y-6">
              {/* คำอังกฤษ */}
              <div>
                <label className="block mb-2 font-medium">ประเภทคำ</label>
                <input
                  type="text"
                  value={category_name}
                  onChange={(e) => setCategoryName(e.target.value)}
                  className="border rounded p-2 w-full"
                  placeholder="เช่น ผลไม้"
                />
              </div>

              {/* รูปภาพ */}
              <div className="flex items-center space-x-4">
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
                    className="w-24 h-24 object-cover "
                  />
                )}
              </div>

              {/* ปุ่ม */}
              <div className="flex justify-between gap-4">
                <button
                  type="button"
                  onClick={() => router.back()}
                  className="w-1/2 py-3 rounded-xl text-lg font-bold text-gray-900 bg-gray-400 hover:bg-gray-500"
                >
                  ยกเลิก
                </button>
                <button
                  type="submit"
                  className="w-1/2 py-3 rounded-xl text-lg font-bold text-gray-900 bg-green-400 hover:bg-green-500"
                >
                  บันทึก
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
