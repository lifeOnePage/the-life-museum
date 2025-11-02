import { NextResponse } from "next/server";
import client from "@/app/client";

// 프리뷰: 필요한 최소 필드만 반환 (인증 불필요)
export async function GET(_req, { params }) {
  const { identifier } = await params;
  console.log("[records/view] identifier:", identifier);

  try {
    const record = await client.record.findUnique({
      where: { identifier },
      select: {
        id: true,
        identifier: true,
        coverUrl: true,
        name: true,
        subName: true,
        description: true,
        bgm: true,
        color: true,
        userName: true,
        userId: true,
        user: {
          select: {
            name: true,
          },
        },
        recordItems: {
          select: {
            id: true,
            title: true,
            date: true,
            location: true,
            description: true,
            color: true,
            isHighlight: true,
            coverUrl: true,
            createdAt: true,
          },
          orderBy: { createdAt: "asc" },
        },
      },
    });

    console.log("[records/view] found record:", record ? "yes" : "no");
    console.log(
      "[records/view] user:",
      record?.user ? record.user.name : "null",
    );
    console.log("[records/view] userId:", record?.userId);

    if (!record) {
      // 데이터가 없어도 에러 대신 빈 응답 반환 (클라이언트에서 더미 데이터 사용)
      return NextResponse.json(
        { ok: false, error: "not found" },
        { status: 404 },
      );
    }

    // userName 우선순위: record.userName > user.name > null
    let userName = record.userName || null;
    if (!userName && record.user) {
      userName = record.user.name || null;
    }
    if (!userName && record.userId) {
      const user = await client.user.findUnique({
        where: { id: record.userId },
        select: { name: true },
      });
      userName = user?.name || null;
    }

    // 클라이언트가 쉽게 사용할 수 있도록 정규화
    const payload = {
      record: {
        identifier: record.identifier,
        coverUrl: record.coverUrl,
        name: record.name,
        subName: record.subName,
        description: record.description,
        bgm: record.bgm,
        color: record.color,
        userName: userName,
      },
      items: (record.recordItems || []).map((item) => ({
        id: item.id,
        title: item.title || "",
        date: item.date || "",
        location: item.location || "",
        description: item.description || "",
        color: item.color || "",
        isHighlight: item.isHighlight || false,
        coverUrl: item.coverUrl || "",
      })),
    };

    console.log("[records/view] payload.userName:", payload.record.userName);

    return NextResponse.json({ ok: true, item: payload });
  } catch (e) {
    console.error("[records/view] error:", e);
    // 에러 발생 시에도 클라이언트에서 더미 데이터 사용 가능하도록
    return NextResponse.json(
      { ok: false, error: "server error", details: e.message },
      { status: 500 },
    );
  }
}
