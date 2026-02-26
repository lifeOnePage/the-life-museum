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
        <div className="absolute top-2 right-2 rounded-full bg-stone-700/80 px-2 py-0.5 text-[10px] font-medium text-stone-300">
          앞면
        </div>
      </motion.div>

      {/* Back Cover */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="relative h-72 w-72 overflow-hidden rounded-lg bg-white shadow-2xl"
      >
        <div className="flex h-full w-full flex-col overflow-y-auto p-5">
          {backCover.bio ? (
            <div className="mb-3">
              <div className="mb-2 flex items-center gap-1.5">
                <div className="h-px flex-1 bg-stone-700/40" />
                <p className="shrink-0 text-[9px] tracking-[0.2em] text-stone-600/70 uppercase">
                  생애문
                </p>
                <div className="h-px flex-1 bg-stone-700/40" />
              </div>
              <p className="line-clamp-5 text-[11px] leading-[1.7] font-light text-stone-900 italic">
                {backCover.bio}
              </p>
            </div>
          ) : (
            <div className="mb-3 flex flex-1 items-center justify-center">
              <p className="text-xs text-stone-600">뒷면 콘텐츠</p>
            </div>
          )}

          {backCover.timeline.length > 0 && (
            <div className="mt-auto">
              <div className="mb-2.5 flex items-center gap-1.5">
                <div className="h-px flex-1 bg-stone-700/40" />
                <p className="shrink-0 text-[9px] tracking-[0.2em] text-stone-600/70 uppercase">
                  타임라인
                </p>
                <div className="h-px flex-1 bg-stone-700/40" />
              </div>
              <div className="relative ml-2">
                <div className="absolute top-0.5 bottom-0.5 left-[3px] w-px bg-stone-600/50" />
                <div className="space-y-2">
                  {backCover.timeline.slice(0, 4).map((item, i) => (
                    <div
                      key={i}
                      className="flex items-start gap-2.5 text-[10px]"
                    >
                      <div className="relative mt-[5px] h-[7px] w-[7px] shrink-0 rounded-full border border-amber-600/80 bg-amber-500/80" />
                      <div className="min-w-0">
                        <span className="font-semibold text-amber-500/90">
                          {item.year}
                        </span>
                        <span className="ml-1.5 text-stone-400">
                          {item.event}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
                {backCover.timeline.length > 4 && (
                  <p className="mt-1.5 pl-4 text-[9px] text-stone-600">
                    +{backCover.timeline.length - 4}개 더
                  </p>
                )}
              </div>
            </div>
          )}
        </div>
        <div className="absolute top-2 right-2 rounded-full bg-stone-700/80 px-2 py-0.5 text-[10px] font-medium text-stone-300">
          뒷면
        </div>
      </motion.div>
    </div>
  );
};

export default AlbumPreview;
