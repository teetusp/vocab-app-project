"use client";
import React, { useState, useRef, useEffect } from "react";
import { useRouter, useParams, useSearchParams } from "next/navigation";
import { supabase } from "../../../lib/supabaseClient";
import { LuRotate3D } from "react-icons/lu";
import { IoMdClose } from "react-icons/io";

type User = {
  user_id: string;
  fullname: string;
  user_image_url: string;
};

export default function page() {
  const router = useRouter();
  const params = useParams(); // ดึง param จาก URL
  const vocabId = params.id;
  const searchParams = useSearchParams();
  const userId = searchParams.get("user_id");

  const [vocabs, setVocabs] = useState<any>(null);
  const [user, setUser] = useState<User | null>(null);

  const [rotationX, setRotationX] = useState(0);
  const [rotationY, setRotationY] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const cardRef = useRef<HTMLDivElement>(null);
  const dragStart = useRef({ x: 0, y: 0, rotX: 0, rotY: 0 });

  const [english, setEnglish] = useState<string>("");
  const [spelling, setSpelling] = useState<string>("");
  const [thai, setThai] = useState<string>("");
  const [type, setType] = useState<string>("");
  const [vocabImageUrl, setVocabImageUrl] = useState<string | null>(null);

  // ฟังก์ชันสําหรับออกเสียง ENG
  const handleSpeak = (text: string) => {
    if (!text) return;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "en-US"; // ถ้าอยากให้ออกเสียงภาษาอังกฤษ
    utterance.rate = 0.9; // ความเร็ว (0.1 - 10)
    utterance.pitch = 1; // ระดับเสียง
    utterance.volume = 1; // ระดับความดัง (0 - 1)
    window.speechSynthesis.speak(utterance);
  };

  const handleSpeakThaiMeaning = (thaiText: string) => {
    if (!thaiText) return;

    const synth = window.speechSynthesis;
    let voices = synth.getVoices();

    // ถ้ายังไม่โหลด voices ให้รอ event ก่อน
    if (voices.length === 0) {
      synth.onvoiceschanged = () => handleSpeakThaiMeaning(thaiText);
      return;
    }

    // หาเสียงภาษาไทย ถ้าไม่มีใช้ en-US แทน
    const thaiVoice =
      voices.find((v) => v.lang === "th-TH") ||
      voices.find((v) => v.lang.startsWith("th")) ||
      voices.find((v) => v.lang === "en-US") ||
      voices[0];

    const utterance = new SpeechSynthesisUtterance(thaiText);
    utterance.voice = thaiVoice;
    utterance.lang = "th-TH";
    utterance.rate = 1;
    utterance.pitch = 1;
    synth.speak(utterance);
  };

  //ฟังก์ชันจัดการเมื่อ users คลิกเมาสเพื่อให้เริ่มการแปลงรูป
  const handleMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);

    dragStart.current = {
      x: e.clientX,
      y: e.clientY,
      rotX: rotationX,
      rotY: rotationY,
    };

    if (cardRef.current) {
      cardRef.current.classList.remove("transition-transform");
    }
  };

  //ฟังก์ชันจัดการเมื่อ users คลิกเมาสเพื่อเลื่อนรูปโดยจัดตำแหนตามค่า x, y ของเมาส
  const handleMouseMove = (e: MouseEvent) => {
    if (!isDragging) return;

    const deltaX = e.clientX - dragStart.current.x;
    const deltaY = e.clientY - dragStart.current.y;

    setRotationX(dragStart.current.rotX + deltaY * 0.2);
    setRotationY(dragStart.current.rotY + deltaX * 0.2);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
    if (cardRef.current) {
      cardRef.current.classList.add("transition-transform");
    }
  };
  //สำหรับเครื่องมือมือ
  const handleTouchStart = (e: React.TouchEvent<HTMLDivElement>) => {
    e.preventDefault(); // ป้องกัน scroll
    setIsDragging(true);

    const touch = e.touches[0];
    dragStart.current = {
      x: touch.clientX,
      y: touch.clientY,
      rotX: rotationX,
      rotY: rotationY,
    };

    if (cardRef.current) {
      cardRef.current.classList.remove("transition-transform");
    }
  };
  //สำหรับเครื่องมือมือ
  const handleTouchMove = (e: React.TouchEvent<HTMLDivElement>) => {
    if (!isDragging) return;

    const touch = e.touches[0];
    const deltaX = touch.clientX - dragStart.current.x;
    const deltaY = touch.clientY - dragStart.current.y;

    setRotationX(dragStart.current.rotX + deltaY * 0.2);
    setRotationY(dragStart.current.rotY + deltaX * 0.2);
  };

  useEffect(() => {
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    document.addEventListener("touchend", handleMouseUp);

    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
      document.removeEventListener("touchend", handleMouseUp);
    };
  }, [isDragging]);

  //ดึงข้อมูลคําศัพท์
  useEffect(() => {
    async function fetchVocab() {
      if (!vocabId) {
        console.error("ไม่พบ vocab_id ใน path");
        return;
      }

      try {
        const { data, error } = await supabase
          .from("vocab_tb")
          .select("*")
          .eq("vocab_id", vocabId)
          .single();

        if (error) {
          console.error("เกิดข้อผิดพลาดในการดึงข้อมูลคําศัพท์:", error.message);
          return;
        }

        if (data) {
          setVocabs({
            vocab_id: data.vocab_id,
            english: data.english,
            spelling: data.spelling,
            thai: data.thai,
            vocab_image_url: data.vocab_image_url,
            user_id: data.user_id,
          });
          if (userId) {
            await saveHistoryToSupabase(userId, data.vocab_id);
          }
        }
      } catch (ex) {
        console.error("เกิดข้อผิดพลาดในการดึงข้อมูลคําศัพท์:", ex);
      }
    }

    fetchVocab();
  }, [vocabId]);

  // ดึงข้อมูลคำศัพท์เแบบ จากหน้า supabase
  useEffect(() => {
    async function fetchData() {
      const { data, error } = await supabase
        .from("vocab_tb")
        .select("*")
        .eq("vocab_id", vocabId)
        .single();

      if (error) {
        alert("พบข้อผิดพลาดในการดึงข้อมูล กรุณาลองใหม่อีกครั้ง...");
        console.log(error);
        return;
      }

      //เอาข้อมูลที่ดึงมาจาก supabase มาแสดงบนหน้าจอ
      setEnglish(data.english);
      setSpelling(data.spelling);
      setThai(data.thai);
      setType(data.type);
      setVocabImageUrl(data.vocab_image_url);
    }
  });

  // ดึงข้อมูลผู้ใช้เแบบ 1-1 จากหน้า dashboard + supabase
  useEffect(() => {
    async function fetchUser() {
      try {
        const userId = localStorage.getItem("user_id");
        if (!userId) {
          console.error("ไม่พบ userId ใน localStorage");
          return;
        }

        // 🔹 ดึงข้อมูลผู้ใช้จากตาราง user_tb
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

  // ฟังก์ชันบันทึกประวัติลง Supabase
  async function saveHistoryToSupabase(user_id: string, vocab_id: string) {
    try {
      const { error } = await supabase.from("history_tb").upsert(
        [
          {
            user_id,
            vocab_id,
            viewed_at: new Date().toISOString(),
          },
        ],
        { onConflict: "user_id,vocab_id" } // ต้องตรงกับ unique constraint
      );

      if (error) {
        console.error(" บันทึกประวัติล้มเหลว:", error);
      } else {
        console.log(" บันทึกประวัติ (insert/update) สำเร็จ");
      }
    } catch (err) {
      console.error("เกิดข้อผิดพลาดในการบันทึก:", err);
    }
  }

  const handleClickBack = () => {
    router.back();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-200 via-purple-200 to-blue-200 p-4 flex flex-col items-center">
      <h1 className="text-3xl md:text-4xl font-extrabold text-gray-800 my-8 px-4 text-center drop-shadow-md">
        Vocabulary Card
      </h1>

      <div className="p-4 pt-8 text-center">
        <h2 className="text-xl font-semibold text-gray-700 flex items-center justify-center">
          <LuRotate3D className="w-5 h-5 mr-2 animate-spin-slow text-gray-600" />
          360° Interactive Flashcard
        </h2>
        <p className="text-sm text-gray-500 mt-1">
          คลิกหรือสัมผัสแล้วลากเพื่อหมุนการ์ดดูทุกทิศทาง
        </p>
      </div>

      {/* คอนเทนเนอร์ Perspective */}
      <div
        className="perspective-container mt-8"
        onMouseDown={handleMouseDown}
        onTouchStart={handleTouchStart}
        onTouchMove={handleTouchMove}
      >
        <div
          ref={cardRef}
          className="card-body"
          style={{
            transform: `rotateY(${rotationY}deg) rotateX(${rotationX}deg)`,
            transition: isDragging ? "none" : "transform 0.5s ease",
          }}
        >
          {/* ด้านหน้า */}
          <div className="card-face card-front bg-gradient-to-br from-indigo-200 via-pink-200 to-yellow-100 shadow-2xl">
            {vocabs ? (
              <>
                <div className="relative w-40 h-40 mb-6 rounded-2xl overflow-hidden ">
                  <img
                    src={vocabs.vocab_image_url}
                    alt={vocabs.english}
                    className="w-full h-full object-cover transition-transform duration-500  rounded-2xl"
                  />
                </div>
                <h1 className="text-5xl font-extrabold text-gray-800 uppercase mb-2 drop-shadow-sm">
                  {vocabs.english}
                </h1>
                <h2 className="text-xl font-medium text-gray-600 mb-4 italic">
                  {vocabs.spelling}
                </h2>
                <button
                  onClick={() => handleSpeak(vocabs.english)}
                  className="px-6 py-2 bg-indigo-500 text-white rounded-full shadow-lg hover:bg-indigo-600 transition transform hover:scale-105"
                >
                  🔊 ฟังเสียง
                </button>
              </>
            ) : (
              <h1 className="text-gray-500">Loading...</h1>
            )}
          </div>

          {/* ด้านหลัง */}
          <div className="card-face card-back bg-gradient-to-br from-pink-200 via-purple-200 to-indigo-200 shadow-2xl text-center">
            <h2 className="text-2xl font-bold text-pink-600 mb-4 drop-shadow-sm">
              คำไทย
            </h2>
            <h2 className="text-4xl font-extrabold text-gray-800">
              {vocabs?.thai}
            </h2>
          </div>
        </div>
      </div>

      <button
        onClick={handleClickBack}
        className="mt-8 px-8 py-3 bg-red-600 text-white font-bold rounded-full shadow-lg hover:bg-red-700 transition transform hover:scale-105 text-lg flex items-center justify-center"
      >
        <IoMdClose className="text-2xl inline-block mr-2" /> ปิด
      </button>
    </div>
  );
}
