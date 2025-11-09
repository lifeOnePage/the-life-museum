"use client";

import { useAuth } from "@/app/contexts/AuthContext";

export default function Header({ page, login, logout, main, mypage }) {
  const { user, token, signout } = useAuth();
  console.log(page)
  return (
    <div className="text-nav fixed top-0 z-1000 box-border h-18 w-[100vw] bg-transparent p-3 text-white">
      <div className="bg-black-200 flex h-full w-full items-center border-b border-white px-3 py-1 text-white">
        <div className="w-full flex-1">TheLifeMuseum</div>
        <div className="flex w-full flex-1">
          <div className="flex flex-1 justify-end gap-5">
            {user ? (
              page==="main" ? (
                <div className="flex flex-1 justify-end gap-5">
                  <p onClick={logout}>Logout</p>
                  <p onClick={mypage}>Mypage</p>
                </div>
              ) : (
                <div className="flex flex-1 justify-end gap-5">
                  <p onClick={logout}>Logout</p>
                  <p onClick={main}>Main</p>
                </div>
              )
            ) : (
              <p onClick={login}>Login</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
