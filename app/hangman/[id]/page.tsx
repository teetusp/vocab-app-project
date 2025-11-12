"use client";
import { useState, useEffect } from "react";
import NavBarUser from "@/components/NavBarUser";
import Footer from "@/components/Footer";
import { IoIosArrowBack } from "react-icons/io";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import { motion } from "framer-motion";

// ประเภทข้อมูลผู้ใช้
type User = {
  user_id: string;
  fullname: string;
  user_image_url: string;
};

// ประเภทข้อมูลคำศัพท์
type Word = {
  word_id: number;
  word: string;
  hint: string;
};

const KEYBOARD_ROWS = [
  "qwertyuiop".split(""),
  "asdfghjkl".split(""),
  "zxcvbnm".split(""),
];

export default function page() {
  const router = useRouter();

  // -----------------------
  // State ของผู้ใช้และคำศัพท์
  // -----------------------
  const [user, setUser] = useState<User | null>(null); // ข้อมูลผู้ใช้
  const [words, setWords] = useState<Word[]>([]); // คำศัพท์ทั้งหมดจาก Supabase
  const [word, setWord] = useState<string>(""); // คำสุ่มรอบนี้

  const [supabaseError, setSupabaseError] = useState<string | null>(null);

  // -----------------------
  // State ของเกม
  // -----------------------
  const [startGame, setStartGame] = useState(false); // เริ่มเกมหรือยัง
  const [guessedLetters, setGuessedLetters] = useState<string[]>([]); // ตัวอักษรที่เดาแล้ว
  const [wrongGuesses, setWrongGuesses] = useState(0); // จำนวนครั้งผิด
  const maxWrong = 6; // จำนวนครั้งผิดสูงสุด
  const [gameOver, setGameOver] = useState(false); // แพ้
  const [gameWon, setGameWon] = useState(false); // ชนะ
  const [score, setScore] = useState(0); // จำนวนคำที่ผ่าน
  const [showHint, setShowHint] = useState(false); // แสดง hint หรือไม่
  const [currentWordObj, setCurrentWordObj] = useState<Word | null>(null); // คำปัจจุบันพร้อม hint
  const [hintUsed, setHintUsed] = useState(false); // ใช้ hint ไปแล้วหรือยัง
  const [totalHintsUsed, setTotalHintsUsed] = useState(0); // จำนวน hint ที่ใช้ไปทั้งหมดในเกม
  const maxHintsPerGame = 5; // จำกัด hint ทั้งหมด 5 ครั้งต่อเกม

  // -----------------------
  // ดึงข้อมูลผู้ใช้จาก localStorage + Supabase
  // -----------------------
  useEffect(() => {
    async function fetchUser() {
      try {
        const userId = localStorage.getItem("user_id");
        if (!userId) {
          console.log("ไม่พบ userId ใน localStorage - ใช้โหมด demo");
          return;
        }

        const { data, error } = await supabase
          .from("user_tb")
          .select("user_id, fullname, user_image_url")
          .eq("user_id", userId)
          .single();

        if (error) console.error(error);
        else setUser(data);
      } catch (ex) {
        console.error("เกิดข้อผิดพลาดในการเชื่อมต่อ Supabase:", ex);
      }
    }
    fetchUser();
  }, []);

  // -----------------------
  // ดึงคำศัพท์จาก Supabase
  // -----------------------
  useEffect(() => {
    async function fetchWords() {
      const { data, error } = await supabase
        .from("hangman_words_tb")
        .select("word_id, word, hint");

      if (error) console.error(error);
      else setWords(data as Word[]);
    }
    fetchWords();
  }, []);

  // -----------------------
  // เริ่มเกมใหม่
  // -----------------------
  const startNewGame = () => {
    if (words.length === 0) return;
    const randomWordObj = words[Math.floor(Math.random() * words.length)];
    setWord(randomWordObj.word.toLowerCase());
    setCurrentWordObj(randomWordObj);
    setGuessedLetters([]);
    setWrongGuesses(0);
    setGameOver(false);
    setGameWon(false);
    setStartGame(true);
    setShowHint(false);
    setHintUsed(false);
    setTotalHintsUsed(0);
    setScore(0);
  };

  // -----------------------
  // ฟังก์ชันเดาตัวอักษร
  // -----------------------
  const handleGuess = (letter: string) => {
    if (gameOver || gameWon || guessedLetters.includes(letter)) return;

    setGuessedLetters((prev) => [...prev, letter]);

    if (!word.includes(letter)) {
      setWrongGuesses((prev) => prev + 1);
    }
  };

  useEffect(() => {
    const handleKeyPress = (event: KeyboardEvent) => {
      // ตรวจสอบว่าเกมกำลังเล่นอยู่หรือไม่
      if (!startGame || gameWon || gameOver) return;

      const key = event.key.toLowerCase();
      // ตรวจสอบว่าเป็นตัวอักษร a-z หรือไม่
      if (/^[a-z]$/.test(key)) {
        handleGuess(key);
      }
    };

    window.addEventListener("keydown", handleKeyPress);

    // ลบ event listener เมื่อ component ถูก unmount
    return () => {
      window.removeEventListener("keydown", handleKeyPress);
    };
  }, [startGame, gameWon, gameOver, guessedLetters, word]);

  // -----------------------
  // ตรวจสอบชนะ/แพ้
  // -----------------------
  useEffect(() => {
    if (!word) return;
    const wordLetters = Array.from(new Set(word.split("")));
    const won = wordLetters.every((l) => guessedLetters.includes(l));

    if (won && !gameWon) {
      setGameWon(true);
      setScore((prev) => prev + 10); // เพิ่มคะแนน
    }

    if (wrongGuesses >= maxWrong) setGameOver(true);
  }, [guessedLetters, wrongGuesses, word, gameWon]);

  // -----------------------
  // แสดงคำ
  // -----------------------
  const displayWord = word
    .split("")
    .map((l) => (guessedLetters.includes(l) ? l.toUpperCase() : "_"))
    .join(" ");

  // -----------------------
  // กลับไป Dashboard
  // -----------------------
  const handleClickBack = () => {
    if (user?.user_id) {
      router.push(`/dashboard/${user.user_id}`);
    } else {
      router.push("/");
    }
  };

  // -----------------------
  // Hangman Figure
  // -----------------------
  const HangmanFigure = ({ wrongGuesses }: { wrongGuesses: number }) => {
    return (
      <svg width="120" height="180" className="mx-auto mb-4">
        {/* เสา */}
        <line
          x1="10"
          y1="170"
          x2="110"
          y2="170"
          stroke="#333"
          strokeWidth="4"
        />
        <line x1="30" y1="170" x2="30" y2="20" stroke="#333" strokeWidth="4" />
        <line x1="30" y1="20" x2="80" y2="20" stroke="#333" strokeWidth="4" />
        <line x1="80" y1="20" x2="80" y2="40" stroke="#333" strokeWidth="4" />

        {/* Head - ผิดครั้งที่ 1 */}
        {wrongGuesses > 0 && (
          <motion.circle
            cx="80"
            cy="50"
            r="10"
            fill="#facc15"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          />
        )}

        {/* Body - ผิดครั้งที่ 2 */}
        {wrongGuesses > 1 && (
          <motion.line
            x1="80"
            y1="60"
            x2="80"
            y2="100"
            stroke="#f59e0b"
            strokeWidth="4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          />
        )}

        {/* Left arm - ผิดครั้งที่ 3 */}
        {wrongGuesses > 2 && (
          <motion.line
            x1="80"
            y1="70"
            x2="60"
            y2="90"
            stroke="#f59e0b"
            strokeWidth="4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          />
        )}

        {/* Right arm - ผิดครั้งที่ 4 */}
        {wrongGuesses > 3 && (
          <motion.line
            x1="80"
            y1="70"
            x2="100"
            y2="90"
            stroke="#f59e0b"
            strokeWidth="4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          />
        )}

        {/* Left leg - ผิดครั้งที่ 5 */}
        {wrongGuesses > 4 && (
          <motion.line
            x1="80"
            y1="100"
            x2="60"
            y2="130"
            stroke="#f59e0b"
            strokeWidth="4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          />
        )}

        {/* Right leg - ผิดครั้งที่ 6 */}
        {wrongGuesses > 5 && (
          <motion.line
            x1="80"
            y1="100"
            x2="100"
            y2="130"
            stroke="#f59e0b"
            strokeWidth="4"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.5 }}
          />
        )}
      </svg>
    );
  };

  // -----------------------
  // Load Next Word
  // -----------------------
  const loadNextWord = () => {
    if (words.length === 0) return;
    const randomWordObj = words[Math.floor(Math.random() * words.length)];
    setWord(randomWordObj.word.toLowerCase());
    setCurrentWordObj(randomWordObj);
    setGuessedLetters([]);
    setWrongGuesses(0);
    setGameWon(false);
    setShowHint(false);
    setHintUsed(false);
  };

  const handleShowHint = () => {
    if (!hintUsed && !showHint && totalHintsUsed < maxHintsPerGame) {
      setHintUsed(true);
      setTotalHintsUsed((prev) => prev + 1);
    }
    setShowHint(!showHint);
  };

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
                🤔 Hangman Game
              </h1>
              <button
                onClick={handleClickBack}
                className="px-6 py-3 bg-gray-700 text-white font-bold rounded-xl shadow-lg hover:bg-gray-800 transition transform hover:scale-105 text-base md:text-lg flex items-center gap-2 whitespace-nowrap cursor-pointer"
              >
                <IoIosArrowBack className="text-xl" /> Back to Dashboard
              </button>
            </div>

            {/* แสดงปุ่ม Start Game */}
            {!startGame && (
              <div className="bg-white p-8 md:p-12 rounded-3xl shadow-2xl border-2 border-indigo-200/50 text-center">
                <h2 className="text-3xl md:text-4xl font-bold mb-4 text-purple-800">
                  🎮 Welcome to Hangman
                </h2>
                <p className="text-lg text-gray-700 mb-8">
                  เดาตัวอักษรให้ถูกต้อง ก่อนที่คนจะถูกแขวน! <br />
                  <span>Guess the letter correctly before the person is hanged!</span>
                </p>
                <button
                  onClick={startNewGame}
                  disabled={words.length === 0}
                  className="px-8 py-4 bg-gradient-to-r from-purple-500 to-indigo-600 text-white font-bold text-xl rounded-xl shadow-lg hover:from-purple-600 hover:to-indigo-700 transition transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                >
                  {words.length === 0 ? "กำลังโหลด..." : "🚀 Start Game"}
                </button>
              </div>
            )}
            {/* แสดงหน้าผ่านเมื่อเดาคำถูก */}
            {startGame && gameWon && !gameOver && (
              <div className="relative">
                <div className="bg-white p-6 md:p-8 rounded-3xl shadow-2xl border-2 border-indigo-200/50 opacity-30">
                  <div className="flex justify-center items-center mb-4 ">
                    <h2 className="text-2xl font-bold text-purple-800 drop-shadow-sm">
                      Hangman
                    </h2>
                    {/*<div className="text-lg font-bold text-green-600">คะแนน: {score}</div>*/}
                  </div>

                  <HangmanFigure wrongGuesses={wrongGuesses} />

                  <div className="text-center mb-4 font-bold text-red-600">
                    ❌ Worng: {wrongGuesses} / {maxWrong}
                  </div>

                  <div className="text-2xl font-mono mb-1 tracking-widest text-center">
                    {displayWord}
                  </div>
                  <div className="text-sm text-gray-500 mb-6 text-center">
                    (Letters: {word.length})
                  </div>

                  <div className="space-y-2 mb-4">
                    {KEYBOARD_ROWS.map((row, rowIndex) => (
                      <div key={rowIndex} className="flex justify-center gap-1">
                        {row.map((letter) => (
                          <button
                            key={letter}
                            disabled
                            className="w-10 h-10 rounded font-bold bg-gray-300 text-gray-500"
                          >
                            {letter.toUpperCase()}
                          </button>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-white/95 backdrop-blur-sm p-8 md:p-12 rounded-3xl shadow-2xl border-2 border-green-200/50 text-center">
                    <h2 className="text-3xl md:text-4xl font-bold mb-4 text-green-600">
                      🎉 Congratulations! You won!
                    </h2>
                    <p className="text-xl text-gray-700 mb-2">
                      The word that is correct is:{" "}
                      <span className="font-bold uppercase text-green-600">
                        {word}
                      </span>
                    </p>
                    <p className="text-lg text-gray-600 mb-8">
                      {/* คะแนนของคุณ: <span className="font-bold text-purple-600">{score} คำ</span> */}
                    </p>
                    <button
                      onClick={loadNextWord}
                      className="px-8 py-4 bg-gradient-to-r from-green-500 to-emerald-600 text-white font-bold text-xl rounded-xl shadow-lg hover:from-green-600 hover:to-emerald-700 transition transform hover:scale-105 cursor-pointer"
                    >
                      ➡️ Next word
                    </button>
                  </div>
                </div>
              </div>
            )}

            {/* แสดงหน้าผ่านเมื่อเดาคำผิด */}
            {startGame && gameOver && (
              <div className="relative">
                <div className="bg-white p-6 md:p-8 rounded-3xl shadow-2xl border-2 border-indigo-200/50 opacity-30">
                  <div className="flex justify-center  items-center mb-4">
                    <h2 className="text-4xl font-bold text-purple-800">
                      Hangman
                    </h2>
                    {/*<div className="text-lg font-bold text-green-600">คะแนน: {score}</div>*/}
                  </div>
                  <p className="mb-2 text-gray-700">
                    เดาตัวอักษรจนกว่าจะถูก หรือหมดโอกาส
                  </p>

                  <HangmanFigure wrongGuesses={wrongGuesses} />

                  <div className="text-center mb-4 font-bold text-red-600">
                    ❌ Wrong: {wrongGuesses} / {maxWrong}
                  </div>

                  <div className="text-2xl font-mono mb-1 tracking-widest text-center">
                    {displayWord}
                  </div>
                  <div className="text-sm text-gray-500 mb-6 text-center">
                    (Letters: {word.length})
                  </div>

                  <div className="space-y-2 mb-4">
                    {KEYBOARD_ROWS.map((row, rowIndex) => (
                      <div key={rowIndex} className="flex justify-center gap-1">
                        {row.map((letter) => (
                          <button
                            key={letter}
                            disabled
                            className="w-10 h-10 rounded font-bold bg-gray-300 text-gray-500"
                          >
                            {letter.toUpperCase()}
                          </button>
                        ))}
                      </div>
                    ))}
                  </div>
                </div>

                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="bg-white/95 backdrop-blur-sm p-8 md:p-12 rounded-3xl shadow-2xl border-2 border-red-200/50 text-center">
                    <h2 className="text-3xl md:text-4xl font-bold mb-4 text-red-600">
                      😢 Game Over - You Lost
                    </h2>
                    <p className="text-xl text-gray-700 mb-2">
                      The word that is correct is:{" "}
                      <span className="font-bold uppercase text-red-600">
                        {word}
                      </span>
                    </p>
                    {/*<p className="text-lg text-gray-600 mb-8">
                      คะแนนรวม: <span className="font-bold text-purple-600">{score} คำ</span>
                    </p>*/}
                    <button
                      onClick={startNewGame}
                      className="px-8 py-4 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-bold text-xl rounded-xl shadow-lg hover:from-blue-600 hover:to-indigo-700 transition transform hover:scale-105 cursor-pointer"
                    >
                      Start New Game
                    </button>
                  </div>
                </div>
              </div>
            )}

            {startGame && !gameWon && !gameOver && (
              <div className="bg-white p-6 md:p-8 rounded-3xl shadow-2xl border-2 border-indigo-200/50">
                <div className="flex justify-center  items-center mb-4">
                  <h2 className="text-4xl font-bold text-purple-800">
                    Hangman
                  </h2>
                  {/*<div className="text-lg font-bold text-green-600">คะแนน: {score}</div>*/}
                </div>

                {/* แสดง Hangman Figure */}
                <HangmanFigure wrongGuesses={wrongGuesses} />

                <div className="text-center mb-4 font-bold text-red-600">
                  ❌ Wrong: {wrongGuesses} / {maxWrong}
                </div>

                <div className="text-2xl font-mono mb-1 tracking-widest text-center">
                  {displayWord}
                </div>
                <div className="text-sm text-gray-500 mb-6 text-center">
                  (Letters: {word.length})
                </div>

                <div className="text-center mb-4">
                  {!hintUsed && totalHintsUsed < maxHintsPerGame && (
                    <button
                      onClick={handleShowHint}
                      className="px-6 py-2 bg-yellow-500 text-white font-bold rounded-lg shadow transition transform hover:scale-105 hover:bg-yellow-600 cursor-pointer"
                    >
                      💡 Show Hint ({maxHintsPerGame - totalHintsUsed} Left)
                    </button>
                  )}
                  {showHint && currentWordObj?.hint && (
                    <div className="mt-3 p-3 bg-yellow-50 border-2 border-yellow-300 rounded-lg">
                      <p className="text-gray-700 font-semibold ">
                        💡 Hint:{" "}
                        <span className="text-yellow-700">
                          {currentWordObj.hint}
                        </span>
                      </p>
                    </div>
                  )}
                </div>

                <div className="space-y-2 mb-4">
                  {KEYBOARD_ROWS.map((row, rowIndex) => (
                    <div key={rowIndex} className="flex justify-center gap-1">
                      {row.map((letter) => (
                        <button
                          key={letter}
                          onClick={() => handleGuess(letter)}
                          disabled={
                            guessedLetters.includes(letter) ||
                            gameOver ||
                            gameWon
                          }
                          className={`w-10 h-10 rounded font-bold transition-colors ${
                            guessedLetters.includes(letter)
                              ? "bg-gray-300 text-gray-500 cursor-not-allowed"
                              : "bg-purple-500 text-white hover:bg-purple-600 active:bg-purple-700 cursor-pointer"
                          }`}
                        >
                          {letter.toUpperCase()}
                        </button>
                      ))}
                    </div>
                  ))}
                </div>
                <p className="mb-2 text-gray-700 text-center mt-10">
                  {" "}
                  <span className="text-red-600">*</span>เดาตัวอักษรจนกว่าจะถูก
                  หรือหมดโอกาส
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
