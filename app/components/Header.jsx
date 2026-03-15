"use client";

import { useState } from "react";
import { UserRound } from "lucide-react";
import ProfileModal from "./ProfileModal";

export default function Header() {
  const [showProfile, setShowProfile] = useState(false);

  return (
    <>
      <div className="border-black-200 pointer-events-auto z-1000 flex w-full flex-row items-center justify-between bg-transparent px-16 py-4 font-sans text-xl">
        The Life Gallery
        <button
          onClick={() => setShowProfile(true)}
          className="hover:bg-black-100 flex h-12 w-12 items-center justify-center rounded-full text-black/50 transition hover:text-white"
          title="프로필"
          aria-label="프로필 편집"
        >
          <UserRound size={24} strokeWidth={2} />
        </button>
      </div>
      {showProfile && <ProfileModal onClose={() => setShowProfile(false)} />}
    </>
  );
}
