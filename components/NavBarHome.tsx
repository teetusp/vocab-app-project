"use client";
import React from "react";
import rocket from "./../assets/rocket.png";
import Image from "next/image";
import Link from "next/link";
import { CiLogin } from "react-icons/ci";
import { useRouter } from "next/navigation";

export default function NavBar() {
  const router = useRouter();
  return (
    <div className="sticky top-0 z-50 bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-opacity-70 backdrop-blur-md shadow-xl border-b border-white/20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* โลโก้/ชื่อแอป */}
          <div
            onClick={() => router.push("/")}
            className="flex items-center space-x-2 cursor-pointer transform transition-transform hover:scale-110"
          >
            <Image
              src={rocket}
              alt="Logo"
              className="w-12 h-12 drop-shadow-lg"
            />
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-wide">
              <span className="text-yellow-300 drop-shadow-md">Card</span>{" "}
              <span className="text-red-400 drop-shadow-md">Vocab</span>
            </h1>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex space-x-6 items-center">
            <Link
              href="/about"
              className="text-lg font-bold text-white hover:text-yellow-200 transition-colors duration-200"
            >
              About Us
            </Link>

            <button
              type="button"
              onClick={() => (window.location.href = "/login")}
              className="flex items-center px-6 py-2 text-base font-bold rounded-full shadow-2xl text-white bg-gradient-to-r from-green-400 to-teal-400 hover:from-teal-400 hover:to-green-400 transition-transform duration-300 transform hover:scale-110 cursor-pointer"
            >
              <CiLogin className="w-5 h-5 mr-2 text-white" />
              Sign in
            </button>
          </div>

          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center">
            <button
              className="p-2 rounded-full bg-white/30 hover:bg-white/50 transition duration-200"
              aria-label="Open menu"
            >
              <svg
                className="w-6 h-6 text-white"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
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
