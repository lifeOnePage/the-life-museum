import "@/app/records/(common)/styles/cardPage.css";
import "@/app/records/(common)/styles/cardPage-mobile.css";
import Temp from "./Temp";
import { getRecordDetailsServer } from "@/app/lib/records.server";

export default async function RecordsEditPage({ params }) {
  const { username } = await params;

  //≈서버 fetch! -> 이걸 loading, error가 받는다.
  const fetchedRecordData = await getRecordDetailsServer({
    identifier: username,
  });

  return <Temp fetchedRecordData={fetchedRecordData} />;
}
