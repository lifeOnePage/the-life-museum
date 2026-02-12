import { motion } from "framer-motion";

// interface AlbumPreviewProps {
//   frontCover: string | null;
//   backCover: {
//     bio: string;
//     timeline: { year: string; event: string }[];
//   };
//   albumTitle: string;
//   artistName: string;
// }

const AlbumPreview = ({ frontCover, backCover, albumTitle, artistName }) => {
  return (
    <div className="flex flex-col items-center gap-8 px-6 py-8">
      <h2 className="font-body text-muted-foreground text-sm tracking-[0.2em] uppercase">
        미리보기
      </h2>

      {/* Front Cover */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card group relative h-72 w-72 overflow-hidden rounded-lg shadow-2xl"
      >
        {frontCover ? (
          <img
            src={frontCover}
            alt="앨범 앞면"
            className="h-full w-full object-cover"
          />
        ) : (
          <div className="from-secondary to-card flex h-full w-full flex-col items-center justify-center gap-3 bg-linear-to-br">
            {/* <div className="border-muted-foreground/30 flex h-20 w-20 items-center justify-center rounded-full border-2 border-dashed">
              <span className="text-muted-foreground/50 text-3xl">♪</span>
            </div> */}
            <p className="text-muted-foreground/50 text-xs">커버 이미지</p>
          </div>
        )}
        {(albumTitle || artistName) && (
          <div className="absolute right-0 bottom-0 left-0 bg-linear-to-t from-black/80 to-transparent p-4">
            <p className="font-display text-lg font-semibold text-white">
              {albumTitle || "앨범 제목"}
            </p>
            {/* <p className="text-foreground/70 text-xs">
              {artistName || "아티스트"}
            </p> */}
          </div>
        )}
        <div className="bg-primary/80 text-primary-foreground absolute top-2 right-2 rounded-full px-2 py-0.5 text-[10px] font-medium">
          앞면
        </div>
      </motion.div>

      {/* Back Cover */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="bg-card relative h-72 w-72 overflow-hidden rounded-lg shadow-2xl"
      >
        <div className="from-secondary to-card flex h-full w-full flex-col overflow-y-auto bg-linear-to-br p-5">
          {backCover.bio ? (
            <div className="mb-4">
              <p className="text-foreground/60 mb-2 text-[10px] tracking-widest uppercase">
                생애문
              </p>
              <p className="text-foreground/80 line-clamp-4 text-xs leading-relaxed">
                {backCover.bio}
              </p>
            </div>
          ) : (
            <div className="mb-4 flex flex-1 items-center justify-center">
              <p className="text-muted-foreground/40 text-xs">뒷면 콘텐츠</p>
            </div>
          )}

          {backCover.timeline.length > 0 && (
            <div className="mt-auto">
              <p className="text-foreground/60 mb-2 text-[10px] tracking-widest uppercase">
                타임라인
              </p>
              <div className="space-y-1.5">
                {backCover.timeline.slice(0, 4).map((item, i) => (
                  <div key={i} className="flex gap-2 text-[10px]">
                    <span className="text-primary shrink-0 font-semibold">
                      {item.year}
                    </span>
                    <span className="text-foreground/70">{item.event}</span>
                  </div>
                ))}
                {backCover.timeline.length > 4 && (
                  <p className="text-muted-foreground/40 text-[10px]">
                    +{backCover.timeline.length - 4}개 더
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
        <div className="bg-primary/80 text-primary-foreground absolute top-2 right-2 rounded-full px-2 py-0.5 text-[10px] font-medium">
          뒷면
        </div>
      </motion.div>
    </div>
  );
};

export default AlbumPreview;
