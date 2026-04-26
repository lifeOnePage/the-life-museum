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
  BookOpen,
  Loader2,
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
import AlbumPreview3D from "./components/AlbumPreview3D";
import TutorialOverlay from "./components/TutorialOverlay";
import ThemeSelector from "./components/ThemeSelector";
import BgmEditor, { BGM_LIST } from "./components/BgmEditor";
import { usePhotoDrive } from "./components/usePhotoDrive";
import { UNIFIED_THEMES, DEFAULT_THEME } from "./themeConfig";

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
        className="cursor-grab pt-2 text-[#9b8b7a]/40 active:cursor-grabbing"
        {...attributes}
        {...listeners}
      >
        <GripVertical className="h-3.5 w-3.5" />
      </div>
      <Input
        value={item.year}
        onChange={(e) => onUpdate(index, "year", e.target.value.slice(0, 8))}
        placeholder="연도"
        maxLength={8}
        className="h-9 w-[70px] rounded-[5px] border-white/10 bg-[#2e2720] text-xs text-[#e8d5b7] placeholder:text-[#9b8b7a]/60"
      />
      <div className="relative flex-1">
        <Input
          value={item.event}
          onChange={(e) =>
            onUpdate(index, "event", e.target.value.slice(0, 20))
          }
          placeholder="내용을 입력하세요..."
          maxLength={20}
          className="h-9 w-full rounded-[5px] border-white/10 bg-[#2e2720] pr-8 text-xs text-[#e8d5b7] placeholder:text-[#9b8b7a]/60"
        />
        <span className="pointer-events-none absolute top-1/2 right-2 -translate-y-1/2 text-[9px] text-[#9b8b7a]">
          {item.event.length}/20
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
  const { record_id } = use(params);
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
  const [activeTab, setActiveTab] = useState("front");
  const [selectedTheme, setSelectedTheme] = useState(DEFAULT_THEME);

  // Title overlay state
  const [titleOverlayEnabled, setTitleOverlayEnabled] = useState(false);
  const [titlePosition, setTitlePosition] = useState("bottom-center");
  const [titleFont, setTitleFont] = useState("Pretendard Variable");
  const [titleColor, setTitleColor] = useState("#000000");
  const [titleStroke, setTitleStroke] = useState("none");
  const [titleStrokeOpacity, setTitleStrokeOpacity] = useState(100);

  // Collapsible sections
  const [titleOpen, setTitleOpen] = useState(true);
  const [coverOpen, setCoverOpen] = useState(true);
  const [bgmOpen, setBgmOpen] = useState(false);
  const [storyOpen, setStoryOpen] = useState(true);
  const [timelineOpen, setTimelineOpen] = useState(true);
  const [keywordsExpanded, setKeywordsExpanded] = useState(false);
  const [keywordHelpOpen, setKeywordHelpOpen] = useState(false);
  const [timelineHelpOpen, setTimelineHelpOpen] = useState(true);

  // Tutorial
  const [showTutorial, setShowTutorial] = useState(false);
  const [showHeaderMenu, setShowHeaderMenu] = useState(false);

  // AI story generation state
  const [isGenerating, setIsGenerating] = useState(false);
  const [bioError, setBioError] = useState("");
  const [storyGenCount, setStoryGenCount] = useState(0);
  const storyRemainingGens = 3 - storyGenCount;
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
    titleOverlayEnabled: false,
    titlePosition: "bottom-center",
    titleFont: "Pretendard Variable",
    titleColor: "#000000",
    titleStroke: "none",
    titleStrokeOpacity: 100,
    bgmUrl: null,
    bgmId: null,
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

          const savedTheme = UNIFIED_THEMES[data.theme] ? data.theme : DEFAULT_THEME;
          const savedTitleOverlayEnabled = data.coverTitleVisible ?? false;
          const savedTitlePosition = data.coverTitlePosition || "bottom-center";
          const savedTitleFont = data.coverTitleFont || "Pretendard Variable";
          const savedTitleColor = fromApiColor(data.coverTitleColor) || "#000000";
          const { stroke: savedTitleStroke, strokeOpacity: savedTitleStrokeOpacity } =
            dbColorToStroke(data.coverTitleBgColor);

          setFrontCover(coverUrl);
          setAlbumTitle(title);
          setAlbumSubtitle(subtitle);
          setBio(bioContent);
          // Initialize timeline IDs for drag reorder
          timelineIdsRef.current = timelineData.map(
            () => `tl-${nextIdRef.current++}`,
          );
          setTimeline(timelineData);
          setSelectedTheme(savedTheme);
          setTitleOverlayEnabled(savedTitleOverlayEnabled);
          setTitlePosition(savedTitlePosition);
          setTitleFont(savedTitleFont);
          setTitleColor(savedTitleColor);
          setTitleStroke(savedTitleStroke);
          setTitleStrokeOpacity(savedTitleStrokeOpacity);
          setGooglePhotoUrl(data.googlePhotoUrl || "");
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

          // Initialize photo drive data for CoverImageEditor
          const images = (data.mediaList ?? []).filter(
            (m) => m.type === "image",
          );
          photoDrive.init(images);

          initialState.current = {
            frontCover: coverUrl,
            albumTitle: title,
            albumSubtitle: subtitle,
            bio: bioContent,
            timeline: timelineData,
            selectedTheme: savedTheme,
            titleOverlayEnabled: savedTitleOverlayEnabled,
            titlePosition: savedTitlePosition,
            titleFont: savedTitleFont,
            titleColor: savedTitleColor,
            titleStroke: savedTitleStroke,
            titleStrokeOpacity: savedTitleStrokeOpacity,
            bgmUrl: data.bgmUrl || null,
            bgmId: data.bgmId ? `bgm${data.bgmId}` : null,
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
          color: toApiColor(theme.text),
          bgColor: toApiColor(theme.bg),
          keyColor: toApiColor(theme.accent),
          theme: selectedTheme,
          title: albumTitle,
          subTitle: albumSubtitle,
          coverTitleVisible: titleOverlayEnabled,
          coverTitlePosition: titlePosition,
          coverTitleFont: titleFont,
          coverTitleColor: toApiColor(titleColor),
          coverTitleBgColor: strokeToDbColor(titleStroke, titleStrokeOpacity),
          bgmId: bgmId ? parseInt(bgmId.replace("bgm", ""), 10) : null,
          bgmUrl: bgmUrl || null,
        }),
      },
    );

    const data = await response.json();
    if (!response.ok) {
      console.error("saveRecordColors 422 detail:", JSON.stringify(data));
      throw new Error(data.error || data.detail || "컬러 저장에 실패했습니다");
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
    const isCoverDirty = frontCover !== initialState.current.frontCover;
    const isBioDirty = bio !== initialState.current.bio;
    const isTimelineDirty =
      JSON.stringify(timeline) !==
      JSON.stringify(initialState.current.timeline);
    const isThemeDirty =
      selectedTheme !== initialState.current.selectedTheme ||
      albumTitle !== initialState.current.albumTitle ||
      albumSubtitle !== initialState.current.albumSubtitle ||
      titleOverlayEnabled !== initialState.current.titleOverlayEnabled ||
      titlePosition !== initialState.current.titlePosition ||
      titleFont !== initialState.current.titleFont ||
      titleColor !== initialState.current.titleColor ||
      titleStroke !== initialState.current.titleStroke ||
      titleStrokeOpacity !== initialState.current.titleStrokeOpacity ||
      bgmUrl !== initialState.current.bgmUrl;

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
        } else if (r.value.editor === "bio") {
          initialState.current.bio = bio;
        } else if (r.value.editor === "timeline") {
          initialState.current.timeline = [...timeline];
        } else if (r.value.editor === "theme") {
          initialState.current.selectedTheme = selectedTheme;
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
    albumSubtitle !== initialState.current.albumSubtitle ||
    bio !== initialState.current.bio ||
    JSON.stringify(timeline) !==
      JSON.stringify(initialState.current.timeline) ||
    selectedTheme !== initialState.current.selectedTheme ||
    titleOverlayEnabled !== initialState.current.titleOverlayEnabled ||
    titlePosition !== initialState.current.titlePosition ||
    titleFont !== initialState.current.titleFont ||
    titleColor !== initialState.current.titleColor ||
    titleStroke !== initialState.current.titleStroke ||
    titleStrokeOpacity !== initialState.current.titleStrokeOpacity ||
    bgmUrl !== initialState.current.bgmUrl;

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
    if (!fullText || storyRemainingGens <= 0) return;
    setIsGenerating(true);
    setBioError("");
    console.log("fullText", fullText);

    // Optimistic update
    const optimisticCount = storyGenCount + 1;
    setStoryGenCount(optimisticCount);

    try {
      const token = localStorage.getItem("app_token");
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
        setStoryGenCount(optimisticCount - 1); // rollback
        throw new Error(data.error || "생성에 실패했습니다");
      }
      setBio(data.data?.result || "");
      // Sync with server value if provided
      const newCount =
        data.data?.storyGenCount != null
          ? data.data.storyGenCount
          : optimisticCount;
      setStoryGenCount(newCount);

      // Persist count to server
      fetch(
        `https://the-life-museum-backend-production.up.railway.app/api/v1/record/${record_id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
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
    if (timeline.length >= 6) return;
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
            googlePhotoUrl: finalGoogleUrl,
            icloudUrl: finalIcloudUrl,
            myboxUrl: finalMyboxUrl,
            externalLinkTitle: editExternalLinkTitle,
            externalLinkUrl: editExternalLinkUrl,
          }),
        },
      );

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "저장에 실패했습니다");
      }

      setGooglePhotoUrl(finalGoogleUrl);
      setIcloudUrl(finalIcloudUrl);
      setMyboxUrl(finalMyboxUrl);
      setExternalLinkTitle(editExternalLinkTitle);
      setExternalLinkUrl(editExternalLinkUrl);
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
      <div className="flex min-h-screen items-center justify-center bg-[#1e1a14]">
        <p className="text-[#9b8b7a]">불러오는 중...</p>
      </div>
    );
  }

  return (
    <div className="flex h-screen flex-col overflow-hidden bg-[#1e1a14]">
      {/* Header - Mobile */}
      <header className="border-b border-[rgba(255,255,255,0.08)] bg-[#241f18]">
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
              {albumTitle || "앨범 편집"}
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
                      앨범 정보 수정
                    </button>
                    <button
                      onClick={() => {
                        handleSaveAll();
                        setShowHeaderMenu(false);
                      }}
                      disabled={isSaving || !isDirty}
                      className="text-[#e8d5b7 ] flex w-full items-center gap-3 px-4 py-2.5 text-[13px] active:bg-white/5 disabled:opacity-40"
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
                      className="flex w-full items-center gap-3 px-4 py-2.5 text-[13px] text-[#e8d5b7] active:bg-white/5 disabled:opacity-40"
                    >
                      <Undo2 className="h-4 w-4 text-[#9b8b7a]" />
                      변경사항 초기화
                    </button>
                    <button
                      onClick={() => {
                        setShowTutorial(true);
                        setShowHeaderMenu(false);
                      }}
                      className="flex w-full items-center gap-3 px-4 py-2.5 text-[13px] text-[#e8d5b7] active:bg-white/5"
                    >
                      <HelpCircle className="h-4 w-4 text-[#9b8b7a]" />
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
                className="flex h-8 w-8 items-center justify-center rounded-md text-[#9b8b7a] transition-colors hover:bg-white/8 hover:text-[#e8d5b7]"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <span className="pointer-events-none absolute top-full left-1/2 z-50 mt-1.5 -translate-x-1/2 rounded bg-[#2a2318] ring-1 ring-white/10 px-2 py-1 text-[10px] whitespace-nowrap text-[#e8d5b7] opacity-0 transition-opacity group-hover:opacity-100">
                나가기
              </span>
            </div>
            <div>
              <h1 className="text-sm leading-tight font-semibold text-[#e8d5b7]">
                {albumTitle || "앨범 편집"}
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
                <span className="pointer-events-none absolute top-full left-1/2 z-50 mt-1.5 -translate-x-1/2 rounded bg-[#2a2318] ring-1 ring-white/10 px-2 py-1 text-[10px] whitespace-nowrap text-[#e8d5b7] opacity-0 transition-opacity group-hover:opacity-100">
                  앨범 정보 수정
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
                <span className="pointer-events-none absolute top-full left-1/2 z-50 mt-1.5 -translate-x-1/2 rounded bg-[#2a2318] ring-1 ring-white/10 px-2 py-1 text-[10px] whitespace-nowrap text-[#e8d5b7] opacity-0 transition-opacity group-hover:opacity-100">
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
                <span className="pointer-events-none absolute top-full left-1/2 z-50 mt-1.5 -translate-x-1/2 rounded bg-[#2a2318] ring-1 ring-white/10 px-2 py-1 text-[10px] whitespace-nowrap text-[#e8d5b7] opacity-0 transition-opacity group-hover:opacity-100">
                  저장하기
                </span>
              </div>
              <div className="group relative">
                <button
                  onClick={() => setShowTutorial(true)}
                  className="hover:text-[#e8d5b7 ] flex h-8 w-8 items-center justify-center rounded-md text-[#9b8b7a] transition-colors hover:bg-white/8"
                >
                  <HelpCircle className="h-3.5 w-3.5" />
                </button>
                <span className="pointer-events-none absolute top-full left-1/2 z-50 mt-1.5 -translate-x-1/2 rounded bg-[#2a2318] ring-1 ring-white/10 px-2 py-1 text-[10px] whitespace-nowrap text-[#e8d5b7] opacity-0 transition-opacity group-hover:opacity-100">
                  튜토리얼
                </span>
              </div>
            </div>
          </div>
          <div className="flex shrink-0 items-center gap-2">
            {lastSavedAt && (
              <p className="text-[10px] text-[#9b8b7a]/60">
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
          className="h-[50vh] shrink-0 bg-[#1a1510] lg:order-2 lg:h-auto lg:flex-1"
          data-tutorial="preview"
        >
          <AlbumPreview3D
            frontCover={frontCover}
            bio={bio}
            timeline={timeline}
            selectedTheme={selectedTheme}
            albumTitle={albumTitle}
            albumSubTitle={albumSubtitle}
            titleOverlayEnabled={titleOverlayEnabled}
            titlePosition={titlePosition}
            titleFont={titleFont}
            titleColor={titleColor}
            titleStroke={titleStroke}
            titleStrokeOpacity={titleStrokeOpacity}
            flipped={activeTab === "back"}
          />
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
                  value="front"
                  className="data-[state=active]:border-[#c4b49a] relative flex-1 rounded-none border-b-2 border-transparent bg-transparent pt-4 pb-[18px] text-xs font-bold text-[#9b8b7a] transition-colors hover:text-[#c4a882] data-[state=active]:bg-transparent data-[state=active]:text-[#c4b49a] data-[state=active]:shadow-none"
                >
                  앞면
                </TabsTrigger>
                <TabsTrigger
                  value="back"
                  className="data-[state=active]:border-[#c4b49a] relative flex-1 rounded-none border-b-2 border-transparent bg-transparent pt-4 pb-[18px] text-xs font-bold text-[#9b8b7a] transition-colors hover:text-[#c4a882] data-[state=active]:bg-transparent data-[state=active]:text-[#c4b49a] data-[state=active]:shadow-none"
                >
                  뒷면
                </TabsTrigger>
              </TabsList>

              {/* Scrollable editor content */}
              <div className="scrollbar-accent min-h-0 flex-1 overflow-y-auto">
                <TabsContent
                  className="px-4 pt-5 data-[state=inactive]:hidden sm:px-5"
                  value="front"
                  forceMount
                >
                  <div className="space-y-5 pb-10">
                    {/* Title / Subtitle inputs (always visible) */}
                    <div className="space-y-3">
                      <div>
                        <div className="mb-1.5 flex items-center justify-between">
                          <label className="block text-xs font-medium text-[#9b8b7a]">
                            제목
                          </label>
                          <span className="text-[10px] text-[#9b8b7a]">
                            {albumTitle.length}/14
                          </span>
                        </div>
                        <input
                          type="text"
                          value={albumTitle}
                          onChange={(e) =>
                            setAlbumTitle(e.target.value.slice(0, 14))
                          }
                          maxLength={14}
                          placeholder="앨범 제목을 입력하세요"
                          className="focus:border-[#e8d5b7 ] w-full rounded-[5px] border border-white/10 bg-[#2e2720] px-3 py-2 text-sm text-[#e8d5b7] placeholder:text-[#9b8b7a]/60 focus:outline-none"
                        />
                      </div>
                      <div>
                        <div className="mb-1.5 flex items-center justify-between">
                          <label className="block text-xs font-medium text-[#9b8b7a]">
                            부제목
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
                          placeholder="부제목을 입력하세요"
                          className="focus:border-[#e8d5b7 ] w-full rounded-[5px] border border-white/10 bg-[#2e2720] px-3 py-2 text-sm text-[#e8d5b7] placeholder:text-[#9b8b7a]/60 focus:outline-none"
                        />
                      </div>
                    </div>

                    {/* Title Overlay Section - Collapsible with toggle */}
                    <div className="rounded-lg border border-white/10">
                      <div className="flex items-center justify-between px-4 py-3">
                        <button
                          onClick={() =>
                            titleOverlayEnabled && setTitleOpen(!titleOpen)
                          }
                          className="flex items-center gap-2"
                        >
                          <span className="text-sm font-semibold text-[#e8d5b7]">
                            표지에 제목 표시하기
                          </span>
                          {titleOverlayEnabled &&
                            (titleOpen ? (
                              <ChevronDown className="h-4 w-4 text-[#9b8b7a]" />
                            ) : (
                              <ChevronRight className="h-4 w-4 text-[#9b8b7a]" />
                            ))}
                        </button>
                        <button
                          type="button"
                          role="switch"
                          aria-checked={titleOverlayEnabled}
                          onClick={() => {
                            const next = !titleOverlayEnabled;
                            setTitleOverlayEnabled(next);
                            if (next) setTitleOpen(true);
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

                      <AnimatePresence initial={false}>
                        {titleOverlayEnabled && titleOpen && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                          >
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
                              />
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>

                    {/* Cover Design Section - Collapsible */}
                    <div
                      data-tutorial="cover-editor"
                      className="rounded-lg border border-white/10"
                    >
                      <button
                        onClick={() => setCoverOpen(!coverOpen)}
                        className="flex w-full items-center justify-between px-4 py-3"
                      >
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-semibold text-[#e8d5b7]">
                            표지 디자인
                          </span>
                          <span className="text-[11px] text-[#9b8b7a]">
                            AI 생성 또는 직접 업로드
                          </span>
                        </div>
                        {coverOpen ? (
                          <ChevronDown className="h-4 w-4 text-[#9b8b7a]" />
                        ) : (
                          <ChevronRight className="h-4 w-4 text-[#9b8b7a]" />
                        )}
                      </button>

                      <AnimatePresence initial={false}>
                        {coverOpen && (
                          <motion.div
                            initial={{ height: 0, opacity: 0 }}
                            animate={{ height: "auto", opacity: 1 }}
                            exit={{ height: 0, opacity: 0 }}
                            transition={{ duration: 0.2 }}
                            className="overflow-hidden"
                          >
                            <div className="border-t border-white/8 px-4 pt-3 pb-4">
                              <CoverImageEditor
                                ref={coverRef}
                                record_id={record_id}
                                onImageGenerated={setFrontCover}
                                frontCover={frontCover}
                                initialFrontCover={
                                  initialState.current.frontCover
                                }
                                photoMedia={photoDrive.photoMedia}
                                photoBlobUrls={photoDrive.photoBlobUrls}
                                onRefreshPhotos={photoDrive.refresh}
                                isRefreshing={photoDrive.isRefreshing}
                                preloadBlobs={photoDrive.preloadBlobs}
                              />
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
                            배경음악
                          </span>
                          {bgmUrl && (
                            <span className="text-[11px] text-[#c4b49a]">선택됨</span>
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
                              />
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  </div>
                </TabsContent>

                {/* Back tab - Redesigned */}
                <TabsContent className="px-4 pt-5 sm:px-5" value="back">
                  <div className="space-y-5 pb-10">
                    {/* Guide text */}
                    <div className="flex items-start gap-3 rounded-xl border border-white/10 bg-[#2a2318] px-4 py-3.5">
                      <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-[#c4b49a]/10">
                        <BookOpen className="h-3.5 w-3.5 text-[#c4b49a]" />
                      </div>
                      <p className="pt-0.5 text-xs leading-relaxed text-[#9b8b7a]">
                        앨범 뒷면을 꾸미기 위해 앨범에 맞는 스토리와 타임라인을
                        적어주세요
                      </p>
                    </div>

                    {/* Story Section - Collapsible */}
                    <div
                      data-tutorial="story"
                      className="rounded-lg border border-white/10"
                    >
                      <button
                        onClick={() => setStoryOpen(!storyOpen)}
                        className="flex w-full items-center justify-between px-4 py-3"
                      >
                        <span className="text-sm font-semibold text-[#e8d5b7]">
                          스토리
                        </span>
                        {storyOpen ? (
                          <ChevronDown className="h-4 w-4 text-[#9b8b7a]" />
                        ) : (
                          <ChevronRight className="h-4 w-4 text-[#9b8b7a]" />
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
                            <div className="space-y-3 border-t border-white/8 px-4 pt-3 pb-4">
                              {/* Keyword chips section */}
                              <div>
                                <div className="flex items-center gap-1.5">
                                  <span className="text-xs font-medium text-[#9b8b7a]">
                                    키워드 선택
                                  </span>
                                  <span
                                    onClick={() =>
                                      setKeywordHelpOpen(!keywordHelpOpen)
                                    }
                                    className={`flex h-5 w-5 cursor-pointer items-center justify-center rounded-full transition-colors hover:text-[#c4a882] ${keywordHelpOpen ? "text-[#c4b49a]" : "text-[#9b8b7a]"}`}
                                  >
                                    <HelpCircle className="h-3.5 w-3.5" />
                                  </span>
                                  {usedChips.size > 0 && (
                                    <span className="text-[11px] text-[#9b8b7a]">
                                      {usedChips.size}개 선택됨
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
                                          💡 글감이 떠오르지 않을 때 키워드를
                                          선택해보세요. 선택한 키워드가 스토리에
                                          주제로 추가되어, AI가 이를 바탕으로 더
                                          풍부한 이야기를 만들어 줄 수 있어요.
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
                                      ? "접기"
                                      : `+${KEYWORD_CHIPS.length - 3}개 더보기`}
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
                                  onChange={(e) =>
                                    setBio(e.target.value.slice(0, 250))
                                  }
                                  placeholder={
                                    usedChips.size > 0
                                      ? "추가로 작성하세요..."
                                      : "자유롭게 작성하세요..."
                                  }
                                  className="min-h-36 w-full resize-none border-none bg-transparent p-0 text-sm tracking-[0.7px] text-[#e8d5b7] placeholder:text-[#9b8b7a]/60 focus:ring-0 focus:outline-none"
                                />
                              </div>

                              {/* Character count */}
                              <div className="flex items-center justify-between">
                                <p
                                  className={`text-[11px] ${getFullBioText().length >= 250 ? "text-red-400" : "text-[#9b8b7a]/60"}`}
                                >
                                  {getFullBioText().length}/250자
                                </p>
                                {bioError && (
                                  <p className="text-xs text-red-500">
                                    {bioError}
                                  </p>
                                )}
                              </div>

                              {/* Generation count */}
                              <div className="flex items-center justify-between rounded-lg border-[1.5px] border-[#c4b49a] px-3 py-2">
                                <span className="text-xs text-[#c4b49a]">사용한 생성 횟수</span>
                                <span className={`text-xs font-medium ${storyRemainingGens <= 0 ? "text-red-500" : "text-[#c4b49a]"}`}>
                                  {storyGenCount}/3
                                </span>
                              </div>

                              {storyRemainingGens <= 0 && (
                                <div className="rounded-lg bg-red-500/10 px-3 py-2">
                                  <p className="text-xs text-red-500">생성 횟수를 모두 사용했습니다.</p>
                                </div>
                              )}

                              {/* Generate button */}
                              <Button
                                onClick={handleGenerate}
                                disabled={isGenerating || !getFullBioText() || storyRemainingGens <= 0}
                                size="sm"
                                className="h-8 w-full bg-[#c4b49a] text-xs text-[#1a1510] hover:bg-[#e8d5b7]"
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
                      className="rounded-lg border border-white/10"
                    >
                      <button
                        onClick={() => setTimelineOpen(!timelineOpen)}
                        className="flex w-full items-center justify-between px-4 py-3"
                      >
                        <div className="flex items-center gap-1.5">
                          <span className="text-sm font-semibold text-[#e8d5b7]">
                            타임라인
                          </span>
                          {/* <span
                            onClick={(e) => {
                              e.stopPropagation();
                              setTimelineHelpOpen(!timelineHelpOpen);
                            }}
                            className={`flex h-5 w-5 items-center justify-center rounded-full transition-colors hover:text-gray-600 ${timelineHelpOpen ? "text-[#e8d5b7 ]" : "text-gray-400"}`}
                          >
                            <HelpCircle className="h-3.5 w-3.5" />
                          </span> */}
                        </div>
                        {timelineOpen ? (
                          <ChevronDown className="h-4 w-4 text-[#9b8b7a]" />
                        ) : (
                          <ChevronRight className="h-4 w-4 text-[#9b8b7a]" />
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
                            <div className="space-y-2 border-t border-white/8 px-4 pt-3 pb-4">
                              {/* {timelineHelpOpen && (
                                <p className="text-[11px] leading-relaxed text-[#e8d5b7 ]">
                                  기억에 남는 순간들을 시간 순서대로
                                  기록해보세요. 연도와 간단한 내용을 입력하면
                                  됩니다.
                                </p>
                              )} */}
                              <DndContext
                                sensors={sensors}
                                collisionDetection={closestCenter}
                                onDragEnd={handleDragEnd}
                                ㅇ
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
                                disabled={timeline.length >= 6}
                                className="flex h-8 w-full items-center justify-center gap-1.5 rounded-md border border-dashed border-[#c4b49a] text-xs text-[#c4b49a] transition-colors hover:border-solid hover:bg-[#c4b49a] hover:text-[#1a1510] disabled:cursor-not-allowed disabled:opacity-40 disabled:hover:bg-transparent disabled:hover:text-[#c4b49a]"
                              >
                                <Plus className="h-3 w-3" /> 항목 추가 (
                                {timeline.length}/6)
                              </button>

                              {timeline.length === 0 && (
                                <div className="py-4 text-center">
                                  <p className="text-xs text-[#9b8b7a]">
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
                      <h3 className="mb-3 text-sm font-semibold text-[#e8d5b7]">
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
              className="relative mx-4 w-full max-w-sm rounded-xl bg-[#2a2318] p-6 shadow-xl"
            >
              <button
                onClick={() => setShowExitDialog(false)}
                className="absolute top-3 right-3 flex h-8 w-8 items-center justify-center rounded-md text-[#9b8b7a] hover:text-[#e8d5b7]"
              >
                <X className="h-5 w-5" />
              </button>
              <p className="text-center text-lg font-semibold text-[#e8d5b7]">
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
                      className="flex-1 border-white/15 text-[#9b8b7a] hover:border-white/30 hover:text-[#e8d5b7]"
                    >
                      나가기
                    </Button>
                    <Button onClick={handleSaveAndExit} disabled={isSaving} className="flex-1">
                      {isSaving ? (
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      ) : (
                        <Save className="mr-2 h-4 w-4" />
                      )}
                      {isSaving ? "저장 중..." : "저장하고 나가기"}
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
              className="mx-4 w-full max-w-md rounded-xl bg-[#2a2318] p-6 shadow-xl"
            >
              <div className="mb-5 flex items-center justify-between">
                <h2 className="text-lg font-semibold text-[#e8d5b7]">
                  앨범 정보 수정
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
                    외부 링크
                  </label>
                  <input
                    type="text"
                    value={editExternalLinkTitle}
                    onChange={(e) => setEditExternalLinkTitle(e.target.value)}
                    placeholder="버튼에 표시할 이름 (예: 유튜브 채널)"
                    className="mb-2 w-full rounded-md border border-white/15 bg-[#2e2720] px-3 py-2 text-sm text-[#e8d5b7] outline-none placeholder:text-[#9b8b7a]/60 focus:border-white/30"
                  />
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
                    value={selectedUrlType === "google" ? editUrlValue : ""}
                    onChange={(e) => setEditUrlValue(e.target.value)}
                    disabled={selectedUrlType !== "google"}
                    placeholder={
                      selectedUrlType === "google"
                        ? "https://photos.google.com/..."
                        : "서비스 준비중입니다"
                    }
                    className={`w-full rounded-md border border-white/15 px-3 py-2 text-sm outline-none placeholder:text-[#9b8b7a]/60 focus:border-white/30 ${
                      selectedUrlType !== "google"
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
              <div className="mt-6 border-t border-white/8 pt-4">
                {!showDeleteConfirm ? (
                  <button
                    onClick={() => setShowDeleteConfirm(true)}
                    className="w-full rounded-lg py-2.5 text-center text-sm font-medium text-red-500 transition-colors hover:bg-red-500/10"
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
                        className="flex-1 border-white/15 text-xs text-[#9b8b7a]"
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
