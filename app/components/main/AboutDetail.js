"use client";
import React, { useState } from "react";
import { useRouter } from "next/navigation";
import "./AboutDetail.css";

export default function LifeCardHero() {
  const [activeTab, setActiveTab] = useState("records"); //활성화된 탭이 뭔지
  const router = useRouter();

  const handleStart = () => {
    router.push("/login");
  };

  return (
    <div className="page">
      {/* Top tabs */}

      <div className="tabs">
        <button
          className={`tab ${activeTab === "records" ? "active" : ""}`}
          onClick={() => setActiveTab("records")}
        >
          Life Records
        </button>
        <button
          className={`tab ${activeTab === "reels" ? "active" : ""}`}
          onClick={() => setActiveTab("reels")}
        >
          Life Reels
        </button>
      </div>

      {activeTab === "records" && (
        <>
          <h1 className="headline">All your time, on your records</h1>
          <p className="subhead">당신의 시간을, 당신의 레코드에.</p>

          <div className="img-wrap">
            <img
              className="image"
              src="/images/main/life-records-img.png"
              alt="image"
            />
          </div>

          <p className="footer-copy">
            <strong>Life-Records</strong>는 당신의 삶에서 소중한 순간들을
            레코드로 기록하는 디지털 아카이브입니다. 이름과 출생 정보, 내용,
            연도별 타임라인, 사진을 기록하고, 링크로 쉽게 공유합니다.
          </p>
        </>
      )}
      {activeTab === "reels" && (
        <>
          <h1 className="headline">All your time, on your reels</h1>
          <p className="subhead">당신의 순간을, 당신의 릴스에.</p>

          <div className="img-wrap">
            <img
              className="image"
              src="/images/main/life-reel-img.png"
              alt="image"
            />
          </div>

          <p className="footer-copy">
            <strong>Life-Reels</strong>는 소중한 관계와 순간을 영화처럼 이어붙인
            디지털 아카이브입니다. 시간의 흐름 속에서 움직이는 추억을 담아내어,
            당신만의 이야기를 감각적으로 기록하고 나눕니다.
          </p>
        </>
      )}

      <button className="start-button" onClick={handleStart}>
        시작하기
      </button>
    </div>
  );
}
