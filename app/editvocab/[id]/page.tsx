"use client";
import React, { useState, useEffect } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import NavBarStaff from "@/components/NavBarStaff";
import Footer from "@/components/Footer";
import SweetAlert from "sweetalert2";

type Staff = {
  staff_id: string;
  fullname: string;
  staff_image_url: string;
};
type Categories = {
  cat_id: number;
  category_name: string;
};
export default function page() {
  const router = useRouter();
  const vocab_id = useParams().id;
  const searchParams = useSearchParams();
  const staff_id = searchParams.get("staff_id");

  const [staff, setStaff] = useState<Staff | null>(null);

  const [categories, setCategories] = useState<Categories[]>([]);
  const [selectedCategoryId, setSelectedCategoryId] = useState<number | null>(
    null
  );

  const [english, setEnglish] = useState<string>("");
  const [thai, setThai] = useState<string>("");
  const [spelling, setSpelling] = useState<string>("");
  const [image_file, setImageFile] = useState<File | null>(null);
  const [preview_file, setPreviewFile] = useState<string | null>(null);
  const [old_image_file, setOldImageFile] = useState<string | null>(null);

  // ดึงข้อมูลผู้พนักงานเแบบ 1-1 จากหน้า login + supabase
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
    async function fetchData() {
      const { data, error } = await supabase
        .from("vocab_tb")
        .select("vocab_id, english, spelling, thai, vocab_image_url, cat_id")
        .eq("vocab_id", vocab_id)
        .single();

      if (error) {
        alert("พบข้อผิดพลาดในการดึงข้อมูล กรุณาลองใหม่อีกครั้ง...");
        console.log(error);
        return;
      }

      setEnglish(data.english);
      setSpelling(data.spelling);
      setThai(data.thai);
      setSelectedCategoryId(data.cat_id);
      setPreviewFile(data.vocab_image_url);
    }

    fetchData();
  }, []);

  useEffect(() => {
    async function fetchCategories() {
      const { data, error } = await supabase
        .from("categories_tb")
        .select("cat_id, category_name")
        .order("category_name");

      if (error) {
        console.error("เกิดข้อผิดพลาดในการดึงข้อมูลหมวดหมู่:", error.message);
        return;
      }

      if (data) {
        setCategories(data);
        console.log("categories:", data);
      }
    }

    fetchCategories();
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

    if (!english.trim() || !thai.trim() || !spelling.trim() || !image_file) {
      SweetAlert.fire({
        icon: "warning",
        iconColor: "#E30707",
        title: "กรุณากรอกข้อมูลให้ครบถ้วน",
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
          .from("vocab_bk")
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
        .from("vocab_bk")
        .upload(new_image_file_name, image_file);

      if (error) {
        alert("พบข้อผิดพลาดในการอัปโหลดรูปภาพ กรุณาลองใหม่อีกครั้ง");
        console.log(error.message);
        return;
      } else {
        // get url ของรูปที่
        const { data } = supabase.storage
          .from("vocab_bk")
          .getPublicUrl(new_image_file_name);
        image_url = data.publicUrl;
      }
    }

    //---------แก้ไขลงตาราง supabase---------
    const { data, error } = await supabase
      .from("vocab_tb")
      .update({
        english: english,
        spelling: spelling,
        thai: thai,
        vocab_image_url: image_url,
        staff_id: staff?.staff_id,
      })
      .eq("vocab_id", vocab_id);

    //ตรวจสอบ
    if (error) {
      alert("พบข้อผิดพลาดในการแก้ไขข้อมูล กรุณาลองใหม่อีกครั้ง");
      console.log(error.message);
      return;
    } else {
      alert("บันทึกข้อมูลเรียบร้อย");
      //เคลียร์ข้อมูล
      setEnglish("");
      setSpelling("");
      setThai("");
      setImageFile(null);
      setPreviewFile(null);
      image_url = "";
      //redirect กลับไปหน้า แสดงงานทั้งหมด
      router.push(`/showallvocab/${staff_id}`);
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
            แก้ไขข้อมูลคำศัพท์
          </h1>
          <div className="bg-white p-6 md:p-10 rounded-3xl shadow-2xl border-4 border-indigo-300/50">
            <form onSubmit={handleUploadAndUpdate} className="space-y-6">
              {/* ชื่อ  */}
              <div className="mb-6">
                <label className="block">
                  <span className="text-gray-700 font-medium">ชื่ออังกฤษ</span>
                  <input
                    type="text"
                    value={english}
                    onChange={(e) => setEnglish(e.target.value)}
                    className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-xl shadow-inner focus:ring-pink-500 focus:border-pink-500 text-lg"
                    placeholder="Enter your full name"
                  />
                </label>
              </div>

              {/* คําอ่าน */}
              <div className="mb-6">
                <label className="block">
                  <span className="text-gray-700 font-medium">คำอ่าน</span>
                  <input
                    type="text"
                    value={spelling}
                    onChange={(e) => setSpelling(e.target.value)}
                    className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-xl shadow-inner focus:ring-pink-500 focus:border-pink-500 text-lg"
                  />
                </label>
              </div>

              {/* ชื่อไทย */}
              <div className="mb-6">
                <label className="block">
                  <span className="text-gray-700 font-medium">ชื่อไทย</span>
                  <div className="relative mt-1">
                    <input
                      type="te" // สลับประเภท input
                      value={thai}
                      onChange={(e) => setThai(e.target.value)}
                      className="mt-1 block w-full px-4 py-3 border border-gray-300 rounded-xl shadow-inner focus:ring-pink-500 focus:border-pink-500 text-lg"
                    />
                  </div>
                </label>
              </div>

              {/* ประเภทคำ */}
              <div>
                <label className="block mb-2 font-medium">ประเภทคำ</label>
                <select
                  value={
                    selectedCategoryId ? selectedCategoryId.toString() : ""
                  }
                  onChange={(e) =>
                    setSelectedCategoryId(
                      e.target.value ? Number(e.target.value) : null
                    )
                  }
                  className="border rounded p-2 w-full"
                >
                  <option value="">-- เลือกประเภทคำ --</option>
                  {categories.map((cat) => (
                    <option key={cat.cat_id} value={cat.cat_id}>
                      {cat.category_name}
                    </option>
                  ))}
                </select>
              </div>

              {/*  Vocab Image */}
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
