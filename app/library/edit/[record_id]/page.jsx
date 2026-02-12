"use client";

import { use, useState } from "react";
import { motion } from "framer-motion";
import { Image, FileText, Clock, Disc3 } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./components/ui/tabs";
import AlbumPreview from "./components/AlbumPreview";
import CoverImageEditor from "./components/CoverImageEditor";
import BioEditor from "./components/BioEditor";
import TimelineEditor from "./components/TimelineEditor";

const Index = ({ params }) => {
  const { record_id } = use(params);
  const [frontCover, setFrontCover] = useState(null);
  const [albumTitle, setAlbumTitle] = useState("");
  const [artistName, setArtistName] = useState("");
  const [bio, setBio] = useState("");
  const [timeline, setTimeline] = useState([]);

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

  return (
    <div className="bg-background flex min-h-screen flex-col">
      {/* Header */}
      <header className="border-border flex items-center gap-3 border-b px-6 py-4">
        {/* <h1 className="font-display text-foreground text-xl font-semibold">
          LP 앨범 커버 메이커
        </h1> */}
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Left: Preview */}
        <div className="border-border bg-muted/30 w-[400px] shrink-0 overflow-y-auto border-r">
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
                    onSave={handleBioSave}
                    onCancel={handleBioCancel}
                  />
                </TabsContent>

                <TabsContent value="timeline">
                  <TimelineEditor
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
