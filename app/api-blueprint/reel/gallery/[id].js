// app/api/me/reel/[id]/route.js
import { NextResponse } from "next/server";
import { verifyJwt } from "@/app/lib/jwt";
import client from "@/app/client";

export async function PATCH(req, { params }) {
  const { id } = await params; // identifier
  const auth = req.headers.get("authorization") || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;
  const payload = token ? verifyJwt(token) : null;
  if (!payload) {
    return NextResponse.json(
      { ok: false, error: "unauthorized" },
      { status: 401 },
    );
  }

  const body = await req.json().catch(() => ({}));
  const { childhood, memory, relationship } = (await body) || {};

  try {
    // reelId만 뽑기 (불필요한 include 최소화)
    const reel = await client.reel.findUnique({
      where: { id: Number(id) },
      select: { id: true },
    });
    if (!reel) {
      return NextResponse.json(
        { ok: false, error: "reel not found" },
        { status: 404 },
      );
    }
    const reelId = reel.id;

    // helpers
    const toDateOrNull = (v) => (v ? new Date(v) : null);
    const only = (obj, allowed) =>
      Object.fromEntries(
        Object.entries(obj || {}).filter(([k]) => allowed.includes(k)),
      );

    const txOps = [];

    // ---- CHILDHOOD (WheelTexture[]) ----
    if (Array.isArray(childhood)) {
      // (1) 입력 정규화: 평평한 형태로 와도 방어
      //    - 기대: { id?, data: { srcType, srcUrl, caption? } }
      const normalized = childhood.map(
        (x) => (x?.data ? x : { id: x?.id ?? null, data: x }), // fallback
      );

      // (2) 기존 목록
      const existing = await client.wheelTexture.findMany({
        where: { reelId },
        select: { id: true },
      });
      const existingIds = new Set(existing.map((e) => e.id));

      const reqWithId = normalized.filter((x) => Number.isInteger(x?.id));
      const reqIds = new Set(reqWithId.map((x) => x.id));

      // (3) 삭제: 요청에 없는 기존 id 삭제
      const deleteIds = [...existingIds].filter((eid) => !reqIds.has(eid));
      if (deleteIds.length) {
        await client.wheelTexture.deleteMany({
          where: { reelId, id: { in: deleteIds } }, // ← srcType 조건 불필요
        });
      }

      // (4) 생성: id 없는 것
      const createItems = normalized
        .filter((x) => !Number.isInteger(x?.id))
        .map((x) => ({
          reelId,
          ...only(x.data, ["srcType", "srcUrl", "caption"]), // caption도 저장
        }))
        // 유효성 (srcUrl/srcType 없으면 제거)
        .filter((d) => typeof d.srcType === "number" && d.srcUrl);
      if (createItems.length) {
        await client.wheelTexture.createMany({ data: createItems });
      }

      // (5) 수정: id 있는 것
      for (const x of reqWithId) {
        const data = only(x.data, ["srcType", "srcUrl", "caption"]);
        if (Object.keys(data).length) {
          await client.wheelTexture.update({
            where: { id: x.id },
            data,
          });
        }
      }
    }

 // app/api/me/reel/[id]/route.js (메모리/리레이션십 블록 교체/추가)

    // ---------- MEMORY (Memory[] + WheelTexture[]) ----------
    if (Array.isArray(memory)) {
      // (0) 정규화: { id?, data:{...}, media:[...] } 또는 평평하게 온 경우 방어
      const normalizedMem = memory.map((x) =>
        x?.data
          ? x
          : {
              id: x?.id ?? null,
              data: only(x, ["title", "subTitle", "date", "comment"]),
              media: Array.isArray(x?.media) ? x.media : [],
            }
      );

      // (1) 기존 Memory id들 확인 → 요청에 없는 것은 삭제
      const existingMem = await client.memory.findMany({
        where: { reelId },
        select: { id: true },
      });
      const existingMemIds = new Set(existingMem.map((m) => m.id));
      const reqMemIds = new Set(
        normalizedMem.filter((x) => Number.isInteger(x?.id)).map((x) => x.id)
      );

      const deleteMemIds = [...existingMemIds].filter((id) => !reqMemIds.has(id));
      if (deleteMemIds.length) {
        // 연결된 WheelTexture 먼저 제거
        await client.wheelTexture.deleteMany({ where: { memoryId: { in: deleteMemIds } } });
        await client.memory.deleteMany({ where: { reelId, id: { in: deleteMemIds } } });
      }

      // (2) 트랜잭션으로 생성/수정 + 미디어 전체 치환
      await client.$transaction(async (tx) => {
        for (const m of normalizedMem) {
          const d = only(m.data, ["title", "subTitle", "date", "comment"]);
          let memId = m.id;

          if (!Number.isInteger(memId)) {
            // 새로 생성
            const created = await tx.memory.create({
              data: {
                reelId,
                title: d.title ?? "",
                subTitle: d.subTitle ?? null,
                date: d.date ? new Date(d.date) : null,
                comment: d.comment ?? null,
              },
              select: { id: true },
            });
            memId = created.id;
          } else {
            // 필드 업데이트(부분)
            const data = {
              ...(d.title !== undefined ? { title: d.title } : {}),
              ...(d.subTitle !== undefined ? { subTitle: d.subTitle } : {}),
              ...(d.date !== undefined ? { date: d.date ? new Date(d.date) : null } : {}),
              ...(d.comment !== undefined ? { comment: d.comment } : {}),
            };
            if (Object.keys(data).length) {
              await tx.memory.update({ where: { id: memId }, data });
            }
            // 이전 미디어 전체 삭제
            await tx.wheelTexture.deleteMany({ where: { memoryId: memId } });
          }

          // 새 미디어 생성
          const medias = (m.media || [])
            .map((w) => only(w, ["srcUrl", "srcType", "caption"]))
            .filter((w) => w.srcUrl && typeof w.srcType === "number")
            .map((w) => ({ ...w, memoryId: memId }));
          if (medias.length) {
            await tx.wheelTexture.createMany({ data: medias });
          }
        }
      });
    }

    // ---------- RELATIONSHIP (Relationship[] + WheelTexture[]) ----------
    if (Array.isArray(relationship)) {
      // (0) 정규화
      const normalizedRel = relationship.map((x) =>
        x?.data
          ? x
          : {
              id: x?.id ?? null,
              data: only(x, ["name", "relation", "comment"]),
              media: Array.isArray(x?.media) ? x.media : [],
            }
      );

      const existingRel = await client.relationship.findMany({
        where: { reelId },
        select: { id: true },
      });
      const existingRelIds = new Set(existingRel.map((r) => r.id));
      const reqRelIds = new Set(
        normalizedRel.filter((x) => Number.isInteger(x?.id)).map((x) => x.id)
      );

      const deleteRelIds = [...existingRelIds].filter((id) => !reqRelIds.has(id));
      if (deleteRelIds.length) {
        await client.wheelTexture.deleteMany({ where: { relationshipId: { in: deleteRelIds } } });
        await client.relationship.deleteMany({ where: { reelId, id: { in: deleteRelIds } } });
      }

      await client.$transaction(async (tx) => {
        for (const r of normalizedRel) {
          const d = only(r.data, ["name", "relation", "comment"]);
          let relId = r.id;

          if (!Number.isInteger(relId)) {
            const created = await tx.relationship.create({
              data: {
                reelId,
                name: d.name ?? "",
                relation: d.relation ?? "",
                comment: d.comment ?? null,
              },
              select: { id: true },
            });
            relId = created.id;
          } else {
            const data = {
              ...(d.name !== undefined ? { name: d.name } : {}),
              ...(d.relation !== undefined ? { relation: d.relation } : {}),
              ...(d.comment !== undefined ? { comment: d.comment } : {}),
            };
            if (Object.keys(data).length) {
              await tx.relationship.update({ where: { id: relId }, data });
            }
            await tx.wheelTexture.deleteMany({ where: { relationshipId: relId } });
          }

          const medias = (r.media || [])
            .map((w) => only(w, ["srcUrl", "srcType", "caption"]))
            .filter((w) => w.srcUrl && typeof w.srcType === "number")
            .map((w) => ({ ...w, relationshipId: relId }));
          if (medias.length) {
            await tx.wheelTexture.createMany({ data: medias });
          }
        }
      });
    }


    if (txOps.length === 0) {
      return NextResponse.json({ ok: true, message: "nothing to update" });
    }

    // 모든 작업을 하나의 트랜잭션으로
    const results = await client.$transaction(txOps);

    // (선택) Reels.updatedAt 만지려면 아래 추가
    // await client.reel.update({ where: { id: reelId }, data: {} });

    return NextResponse.json({
      ok: true,
      counts: {
        ops: txOps.length,
      },
      results,
    });
  } catch (e) {
    console.error(e);
    return NextResponse.json({ ok: false, error: String(e) }, { status: 500 });
  }
}
