import "@/app/records/(common)/styles/cardPage.css";
import "@/app/records/(common)/styles/cardPage-mobile.css";
import Temp from "./Temp";
import { getRecordDetailsServer } from "@/app/lib/records.server";
import { getMeServer } from "@/app/lib/me.server";

export default async function RecordsEditPage({ params }) {
  const { identifier } = await params;

  //⭐️ 서버 fetch! -> 이걸 loading, error가 받는다.
  const fetchedRecordData = await getRecordDetailsServer({
    identifier,
  });
  const fetchedUserData = await getMeServer();
  return (
    <Temp
      identifier={identifier}
      fetchedRecordData={fetchedRecordData}
      fetchedUserData={fetchedUserData}
    />
  );
}
