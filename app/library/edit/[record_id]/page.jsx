"use client";

import dynamic from "next/dynamic";
import { use, useState, useEffect, useRef, useCallback } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowLeft,
  Pencil,
  Save,
  RefreshCw,
  X,
  ChevronDown,
  ChevronRight,
  Plus,
  Trash2,
  GripVertical,
  Sparkles,
  Undo2,
  HelpCircle,
  MoreVertical,
  BookOpen,
  Loader2,
  Type,
  Image as ImageIcon,
  Palette,
  History,
  Sticker,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./components/ui/tabs";
import { Button } from "./components/ui/button";
import { Input } from "./components/ui/input";
import { Textarea } from "./components/ui/textarea";
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import CoverImageEditor from "./components/CoverImageEditor";
import TitleOverlayEditor from "./components/TitleOverlayEditor";
const AlbumPreview2D = dynamic(() => import("./components/AlbumPreview2D"), {
  ssr: false,
});
const VHSPreview = dynamic(() => import("./components/VHSPreview"), {
  ssr: false,
});
const WalkPreview = dynamic(() => import("./components/WalkPreview"), {
  ssr: false,
});
const MemorialPreview = dynamic(() => import("./components/MemorialPreview"), {
  ssr: false,
});
import TutorialOverlay from "./components/TutorialOverlay";
import MemorialConvertModal from "@/app/components/memorial/MemorialConvertModal";
import ThemeSelector from "./components/ThemeSelector";
import StickerPanel from "./components/StickerPanel";
import BgmEditor, { BGM_LIST } from "./components/BgmEditor";
import BackCoverUpload from "./components/BackCoverUpload";
import { usePhotoDrive } from "./components/usePhotoDrive";
import { UNIFIED_THEMES, DEFAULT_THEME } from "./themeConfig";
import AIConsentModal, { hasAIConsent } from "@/app/components/AIConsentModal";
import { invalidateRecord } from "@/app/lib/useRecordData";
import {
  cachedAlbums,
  setCachedAlbums,
  coverCache,
  setOptimisticCover,
} from "@/app/library/utils/albumListCache";
import { generateFrontCoverDataUrl } from "@/app/lib/generateFrontCover";
import { loadCachedImage } from "@/app/lib/loadCachedImage";
import { authedFetch } from "@/app/utils/authedFetch";

const ADMIN_EMAILS = new Set([
  "goodchaeee@naver.com",
  "goodchaeee@gmail.com",
  "akea1027th@gmail.com",
  "byul88byul@gmail.com",
  "jusub@sogang.ac.kr",
  "showyourmind@gmail.com",
]);

// ─── i18n ────────────────────────────────────────────────────────────────────
const T = {
  ko: {
    loading: "불러오는 중...",
    albumEdit: "앨범 편집",
    editInfo: "앨범 정보 수정",
    save: "저장하기",
    saveAction: "저장",
    reset: "변경사항 초기화",
    tutorial: "튜토리얼",
    exit: "나가기",
    lastSaved: "마지막 저장",
    tabCover: "앨범 커버",
    tabMemory: "앨범 메모리",
    railText: "타이틀",
    railCoverImage: "커버 이미지",
    railTheme: "테마",
    railSticker: "스티커",
    railStory: "스토리",
    railTimeline: "타임라인",
    coverSideFront: "앞면",
    coverSideBack: "뒷면",
    titleLabel: "제목",
    subtitleLabel: "부제목",
    titlePlaceholder: "앨범 제목을 입력하세요",
    subtitlePlaceholder: "부제목을 입력하세요",
    showTitle: "표지에 제목 표시하기",
    coverDesign: "앞면 이미지 설정하기",
    coverDesignSub: "직접 업로드하거나 AI로 새 이미지를 생성하세요.",
    bgm: "배경음악",
    bgmSelected: "선택됨",
    recordType: "메모리 타입",
    recordTypeExhibit: "Time Travel",
    recordTypeRetroTape: "Retro Tape",
    recordTypeMemorial: "메모리얼",
    memorialPosterStyle: "포스터 스타일",
    memorialPosterStyleClassic: "클래식",
    memorialPosterStyleGlow: "글로우",
    memorialPosterStyleFrameless: "프레임리스",
    memorialPosterTone: "포스터 톤",
    memorialPosterToneDark: "다크",
    memorialPosterToneWhite: "화이트",
    memorialAspectRatio: "화면 비율",
    memorialAspectRatioPortrait: "9:16 (세로)",
    memorialAspectRatioLandscape: "16:9 (가로)",
    backCoverImage: "뒷면 이미지 설정하기",
    theme: "테마",
    backCoverGuide:
      "앨범 뒷면을 꾸미기 위해 앨범에 맞는 스토리와 타임라인을 적어주세요",
    story: "스토리",
    keywordSelect: "키워드 선택",
    keywordSelected: (n) => `${n}개 선택됨`,
    keywordHelp:
      "💡 글감이 떠오르지 않을 때 키워드를 선택해보세요. 선택한 키워드가 스토리에 주제로 추가되어, AI가 이를 바탕으로 더 풍부한 이야기를 만들어 줄 수 있어요.",
    placeholderWithChips: "추가로 작성하세요...",
    placeholderNoChips: "자유롭게 작성하세요...",
    charCount: (n) => `${n}/250자`,
    genCount: "사용한 생성 횟수",
    genExhausted: "생성 횟수를 모두 사용했습니다.",
    generating: "생성 중...",
    generateStory: "글 생성",
    timeline: "타임라인",
    addItem: (n) => `항목 추가 (${n}/10)`,
    emptyTimeline: "타임라인 항목을 추가해보세요",
    yearPlaceholder: "연도",
    eventPlaceholder: "내용을 입력하세요...",
    keywordsMore: (n) => `+${n}개 더보기`,
    keywordsLess: "접기",
    exitConfirmDirty: "변경사항이 있습니다. 저장하시겠습니까?",
    exitConfirm: "나가시겠습니까?",
    saveAndExit: "저장하고 나가기",
    saving: "저장 중...",
    editInfoTitle: "앨범 정보 수정",
    externalLink: "외부 링크",
    externalLinkPlaceholder: "버튼에 표시할 이름 (예: 유튜브 채널)",
    photoStorage: "사진 저장소",
    serviceComingSoon: "서비스 준비중입니다",
    cancel: "취소",
    delete: "앨범 삭제하기",
    deleteConfirm: "정말 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.",
    deleting: "삭제 중...",
    deleteAction: "삭제",
    errorSaveColors: "컬러 저장에 실패했습니다",
    errorSave: "저장에 실패했습니다",
    errorSaveBackCover: "뒷면 이미지 저장에 실패했습니다",
    errorGenerate: "생성에 실패했습니다",
    errorDelete: "삭제에 실패했습니다",
  },
  en: {
    loading: "Loading...",
    albumEdit: "Edit Album",
    editInfo: "Edit Album Info",
    save: "Save",
    saveAction: "Save",
    reset: "Reset Changes",
    tutorial: "Tutorial",
    exit: "Exit",
    lastSaved: "Last saved",
    tabCover: "Album Cover",
    tabMemory: "Album Memory",
    railText: "Title",
    railCoverImage: "Cover Image",
    railTheme: "Theme",
    railSticker: "Stickers",
    railStory: "Story",
    railTimeline: "Timeline",
    coverSideFront: "Front",
    coverSideBack: "Back",
    titleLabel: "Title",
    subtitleLabel: "Subtitle",
    titlePlaceholder: "Enter album title",
    subtitlePlaceholder: "Enter subtitle",
    showTitle: "Show title on cover",
    coverDesign: "Set Front Cover Image",
    coverDesignSub: "AI generate or upload",
    bgm: "Background Music",
    bgmSelected: "Selected",
    recordType: "Record Type",
    recordTypeExhibit: "Time Travel",
    recordTypeRetroTape: "Retro Tape",
    recordTypeMemorial: "Memorial",
    memorialPosterStyle: "Poster Style",
    memorialPosterStyleClassic: "Classic",
    memorialPosterStyleGlow: "Glow",
    memorialPosterStyleFrameless: "Frameless",
    memorialPosterTone: "Poster Tone",
    memorialPosterToneDark: "Dark",
    memorialPosterToneWhite: "White",
    memorialAspectRatio: "Aspect Ratio",
    memorialAspectRatioPortrait: "9:16 (Portrait)",
    memorialAspectRatioLandscape: "16:9 (Landscape)",
    backCoverImage: "Set Back Cover Image",
    theme: "Theme",
    backCoverGuide:
      "Add a story and timeline to decorate the back of your album",
    story: "Story",
    keywordSelect: "Select keywords",
    keywordSelected: (n) => `${n} selected`,
    keywordHelp:
      "💡 Select keywords when you're not sure what to write. They'll be added as topics to help AI generate richer stories.",
    placeholderWithChips: "Write more...",
    placeholderNoChips: "Write freely...",
    charCount: (n) => `${n}/250`,
    genCount: "Generations used",
    genExhausted: "You've used all your generations.",
    generating: "Generating...",
    generateStory: "Generate",
    timeline: "Timeline",
    addItem: (n) => `Add item (${n}/10)`,
    emptyTimeline: "Add your first timeline item",
    yearPlaceholder: "Year",
    eventPlaceholder: "Enter description...",
    keywordsMore: (n) => `+${n} more`,
    keywordsLess: "Less",
    exitConfirmDirty: "Save before leaving?",
    exitConfirm: "Are you sure you want to exit?",
    saveAndExit: "Save & Exit",
    saving: "Saving...",
    editInfoTitle: "Edit Album Info",
    externalLink: "External Link",
    externalLinkPlaceholder: "Button label (e.g. YouTube Channel)",
    photoStorage: "Photo Storage",
    serviceComingSoon: "Coming soon",
    cancel: "Cancel",
    delete: "Delete Album",
    deleteConfirm: "Are you sure? This action cannot be undone.",
    deleting: "Deleting...",
    deleteAction: "Delete",
    errorSaveColors: "Failed to save colors",
    errorSave: "Failed to save",
    errorSaveBackCover: "Failed to save back cover image",
    errorGenerate: "Generation failed",
    errorDelete: "Failed to delete",
  },
};

const KEYWORD_CHIPS_KO = [
  "가족",
  "여행",
  "추억",
  "사랑",
  "우정",
  "성장",
  "도전",
  "감사",
  "일상",
  "꿈",
  "고향",
  "음악",
  "첫만남",
  "계절",
  "약속",
  "이별",
];
const KEYWORD_CHIPS_EN = [
  "Family",
  "Travel",
  "Memories",
  "Love",
  "Friendship",
  "Growth",
  "Challenge",
  "Gratitude",
  "Daily Life",
  "Dreams",
  "Hometown",
  "Music",
  "First Meeting",
  "Seasons",
  "Promise",
  "Farewell",
];
// ─────────────────────────────────────────────────────────────────────────────

// Convert a 6-digit hex to 8-digit (#RRGGBB → #RRGGBBff) for API.
function toApiColor(hex) {
  if (!hex) return hex;
  if (hex.startsWith("#") && hex.length === 9) return hex;
  return `${hex}ff`;
}

// Strip alpha from 8-digit hex for use in color pickers (#RRGGBBaa → #RRGGBB).
function fromApiColor(hex) {
  if (!hex) return hex;
  if (hex.startsWith("#") && hex.length === 9) return hex.slice(0, 7);
  return hex;
}

// Convert stroke color + opacity to an 8-digit hex string for API.
function strokeToDbColor(stroke, opacity = 100) {
  if (!stroke || stroke === "none") return null;
  let hex = stroke;
  if (stroke === "black") hex = "#000000";
  else if (stroke === "white") hex = "#ffffff";
  const alpha = Math.round((opacity / 100) * 255);
  return `${hex}${alpha.toString(16).padStart(2, "0")}`;
}

// Parse an 8-digit hex back into { stroke, strokeOpacity }.
function dbColorToStroke(raw) {
  if (!raw) return { stroke: "none", strokeOpacity: 100 };
  if (raw.startsWith("#") && raw.length === 9) {
    const color = raw.slice(0, 7);
    const alpha = parseInt(raw.slice(7, 9), 16);
    const strokeOpacity = Math.round((alpha / 255) * 100);
    return { stroke: color, strokeOpacity };
  }
  if (raw === "black" || raw === "white" || raw.startsWith("#"))
    return { stroke: raw, strokeOpacity: 100 };
  return { stroke: "none", strokeOpacity: 100 };
}

