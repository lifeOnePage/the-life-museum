import { redirect } from "next/navigation";

// /account 로 바로 들어온 경우(Header.jsx 등) 프로필 탭으로 보낸다.
export default async function AccountIndexPage({ params }) {
  const { locale } = await params;
  redirect(`/${locale}/account/profile`);
}
