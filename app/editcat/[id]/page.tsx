"use client";
import React, { useState, useEffect } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import NavBarStaff from "@/components/NavBarStaff";
import Footer from "@/components/Footer";
import { BiCategoryAlt } from "react-icons/bi";

type Staff = {
  staff_id: string;
  fullname: string;
  staff_image_url: string;
};

export default function page() {
  const router = useRouter();
  const cat_id = useParams().id;
  const searchParams = useSearchParams();
  const staff_id = searchParams.get("staff_id");
  const [staff, setStaff] = useState<Staff | null>(null);

  const [category_name, setCategoryName] = useState<string>("");
  const [image_file, setImageFile] = useState<File | null>(null);
  const [preview_file, setPreviewFile] = useState<string | null>(null);
  const [old_image_file, setOldImageFile] = useState<string | null>(null);

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

  //ดึงข้อมูลจาก supabase มาแสดงหน้าจอตาม id ที่ได้มาจาก url
  useEffect(() => {
    //ดึงข้อมูลจาก supabase
    async function fetchData() {
      const { data, error } = await supabase
        .from("categories_tb")
        .select("*")
        .eq("cat_id", cat_id)
        .single();

      if (error) {
        alert("พบข้อผิดพลาดในการดึงข้อมูล กรุณาลองใหม่อีกครั้ง...");
        console.log(error);
        return;
      }
      //เอาข้อมูลที่ดึงมาจาก supabase มาแสดงบนหน้าจอ
      setCategoryName(data.category_name);
      setPreviewFile(data.cat_image_url);
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
    //สร้างตัวแปรเพื่อเก็บ url ของรูปภาพที่อัปโหลด เพื่อจะเอาไปบันทึกตาราง
    let image_url = preview_file || "";

    //ตรวจสอบว่ามีการเลือกรูปภาพเพื่อที่จะอัปโหลดหรือไม่
    if (image_file) {
      //ลบรูปภาพเก่าออกใน supabase เพื่ออัปโหลดรูปใหม่
      if (old_image_file != "") {
        //เอาเฉพาะชื่อของรูปภาพจาก image_url
        const image_name = image_url.split("/").pop() as string;
        const { data, error } = await supabase.storage
          .from("cat_bk")
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
        .from("cat_bk")
        .upload(new_image_file_name, image_file);

      if (error) {
        alert("พบข้อผิดพลาดในการอัปโหลดรูปภาพ กรุณาลองใหม่อีกครั้ง");
        console.log(error.message);
        return;
      } else {
        // get url ของรูปที่
        const { data } = supabase.storage
          .from("cat_bk")
          .getPublicUrl(new_image_file_name);
        image_url = data.publicUrl;
      }
    }

    //---------แก้ไขลงตาราง supabase---------
    const { data, error } = await supabase
      .from("categories_tb")
      .update({
        category_name: category_name,
        cat_image_url: image_url,
        staff_id: staff?.staff_id,
      })
      .eq("cat_id", cat_id);

    //ตรวจสอบ
    if (error) {
      alert("พบข้อผิดพลาดในการแก้ไขข้อมูล กรุณาลองใหม่อีกครั้ง");
      console.log(error.message);
      return;
    } else {
      alert("บันทึกข้อมูลเรียบร้อย");
      //เคลียร์ข้อมูล
      setCategoryName("");
      setImageFile(null);
      setPreviewFile(null);
      image_url = "";
      //redirect กลับไปหน้า แสดงงานทั้งหมด
      router.push(`/showallvocab/${staff_id}`);
    }
  }

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">
      <NavBarStaff />
      {/* ขยายเต็มพื้นที่ว่างใน flex container โดยใช้ flex-grow */}
      <div className="flex-grow p-6 md:p-10 max-w-6xl mx-auto w-full">
        
          <div className="max-w-7xl mx-auto">
            <h1 className="text-4xl font-bold mb-8 text-center bg-gradient-to-r from-purple-500 to-pink-500 bg-clip-text text-transparent drop-shadow-md">
              แก้ไขประเภทคำ
            </h1>

            <div className="bg-white p-6 md:p-10 rounded-3xl shadow-2xl border-4 border-indigo-300/50">
              <form onSubmit={handleUploadAndUpdate} className="space-y-6">
                {/* คำอังกฤษ */}
                <div>
                  <label className="block mb-2 font-medium">ประเภทคำ *</label>
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
                    เลือกรูปภาพ *
                  </label>
                  {preview_file && (
                    <img
                      src={preview_file}
                      alt="preview"
                      className="w-24 h-24 rounded-lg object-cover"
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
