"use client";

import { use, useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Image, FileText, Clock } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./components/ui/tabs";
import AlbumPreview from "./components/AlbumPreview";
import CoverImageEditor from "./components/CoverImageEditor";
import BioEditor from "./components/BioEditor";
import TimelineEditor from "./components/TimelineEditor";

const Index = ({ params }) => {
  const { record_id } = use(params);
  const [isLoading, setIsLoading] = useState(true);
  const [frontCover, setFrontCover] = useState(null);
  const [albumTitle, setAlbumTitle] = useState("");
  const [artistName, setArtistName] = useState("");
  const [bio, setBio] = useState("");
  const [mood, setMood] = useState("");
  const [timeline, setTimeline] = useState([]);

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

          // Cover Image
          if (data.coverImage?.url) {
            setFrontCover(data.coverImage.url);
          }

          // Title & Subtitle
          setAlbumTitle(data.title || "");
          setArtistName(data.subtitle || "");

          // Lifestory
          if (data.lifestory) {
            setBio(data.lifestory.content || "");
            setMood(data.lifestory.mood || "");
          }

          // Timeline - transform API format to editor format
          if (data.timeline?.events) {
            const transformedTimeline = data.timeline.events.map((event) => ({
              year: event.timestamp
                ? new Date(event.timestamp).getFullYear().toString()
                : "",
              event: `${event.title}${event.description ? ` - ${event.description}` : ""}`,
            }));
            setTimeline(transformedTimeline);
          }
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

  const handleCoverSave = (data) => {
    console.log("커버 이미지 저장 완료:", data);
  };

  const handleCoverCancel = () => {
    console.log("커버 이미지 편집 취소");
  };

  const handleBioSave = (data) => {
    console.log("생애문 저장 완료:", data);
  };

  const handleBioCancel = () => {
    console.log("생애문 편집 취소");
  };

  const handleTimelineSave = (data) => {
    console.log("타임라인 저장 완료:", data);
  };

  const handleTimelineCancel = () => {
    console.log("타임라인 편집 취소");
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
      <header className="flex items-center gap-3 border-b border-gray-200 px-6 py-4">
        <h1 className="text-xl font-semibold text-gray-900">{albumTitle || "앨범 편집"}</h1>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Left: Preview */}
        <div className="w-[400px] shrink-0 overflow-y-auto border-r border-gray-200 bg-gray-50">
          <AlbumPreview
            frontCover={frontCover}
            backCover={{ bio, timeline }}
            albumTitle={albumTitle}
            artistName={artistName}
          />
        </div>

        {/* Right: Editor */}
        <div className="flex-1 overflow-y-auto">
          <div className="mx-auto max-w-2xl p-8">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
            >
              <Tabs defaultValue="cover" className="w-full">
                <TabsList className="mb-8 w-full border border-gray-200 bg-gray-100">
                  <TabsTrigger
                    value="cover"
                    className="flex-1 gap-2 data-[state=active]:bg-[#000000] data-[state=active]:text-white"
                  >
                    <Image className="h-4 w-4" />
                    커버 이미지
                  </TabsTrigger>
                  <TabsTrigger
                    value="bio"
                    className="flex-1 gap-2 data-[state=active]:bg-[#000000] data-[state=active]:text-white"
                  >
                    <FileText className="h-4 w-4" />
                    생애문
                  </TabsTrigger>
                  <TabsTrigger
                    value="timeline"
                    className="flex-1 gap-2 data-[state=active]:bg-[#000000] data-[state=active]:text-white"
                  >
                    <Clock className="h-4 w-4" />
                    타임라인
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="cover">
                  <CoverImageEditor
                    record_id={record_id}
                    onImageGenerated={setFrontCover}
                    onTitleChange={setAlbumTitle}
                    onArtistChange={setArtistName}
                    albumTitle={albumTitle}
                    artistName={artistName}
                    frontCover={frontCover}
                    onSave={handleCoverSave}
                    onCancel={handleCoverCancel}
                  />
                </TabsContent>

                <TabsContent value="bio">
                  <BioEditor
                    record_id={record_id}
                    bio={bio}
                    onBioChange={setBio}
                    initialMood={mood}
                    onSave={handleBioSave}
                    onCancel={handleBioCancel}
                  />
                </TabsContent>

                <TabsContent value="timeline">
                  <TimelineEditor
                    record_id={record_id}
                    timeline={timeline}
                    onTimelineChange={setTimeline}
                    onSave={handleTimelineSave}
                    onCancel={handleTimelineCancel}
                  />
                </TabsContent>
              </Tabs>
            </motion.div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
