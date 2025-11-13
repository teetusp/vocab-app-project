"use client";
import type React from "react";
import { useState, useEffect } from "react";
import { useRouter, useParams } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import Image from "next/image";
import { CiUser, CiMail, CiEdit, CiTrash } from "react-icons/ci";
import { IoIosArrowBack } from "react-icons/io";
import SweetAlert from "sweetalert2";
import NavBarUser from "../../../components/NavBarUser";
import Footer from "../../../components/Footer";
import { FaTransgender } from "react-icons/fa";
import { FaBirthdayCake } from "react-icons/fa";

type User = {
  user_id: string;
  fullname: string;
  email: string;
  birthdate: string;
  password: string;
  gender: string;
  user_image_url: string;
  created_at: string;
};

export default function page() {
  const router = useRouter();
  const user_id = useParams().id;

  const [user, setUser] = useState<User | null>(null);
  const [activeTab, setActiveTab] = useState<"profile" | "stats">("profile");
  const [vocabCount, setVocabCount] = useState<number | null>(null);

  const [highestHangmanScore, setHighestHangmanScore] = useState(0);

  const [wbMax, setWbMax] = useState<number>(0);
  const [wbAvg, setWbAvg] = useState<number>(0);
  const [mgStats, setMgStats] = useState<{
    Easy: number;
    Normal: number;
    Hard: number;
  }>({
    Easy: 0,
    Normal: 0,
    Hard: 0,
  });

  useEffect(() => {
    async function fetchData() {
      const { data, error } = await supabase
        .from("user_tb")
        .select("*")
        .eq("user_id", user_id)
        .single();

      if (error) {
        console.log(error);
        SweetAlert.fire(
          "เกิดข้อผิดพลาด",
          "ไม่สามารถดึงข้อมูลผู้ใช้ได้",
          "error"
        );
        return;
      }

      setUser(data);
    }
    fetchData();
  }, [user_id]);

  //ดึงข้อมูลจาก wordbuilder_score_tb
  useEffect(() => {
    if (!user) return;

    const fetchWordBuilderStats = async () => {
      // ดึงคะแนนสูงสุด
      const { data: maxData, error: maxError } = await supabase
        .from("wordbuilder_score_tb")
        .select("wb_score")
        .eq("user_id", user.user_id)
        .order("wb_score", { ascending: false })
        .limit(1)
        .single();

      if (!maxError && maxData) setWbMax(maxData.wb_score);

      // ดึงค่าเฉลี่ย
      const { data: avgData, error: avgError } = await supabase
        .from("wordbuilder_score_tb")
        .select("wb_score", { count: "exact", head: false })
        .eq("user_id", user.user_id);

      if (!avgError && avgData && avgData.length > 0) {
        const sum = avgData.reduce((acc, item: any) => acc + item.wb_score, 0);
        setWbAvg(Math.round(sum / avgData.length));
      }
    };

    fetchWordBuilderStats();
  }, [user]);

  //ดึงข้อมูลจาก matching_game_tb
  useEffect(() => {
    async function fetchMatchingGameStats() {
      if (!user_id) return;

      const { data, error } = await supabase
        .from("matchinggame_tb")
        .select("difficulty, highest_score")
        .eq("user_id", user_id);

      if (error) {
        console.error("Failed to fetch matching game stats:", error);
        return;
      }

      // default 0
      const stats = { Easy: 0, Normal: 0, Hard: 0 };

      data?.forEach((row: any) => {
        const diff = row.difficulty?.toLowerCase();
        if (!diff) return;

        if (diff === "easy") stats.Easy = row.highest_score || 0;
        else if (diff === "normal") stats.Normal = row.highest_score || 0;
        else if (diff === "hard") stats.Hard = row.highest_score || 0;
      });

      setMgStats(stats);
    }

    fetchMatchingGameStats();
  }, [user_id]);

  //ดึงข้อมูลคะแนนจาก hangman_score_tb
  useEffect(() => {
    async function fetchHighestHangmanScore() {
      if (!user?.user_id) return;

      const { data, error } = await supabase
        .from("hangman_score_tb")
        .select("hm_score")
        .eq("user_id", user.user_id)
        .order("hm_score", { ascending: false }) // เรียงจากมากไปน้อย
        .limit(1)
        .single(); // เอาค่าบรรทัดแรก

      if (error) {
        console.error("❌ Failed to fetch highest Hangman score:", error);
        setHighestHangmanScore(0);
      } else {
        setHighestHangmanScore(data?.hm_score ?? 0);
      }
    }

    fetchHighestHangmanScore();
  }, [user?.user_id]);

  //ลบบัญชี
  async function handleDeleteUserClick(id: string, image_url: string) {
    const result = await SweetAlert.fire({
      title: "คุณแน่ใจหรือไม่?",
      text: "ต้องการลบบัญชีนี้หรือไม่?",
      icon: "warning",
      iconColor: "#d33",
      showCancelButton: true,
      confirmButtonText: "ยืนยัน",
      cancelButtonText: "ยกเลิก",
    });

    if (!result.isConfirmed) return;

    if (image_url) {
      const image_name = image_url.split("/").pop() as string;
      await supabase.storage.from("user_bk").remove([image_name]);
    }

    await supabase.from("user_tb").delete().eq("user_id", id);
    router.push("/");
  }
  //ดึงจำนวนนับคํา
  useEffect(() => {
    async function fetchVocabCount() {
      const { count, error } = await supabase
        .from("history_tb")
        .select("vocab_id", { count: "exact", head: true })
        .eq("user_id", user_id);

      if (error) {
        console.error("Error fetching vocab count:", error);
        return;
      }
      setVocabCount(count ?? 0);
    }

    fetchVocabCount();
  }, [user_id]);

  return (
    <div className="relative flex flex-col min-h-screen bg-gray-50">
      <NavBarUser />

      <div className="flex-grow max-w-4xl mx-auto pt-24 px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
          <div className="flex border-b border-gray-200">
            {[
              { id: "profile", label: "View Profile" },
              { id: "stats", label: "Game Stats" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as "profile" | "stats")}
                className={`flex-1 px-6 py-4 text-base font-medium transition-colors ${
                  activeTab === tab.id
                    ? "text-indigo-600 border-b-2 border-indigo-600 bg-indigo-50/50"
                    : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>

          <div className="p-6 sm:p-8">
            {activeTab === "profile" && (
              <div className="space-y-8">
                <div className="flex justify-center">
                  <Image
                    src={user?.user_image_url || "/user.png"}
                    alt="User profile"
                    width={120}
                    height={120}
                    className="w-32 h-32 object-cover rounded-full border-2 border-gray-200"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <ProfileField
                    icon={<CiUser />}
                    label="ชื่อผู้ใช้"
                    value={user?.fullname}
                  />
                  <ProfileField
                    icon={<CiMail />}
                    label="อีเมล"
                    value={user?.email}
                  />
                  <ProfileField
                    icon={<FaTransgender />}
                    label="เพศ"
                    value={user?.gender}
                  />
                  <ProfileField
                    icon={<FaBirthdayCake />}
                    label="วันเกิด"
                    value={
                      user
                        ? new Date(user.birthdate).toLocaleDateString("th-TH", {
                            year: "numeric",
                            month: "long",
                            day: "numeric",
                          })
                        : "-"
                    }
                  />
                </div>

                <div className="flex flex-wrap justify-center gap-3 pt-4">
                  <button
                    className="px-5 py-2.5 bg-white border border-gray-300 text-gray-700 rounded-lg font-medium hover:bg-gray-50 transition-colors flex items-center gap-2"
                    onClick={() => router.back()}
                  >
                    <IoIosArrowBack className="text-lg" /> Back
                  </button>
                  <button
                    className="px-5 py-2.5 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors flex items-center gap-2"
                    onClick={() => router.push(`/edituser/${user_id}`)}
                  >
                    <CiEdit className="text-lg" /> Edit Profile
                  </button>
                  <button
                    className="px-5 py-2.5 bg-red-600 text-white rounded-lg font-medium hover:bg-red-700 transition-colors flex items-center gap-2"
                    onClick={() =>
                      handleDeleteUserClick(
                        user?.user_id || "",
                        user?.user_image_url || ""
                      )
                    }
                  >
                    <CiTrash className="text-lg" /> Delete Account
                  </button>
                </div>
              </div>
            )}

            {activeTab === "stats" && (
              <div className="space-y-6">
                <div className="text-center pb-2">
                  <h3 className="text-2xl font-semibold text-gray-900">
                    Player Statistics
                  </h3>
                  <p className="text-gray-600 mt-1">
                    แสดงสถิติการเล่นเกมของคุณที่นี่
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  <StatBox
                    label="จำนวนคำศัพท์ที่เรียน"
                    value={`${vocabCount} คำ`}
                  />
                  <StatBox
                    label="คะแนนเกม Word Builder สูงสุด"
                    value={`${wbMax} คะแนน`}
                  />
                  <StatBox
                    label="คะแนนเกม Word Builder เฉลี่ย"
                    value={`${wbAvg} คะแนน`}
                  />
                  <StatBox
                    label="คะแนนเกม Matching Game Easy"
                    value={`${mgStats.Easy} คะแนน`}
                  />
                  <StatBox
                    label="คะแนนเกม Matching Game Normal"
                    value={`${mgStats.Normal} คะแนน`}
                  />
                  <StatBox
                    label="คะแนนเกม Matching Game Hard"
                    value={`${mgStats.Hard} คะแนน`}
                  />
                  <StatBox
                    label="ได้คำในเกม Hangman สูงสุด"
                    value={`${highestHangmanScore} คำ`}
                  />{" "}
                  <StatBox
                    label="วันที่สมัคร"
                    value={
                      user?.created_at
                        ? new Date(user.created_at).toLocaleDateString(
                            "en-GB",
                            {
                              day: "2-digit",
                              month: "short",
                              year: "2-digit",
                            }
                          )
                        : "-"
                    }
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}

function ProfileField({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value?: string;
}) {
  return (
    <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
      <span className="text-xl text-indigo-600">{icon}</span>
      <div className="min-w-0 flex-1">
        <p className="text-xs text-gray-500 font-medium">{label}</p>
        <p className="text-sm font-medium text-gray-900 truncate">
          {value || "-"}
        </p>
      </div>
    </div>
  );
}

function StatBox({ label, value }: { label: string; value: string }) {
  return (
    <div className="p-4 bg-gray-50 rounded-lg border border-gray-200 transition-colors hover:bg-gray-100">
      <p className="text-xs text-gray-600 mb-1.5">{label}</p>
      <p className="text-lg font-semibold text-indigo-600">{value}</p>
    </div>
  );
}
