"use client";

import Reveal from "./Reveal";
import CtaButton from "./CtaButton";

const PLANS = [
  {
    credit: "Credit 1,000",
    sub: "앨범 1개",
    price: "₩10,000",
    was: null,
    per: "앨범 1개당 ₩10,000",
    badge: null,
    popular: false,
  },
  {
    credit: "Credit 3,000",
    sub: "앨범 3개",
    price: "₩24,000",
    was: "₩30,000",
    per: "앨범 1개당 ₩8,000",
    badge: "20% 할인",
    popular: true,
  },
  {
    credit: "Credit 6,000",
    sub: "앨범 6개",
    price: "₩39,000",
    was: "₩60,000",
    per: "앨범 1개당 ₩6,500 · 가장 큰 혜택",
    badge: "최대 35% 할인",
    popular: false,
  },
];

export default function SectionPricing() {
  return (
    <section className="relative w-full overflow-clip bg-black-100 text-paper">
      <div className="mx-auto max-w-[1080px] px-6 py-[clamp(90px,13vh,160px)]">
        <div className="text-center">
          <Reveal as="p" className="text-[13px] font-semibold uppercase tracking-[0.35em] text-white-200">
            Pricing
          </Reveal>
          <Reveal
            as="h2"
            delay={100}
            className="mt-4 text-[clamp(26px,3.4vw,44px)] font-bold leading-[1.2] tracking-[-0.02em]"
          >
            앨범 한 권부터, 부담 없이
          </Reveal>
        </div>

        <div className="mt-14 grid gap-5 md:grid-cols-3">
          {PLANS.map((p, i) => (
            <Reveal
              key={p.credit}
              delay={100 + i * 120}
              y={30}
              className={`relative flex flex-col rounded-2xl border p-7 ${
                p.popular
                  ? "border-white/25 bg-white/[0.06]"
                  : "border-white/10 bg-black-200/60"
              }`}
            >
              {p.popular && (
                <span className="absolute -top-3 left-1/2 -translate-x-1/2 rounded-full bg-paper px-3 py-1 text-[11px] font-bold text-black-100">
                  인기
                </span>
              )}

              <div className="flex items-center justify-between">
                <p className="text-[15px] font-semibold text-paper">{p.credit}</p>
                {p.badge && (
                  <span className="rounded-full bg-white/10 px-2.5 py-1 text-[11px] text-white-100">
                    {p.badge}
                  </span>
                )}
              </div>
              <p className="mt-1 text-[13px] text-white-200">{p.sub}</p>

              <div className="mt-7 flex items-end gap-2">
                <span className="text-[clamp(26px,3vw,34px)] font-bold tracking-[-0.02em] text-paper">
                  {p.price}
                </span>
                {p.was && <span className="mb-1.5 text-[14px] text-white-300 line-through">{p.was}</span>}
              </div>
              <p className="mt-2 text-[12px] text-white-200">{p.per}</p>

              <div className="mt-8">
                <CtaButton
                  variant={p.popular ? "solid" : "outline"}
                  className="w-full"
                >
                  시작하기
                </CtaButton>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
