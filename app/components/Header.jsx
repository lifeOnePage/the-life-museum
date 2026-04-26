"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/app/contexts/AuthContext";
import ProfileModal from "./ProfileModal";

export default function Header() {
  const [showProfile, setShowProfile] = useState(false);
  const { signout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    if (window.confirm("로그아웃 하시겠습니까?")) {
      signout();
      router.push("/login");
    }
  };

  return (
    <>
      <div className="pointer-events-auto z-1000 box-border h-18 w-full bg-transparent p-3 text-white">
        <div className="flex h-full w-full items-center border-b border-white px-3 py-1 text-white">
          <div className="w-full flex-1">The Life Gallery</div>
          <div className="flex w-full flex-1">
            <div className="flex flex-1 cursor-pointer justify-end gap-5">
              <p onClick={() => setShowProfile(true)}>Profile</p>
              <p onClick={handleLogout}>Logout</p>
            </div>
          </div>
        </div>
      </div>
      {showProfile && <ProfileModal onClose={() => setShowProfile(false)} />}
    </>
  );
}
