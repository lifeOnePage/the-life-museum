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
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./components/ui/tabs";
import { Button } from "./components/ui/button";
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
  const [isSaving, setIsSaving] = useState(false);
  const [showExitDialog, setShowExitDialog] = useState(false);

  const coverRef = useRef(null);
  const bioRef = useRef(null);
  const timelineRef = useRef(null);
  const initialState = useRef({
    frontCover: null,
    albumTitle: "",
    artistName: "",
    bio: "",
    timeline: [],
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
              year: event.timestamp
                ? new Date(event.timestamp).getFullYear().toString()
                : "",
              event: `${event.title}${event.description ? ` - ${event.description}` : ""}`,
            }));
          }

          setFrontCover(coverUrl);
          setAlbumTitle(title);
          setArtistName(subtitle);
          setBio(bioContent);
          setMood(moodValue);
          setTimeline(timelineData);

          initialState.current = {
            frontCover: coverUrl,
            albumTitle: title,
            artistName: subtitle,
            bio: bioContent,
            timeline: timelineData,
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

  const handleSaveAll = async () => {
    const isCoverDirty =
      frontCover !== initialState.current.frontCover ||
      albumTitle !== initialState.current.albumTitle ||
      artistName !== initialState.current.artistName;
    const isBioDirty = bio !== initialState.current.bio;
    const isTimelineDirty =
      JSON.stringify(timeline) !==
      JSON.stringify(initialState.current.timeline);

    if (!isCoverDirty && !isBioDirty && !isTimelineDirty) return;

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

    const results = await Promise.allSettled(promises);

    const allSucceeded = results.every(
      (r) => r.status === "fulfilled" && r.value.success,
    );

    if (allSucceeded) {
      initialState.current = {
        frontCover,
        albumTitle,
        artistName,
        bio,
        timeline: [...timeline],
      };
    } else {
      // Update only the successfully saved editors' initial state
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
          }
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
    JSON.stringify(timeline) !== JSON.stringify(initialState.current.timeline);

  const handleExit = () => {
    router.push("/library");
  };

  const handleSaveAndExit = async () => {
    await handleSaveAll();
    router.push("/library");
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
        <div className="w-[400px] shrink-0 border-r border-gray-200 bg-gray-50">
          <AlbumPreview3D
            frontCover={frontCover}
            bio={bio}
            timeline={timeline}
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
    </div>
  );
};

export default Index;
