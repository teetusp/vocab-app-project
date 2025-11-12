"use client";
import React, { useState, useEffect } from "react";
import NavBarUser from "../../../components/NavBarUser";
import Footer from "../../../components/Footer";
import { supabase } from "@/lib/supabaseClient";
import { IoIosArrowBack } from "react-icons/io";
import { useRouter, useParams } from "next/navigation";

type User = {
  user_id: string;
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
    router.push(`/dashboard/${user?.user_id}`);
  };

  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-pink-200 via-purple-200 to-blue-200">
      {/*ลาย background*/}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 w-24 h-24 bg-yellow-300 rounded-full opacity-40 animate-bounce"></div>
        <div className="absolute top-32 right-20 w-32 h-32 bg-pink-400 rounded-full opacity-30 animate-pulse"></div>
        <div className="absolute bottom-20 left-1/4 w-20 h-20 bg-blue-300 rounded-full opacity-50 animate-bounce delay-100"></div>
        <div className="absolute top-1/2 right-10 w-28 h-28 bg-purple-300 rounded-full opacity-40 animate-pulse delay-200"></div>
        <div className="absolute bottom-40 right-1/3 w-24 h-24 bg-green-300 rounded-full opacity-30 animate-bounce delay-300"></div>
      </div>

      <div className="relative z-40">
        <NavBarUser />
      </div>
      {/* ขยายเต็มพื้นที่ว่างใน flex container โดยใช้ flex-grow */}
      <div className="flex-grow p-6 md:p-10 max-w-6xl mx-auto w-full">
        {/* เนื้อหาของหน้าเพจ  */}
        <div className="p-6 md:p-10 max-w-7xl mx-auto mt-10">
          {/* ส่วนหัวเรื่อง */}
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
            <div>
              <h1 className="text-4xl md:text-5xl font-extrabold mb-2 text-indigo-600 drop-shadow-sm">
                Search History
              </h1>
              <h2 className="text-gray-600 text-lg">Search your vocabulary</h2>
            </div>

            <button
              onClick={handleClickBack}
              className="mt-4 md:mt-0 px-8 py-3 bg-gray-700 text-white font-bold rounded-xl shadow-lg hover:bg-gray-800 transition transform hover:scale-105 text-lg flex items-center cursor-pointer"
            >
              <IoIosArrowBack className="text-xl mr-2" /> Back to Dashboard
            </button>
          </div>
          {/* กล่องหลักของประวัติ */}
          <div className="bg-white p-6 rounded-3xl shadow-2xl border border-indigo-200/30">
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
                        rounded-2xl shadow-lg transform transition-all duration-300  cursor-pointer
                        hover:scale-105 hover:-translate-y-1 hover:shadow-2xl hover:border-indigo-400/70"
                    >
                      {/* รูปคำศัพท์ */}
                      <div className="relative w-full h-28 sm:h-32 md:h-36 flex items-center justify-center overflow-hidden rounded-t-3xl bg-gradient-to-tr from-indigo-100 to-pink-100">
                        <img
                          src={vocab.vocab_image_url}
                          alt={vocab.english}
                          className="w-3/4 h-3/4 object-contain p-2 transition-transform duration-500 group-hover:scale-110"
                        />
                        {/* Overlay effect */}
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
                      {/* Hover highlight bar */}
                      <div className="absolute bottom-0 left-0 w-full h-1 bg-indigo-400 scale-x-0 group-hover:scale-x-100 transition-transform origin-left rounded-full"></div>
                    </div>
                  ))}
              </div>
            ) : (
              // แสดงข้อความถ้าไม่มีประวัติ
              <div className="text-center text-gray-500 text-lg py-10">
                No search history
              </div>
            )}
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
