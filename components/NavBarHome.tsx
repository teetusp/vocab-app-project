"use client";
import React from "react";
import rocket from "./../assets/rocket.png";
import design from "./../assets/design.png";
import Image from "next/image";
import Link from "next/link";
import { CiLogin } from "react-icons/ci";

export default function NavBar() {
  return (
    <div className="sticky bg-blue-200/90 backdrop-blur-sm shadow-md">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          {/* โลโก้/ชื่อแอป */}
          <div
            onClick={() => window.location.reload()}
            className="flex items-center space-x-2 cursor-pointer"
          >
            <Image src={rocket} alt="Logo" className="w-10 h-10 mr-2" />
            <h1 className="text-2xl font-black text-indigo-600 tracking-wide">
              <span className="text-yellow-500">Card</span>{" "}
              <span className="text-red-500">Vocab</span>
            </h1>
          </div>

          <div className="hidden md:flex space-x-8 items-center">
            <Link
              href="/about"
              className="text-lg font-medium text-gray-600 hover:text-indigo-500 transition duration-150"
            >
              About Us
            </Link>

            <button
              type="button"
              onClick={() => (window.location.href = "/login")}
              className="flex items-center px-6 py-2 border border-transparent text-base font-bold rounded-full shadow-lg text-white bg-green-500 hover:bg-green-600 transition duration-200 transform hover:scale-105 cursor-pointer"
            >
              <CiLogin className="w-5 h-5 mr-2 text-white" />
              เข้าสู่ระบบ
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
