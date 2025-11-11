"use client";
import React from "react";
import { IoIosArrowBack } from "react-icons/io";
import { useState, useEffect, useCallback } from "react";
import NavBarUser from "@/components/NavBarUser";
import Footer from "@/components/Footer";
import { useRouter, useParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { IoMdRefresh } from "react-icons/io";
import Confetti from "react-confetti";
import { useWindowSize } from "react-use";

type Vocabulary = {
  vocab_id: number;
  english: string;
  thai: string;
};

type Question = {
  id: string;
  thai: string;
  correctAnswer: string;
  options: string[];
  answered: boolean;
  userAnswer: string | null;
  isCorrect: boolean | null;
};

type User = {
  user_id: number;
  fullname: string;
  user_image_url: string;
};

export default function page() {
  const router = useRouter();
  const id = useParams().id;

  const [vocabs, setVocabs] = useState<Vocabulary[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [options, setOptions] = useState<string[]>([]);

  const [user, setUser] = useState<User | null>(null);
  const { width, height } = useWindowSize();

  const QUIZ_LENGTH = 10; //

  const shuffleArray = <T,>(array: T[]): T[] => {
    for (let i = array.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [array[i], array[j]] = [array[j], array[i]];
    }
    return array;
  };

  // ฟังก์ชันสำหรับสร้างคำถามเดียว
  const generateQuestion = useCallback(
    (correctVocab: Vocabulary, allVocab: Vocabulary[]): Question => {
      // คำตอบไม่ถูกต้อง 3 ตัว
      const distractors = allVocab
        .filter((v) => v.english !== correctVocab.english)
        .sort(() => 0.5 - Math.random())
        .slice(0, 3);

      // รวมคำตอบถูกต้องและสลับ
      const options = shuffleArray([
        ...distractors.map((v) => v.english),
        correctVocab.english,
      ]);

      return {
        id: correctVocab.english,
        thai: correctVocab.thai,
        correctAnswer: correctVocab.english,
        options,
        answered: false,
        userAnswer: null,
        isCorrect: null,
      };
    },
    []
  );

  // สร้างแบบทดสอบ
  const generateQuiz = useCallback(() => {
    if (vocabs.length < 4) return;

    const quizVocabs: Vocabulary[] = shuffleArray(vocabs).slice(0, QUIZ_LENGTH);
    const newQuestions: Question[] = quizVocabs.map((vocab) =>
      generateQuestion(vocab, quizVocabs)
    );

    setQuestions(newQuestions); // type ตรงกัน
    setCurrentQuestionIndex(0);
    setScore(0);
    setQuizCompleted(false);
  }, [generateQuestion, vocabs]);

  // ดึงคำศัพท์จาก Supabase
  useEffect(() => {
    async function fetchVocabs() {
      const { data, error } = await supabase
        .from("vocab_tb")
        .select("vocab_id, english, thai");

      if (error) {
        console.error(error);
        return;
      }
      if (data) {
        setVocabs(data as Vocabulary[]);
      }
    }
    fetchVocabs();
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

  // สร้างแบบทดสอบเมื่อคอมโพเนนต์ถูกโหลด
  useEffect(() => {
    if (vocabs.length >= 4) {
      generateQuiz();
    }
  }, [vocabs, generateQuiz]);

  // จัดการเมื่อผู้ใช้เลือกคำตอบ
  const handleClickAnswer = (selectedAnswer: string) => {
    if (quizCompleted) return;

    const currentQ = questions[currentQuestionIndex];
    if (currentQ.answered) return;

    const isCorrect = selectedAnswer === currentQ.correctAnswer;

    // อัปเดตสถานะคำถามที่เพิ่งตอบ
    const updatedQuestions = [...questions];
    updatedQuestions[currentQuestionIndex] = {
      ...currentQ,
      userAnswer: selectedAnswer,
      isCorrect: isCorrect,
      answered: true,
    };

    setQuestions(updatedQuestions);

    // อัปเดตคะแนน
    if (isCorrect) {
      setScore((prevScore) => prevScore + 1);
    }

    // ตรวจสอบว่าแบบทดสอบเสร็จสมบูรณ์หรือไม่
    if (currentQuestionIndex === QUIZ_LENGTH - 1) {
      setTimeout(() => setQuizCompleted(true), 1000); // ดีเลย์ 1 วิก่อนแสดงผลสรุป
    } else {
      // ไปยังคำถามถัดไปหลังดีเลย์ 1 วิ
      setTimeout(
        () => setCurrentQuestionIndex((prevIndex) => prevIndex + 1),
        1000
      );
    }
  };

  const currentQuestion = questions[currentQuestionIndex];

  if (quizCompleted) {
    // หน้าแสดงผลสรุปคะแนนเมื่อทำแบบทดสอบเสร็จสิ้น
    return (
      <div className="relative flex flex-col min-h-screen bg-gradient-to-br from-yellow-100 via-pink-100 to-purple-200 overflow-hidden">
        {/* 🎆 แสดงพลุเมื่อได้ 10/10 */}
        {score === QUIZ_LENGTH && (
          <Confetti
            width={width}
            height={height}
            numberOfPieces={400}
            gravity={0.3}
            recycle={false}
          />
        )}
        {/*ลาย background*/}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-10 left-10 w-24 h-24 bg-yellow-300 rounded-full opacity-40 animate-bounce"></div>
          <div className="absolute top-32 right-20 w-32 h-32 bg-pink-400 rounded-full opacity-30 animate-pulse"></div>
          <div className="absolute bottom-20 left-1/4 w-20 h-20 bg-blue-300 rounded-full opacity-50 animate-bounce delay-100"></div>
          <div className="absolute top-1/2 right-10 w-28 h-28 bg-purple-300 rounded-full opacity-40 animate-pulse delay-200"></div>
          <div className="absolute bottom-40 right-1/3 w-24 h-24 bg-green-300 rounded-full opacity-30 animate-bounce delay-300"></div>
        </div>
        {/* Navbar */}
        <div className="relative ">
          <NavBarUser />
        </div>

        {/* คะแนน */}
        <div className="flex-1 flex items-center justify-center p-6">
          <div className="w-full max-w-lg bg-white/90 backdrop-blur-md p-10 rounded-3xl shadow-2xl border border-green-400/40 text-center">
            <h2 className="text-4xl  font-extrabold text-green-600 mb-4 animate-bounce">
              🎉 สิ้นสุดแบบทดสอบ 🎉
            </h2>
            <h1 className="text-lg md:text-xl text-gray-600 mb-6">
              คุณทำคะแนนได้:
            </h1>
            {/* คะแนน */}
            <h1 className="text-6xl md:text-7xl font-black text-pink-500 mb-8 animate-pulse">
              {score} / {QUIZ_LENGTH}
            </h1>

            {/* ปุ่ม */}
            <div className="flex flex-col gap-4">
              <button
                onClick={generateQuiz}
                className="w-full px-8 py-3 bg-gradient-to-r from-pink-500 to-pink-600 text-white font-semibold rounded-xl shadow-lg hover:scale-105 hover:shadow-2xl transition transform duration-200 flex items-center justify-center gap-2 text-lg"
              >
                <IoMdRefresh className="text-xl" /> Try Again
              </button>
              <button
                onClick={handleClickBack}
                className="w-full px-8 py-3 bg-gradient-to-r from-gray-600 to-gray-800 text-white font-semibold rounded-xl shadow-lg hover:scale-105 hover:shadow-2xl transition transform duration-200 flex items-center justify-center gap-2 text-lg"
              >
                <IoIosArrowBack className="text-xl" /> Back to Dashboard
              </button>
            </div>
          </div>
        </div>

        <Footer />
      </div>
    );
  }

  return (
    <div className="relative flex flex-col min-h-screen bg-gradient-to-br from-yellow-100 via-pink-100 to-purple-200 overflow-hidden">
      {/*ลาย background*/}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 w-24 h-24 bg-yellow-300 rounded-full opacity-40 animate-bounce"></div>
        <div className="absolute top-32 right-20 w-32 h-32 bg-pink-400 rounded-full opacity-30 animate-pulse"></div>
        <div className="absolute bottom-20 left-1/4 w-20 h-20 bg-blue-300 rounded-full opacity-50 animate-bounce delay-100"></div>
        <div className="absolute top-1/2 right-10 w-28 h-28 bg-purple-300 rounded-full opacity-40 animate-pulse delay-200"></div>
        <div className="absolute bottom-40 right-1/3 w-24 h-24 bg-green-300 rounded-full opacity-30 animate-bounce delay-300"></div>
      </div>
      {/* Navbar */}
      <div className="relative">
        <NavBarUser />
      </div>
      {/* ขยายเต็มพื้นที่ว่างใน flex container โดยใช้ flex-grow */}
      <div className="flex-grow p-6 md:p-10 max-w-6xl mx-auto w-full">
        {/* Content */}
        <div className="p-6 md:p-12">
          <div className="max-w-5xl mx-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
              <div>
                <h1 className="text-4xl md:text-5xl font-extrabold mb-2 text-indigo-600 drop-shadow-lg">
                  แบบทดสอบ
                </h1>
                <h2 className="text-gray-500 text-lg md:text-xl">
                  แบบทดสอบความรู้เกี่ยวกับคําศัพท์
                </h2>
              </div>

              <button
                onClick={handleClickBack}
                className="mt-4 md:mt-0 px-8 py-3 bg-gray-700 text-white font-bold rounded-xl shadow-lg hover:bg-gray-800 transition transform hover:scale-105 text-lg flex items-center"
              >
                <IoIosArrowBack className="text-xl mr-2" /> Back to Dashboard
              </button>
            </div>

            {/* Quiz Container */}
            <div className="bg-white/90 backdrop-blur-md p-8 rounded-3xl shadow-2xl border border-indigo-200/30">
              {/* Question Header */}
              <div className="flex justify-between items-center mb-6 border-b border-gray-200 pb-3">
                <h3 className="text-sm font-medium text-pink-500">
                  คำถามที่ {currentQuestionIndex + 1} จาก {QUIZ_LENGTH}
                </h3>
                <h3 className="text-sm font-medium text-gray-700">
                  คะแนน: {score}
                </h3>
              </div>

              {/* Question */}
              <h3 className="text-2xl font-bold text-gray-800 mb-6 text-center">
                คำศัพท์ภาษาไทยคือ:
              </h3>
              <div className="bg-pink-50 p-6 rounded-2xl shadow-inner mb-8">
                <h3 className="text-5xl md:text-6xl font-extrabold text-pink-600 text-center animate-pulse">
                  {currentQuestion?.thai}
                </h3>
              </div>

              {/* Options */}
              <div className="flex flex-col space-y-4">
                {currentQuestion?.options.map((option, index) => {
                  let buttonClass =
                    "p-4 rounded-xl shadow-md text-lg font-medium transition-all border-2";

                  if (currentQuestion.answered) {
                    if (option === currentQuestion.correctAnswer) {
                      buttonClass +=
                        " bg-green-500 text-white border-green-600 shadow-lg scale-105";
                    } else if (option === currentQuestion.userAnswer) {
                      buttonClass +=
                        " bg-red-500 text-white border-red-600 shadow-md line-through";
                    } else {
                      buttonClass +=
                        " bg-gray-100 text-gray-800 border-gray-300";
                    }
                  } else {
                    buttonClass +=
                      " bg-white text-gray-800 hover:bg-indigo-100 hover:scale-105";
                  }

                  return (
                    <button
                      key={index}
                      onClick={() => handleClickAnswer(option)}
                      className={buttonClass}
                      disabled={currentQuestion.answered}
                    >
                      {option}
                    </button>
                  );
                })}
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
