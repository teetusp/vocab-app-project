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
    <div className="sticky top-0 z-50 bg-gradient-to-r from-indigo-600 via-purple-300 to-pink-100 shadow-lg">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* โลโก้/ชื่อแอป */}
          <div
            onClick={() => router.push("/")}
            className="flex items-center space-x-2 cursor-pointer transform transition-transform hover:scale-105"
          >
            <Image
              src={rocket}
              alt="Logo"
              className="w-10 h-10 drop-shadow-md"
            />
            <h1 className="text-2xl font-black text-indigo-600 tracking-wide">
              <span className="text-yellow-300">Card</span>{" "}
              <span className="text-red-600">Vocab</span>
            </h1>
          </div>

          <div className="hidden md:flex space-x-8 items-center">
            <Link
              href="/about"
              className="text-lg font-semibold text-gray-900 hover:text-yellow-300 transition-colors duration-200"
            >
              About Us
            </Link>

            <button
              type="button"
              onClick={() => (window.location.href = "/login")}
              className="flex items-center px-6 py-2 border border-transparent text-base font-bold rounded-full shadow-lg text-white bg-green-500 hover:bg-green-600 transition duration-200 transform hover:scale-105 cursor-pointer"
            >
              <CiLogin className="w-5 h-5 mr-2 text-black" />
              Sign in
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
