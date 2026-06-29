"use client";

import { useRouter } from "next/navigation";
import { useAuth } from "@/app/contexts/AuthContext";

function getLocale() {
  if (typeof window === "undefined") return "ko";
  return localStorage.getItem("NEXT_LOCALE") || "ko";
}

export default function Header() {
  const { signout } = useAuth();
  const router = useRouter();

  const handleLogout = () => {
    if (window.confirm("로그아웃 하시겠습니까?")) {
      signout();
      router.push("/login");
    }
  };

  return (
    <div className="pointer-events-auto z-1000 box-border w-full bg-transparent p-3 pt-[max(env(safe-area-inset-top),12px)] text-white">
      <div className="flex h-full w-full items-center border-b border-white px-3 py-1 text-white">
        <div className="w-full flex-1">The Life Memory</div>
        <div className="flex w-full flex-1">
          <div className="flex flex-1 cursor-pointer justify-end gap-5">
            <p onClick={() => router.push(`/${getLocale()}/account`)}>
              Profile
            </p>
            <p onClick={handleLogout}>Logout</p>
          </div>
        </div>
      </div>
    </div>
  );
}
