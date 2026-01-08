import "@/app/records/(common)/styles/cardPage.css";
import "@/app/records/(common)/styles/cardPage-mobile.css";
import Temp from "./Temp";
import { getRecordDetailsServer } from "@/app/lib/records/records.server";
import { getMeServer } from "@/app/lib/auth/me.server";
import { buildInitialPayload } from "@/app/lib/records/buildInitialPayload";

export default async function RecordsEditPage({ params }) {
  const { identifier } = await params;

  //⭐️ 서버 fetch! -> 이걸 loading, error가 받는다.
  const fetchedUserData = await getMeServer();
  const fetchedRecordData = await getRecordDetailsServer({
    identifier,
  });

  const initial = buildInitialPayload(fetchedRecordData.item);

  return (
    <Temp
      identifier={identifier}
      initialData={initial}
      fetchedUserData={fetchedUserData}
    />
  );
}
