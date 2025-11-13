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

export default function page() {
  const router = useRouter();
  const id = useParams().id;

  const [user, setUser] = useState<User | null>(null);
  const [validWords, setValidWords] = useState<string[]>([]);

  const [gameStarted, setGameStarted] = useState(false);
  const [letters, setLetters] = useState<string[]>([]);
  const [currentWord, setCurrentWord] = useState<string[]>([]);
  const [foundWords, setFoundWords] = useState<string[]>([]);
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

  // ฟังก์ชันสุ่มตัวอักษรจาก words
  const generateLettersFromWords = (words: string[]) => {
    let allLetters = Array.from(
      new Set(words.join("").toUpperCase().split(""))
    );
    const needed = 26 - allLetters.length;
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
    return allLetters.sort(() => Math.random() - 0.5).slice(0, 26);
  };
  // เริ่มเกม
  const startGame = () => {
    if (validWords.length === 0) {
      setMessage("Loading words... Please wait");
      return;
    }

    setLetters(generateLettersFromWords(validWords));
    setCurrentWord([]);
    setFoundWords([]);
    setScore(0);
    setTimeLeft(120);
    setGameOver(false);
    setMessage("");
    setGameStarted(true);
  };

  //เพิ่มตัวอักษร
  const addLetter = (letter: string) =>
    setCurrentWord([...currentWord, letter]);
  const removeLastLetter = () => setCurrentWord(currentWord.slice(0, -1));
  const clearWord = () => setCurrentWord([]);

  const submitWord = () => {
    const word = currentWord.join("");
    if (word.length < 3) return setMessage("Word must be at least 3 letters!");
    if (foundWords.includes(word))
      return setMessage("You already found this word!");
    if (validWords.includes(word)) {
      const updatedFoundWords = [...foundWords, word];
      setFoundWords(updatedFoundWords);
      setScore(score + word.length * 10);
      setMessage(`Great! +${word.length * 10} points`);
      setCurrentWord([]);

      // เช็คว่าผู้เล่นหาได้ครบทุกคำหรือยัง
      if (updatedFoundWords.length === validWords.length) {
        setGameOver(true);
        setMessage("Congratulations! You found all words!");
      }
    } else {
      setMessage("Not a valid word!");
    }
  };

  const handleClickBack = () => {
    if (user?.user_id) router.push(`/dashboard/${user.user_id}`);
    else router.push("/");
  };

  // บันทึกคะแนน
  // ฟังก์ชันบันทึกคะแนน
  const saveScore = async () => {
    if (!user) return;

    try {
      // ดึง play_count ล่าสุด (ถ้ามี)
      const { data: lastScores, error: err } = await supabase
        .from("wordbuilder_score_tb")
        .select("play_count")
        .eq("user_id", user.user_id)
        .order("played_at", { ascending: false });

      if (err) {
        console.error(
          "Failed to fetch last score:",
          err.message,
          err.details,
          err.hint
        );
        return;
      }

      const lastPlayCount =
        lastScores && lastScores.length > 0 ? lastScores[0].play_count : 0;
      const newPlayCount = lastPlayCount + 1;

      // บันทึก record ใหม่
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

      if (error) {
        console.error(
          "Failed to insert score:",
          error.message,
          error.details,
          error.hint
        );
      } else {
        console.log("Score saved:", data);
      }
    } catch (e) {
      console.error("Unexpected error:", e);
    }
  };

  // บันทึกคะแนนเมื่อเกมจบ
  useEffect(() => {
    if (gameOver) saveScore();
  }, [gameOver]);

  if (!mounted) return null;

  // --- เลือก content ตามสถานะเกม ---
  let content;
  if (!gameStarted) {
    // หน้าเริ่มเกม
    content = (
      <div className="flex flex-col items-center justify-center py-20 space-y-6">
        <h2 className="text-4xl font-bold text-indigo-600">
          Word Builder Game
        </h2>
        <p className="text-lg text-gray-600 text-center max-w-md">
          Create words from the given letters. Longer words score more points!{" "}
          <br />
          <span className="text-red-600">
            คำศัพท์มาจากคําศัพท์ที่คุณเรียนทั้งหมด
          </span>
        </p>
        <button
          onClick={startGame}
          disabled={validWords.length < 5}
          className={`px-8 py-6 text-2xl font-bold bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-2xl shadow-xl transform transition ${
            validWords.length < 5
              ? "opacity-50 cursor-not-allowed"
              : "hover:from-indigo-600 hover:to-purple-700 hover:scale-105 cursor-pointer"
          }`}
        >
          Start Game
        </button>
        {validWords.length < 5 && (
          <p className="text-red-600 text-center mt-2">
            You need at least 5 words to play.
            <br />
            คุณต้องเรียนคําศัพท์อย่างน้อย 5 คํา
          </p>
        )}
      </div>
    );
  } else if (gameOver) {
    const isWin = foundWords.length === validWords.length;
    content = (
      <div className="flex flex-col items-center justify-center py-20 space-y-6">
        <h2
          className={`text-4xl font-bold ${
            isWin ? "text-green-600" : "text-red-600"
          }`}
        >
          {isWin ? "🏆 You Win!" : "⏰ Game Over!"}
        </h2>
        <p className="text-2xl font-semibold text-gray-700">
          Final Score: {score}
        </p>
        <p className="text-lg text-gray-600">
          Words Found: {foundWords.length} / {validWords.length}
        </p>
        <div className="flex flex-wrap gap-2 justify-center max-w-2xl">
          {foundWords.map((word, idx) => (
            <span
              key={idx}
              className="px-3 py-1 bg-green-100 text-green-700 rounded-lg font-semibold text-sm"
            >
              {word} ({word.length * 10}pts)
            </span>
          ))}
        </div>
        <button
          onClick={startGame}
          className="px-8 py-4 text-xl font-bold bg-gradient-to-r from-indigo-500 to-purple-600 hover:from-indigo-600 hover:to-purple-700 text-white rounded-2xl shadow-xl transform hover:scale-105 transition cursor-pointer"
        >
          Play Again
        </button>
      </div>
    );
  } else {
    // หน้าเกมกำลังเล่น
    content = (
      <div className="space-y-6">
        {/* Score / Timer / Words */}
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
            <p className="text-3xl font-bold">
              {foundWords.length} / {validWords.length}
            </p>
          </div>
        </div>

        {/* Current Word */}
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
    );
  }

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
            <div className="flex justify-center  items-center mb-4"></div>
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
