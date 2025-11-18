"use client";

import { useState, useEffect } from "react";
import NavBarUser from "@/components/NavBarUser";
import Footer from "@/components/Footer";
import { IoIosArrowBack } from "react-icons/io";
import { useRouter, useParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";

type User = {
  user_id: string;
  fullname: string;
  user_image_url: string;
};

// สร้าง Type ใหม่สำหรับเก็บคู่คำศัพท์
type VocabData = {
  english: string;
  thai: string;
};

export default function page() {
  const router = useRouter();
  const id = useParams().id;

  const [user, setUser] = useState<User | null>(null);

  // เปลี่ยนจาก string[] เป็น VocabData[] เพื่อเก็บคำแปลด้วย
  const [vocabList, setVocabList] = useState<VocabData[]>([]);

  // State สำหรับควบคุมเกมแบบทีละข้อ
  const [currentIndex, setCurrentIndex] = useState(0);

  const [gameStarted, setGameStarted] = useState(false);
  const [letters, setLetters] = useState<string[]>([]); // ตัวเลือกตัวอักษร (สลับแล้ว)
  const [currentWord, setCurrentWord] = useState<string[]>([]); // คำที่ผู้เล่นกำลังประกอบ
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(120);
  const [gameOver, setGameOver] = useState(false);
  const [message, setMessage] = useState("");

  const [mounted, setMounted] = useState(false);

  // ป้องกัน hydration issue
  useEffect(() => {
    setMounted(true);
  }, []);

  // ดึงข้อมูลผู้ใช้
  useEffect(() => {
    async function fetchUser() {
      const userId = localStorage.getItem("user_id");
      if (!userId) return;

      const { data, error } = await supabase
        .from("user_tb")
        .select("user_id, fullname, user_image_url")
        .eq("user_id", userId)
        .single();

      if (!error && data) setUser(data);
    }

    fetchUser();
  }, []);

  // ดึงคำศัพท์ของ user (English + Thai)
  useEffect(() => {
    async function fetchHistory() {
      const { data, error } = await supabase
        .from("history_tb")
        .select(
          `
          vocab_tb (
            vocab_id, 
            english,
            thai
          )
        `
        )
        .eq("user_id", id);

      if (!error && data) {
        // แปลงข้อมูลให้อยู่ในรูปแบบ VocabData array
        const words: VocabData[] = data
          .map((item: any) => ({
            english: item.vocab_tb?.english?.toUpperCase() || "",
            thai: item.vocab_tb?.thai || "",
          }))
          .filter((v) => v.english !== ""); // กรองคำว่างทิ้ง

        setVocabList(words);
      }
    }

    fetchHistory();
  }, [id]);

  // จับเวลา
  useEffect(() => {
    if (gameStarted && timeLeft > 0 && !gameOver) {
      const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
      return () => clearTimeout(timer);
    } else if (timeLeft === 0 && gameStarted) {
      setGameOver(true);
      setMessage("Time's up!");
    }
  }, [gameStarted, timeLeft, gameOver]);

  // --- สร้างฟังก์ชัน Shuffle กลาง (ใช้ได้ทั้งสลับโจทย์ และ สลับตัวอักษร) ---
  const shuffleArray = <T,>(array: T[]): T[] => {
    const newArr = [...array];
    for (let i = newArr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [newArr[i], newArr[j]] = [newArr[j], newArr[i]];
    }
    return newArr;
  };

  // ฟังก์ชันสลับตัวอักษร (เรียกใช้ฟังก์ชันกลาง)
  const scrambleWord = (word: string): string[] => {
    const shuffled = shuffleArray(word.split(""));
    // กันเหนียว: ถ้าสุ่มแล้วดันได้คำเดิมเป๊ะๆ ให้สุ่มใหม่ (เฉพาะคำยาวๆ)
    if (word.length > 1 && shuffled.join("") === word) {
      return scrambleWord(word);
    }
    return shuffled;
  };

  // --- startGame ให้สลับโจทย์แบบทั่วถึง ---
  const startGame = () => {
    if (vocabList.length === 0) {
      setMessage("Loading words... Please wait");
      return;
    }

    // ใช้ shuffleArray แทน sort random แบบเดิม (มั่วกว่าเดิมแน่นอน)
    const shuffledVocab = shuffleArray(vocabList);
    setVocabList(shuffledVocab);

    // เริ่มข้อที่ 0
    setCurrentIndex(0);
    setLetters(scrambleWord(shuffledVocab[0].english));

    setCurrentWord([]);
    setScore(0);
    setTimeLeft(120);
    setGameOver(false);
    setMessage("");
    setGameStarted(true);
  };

  // เพิ่มตัวอักษร (Logic เดิมที่เพิ่ม index)
  const addLetter = (letter: string, index: number) => {
    setCurrentWord([...currentWord, letter]);
    const newLetters = [...letters];
    newLetters.splice(index, 1);
    setLetters(newLetters);
  };

  // --- 3. แก้ไข Backspace และ Clear ให้สลับตัวเลือกใหม่ (ไม่ให้ต่อท้าย) ---

  const removeLastLetter = () => {
    if (currentWord.length === 0) return;

    const lastLetter = currentWord[currentWord.length - 1];

    // เอาตัวสุดท้ายออก
    setCurrentWord(currentWord.slice(0, -1));

    // คืนค่ากลับไป แล้ว "สลับใหม่เลย" เพื่อความยากและสวยงาม
    setLetters(shuffleArray([...letters, lastLetter]));
  };

  const clearWord = () => {
    // คืนค่าทั้งหมด แล้วสลับใหม่
    setLetters(shuffleArray([...letters, ...currentWord]));
    setCurrentWord([]);
  };

  // ฟังก์ชันส่งคำตอบ (Logic เปลี่ยนใหม่)
  const submitWord = () => {
    const inputWord = currentWord.join("");
    const targetWord = vocabList[currentIndex].english;

    // ตรวจคำตอบ (เทียบกับคำปัจจุบันเท่านั้น)
    if (inputWord === targetWord) {
      // 1. คำนวณคะแนน
      const points = targetWord.length * 10;
      setScore(score + points);
      setMessage(`Correct! +${points} pts`);

      // 2. เตรียมไปข้อต่อไป
      const nextIndex = currentIndex + 1;

      if (nextIndex < vocabList.length) {
        // ยังไม่หมดคำศัพท์ -> ไปข้อต่อไปทันที
        setCurrentIndex(nextIndex);
        setLetters(scrambleWord(vocabList[nextIndex].english));
        setCurrentWord([]); // เคลียร์ช่องคำตอบ
      } else {
        // หมดคำศัพท์แล้ว -> จบเกม
        setGameOver(true);
        setMessage("Congratulations! You completed all words!");
      }
    } else {
      // ตอบผิด
      setMessage("Incorrect, try again!");
      // Option: จะเคลียร์คำตอบให้เลยไหม? หรือให้ผู้เล่นลบเอง
      // setCurrentWord([]);
    }
  };

  const handleClickBack = () => {
    if (user?.user_id) router.push(`/dashboard/${user.user_id}`);
    else router.push("/");
  };

  // บันทึกคะแนน
  const saveScore = async () => {
    if (!user) return;

    try {
      const { data: lastScores, error: err } = await supabase
        .from("wordbuilder_score_tb")
        .select("play_count")
        .eq("user_id", user.user_id)
        .order("played_at", { ascending: false });

      if (err) throw err;

      const lastPlayCount =
        lastScores && lastScores.length > 0 ? lastScores[0].play_count : 0;
      const newPlayCount = lastPlayCount + 1;

      const { data, error } = await supabase
        .from("wordbuilder_score_tb")
        .insert([
          {
            user_id: user.user_id,
            wb_score: score,
            play_count: newPlayCount,
            played_at: new Date(),
          },
        ]);

      if (error) throw error;
      console.log("Score saved:", data);
    } catch (e) {
      console.error("Error saving score:", e);
    }
  };

  // บันทึกคะแนนเมื่อเกมจบ
  useEffect(() => {
    if (gameOver) saveScore();
  }, [gameOver]);

  if (!mounted) return null;

  // --- Render ---
  let content;

  if (!gameStarted) {
    // --- หน้าเริ่มเกม ---
    content = (
      <div className="flex flex-col items-center justify-center py-20 space-y-6">
        <h2 className="text-4xl font-bold text-indigo-600">
          Word Builder Game
        </h2>
        <p className="text-lg text-gray-600 text-center max-w-md">
          เรียงตัวอักษรให้เป็นคำศัพท์ที่ถูกต้อง ตามความหมายภาษาไทยที่กำหนดให้{" "}
          <br />
          <span className="text-red-600 font-semibold">
            คำศัพท์ที่มาจากคำศัพท์ที่คุณเรียนแล้ว
          </span>
        </p>
        <button
          onClick={startGame}
          disabled={vocabList.length < 5}
          className={`px-8 py-6 text-2xl font-bold bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-2xl shadow-xl transform transition ${
            vocabList.length < 5
              ? "opacity-50 cursor-not-allowed"
              : "hover:from-indigo-600 hover:to-purple-700 hover:scale-105 cursor-pointer"
          }`}
        >
          Start Game
        </button>
        {vocabList.length < 5 && (
          <p className="text-red-600 text-center mt-2">
            You need at least 5 words to play. <br />
            (ต้องมีประวัติการเรียนอย่างน้อย 5 คำ)
          </p>
        )}
      </div>
    );
  } else if (gameOver) {
    // --- หน้าจบเกม ---
    const isWin = currentIndex === vocabList.length; // ถ้าทำครบ index จะเท่ากับ length (เพราะ index เริ่มที่ 0 แล้ว +1 ตอนจบข้อสุดท้าย)
    // แต่ใน logic submitWord ถ้าจบเกม currentIndex จะยังเป็นค่าสุดท้ายอยู่ หรือ +1 แล้วแต่ logic
    // logic ข้างบน: ถ้า nextIndex < length ... else setGameOver. ดังนั้นเราดูที่ message หรือ score ก็ได้

    content = (
      <div className="flex flex-col items-center justify-center py-20 space-y-6">
        <h2
          className={`text-4xl font-bold ${
            score > 0 ? "text-green-600" : "text-red-600"
          }`}
        >
          {timeLeft === 0 ? "⏰ Time's Up!" : "🏆 Completed!"}
        </h2>
        <p className="text-2xl font-semibold text-gray-700">
          Final Score: {score}
        </p>
        <p className="text-lg text-gray-600">
          Completed:{" "}
          {currentIndex +
            1 +
            (timeLeft > 0 && currentIndex < vocabList.length ? 0 : 0)}{" "}
          / {vocabList.length} Words
          {/* Logic การโชว์จำนวนคำอาจปรับตามความเหมาะสม */}
        </p>

        <button
          onClick={startGame}
          className="px-8 py-4 text-xl font-bold bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-2xl shadow-xl transform hover:scale-105 transition cursor-pointer"
        >
          Play Again
        </button>
      </div>
    );
  } else {
    // --- หน้าเล่นเกม (Gameplay) ---
    content = (
      <div className="space-y-6">
        {/* Score / Timer / Progress */}
        <div className="flex justify-between items-center bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-4 rounded-xl shadow-lg">
          <div className="text-center">
            <p className="text-sm font-semibold">Score</p>
            <p className="text-3xl font-bold">{score}</p>
          </div>
          <div className="text-center">
            <p className="text-sm font-semibold">Time Left</p>
            <p
              className={`text-3xl font-bold ${
                timeLeft < 10 ? "text-red-300 animate-pulse" : ""
              }`}
            >
              {timeLeft}s
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm font-semibold">Progress</p>
            <p className="text-3xl font-bold">
              {currentIndex + 1} / {vocabList.length}
            </p>
          </div>
        </div>

        {/* *** ส่วนแสดงโจทย์ภาษาไทย (กลางบน) *** */}
        <div className="text-center py-2">
          <h3 className="text-gray-500 text-lg font-medium mb-1">
            แปลคำนี้เป็นภาษาอังกฤษ
          </h3>
          <h2 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-600 to-purple-600 drop-shadow-sm animate-in fade-in slide-in-from-bottom-4 duration-500">
            {vocabList[currentIndex]?.thai}
          </h2>
        </div>

        {/* Current Word Input Area */}
        <div className="bg-indigo-50 p-6 rounded-xl border-2 border-indigo-200 min-h-24 flex items-center justify-center">
          <div className="flex gap-2 flex-wrap justify-center">
            {currentWord.length > 0 ? (
              currentWord.map((letter, idx) => (
                <div
                  key={idx}
                  className="w-14 h-14 bg-white border-2 border-indigo-400 rounded-lg flex items-center justify-center text-2xl font-bold text-indigo-600 shadow-md"
                >
                  {letter}
                </div>
              ))
            ) : (
              <p className="text-gray-400 text-lg animate-pulse">
                Click letters below to build the word
              </p>
            )}
          </div>
        </div>

        {/* Message */}
        <div className="h-8">
          {/* จองพื้นที่ความสูงไว้ข้อความจะได้ไม่กระโดด */}
          {message && (
            <div
              className={`text-center p-2 rounded-lg font-semibold transition-all ${
                message.includes("Correct") || message.includes("pts")
                  ? "bg-green-100 text-green-700"
                  : message.includes("Incorrect")
                  ? "bg-red-100 text-red-700"
                  : "bg-gray-100 text-gray-700"
              }`}
            >
              {message}
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3 justify-center flex-wrap">
          <button
            onClick={submitWord}
            disabled={currentWord.length === 0}
            className="px-6 py-3 text-lg font-bold bg-green-500 hover:bg-green-600 text-white rounded-xl disabled:bg-gray-300 disabled:cursor-not-allowed cursor-pointer shadow-md active:scale-95 transition"
          >
            Submit Answer
          </button>
          <button
            onClick={removeLastLetter}
            disabled={currentWord.length === 0}
            className="px-6 py-3 text-lg font-bold bg-yellow-500 hover:bg-yellow-600 text-white rounded-xl disabled:bg-gray-300 disabled:cursor-not-allowed cursor-pointer shadow-md active:scale-95 transition"
          >
            Backspace
          </button>
          <button
            onClick={clearWord}
            disabled={currentWord.length === 0}
            className="px-6 py-3 text-lg font-bold bg-red-500 hover:bg-red-600 text-white rounded-xl disabled:bg-gray-300 disabled:cursor-not-allowed cursor-pointer shadow-md active:scale-95 transition"
          >
            Clear
          </button>
        </div>

        {/* Available Letters (Scrambled) */}
        <div>
          <h3 className="text-center text-lg font-bold text-gray-700 mb-4">
            Available Letters:
          </h3>
          <div className="flex gap-3 justify-center flex-wrap">
            {letters.map((letter, idx) => (
              <button
                key={idx}
                onClick={() => addLetter(letter, idx)}
                className="w-16 h-16 bg-gradient-to-br from-indigo-400 to-purple-500 hover:from-indigo-500 hover:to-purple-600 text-white text-2xl font-bold rounded-xl shadow-lg transform hover:scale-110 transition active:scale-95 cursor-pointer"
              >
                {letter}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative flex flex-col min-h-screen bg-gradient-to-br from-yellow-100 via-pink-100 to-purple-200 overflow-hidden">
      {/* Background Decoration */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 w-24 h-24 bg-yellow-300 rounded-full opacity-40 animate-bounce"></div>
        <div className="absolute top-32 right-20 w-32 h-32 bg-pink-400 rounded-full opacity-30 animate-pulse"></div>
        <div className="absolute bottom-20 left-1/4 w-20 h-20 bg-blue-300 rounded-full opacity-50 animate-bounce delay-100"></div>
      </div>

      {/* Main Content */}
      <div className="flex-grow p-4 md:p-6 lg:p-10 w-full">
        <div className="max-w-7xl mx-auto space-y-6">
          {/* Header Section */}
          <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white/40 backdrop-blur-sm p-4 md:p-6 rounded-2xl mt-15">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-indigo-600 drop-shadow-sm">
              🚧 Word Builder
            </h1>
            <button
              onClick={handleClickBack}
              className="px-6 py-3 bg-gray-700 text-white font-bold rounded-xl shadow-lg hover:bg-gray-800 transition transform hover:scale-105 text-base md:text-lg flex items-center gap-2 whitespace-nowrap cursor-pointer"
            >
              <IoIosArrowBack className="text-xl" /> Back to Dashboard
            </button>
          </div>

          <NavBarUser />
          <div className="bg-white p-6 md:p-8 rounded-3xl shadow-2xl border-2 border-indigo-200/50">
            <div className="relative z-10 flex-grow p-6 md:p-10 max-w-6xl mx-auto w-full mb-10 mt-5">
              {content}
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </div>
  );
}
