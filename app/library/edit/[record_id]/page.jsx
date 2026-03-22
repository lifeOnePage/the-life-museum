"use client";

import { use, useState, useEffect, useRef } from "react";
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
import AlbumPreview3D from "./components/AlbumPreview3D";
import TutorialOverlay from "./components/TutorialOverlay";
import ThemeSelector from "./components/ThemeSelector";
import { UNIFIED_THEMES, DEFAULT_THEME } from "./themeConfig";

// Sortable timeline item component
function SortableTimelineItem({ id, item, index, onUpdate, onRemove }) {
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
        className="cursor-grab pt-2 text-gray-300 active:cursor-grabbing"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-3.5 w-3.5" />
      </div>
      <Input
        value={item.year}
        onChange={(e) => onUpdate(index, "year", e.target.value)}
        placeholder="연도"
        className="h-9 w-[70px] rounded-[5px] border-gray-200 bg-[#CFCFD1] text-xs text-gray-700 placeholder:text-gray-400"
      />
      <Input
        value={item.event}
        onChange={(e) => onUpdate(index, "event", e.target.value)}
        placeholder="사건을 입력하세요..."
        className="h-9 flex-1 rounded-[5px] border-gray-200 bg-[#CFCFD1] text-xs text-gray-700 placeholder:text-gray-400"
      />
      <button
        onClick={() => onRemove(index)}
        className="flex h-9 w-8 shrink-0 items-center justify-center rounded text-gray-400 opacity-50 transition-opacity group-hover:opacity-100 hover:text-red-500"
      >
        <Trash2 className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

const Index = ({ params }) => {
  const { record_id } = use(params);
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [frontCover, setFrontCover] = useState(null);
  const [albumTitle, setAlbumTitle] = useState("");
  const [artistName, setArtistName] = useState("");
  const [bio, setBio] = useState(
    "어린 시절, 골목길을 누비며 뛰어놀던 기억이 아직도 생생합니다. 여름이면 할머니 댁 마당에서 수박을 먹고, 겨울이면 온 동네가 하얗게 물든 눈밭 위를 걸었죠. 그 시절의 따뜻한 햇살과 웃음소리가 지금의 저를 만들어 주었습니다.",
  );
  const [timeline, setTimeline] = useState([
    { year: "1995", event: "서울에서 태어남" },
    { year: "2001", event: "초등학교 입학 - 첫 번째 친구를 만남" },
    { year: "2014", event: "대학교 입학 - 사진 동아리 가입" },
    { year: "2020", event: "첫 직장 - 새로운 시작" },
  ]);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSavedAt, setLastSavedAt] = useState(null);
  const [showExitDialog, setShowExitDialog] = useState(false);

  // Tab & Theme & Layout state
  const [activeTab, setActiveTab] = useState("front");
  const [selectedTheme, setSelectedTheme] = useState(DEFAULT_THEME);

  // Collapsible sections
  const [storyOpen, setStoryOpen] = useState(true);
  const [timelineOpen, setTimelineOpen] = useState(true);

  // Tutorial
  const [showTutorial, setShowTutorial] = useState(false);
  const [showHeaderMenu, setShowHeaderMenu] = useState(false);

  // AI story generation state
  const [isGenerating, setIsGenerating] = useState(false);
  const [bioError, setBioError] = useState("");
  const [usedChips, setUsedChips] = useState(new Set());

  const [timelineError, setTimelineError] = useState("");

  // Record edit dialog
  const [showRecordEditDialog, setShowRecordEditDialog] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editSubtitle, setEditSubtitle] = useState("");
  const [editGooglePhotoUrl, setEditGooglePhotoUrl] = useState("");
  const [editIcloudUrl, setEditIcloudUrl] = useState("");
  const [editMyboxUrl, setEditMyboxUrl] = useState("");
  const [selectedUrlType, setSelectedUrlType] = useState("google");
  const [editUrlValue, setEditUrlValue] = useState("");
  const [isRecordSaving, setIsRecordSaving] = useState(false);
  const [recordError, setRecordError] = useState("");

  // URLs from API
  const [googlePhotoUrl, setGooglePhotoUrl] = useState("");
  const [icloudUrl, setIcloudUrl] = useState("");
  const [myboxUrl, setMyboxUrl] = useState("");

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
  const initialState = useRef({
    frontCover: null,
    albumTitle: "",
    artistName: "",
    bio: "",
    timeline: [],
    selectedTheme: DEFAULT_THEME,
  });

  useEffect(() => {
    const fetchRecord = async () => {
      try {
        const response = await fetch(
          `https://the-life-museum-backend-production.up.railway.app/api/v1/record/${record_id}`,
          {
            headers: {
              Authorization: `Bearer ${localStorage.getItem("app_token")}`,
            },
          },
        );

        const result = await response.json();

        if (result.ok && result.data) {
          const data = result.data;

          const coverUrl = data.coverImage?.url || null;
          const title = data.title || "";
          const subtitle = data.subtitle || "";
          const bioContent = data.lifestory?.content || "";

          let timelineData = [];
          if (data.timeline?.events) {
            timelineData = data.timeline.events.map((event) => ({
              year: event.timestamp ? event.timestamp : "",
              event: `${event.title}${event.description ? ` - ${event.description}` : ""}`,
            }));
          }

          const savedTheme = data.theme || DEFAULT_THEME;

          setFrontCover(coverUrl);
          setAlbumTitle(title);
          setArtistName(subtitle);
          setBio(bioContent);
          // Initialize timeline IDs for drag reorder
          timelineIdsRef.current = timelineData.map(
            () => `tl-${nextIdRef.current++}`,
          );
          setTimeline(timelineData);
          setSelectedTheme(savedTheme);
          setGooglePhotoUrl(data.googlePhotoUrl || "");
          setIcloudUrl(data.icloudUrl || "");
          setMyboxUrl(data.myboxUrl || "");

          initialState.current = {
            frontCover: coverUrl,
            albumTitle: title,
            artistName: subtitle,
            bio: bioContent,
            timeline: timelineData,
            selectedTheme: savedTheme,
          };
        }
      } catch (error) {
        console.error("레코드 불러오기 실패:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (record_id) {
      fetchRecord();
    }
  }, [record_id]);

  // Apply theme change
  const handleThemeChange = (themeKey) => {
    setSelectedTheme(themeKey);
  };

  const saveRecordColors = async () => {
    const theme =
      UNIFIED_THEMES[selectedTheme] || UNIFIED_THEMES[DEFAULT_THEME];
    const response = await fetch(
      `https://the-life-museum-backend-production.up.railway.app/api/v1/record/${record_id}`,
      {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("app_token")}`,
        },
        body: JSON.stringify({
          color: theme.text,
          bgColor: theme.bg,
          keyColor: theme.accent,
          theme: selectedTheme,
        }),
      },
    );

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || "컬러 저장에 실패했습니다");
    }
    return data;
  };

  // Bio save logic (from BioEditor)
  const saveBio = async () => {
    if (!bio.trim()) return;
    const response = await fetch(
      `https://the-life-museum-backend-production.up.railway.app/api/v1/record/${record_id}/lifestory`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("app_token")}`,
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
      throw new Error(data.error || "저장에 실패했습니다");
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
    const response = await fetch(
      `https://the-life-museum-backend-production.up.railway.app/api/v1/record/${record_id}/timeline`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("app_token")}`,
        },
        body: JSON.stringify({ events }),
      },
    );
    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || "저장에 실패했습니다");
    }
    return data;
  };

  const handleSaveAll = async () => {
    const isCoverDirty =
      frontCover !== initialState.current.frontCover ||
      albumTitle !== initialState.current.albumTitle ||
      artistName !== initialState.current.artistName;
    const isBioDirty = bio !== initialState.current.bio;
    const isTimelineDirty =
      JSON.stringify(timeline) !==
      JSON.stringify(initialState.current.timeline);
    const isThemeDirty = selectedTheme !== initialState.current.selectedTheme;

    if (!isCoverDirty && !isBioDirty && !isTimelineDirty && !isThemeDirty)
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
          initialState.current.albumTitle = albumTitle;
          initialState.current.artistName = artistName;
        } else if (r.value.editor === "bio") {
          initialState.current.bio = bio;
        } else if (r.value.editor === "timeline") {
          initialState.current.timeline = [...timeline];
        } else if (r.value.editor === "theme") {
          initialState.current.selectedTheme = selectedTheme;
        }
      }
    }

    const anySuccess = results.some(
      (r) => r.status === "fulfilled" && r.value.success,
    );
    if (anySuccess) setLastSavedAt(new Date());

    setIsSaving(false);
  };

  const isDirty =
    frontCover !== initialState.current.frontCover ||
    albumTitle !== initialState.current.albumTitle ||
    artistName !== initialState.current.artistName ||
    bio !== initialState.current.bio ||
    JSON.stringify(timeline) !==
      JSON.stringify(initialState.current.timeline) ||
    selectedTheme !== initialState.current.selectedTheme;

  const handleExit = () => {
    router.push("/library");
  };

  const handleSaveAndExit = async () => {
    await handleSaveAll();
    router.push("/library");
  };

  // AI story generation
  const handleGenerate = async () => {
    const fullText = getFullBioText();
    if (!fullText) return;
    setIsGenerating(true);
    setBioError("");

    try {
      const token = localStorage.getItem("app_token");
      console.log(token);
      const response = await fetch(
        `https://the-life-museum-backend-production.up.railway.app/api/v1/record/${record_id}/lifestory/create`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ prompt: fullText, albumTitle }),
        },
      );

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "생성에 실패했습니다");
      }
      setBio(data.data?.result || "");
    } catch (err) {
      setBioError(err.message);
    } finally {
      setIsGenerating(false);
    }
  };

  const KEYWORD_CHIPS = [
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
    setEditTitle(albumTitle);
    setEditSubtitle(artistName);
    setEditGooglePhotoUrl(googlePhotoUrl);
    setEditIcloudUrl(icloudUrl);
    setEditMyboxUrl(myboxUrl);
    // Determine which URL type is selected based on existing data
    if (myboxUrl) {
      setSelectedUrlType("mybox");
      setEditUrlValue(myboxUrl);
    } else if (icloudUrl) {
      setSelectedUrlType("icloud");
      setEditUrlValue(icloudUrl);
    } else {
      setSelectedUrlType("google");
      setEditUrlValue(googlePhotoUrl);
    }
    setRecordError("");
    setShowDeleteConfirm(false);
    setShowRecordEditDialog(true);
  };

  const handleRecordEditSave = async () => {
    setIsRecordSaving(true);
    setRecordError("");

    const finalGoogleUrl = selectedUrlType === "google" ? editUrlValue : "";
    const finalIcloudUrl = selectedUrlType === "icloud" ? editUrlValue : "";
    const finalMyboxUrl = selectedUrlType === "mybox" ? editUrlValue : "";

    try {
      const response = await fetch(
        `https://the-life-museum-backend-production.up.railway.app/api/v1/record/${record_id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${localStorage.getItem("app_token")}`,
          },
          body: JSON.stringify({
            title: editTitle,
            subTitle: editSubtitle,
            googlePhotoUrl: finalGoogleUrl,
            icloudUrl: finalIcloudUrl,
            myboxUrl: finalMyboxUrl,
          }),
        },
      );

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "저장에 실패했습니다");
      }

      setAlbumTitle(editTitle);
      setArtistName(editSubtitle);
      setGooglePhotoUrl(finalGoogleUrl);
      setIcloudUrl(finalIcloudUrl);
      setMyboxUrl(finalMyboxUrl);
      initialState.current.albumTitle = editTitle;
      initialState.current.artistName = editSubtitle;
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
    setArtistName(s.artistName);
    setBio(s.bio);
    timelineIdsRef.current = s.timeline.map(() => `tl-${nextIdRef.current++}`);
    setTimeline([...s.timeline]);
    setSelectedTheme(s.selectedTheme);
    setUsedChips(new Set());
  };

  const [isDeleting, setIsDeleting] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const handleDeleteRecord = async () => {
    setIsDeleting(true);
    setRecordError("");
    try {
      const response = await fetch(
        `https://the-life-museum-backend-production.up.railway.app/api/v1/record/${record_id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${localStorage.getItem("app_token")}`,
          },
        },
      );
      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "삭제에 실패했습니다");
      }
      router.push("/library");
    } catch (err) {
      setRecordError(err.message);
    } finally {
      setIsDeleting(false);
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-gray-500">불러오는 중...</p>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-[#f8f7f6]">
      {/* Header - Mobile */}
      <header className="border-b border-[rgba(30,30,30,0.1)] bg-[#f0eee9]">
        <div className="relative flex items-center justify-between px-3 py-2 lg:hidden">
          <button
            data-tutorial="exit"
            onClick={() => setShowExitDialog(true)}
            className="flex h-9 w-9 items-center justify-center rounded-md text-gray-500"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div className="absolute left-1/2 -translate-x-1/2 text-center">
            <h1 className="text-sm font-semibold text-gray-900">
              {albumTitle || "앨범 편집"}
            </h1>
            {artistName && (
              <p className="text-[11px] leading-tight text-gray-400">
                {artistName}
              </p>
            )}
          </div>
          <div className="relative">
            <button
              onClick={() => setShowHeaderMenu(!showHeaderMenu)}
              className="flex h-9 w-9 items-center justify-center rounded-md text-gray-500"
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
                    className="absolute top-full right-0 z-40 mt-1 w-48 overflow-hidden rounded-xl bg-white py-1 shadow-lg ring-1 ring-black/5"
                  >
                    <button
                      onClick={() => {
                        openRecordEditDialog();
                        setShowHeaderMenu(false);
                      }}
                      className="flex w-full items-center gap-3 px-4 py-2.5 text-[13px] text-gray-700 active:bg-gray-50"
                    >
                      <Pencil className="h-4 w-4 text-gray-400" />
                      앨범 정보 수정
                    </button>
                    <button
                      onClick={() => {
                        handleSaveAll();
                        setShowHeaderMenu(false);
                      }}
                      disabled={isSaving || !isDirty}
                      className="flex w-full items-center gap-3 px-4 py-2.5 text-[13px] text-[#67add1] active:bg-gray-50 disabled:opacity-40"
                    >
                      {isSaving ? (
                        <RefreshCw className="h-4 w-4 animate-spin" />
                      ) : (
                        <Save className="h-4 w-4" />
                      )}
                      저장하기
                    </button>
                    <button
                      onClick={() => {
                        handleReset();
                        setShowHeaderMenu(false);
                      }}
                      disabled={!isDirty}
                      className="flex w-full items-center gap-3 px-4 py-2.5 text-[13px] text-gray-700 active:bg-gray-50 disabled:opacity-40"
                    >
                      <Undo2 className="h-4 w-4 text-gray-400" />
                      변경사항 초기화
                    </button>
                    <button
                      onClick={() => {
                        setShowTutorial(true);
                        setShowHeaderMenu(false);
                      }}
                      className="flex w-full items-center gap-3 px-4 py-2.5 text-[13px] text-gray-700 active:bg-gray-50"
                    >
                      <HelpCircle className="h-4 w-4 text-gray-400" />
                      튜토리얼
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
                className="flex h-8 w-8 items-center justify-center rounded-md text-gray-500 transition-colors hover:bg-gray-100 hover:text-gray-900"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <span className="pointer-events-none absolute top-full left-1/2 z-50 mt-1.5 -translate-x-1/2 rounded bg-gray-800 px-2 py-1 text-[10px] whitespace-nowrap text-white opacity-0 transition-opacity group-hover:opacity-100">
                나가기
              </span>
            </div>
            <div>
              <h1 className="text-sm leading-tight font-semibold text-gray-900">
                {albumTitle || "앨범 편집"}
              </h1>
              {artistName && (
                <p className="text-[11px] leading-tight text-gray-400">
                  {artistName}
                </p>
              )}
            </div>
            <div className="ml-1 flex items-center gap-1.5">
              <div className="group relative">
                <button
                  onClick={openRecordEditDialog}
                  className="flex h-8 w-8 items-center justify-center rounded-md text-gray-400 transition-colors hover:bg-gray-100 hover:text-[#67add1]"
                >
                  <Pencil className="h-3.5 w-3.5" />
                </button>
                <span className="pointer-events-none absolute top-full left-1/2 z-50 mt-1.5 -translate-x-1/2 rounded bg-gray-800 px-2 py-1 text-[10px] whitespace-nowrap text-white opacity-0 transition-opacity group-hover:opacity-100">
                  앨범 정보 수정
                </span>
              </div>
              <div className="group relative">
                <button
                  disabled={!isDirty}
                  onClick={handleReset}
                  className={`flex h-8 w-8 items-center justify-center rounded-md text-gray-400 transition-colors ${
                    isDirty
                      ? "hover:bg-gray-100 hover:text-red-500"
                      : "cursor-default text-gray-300"
                  }`}
                >
                  <Undo2 className="h-3.5 w-3.5" />
                </button>
                <span className="pointer-events-none absolute top-full left-1/2 z-50 mt-1.5 -translate-x-1/2 rounded bg-gray-800 px-2 py-1 text-[10px] whitespace-nowrap text-white opacity-0 transition-opacity group-hover:opacity-100">
                  변경사항 초기화
                </span>
              </div>
              <div className="group relative">
                <button
                  data-tutorial="save"
                  onClick={handleSaveAll}
                  disabled={isSaving || !isDirty}
                  className={`flex h-8 w-8 items-center justify-center rounded-md transition-colors ${
                    isDirty
                      ? "text-[#67add1] hover:bg-[#67add1]/10"
                      : "cursor-default text-gray-300"
                  }`}
                >
                  {isSaving ? (
                    <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                  ) : (
                    <Save className="h-3.5 w-3.5" />
                  )}
                </button>
                <span className="pointer-events-none absolute top-full left-1/2 z-50 mt-1.5 -translate-x-1/2 rounded bg-gray-800 px-2 py-1 text-[10px] whitespace-nowrap text-white opacity-0 transition-opacity group-hover:opacity-100">
                  저장하기
                </span>
              </div>
              <div className="group relative">
                <button
                  onClick={() => setShowTutorial(true)}
                  className="flex h-8 w-8 items-center justify-center rounded-md text-gray-400 transition-colors hover:bg-gray-100 hover:text-[#67add1]"
                >
                  <HelpCircle className="h-3.5 w-3.5" />
                </button>
                <span className="pointer-events-none absolute top-full left-1/2 z-50 mt-1.5 -translate-x-1/2 rounded bg-gray-800 px-2 py-1 text-[10px] whitespace-nowrap text-white opacity-0 transition-opacity group-hover:opacity-100">
                  튜토리얼
                </span>
              </div>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            {lastSavedAt && (
              <p className="text-[10px] text-gray-300">
                마지막 저장{" "}
                {lastSavedAt.toLocaleTimeString("ko-KR", {
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            )}
          </div>
        </div>
      </header>

      <div className="relative flex flex-1 flex-col overflow-hidden lg:flex-row">
        {/* Preview Panel - top half on mobile, right side on desktop */}
        <div
          className="h-[50vh] shrink-0 bg-[#dedbd3] lg:order-2 lg:h-auto lg:flex-1"
          data-tutorial="preview"
        >
          <AlbumPreview3D
            frontCover={frontCover}
            bio={bio}
            timeline={timeline}
            selectedTheme={selectedTheme}
            albumTitle={albumTitle}
            flipped={activeTab === "back"}
          />
        </div>

        {/* Editor: bottom half on mobile, sidebar on desktop */}
        <div className="min-h-0 flex-1 overflow-hidden bg-[#f0eee9] lg:order-1 lg:h-auto lg:w-[420px] lg:flex-none lg:shrink-0 lg:border-r lg:border-[#e2e8f0]">
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
              <TabsList className="flex h-auto w-full shrink-0 rounded-none border-b border-[#e2e8f0] bg-transparent p-0">
                <TabsTrigger
                  value="front"
                  className="relative flex-1 rounded-none border-b-2 border-transparent bg-transparent pt-4 pb-[18px] text-xs font-bold text-[#94a3b8] transition-colors hover:text-[#475569] data-[state=active]:border-[#67add1] data-[state=active]:bg-transparent data-[state=active]:text-[#1e1e1e] data-[state=active]:shadow-none"
                >
                  앞면
                </TabsTrigger>
                <TabsTrigger
                  value="back"
                  className="relative flex-1 rounded-none border-b-2 border-transparent bg-transparent pt-4 pb-[18px] text-xs font-bold text-[#94a3b8] transition-colors hover:text-[#475569] data-[state=active]:border-[#67add1] data-[state=active]:bg-transparent data-[state=active]:text-[#1e1e1e] data-[state=active]:shadow-none"
                >
                  뒷면
                </TabsTrigger>
              </TabsList>

              {/* Scrollable editor content */}
              <div className="scrollbar-accent min-h-0 flex-1 overflow-y-auto">
                <TabsContent
                  className="px-4 pt-6 data-[state=inactive]:hidden sm:px-6 lg:px-8"
                  value="front"
                  forceMount
                >
                  <div data-tutorial="cover-editor">
                    <CoverImageEditor
                      ref={coverRef}
                      record_id={record_id}
                      onImageGenerated={setFrontCover}
                      onTitleChange={setAlbumTitle}
                      onArtistChange={setArtistName}
                      frontCover={frontCover}
                      initialFrontCover={initialState.current.frontCover}
                      initialAlbumTitle={initialState.current.albumTitle}
                      initialArtistName={initialState.current.artistName}
                    />
                  </div>
                </TabsContent>

                {/* Back tab - Redesigned */}
                <TabsContent className="px-4 pt-5 sm:px-5" value="back">
                  <div className="space-y-5 pb-10">
                    {/* Story Section - Collapsible */}
                    <div
                      data-tutorial="story"
                      className="rounded-lg border border-gray-300"
                    >
                      <button
                        onClick={() => setStoryOpen(!storyOpen)}
                        className="flex w-full items-center justify-between px-4 py-3"
                      >
                        <span className="text-sm font-semibold text-gray-900">
                          스토리
                        </span>
                        {storyOpen ? (
                          <ChevronDown className="h-4 w-4 text-gray-400" />
                        ) : (
                          <ChevronRight className="h-4 w-4 text-gray-400" />
                        )}
                      </button>

                      <AnimatePresence initial={false}>
                        {storyOpen && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                          >
                            <div className="space-y-3 border-t border-gray-100 px-4 pt-3 pb-4">
                              {/* Input area with chips inside */}
                              <div className="min-h-50 w-full rounded-lg bg-[#cfcfd1] px-4 pt-3 pb-3">
                                {usedChips.size > 0 && (
                                  <div className="mb-2 flex flex-wrap gap-1.5">
                                    {[...usedChips].map((chip) => (
                                      <span
                                        key={chip}
                                        className="inline-flex items-center gap-1 rounded-full border border-[#67add1] bg-[#67add1]/10 px-2.5 py-0.5 text-[11px] font-medium text-[#67add1]"
                                      >
                                        {chip}
                                        <button
                                          type="button"
                                          onClick={() => handleChipRemove(chip)}
                                          className="ml-0.5 text-[#67add1]/60 transition-colors hover:text-[#67add1]"
                                        >
                                          <X className="h-3 w-3" />
                                        </button>
                                      </span>
                                    ))}
                                  </div>
                                )}
                                <Textarea
                                  value={bio}
                                  onChange={(e) => setBio(e.target.value)}
                                  placeholder={
                                    usedChips.size > 0
                                      ? "추가로 작성하세요..."
                                      : "키워드를 선택하거나 직접 작성하세요..."
                                  }
                                  className="min-h-36 w-full resize-none border-none bg-transparent p-0 text-sm tracking-[0.7px] text-gray-600 placeholder:text-[#6b7280] focus:ring-0 focus:outline-none"
                                />
                              </div>
                              {/* Keyword chips */}
                              <div className="flex flex-wrap gap-1.5">
                                {KEYWORD_CHIPS.map((chip) => {
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
                                          ? "border border-[#67add1] bg-[#67add1]/10 text-[#67add1]"
                                          : "border border-gray-200 bg-white text-gray-500 hover:border-[#67add1] hover:text-[#67add1]"
                                      }`}
                                    >
                                      {isUsed ? `${chip} ✕` : `+ ${chip}`}
                                    </button>
                                  );
                                })}
                              </div>
                              <div className="flex items-center justify-between">
                                <p className="text-[11px] text-gray-300">
                                  {getFullBioText().length}자
                                </p>
                                {bioError && (
                                  <p className="text-xs text-red-500">
                                    {bioError}
                                  </p>
                                )}
                              </div>
                              <Button
                                onClick={handleGenerate}
                                disabled={isGenerating || !getFullBioText()}
                                size="sm"
                                className="h-8 w-full bg-[#67add1] text-xs"
                              >
                                {isGenerating ? (
                                  <>
                                    <RefreshCw className="mr-1.5 h-3 w-3 animate-spin" />
                                    생성 중...
                                  </>
                                ) : (
                                  <>
                                    <Sparkles className="mr-1.5 h-3 w-3" />글
                                    생성
                                  </>
                                )}
                              </Button>
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Timeline Section - Collapsible */}
                    <div
                      data-tutorial="timeline"
                      className="rounded-lg border border-gray-300"
                    >
                      <button
                        onClick={() => setTimelineOpen(!timelineOpen)}
                        className="flex w-full items-center justify-between px-4 py-3"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-gray-900">
                            타임라인
                          </span>
                          <span className="text-[11px] text-gray-400">
                            {timeline.length}개
                          </span>
                        </div>
                        {timelineOpen ? (
                          <ChevronDown className="h-4 w-4 text-gray-400" />
                        ) : (
                          <ChevronRight className="h-4 w-4 text-gray-400" />
                        )}
                      </button>

                      <AnimatePresence initial={false}>
                        {timelineOpen && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                          >
                            <div className="space-y-2 border-t border-gray-100 px-4 pt-3 pb-4">
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
                                    />
                                  ))}
                                </SortableContext>
                              </DndContext>

                              <button
                                onClick={addTimelineItem}
                                className="flex h-8 w-full items-center justify-center gap-1.5 rounded-md border border-dashed border-[#67ADD1] text-xs text-[#67ADD1] transition-colors hover:border-solid hover:bg-[#67ADD1] hover:text-white"
                              >
                                <Plus className="h-3 w-3" /> 항목 추가
                              </button>

                              {timeline.length === 0 && (
                                <div className="py-4 text-center">
                                  <p className="text-xs text-gray-400">
                                    타임라인 항목을 추가해보세요
                                  </p>
                                </div>
                              )}

                              {timelineError && (
                                <p className="text-xs text-red-500">
                                  {timelineError}
                                </p>
                              )}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Theme Section */}
                    <div data-tutorial="theme">
                      <h3 className="mb-3 text-sm font-semibold text-gray-900">
                        테마
                      </h3>
                      <ThemeSelector
                        selectedTheme={selectedTheme}
                        onThemeChange={handleThemeChange}
                      />
                    </div>
                  </div>
                </TabsContent>
              </div>
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
              className="relative mx-4 w-full max-w-sm rounded-xl bg-white p-6 shadow-xl"
            >
              <button
                onClick={() => setShowExitDialog(false)}
                className="absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-md text-gray-400 hover:text-gray-600"
              >
                <X className="h-5 w-5" />
              </button>
              <p className="text-center text-lg font-semibold text-gray-900">
                {isDirty
                  ? "변경사항이 있습니다. 저장하시겠습니까?"
                  : "나가시겠습니까?"}
              </p>
              <div className="mt-6 flex gap-3">
                {isDirty ? (
                  <>
                    <Button
                      variant="outline"
                      onClick={handleExit}
                      className="flex-1 border-gray-300 text-gray-500 hover:border-gray-400 hover:text-gray-900"
                    >
                      나가기
                    </Button>
                    <Button onClick={handleSaveAndExit} className="flex-1">
                      <Save className="mr-2 h-4 w-4" /> 저장하고 나가기
                    </Button>
                  </>
                ) : (
                  <Button onClick={handleExit} className="w-full">
                    나가기
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
              className="mx-4 w-full max-w-md rounded-xl bg-white p-6 shadow-xl"
            >
              <div className="mb-5 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-900">
                  앨범 정보 수정
                </h2>
                <button
                  onClick={() => setShowRecordEditDialog(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-500">
                    제목
                  </label>
                  <input
                    type="text"
                    value={editTitle}
                    onChange={(e) => setEditTitle(e.target.value)}
                    className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-gray-500"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-500">
                    부제목
                  </label>
                  <input
                    type="text"
                    value={editSubtitle}
                    onChange={(e) => setEditSubtitle(e.target.value)}
                    className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none focus:border-gray-500"
                  />
                </div>
                <div>
                  <label className="mb-2 block text-xs font-medium text-gray-500">
                    사진 저장소
                  </label>
                  <div className="mb-3 flex gap-2">
                    {[
                      { key: "google", label: "Google Photo" },
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
                              : opt.key === "icloud"
                                ? editIcloudUrl
                                : editMyboxUrl,
                          );
                        }}
                        className={`flex-1 rounded-lg border px-3 py-2 text-xs font-medium transition-all ${
                          selectedUrlType === opt.key
                            ? "border-[#67add1] bg-[#67add1]/10 text-[#67add1]"
                            : "border-gray-200 text-gray-500 hover:border-gray-300"
                        }`}
                      >
                        {opt.label}
                      </button>
                    ))}
                  </div>
                  <input
                    type="text"
                    value={selectedUrlType === "google" ? editUrlValue : ""}
                    onChange={(e) => setEditUrlValue(e.target.value)}
                    disabled={selectedUrlType !== "google"}
                    placeholder={
                      selectedUrlType === "google"
                        ? "https://photos.google.com/..."
                        : "서비스 준비중입니다"
                    }
                    className={`w-full rounded-md border border-gray-300 px-3 py-2 text-sm outline-none placeholder:text-gray-400 focus:border-gray-500 ${
                      selectedUrlType !== "google"
                        ? "cursor-not-allowed bg-gray-100 text-gray-400"
                        : "bg-white text-gray-900"
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
                  className="flex-1 border-gray-300 text-gray-500"
                >
                  취소
                </Button>
                <Button
                  onClick={handleRecordEditSave}
                  disabled={isRecordSaving}
                  className="flex-1"
                >
                  {isRecordSaving ? (
                    <>
                      <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> 저장
                      중...
                    </>
                  ) : (
                    <>
                      <Save className="mr-2 h-4 w-4" /> 저장
                    </>
                  )}
                </Button>
              </div>

              {/* Delete record */}
              <div className="mt-6 border-t border-gray-100 pt-4">
                {!showDeleteConfirm ? (
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="w-full rounded-lg py-2.5 text-center text-sm font-medium text-red-500 transition-colors hover:bg-red-50"
                  >
                    <Trash2 className="mr-1.5 inline h-3.5 w-3.5" />
                    앨범 삭제하기
                  </button>
                ) : (
                  <div className="space-y-2">
                    <p className="text-center text-xs text-red-500">
                      정말 삭제하시겠습니까? 이 작업은 되돌릴 수 없습니다.
                    </p>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        onClick={() => setShowDeleteConfirm(false)}
                        className="flex-1 border-gray-300 text-xs text-gray-500"
                        size="sm"
                      >
                        취소
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
                        {isDeleting ? "삭제 중..." : "삭제"}
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
      />
    </div>
  );
};

export default Index;
