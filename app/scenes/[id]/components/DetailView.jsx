"use client";

export default function DetailView({ item }) {
  return (
    <div className="px-4 py-4">
      <div className="flex flex-col gap-3">
        <h2 className="text-white text-[20px] font-medium">{item.title}</h2>
        <p className="text-white/70 text-[14px]">{item.date}</p>
        <p className="text-white/80 text-[14px] leading-relaxed">{item.desc}</p>
      </div>

      {/* {item.img && item.img.length > 0 && (
        <div className="mt-6">
          <div className="grid grid-cols-3 gap-2">
            {item.img.map((imgUrl, index) => (
              <div
                key={index}
                className="relative aspect-[4/3] bg-white/5 rounded-lg overflow-hidden"
              >
                <img
                  src={imgUrl}
                  alt={`${item.title} - ${index + 1}`}
                  className="w-full h-full object-cover"
                />
              </div>
            ))}
          </div>
        </div>
      )} */}
    </div>
  );
}
