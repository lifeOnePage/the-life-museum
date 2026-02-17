"use client";

import { use, useState, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import {
  BookOpen,
  BookOpenCheck,
  FileText,
  Clock,
  Save,
  RefreshCw,
  ArrowLeft,
  Pencil,
  X,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./components/ui/tabs";
import { Button } from "./components/ui/button";
import { getDominantColor } from "@rtcoder/dominant-color";
import AlbumPreview3D from "./components/AlbumPreview3D";
import CoverImageEditor from "./components/CoverImageEditor";
import BioEditor from "./components/BioEditor";
import TimelineEditor from "./components/TimelineEditor";

const Index = ({ params }) => {
  const { record_id } = use(params);
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);
  const [frontCover, setFrontCover] = useState(null);
  const [albumTitle, setAlbumTitle] = useState("");
  const [artistName, setArtistName] = useState("");
  const [bio, setBio] = useState("");
  const [mood, setMood] = useState("");
  const [timeline, setTimeline] = useState([]);
  const [backTextColor, setBackTextColor] = useState("#1c1917");
  const [backBgColor, setBackBgColor] = useState("");
  const [backKeyColor, setBackKeyColor] = useState("#b45309");
  const [isSaving, setIsSaving] = useState(false);
  const [showExitDialog, setShowExitDialog] = useState(false);

  // Record edit dialog
  const [showRecordEditDialog, setShowRecordEditDialog] = useState(false);
  const [editTitle, setEditTitle] = useState("");
  const [editSubtitle, setEditSubtitle] = useState("");
  const [editGooglePhotoUrl, setEditGooglePhotoUrl] = useState("");
  const [editIcloudUrl, setEditIcloudUrl] = useState("");
  const [editMyboxUrl, setEditMyboxUrl] = useState("");
  const [isRecordSaving, setIsRecordSaving] = useState(false);
  const [recordError, setRecordError] = useState("");

  // URLs from API (for display in edit dialog)
  const [googlePhotoUrl, setGooglePhotoUrl] = useState("");
  const [icloudUrl, setIcloudUrl] = useState("");
  const [myboxUrl, setMyboxUrl] = useState("");

  const coverRef = useRef(null);
  const bioRef = useRef(null);
  const timelineRef = useRef(null);
  const initialState = useRef({
    frontCover: null,
    albumTitle: "",
    artistName: "",
    bio: "",
    timeline: [],
    backTextColor: "#1c1917",
    backBgColor: "",
    backKeyColor: "#b45309",
  });

  useEffect(() => {
    const fetchRecord = async () => {
      try {
        const apiUrl = process.env.NEXT_PUBLIC_API_URL;
        const response = await fetch(`${apiUrl}/api/v1/record/${record_id}`, {
          headers: {
            "X-Dev-Key": "tlm2026",
          },
        });

        const result = await response.json();

        if (result.ok && result.data) {
          const data = result.data;

          const coverUrl = data.coverImage?.url || null;
          const title = data.title || "";
          const subtitle = data.subtitle || "";
          const bioContent = data.lifestory?.content || "";
          const moodValue = data.lifestory?.mood || "";

          let timelineData = [];
          if (data.timeline?.events) {
            timelineData = data.timeline.events.map((event) => ({
              year: event.timestamp ? event.timestamp : "",
              event: `${event.title}${event.description ? ` - ${event.description}` : ""}`,
            }));
          }

          const textColor = data.color || "#1c1917";
          const bgColorVal = data.bgColor || "";
          const keyColorVal = data.keyColor || "#b45309";

          setFrontCover(coverUrl);
          setAlbumTitle(title);
          setArtistName(subtitle);
          setBio(bioContent);
          setMood(moodValue);
          setTimeline(timelineData);
          setBackTextColor(textColor);
          setBackBgColor(bgColorVal);
          setBackKeyColor(keyColorVal);
          setGooglePhotoUrl(data.googlePhotoUrl || "");
          setIcloudUrl(data.icloudUrl || "");
          setMyboxUrl(data.myboxUrl || "");

          initialState.current = {
            frontCover: coverUrl,
            albumTitle: title,
            artistName: subtitle,
            bio: bioContent,
            timeline: timelineData,
            backTextColor: textColor,
            backBgColor: bgColorVal,
            backKeyColor: keyColorVal,
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

  // Extract dominant color from cover image as bgColor fallback
  useEffect(() => {
    if (!frontCover || typeof document === "undefined") return;
    if (backBgColor) return;

    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => {
      getDominantColor(img, {
        downScaleFactor: 4,
        skipPixels: 5,
        colorFormat: "hex",
        callback: (color) => {
          setBackBgColor((prev) => prev || color);
        },
      });
    };
    img.src = frontCover;
  }, [frontCover, backBgColor]);

  const saveRecordColors = async () => {
    const apiUrl = process.env.NEXT_PUBLIC_API_URL;
    const response = await fetch(`${apiUrl}/api/v1/record/${record_id}`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "X-Dev-Key": "tlm2026",
      },
      body: JSON.stringify({
        color: backTextColor,
        bgColor: backBgColor,
        keyColor: backKeyColor,
      }),
    });

    const data = await response.json();
    if (!response.ok) {
      throw new Error(data.error || "컬러 저장에 실패했습니다");
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
    const isColorDirty =
      backTextColor !== initialState.current.backTextColor ||
      backBgColor !== initialState.current.backBgColor ||
      backKeyColor !== initialState.current.backKeyColor;

    if (!isCoverDirty && !isBioDirty && !isTimelineDirty && !isColorDirty)
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

    if (isBioDirty && bioRef.current) {
      promises.push(
        bioRef.current
          .save()
          .then(() => ({ editor: "bio", success: true }))
          .catch((err) => ({ editor: "bio", success: false, error: err })),
      );
    }

    if (isTimelineDirty && timelineRef.current) {
      promises.push(
        timelineRef.current
          .save()
          .then(() => ({ editor: "timeline", success: true }))
          .catch((err) => ({ editor: "timeline", success: false, error: err })),
      );
    }

    if (isColorDirty) {
      promises.push(
        saveRecordColors()
          .then(() => ({ editor: "color", success: true }))
          .catch((err) => ({ editor: "color", success: false, error: err })),
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
        } else if (r.value.editor === "color") {
          initialState.current.backTextColor = backTextColor;
          initialState.current.backBgColor = backBgColor;
          initialState.current.backKeyColor = backKeyColor;
        }
      }
    }

    setIsSaving(false);
  };

  const isDirty =
    frontCover !== initialState.current.frontCover ||
    albumTitle !== initialState.current.albumTitle ||
    artistName !== initialState.current.artistName ||
    bio !== initialState.current.bio ||
    JSON.stringify(timeline) !==
      JSON.stringify(initialState.current.timeline) ||
    backTextColor !== initialState.current.backTextColor ||
    backBgColor !== initialState.current.backBgColor ||
    backKeyColor !== initialState.current.backKeyColor;

  const handleExit = () => {
    router.push("/library");
  };

  const handleSaveAndExit = async () => {
    await handleSaveAll();
    router.push("/library");
  };

  const openRecordEditDialog = () => {
    setEditTitle(albumTitle);
    setEditSubtitle(artistName);
    setEditGooglePhotoUrl(googlePhotoUrl);
    setEditIcloudUrl(icloudUrl);
    setEditMyboxUrl(myboxUrl);
    setRecordError("");
    setShowRecordEditDialog(true);
  };

  const handleRecordEditSave = async () => {
    setIsRecordSaving(true);
    setRecordError("");

    try {
      const apiUrl = process.env.NEXT_PUBLIC_API_URL;
      const response = await fetch(`${apiUrl}/api/v1/record/${record_id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
          "X-Dev-Key": "tlm2026",
        },
        body: JSON.stringify({
          title: editTitle,
          subTitle: editSubtitle,
          googlePhotoUrl: editGooglePhotoUrl,
          icloudUrl: editIcloudUrl,
          myboxUrl: editMyboxUrl,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.error || "저장에 실패했습니다");
      }

      setAlbumTitle(editTitle);
      setArtistName(editSubtitle);
      setGooglePhotoUrl(editGooglePhotoUrl);
      setIcloudUrl(editIcloudUrl);
      setMyboxUrl(editMyboxUrl);
      initialState.current.albumTitle = editTitle;
      initialState.current.artistName = editSubtitle;
      setShowRecordEditDialog(false);
    } catch (err) {
      setRecordError(err.message);
    } finally {
      setIsRecordSaving(false);
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
    <div className="flex min-h-screen flex-col bg-white">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-gray-200 px-6 py-4">
        <div className="flex items-center gap-3">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => setShowExitDialog(true)}
            className="text-gray-500 hover:text-gray-900"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          <h1 className="text-xl font-semibold text-gray-900">
            {albumTitle || "앨범 편집"}
          </h1>
          <Button
            variant="ghost"
            size="icon"
            onClick={openRecordEditDialog}
            className="text-gray-400 hover:text-gray-900"
          >
            <Pencil className="h-4 w-4" />
          </Button>
        </div>
        <Button
          onClick={handleSaveAll}
          disabled={isSaving || !isDirty}
          className="min-w-[100px]"
        >
          {isSaving ? (
            <>
              <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> 저장 중...
            </>
          ) : (
            <>
              <Save className="mr-2 h-4 w-4" /> 저장
            </>
          )}
        </Button>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Left: Preview */}
        <div className="w-[500px] shrink-0 border-r border-gray-200 bg-gray-50">
          <AlbumPreview3D
            frontCover={frontCover}
            bio={bio}
            timeline={timeline}
            textColor={backTextColor}
            bgColor={backBgColor}
            keyColor={backKeyColor}
          />
        </div>

        {/* Right: Editor */}
        <div className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-2xl p-8">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Tabs defaultValue="front" className="w-full">
                <TabsList className="mb-8 h-12 w-full rounded-lg border border-gray-200 bg-gray-100 p-1">
                  <TabsTrigger
                    value="front"
                    className="flex-1 gap-2 rounded-md text-base font-semibold data-[state=active]:bg-[#000000] data-[state=active]:text-white data-[state=active]:shadow-md"
                  >
                    <BookOpen className="h-5 w-5" />
                    앞면
                  </TabsTrigger>
                  <TabsTrigger
                    value="back"
                    className="flex-1 gap-2 rounded-md text-base font-semibold data-[state=active]:bg-[#000000] data-[state=active]:text-white data-[state=active]:shadow-md"
                  >
                    <BookOpenCheck className="h-5 w-5" />
                    뒷면
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="front">
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
                </TabsContent>

                <TabsContent value="back">
                  <p className="mb-4 text-sm text-gray-500">
                    뒷면은 생애문 또는 타임라인을 선택할 수 있습니다.
                  </p>

                  {/* Color Pickers */}
                  <div className="mb-6 flex items-center gap-6 rounded-lg border border-gray-200 bg-gray-50 px-4 py-3">
                    <label className="flex items-center gap-2 text-xs text-gray-500">
                      배경
                      <input
                        type="color"
                        value={backBgColor || "#ffffff"}
                        onChange={(e) => setBackBgColor(e.target.value)}
                        className="h-7 w-7 cursor-pointer rounded border border-gray-300 bg-transparent p-0.5"
                      />
                    </label>
                    <label className="flex items-center gap-2 text-xs text-gray-500">
                      텍스트
                      <input
                        type="color"
                        value={backTextColor}
                        onChange={(e) => setBackTextColor(e.target.value)}
                        className="h-7 w-7 cursor-pointer rounded border border-gray-300 bg-transparent p-0.5"
                      />
                    </label>
                    <label className="flex items-center gap-2 text-xs text-gray-500">
                      포인트
                      <input
                        type="color"
                        value={backKeyColor}
                        onChange={(e) => setBackKeyColor(e.target.value)}
                        className="h-7 w-7 cursor-pointer rounded border border-gray-300 bg-transparent p-0.5"
                      />
                    </label>
                  </div>

                  <Tabs defaultValue="bio" className="w-full">
                    <TabsList className="mb-6 h-10 w-fit rounded-full border border-gray-200 bg-gray-100 p-1">
                      <TabsTrigger
                        value="bio"
                        className="gap-1.5 rounded-full px-4 text-sm font-medium text-gray-500 data-[state=active]:bg-black data-[state=active]:text-white data-[state=active]:shadow-sm"
                      >
                        <FileText className="h-3.5 w-3.5" />
                        생애문
                      </TabsTrigger>
                      <TabsTrigger
                        value="timeline"
                        className="gap-1.5 rounded-full px-4 text-sm font-medium text-gray-500 data-[state=active]:bg-black data-[state=active]:text-white data-[state=active]:shadow-sm"
                      >
                        <Clock className="h-3.5 w-3.5" />
                        타임라인
                      </TabsTrigger>
                    </TabsList>

                    <TabsContent value="bio">
                      <BioEditor
                        ref={bioRef}
                        record_id={record_id}
                        bio={bio}
                        onBioChange={setBio}
                        initialBio={initialState.current.bio}
                      />
                    </TabsContent>

                    <TabsContent value="timeline">
                      <TimelineEditor
                        ref={timelineRef}
                        record_id={record_id}
                        timeline={timeline}
                        onTimelineChange={setTimeline}
                        initialTimeline={initialState.current.timeline}
                      />
                    </TabsContent>
                  </Tabs>
                </TabsContent>
              </Tabs>
            </motion.div>
          </div>
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
              className="mx-4 w-full max-w-sm rounded-xl bg-white p-6 shadow-xl"
            >
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
                  <label className="mb-1 block text-xs font-medium text-gray-500">
                    Google Photo URL
                  </label>
                  <input
                    type="text"
                    value={editGooglePhotoUrl}
                    onChange={(e) => setEditGooglePhotoUrl(e.target.value)}
                    placeholder="https://photos.google.com/..."
                    className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus:border-gray-500"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-500">
                    iCloud URL
                  </label>
                  <input
                    type="text"
                    value={editIcloudUrl}
                    onChange={(e) => setEditIcloudUrl(e.target.value)}
                    placeholder="https://icloud.com/..."
                    className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus:border-gray-500"
                  />
                </div>
                <div>
                  <label className="mb-1 block text-xs font-medium text-gray-500">
                    Mybox URL
                  </label>
                  <input
                    type="text"
                    value={editMyboxUrl}
                    onChange={(e) => setEditMyboxUrl(e.target.value)}
                    placeholder="https://mybox.naver.com/..."
                    className="w-full rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 outline-none placeholder:text-gray-400 focus:border-gray-500"
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
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Index;
