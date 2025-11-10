"use client";
import react from "react";
import Image from "next/image";
import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import NavBarUser from "../../../components/NavBarUser";
import { IoIosArrowBack } from "react-icons/io";
import Footer from "../../../components/Footer";
import selectall from "../../../assets/selectall.png";
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
  const [searchvocab, setSearchVocab] = useState("");

  // สร้าง VOCAB และ CATEGORIES สำหรับใช้งาน
  const VOCAB = vocabs.map((vocab) => ({
    vocab_id: vocab.vocab_id,
    english: vocab.english,
    spelling: vocab.spelling,
    thai: vocab.thai,
    vocab_image_url: vocab.vocab_image_url,
    cat_id: vocab.cat_id,
  }));

  const CATEGORIES = categories.map((cat) => ({
    cat_id: cat.cat_id,
    category_name: cat.category_name,
    cat_image_url: cat.cat_image_url,
  }));

  // กรองคำศัพท์ตาม category และ searchTerm
  const filteredVocab = useMemo(() => {
    return VOCAB.filter((v) => {
      const matchesCategory = !activeCategory || v.cat_id === activeCategory;
      const matchesSearch =
        searchvocab === "" ||
        v.english.toLowerCase().includes(searchvocab.toLowerCase()) ||
        v.thai.toLowerCase().includes(searchvocab.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [VOCAB, activeCategory, searchvocab]);

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

  const handleClickBack = () => {
    router.push(`/dashboard/${user?.user_id}`);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-200 via-purple-200 to-blue-200">
      {/* NavBar */}
      <div className="relative z-40">
        <NavBarUser />
      </div>

      {/* ขยายเต็มพื้นที่ว่างใน flex container โดยใช้ flex-grow */}
      <div className="flex-grow p-6 md:p-10 max-w-6xl mx-auto w-full">
        {/* เนื้อหาหลัก */}
        <div className="p-6 md:p-10 max-w-7xl mx-auto">
          {/* ส่วนหัวเรื่อง */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
            <div>
              <h1 className="text-4xl md:text-5xl font-extrabold mb-2 text-indigo-600 drop-shadow-sm">
                คลังคำศัพท์
              </h1>
              <h2 className="text-gray-600 text-lg">
                สำรวจคำศัพท์ตามหมวดหมู่ที่คุณสนใจ
              </h2>
            </div>

            <button
              onClick={handleClickBack}
              className="mt-4 md:mt-0 px-8 py-3 bg-gray-700 text-white font-bold rounded-xl shadow-lg hover:bg-gray-800 transition transform hover:scale-105 text-lg flex items-center"
            >
              <IoIosArrowBack className="text-xl mr-2" /> Back to Dashboard
            </button>
          </div>

          {/* กล่องหลัก */}
          <div className="bg-white p-6 rounded-3xl shadow-2xl border border-indigo-200/30">
            {/* ปุ่มเลือกหมวดหมู่ */}
            <div className="flex flex-wrap gap-4 mb-8 justify-center lg:justify-start">
              {/* ปุ่ม "ทั้งหมด" */}
              <button
                onClick={() => setActiveCategory(null)}
                className={`flex items-center space-x-2 px-5 py-3 rounded-full font-semibold text-sm transition duration-200 shadow-md ${
                  activeCategory === null
                    ? "bg-indigo-500 text-white shadow-indigo-300"
                    : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200"
                }`}
              >
                <Image src={selectall} alt="ทั้งหมด" className="w-6 h-6" />
                <span>ทั้งหมด</span>
              </button>

              {/* ปุ่มหมวดหมู่ */}
              {CATEGORIES.map((category) => (
                <button
                  key={category.cat_id}
                  onClick={() => setActiveCategory(category.cat_id)}
                  className={`flex items-center space-x-2 px-5 py-3 rounded-full font-semibold text-sm transition duration-200 shadow-md ${
                    activeCategory === category.cat_id
                      ? "bg-indigo-500 text-white shadow-indigo-300"
                      : "bg-white text-gray-700 hover:bg-gray-50 border border-gray-200"
                  }`}
                >
                  <img src={category.cat_image_url} className="w-5 h-5" />
                  <span>{category.category_name}</span>
                </button>
              ))}
            </div>

            {/* ส่วนหัวรายการคำศัพท์ */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 border-b pb-4 gap-4">
              {/* ชื่อหมวดหมู่ */}
              <h2 className="text-2xl font-bold text-gray-800">
                หมวดหมู่:{" "}
                <span className="text-indigo-600">
                  {CATEGORIES.find((c) => c.cat_id === activeCategory)
                    ?.category_name || "ทั้งหมด"}
                </span>{" "}
                (
                <span className="font-medium">
                  {Array.isArray(VOCAB)
                    ? VOCAB.filter(
                        (v) => !activeCategory || v.cat_id === activeCategory
                      ).length
                    : 0}
                </span>{" "}
                คำ)
              </h2>

              {/* ช่องค้นหาคำศัพท์ */}
              <div className="w-full md:w-64">
                <input
                  type="text"
                  value={searchvocab}
                  onChange={(e) => setSearchVocab(e.target.value)}
                  placeholder="ค้นหาคำศัพท์..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-2xl shadow-sm focus:ring-indigo-400 focus:border-indigo-400 text-gray-800 transition duration-200"
                />
              </div>
            </div>
            {/* ตารางคำศัพท์ */}
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6 gap-6">
              {VOCAB.filter((vocab) => {
                // กรองตามหมวดหมู่
                const matchesCategory =
                  !activeCategory || vocab.cat_id === activeCategory;

                // กรองตามช่องค้นหา
                const matchesSearch =
                  searchvocab === "" ||
                  vocab.english
                    .toLowerCase()
                    .includes(searchvocab.toLowerCase()) ||
                  vocab.thai.toLowerCase().includes(searchvocab.toLowerCase());

                return matchesCategory && matchesSearch;
              }).map((vocab) => (
                <div
                  key={vocab.vocab_id}
                  onClick={() =>
                    router.push(
                      `/vocabcard/${vocab.vocab_id}/?user_id=${user?.user_id}`
                    )
                  }
                  className="group relative bg-white/50 backdrop-blur-md border border-white/20 rounded-3xl shadow-lg cursor-pointer overflow-hidden transform transition-all duration-300 hover:scale-105 hover:-translate-y-1 hover:shadow-2xl hover:border-indigo-300"
                >
                  {/* รูปคำศัพท์ */}
                  <div className="relative w-full h-28 sm:h-32 md:h-36 flex items-center justify-center overflow-hidden rounded-t-3xl bg-gradient-to-tr from-indigo-100 to-pink-100">
                    <img
                      src={vocab.vocab_image_url}
                      alt={vocab.english}
                      className="w-3/4 h-3/4 object-contain p-2 transition-transform duration-500 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent opacity-0 group-hover:opacity-20 transition-opacity rounded-t-3xl"></div>
                  </div>

                  {/* ข้อมูลคำศัพท์ */}
                  <div className="p-3 text-center bg-white/70 backdrop-blur-sm rounded-b-3xl transition-colors duration-300 group-hover:bg-white/90">
                    <h3 className="text-base font-bold text-gray-800 truncate">
                      {vocab.english}
                    </h3>
                    <h3 className="text-sm text-gray-500 italic truncate">
                      {vocab.spelling}
                    </h3>
                    <h3 className="text-sm text-gray-600">{vocab.thai}</h3>
                  </div>

                  <div className="absolute bottom-0 left-0 w-full h-1 bg-indigo-400 scale-x-0 group-hover:scale-x-100 transition-transform origin-left rounded-full"></div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
