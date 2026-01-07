import "@/app/records/(common)/styles/cardPage.css";
import "@/app/records/(common)/styles/cardPage-mobile.css";
import Temp from "./Temp";
import { cookies } from "next/headers";
import { getRecordDetailsServer } from "@/app/lib/records.server";

export default async function RecordsEditPage({ params }) {
  const { username } = await params;
  const cookieStore = await cookies();
  const token = cookieStore.get("app_token")?.value;
  if (!token) {
    // redirect("/login");
    throw new Error("unauthorized");
  }

  // ⭐️ 서버 fetch! -> 이걸 loading, error가 받는다.
  const fetchedRecordData = await getRecordDetailsServer({
    token,
    identifier: username,
  });

  return <Temp fetchedRecordData={fetchedRecordData} />;
}