// Sortable timeline item component
function SortableTimelineItem({ id, item, index, onUpdate, onRemove, t }) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="group flex items-start gap-1.5"
    >
      <div
        className="cursor-grab pt-2 text-[#9b8b7a]/40 active:cursor-grabbing"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-3.5 w-3.5" />
      </div>
      <Input
        value={item.year}
        onChange={(e) => onUpdate(index, "year", e.target.value.slice(0, 9))}
        placeholder={t.yearPlaceholder}
        maxLength={9}
        className="h-9 w-[70px] rounded-[5px] border-white/10 bg-[#2e2720] text-xs text-[#e8d5b7] placeholder:text-[#9b8b7a]/60"
      />
      <div className="relative flex-1">
        <Input
          value={item.event}
          onChange={(e) =>
            onUpdate(index, "event", e.target.value.slice(0, 25))
          }
          placeholder={t.eventPlaceholder}
          maxLength={25}
          className="h-9 w-full rounded-[5px] border-white/10 bg-[#2e2720] pr-8 text-xs text-[#e8d5b7] placeholder:text-[#9b8b7a]/60"
        />
        <span className="pointer-events-none absolute top-1/2 right-2 -translate-y-1/2 text-[9px] text-[#9b8b7a]">
          {item.event.length}/25
        </span>
      </div>
      <button
        onClick={() => onRemove(index)}
        className="flex h-9 w-8 shrink-0 items-center justify-center rounded text-[#9b8b7a] opacity-50 transition-opacity group-hover:opacity-100 hover:text-red-400"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

