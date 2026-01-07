import FloatingToolbar from "@/app/components/edit/FloatingToolbar";
import ToastStack from "@/app/components/Toast";
import LifeRecordDesktop from "@/app/records/(common)/views/desktop/LifeRecordDesktop";
import LifeRecordMobile from "@/app/records/(common)/views/mobile/LifeRecordMobile";
import {
  fetchRecordDetails,
  updateRecordDetails,
  createRecordItem,
  updateRecordItem,
  deleteRecordItem,
  uploadRecordFile,
} from "./services/editApi";
import ImageAddModal from "./components/ImageAddModal";
import "@/app/records/(common)/styles/cardPage.css";
import "@/app/records/(common)/styles/cardPage-mobile.css";
import useWindowSize from "@/app/hooks/useWindowSize";
import Temp from "./Temp";
import { fetchMe } from "./services/meApi";

export default async function RecordsEditPage({ params }) {
  const { username } = params;
  // const { user, token, loading: authLoading } = useServerAuth();

  // ⭐️ 서버 fetch! -> 이걸 loading, error가 받는다.
  // const fetchedRecordData = await fetchRecordDetails({
  //   token,
  //   identifier: username.toString(),
  // });

  // return <Temp fetchedRecordData={fetchedRecordData} />;
}
