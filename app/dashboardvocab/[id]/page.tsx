"use client";
import react from "react";
import Image from "next/image";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import NavBarUser from "../../../components/NavBarUser";
import { IoIosArrowBack } from "react-icons/io";
import Footer from "../../../components/Footer";
type Category = {
  cat_id: number;
  category_name: string;
  cat_image_url: string;
};
type Vocabulary = {
  vocab_id: number;
  english: string;
  spelling: string;
  thai: string;
  vocab_image_url: string;
  cat_id: number;
};

type User = {
  user_id: string;
  fullname: string;
  user_image_url: string;
};
export default function page() {
  const router = useRouter();

  const [vocabs, setVocabs] = useState<Vocabulary[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [activeCategory, setActiveCategory] = useState<number | null>(null);

  const [user, setUser] = useState<User | null>(null);

  //เมื่อเพจถูกโหลด ให้ดึงข้อมูล vocab_tb จาก supabase เพื่อมาแสดงผลที่หน้าเพจ
  useEffect(() => {
    async function fetchVocabs() {
      const { data, error } = await supabase
        .from("vocab_tb")
        .select("*")
        .order("vocab_id", { ascending: true });

      //หลังจากดึงข้อมูลมาตรวจสอบ error
      if (error) {
        alert("พบข้อผิดพลาดในการดึงข้อมูล กรุณาลองใหม่อีกครั้ง...");
        console.log(error);
        return;
      }
      //ไม่พบ error
      if (data) {
        setVocabs(data as Vocabulary[]);
      }
    }
    fetchVocabs();
  }, []);

  //เมื่อเพจถูกโหลด ให้ดึงข้อมูล categories_tb จาก supabase เพื่อมาแสดงผลที่หน้าเพจ
  useEffect(() => {
    async function fetchCategories() {
      const { data, error } = await supabase
        .from("categories_tb")
        .select("*")
        .order("cat_id", { ascending: true });

      //หลังจากดึงข้อมูลมาตรวจสอบ error
      if (error) {
        alert("พบข้อผิดพลาดในการดึงข้อมูล กรุณาลองใหม่อีกครั้ง...");
        console.log(error);
        return;
      }
      //ไม่พบ error
      if (data) {
        setCategories(data as Category[]);
      }
    }
    fetchCategories();
  }, []);

  // ดึงข้อมูลผู้ใช้เแบบ 1-1 จากหน้า login + supabase
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

        setUser({
          user_id: data.user_id,
          fullname: data.fullname,
          user_image_url: data.user_image_url,
        });
      } catch (ex) {
        console.error("เกิดข้อผิดพลาดในการเชื่อมต่อ Supabase:", ex);
      }
    }
    fetchUser();
  }, []);

  const CATEGORIES = categories.map((cat) => ({
    cat_id: cat.cat_id,
    category_name: cat.category_name,
    cat_image_url: cat.cat_image_url,
  }));

  const VOCAB = vocabs.map((vocab) => ({
    vocab_id: vocab.vocab_id,
    english: vocab.english,
    spelling: vocab.spelling,
    thai: vocab.thai,
    vocab_image_url: vocab.vocab_image_url,
    cat_id: vocab.cat_id,
  }));

  const handleClickBack = () => {
    router.back();
  };

  return (
    <div>
      <div className="min-h-screen bg-pink-100">
        <div className="relative z-40">
          <NavBarUser />
        </div>
        {/* เนื้อหาของหน้าเพจ  */}
        <div className="p-6 md:p-10">
          <div className="max-w-7xl mx-auto">
            {/* ส่วนหัวเรื่อง */}
            <div className="flex justify-between items-center mb-6">
              <div>
                <h1 className="text-4xl font-bold mb-2 text-indigo-600 drop-shadow-md">
                  คลังคำศัพท์
                </h1>
                <h2 className="text-gray-600">
                  สำรวจคำศัพท์ตามหมวดหมู่ที่คุณสนใจ
                </h2>
              </div>

              <button
                onClick={handleClickBack}
                className="px-8 py-3 bg-gray-600 text-white font-bold rounded-full shadow-xl hover:bg-gray-800 transition duration-150 transform hover:scale-105 text-lg"
              >
                <IoIosArrowBack className="text-xl inline-block mr-2" />{" "}
                ย้อนกลับ
              </button>
            </div>
            {/* กล่องหลักของคลังคำศัพท์ */}
            <div className="bg-white p-6 rounded-3xl shadow-2xl border-4 border-indigo-200/50">
              {/* ปุ่มเลือกหมวดหมู่ (Category Filter) */}
              <div className="flex flex-wrap gap-4 mb-8 justify-center lg:justify-start">
                {CATEGORIES.map((category) => (
                  <button
                    key={category.cat_id}
                    onClick={() => setActiveCategory(category.cat_id)}
                    className={`flex items-center space-x-2 px-5 py-3 rounded-full font-bold text-sm transition duration-200 shadow-lg ${
                      activeCategory === category.cat_id
                        ? `bg-indigo-500 text-white shadow-indigo-300`
                        : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200"
                    }`}
                  >
                    {/* รูปภาพไอคอนหมวดหมู่ */}
                    <img src={category.cat_image_url} className="w-5 h-5" />
                    {/* ชื่อหมวดหมู่ */}
                    <span>{category.category_name}</span>
                  </button>
                ))}
              </div>

              {/* ส่วนหัวของรายการคำศัพท์ */}
              <div className="flex justify-between items-center mb-6 border-b pb-4">
                <h2 className="text-2xl font-bold text-gray-800">
                  หมวดหมู่:{" "}
                  {CATEGORIES.find((c) => c.cat_id === activeCategory)
                    ?.category_name || "ทั้งหมด"}{" "}
                  ({" "}
                  {Array.isArray(VOCAB)
                    ? VOCAB.filter(
                        (v) => !activeCategory || v.cat_id === activeCategory
                      ).length
                    : 0}{" "}
                  คำ )
                </h2>
              </div>

              {/* แสดงรายการคำศัพท์ทั้งหมดในหมวดหมู่ที่เลือก */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6 gap-5">
                {Array.isArray(VOCAB) &&
                  VOCAB.filter(
                    (vocab) =>
                      !activeCategory || vocab.cat_id === activeCategory
                  ).map((vocab) => (
                    <div
                      onClick={() => {
                        router.push(
                          `/vocabcard/${vocab.vocab_id}/?user_id=${user?.user_id}`
                        );
                      }}
                      key={vocab.vocab_id}
                      className="bg-gradient-to-br from-indigo-50 to-pink-50 border border-indigo-200/50 
                   rounded-2xl shadow-lg cursor-pointer transform transition-all duration-300 
                   hover:scale-105 hover:-translate-y-1 hover:shadow-2xl hover:border-indigo-400/70"
                    >
                      {/* รูปคำศัพท์ */}
                      <div className="relative w-full h-24 sm:h-28 md:h-32 overflow-hidden rounded-t-2xl bg-white/80">
                        <img
                          src={vocab.vocab_image_url}
                          alt={vocab.english}
                          className="w-full h-full object-contain p-2 transition-transform duration-300 hover:scale-110"
                        />
                      </div>

                      {/* ข้อมูลคำศัพท์ */}
                      <div className="p-3 text-center bg-white/60 backdrop-blur-sm rounded-b-2xl">
                        <h3 className="text-base font-bold text-gray-800 truncate">
                          {vocab.english}
                        </h3>
                        <h3 className="text-sm text-gray-500 italic truncate">
                          {vocab.spelling}
                        </h3>
                        <h3 className="text-sm text-gray-600">{vocab.thai}</h3>
                      </div>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
