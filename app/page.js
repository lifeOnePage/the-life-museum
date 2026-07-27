"use client";

import Header from "@/app/components/main/Header";
import Landing from "@/app/components/main/Landing";
import Footer from "@/app/components/Footer";
import SectionStory from "@/app/components/main/landing/SectionStory";
import SectionManifesto from "@/app/components/main/landing/SectionManifesto";
import SectionNotAlbum from "@/app/components/main/landing/SectionNotAlbum";
import SectionGallery from "@/app/components/main/landing/SectionGallery";
import SectionOneLink from "@/app/components/main/landing/SectionOneLink";
import SectionHowItWorks from "@/app/components/main/landing/SectionHowItWorks";
import SectionMakeAlbum from "@/app/components/main/landing/SectionMakeAlbum";
import SectionThemes from "@/app/components/main/landing/SectionThemes";
import SectionShare from "@/app/components/main/landing/SectionShare";
import SectionComparison from "@/app/components/main/landing/SectionComparison";
import SectionPricing from "@/app/components/main/landing/SectionPricing";
import SectionFAQ from "@/app/components/main/landing/SectionFAQ";
import SectionFinalCTA from "@/app/components/main/landing/SectionFinalCTA";
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
    router.push(`/library`);
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
      <Landing />
      <SectionStory />
      <SectionManifesto />
      <SectionNotAlbum />
      <SectionGallery />
      <SectionOneLink />
      <SectionHowItWorks />
      <SectionMakeAlbum />
      <SectionThemes />
      <SectionShare />
      <SectionComparison />
      <SectionPricing />
      <SectionFAQ />
      <SectionFinalCTA />
      <Footer />
    </div>
  );
}
