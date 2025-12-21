"use client"

import Image from 'next/image'

export default function ExhibitionProfile({ profile }) {
  return (
    <div className="h-screen w-screen flex items-center justify-center bg-black">
      {/* 정방형 프로필 이미지 컨테이너 (100vh) */}
      <div className="relative h-screen aspect-square">
        {/* 배경 이미지 */}
        <Image
          src={profile.photo}
          alt={profile.name}
          fill
          className="object-cover"
          priority
        />

        {/* 우하단 텍스트 오버레이 */}
        <div className="absolute bottom-0 right-0 p-8 text-right text-white max-w-md">
          {/* 이름/제목 */}
          <h1 className="text-4xl font-bold mb-4 drop-shadow-lg">
            {profile.name}
          </h1>

          {/* 생년월일/일자 */}
          {profile.birthDate && (
            <p className="text-lg mb-2 drop-shadow-md">
              {profile.birthDate}
            </p>
          )}

          {/* 출생지 */}
          {profile.birthPlace && (
            <p className="text-lg mb-4 drop-shadow-md">
              {profile.birthPlace}
            </p>
          )}

          {/* 생애문/설명 */}
          {profile.biography && (
            <p className="text-sm leading-relaxed whitespace-pre-wrap drop-shadow-md max-h-48 overflow-y-auto">
              {profile.biography}
            </p>
          )}
        </div>
      </div>
    </div>
  )
}