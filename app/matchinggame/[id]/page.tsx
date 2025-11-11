"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import { supabase } from "@/lib/supabaseClient";
import NavBarUser from "@/components/NavBarUser";
import Footer from "@/components/Footer";
import Swal from "sweetalert2";
import { IoIosArrowBack } from "react-icons/io";
import { VscDebugRestart } from "react-icons/vsc";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "react-hot-toast";
type User = {
  user_id: number;
  fullname: string;
  user_image_url: string;
};

type Vocabulary = {
  vocab_id: number;
  english: string;
  vocab_image_url: string;
};

type VocabularyCard = Vocabulary & { key: string };

type LeaderboardEntry = {
  fullname: string;
  fastest_time: string; // "MM:SS.ss"
  highest_score: number;
};

export default function page() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState<"easy" | "medium" | "hard">(
    "easy"
  );
  const [leaderboard, setLeaderboard] = useState<
    Record<string, LeaderboardEntry[]>
  >({
    easy: [],
    medium: [],
    hard: [],
  });

  const [vocabs, setVocabs] = useState<Vocabulary[]>([]);
  const [user, setUser] = useState<User | null>(null);
  const [cards, setCards] = useState<VocabularyCard[]>([]);
  const [flipped, setFlipped] = useState<VocabularyCard[]>([]);
  const [matched, setMatched] = useState<string[]>([]);
  const [score, setScore] = useState(0);
  const [highestScore, setHighestScore] = useState(0);

  const [highestScores, setHighestScores] = useState<{
    easy: number;
    medium: number;
    hard: number;
  }>({ easy: 0, medium: 0, hard: 0 });

  const [isShuffling, setIsShuffling] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const [showWarning, setShowWarning] = useState(false);

  const [isRunning, setIsRunning] = useState(false);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [showConfetti, setShowConfetti] = useState(false);
  const [difficulty, setDifficulty] = useState<"easy" | "medium" | "hard">(
    "easy"
  );
  const difficulties = ["easy", "medium", "hard"] as const;

  const pointsPerDifficulty: Record<"easy" | "medium" | "hard", number> = {
    easy: 200,
    medium: 400,
    hard: 500,
  };
  //ดึง leaderboard จาก Supabase มาแสดงที่ Leaderboard 10 แรกที่ได้เวลาน้อยที่สุด
  useEffect(() => {
    async function fetchLeaderboard() {
      const newData: Record<string, LeaderboardEntry[]> = {
        easy: [],
        medium: [],
        hard: [],
      };
      for (const diff of difficulties) {
        const { data, error } = await supabase
          .from("matchinggame_tb")
          .select("highest_score, fastest_time, user_tb(fullname)")
          .eq("difficulty", diff)
          .order("fastest_time", { ascending: true })
          .limit(10); // top 10
        if (!error && data) {
          newData[diff] = data.map((row: any) => ({
            fullname: row.user_tb.fullname,
            fastest_time: row.fastest_time,
            highest_score: row.highest_score,
          }));
        }
      }
      setLeaderboard(newData);
    }
    fetchLeaderboard();
  }, []);

  // ดึงคำศัพท์จาก Supabase
  useEffect(() => {
    async function fetchVocabs() {
      const { data, error } = await supabase
        .from("vocab_tb")
        .select("vocab_id, english, vocab_image_url");

      if (error) console.error(error);
      else setVocabs(data as Vocabulary[]);
    }
    fetchVocabs();
  }, []);

  // ดึงข้อมูลผู้ใช้
  useEffect(() => {
    async function fetchUser() {
      try {
        const userId = localStorage.getItem("user_id");
        if (!userId) return console.error("ไม่พบ userId ใน localStorage");

        const { data, error } = await supabase
          .from("user_tb")
          .select("user_id, fullname, user_image_url")
          .eq("user_id", userId)
          .single();

        if (error)
          console.error("เกิดข้อผิดพลาดในการดึงข้อมูลผู้ใช้:", error.message);
        else setUser(data as User);
      } catch (ex) {
        console.error("เกิดข้อผิดพลาดในการเชื่อมต่อ Supabase:", ex);
      }
    }
    fetchUser();
  }, []);

  // การ์ดจะสลับทุก 25 วินาที ในระดับ hard

  useEffect(() => {
    if (difficulty !== "hard" || cards.length === 0) return;
    const interval = setInterval(() => {
      // 1.  ปิดการ์ดที่เปิดอยู่ทั้งหมดก่อนเริ่มการเตือน
      //    ***สมมติว่าคุณมี setFlipped/setDisabled***
      // setFlipped([]);
      // setDisabled(false);
      setShowWarning(true); // แสดงข้อความเตือนก่อนสลับ
      setCountdown(3); // เริ่ม countdown 3 วินาที

      let counter = 3;
      const countdownInterval = setInterval(() => {
        counter -= 1;

        setCountdown(counter > 0 ? counter : null);
        if (counter <= 0) {
          clearInterval(countdownInterval);
          setShowWarning(false);
          setIsShuffling(true);

          // สลับเฉพาะการ์ดที่ยังไม่ matched

          setCards((prevCards) => {
            const matchedCards = prevCards.filter((card) =>
              matched.includes(card.key)
            );
            const unmatchedCards = prevCards.filter(
              (card) => !matched.includes(card.key)
            );
            // สุ่มเฉพาะ unmatched
            const shuffledUnmatched = [...unmatchedCards].sort(
              () => Math.random() - 0.5
            );
            // รวมกลับตามลำดับเดิม โดย matched จะอยู่ที่เดิม
            const newCards = prevCards.map((card) => {
              if (matched.includes(card.key)) return card; // คงที่
              return shuffledUnmatched.shift()!; // ดึงการ์ดใหม่จาก shuffled
            });

            // อัปเดต key ใหม่เฉพาะที่จำเป็น (เพื่อ animation ลื่นขึ้น)

            return newCards.map((card, idx) => ({
              ...card,
              // key ที่ใช้อัปเดต ควรช่วยให้ React จัดการ re-render ได้ดี
              // key: `${idx}-${card.vocab_id}`, // รูปแบบเดิม
              // อาจจะใช้ key เดิมของการ์ดที่ถูกสลับ เพื่อช่วยเรื่อง animation (ขึ้นอยู่กับ implementation ของการ์ด)
              // แต่รูปแบบเดิมก็ใช้ได้ หากต้องการบังคับให้ React ถือว่าเป็นการ์ดใหม่ในตำแหน่งใหม่
            }));
          });

          setTimeout(() => setIsShuffling(false), 500); // Glow effect
        }
      }, 1000);

      // 2. ✅ แก้ไขเป็น 25000 มิลลิวินาที (15 วินาที)
    }, 15000);

    return () => clearInterval(interval); // Cleanup
  }, [difficulty, cards.length, matched /*, setFlipped, setDisabled*/]);

  // ฟังก์ชันดึง highest score จาก Supabase
  // ฟังก์ชันดึงคะแนนสูงสุดจาก Supabase
  const fetchHighestScores = async () => {
    if (!user) return;

    try {
      const { data, error } = await supabase
        .from("matchinggame_tb")
        .select("difficulty, highest_score")
        .eq("user_id", user.user_id);

      if (error) {
        console.error("ดึง highest score ไม่สำเร็จ:", error.message);
        return;
      }

      const scores = { easy: 0, medium: 0, hard: 0 };
      data?.forEach((row: any) => {
        scores[row.difficulty as "easy" | "medium" | "hard"] =
          row.highest_score;
      });

      setHighestScores(scores);
    } catch (err) {
      console.error("เกิดข้อผิดพลาด:", err);
    }
  };

  // เรียกดึงคะแนนสูงสุดเมื่อ user ถูกโหลด
  useEffect(() => {
    if (user) fetchHighestScores();
  }, [user]);

  // เลือกคำศัพท์ตามระดับ
  const vocabsForDifficulty = (difficulty: "easy" | "medium" | "hard") => {
    let numPairs = 4;
    if (difficulty === "medium") numPairs = 6;
    if (difficulty === "hard") numPairs = 8;
    return vocabs.slice(0, numPairs);
  };

  // รีเซตเกม
  const resetGame = () => {
    setFlipped([]);
    setMatched([]);
    setElapsedTime(0);
    setScore(0);
    setIsRunning(false);

    const shuffled = [
      ...vocabsForDifficulty(difficulty),
      ...vocabsForDifficulty(difficulty),
    ]
      .map((item, index) => ({ ...item, key: `${index}-${item.vocab_id}` }))
      .sort(() => Math.random() - 0.5);
    setCards(shuffled);
  };

  // สร้างการ์ดใหม่เมื่อเปลี่ยนระดับหรือโหลดคำศัพท์
  useEffect(() => {
    if (vocabs.length === 0) return;
    resetGame();
  }, [vocabs, difficulty]);

  // จับเวลา
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isRunning) {
      const start = Date.now() - elapsedTime;
      timer = setInterval(() => setElapsedTime(Date.now() - start), 100);
    }
    return () => clearInterval(timer);
  }, [isRunning]);

  // แปลงเวลาเป็น MM:SS.sss
  const formatTimeForSupabase = (milliseconds: number) => {
    const totalSeconds = milliseconds / 1000;
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = (totalSeconds % 60).toFixed(2);
    return `${String(minutes).padStart(2, "0")}:${seconds.padStart(5, "0")}`;
  };

  // คำนวณคะแนนรวม ลดโบนัสทุก 0.5 วินาที
  const calculateScore = (
    matchedCount: number,
    difficulty: "easy" | "medium" | "hard",
    elapsedMs: number
  ) => {
    const baseScore = matchedCount * pointsPerDifficulty[difficulty];
    const elapsedSec = elapsedMs / 1000;
    const step = 0.5; // ลด 1 คะแนนทุก 0.5 วินาที
    const stepsPassed = Math.floor(elapsedSec / step);
    const bonus = Math.max(0, baseScore - stepsPassed);
    return bonus;
  };

  // พลิการ์ด
  const handleFlip = (card: VocabularyCard) => {
    if (!isRunning) setIsRunning(true);
    if (flipped.length === 2 || matched.includes(card.key)) return;

    const newFlipped = [...flipped, card];
    setFlipped(newFlipped);

    if (newFlipped.length === 2) {
      const [first, second] = newFlipped;
      if (first.vocab_id === second.vocab_id && first.key !== second.key) {
        setMatched((prev) => [...prev, first.key, second.key]);
        setShowConfetti(true);
        setTimeout(() => setShowConfetti(false), 2000);
      }
      setTimeout(() => setFlipped([]), 1000);
    }
  };
  //-------------------------------------------------------------------------------------
  //-------------------------------------------------------------------------------------==============
  // ตรวจสอบเกมจบ
  useEffect(() => {
    if (cards.length > 0 && matched.length === cards.length) {
      setIsRunning(false); // หยุดเวลา

      const numPairs = matched.length / 2;
      const finalScore = calculateScore(numPairs, difficulty, elapsedTime);

      setScore(finalScore);

      //  อัปเดต highest score ตาม difficulty
      setHighestScores((prev) => ({
        ...prev,
        [difficulty]: Math.max(prev[difficulty], finalScore),
      }));

      // บันทึก/อัปเดตลง Supabase
      saveUpdateResult(finalScore);

      setTimeout(() => {
        Swal.fire({
          title: "🎉 ยินดีด้วย!",
          html: `
    คะแนนรวม: <b>${finalScore}</b><br/>
    เวลา: <b>${formatTimeForSupabase(elapsedTime)}</b>
  `,
          icon: "success",
          confirmButtonText: "OK",
        }).then(() => window.location.reload());
      }, 500);
    }
  }, [matched, cards]);

  // บันทึก / อัปเดต highest_score
  // หลังจากอัปเดตคะแนนใหม่ ควรเรียก fetchHighestScores อีกครั้ง
  const saveUpdateResult = async (scoreToSave: number) => {
    if (!user) return;

    try {
      // ดึง row ปัจจุบันสำหรับ difficulty
      const { data: existingData, error: fetchError } = await supabase
        .from("matchinggame_tb")
        .select("highest_score")
        .eq("user_id", user.user_id)
        .eq("difficulty", difficulty)
        .single();

      if (fetchError && fetchError.code !== "PGRST116") {
        console.error("เกิดข้อผิดพลาดในการดึงคะแนน:", fetchError.message);
        return;
      }

      if (!existingData) {
        // insert
        await supabase.from("matchinggame_tb").insert([
          {
            difficulty,
            highest_score: scoreToSave,
            user_id: user.user_id,
            fastest_time: formatTimeForSupabase(elapsedTime),
          },
        ]);
      } else if (scoreToSave > existingData.highest_score) {
        // update
        await supabase
          .from("matchinggame_tb")
          .update({
            highest_score: scoreToSave,
            fastest_time: formatTimeForSupabase(elapsedTime),
          })
          .eq("user_id", user.user_id)
          .eq("difficulty", difficulty);
      }

      // อัปเดต state highestScores หลังบันทึก
      fetchHighestScores();
    } catch (err) {
      console.error("เกิดข้อผิดพลาด:", err);
    }
  };

  const handleClickBack = () => {
    router.push(`/dashboard/${user?.user_id}`);
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

      {/* Navbar */}
      <NavBarUser />
      <div className="relative z-10 flex-grow p-6 md:p-10 max-w-6xl mx-auto w-full mb-10">
        {/* Main Content */}
        <div className="flex-grow p-4 md:p-6 lg:p-10 w-full">
          <div className="max-w-7xl mx-auto space-y-6">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row items-center justify-between gap-4 bg-white/40 backdrop-blur-sm p-4 md:p-6 rounded-2xl">
              <h1 className="text-3xl md:text-4xl lg:text-5xl font-extrabold text-indigo-600 drop-shadow-sm">
                🎮 เกมจับคู่คำศัพท์
              </h1>
              <button
                onClick={handleClickBack}
                className="px-6 py-3 bg-gray-700 text-white font-bold rounded-xl shadow-lg hover:bg-gray-800 transition transform hover:scale-105 text-base md:text-lg flex items-center gap-2 whitespace-nowrap"
              >
                <IoIosArrowBack className="text-xl" /> Back to Dashboard
              </button>
            </div>

            {/* Leaderboard Section */}
            <div className="bg-white p-6 md:p-8 rounded-3xl shadow-2xl border-2 border-indigo-200/50">
              <div className="flex items-center justify-center md:justify-start gap-3 mb-6">
                <span className="text-3xl">🏆</span>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-800">
                  Leaderboard
                </h2>
              </div>

              {/* Tabs */}
              <div className="flex justify-center md:justify-start gap-2 md:gap-3 mb-6">
                {difficulties.map((diff) => (
                  <button
                    key={diff}
                    onClick={() => setActiveTab(diff)}
                    className={`px-5 md:px-7 py-2.5 md:py-3 font-semibold rounded-full transition-all text-sm md:text-base ${
                      activeTab === diff
                        ? "bg-indigo-500 text-white shadow-lg scale-105"
                        : "bg-gray-100 text-gray-700 hover:bg-indigo-100 hover:scale-105"
                    }`}
                  >
                    {diff === "easy"
                      ? "ง่าย"
                      : diff === "medium"
                      ? "ปานกลาง"
                      : "ยาก"}
                  </button>
                ))}
              </div>

              {/* Leaderboard Table */}
              <div className="overflow-x-auto rounded-xl shadow-md border border-gray-200">
                <table className="w-full table-auto text-left border-collapse">
                  <thead className="bg-indigo-500 text-white">
                    <tr>
                      <th className="py-4 px-4 md:px-6 text-sm md:text-base font-bold">
                        อันดับ
                      </th>
                      <th className="py-4 px-4 md:px-6 text-sm md:text-base font-bold">
                        ชื่อผู้เล่น
                      </th>
                      <th className="py-4 px-4 md:px-6 text-sm md:text-base font-bold">
                        คะแนนสูงสุด
                      </th>
                      <th className="py-4 px-4 md:px-6 text-sm md:text-base font-bold">
                        เวลาเร็วที่สุด
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {leaderboard[activeTab]?.length > 0 ? (
                      leaderboard[activeTab].map((entry, idx) => (
                        <tr
                          key={idx}
                          className={`${
                            idx % 2 === 0 ? "bg-gray-50" : "bg-white"
                          } hover:bg-indigo-50 transition-colors`}
                        >
                          <td className="py-3 px-4 md:px-6 font-bold text-sm md:text-base">
                            {idx === 0
                              ? "🥇"
                              : idx === 1
                              ? "🥈"
                              : idx === 2
                              ? "🥉"
                              : `${idx + 1}`}
                          </td>
                          <td className="py-3 px-4 md:px-6 text-sm md:text-base font-medium">
                            {entry.fullname}
                          </td>
                          <td className="py-3 px-4 md:px-6 text-sm md:text-base font-bold text-indigo-600">
                            {entry.highest_score}
                          </td>
                          <td className="py-3 px-4 md:px-6 text-sm md:text-base font-mono">
                            {entry.fastest_time}
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td
                          colSpan={4}
                          className="py-12 text-center text-gray-500 text-base"
                        >
                          ยังไม่มีข้อมูลในตารางผู้นำ
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Game Section */}
            <div className="bg-white p-6 md:p-8 rounded-3xl shadow-2xl border-2 border-indigo-200/50">
              {/* Timer and Scores Row */}
              <div className="flex flex-col lg:flex-row justify-between items-center gap-4 mb-8 pb-6 border-b-2 border-gray-200">
                <div className="flex items-center gap-3 px-6 py-3 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-full border-2 border-indigo-200">
                  <span className="text-3xl">⏱</span>
                  <span className="text-lg md:text-xl font-bold text-gray-800">
                    {formatTimeForSupabase(elapsedTime)}
                  </span>
                  <button
                    onClick={resetGame}
                    className="flex items-center justify-center w-12 h-12 bg-indigo-500 text-white rounded-full hover:bg-indigo-600 transition-shadow shadow-md"
                  >
                    <VscDebugRestart size={24} />
                  </button>
                </div>

                <div className="flex flex-wrap items-center justify-center gap-3 px-6 py-3 bg-gradient-to-r from-yellow-50 to-orange-50 rounded-full border-2 border-yellow-200">
                  <span className="text-2xl">🏆</span>
                  <div className="flex flex-wrap items-center gap-2 text-sm md:text-base font-semibold">
                    <span className="text-gray-700">ง่าย:</span>
                    <span className="text-indigo-600">
                      {highestScores.easy}
                    </span>
                    <span className="text-gray-400">•</span>
                    <span className="text-gray-700">ปานกลาง:</span>
                    <span className="text-indigo-600">
                      {highestScores.medium}
                    </span>
                    <span className="text-gray-400">•</span>
                    <span className="text-gray-700">ยาก:</span>
                    <span className="text-indigo-600">
                      {highestScores.hard}
                    </span>
                  </div>
                </div>
              </div>

              {/* Difficulty Selection */}
              <div className="mb-8">
                <h3 className="text-center text-lg md:text-xl font-bold text-gray-700 mb-4">
                  เลือกระดับความยาก
                </h3>
                <div className="flex justify-center gap-3 md:gap-4 flex-wrap">
                  {["easy", "medium", "hard"].map((level) => (
                    <button
                      key={level}
                      onClick={() =>
                        setDifficulty(level as "easy" | "medium" | "hard")
                      }
                      className={`px-6 md:px-10 py-3 md:py-4 rounded-2xl font-bold transition-all text-sm md:text-base shadow-md ${
                        difficulty === level
                          ? "bg-indigo-500 text-white shadow-xl scale-105 border-2 border-indigo-600"
                          : "bg-white text-gray-700 border-2 border-gray-300 hover:bg-indigo-100 hover:border-indigo-300 hover:scale-105"
                      }`}
                    >
                      {level === "easy"
                        ? "🟢 ง่าย (4 คู่)"
                        : level === "medium"
                        ? "🟡 ปานกลาง (6 คู่)"
                        : "🔴 ยาก (8 คู่)"}
                    </button>
                  ))}
                </div>
              </div>

              {/* Game Cards Grid */}
              <div className="relative flex flex-col items-center">
                {difficulty === "hard" && (
                  <div className="bg-red-50 border-l-4 border-red-400 text-red-700 p-4 mb-6 rounded">
                    <p className="font-bold">
                      ⚠️ ระดับยาก: การ์ดจะสลับที่กันเองทุกๆ 20 วินาที!
                    </p>
                  </div>
                )}

                <AnimatePresence>
                  {isShuffling && (
                    <motion.div
                      initial={{ opacity: 0, y: -20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -20 }}
                      transition={{ duration: 0.4 }}
                      className="bg-orange-100 border-2 border-orange-400 text-orange-700 p-3 mb-4 rounded-lg text-center font-bold animate-pulse"
                    >
                      🔄 การ์ดกำลังสลับที่...
                    </motion.div>
                  )}
                </AnimatePresence>
                <div
                  className={`grid gap-3 md:gap-4 mb-6 w-2/4 max-w-4xl
      ${difficulty === "easy" ? "grid-cols-2 md:grid-cols-4" : ""}
      ${difficulty === "medium" ? "grid-cols-3 md:grid-cols-4" : ""}
      ${difficulty === "hard" ? "grid-cols-4" : ""}`}
                >
                  {cards.map((card) => (
                    <motion.div
                      key={card.key}
                      onClick={() => handleFlip(card)}
                      layout
                      animate={{
                        scale:
                          flipped.includes(card) || matched.includes(card.key)
                            ? 1.05
                            : 1,
                        boxShadow: isShuffling
                          ? "0 0 20px rgba(99,102,241,0.7)"
                          : "0 0 10px rgba(0,0,0,0.1)",
                      }}
                      transition={{ duration: 0.5 }}
                      className={`relative aspect-square rounded-xl cursor-pointer transform transition-all duration-300 ${
                        matched.includes(card.key) ? "opacity-60" : ""
                      }`}
                    >
                      <div
                        className={`absolute inset-0 flex items-center justify-center text-white text-3xl md:text-4xl font-black rounded-xl shadow-lg transition-all duration-500 ${
                          flipped.includes(card) || matched.includes(card.key)
                            ? "bg-white border-4 border-indigo-300"
                            : "bg-gradient-to-br from-indigo-400 via-indigo-500 to-purple-500 hover:from-indigo-500 hover:to-purple-600 border-2 border-white"
                        }`}
                      >
                        {flipped.includes(card) ||
                        matched.includes(card.key) ? (
                          <Image
                            src={card.vocab_image_url || "/placeholder.svg"}
                            alt={card.english}
                            width={120}
                            height={120}
                            className="object-contain p-2 md:p-3"
                          />
                        ) : (
                          <span className="drop-shadow-lg">?</span>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}
