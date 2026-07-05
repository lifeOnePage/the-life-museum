// 실제 공유 페이지는 /[locale]/share/[id] 로 서빙된다(미들웨어가 /share → /ko/share 리다이렉트).
// OG 미리보기(카카오톡 등) 메타를 여기서 제공해야 크롤러가 읽는다.
// 메타 생성 로직은 app/share/[id]/layout.jsx 의 것을 그대로 재사용한다.
import { generateMetadata as baseGenerateMetadata } from "@/app/share/[id]/layout.jsx";

export async function generateMetadata(props) {
  // props.params = { locale, id } — base 함수는 id 만 사용한다.
  return baseGenerateMetadata(props);
}

export default function LocaleShareLayout({ children }) {
  return children;
}
