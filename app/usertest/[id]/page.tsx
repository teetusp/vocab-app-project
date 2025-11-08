"use client";
import React from "react";
import { IoIosArrowBack } from "react-icons/io";
import { useState, useEffect, useCallback } from "react";
import NavBarUser from "@/components/NavBarUser";
import Footer from "@/components/Footer";
import { useRouter, useParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

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

export default function () {
  const router = useRouter();
  const id = useParams().id;

  const [vocabs, setVocabs] = useState<Vocabulary[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [score, setScore] = useState(0);
  const [quizCompleted, setQuizCompleted] = useState(false);
  const [options, setOptions] = useState<string[]>([]);

  const QUIZ_LENGTH = 5; //

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

    setQuestions(newQuestions); // ✅ type ตรงกัน
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

  const handleClickBack = () => {
    router.back();
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
      <div className="min-h-screen bg-pink-100 ">
        <div className="relative z-40">
          <NavBarUser />
        </div>
        {/* ส่วนแสดงผลสรุปคะแนน */}
        <div className="w-screen h-screen flex items-center justify-center bg-pink-100">
          <div className="w-full max-w-lg bg-white p-8 rounded-3xl shadow-2xl border-4 border-green-400 text-center">
            <h2 className="text-4xl font-extrabold text-green-600 mb-4">
              🎉 สิ้นสุดแบบทดสอบ 🎉
            </h2>
            <h1 className="text-xl text-gray-700 mb-6">คุณทำคะแนนได้:</h1>
            {/* คะแนนที่ได้ / จำนวนคำถาม */}
            <h1 className="text-6xl font-black text-pink-500 mb-8">
              {score} / {QUIZ_LENGTH}
            </h1>
            <button
              onClick={generateQuiz}
              className="w-full mb-3 px-8 py-3 bg-pink-500 text-white font-bold rounded-full shadow-xl hover:bg-pink-600 transition duration-150 transform hover:scale-105 text-lg"
            >
              ทำแบบทดสอบอีกครั้ง
            </button>
            <button
              onClick={handleClickBack}
              className="w-full px-8 py-3 bg-gray-600 text-white font-bold rounded-full shadow-xl hover:bg-gray-700 transition duration-150 transform hover:scale-105 text-lg"
            >
              <IoIosArrowBack className="text-xl inline-block mr-2" />{" "}
              กลับไปหน้าหลัก
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div>
      <div className="min-h-screen bg-pink-100">
        <div className="relative z-40">
          <NavBarUser />
        </div>
        <div className="p-6 md:p-10">
          <div className="max-w-7xl mx-auto">
            {/* ส่วนหัวเรื่อง */}
            <div className="flex justify-between items-center mb-6">
              <div>
                <h1 className="text-4xl font-bold mb-2 text-indigo-600 drop-shadow-md">
                  แบบทดสอบ
                </h1>
                <h2 className="text-gray-600">
                  แบบทดสอบความรู้เกี่ยวกับคําศัพท์
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
            {/* กล่องหลักของแบบทดสอบ */}
            <div className="bg-white p-6 rounded-3xl shadow-2xl border-4 border-indigo-200/50">
              <div className="flex justify-between items-center mb-6 border-b pb-3">
                {/* หัวข้อของแบบทดสอบ */}
                <h3 className="text-sm font-semibold text-pink-500">
                  คำถามที่ {currentQuestionIndex + 1} จาก {QUIZ_LENGTH}
                </h3>
                <h3 className="text-sm font-semibold text-gray-700">
                  คะแนน: {score}
                </h3>
              </div>

              <h3 className="text-2xl font-bold text-gray-800 mb-4 text-center">
                คำศัพท์ภาษาไทยคือ:
              </h3>
              <div className="bg-pink-100 p-4 rounded-xl mb-8">
                <h3 className="text-4xl font-extrabold text-pink-700 text-center">
                  {currentQuestion?.thai}
                </h3>
              </div>

              <div className="flex flex-col space-y-3">
                {currentQuestion?.options.map((option, index) => {
                  // กำหนดสีปุ่มตามสถานะ
                  let buttonClass = "p-3 rounded-lg shadow transition border-2";

                  if (currentQuestion.answered) {
                    if (option === currentQuestion.correctAnswer) {
                      buttonClass +=
                        " bg-green-500 text-white border-green-700"; // คำที่ตอบถูก สีเขียว
                    } else if (option === currentQuestion.userAnswer) {
                      buttonClass += " bg-red-500 text-white border-red-700"; // เลิอกคำตอบผิด จะขึ้นปุ่มสีแดง
                    } else {
                      buttonClass +=
                        " bg-gray-200 text-gray-900 border-gray-400"; // ตอบที่ไม่ได้เลือก
                    }
                  } else {
                    buttonClass +=
                      " bg-white text-gray-800 hover:bg-indigo-100 border-gray-300"; 
                  }

                  return (
                    <button
                      key={index}
                      onClick={() => handleClickAnswer(option)}
                      className={buttonClass}
                      disabled={currentQuestion.answered} // ป้องกันกดซ้ำ
                    >
                      {option}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={handleClickBack}
                className="mt-8 w-full px-8 py-3 bg-gray-600 text-white font-bold rounded-full shadow-xl hover:bg-gray-700 transition duration-150 transform hover:scale-105 text-lg"
              >
                <IoIosArrowBack className="text-xl inline-block mr-2" />{" "}
                กลับไปหน้าหลัก
              </button>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
