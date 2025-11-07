"use client";
import react from "react";
import Image from "next/image";
import rocket from "../../../assets/rocket.png";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "@/lib/supabaseClient";
import NavBarUser from "../../../components/NavBarUser";

export default function page() {
  return (
    <div>
      <div className="min-h-screen bg-pink-100">
        <NavBarUser />
       
      </div>
      
    </div>
  );
}
