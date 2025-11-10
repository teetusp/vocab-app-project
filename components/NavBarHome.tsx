"use client";
import React from "react";
import rocket from "./../assets/rocket.png";
import design from "./../assets/design.png";
import Image from "next/image";
import Link from "next/link";
import { CiLogin } from "react-icons/ci";
import { useRouter } from "next/navigation";

export default function NavBar() {
  const router = useRouter();
  return (
    <div className="sticky top-0 z-50 bg-white/30 backdrop-blur-md shadow-lg border-b border-white/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* โลโก้/ชื่อแอป */}
          <div
            onClick={() => router.push("/")}
            className="flex items-center space-x-2 cursor-pointer transition-transform duration-200 hover:scale-105"
          >
            <Image
              src={rocket}
              alt="Logo"
              className="w-12 h-12 md:w-14 md:h-14"
            />
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-wide">
              <span className="text-yellow-400 drop-shadow-md">Card</span>{" "}
              <span className="text-red-400 drop-shadow-md">Vocab</span>
            </h1>
          </div>

          {/* Menu links + Button (Desktop) */}
          <div className="hidden md:flex space-x-8 items-center">
            <Link
              href="/about"
              className="text-lg font-medium text-gray-700 hover:text-indigo-500 transition-colors duration-200"
            >
              About Us
            </Link>

            <button
              type="button"
              onClick={() => (window.location.href = "/login")}
              className="flex items-center px-6 py-2 bg-gradient-to-r from-green-400 to-teal-500 text-white font-bold rounded-full shadow-xl hover:from-teal-500 hover:to-green-500 transition-all duration-300 transform hover:scale-105"
            >
              <CiLogin className="w-5 h-5 mr-2" />
              เข้าสู่ระบบ
            </button>
          </div>

          {/* Mobile menu button (optional) */}
          <div className="md:hidden flex items-center">
            <button
              className="p-2 rounded-full hover:bg-white/20 transition duration-200"
              aria-label="Open menu"
            >
              {/* ไอคอน Hamburger */}
              <svg
                className="w-6 h-6 text-gray-700"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M4 6h16M4 12h16M4 18h16"
                />
              </svg>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