const Index = ({ params }) => {
  const { record_id, locale } = use(params);
  const t = T[locale] || T.ko;
  const KEYWORD_CHIPS = locale === "en" ? KEYWORD_CHIPS_EN : KEYWORD_CHIPS_KO;

  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const photoDrive = usePhotoDrive(record_id);
  const [frontCover, setFrontCover] = useState(null);
  const [albumTitle, setAlbumTitle] = useState("");
  const [albumSubtitle, setAlbumSubtitle] = useState("");
  const [bio, setBio] = useState("");
  const [timeline, setTimeline] = useState([{ year: "", event: "" }]);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState(null);
  const [showExitDialog, setShowExitDialog] = useState(false);

  // Tab & Theme & Layout state
  const [activeTab, setActiveTab] = useState("cover");
  // 2D 미리보기의 앞/뒷면 상태 — 좌측 섹션을 열면 자동 전환되고, 미리보기의
  // flip 버튼으로도 언제든 수동 전환 가능.
  const [previewFlipped, setPreviewFlipped] = useState(false);
  const [selectedTheme, setSelectedTheme] = useState(DEFAULT_THEME);
  const [stickers, setStickers] = useState([]);
  // 커버 이미지 패널(앞면/뒷면 통합)에서 지금 편집 중인 면
  const [coverImageSide, setCoverImageSide] = useState("front");

  // Title overlay state
  const [titleOverlayEnabled, setTitleOverlayEnabled] = useState(false);
  const [titlePosition, setTitlePosition] = useState("bottom-center");
  const [titleFont, setTitleFont] = useState("Pretendard Variable");
  const [titleColor, setTitleColor] = useState("#000000");
  const [titleStroke, setTitleStroke] = useState("none");
  const [titleStrokeOpacity, setTitleStrokeOpacity] = useState(100);

  // Back cover image URL (defaults to front cover URL from API)
  const [backCoverImageUrl, setBackCoverImageUrl] = useState(null);

  // "앨범 커버" 탭 좌측 레일에서 선택된 패널
  // "theme" | "text" | "coverImage" | "sticker" | "story" | "timeline"
  const [coverPanel, setCoverPanel] = useState("text");

  // Collapsible sections (앨범 메모리 탭)
  const [bgmOpen, setBgmOpen] = useState(true);
  const [recordTypeOpen, setRecordTypeOpen] = useState(true);
  // 추모 앨범 전환 모달 (새 앨범 생성 — 원본 유지)
  const [showConvertModal, setShowConvertModal] = useState(false);
  const [recordType, setRecordType] = useState("exhibit");

  // VHS-specific settings
  const [vhsFilterOpen, setVhsFilterOpen] = useState(false);
  const [vhsFilter, setVhsFilter] = useState("none");
  const [vhsTransitionOpen, setVhsTransitionOpen] = useState(false);
  const [vhsTransition, setVhsTransition] = useState("kenburns");
  const [vhsPhotoFrameIndex, setVhsPhotoFrameIndex] = useState(0);
  // VHS 재생 설정 (record에 저장됨)
  const [vhsImageDuration, setVhsImageDuration] = useState(3);
  const [vhsVideoMode, setVhsVideoMode] = useState(10);
  // Walk(Time Travel) 재생 설정 (record에 저장됨)
  const [walkCameraSpeed, setWalkCameraSpeed] = useState(15);
  const [walkVideoPreview, setWalkVideoPreview] = useState(false);
  const [walkVideoMaxDuration, setWalkVideoMaxDuration] = useState(30);
  // Memorial-specific settings (record에 저장됨)
  const [memorialSettingsOpen, setMemorialSettingsOpen] = useState(false);
  const [memorialPosterStyle, setMemorialPosterStyle] = useState("classic");
  const [memorialPosterTone, setMemorialPosterTone] = useState("dark");
  const [memorialAspectRatio, setMemorialAspectRatio] = useState("9:16");
  const [keywordsExpanded, setKeywordsExpanded] = useState(false);
  const [keywordHelpOpen, setKeywordHelpOpen] = useState(false);
  const [timelineHelpOpen, setTimelineHelpOpen] = useState(true);

  // Tutorial
  const [showTutorial, setShowTutorial] = useState(false);
  const [showHeaderMenu, setShowHeaderMenu] = useState(false);

  // Admin check
  const [isAdmin, setIsAdmin] = useState(false);
  useEffect(() => {
    try {
      const u = JSON.parse(localStorage.getItem("app_user") || "{}");
      if (u.email && ADMIN_EMAILS.has(u.email)) setIsAdmin(true);
    } catch {}
  }, []);

  // AI story generation state
  const [isGenerating, setIsGenerating] = useState(false);
  const [bioError, setBioError] = useState("");
  const [storyGenCount, setStoryGenCount] = useState(0);
  const storyRemainingGens = isAdmin ? Infinity : 3 - storyGenCount;
  const [usedChips, setUsedChips] = useState(new Set());

  const [timelineError, setTimelineError] = useState("");

  // BGM
  const [bgmUrl, setBgmUrl] = useState(null);
  const [bgmId, setBgmId] = useState(null);

  const handleBgmChange = (url) => {
    setBgmUrl(url);
    const found = BGM_LIST.find((b) => b.url === url);
    setBgmId(found ? found.id : null);
  };

  // Record edit dialog
  const [showRecordEditDialog, setShowRecordEditDialog] = useState(false);
  const [editGooglePhotoUrl, setEditGooglePhotoUrl] = useState("");
  const [editGoogleDriveUrl, setEditGoogleDriveUrl] = useState("");
  const [editIcloudUrl, setEditIcloudUrl] = useState("");
  const [editMyboxUrl, setEditMyboxUrl] = useState("");
  const [selectedUrlType, setSelectedUrlType] = useState("google");
  const [editUrlValue, setEditUrlValue] = useState("");
  const [isRecordSaving, setIsRecordSaving] = useState(false);
  const [recordError, setRecordError] = useState("");

  // URLs from API
  const [googlePhotoUrl, setGooglePhotoUrl] = useState("");
  const [googleDriveUrl, setGoogleDriveUrl] = useState("");
  const [icloudUrl, setIcloudUrl] = useState("");
  const [myboxUrl, setMyboxUrl] = useState("");
  const [externalLinkTitle, setExternalLinkTitle] = useState("");
  const [externalLinkUrl, setExternalLinkUrl] = useState("");
  const [editExternalLinkTitle, setEditExternalLinkTitle] = useState("");
  const [editExternalLinkUrl, setEditExternalLinkUrl] = useState("");

  // Stable ID counter for timeline items
  const nextIdRef = useRef(1);
  const timelineIdsRef = useRef([]);

  // DnD sensors
  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 5 } }),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    }),
  );

  const coverRef = useRef(null);
  const backCoverRef = useRef(null);
  const initialState = useRef({
    frontCover: null,
    albumTitle: "",
    albumSubtitle: "",
    bio: "어린 시절, 골목길을 누비며 뛰어놀던 기억이 아직도 생생합니다. 여름이면 할머니 댁 마당에서 수박을 먹고, 겨울이면 온 동네가 하얗게 물든 눈밭 위를 걸었죠. 그 시절의 따뜻한 햇살과 웃음소리가 지금의 저를 만들어 주었습니다.",
    timeline: [
      { year: "1995", event: "서울에서 태어남" },
      { year: "2001", event: "초등학교 입학 - 첫 번째 친구를 만남" },
    ],
    selectedTheme: DEFAULT_THEME,
    stickers: [],
    titleOverlayEnabled: false,
    titlePosition: "bottom-center",
    titleFont: "Pretendard Variable",
    titleColor: "#000000",
    titleStroke: "none",
    titleStrokeOpacity: 100,
    bgmUrl: null,
    bgmId: null,
    backCoverImageUrl: null,
  });

  useEffect(() => {
    const fetchRecord = async () => {
      try {
        const response = await authedFetch(
          `https://the-life-museum-backend-production.up.railway.app/api/v1/record/${record_id}`,
        );

        const result = await response.json();

        if (result.ok && result.data) {
          const data = result.data;

          const coverUrl = data.coverImage?.url || null;
          const title = (data.title || "").slice(0, 20);
          const subtitle = (data.subtitle || "").slice(0, 25);
          const bioContent = (data.lifestory?.content || "").slice(0, 250);

          let timelineData = [];
          if (data.timeline?.events) {
            timelineData = data.timeline.events.slice(0, 10).map((event) => ({
              year: (event.timestamp ? event.timestamp : "").slice(0, 13),
              event:
                `${event.title}${event.description ? ` - ${event.description}` : ""}`.slice(
                  0,
                  25,
                ),
            }));
          }

          const savedTheme = UNIFIED_THEMES[data.theme]
            ? data.theme
            : DEFAULT_THEME;
          const savedStickers = Array.isArray(data.stickers)
            ? data.stickers
            : [];
          const savedTitleOverlayEnabled = data.coverTitleVisible ?? false;
          const savedTitlePosition = data.coverTitlePosition || "bottom-center";
          const savedTitleFont = data.coverTitleFont || "Pretendard Variable";
          const savedTitleColor =
            fromApiColor(data.coverTitleColor) || "#000000";
          const {
            stroke: savedTitleStroke,
            strokeOpacity: savedTitleStrokeOpacity,
          } = dbColorToStroke(data.coverTitleBgColor);

          setFrontCover(coverUrl);
          setBackCoverImageUrl(data.backCoverImageUrl || coverUrl);
          setAlbumTitle(title);
          setAlbumSubtitle(subtitle);
          setBio(bioContent);
          // Initialize timeline IDs for drag reorder
          timelineIdsRef.current = timelineData.map(
            () => `tl-${nextIdRef.current++}`,
          );
          setTimeline(timelineData);
          setSelectedTheme(savedTheme);
          setStickers(savedStickers);
          setTitleOverlayEnabled(savedTitleOverlayEnabled);
          setTitlePosition(savedTitlePosition);
          setTitleFont(savedTitleFont);
          setTitleColor(savedTitleColor);
          setTitleStroke(savedTitleStroke);
          setTitleStrokeOpacity(savedTitleStrokeOpacity);
          setGooglePhotoUrl(data.googlePhotoUrl || "");
          setGoogleDriveUrl(data.googleDriveUrl || "");
          setIcloudUrl(data.icloudUrl || "");
          setMyboxUrl(data.myboxUrl || "");
          setExternalLinkTitle(data.externalLinkTitle || "");
          setExternalLinkUrl(data.externalLinkUrl || "");
          console.log("storyGenCount from GET:", data.storyGenCount);
          if (data.storyGenCount != null) {
            setStoryGenCount(data.storyGenCount);
          }
          setBgmUrl(data.bgmUrl || null);
          setBgmId(data.bgmId ? `bgm${data.bgmId}` : null);
          setRecordType(data.recordType || "exhibit");
          if (data.vhsFilter) setVhsFilter(data.vhsFilter);
          if (data.vhsTransition) setVhsTransition(data.vhsTransition);
          if (data.vhsPhotoFrameIndex != null)
            setVhsPhotoFrameIndex(data.vhsPhotoFrameIndex);
          if (data.vhsImageDuration != null)
            setVhsImageDuration(data.vhsImageDuration);
          if (data.vhsVideoMode != null) setVhsVideoMode(data.vhsVideoMode);
          if (data.walkCameraSpeed != null)
            setWalkCameraSpeed(data.walkCameraSpeed);
          if (data.walkVideoPreview != null)
            setWalkVideoPreview(data.walkVideoPreview);
          if (data.walkVideoMaxDuration != null)
            setWalkVideoMaxDuration(data.walkVideoMaxDuration);
          if (data.memorialPosterStyle)
            setMemorialPosterStyle(data.memorialPosterStyle);
          if (data.memorialPosterTone)
            setMemorialPosterTone(data.memorialPosterTone);
          if (data.memorialAspectRatio)
            setMemorialAspectRatio(data.memorialAspectRatio);

          // Photo drive now auto-fetches on mount via useEffect

          initialState.current = {
            frontCover: coverUrl,
            albumTitle: title,
            albumSubtitle: subtitle,
            bio: bioContent,
            timeline: timelineData,
            selectedTheme: savedTheme,
            stickers: savedStickers,
            titleOverlayEnabled: savedTitleOverlayEnabled,
            titlePosition: savedTitlePosition,
            titleFont: savedTitleFont,
            titleColor: savedTitleColor,
            titleStroke: savedTitleStroke,
            titleStrokeOpacity: savedTitleStrokeOpacity,
            bgmUrl: data.bgmUrl || null,
            bgmId: data.bgmId ? `bgm${data.bgmId}` : null,
            backCoverImageUrl: data.backCoverImageUrl || coverUrl,
            recordType: data.recordType || "exhibit",
            vhsFilter: data.vhsFilter || "none",
            vhsTransition: data.vhsTransition || "kenburns",
            vhsPhotoFrameIndex: data.vhsPhotoFrameIndex || 0,
            vhsImageDuration: data.vhsImageDuration ?? 3,
            vhsVideoMode: data.vhsVideoMode ?? 10,
            walkCameraSpeed: data.walkCameraSpeed ?? 15,
            walkVideoPreview: data.walkVideoPreview ?? false,
            walkVideoMaxDuration: data.walkVideoMaxDuration ?? 30,
            memorialPosterStyle: data.memorialPosterStyle || "classic",
            memorialPosterTone: data.memorialPosterTone || "dark",
            memorialAspectRatio: data.memorialAspectRatio || "9:16",
          };
        }
      } catch (error) {
        console.error("메모리 불러오기 실패:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (record_id) {
      fetchRecord();
    }
  }, [record_id]);

  const saveRecordColors = async () => {
    const theme =
      UNIFIED_THEMES[selectedTheme] || UNIFIED_THEMES[DEFAULT_THEME];
    const response = await authedFetch(
      `https://the-life-museum-backend-production.up.railway.app/api/v1/record/${record_id}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          color: toApiColor(theme.text),
          bgColor: toApiColor(theme.bg),
          keyColor: toApiColor(theme.accent),
          theme: selectedTheme,
          stickers,
          title: albumTitle,
          subTitle: albumSubtitle,
          coverTitleVisible: titleOverlayEnabled,
          coverTitlePosition: titlePosition,
          coverTitleFont: titleFont,
          coverTitleColor: toApiColor(titleColor),
          coverTitleBgColor: strokeToDbColor(titleStroke, titleStrokeOpacity),
          bgmId: bgmId ? parseInt(bgmId.replace("bgm", ""), 10) : null,
          bgmUrl: bgmUrl || null,
          recordType,
          vhsFilter: recordType === "retro_tape" ? vhsFilter : undefined,
          vhsTransition:
            recordType === "retro_tape" ? vhsTransition : undefined,
          vhsPhotoFrameIndex:
            recordType === "retro_tape" ? vhsPhotoFrameIndex : undefined,
          vhsImageDuration:
            recordType === "retro_tape" ? vhsImageDuration : undefined,
          vhsVideoMode: recordType === "retro_tape" ? vhsVideoMode : undefined,
          walkCameraSpeed:
            recordType === "exhibit" ? walkCameraSpeed : undefined,
          walkVideoPreview:
            recordType === "exhibit" ? walkVideoPreview : undefined,
          walkVideoMaxDuration:
            recordType === "exhibit" ? walkVideoMaxDuration : undefined,
          memorialPosterStyle:
            recordType === "memorial" ? memorialPosterStyle : undefined,
          memorialPosterTone:
            recordType === "memorial" ? memorialPosterTone : undefined,
          memorialAspectRatio:
            recordType === "memorial" ? memorialAspectRatio : undefined,
        }),
      },
    );

    const data = await response.json();
    if (!response.ok) {
      console.error("saveRecordColors 422 detail:", JSON.stringify(data));
      throw new Error(data.error || data.detail || t.errorSaveColors);
    }
    return data;
  };

  // Bio save logic (from BioEditor)
  const saveBio = async () => {
    if (!bio.trim()) return;
    const response = await authedFetch(
      `https://the-life-museum-backend-production.up.railway.app/api/v1/record/${record_id}/lifestory`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          result: bio,
          qaList: [],
          mood: "neutral",
        }),
      },
    );
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || t.errorSave);
    }
    return data;
  };

  // Timeline save logic (from TimelineEditor)
  const saveTimeline = async () => {
    if (timeline.length === 0) return;
    const events = timeline.map((item) => {
      const [title, ...descParts] = item.event.split(" - ");
      const description = descParts.join(" - ");
      return {
        title: title || "",
        timestamp: item.year || null,
        description: description || "",
      };
    });
    const response = await authedFetch(
      `https://the-life-museum-backend-production.up.railway.app/api/v1/record/${record_id}/timeline`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ events }),
      },
    );
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || t.errorSave);
    }
    return data;
  };

  // AlbumPreview2D가 만들어 둔 최신 합성 커버(dataURL) — 저장 시 라이브러리
  // 캐시에 심어 복귀 즉시 최종 모습이 보이게 한다.
  const latestCompositesRef = useRef({ frontImage: null, backImage: null });
  const handleCoversComposited = useCallback((covers) => {
    latestCompositesRef.current = covers;
  }, []);

  // 헤더 메뉴의 "저장"은 완료를 기다리지 않고 바로 실행되는데, 그 직후
  // "나가기"를 누르면 뒷면 사진 등 저장이 DB에 반영되기 전에 라이브러리로
  // 이동해 반영 안 된 것처럼 보일 수 있다. 진행 중인 저장을 추적해두었다가
  // 나가기 시점에 끝날 때까지 기다린다.
  const pendingSaveRef = useRef(null);

  const handleSaveAll = async () => {
    const isCoverDirty = frontCover !== initialState.current.frontCover;
    const isBackCoverDirty =
      backCoverImageUrl !== initialState.current.backCoverImageUrl;
    const isBioDirty = bio !== initialState.current.bio;
    const isTimelineDirty =
      JSON.stringify(timeline) !==
      JSON.stringify(initialState.current.timeline);
    const isThemeDirty =
      selectedTheme !== initialState.current.selectedTheme ||
      JSON.stringify(stickers) !==
        JSON.stringify(initialState.current.stickers || []) ||
      albumTitle !== initialState.current.albumTitle ||
      albumSubtitle !== initialState.current.albumSubtitle ||
      titleOverlayEnabled !== initialState.current.titleOverlayEnabled ||
      titlePosition !== initialState.current.titlePosition ||
      titleFont !== initialState.current.titleFont ||
      titleColor !== initialState.current.titleColor ||
      titleStroke !== initialState.current.titleStroke ||
      titleStrokeOpacity !== initialState.current.titleStrokeOpacity ||
      bgmUrl !== initialState.current.bgmUrl ||
      recordType !== initialState.current.recordType ||
      vhsFilter !== initialState.current.vhsFilter ||
      vhsTransition !== initialState.current.vhsTransition ||
      vhsPhotoFrameIndex !== initialState.current.vhsPhotoFrameIndex ||
      vhsImageDuration !== initialState.current.vhsImageDuration ||
      vhsVideoMode !== initialState.current.vhsVideoMode ||
      walkCameraSpeed !== initialState.current.walkCameraSpeed ||
      walkVideoPreview !== initialState.current.walkVideoPreview ||
      walkVideoMaxDuration !== initialState.current.walkVideoMaxDuration ||
      memorialPosterStyle !== initialState.current.memorialPosterStyle ||
      memorialPosterTone !== initialState.current.memorialPosterTone ||
      memorialAspectRatio !== initialState.current.memorialAspectRatio;

    if (
      !isCoverDirty &&
      !isBioDirty &&
      !isTimelineDirty &&
      !isThemeDirty &&
      !isBackCoverDirty
    )
      return;

    setIsSaving(true);

    const promises = [];

    if (isCoverDirty && coverRef.current) {
      promises.push(
        coverRef.current
          .save()
          .then(() => ({ editor: "cover", success: true }))
          .catch((err) => ({ editor: "cover", success: false, error: err })),
      );
    }

    if (isBackCoverDirty) {
      const doSaveBackCover = async () => {
        let finalUrl = backCoverImageUrl;
        if (backCoverRef.current) {
          // backCoverRef.save()가 새 사진이 있으면 업로드 + DB 저장까지
          // 끝낸다. 사진을 "제거"한 경우(finalUrl null)만 여기서 별도로
          // 반영한다 — save()는 업로드할 파일이 없으면 아무 요청도 보내지
          // 않기 때문. (과거엔 매번 두 번째 PATCH를 중복 호출했음)
          const uploadedUrl = await backCoverRef.current.save();
          if (uploadedUrl !== null) {
            finalUrl = uploadedUrl;
          } else if (!backCoverImageUrl) {
            const response = await authedFetch(
              `https://the-life-museum-backend-production.up.railway.app/api/v1/record/${record_id}`,
              {
                method: "PATCH",
                headers: {
                  "Content-Type": "application/json",
                },
                body: JSON.stringify({ backCoverImageUrl: null }),
              },
            );
            const data = await response.json();
            if (!response.ok)
              throw new Error(data.error || t.errorSaveBackCover);
          }
        }
        return { editor: "backCover", success: true, url: finalUrl };
      };
      promises.push(
        doSaveBackCover().catch((err) => ({
          editor: "backCover",
          success: false,
          error: err,
        })),
      );
    }

    if (isBioDirty) {
      promises.push(
        saveBio()
          .then(() => ({ editor: "bio", success: true }))
          .catch((err) => ({ editor: "bio", success: false, error: err })),
      );
    }

    if (isTimelineDirty) {
      promises.push(
        saveTimeline()
          .then(() => ({ editor: "timeline", success: true }))
          .catch((err) => ({ editor: "timeline", success: false, error: err })),
      );
    }

    if (isThemeDirty) {
      promises.push(
        saveRecordColors()
          .then(() => ({ editor: "theme", success: true }))
          .catch((err) => ({ editor: "theme", success: false, error: err })),
      );
    }

    const results = await Promise.allSettled(promises);

    for (const r of results) {
      if (r.status === "fulfilled" && r.value.success) {
        if (r.value.editor === "cover") {
          initialState.current.frontCover = frontCover;
        } else if (r.value.editor === "backCover") {
          const savedUrl = r.value.url;
          initialState.current.backCoverImageUrl = savedUrl;
          setBackCoverImageUrl(savedUrl);
        } else if (r.value.editor === "bio") {
          initialState.current.bio = bio;
        } else if (r.value.editor === "timeline") {
          initialState.current.timeline = [...timeline];
        } else if (r.value.editor === "theme") {
          initialState.current.selectedTheme = selectedTheme;
          initialState.current.stickers = [...stickers];
          initialState.current.albumTitle = albumTitle;
          initialState.current.albumSubtitle = albumSubtitle;
          initialState.current.titleOverlayEnabled = titleOverlayEnabled;
          initialState.current.titlePosition = titlePosition;
          initialState.current.titleFont = titleFont;
          initialState.current.titleColor = titleColor;
          initialState.current.titleStroke = titleStroke;
          initialState.current.titleStrokeOpacity = titleStrokeOpacity;
          initialState.current.bgmUrl = bgmUrl;
          initialState.current.bgmId = bgmId;
          initialState.current.recordType = recordType;
          initialState.current.vhsFilter = vhsFilter;
          initialState.current.vhsTransition = vhsTransition;
          initialState.current.vhsPhotoFrameIndex = vhsPhotoFrameIndex;
          initialState.current.vhsImageDuration = vhsImageDuration;
          initialState.current.vhsVideoMode = vhsVideoMode;
          initialState.current.walkCameraSpeed = walkCameraSpeed;
          initialState.current.walkVideoPreview = walkVideoPreview;
          initialState.current.walkVideoMaxDuration = walkVideoMaxDuration;
          initialState.current.memorialPosterStyle = memorialPosterStyle;
          initialState.current.memorialPosterTone = memorialPosterTone;
          initialState.current.memorialAspectRatio = memorialAspectRatio;
        }
      }
    }

    const anySuccess = results.some(
      (r) => r.status === "fulfilled" && r.value.success,
    );
    if (anySuccess) {
      setLastSavedAt(new Date());
      // Bust the shared record cache so the /vhs and /walk viewers refetch and
      // reflect this edit (e.g. VHS photo-frame) without an app restart.
      invalidateRecord(record_id);

      // 라이브러리 캐시 낙관적 갱신: 저장 직후 라이브러리로 돌아갈 때 이 앨범이
      // 수정 전 모습/원본으로 잠깐이라도 보이지 않도록, "타이틀 오버레이까지
      // 입힌 최종 합성 커버"를 여기서 직접 생성해 심는다. 프리뷰의 디바운스된
      // 합성본(ref)은 저장 타이밍에 따라 한 박자 늦을 수 있으므로 폴백으로만 쓴다.
      // 이미지 로더는 프리뷰와 캐시를 공유하므로 이 생성은 사실상 즉시 끝난다.
      // sig 없이 optimistic 플래그로 저장 → 라이브러리는 이 합성본을 즉시
      // 표시하되, fetch 후 서버 데이터 기준으로 백그라운드 재합성해 확정한다.
      let optimisticFront = null;
      try {
        const frontImg = await loadCachedImage(frontCover);
        if (frontImg) {
          optimisticFront = generateFrontCoverDataUrl(frontImg, {
            title: titleOverlayEnabled ? albumTitle || "" : "",
            subtitle: "",
            position: titlePosition || "bottom-center",
            font: titleFont || "Pretendard Variable",
            color: titleColor || "#000000",
            stroke: titleStroke ?? false,
            strokeOpacity: titleStrokeOpacity ?? 100,
          });
        }
      } catch {
        // 합성 실패 시 아래 폴백 사용
      }
      optimisticFront =
        optimisticFront ||
        latestCompositesRef.current.frontImage ||
        frontCover ||
        null;
      const optimisticBack = latestCompositesRef.current.backImage || null;
      // eslint-disable-next-line no-console
      console.debug(
        "[cover-sync] save:",
        record_id.slice(0, 8),
        "front=",
        optimisticFront ? optimisticFront.slice(0, 24) : null,
      );
      setOptimisticCover(record_id, {
        frontImage: optimisticFront,
        backImage: optimisticBack,
      });
      setCachedAlbums(
        cachedAlbums.map((a) =>
          a.id === record_id
            ? {
                ...a,
                title: albumTitle,
                subtitle: albumSubtitle,
                frontImage: optimisticFront || a.frontImage,
                backImage: optimisticBack,
              }
            : a,
        ),
      );
    }

    setIsSaving(false);
  };

  const isDirty =
    backCoverImageUrl !== initialState.current.backCoverImageUrl ||
    frontCover !== initialState.current.frontCover ||
    albumTitle !== initialState.current.albumTitle ||
    albumSubtitle !== initialState.current.albumSubtitle ||
    bio !== initialState.current.bio ||
    JSON.stringify(timeline) !==
      JSON.stringify(initialState.current.timeline) ||
    selectedTheme !== initialState.current.selectedTheme ||
    JSON.stringify(stickers) !==
      JSON.stringify(initialState.current.stickers || []) ||
    titleOverlayEnabled !== initialState.current.titleOverlayEnabled ||
    titlePosition !== initialState.current.titlePosition ||
    titleFont !== initialState.current.titleFont ||
    titleColor !== initialState.current.titleColor ||
    titleStroke !== initialState.current.titleStroke ||
    titleStrokeOpacity !== initialState.current.titleStrokeOpacity ||
    bgmUrl !== initialState.current.bgmUrl ||
    recordType !== initialState.current.recordType ||
    vhsFilter !== initialState.current.vhsFilter ||
    vhsTransition !== initialState.current.vhsTransition ||
    vhsPhotoFrameIndex !== initialState.current.vhsPhotoFrameIndex ||
    vhsImageDuration !== initialState.current.vhsImageDuration ||
    vhsVideoMode !== initialState.current.vhsVideoMode ||
    walkCameraSpeed !== initialState.current.walkCameraSpeed ||
    walkVideoPreview !== initialState.current.walkVideoPreview ||
    walkVideoMaxDuration !== initialState.current.walkVideoMaxDuration ||
    memorialPosterStyle !== initialState.current.memorialPosterStyle ||
    memorialPosterTone !== initialState.current.memorialPosterTone ||
    memorialAspectRatio !== initialState.current.memorialAspectRatio;

  const handleExit = async () => {
    if (pendingSaveRef.current) {
      try {
        await pendingSaveRef.current;
      } catch {
        // 저장 실패해도 사용자가 나가기를 선택했으므로 그대로 진행
      }
    }
    router.push("/library");
  };

  const handleSaveAndExit = async () => {
    await handleSaveAll();
    router.push("/library");
  };

  const pendingAIAction = useRef(null);
  const consentResolveRef = useRef(null);

  // AI story generation
  const handleGenerate = async () => {
    const fullText = getFullBioText();
    if (!fullText || storyRemainingGens <= 0) return;
    if (!hasAIConsent()) {
      pendingAIAction.current = () => handleGenerate();
      setShowAIConsent("story");
      return;
    }
    setIsGenerating(true);
    setBioError("");
    console.log("fullText", fullText);

    // Optimistic update
    const optimisticCount = storyGenCount + 1;
    setStoryGenCount(optimisticCount);

    try {
      const response = await authedFetch(
        `https://the-life-museum-backend-production.up.railway.app/api/v1/record/${record_id}/lifestory/create`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ prompt: fullText, albumTitle }),
        },
      );

      const data = await response.json();
      if (!response.ok) {
        setStoryGenCount(optimisticCount - 1); // rollback
        throw new Error(data.error || t.errorGenerate);
      }
      setBio(data.data?.result || "");
      // Sync with server value if provided
      const newCount =
        data.data?.storyGenCount != null
          ? data.data.storyGenCount
          : optimisticCount;
      setStoryGenCount(newCount);

      // Persist count to server
      authedFetch(
        `https://the-life-museum-backend-production.up.railway.app/api/v1/record/${record_id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ storyGenCount: newCount }),
        },
      )
        .then((r) => r.json())
        .then((d) => console.log("storyGenCount PATCH response:", d))
        .catch((e) => console.error("Failed to persist storyGenCount:", e));
    } catch (err) {
      setBioError(err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const handleChipClick = (chip) => {
    if (usedChips.has(chip)) return;
    setUsedChips((prev) => new Set([...prev, chip]));
  };

  const handleChipRemove = (chip) => {
    setUsedChips((prev) => {
      const next = new Set(prev);
      next.delete(chip);
      return next;
    });
  };

  // Combine chips + bio for API calls
  const getFullBioText = () => {
    const chips = [...usedChips].join(" ");
    const text = (bio || "").trim();
    if (chips && text) return `${chips} ${text}`;
    return chips || text;
  };

  // Sync timeline IDs when timeline length changes
  const ensureTimelineIds = (items) => {
    while (timelineIdsRef.current.length < items.length) {
      timelineIdsRef.current.push(`tl-${nextIdRef.current++}`);
    }
    if (timelineIdsRef.current.length > items.length) {
      timelineIdsRef.current = timelineIdsRef.current.slice(0, items.length);
    }
  };
  ensureTimelineIds(timeline);

  // Timeline helpers
  const addTimelineItem = () => {
    if (timeline.length >= 10) return;
    const newId = `tl-${nextIdRef.current++}`;
    timelineIdsRef.current = [...timelineIdsRef.current, newId];
    setTimeline([...timeline, { year: "", event: "" }]);
  };

  const updateTimelineItem = (index, field, value) => {
    const updated = timeline.map((item, i) =>
      i === index ? { ...item, [field]: value } : item,
    );
    setTimeline(updated);
  };

  const removeTimelineItem = (index) => {
    timelineIdsRef.current = timelineIdsRef.current.filter(
      (_, i) => i !== index,
    );
    setTimeline(timeline.filter((_, i) => i !== index));
  };

  const handleDragEnd = (event) => {
    const { active, over } = event;
    if (!over || active.id === over.id) return;

    const oldIndex = timelineIdsRef.current.indexOf(active.id);
    const newIndex = timelineIdsRef.current.indexOf(over.id);
    if (oldIndex === -1 || newIndex === -1) return;

    timelineIdsRef.current = arrayMove(
      timelineIdsRef.current,
      oldIndex,
      newIndex,
    );
    setTimeline(arrayMove(timeline, oldIndex, newIndex));
  };

  // Record edit dialog
  const openRecordEditDialog = () => {
    setEditGooglePhotoUrl(googlePhotoUrl);
    setEditGoogleDriveUrl(googleDriveUrl);
    setEditIcloudUrl(icloudUrl);
    setEditMyboxUrl(myboxUrl);
    // Determine which URL type is selected based on existing data
    if (myboxUrl) {
      setSelectedUrlType("mybox");
      setEditUrlValue(myboxUrl);
    } else if (icloudUrl) {
      setSelectedUrlType("icloud");
      setEditUrlValue(icloudUrl);
    } else if (googleDriveUrl) {
      setSelectedUrlType("drive");
      setEditUrlValue(googleDriveUrl);
    } else {
      setSelectedUrlType("google");
      setEditUrlValue(googlePhotoUrl);
    }
    setEditExternalLinkTitle(externalLinkTitle);
    setEditExternalLinkUrl(externalLinkUrl);
    setRecordError("");
    setShowDeleteConfirm(false);
    setShowRecordEditDialog(true);
  };

  const handleRecordEditSave = async () => {
    setIsRecordSaving(true);
    setRecordError("");

    const finalGoogleUrl = selectedUrlType === "google" ? editUrlValue : "";
    const finalGoogleDriveUrl = selectedUrlType === "drive" ? editUrlValue : "";
    const finalIcloudUrl = selectedUrlType === "icloud" ? editUrlValue : "";
    const finalMyboxUrl = selectedUrlType === "mybox" ? editUrlValue : "";

    // 외부 링크: 프로토콜 없으면 https:// 보정 후 저장 (공유 페이지에서 상대경로 에러 방지)
    const trimmedExternalUrl = editExternalLinkUrl.trim();
    const finalExternalLinkUrl = trimmedExternalUrl
      ? /^https?:\/\//i.test(trimmedExternalUrl)
        ? trimmedExternalUrl
        : `https://${trimmedExternalUrl}`
      : "";

    try {
      const response = await authedFetch(
        `https://the-life-museum-backend-production.up.railway.app/api/v1/record/${record_id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            googlePhotoUrl: finalGoogleUrl,
            googleDriveUrl: finalGoogleDriveUrl,
            icloudUrl: finalIcloudUrl,
            myboxUrl: finalMyboxUrl,
            externalLinkTitle: editExternalLinkTitle,
            externalLinkUrl: finalExternalLinkUrl,
          }),
        },
      );

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || t.errorSave);
      }

      setGooglePhotoUrl(finalGoogleUrl);
      setGoogleDriveUrl(finalGoogleDriveUrl);
      setIcloudUrl(finalIcloudUrl);
      setMyboxUrl(finalMyboxUrl);
      setExternalLinkTitle(editExternalLinkTitle);
      setExternalLinkUrl(finalExternalLinkUrl);
      setEditExternalLinkUrl(finalExternalLinkUrl);
      setShowRecordEditDialog(false);
    } catch (err) {
      setRecordError(err.message);
    } finally {
      setIsRecordSaving(false);
    }
  };

  const handleReset = () => {
    const s = initialState.current;
    setFrontCover(s.frontCover);
    setAlbumTitle(s.albumTitle);
    setAlbumSubtitle(s.albumSubtitle);
    setBio(s.bio);
    timelineIdsRef.current = s.timeline.map(() => `tl-${nextIdRef.current++}`);
    setTimeline([...s.timeline]);
    setSelectedTheme(s.selectedTheme);
    setTitleOverlayEnabled(s.titleOverlayEnabled);
    setTitlePosition(s.titlePosition);
    setTitleFont(s.titleFont);
    setTitleColor(s.titleColor);
    setTitleStrokeOpacity(s.titleStrokeOpacity ?? 100);
    setBackCoverImageUrl(s.backCoverImageUrl);
    setUsedChips(new Set());
  };

  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [showAIConsent, setShowAIConsent] = useState(() =>
    hasAIConsent() ? null : "story",
  );

  const handleDeleteRecord = async () => {
    setIsDeleting(true);
    setRecordError("");
    try {
      const response = await authedFetch(
        `https://the-life-museum-backend-production.up.railway.app/api/v1/record/${record_id}`,
        { method: "DELETE" },
      );
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || t.errorDelete);
      }
      // 삭제된 앨범이 라이브러리 복귀 직후 캐시로 잠깐 보이지 않도록 제거
      coverCache.delete(record_id);
      setCachedAlbums(cachedAlbums.filter((a) => a.id !== record_id));
      router.push("/library");
    } catch (err) {
      setRecordError(err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#1e1a14]">
        <p className="text-[#9b8b7a]">{t.loading}</p>
      </div>
    );
  }

  // "앨범 커버" 탭 좌측 레일 항목 — side: 미리보기가 자동으로 전환될 면
  const RAIL_ITEMS = [
    { key: "theme", label: t.railTheme, icon: Palette, side: "back" },
    { key: "text", label: t.railText, icon: Type, side: "front" },
    {
      key: "coverImage",
      label: t.railCoverImage,
      icon: ImageIcon,
      side: "front",
    },
    { key: "sticker", label: t.railSticker, icon: Sticker, side: "back" },
    { key: "story", label: t.railStory, icon: BookOpen, side: "back" },
    { key: "timeline", label: t.railTimeline, icon: History, side: "back" },
  ];

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-[#1e1a14]">
      {/* Header - Mobile */}
      <header className="border-b border-[rgba(255,255,255,0.08)] bg-[#241f18] pt-[env(safe-area-inset-top)]">
        <div className="relative flex items-center justify-between px-3 py-2 lg:hidden">
          <button
            data-tutorial="exit"
            onClick={() => setShowExitDialog(true)}
            className="flex h-9 w-9 items-center justify-center rounded-md text-[#9b8b7a]"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="absolute left-1/2 -translate-x-1/2 text-center">
            <h1 className="text-sm font-semibold text-[#e8d5b7]">
              {albumTitle || t.albumEdit}
            </h1>
            {albumSubtitle && (
              <p className="text-[11px] leading-tight text-[#9b8b7a]">
                {albumSubtitle}
              </p>
            )}
          </div>
          <div className="relative">
            <button
              onClick={() => setShowHeaderMenu(!showHeaderMenu)}
              className="flex h-9 w-9 items-center justify-center rounded-md text-[#9b8b7a]"
            >
              <MoreVertical className="h-5 w-5" />
            </button>
            <AnimatePresence>
              {showHeaderMenu && (
                <>
                  <div
                    className="fixed inset-0 z-30"
                    onClick={() => setShowHeaderMenu(false)}
                  />
                  <motion.div
                    initial={{ opacity: 0, scale: 0.95, y: -4 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95, y: -4 }}
                    transition={{ duration: 0.15 }}
                    className="absolute top-full right-0 z-40 mt-1 w-48 overflow-hidden rounded-xl bg-[#2a2318] py-1 shadow-lg ring-1 ring-white/10"
                  >
                    <button
                      onClick={() => {
                        openRecordEditDialog();
                        setShowHeaderMenu(false);
                      }}
                      className="flex w-full items-center gap-3 px-4 py-2.5 text-[13px] text-[#e8d5b7] active:bg-white/5"
                    >
                      <Pencil className="h-4 w-4 text-[#9b8b7a]" />
                      {t.editInfo}
                    </button>
                    <button
                      onClick={() => {
                        pendingSaveRef.current = handleSaveAll().finally(() => {
                          pendingSaveRef.current = null;
                        });
                        setShowHeaderMenu(false);
                      }}
                      disabled={isSaving || !isDirty}
                      className="text-[#e8d5b7 ] flex w-full items-center gap-3 px-4 py-2.5 text-[13px] text-[#e8d5b7] active:bg-white/5 disabled:opacity-40"
                    >
                      {isSaving ? (
                        <RefreshCw className="h-4 w-4 animate-spin" />
                      ) : (
                        <Save className="h-4 w-4" />
                      )}
                      {t.save}
                    </button>
                    <button
                      onClick={() => {
                        handleReset();
                        setShowHeaderMenu(false);
                      }}
                      disabled={!isDirty}
                      className="flex w-full items-center gap-3 px-4 py-2.5 text-[13px] text-[#e8d5b7] active:bg-white/5 disabled:opacity-40"
                    >
                      <Undo2 className="h-4 w-4 text-[#9b8b7a]" />
                      {t.reset}
                    </button>
                    <button
                      onClick={() => {
                        setShowTutorial(true);
                        setShowHeaderMenu(false);
                      }}
                      className="flex w-full items-center gap-3 px-4 py-2.5 text-[13px] text-[#e8d5b7] active:bg-white/5"
                    >
                      <HelpCircle className="h-4 w-4 text-[#9b8b7a]" />
                      {t.tutorial}
                    </button>
                  </motion.div>
                </>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* Header - Desktop */}
        <div className="hidden items-center justify-between px-4 py-3 lg:flex">
          <div className="flex items-center gap-3">
            <div className="group relative">
              <button
                data-tutorial="exit"
                onClick={() => setShowExitDialog(true)}
                className="flex h-8 w-8 items-center justify-center rounded-md text-[#9b8b7a] transition-colors hover:bg-white/8 hover:text-[#e8d5b7]"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <span className="pointer-events-none absolute top-full left-1/2 z-50 mt-1.5 -translate-x-1/2 rounded bg-[#2a2318] px-2 py-1 text-[10px] whitespace-nowrap text-[#e8d5b7] opacity-0 ring-1 ring-white/10 transition-opacity group-hover:opacity-100">
                {t.exit}
              </span>
            </div>
            <div>
              <h1 className="text-sm leading-tight font-semibold text-[#e8d5b7]">
                {albumTitle || t.albumEdit}
              </h1>
              {albumSubtitle && (
                <p className="text-[11px] leading-tight text-[#9b8b7a]">
                  {albumSubtitle}
                </p>
              )}
            </div>
            <div className="ml-1 flex items-center gap-1.5">
              <div className="group relative">
                <button
                  onClick={openRecordEditDialog}
                  className="hover:text-[#e8d5b7 ] flex h-8 w-8 items-center justify-center rounded-md text-[#9b8b7a] transition-colors hover:bg-white/8"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </button>
                <span className="pointer-events-none absolute top-full left-1/2 z-50 mt-1.5 -translate-x-1/2 rounded bg-[#2a2318] px-2 py-1 text-[10px] whitespace-nowrap text-[#e8d5b7] opacity-0 ring-1 ring-white/10 transition-opacity group-hover:opacity-100">
                  {t.editInfo}
                </span>
              </div>
              <div className="group relative">
                <button
                  disabled={!isDirty}
                  onClick={handleReset}
                  className={`flex h-8 w-8 items-center justify-center rounded-md text-[#9b8b7a] transition-colors ${
                    isDirty
                      ? "hover:bg-white/8 hover:text-red-400"
                      : "cursor-default text-[#9b8b7a]/40"
                  }`}
                >
                  <Undo2 className="h-3.5 w-3.5" />
                </button>
                <span className="pointer-events-none absolute top-full left-1/2 z-50 mt-1.5 -translate-x-1/2 rounded bg-[#2a2318] px-2 py-1 text-[10px] whitespace-nowrap text-[#e8d5b7] opacity-0 ring-1 ring-white/10 transition-opacity group-hover:opacity-100">
                  {t.reset}
                </span>
              </div>
              <div className="group relative">
                <button
                  data-tutorial="save"
                  onClick={handleSaveAll}
                  disabled={isSaving || !isDirty}
                  className={`flex h-8 w-8 items-center justify-center rounded-md transition-colors ${
                    isDirty
                      ? "text-[#c4b49a] hover:bg-[#c4b49a]/10"
                      : "cursor-default text-[#9b8b7a]/40"
                  }`}
                >
                  {isSaving ? (
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Save className="h-3.5 w-3.5" />
                  )}
                </button>
                <span className="pointer-events-none absolute top-full left-1/2 z-50 mt-1.5 -translate-x-1/2 rounded bg-[#2a2318] px-2 py-1 text-[10px] whitespace-nowrap text-[#e8d5b7] opacity-0 ring-1 ring-white/10 transition-opacity group-hover:opacity-100">
                  {t.save}
                </span>
              </div>
              <div className="group relative">
                <button
                  onClick={() => setShowTutorial(true)}
                  className="hover:text-[#e8d5b7 ] flex h-8 w-8 items-center justify-center rounded-md text-[#9b8b7a] transition-colors hover:bg-white/8"
                >
                  <HelpCircle className="h-3.5 w-3.5" />
                </button>
                <span className="pointer-events-none absolute top-full left-1/2 z-50 mt-1.5 -translate-x-1/2 rounded bg-[#2a2318] px-2 py-1 text-[10px] whitespace-nowrap text-[#e8d5b7] opacity-0 ring-1 ring-white/10 transition-opacity group-hover:opacity-100">
                  {t.tutorial}
                </span>
              </div>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            {lastSavedAt && (
              <p className="text-[10px] text-[#9b8b7a]/60">
                {t.lastSaved}{" "}
                {lastSavedAt.toLocaleTimeString(
                  locale === "en" ? "en-US" : "ko-KR",
                  {
                    hour: "2-digit",
                    minute: "2-digit",
                  },
                )}
              </p>
            )}
          </div>
        </div>
      </header>

      <div className="relative flex flex-1 flex-col overflow-hidden lg:flex-row">
        {/* Preview Panel - top half on mobile, right side on desktop */}
        <div
          className="h-[45vh] shrink-0 bg-[#1a1510] lg:order-2 lg:h-auto lg:flex-1"
          data-tutorial="preview"
        >
          {recordType === "retro_tape" && activeTab === "memory" ? (
            <VHSPreview
              photoMedia={photoDrive.photoMedia}
              mediaLoading={photoDrive.isLoading}
              colorFilter={vhsFilter}
              transitionType={vhsTransition}
              photoFrameIndex={vhsPhotoFrameIndex}
              onPhotoFrameIndexChange={setVhsPhotoFrameIndex}
              imageDuration={vhsImageDuration}
              onImageDurationChange={setVhsImageDuration}
              videoMode={vhsVideoMode}
              onVideoModeChange={setVhsVideoMode}
              frontCover={frontCover}
              backCoverImageUrl={backCoverImageUrl}
            />
          ) : recordType === "exhibit" && activeTab === "memory" ? (
            <WalkPreview
              photoMedia={photoDrive.photoMedia}
              mediaLoading={photoDrive.isLoading}
              title={albumTitle}
              cameraSpeed={walkCameraSpeed}
              onCameraSpeedChange={setWalkCameraSpeed}
              videoPreviewEnabled={walkVideoPreview}
              onVideoPreviewChange={setWalkVideoPreview}
              videoMaxDuration={walkVideoMaxDuration}
              onVideoMaxDurationChange={setWalkVideoMaxDuration}
            />
          ) : recordType === "memorial" && activeTab === "memory" ? (
            <MemorialPreview
              photoMedia={photoDrive.photoMedia}
              mediaLoading={photoDrive.isLoading}
              albumTitle={albumTitle}
              albumSubtitle={albumSubtitle}
              timeline={timeline}
              posterStyle={memorialPosterStyle}
              posterTone={memorialPosterTone}
              aspectRatio={memorialAspectRatio}
              coverImageUrl={frontCover}
              viewUrl={`/${locale}/memorial/${record_id}`}
            />
          ) : (
            <AlbumPreview2D
              frontCover={frontCover}
              backCoverImageUrl={backCoverImageUrl}
              bio={bio}
              timeline={timeline}
              selectedTheme={selectedTheme}
              stickers={stickers}
              onStickersChange={setStickers}
              albumTitle={albumTitle}
              albumSubTitle={albumSubtitle}
              titleOverlayEnabled={titleOverlayEnabled}
              titlePosition={titlePosition}
              titleFont={titleFont}
              titleColor={titleColor}
              titleStroke={titleStroke}
              titleStrokeOpacity={titleStrokeOpacity}
              flipped={previewFlipped}
              onFlipChange={setPreviewFlipped}
              locale={locale}
              onCoversComposited={handleCoversComposited}
            />
          )}
        </div>

        {/* Editor: bottom half on mobile, sidebar on desktop */}
        <div className="min-h-0 flex-1 overflow-hidden bg-[#241f18] lg:order-1 lg:h-auto lg:w-[420px] lg:flex-none lg:shrink-0 lg:border-r lg:border-white/10">
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex h-full flex-col"
          >
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="flex h-full w-full flex-col"
            >
              <TabsList className="flex h-auto w-full shrink-0 rounded-none border-b border-white/10 bg-transparent p-0">
                <TabsTrigger
                  value="cover"
                  className="relative flex-1 rounded-none border-b-2 border-transparent bg-transparent pt-4 pb-[18px] text-xs font-bold text-[#9b8b7a] transition-colors hover:text-[#c4a882] data-[state=active]:border-[#c4b49a] data-[state=active]:bg-transparent data-[state=active]:text-[#c4b49a] data-[state=active]:shadow-none"
                >
                  {t.tabCover}
                </TabsTrigger>
                <TabsTrigger
                  value="memory"
                  className="relative flex-1 rounded-none border-b-2 border-transparent bg-transparent pt-4 pb-[18px] text-xs font-bold text-[#9b8b7a] transition-colors hover:text-[#c4a882] data-[state=active]:border-[#c4b49a] data-[state=active]:bg-transparent data-[state=active]:text-[#c4b49a] data-[state=active]:shadow-none"
                >
                  {t.tabMemory}
                </TabsTrigger>
              </TabsList>

              <TabsContent
                value="cover"
                forceMount
                className="min-h-0 flex-1 overflow-hidden data-[state=inactive]:hidden"
              >
                <div className="flex h-full flex-col lg:flex-row">
                  {/* Rail */}
                  <div className="scrollbar-hide flex shrink-0 gap-1 overflow-x-auto border-b border-white/10 p-2 lg:w-20 lg:flex-col lg:overflow-x-visible lg:overflow-y-auto lg:border-r lg:border-b-0">
                    {RAIL_ITEMS.map((item) => {
                      const Icon = item.icon;
                      const isActive = coverPanel === item.key;
                      return (
                        <button
                          key={item.key}
                          onClick={() => {
                            setCoverPanel(item.key);
                            // 스티커 탭은 지금 보이는 면을 그대로 편집하므로 뒤집지 않는다.
                            if (item.key === "sticker") return;
                            setPreviewFlipped(
                              item.key === "coverImage"
                                ? coverImageSide === "back"
                                : item.side === "back",
                            );
                          }}
                          className={`flex shrink-0 flex-col items-center gap-1 rounded-lg px-3 py-2.5 text-[11px] font-medium whitespace-nowrap transition-colors lg:w-full lg:text-center lg:leading-tight lg:break-keep lg:whitespace-normal ${
                            isActive
                              ? "bg-[#c4b49a]/15 text-[#c4b49a]"
                              : "text-[#9b8b7a] hover:bg-white/5 hover:text-[#e8d5b7]"
                          }`}
                        >
                          <Icon className="h-5 w-5" />
                          {item.label}
                        </button>
                      );
                    })}
                  </div>

                  {/* Detail panel */}
                  <div className="scrollbar-accent min-h-0 flex-1 overflow-y-auto px-4 pt-5 pb-10 sm:px-5">
                    <div
                      className={coverPanel === "text" ? "space-y-5" : "hidden"}
                    >
                      {/* Title / Subtitle inputs (always visible) */}
                      <div className="space-y-3">
                        <div>
                          <div className="mb-1.5 flex items-center justify-between">
                            <label className="block text-xs font-medium text-[#9b8b7a]">
                              {t.titleLabel}
                            </label>
                            <span className="text-[10px] text-[#9b8b7a]">
                              {albumTitle.length}/20
                            </span>
                          </div>
                          <input
                            type="text"
                            value={albumTitle}
                            onChange={(e) =>
                              setAlbumTitle(e.target.value.slice(0, 20))
                            }
                            maxLength={20}
                            placeholder={t.titlePlaceholder}
                            className="focus:border-[#e8d5b7 ] w-full rounded-[5px] border border-white/10 bg-[#2e2720] px-3 py-2 text-sm text-[#e8d5b7] placeholder:text-[#9b8b7a]/60 focus:outline-none"
                          />
                        </div>
                        <div>
                          <div className="mb-1.5 flex items-center justify-between">
                            <label className="block text-xs font-medium text-[#9b8b7a]">
                              {t.subtitleLabel}
                            </label>
                            <span className="text-[10px] text-[#9b8b7a]">
                              {albumSubtitle.length}/25
                            </span>
                          </div>
                          <input
                            type="text"
                            value={albumSubtitle}
                            onChange={(e) =>
                              setAlbumSubtitle(e.target.value.slice(0, 25))
                            }
                            maxLength={25}
                            placeholder={t.subtitlePlaceholder}
                            className="focus:border-[#e8d5b7 ] w-full rounded-[5px] border border-white/10 bg-[#2e2720] px-3 py-2 text-sm text-[#e8d5b7] placeholder:text-[#9b8b7a]/60 focus:outline-none"
                          />
                        </div>
                      </div>

                      {/* Title Overlay Section - on/off switch, no separate collapse */}
                      <div className="rounded-lg border border-white/10">
                        <div className="flex items-center justify-between px-4 py-3">
                          <span className="text-sm font-semibold text-[#e8d5b7]">
                            {t.showTitle}
                          </span>
                          <button
                            type="button"
                            role="switch"
                            aria-checked={titleOverlayEnabled}
                            onClick={() => {
                              const next = !titleOverlayEnabled;
                              setTitleOverlayEnabled(next);
                              if (next) setPreviewFlipped(false);
                            }}
                            className={`relative inline-flex h-5 w-9 shrink-0 items-center rounded-full transition-colors ${
                              titleOverlayEnabled
                                ? "bg-[#c4b49a]"
                                : "bg-[#9b8b7a]/40"
                            }`}
                          >
                            <span
                              className={`inline-block h-3.5 w-3.5 rounded-full bg-white shadow transition-transform ${
                                titleOverlayEnabled
                                  ? "translate-x-[18px]"
                                  : "translate-x-[3px]"
                              }`}
                            />
                          </button>
                        </div>

                        {titleOverlayEnabled && (
                          <div className="border-t border-white/8 px-4 pt-3 pb-4">
                            <TitleOverlayEditor
                              position={titlePosition}
                              font={titleFont}
                              color={titleColor}
                              stroke={titleStroke}
                              strokeOpacity={titleStrokeOpacity}
                              onPositionChange={setTitlePosition}
                              onFontChange={setTitleFont}
                              onColorChange={setTitleColor}
                              onStrokeChange={setTitleStroke}
                              onStrokeOpacityChange={setTitleStrokeOpacity}
                              locale={locale}
                            />
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Cover Image panel (front/back 통합) */}
                    <div
                      data-tutorial="cover-editor"
                      className={
                        coverPanel === "coverImage" ? "space-y-3" : "hidden"
                      }
                    >
                      {/* 앞면/뒷면 전환 */}
                      <div className="flex gap-1.5 rounded-full border border-white/10 bg-white/5 p-1">
                        {["front", "back"].map((side) => (
                          <button
                            key={side}
                            onClick={() => {
                              setCoverImageSide(side);
                              setPreviewFlipped(side === "back");
                            }}
                            className={`flex-1 rounded-full px-3 py-1.5 text-xs font-medium transition-colors ${
                              coverImageSide === side
                                ? "bg-[#c4b49a]/15 text-[#e8d5b7]"
                                : "text-[#9b8b7a] hover:text-[#e8d5b7]"
                            }`}
                          >
                            {side === "front"
                              ? t.coverSideFront
                              : t.coverSideBack}
                          </button>
                        ))}
                      </div>

                      <div
                        className={
                          coverImageSide === "front" ? "space-y-3" : "hidden"
                        }
                      >
                        <div>
                          <span className="block text-sm font-semibold text-[#e8d5b7]">
                            {t.coverDesign}
                          </span>
                          <span className="mt-1 block text-[11px] text-[#9b8b7a]">
                            {t.coverDesignSub}
                          </span>
                        </div>
                        <CoverImageEditor
                          ref={coverRef}
                          record_id={record_id}
                          onImageGenerated={setFrontCover}
                          frontCover={frontCover}
                          initialFrontCover={initialState.current.frontCover}
                          photoMedia={photoDrive.photoMedia}
                          photoBlobUrls={photoDrive.photoBlobUrls}
                          onRefreshPhotos={photoDrive.refresh}
                          isRefreshing={photoDrive.isRefreshing}
                          isLoading={photoDrive.isLoading}
                          preloadBlobs={photoDrive.preloadBlobs}
                          locale={locale}
                          isAdmin={isAdmin}
                          onRequestAIConsent={(type) => {
                            if (hasAIConsent()) return Promise.resolve(true);
                            return new Promise((resolve) => {
                              consentResolveRef.current = resolve;
                              setShowAIConsent(type);
                            });
                          }}
                        />
                      </div>

                      <div
                        className={
                          coverImageSide === "back" ? "space-y-3" : "hidden"
                        }
                      >
                        <span className="block text-sm font-semibold text-[#e8d5b7]">
                          {t.backCoverImage}
                        </span>
                        <BackCoverUpload
                          ref={backCoverRef}
                          record_id={record_id}
                          backCoverImageUrl={backCoverImageUrl}
                          onUrlChange={setBackCoverImageUrl}
                          frontCover={frontCover}
                          photoMedia={photoDrive.photoMedia}
                          photoBlobUrls={photoDrive.photoBlobUrls}
                          onRefreshPhotos={photoDrive.refresh}
                          isRefreshing={photoDrive.isRefreshing}
                          isLoading={photoDrive.isLoading}
                          preloadBlobs={photoDrive.preloadBlobs}
                          locale={locale}
                        />
                      </div>
                    </div>

                    {/* Theme panel */}
                    <div
                      data-tutorial="theme"
                      className={
                        coverPanel === "theme" ? "space-y-5" : "hidden"
                      }
                    >
                      {/* <div className="flex items-start gap-3 rounded-xl border border-white/10 bg-[#2a2318] px-4 py-3.5">
                        <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#c4b49a]/10">
                          <BookOpen className="h-3.5 w-3.5 text-[#c4b49a]" />
                        </div>
                        <p className="pt-0.5 text-xs leading-relaxed text-[#9b8b7a]">
                          {t.backCoverGuide}
                        </p>
                      </div> */}

                      {coverPanel === "theme" && (
                        <ThemeSelector
                          selectedTheme={selectedTheme}
                          onThemeChange={setSelectedTheme}
                          locale={locale}
                        />
                      )}
                    </div>

                    {/* Sticker panel */}
                    <div
                      data-tutorial="sticker"
                      className={
                        coverPanel === "sticker" ? "space-y-5" : "hidden"
                      }
                    >
                      {coverPanel === "sticker" && (
                        <StickerPanel
                          locale={locale}
                          stickers={stickers}
                          onStickersChange={setStickers}
                          activeSide={previewFlipped ? "back" : "front"}
                          onActiveSideChange={(side) =>
                            setPreviewFlipped(side === "back")
                          }
                        />
                      )}
                    </div>

                    {/* Story panel */}
                    <div
                      data-tutorial="story"
                      className={
                        coverPanel === "story" ? "space-y-3" : "hidden"
                      }
                    >
                      <span className="text-sm font-semibold text-[#e8d5b7]">
                        {t.story}
                      </span>
                      {/* Keyword chips section */}
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs font-medium text-[#9b8b7a]">
                            {t.keywordSelect}
                          </span>
                          <span
                            onClick={() => setKeywordHelpOpen(!keywordHelpOpen)}
                            className={`flex h-5 w-5 cursor-pointer items-center justify-center rounded-full transition-colors hover:text-[#c4a882] ${keywordHelpOpen ? "text-[#c4b49a]" : "text-[#9b8b7a]"}`}
                          >
                            <HelpCircle className="h-3.5 w-3.5" />
                          </span>
                          {usedChips.size > 0 && (
                            <span className="text-[11px] text-[#9b8b7a]">
                              {t.keywordSelected(usedChips.size)}
                            </span>
                          )}
                        </div>
                        <AnimatePresence>
                          {keywordHelpOpen && (
                            <motion.div
                              initial={{ opacity: 0, height: 0 }}
                              animate={{ opacity: 1, height: "auto" }}
                              exit={{ opacity: 0, height: 0 }}
                              transition={{ duration: 0.15 }}
                              className="overflow-hidden"
                            >
                              <div className="mt-1.5 rounded-lg border border-white/10 bg-[#2a2318] px-3 py-2.5 shadow-sm">
                                <p className="text-[11px] leading-relaxed text-[#9b8b7a]">
                                  {t.keywordHelp}
                                </p>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>

                        <div className="mt-2 flex flex-wrap gap-1.5">
                          {(keywordsExpanded
                            ? KEYWORD_CHIPS
                            : KEYWORD_CHIPS.slice(0, 3)
                          ).map((chip) => {
                            const isUsed = usedChips.has(chip);
                            return (
                              <button
                                key={chip}
                                type="button"
                                onClick={() =>
                                  isUsed
                                    ? handleChipRemove(chip)
                                    : handleChipClick(chip)
                                }
                                className={`rounded-full px-3 py-1 text-[11px] font-medium transition-all ${
                                  isUsed
                                    ? "border border-[#c4b49a] bg-[#c4b49a]/10 text-[#c4b49a]"
                                    : "border border-white/15 bg-white/5 text-[#9b8b7a] hover:border-[#c4b49a] hover:text-[#c4b49a]"
                                }`}
                              >
                                {isUsed ? `${chip} ✕` : `+ ${chip}`}
                              </button>
                            );
                          })}
                          <button
                            type="button"
                            onClick={() =>
                              setKeywordsExpanded(!keywordsExpanded)
                            }
                            className="rounded-full border border-dashed border-white/15 px-3 py-1 text-[11px] font-medium text-[#9b8b7a] transition-colors hover:border-[#c4b49a] hover:text-[#c4b49a]"
                          >
                            {keywordsExpanded
                              ? t.keywordsLess
                              : t.keywordsMore(KEYWORD_CHIPS.length - 3)}
                          </button>
                        </div>
                      </div>

                      {/* Text input area with selected chips */}
                      <div className="min-h-50 w-full rounded-lg bg-[#2e2720] px-4 pt-3 pb-3">
                        {usedChips.size > 0 && (
                          <div className="mb-2 flex flex-wrap gap-1.5">
                            {[...usedChips].map((chip) => (
                              <span
                                key={chip}
                                className="inline-flex items-center gap-1 rounded-full border border-[#c4b49a] bg-[#c4b49a]/10 px-2.5 py-0.5 text-[11px] font-medium text-[#c4b49a]"
                              >
                                {chip}
                                <button
                                  type="button"
                                  onClick={() => handleChipRemove(chip)}
                                  className="ml-0.5 text-[#c4b49a]/60 transition-colors hover:text-[#c4b49a]"
                                >
                                  <X className="h-3 w-3" />
                                </button>
                              </span>
                            ))}
                          </div>
                        )}
                        <Textarea
                          value={bio}
                          onChange={(e) => setBio(e.target.value.slice(0, 250))}
                          placeholder={
                            usedChips.size > 0
                              ? t.placeholderWithChips
                              : t.placeholderNoChips
                          }
                          className="min-h-36 w-full resize-none border-none bg-transparent p-0 text-sm tracking-[0.7px] text-[#e8d5b7] placeholder:text-[#9b8b7a]/60 focus:ring-0 focus:outline-none"
                        />
                      </div>

                      {/* Character count */}
                      <div className="flex items-center justify-between">
                        <p
                          className={`text-[11px] ${getFullBioText().length >= 250 ? "text-red-400" : "text-[#9b8b7a]/60"}`}
                        >
                          {t.charCount(getFullBioText().length)}
                        </p>
                        {bioError && (
                          <p className="text-xs text-red-500">{bioError}</p>
                        )}
                      </div>

                      {/* Generation count */}
                      {!isAdmin && (
                        <div className="flex items-center justify-between rounded-lg border-[1.5px] border-[#c4b49a] px-3 py-2">
                          <span className="text-xs text-[#c4b49a]">
                            {t.genCount}
                          </span>
                          <span
                            className={`text-xs font-medium ${storyRemainingGens <= 0 ? "text-red-500" : "text-[#c4b49a]"}`}
                          >
                            {storyGenCount}/3
                          </span>
                        </div>
                      )}

                      {!isAdmin && storyRemainingGens <= 0 && (
                        <div className="rounded-lg bg-red-500/10 px-3 py-2">
                          <p className="text-xs text-red-500">
                            {t.genExhausted}
                          </p>
                        </div>
                      )}

                      {/* Generate button */}
                      <Button
                        onClick={handleGenerate}
                        disabled={
                          isGenerating ||
                          !getFullBioText() ||
                          storyRemainingGens <= 0
                        }
                        size="sm"
                        className="h-8 w-full bg-[#c4b49a] text-xs text-[#1a1510] hover:bg-[#e8d5b7]"
                      >
                        {isGenerating ? (
                          <>
                            <RefreshCw className="mr-1.5 h-3 w-3 animate-spin" />
                            {t.generating}
                          </>
                        ) : (
                          <>
                            <Sparkles className="mr-1.5 h-3 w-3" />
                            {t.generateStory}
                          </>
                        )}
                      </Button>
                    </div>

                    {/* Timeline panel */}
                    <div
                      data-tutorial="timeline"
                      className={
                        coverPanel === "timeline" ? "space-y-2" : "hidden"
                      }
                    >
                      <span className="text-sm font-semibold text-[#e8d5b7]">
                        {t.timeline}
                      </span>
                      <DndContext
                        sensors={sensors}
                        collisionDetection={closestCenter}
                        onDragEnd={handleDragEnd}
                      >
                        <SortableContext
                          items={timelineIdsRef.current}
                          strategy={verticalListSortingStrategy}
                        >
                          {timeline.map((item, index) => (
                            <SortableTimelineItem
                              key={timelineIdsRef.current[index]}
                              id={timelineIdsRef.current[index]}
                              item={item}
                              index={index}
                              onUpdate={updateTimelineItem}
                              onRemove={removeTimelineItem}
                              t={t}
                            />
                          ))}
                        </SortableContext>
                      </DndContext>

                      <button
                        onClick={addTimelineItem}
                        disabled={timeline.length >= 10}
                        className="flex h-8 w-full items-center justify-center gap-1.5 rounded-md border border-dashed border-[#c4b49a] text-xs text-[#c4b49a] transition-colors hover:border-solid hover:bg-[#c4b49a] hover:text-[#1a1510] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-[#c4b49a]"
                      >
                        <Plus className="h-3 w-3" />{" "}
                        {t.addItem(timeline.length)}
                      </button>

                      {timeline.length === 0 && (
                        <div className="py-4 text-center">
                          <p className="text-xs text-[#9b8b7a]">
                            {t.emptyTimeline}
                          </p>
                        </div>
                      )}

                      {timelineError && (
                        <p className="text-xs text-red-500">{timelineError}</p>
                      )}
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* Memory tab */}
              <TabsContent
                value="memory"
                className="scrollbar-accent min-h-0 flex-1 overflow-y-auto px-4 pt-5 data-[state=inactive]:hidden sm:px-5"
              >
                <div className="space-y-5 pb-10">
                  {/* Record Type Section */}
                  <div className="rounded-lg border border-white/10">
                    <button
                      onClick={() => setRecordTypeOpen(!recordTypeOpen)}
                      className="flex w-full items-center justify-between px-4 py-3"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-[#e8d5b7]">
                          {t.recordType}
                        </span>
                        <span className="text-[11px] text-[#9b8b7a]">
                          {recordType === "exhibit"
                            ? t.recordTypeExhibit
                            : recordType === "retro_tape"
                              ? t.recordTypeRetroTape
                              : t.recordTypeMemorial}
                        </span>
                      </div>
                      {recordTypeOpen ? (
                        <ChevronDown className="h-4 w-4 text-[#9b8b7a]" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-[#9b8b7a]" />
                      )}
                    </button>
                    <AnimatePresence initial={false}>
                      {recordTypeOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div className="border-t border-white/8 px-4 pt-3 pb-4">
                            <div className="flex flex-col gap-2">
                              {/* memorial은 영속 미디어 전용 타입 — in-place 전환
                                  불가. 비-memorial 레코드는 전환 버튼으로만 진입 */}
                              {(recordType === "memorial"
                                ? [
                                    {
                                      value: "memorial",
                                      label: t.recordTypeMemorial,
                                    },
                                  ]
                                : [
                                    {
                                      value: "exhibit",
                                      label: t.recordTypeExhibit,
                                    },
                                    {
                                      value: "retro_tape",
                                      label: t.recordTypeRetroTape,
                                    },
                                  ]
                              ).map((option) => (
                                <label
                                  key={option.value}
                                  onClick={() =>
                                    recordType !== "memorial" &&
                                    setRecordType(option.value)
                                  }
                                  className={`flex cursor-pointer items-center gap-3 rounded-lg border px-4 py-3 transition-colors ${
                                    recordType === option.value
                                      ? "border-[#c4a882] bg-[#c4a882]/10"
                                      : "border-white/10 hover:border-white/20"
                                  }`}
                                >
                                  <div
                                    className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 ${
                                      recordType === option.value
                                        ? "border-[#c4a882]"
                                        : "border-white/30"
                                    }`}
                                  >
                                    {recordType === option.value && (
                                      <div className="h-2 w-2 rounded-full bg-[#c4a882]" />
                                    )}
                                  </div>
                                  <span className="text-sm text-[#e8d5b7]">
                                    {option.label}
                                  </span>
                                </label>
                              ))}
                              {recordType !== "memorial" ? (
                                <button
                                  type="button"
                                  onClick={() => setShowConvertModal(true)}
                                  className="flex items-center gap-3 rounded-lg border border-dashed border-[#c4a882]/50 px-4 py-3 text-left transition-colors hover:bg-[#c4a882]/10"
                                >
                                  <Sparkles className="h-4 w-4 shrink-0 text-[#c4a882]" />
                                  <span>
                                    <span className="block text-sm text-[#e8d5b7]">
                                      추모 앨범으로 전환
                                    </span>
                                    <span className="mt-0.5 block text-[11px] leading-relaxed text-[#9b8b7a]">
                                      소중한 분을 기리는 공간을 새로 만들어요.
                                      간직하고 싶은 사진을 골라 오래도록 보존해
                                      드려요. 지금 앨범은 그대로 남아요.
                                    </span>
                                  </span>
                                </button>
                              ) : (
                                <p className="px-1 text-[11px] leading-relaxed text-[#9b8b7a]">
                                  이 앨범은 소중한 분을 기리기 위한 추모
                                  앨범으로 만들어졌어요. 시간이 지나도 고른
                                  사진들이 그대로 보존됩니다. 다른 테마의
                                  전시가 필요하시면 라이브러리에서 새 앨범을
                                  만들어주세요.
                                </p>
                              )}
                            </div>
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* BGM Section */}
                  <div className="rounded-lg border border-white/10">
                    <button
                      onClick={() => setBgmOpen(!bgmOpen)}
                      className="flex w-full items-center justify-between px-4 py-3"
                    >
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-[#e8d5b7]">
                          {t.bgm}
                        </span>
                        {bgmUrl && (
                          <span className="text-[11px] text-[#c4b49a]">
                            {t.bgmSelected}
                          </span>
                        )}
                      </div>
                      {bgmOpen ? (
                        <ChevronDown className="h-4 w-4 text-[#9b8b7a]" />
                      ) : (
                        <ChevronRight className="h-4 w-4 text-[#9b8b7a]" />
                      )}
                    </button>
                    <AnimatePresence initial={false}>
                      {bgmOpen && (
                        <motion.div
                          initial={{ height: 0, opacity: 0 }}
                          animate={{ height: "auto", opacity: 1 }}
                          exit={{ height: 0, opacity: 0 }}
                          transition={{ duration: 0.2 }}
                          className="overflow-hidden"
                        >
                          <div className="border-t border-white/8 px-4 pt-3 pb-4">
                            <BgmEditor
                              selectedBgmUrl={bgmUrl}
                              onBgmChange={handleBgmChange}
                              locale={locale}
                            />
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>

                  {/* VHS Settings — only shown for retro_tape */}
                  {recordType === "retro_tape" && (
                    <>
                      {/* Filter Section */}
                      <div className="rounded-lg border border-white/10">
                        <button
                          onClick={() => setVhsFilterOpen(!vhsFilterOpen)}
                          className="flex w-full items-center justify-between px-4 py-3"
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-[#e8d5b7]">
                              필터
                            </span>
                            <span className="text-[11px] text-[#9b8b7a]">
                              {vhsFilter === "none" ? "없음" : "세피아"}
                            </span>
                          </div>
                          {vhsFilterOpen ? (
                            <ChevronDown className="h-4 w-4 text-[#9b8b7a]" />
                          ) : (
                            <ChevronRight className="h-4 w-4 text-[#9b8b7a]" />
                          )}
                        </button>
                        <AnimatePresence initial={false}>
                          {vhsFilterOpen && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2 }}
                              className="overflow-hidden"
                            >
                              <div className="border-t border-white/8 px-4 pt-3 pb-4">
                                <div className="flex flex-col gap-2">
                                  {[
                                    { value: "none", label: "없음" },
                                    { value: "sepia", label: "세피아" },
                                  ].map((option) => (
                                    <label
                                      key={option.value}
                                      onClick={() => setVhsFilter(option.value)}
                                      className={`flex cursor-pointer items-center gap-3 rounded-lg border px-4 py-3 transition-colors ${
                                        vhsFilter === option.value
                                          ? "border-[#c4a882] bg-[#c4a882]/10"
                                          : "border-white/10 hover:border-white/20"
                                      }`}
                                    >
                                      <div
                                        className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 ${
                                          vhsFilter === option.value
                                            ? "border-[#c4a882]"
                                            : "border-white/30"
                                        }`}
                                      >
                                        {vhsFilter === option.value && (
                                          <div className="h-2 w-2 rounded-full bg-[#c4a882]" />
                                        )}
                                      </div>
                                      <span className="text-sm text-[#e8d5b7]">
                                        {option.label}
                                      </span>
                                    </label>
                                  ))}
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>

                      {/* Transition Section */}
                      <div className="rounded-lg border border-white/10">
                        <button
                          onClick={() =>
                            setVhsTransitionOpen(!vhsTransitionOpen)
                          }
                          className="flex w-full items-center justify-between px-4 py-3"
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-[#e8d5b7]">
                              전환 효과
                            </span>
                            <span className="text-[11px] text-[#9b8b7a]">
                              {vhsTransition === "fade" ? "페이드" : "켄번"}
                            </span>
                          </div>
                          {vhsTransitionOpen ? (
                            <ChevronDown className="h-4 w-4 text-[#9b8b7a]" />
                          ) : (
                            <ChevronRight className="h-4 w-4 text-[#9b8b7a]" />
                          )}
                        </button>
                        <AnimatePresence initial={false}>
                          {vhsTransitionOpen && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2 }}
                              className="overflow-hidden"
                            >
                              <div className="border-t border-white/8 px-4 pt-3 pb-4">
                                <div className="flex flex-col gap-2">
                                  {[
                                    { value: "fade", label: "페이드" },
                                    { value: "kenburns", label: "켄번" },
                                  ].map((option) => (
                                    <label
                                      key={option.value}
                                      onClick={() =>
                                        setVhsTransition(option.value)
                                      }
                                      className={`flex cursor-pointer items-center gap-3 rounded-lg border px-4 py-3 transition-colors ${
                                        vhsTransition === option.value
                                          ? "border-[#c4a882] bg-[#c4a882]/10"
                                          : "border-white/10 hover:border-white/20"
                                      }`}
                                    >
                                      <div
                                        className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 ${
                                          vhsTransition === option.value
                                            ? "border-[#c4a882]"
                                            : "border-white/30"
                                        }`}
                                      >
                                        {vhsTransition === option.value && (
                                          <div className="h-2 w-2 rounded-full bg-[#c4a882]" />
                                        )}
                                      </div>
                                      <span className="text-sm text-[#e8d5b7]">
                                        {option.label}
                                      </span>
                                    </label>
                                  ))}
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>

                      {/* Photo Frame Section */}
                      <div className="rounded-lg border border-white/10">
                        <div className="px-4 py-3">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-[#e8d5b7]">
                              액자 사진
                            </span>
                            <span className="text-[11px] text-[#9b8b7a]">
                              프리뷰에서 액자를 클릭하여 변경
                            </span>
                          </div>
                        </div>
                      </div>
                    </>
                  )}

                  {/* Memorial Settings — only shown for memorial */}
                  {recordType === "memorial" && (
                    <>
                      {/* Poster Style Section */}
                      <div className="rounded-lg border border-white/10">
                        <button
                          onClick={() =>
                            setMemorialSettingsOpen(!memorialSettingsOpen)
                          }
                          className="flex w-full items-center justify-between px-4 py-3"
                        >
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-[#e8d5b7]">
                              {t.memorialPosterStyle}
                            </span>
                            <span className="text-[11px] text-[#9b8b7a]">
                              {memorialPosterStyle === "classic"
                                ? t.memorialPosterStyleClassic
                                : memorialPosterStyle === "glow"
                                  ? t.memorialPosterStyleGlow
                                  : t.memorialPosterStyleFrameless}
                            </span>
                          </div>
                          {memorialSettingsOpen ? (
                            <ChevronDown className="h-4 w-4 text-[#9b8b7a]" />
                          ) : (
                            <ChevronRight className="h-4 w-4 text-[#9b8b7a]" />
                          )}
                        </button>
                        <AnimatePresence initial={false}>
                          {memorialSettingsOpen && (
                            <motion.div
                              initial={{ height: 0, opacity: 0 }}
                              animate={{ height: "auto", opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }}
                              transition={{ duration: 0.2 }}
                              className="overflow-hidden"
                            >
                              <div className="flex flex-col gap-4 border-t border-white/8 px-4 pt-3 pb-4">
                                <div className="flex flex-col gap-2">
                                  {[
                                    {
                                      value: "classic",
                                      label: t.memorialPosterStyleClassic,
                                    },
                                    {
                                      value: "glow",
                                      label: t.memorialPosterStyleGlow,
                                    },
                                    {
                                      value: "frameless",
                                      label: t.memorialPosterStyleFrameless,
                                    },
                                  ].map((option) => (
                                    <label
                                      key={option.value}
                                      onClick={() =>
                                        setMemorialPosterStyle(option.value)
                                      }
                                      className={`flex cursor-pointer items-center gap-3 rounded-lg border px-4 py-3 transition-colors ${
                                        memorialPosterStyle === option.value
                                          ? "border-[#c4a882] bg-[#c4a882]/10"
                                          : "border-white/10 hover:border-white/20"
                                      }`}
                                    >
                                      <div
                                        className={`flex h-4 w-4 shrink-0 items-center justify-center rounded-full border-2 ${
                                          memorialPosterStyle === option.value
                                            ? "border-[#c4a882]"
                                            : "border-white/30"
                                        }`}
                                      >
                                        {memorialPosterStyle ===
                                          option.value && (
                                          <div className="h-2 w-2 rounded-full bg-[#c4a882]" />
                                        )}
                                      </div>
                                      <span className="text-sm text-[#e8d5b7]">
                                        {option.label}
                                      </span>
                                    </label>
                                  ))}
                                </div>

                                <div>
                                  <span className="mb-2 block text-sm font-semibold text-[#e8d5b7]">
                                    {t.memorialPosterTone}
                                  </span>
                                  <div className="flex gap-2">
                                    {[
                                      {
                                        value: "dark",
                                        label: t.memorialPosterToneDark,
                                      },
                                      {
                                        value: "white",
                                        label: t.memorialPosterToneWhite,
                                      },
                                    ].map((option) => (
                                      <button
                                        key={option.value}
                                        onClick={() =>
                                          setMemorialPosterTone(option.value)
                                        }
                                        className={`flex-1 rounded-lg border px-4 py-2 text-sm transition-colors ${
                                          memorialPosterTone === option.value
                                            ? "border-[#c4a882] bg-[#c4a882]/10 text-[#e8d5b7]"
                                            : "border-white/10 text-[#9b8b7a] hover:border-white/20"
                                        }`}
                                      >
                                        {option.label}
                                      </button>
                                    ))}
                                  </div>
                                </div>

                                <div>
                                  <span className="mb-2 block text-sm font-semibold text-[#e8d5b7]">
                                    {t.memorialAspectRatio}
                                  </span>
                                  <div className="flex gap-2">
                                    {[
                                      {
                                        value: "9:16",
                                        label: t.memorialAspectRatioPortrait,
                                      },
                                      {
                                        value: "16:9",
                                        label: t.memorialAspectRatioLandscape,
                                      },
                                    ].map((option) => (
                                      <button
                                        key={option.value}
                                        onClick={() =>
                                          setMemorialAspectRatio(option.value)
                                        }
                                        className={`flex-1 rounded-lg border px-4 py-2 text-sm transition-colors ${
                                          memorialAspectRatio === option.value
                                            ? "border-[#c4a882] bg-[#c4a882]/10 text-[#e8d5b7]"
                                            : "border-white/10 text-[#9b8b7a] hover:border-white/20"
                                        }`}
                                      >
                                        {option.label}
                                      </button>
                                    ))}
                                  </div>
                                </div>
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    </>
                  )}
                </div>
              </TabsContent>
            </Tabs>
          </motion.div>
        </div>
      </div>

      {/* Exit Dialog */}
      <AnimatePresence>
        {showExitDialog && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
            onClick={() => setShowExitDialog(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="relative mx-4 w-full max-w-sm rounded-xl bg-[#2a2318] p-6 shadow-xl"
            >
              <button
                onClick={() => setShowExitDialog(false)}
                className="absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-md text-[#9b8b7a] hover:text-[#e8d5b7]"
              >
                <X className="h-5 w-5" />
              </button>
              <p className="text-center text-lg font-semibold text-[#e8d5b7]">
                {isDirty ? t.exitConfirmDirty : t.exitConfirm}
              </p>
              <div className="mt-6 flex gap-3">
                {isDirty ? (
                  <>
                    <Button
                      variant="outline"
                      onClick={handleExit}
                      className="flex-1 border-white/15 text-[#9b8b7a] hover:border-white/30 hover:text-[#e8d5b7]"
                    >
                      {t.exit}
                    </Button>
                    <Button
                      onClick={handleSaveAndExit}
                      disabled={isSaving}
                      className="flex-1"
                    >
                      {isSaving ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Save className="mr-2 h-4 w-4" />
                      )}
                      {isSaving ? t.saving : t.saveAndExit}
                    </Button>
                  </>
                ) : (
                  <Button onClick={handleExit} className="w-full">
                    {t.exit}
                  </Button>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Record Edit Dialog */}
      <AnimatePresence>
        {showRecordEditDialog && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/50"
            onClick={() => setShowRecordEditDialog(false)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={(e) => e.stopPropagation()}
              className="mx-4 w-full max-w-md rounded-xl bg-[#2a2318] p-6 shadow-xl"
            >
              <div className="mb-5 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-[#e8d5b7]">
                  {t.editInfoTitle}
                </h2>
                <button
                  onClick={() => setShowRecordEditDialog(false)}
                  className="text-[#9b8b7a] hover:text-[#e8d5b7]"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="mb-2 block text-xs font-medium text-[#9b8b7a]">
                    {t.externalLink}
                  </label>
                  <div className="relative mb-2">
                    <input
                      type="text"
                      value={editExternalLinkTitle}
                      onChange={(e) =>
                        setEditExternalLinkTitle(e.target.value.slice(0, 10))
                      }
                      maxLength={10}
                      placeholder={t.externalLinkPlaceholder}
                      className="w-full rounded-md border border-white/15 bg-[#2e2720] px-3 py-2 pr-12 text-sm text-[#e8d5b7] outline-none placeholder:text-[#9b8b7a]/60 focus:border-white/30"
                    />
                    <span className="pointer-events-none absolute top-1/2 right-3 -translate-y-1/2 text-[11px] text-[#9b8b7a]/60">
                      {editExternalLinkTitle.length}/10
                    </span>
                  </div>
                  <input
                    type="url"
                    value={editExternalLinkUrl}
                    onChange={(e) => setEditExternalLinkUrl(e.target.value)}
                    placeholder="https://..."
                    className="w-full rounded-md border border-white/15 bg-[#2e2720] px-3 py-2 text-sm text-[#e8d5b7] outline-none placeholder:text-[#9b8b7a]/60 focus:border-white/30"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-xs font-medium text-[#9b8b7a]">
                    {t.photoStorage}
                  </label>
                  <div className="mb-3 flex gap-2">
                    {[
                      { key: "google", label: "Google Photo" },
                      { key: "drive", label: "Google Drive" },
                      { key: "icloud", label: "iCloud" },
                      { key: "mybox", label: "Mybox" },
                    ].map((opt) => (
                      <button
                        key={opt.key}
                        type="button"
                        onClick={() => {
                          setSelectedUrlType(opt.key);
                          setEditUrlValue(
                            opt.key === "google"
                              ? editGooglePhotoUrl
                              : opt.key === "drive"
                                ? editGoogleDriveUrl
                                : opt.key === "icloud"
                                  ? editIcloudUrl
                                  : editMyboxUrl,
                          );
                        }}
                        className={`flex-1 rounded-lg border px-3 py-2 text-xs font-medium transition-all ${
                          selectedUrlType === opt.key
                            ? "border-[#c4b49a] bg-[#c4b49a]/10 text-[#c4b49a]"
                            : "border-white/15 text-[#9b8b7a] hover:border-white/25"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                  <input
                    type="text"
                    value={editUrlValue}
                    onChange={(e) => setEditUrlValue(e.target.value)}
                    disabled={selectedUrlType === "mybox"}
                    placeholder={
                      selectedUrlType === "google"
                        ? "https://photos.google.com/..."
                        : selectedUrlType === "drive"
                          ? "https://drive.google.com/drive/folders/..."
                          : selectedUrlType === "icloud"
                            ? "https://share.icloud.com/photos/..."
                            : t.serviceComingSoon
                    }
                    className={`w-full rounded-md border border-white/15 px-3 py-2 text-sm outline-none placeholder:text-[#9b8b7a]/60 focus:border-white/30 ${
                      selectedUrlType === "mybox"
                        ? "cursor-not-allowed bg-white/5 text-[#9b8b7a]"
                        : "bg-[#2e2720] text-[#e8d5b7]"
                    }`}
                  />
                </div>
              </div>

              {recordError && (
                <p className="mt-3 text-sm text-red-500">{recordError}</p>
              )}

              <div className="mt-6 flex gap-3">
                <Button
                  variant="outline"
                  onClick={() => setShowRecordEditDialog(false)}
                  className="flex-1 border-white/15 text-[#9b8b7a] hover:border-white/30 hover:text-[#e8d5b7]"
                >
                  {t.cancel}
                </Button>
                <Button
                  onClick={handleRecordEditSave}
                  disabled={isRecordSaving}
                  className="flex-1"
                >
                  {isRecordSaving ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" />{" "}
                      {t.saving}
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" /> {t.saveAction}
                    </>
                  )}
                </Button>
              </div>

              {/* Delete record */}
              <div className="mt-6 border-t border-white/8 pt-4">
                {!showDeleteConfirm ? (
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="w-full rounded-lg py-2.5 text-center text-sm font-medium text-red-500 transition-colors hover:bg-red-500/10"
                  >
                    <Trash2 className="mr-1.5 inline h-3.5 w-3.5" />
                    {t.delete}
                  </button>
                ) : (
                  <div className="space-y-2">
                    <p className="text-center text-xs text-red-500">
                      {t.deleteConfirm}
                    </p>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        onClick={() => setShowDeleteConfirm(false)}
                        className="flex-1 border-white/15 text-xs text-[#9b8b7a]"
                        size="sm"
                      >
                        {t.cancel}
                      </Button>
                      <Button
                        onClick={handleDeleteRecord}
                        disabled={isDeleting}
                        className="flex-1 bg-red-500 text-xs hover:bg-red-600"
                        size="sm"
                      >
                        {isDeleting ? (
                          <RefreshCw className="mr-1 h-3 w-3 animate-spin" />
                        ) : (
                          <Trash2 className="mr-1 h-3 w-3" />
                        )}
                        {isDeleting ? t.deleting : t.deleteAction}
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Tutorial Overlay */}
      <TutorialOverlay
        isActive={showTutorial}
        onClose={() => setShowTutorial(false)}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        coverPanel={coverPanel}
        setCoverPanel={setCoverPanel}
        locale={locale}
      />

      {showAIConsent && (
        <AIConsentModal
          type={showAIConsent}
          locale={locale}
          onAgree={() => {
            setShowAIConsent(null);
            if (consentResolveRef.current) {
              consentResolveRef.current(true);
              consentResolveRef.current = null;
            }
            pendingAIAction.current?.();
            pendingAIAction.current = null;
          }}
          onCancel={() => {
            setShowAIConsent(null);
            if (consentResolveRef.current) {
              consentResolveRef.current(false);
              consentResolveRef.current = null;
            }
            pendingAIAction.current = null;
          }}
        />
      )}

      {/* 추모 앨범 전환 모달 — 스크랩 미디어에서 최대 36장 선택 → 새 앨범 생성 */}
      <MemorialConvertModal
        open={showConvertModal}
        onClose={() => setShowConvertModal(false)}
        recordId={record_id}
        albumTitle={albumTitle}
        albumSubtitle={albumSubtitle}
        photoMedia={photoDrive.photoMedia}
        isLoading={photoDrive.isLoading}
        onRefresh={photoDrive.refresh}
        locale={locale}
      />
    </div>
  );
};

export default Index;
