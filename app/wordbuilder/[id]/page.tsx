"use client";
import { useState, useEffect } from "react";
import { motion } from "framer-motion";

type WordCard = { word: string; meaning: string };

const vocabList: WordCard[] = [
  { word: "CAT", meaning: "แมว" },
  { word: "DOG", meaning: "สุนัข" },
  { word: "APPLE", meaning: "แอปเปิ้ล" },
  { word: "HOUSE", meaning: "บ้าน" },
];

export default function WordBuilderGame() {
  const [current, setCurrent] = useState<WordCard | null>(null);
  const [shuffledLetters, setShuffledLetters] = useState<string[]>([]);
  const [answer, setAnswer] = useState<string[]>([]);
  const [message, setMessage] = useState("");
  const [timeLeft, setTimeLeft] = useState(15); // 15 วินาที
  const [score, setScore] = useState(0);
  const [leaderboard, setLeaderboard] = useState<number[]>([]);

  useEffect(() => startNewRound(), []);

  function shuffleArray(array: string[]) {
    return [...array].sort(() => Math.random() - 0.5);
  }

  function startNewRound() {
    const random = vocabList[Math.floor(Math.random() * vocabList.length)];
    setCurrent(random);
    setShuffledLetters(shuffleArray(random.word.split("")));
    setAnswer([]);
    setMessage("");
    setTimeLeft(15); // รีเซตเวลา
  }

  // ⏱ จับเวลา
  useEffect(() => {
    if (timeLeft <= 0) {
      setMessage(`⏰ หมดเวลา! คำคือ: ${current?.word}`);
      setTimeout(startNewRound, 2000);
      return;
    }
    const timer = setInterval(() => setTimeLeft((t) => t - 1), 1000);
    return () => clearInterval(timer);
  }, [timeLeft, current]);

  function handleSelect(letter: string, index: number) {
    setAnswer((prev) => [...prev, letter]);
    setShuffledLetters((prev) => prev.filter((_, i) => i !== index));
  }

  function handleCheck() {
    if (!current) return;
    const result = answer.join("").toUpperCase();
    if (result === current.word.toUpperCase()) {
      const gained = timeLeft * 10; // คะแนน = เวลาที่เหลือ * 10
      setScore((s) => s + gained);
      setLeaderboard((lb) => [gained, ...lb].sort((a, b) => b - a).slice(0, 5)); // top5
      setMessage(`✅ ถูกต้อง! ได้ ${gained} คะแนน`);
      setTimeout(startNewRound, 2000);
    } else {
      setMessage("❌ ผิด ลองใหม่อีกครั้ง");
    }
  }

  function handleHint() {
    if (!current) return;
    // เปิดตัวอักษรแรกที่ถูกต้อง
    const firstLetter = current.word[answer.length];
    const idx = shuffledLetters.findIndex((l) => l === firstLetter);
    if (idx >= 0) handleSelect(firstLetter, idx);
    setScore((s) => Math.max(0, s - 5)); // เสีย 5 คะแนน
  }

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-indigo-50 p-4">
      <h1 className="text-3xl font-bold mb-4 text-indigo-700">
        🧩 Word Builder
      </h1>

      <p className="text-lg mb-2 text-gray-700">
        แปลว่า: <span className="font-semibold">{current?.meaning}</span>
      </p>

      <p className="text-lg mb-2 font-bold">⏱ เวลา: {timeLeft}s</p>
      <p className="text-lg mb-2 font-bold">⭐ คะแนน: {score}</p>

      <div className="flex flex-wrap gap-2 mb-4">
        {shuffledLetters.map((letter, index) => (
          <motion.button
            key={index}
            whileTap={{ scale: 0.9 }}
            onClick={() => handleSelect(letter, index)}
            className="bg-indigo-500 text-white font-bold text-xl px-4 py-2 rounded-lg shadow-md hover:bg-indigo-600"
          >
            {letter}
          </motion.button>
        ))}
      </div>

      <div className="min-h-[60px] flex gap-2 mb-4">
        {answer.map((letter, i) => (
          <motion.div
            key={i}
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            className="bg-green-500 text-white text-xl px-4 py-2 rounded-lg"
          >
            {letter}
          </motion.div>
        ))}
      </div>

      <div className="flex gap-2 mb-4">
        <button
          onClick={handleCheck}
          disabled={answer.length !== current?.word.length}
          className="bg-orange-500 text-white px-6 py-2 rounded-lg font-bold hover:bg-orange-600 transition"
        >
          ตรวจคำ
        </button>
        <button
          onClick={handleHint}
          className="bg-yellow-500 text-white px-6 py-2 rounded-lg font-bold hover:bg-yellow-600 transition"
        >
          Hint (-5 คะแนน)
        </button>
      </div>

      {message && <p className="mt-4 text-lg font-semibold">{message}</p>}

      <div className="mt-6 w-full max-w-md">
        <h2 className="text-xl font-bold mb-2">🏆 Leaderboard</h2>
        <ul className="bg-white p-4 rounded-lg shadow-md">
          {leaderboard.map((s, i) => (
            <li key={i} className="mb-1">
              {i + 1}. {s} คะแนน
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
