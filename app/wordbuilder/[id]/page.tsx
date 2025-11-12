"use client";

import { useState, useEffect } from "react";
import NavBarUser from "@/components/NavBarUser";
import Footer from "@/components/Footer";
import { IoIosArrowBack } from "react-icons/io";
import { useRouter, useParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { AiOutlineEnter } from "react-icons/ai";
import { FaBackspace } from "react-icons/fa";

type User = {
  user_id: string;
  fullname: string;
  user_image_url: string;
};

export default function Page() {
  const router = useRouter();
  const id = useParams().id;

  const [user, setUser] = useState<User | null>(null);
  const [vocabs, setVocabs] = useState<any>([]);
  const [validWords, setValidWords] = useState<string[]>([]);
  const [remainingWords, setRemainingWords] = useState<string[]>([]);

  const [gameStarted, setGameStarted] = useState(false);
  const [letters, setLetters] = useState<string[]>([]);
  const [currentWord, setCurrentWord] = useState<string[]>([]);
  const [foundWords, setFoundWords] = useState<string[]>([]);
  const [score, setScore] = useState(0);
  const [timeLeft, setTimeLeft] = useState(60);
  const [gameOver, setGameOver] = useState(false);
  const [message, setMessage] = useState("");

  const [mounted, setMounted] = useState(false); // ป้องกัน hydration issue

  // ตรวจสอบว่า client render เสร็จแล้ว
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

      if (!error && data) {
        setUser({
          user_id: data.user_id,
          fullname: data.fullname,
          user_image_url: data.user_image_url,
        });
      }
    }

    fetchUser();
  }, []);

  // ดึงคำศัพท์ของ user
  useEffect(() => {
    async function fetchHistory() {
      const { data, error } = await supabase
        .from("history_tb")
        .select("vocab_tb(vocab_id, english)")
        .eq("user_id", id);

      if (!error && data) {
        const words = data
          .map((item: any) => item.vocab_tb?.english)
          .filter(Boolean)
          .map((w: string) => w.toUpperCase());
        setValidWords(words);
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

  // ฟังก์ชันสุ่ม n คำ
  const getRandomWords = (n: number) => {
    const wordsCopy = [...validWords];
    const result: string[] = [];
    const limit = Math.min(n, wordsCopy.length);

    for (let i = 0; i < limit; i++) {
      const randIndex = Math.floor(Math.random() * wordsCopy.length);
      result.push(wordsCopy[randIndex]);
      wordsCopy.splice(randIndex, 1);
    }
    return result;
  };

  // ฟังก์ชันสุ่มตัวอักษรจาก words
  const generateLettersFromWords = (words: string[]) => {
    // เอาตัวอักษรทั้งหมดจากคำ
    let allLetters = Array.from(
      new Set(words.join("").toUpperCase().split(""))
    );

    // ต้องเติมตัวอักษรให้ครบ 12
    const needed = 12 - allLetters.length;
    if (needed > 0) {
      const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
      const remaining = alphabet
        .split("")
        .filter((l) => !allLetters.includes(l));
      for (let i = 0; i < needed; i++) {
        const randIndex = Math.floor(Math.random() * remaining.length);
        allLetters.push(remaining[randIndex]);
        remaining.splice(randIndex, 1);
      }
    }
    // สุ่มตัวอักษรและเลือก 12 ตัว
    return allLetters.sort(() => Math.random() - 0.5).slice(0, 12);
  };

  const startGame = () => {
    if (validWords.length === 0) {
      setMessage("Loading words... Please wait");
      return;
    }

    const randomWords = getRandomWords(5);
    setRemainingWords(randomWords);
    setLetters(generateLettersFromWords(randomWords));
    setCurrentWord([]);
    setFoundWords([]);
    setScore(0);
    setTimeLeft(60);
    setGameOver(false);
    setMessage("");
    setGameStarted(true);
  };

  // ฟังก์ชันเพิ่มตัวอักษรลงในคำปัจจุบัน
  const addLetter = (letter: string) =>
    setCurrentWord([...currentWord, letter]); // เพิ่มตัวอักษรใหม่เข้า array ของ currentWord

  // ฟังก์ชันลบตัวอักษรตัวสุดท้าย
  const removeLastLetter = () => setCurrentWord(currentWord.slice(0, -1)); // ตัดตัวอักษรสุดท้ายออกจาก currentWord

  // ฟังก์ชันล้างคำทั้งหมด
  const clearWord = () => setCurrentWord([]); // รีเซ็ต currentWord ให้เป็น array ว่าง

  // ฟังก์ชันส่งคำเพื่อเช็คว่าใช้ได้หรือไม่
  const submitWord = () => {
    const word = currentWord.join(""); // รวมตัวอักษรใน currentWord เป็น string

    // เช็คความยาวของคำ ต้องไม่น้อยกว่า 3 ตัวอักษร
    if (word.length < 3) return setMessage("Word must be at least 3 letters!");

    // เช็คว่าคำนี้เคยทายแล้วหรือยัง
    if (foundWords.includes(word))
      return setMessage("You already found this word!");

    // เช็คว่าคำนี้อยู่ใน validWords หรือไม่
    if (validWords.includes(word)) {
      const updatedFound = [...foundWords, word]; // สร้าง array ใหม่รวมคำที่เจอแล้ว
      setFoundWords(updatedFound); // อัปเดต state ของคำที่เจอ
      setScore(score + word.length * 10); // เพิ่มคะแนนตามความยาวคำ
      setMessage(`Great! +${word.length * 10} points`); // แสดงข้อความคะแนน
      setCurrentWord([]); // ล้าง currentWord เพื่อเริ่มพิมพ์คำใหม่

      // ตรวจสอบว่าผู้เล่นเจอคำครบทุกคำหรือยัง
      if (updatedFound.length === remainingWords.length) {
        setGameOver(true); // จบเกม
        setMessage("🎉 You Win! Congratulations!"); // แสดงข้อความชนะ
      }
    } else {
      setMessage("Not a valid word!"); // หากไม่ใช่คำที่ถูกต้อง
    }
  };

  const handleClickBack = () => {
    if (user?.user_id) router.push(`/dashboard/${user.user_id}`);
    else router.push("/");
  };

  if (!mounted) return null; // ป้องกัน hydration issue

  return (
    <div className="relative flex flex-col min-h-screen bg-gradient-to-br from-yellow-100 via-pink-100 to-purple-200 overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-10 left-10 w-24 h-24 bg-yellow-300 rounded-full opacity-40 animate-bounce"></div>
        <div className="absolute top-32 right-20 w-32 h-32 bg-pink-400 rounded-full opacity-30 animate-pulse"></div>
        <div className="absolute bottom-20 left-1/4 w-20 h-20 bg-blue-300 rounded-full opacity-50 animate-bounce delay-100"></div>
        <div className="absolute top-1/2 right-10 w-28 h-28 bg-purple-300 rounded-full opacity-40 animate-pulse delay-200"></div>
        <div className="absolute bottom-40 right-1/3 w-24 h-24 bg-green-300 rounded-full opacity-30 animate-bounce delay-300"></div>
      </div>

      <NavBarUser />
      <div className="relative z-10 flex-grow p-6 md:p-10 max-w-6xl mx-auto w-full mb-10 mt-5">
        <div className="flex-grow p-4 md:p-6 lg:p-10 w-full">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white/40 backdrop-blur-sm p-4 md:p-6 rounded-2xl ">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-indigo-600 drop-shadow-sm">
                🧱 Word Builder
              </h1>
              <button
                onClick={handleClickBack}
                className="px-6 py-3 bg-gray-700 text-white font-bold rounded-xl shadow-lg hover:bg-gray-800 transition transform hover:scale-105 text-base md:text-lg flex items-center gap-2 whitespace-nowrap cursor-pointer"
              >
                <IoIosArrowBack className="text-xl" /> Back to Dashboard
              </button>
            </div>

            <div className="bg-white/80 backdrop-blur-sm p-6 md:p-8 rounded-3xl shadow-2xl border-2 border-indigo-200/50">
              {!gameStarted ? (
                <div className="flex flex-col items-center justify-center py-20 space-y-6">
                  <h2 className="text-4xl font-bold text-indigo-600">
                    Word Builder Game
                  </h2>
                  <p className="text-lg text-gray-600 text-center max-w-md">
                    Create words from the given letters. Longer words score more
                    points!
                  </p>

                  <button
                    onClick={startGame}
                    disabled={validWords.length < 5} // ❌ ปิดปุ่มถ้าน้อยกว่า 5 คำ
                    className={`px-8 py-6 text-2xl font-bold bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-2xl shadow-xl transform transition 
                        ${
                          validWords.length < 5
                            ? "opacity-50 cursor-not-allowed hover:from-indigo-500 hover:to-purple-600 cursor-not-allowed"
                            : "hover:from-indigo-600 hover:to-purple-700 hover:scale-105 cursor-pointer"
                        }`}
                  >
                    Start Game
                  </button>

                  {validWords.length < 5 && (
                    <p className="text-red-600 text-center mt-2">
                      You need to learn at least 5 words to start the game.
                    </p>
                  )}
                </div>
              ) : gameOver && foundWords.length === remainingWords.length ? (
                // หน้าชนะ (You Win)
                <div className="flex flex-col items-center justify-center py-20 space-y-6">
                  <h2 className="text-4xl font-bold text-green-600">
                    🎉 You Won!
                  </h2>
                  <div className="text-center space-y-2">
                    <p className="text-2xl font-semibold text-gray-700">
                      Final Score: {score} points
                    </p>
                    <p className="text-lg text-gray-600">
                      Words Found: {foundWords.length}
                    </p>
                  </div>
                  <div className="w-full max-w-md">
                    <h3 className="text-xl font-bold text-gray-700 mb-3 text-center">
                      Your Words:
                    </h3>
                    <div className="flex flex-wrap gap-2 justify-center">
                      {foundWords.map((word, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1 bg-green-100 text-green-700 rounded-lg font-semibold"
                        >
                          {word}
                        </span>
                      ))}
                    </div>
                  </div>
                  <button
                    onClick={startGame}
                    className="px-8 py-4 text-xl font-bold bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-2xl shadow-xl transform hover:scale-105 transition cursor-pointer"
                  >
                    Play Again
                  </button>
                </div>
              ) : gameOver ? (
                //หน้า แพ้
                <div className="flex flex-col items-center justify-center py-20 space-y-6">
                  <h2 className="text-4xl font-bold text-red-600">
                    Game Over!
                  </h2>
                  <div className="text-center space-y-2">
                    <p className="text-2xl font-semibold text-gray-700">
                      Final Score: {score} points
                    </p>
                    <p className="text-lg text-gray-600">
                      Words Found: {foundWords.length}
                    </p>
                  </div>
                  <div className="w-full max-w-md">
                    <h3 className="text-xl font-bold text-gray-700 mb-3 text-center">
                      Your Words:
                    </h3>
                    <div className="flex flex-wrap gap-2 justify-center">
                      {foundWords.map((word, idx) => (
                        <span
                          key={idx}
                          className="px-3 py-1 bg-green-100 text-green-700 rounded-lg font-semibold"
                        >
                          {word}
                        </span>
                      ))}
                    </div>
                  </div>
                  <button
                    onClick={startGame}
                    className="px-8 py-4 text-xl font-bold bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-2xl shadow-xl transform hover:scale-105 transition cursor-pointer"
                  >
                    Play Again
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Score and Timer */}
                  <div className="flex justify-between items-center bg-gradient-to-r from-indigo-500 to-purple-600 text-white p-4 rounded-xl shadow-lg">
                    <div className="text-center">
                      <p className="text-sm font-semibold">Score</p>
                      <p className="text-3xl font-bold">{score}</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-semibold">Time Left</p>
                      <p className="text-3xl font-bold">{timeLeft}s</p>
                    </div>
                    <div className="text-center">
                      <p className="text-sm font-semibold">Words</p>
                      <p className="text-3xl font-bold">{foundWords.length}</p>
                    </div>
                  </div>

                  {/* Current Word Display */}
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
                        <p className="text-gray-400 text-lg">
                          Click letters to build a word
                        </p>
                      )}
                    </div>
                  </div>

                  {/* Message */}
                  {message && (
                    <div
                      className={`text-center p-3 rounded-lg font-semibold ${
                        message.includes("Great") || message.includes("points")
                          ? "bg-green-100 text-green-700"
                          : "bg-red-100 text-red-700"
                      }`}
                    >
                      {message}
                    </div>
                  )}

                  {/* Action Buttons */}
                  <div className="flex gap-3 justify-center flex-wrap">
                    <button
                      onClick={submitWord}
                      disabled={currentWord.length < 3}
                      className="px-6 py-3 text-lg font-bold bg-green-500 hover:bg-green-600 text-white rounded-xl disabled:bg-gray-300 disabled:cursor-not-allowed cursor-pointer"
                    >
                      Submit Word
                    </button>
                    <button
                      onClick={removeLastLetter}
                      disabled={currentWord.length === 0}
                      className="px-6 py-3 text-lg font-bold bg-yellow-500 hover:bg-yellow-600 text-white rounded-xl disabled:bg-gray-300 disabled:cursor-not-allowed cursor-pointer"
                    >
                      Backspace
                    </button>
                    <button
                      onClick={clearWord}
                      disabled={currentWord.length === 0}
                      className="px-6 py-3 text-lg font-bold bg-red-500 hover:bg-red-600 text-white rounded-xl disabled:bg-gray-300 disabled:cursor-not-allowed cursor-pointer"
                    >
                      Clear
                    </button>
                  </div>
                  {/* แสดงจำนวนคำที่ยังไม่ได้ทาย */}
                  <div className="text-center mt-4">
                    <p className="text-lg font-semibold text-gray-700">
                      Words remaining:{" "}
                      {remainingWords.length - foundWords.length}
                    </p>
                  </div>

                  {/* Available Letters */}
                  <div>
                    <h3 className="text-center text-lg font-bold text-gray-700 mb-4">
                      Available Letters:
                    </h3>
                    <div className="flex gap-3 justify-center flex-wrap">
                      {letters.map((letter, idx) => (
                        <button
                          key={idx}
                          onClick={() => addLetter(letter)}
                          className="w-16 h-16 bg-gradient-to-br from-indigo-400 to-purple-500 hover:from-indigo-500 hover:to-purple-600 text-white text-2xl font-bold rounded-xl shadow-lg transform hover:scale-110 transition active:scale-95 cursor-pointer"
                        >
                          {letter}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Found Words */}
                  {foundWords.length > 0 && (
                    <div>
                      <h3 className="text-center text-lg font-bold text-gray-700 mb-3">
                        Found Words ({foundWords.length}):
                      </h3>
                      <div className="flex flex-wrap gap-2 justify-center">
                        {foundWords.map((word, idx) => (
                          <span
                            key={idx}
                            className="px-3 py-1 bg-green-100 text-green-700 rounded-lg font-semibold text-sm"
                          >
                            {word} ({word.length * 10}pts)
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
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
