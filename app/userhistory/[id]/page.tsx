"use client";
import React, { useState, useEffect } from "react";
import NavBarUser from "../../../components/NavBarUser";
import Footer from "../../../components/Footer";
import { supabase } from "@/lib/supabaseClient";
import { IoIosArrowBack } from "react-icons/io";
import { useRouter, useParams } from "next/navigation";

type User = {
  id: string;
  fullname: string;
  user_image_url: string;
};

type Vocabulary = {
  vocab_id: number;
  english: string;
  spelling: string;
  thai: string;
  vocab_image_url: string;
};

export default function page() {
  const router = useRouter();
  const id = useParams().id;

  const [vocabs, setVocabs] = useState<Vocabulary[]>([]);
  const [activeCategory, setActiveCategory] = useState<number | null>(null);
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    async function fetchHistory() {
      const { data, error } = await supabase
        .from("history_tb")
        .select(
          "viewed_at, vocab_tb(vocab_id, spelling, english, thai, vocab_image_url) "
        )
        .eq("user_id", id)
        .order("viewed_at", { ascending: false });

      if (error) {
        console.error("เกิดข้อผิดพลาดในการดึงประวัติ:", error.message);
        return;
      }

      const mapped = data.map((h: any) => ({
        viewedAt: h.viewed_at,
        ...h.vocab_tb,
      }));

      setVocabs(mapped);
    }

    fetchHistory();
  }, []);

  const handleClickBack = () => {
    router.push(`/dashboardvocab/${user?.id}`);
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
            {/* กล่องหลักของประวัติ */}
            <div className="bg-white p-6 rounded-3xl shadow-2xl border-4 border-indigo-200/50">
              {Array.isArray(vocabs) && vocabs.length > 0 ? (
                // แสดงรายการประวัติ
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-6 gap-5">
                  {vocabs
                    .filter(
                      (vocab) =>
                        !activeCategory || vocab.vocab_id === activeCategory
                    )
                    .map((vocab) => (
                      <div
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
                          <h3 className="text-sm text-gray-600">
                            {vocab.thai}
                          </h3>
                        </div>
                      </div>
                    ))}
                </div>
              ) : (
                // แสดงข้อความถ้าไม่มีประวัติ
                <div className="text-center text-gray-500 text-lg py-10">
                  ไม่มีประวัติการค้นหา
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
