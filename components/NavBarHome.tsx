"use client";
import rocket from "./../assets/rocket.png";
import Image from "next/image";
import Link from "next/link";
import { CiLogin } from "react-icons/ci";
import { useRouter } from "next/navigation";

export default function NavBar() {
  const router = useRouter();
  return (
    <div className="fixed top-0 left-0 w-full z-50 bg-gradient-to-r from-yellow-300 via-pink-400 to-purple-500 shadow-2xl">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div
          className="absolute top-2 left-10 w-8 h-8 bg-white/30 rounded-full animate-bounce"
          style={{ animationDelay: "0s", animationDuration: "2s" }}
        ></div>
        <div
          className="absolute top-4 right-20 w-6 h-6 bg-white/20 rounded-full animate-bounce"
          style={{ animationDelay: "0.5s", animationDuration: "2.5s" }}
        ></div>
        <div
          className="absolute top-3 left-1/3 w-5 h-5 bg-white/25 rounded-full animate-bounce"
          style={{ animationDelay: "1s", animationDuration: "3s" }}
        ></div>
        <div
          className="absolute top-2 right-1/4 w-7 h-7 bg-white/15 rounded-full animate-bounce"
          style={{ animationDelay: "1.5s", animationDuration: "2.8s" }}
        ></div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
        <div className="flex justify-between items-center h-20">
          <div
            onClick={() => router.push("/")}
            className="flex items-center space-x-3 cursor-pointer transform transition-all duration-300 hover:scale-110 hover:rotate-3"
          >
            <div className="relative">
              <Image
                src={rocket}
                alt="Logo"
                className="w-12 h-12 drop-shadow-2xl animate-pulse"
              />
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-300 rounded-full animate-ping"></div>
            </div>
            <h1 className="text-3xl font-black tracking-wide drop-shadow-lg">
              <span className="text-white drop-shadow-[0_2px_8px_rgba(255,255,0,0.8)]">
                Vocab
              </span>{" "}
              <span className="text-red-700 drop-shadow-[0_2px_8px_rgba(255,0,0,0.8)]">
                Card
              </span>
            </h1>
          </div>

          <div className="hidden md:flex space-x-6 items-center">
            <Link
              href="/about"
              className="text-xl font-bold text-white px-6 py-2 rounded-full bg-white/20 backdrop-blur-sm hover:bg-white/40 hover:scale-110 transition-all duration-300 shadow-lg hover:shadow-2xl"
            >
              About Us
            </Link>

            <button
              type="button"
              onClick={() => (window.location.href = "/login")}
              className="flex items-center px-8 py-3 border-4 border-white text-xl font-black rounded-full shadow-2xl text-white bg-gradient-to-r from-green-400 to-blue-500 hover:from-green-500 hover:to-blue-600 transition-all duration-300 transform hover:scale-110 hover:rotate-2 cursor-pointer animate-pulse"
            >
              <CiLogin className="w-6 h-6 mr-2" />
              Sign in
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
