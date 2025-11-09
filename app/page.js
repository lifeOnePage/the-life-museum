"use client";

import Image from "next/image";
import AboutDetail from "@/app/components/main/AboutDetail";
import AboutInfo from "@/app/components/main/AboutInfo";
import Header from "@/app/components/main/Header";
import { useRouter } from "next/navigation";
import { useAuth } from "./contexts/AuthContext";
export default function Home() {
  const { user, token, signinWithToken, signout } = useAuth();
  const router = useRouter();
  const login = () => {
    console.group("login");
    console.log("login pressed");
    console.groupEnd();
    router.push(`/login`);
  };
  const logout = async () => {
    signout();
  };
  const mypage = () => {
    router.push(`/mypage`);
  };
  return (
    <div
      style={{
        background: "#121212",
        color: "white",
        fontFamily: "pretendard",
      }}
    >
      <Header page="main" mypage={mypage} login={login} logout={logout} />
      {/* <Landing /> */}
      <AboutInfo />
      <AboutDetail />
    </div>
  );
}
