"use client";
import React, { useState, useEffect } from "react";
import NavBarStaff from "@/components/NavBarStaff";
import Footer from "@/components/Footer";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { IoIosArrowBack } from "react-icons/io";
import { supabase } from "@/lib/supabaseClient";
import Link from "next/link";
import { FaPlus } from "react-icons/fa";

type Categories = {
  cat_id: string;
  category_name: string;
};

type Staff = {
  staff_id: string;
  fullname: string;
  staff_image_url: string;
};

type Vocaburary = {
  vocab_id: string;
  english: string;
  spelling: string;
  thai: string;
  vocab_image_url: string;
  created_at: string;
  categories_tb?: Categories | null;
};
export default function page() {
  const router = useRouter();

  const [staff, setStaff] = useState<Staff | null>(null);
  const [vocabs, setVocabs] = useState<Vocaburary[]>([]);
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

  useEffect(() => {
    async function fetchVocabs() {
      const { data, error } = await supabase
        .from("vocab_tb")
        .select(
          `
          vocab_id,
          english,
          spelling,
          thai,
          vocab_image_url,
          created_at,
          categories_tb (
            cat_id,
            category_name
          )
          `
        )
        .order("created_at", { ascending: false });

      if (error) {
        console.error("Error fetching vocabs:", error);
        alert("พบข้อผิดพลาดในการดึงข้อมูล กรุณาลองใหม่อีกครั้ง...");
        return;
      }

      setVocabs(
        data.map((item) => ({
          ...item,
          categories_tb: Array.isArray(item.categories_tb)
            ? item.categories_tb[0]
            : item.categories_tb,
        })) as Vocaburary[]
      );
    }

    fetchVocabs();
  }, []);

  const handleClickBack = () => {
    router.back();
  };

  const handleAddVocab = () => {
    router.push(`/addvocab/${staff?.staff_id}`);
  };

  return (
    <div>
      <div className="min-h-screen bg-pink-100">
        <NavBarStaff />
        <div className="p-6 md:p-10">
          {/* 1. ตกแต่งหัวข้อ "Dashboard" ให้มีสีสันไล่ระดับ */}
          <h1 className="text-4xl font-bold mb-6 bg-gradient-to-r from-blue-500 via-green-500 to-yellow-500 bg-clip-text text-transparent drop-shadow-lg">
            Admin Dashboard
          </h1>
          <div className="bg-white/95 backdrop-blur-sm p-6 rounded-2xl shadow-2xl border-2 border-pink-200">
            <div className="flex items-center justify-between mb-6">
              {/* ฝั่งซ้าย */}
              <div>
                <h2 className="text-2xl font-bold text-indigo-600 mb-2">
                  คำศัพท์ทั้งหมด
                </h2>
                <h3 className="text-gray-600 text-sm">รายชื่อคำศัพท์</h3>
              </div>

              {/* ฝั่งขวา */}
              <div className="flex space-x-4">
                <button
                  onClick={handleClickBack}
                  className="px-6 py-2 bg-gray-600 text-white font-bold rounded-full shadow-xl hover:bg-gray-800 transition duration-150 transform hover:scale-105 text-lg flex items-center"
                >
                  <IoIosArrowBack className="text-xl mr-2" /> ย้อนกลับ
                </button>
                <button
                  onClick={handleAddVocab}
                  className="px-6 py-2 bg-indigo-600 text-white font-bold rounded-full shadow-xl hover:bg-indigo-700 transition duration-150 transform hover:scale-105 text-lg"
                >
                  + เพิ่มคำศัพท์
                </button>
              </div>
            </div>
            {/* ตารางคำศัพท์ทั้งหมด*/}
            <div className="mt-5 text-center">
              <table className="min-w-full border border-gray-400 rounded-lg overflow-hidden shadow-lg">
                <thead className="bg-indigo-100">
                  <tr>
                    <th className="border-b border-r border-gray-400 p-3 text-sm font-semibold text-gray-700 text-center">
                      รูปภาพคำ
                    </th>
                    <th className="border-b border-r border-gray-400 p-3 text-sm font-semibold text-gray-700 text-center">
                      คำอังกฤษ
                    </th>
                    <th className="border-b border-r border-gray-400 p-3 text-sm font-semibold text-gray-700 text-center">
                      คำอ่าน
                    </th>
                    <th className="border-b border-r border-gray-400 p-3 text-sm font-semibold text-gray-700 text-center">
                      คำไทย
                    </th>
                    <th className="border-b border-r border-gray-400 p-3 text-sm font-semibold text-gray-700 text-center">
                      ประเภทคำ
                    </th>
                    <th className="border-b border-r border-gray-400 p-3 text-sm font-semibold text-gray-700 text-center">
                      วันที่เพิ่มคำ
                    </th>
                    <th className="border-b border-r border-gray-400 p-3 text-sm font-semibold text-gray-700 text-center">
                      แก้ไข คําศัพท์
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-400">
                  {vocabs.map((vocab) => (
                    <tr
                      key={vocab.vocab_id}
                      className="hover:bg-indigo-50 transition-colors duration-200"
                    >
                      <td className="p-2 text-center border-r border-gray-400">
                        {vocab.vocab_image_url ? (
                          <Image
                            src={vocab.vocab_image_url}
                            alt="logo"
                            width={50}
                            height={50}
                            className="mx-auto rounded-full border-2 border-indigo-200 shadow-sm"
                          />
                        ) : (
                          <div className="w-12 h-12 mx-auto bg-gray-200 rounded-full flex items-center justify-center text-gray-500">
                            -
                          </div>
                        )}
                      </td>
                      <td className="p-2 text-gray-800 font-medium border-r border-gray-400 text-center">
                        {vocab.english}
                      </td>
                      <td className="p-2 text-gray-700 border-r border-gray-400 text-center">
                        {vocab.spelling}
                      </td>
                      <td className="p-2 text-gray-700 border-r border-gray-400 text-center">
                        {vocab.thai}
                      </td>
                      <td className="p-2 text-gray-600 border-r border-gray-400 text-center">
                        {vocab.categories_tb?.category_name || "-"}
                      </td>
                      <td className="p-2 text-gray-600 border-r border-gray-400 text-center">
                        {new Date(vocab.created_at).toLocaleDateString()}
                      </td>
                      <td className="p-2 text-gray-600 border-r border-gray-400 text-center">
                        <Link
                          href={`/editvocab/${vocab.vocab_id}?staff_id=${staff?.staff_id}`}
                          className="mr-5 text-green-700 font-bold"
                        >
                          แก้ไข
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
