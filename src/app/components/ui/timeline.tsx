"use client";
import { useScroll, useTransform, motion } from "motion/react";
import React, { useEffect, useRef, useState } from "react";

interface TimelineEntry {
  title: string;
  content: React.ReactNode;
}

export const Timeline = ({ data }: { data: TimelineEntry[] }) => {
  const ref = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [height, setHeight] = useState(0);

  useEffect(() => {
    if (ref.current) {
      setHeight(ref.current.getBoundingClientRect().height);
    }
  }, []);

  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start 10%", "end 50%"],
  });

  const heightTransform = useTransform(scrollYProgress, [0, 1], [0, height]);
  const opacityTransform = useTransform(scrollYProgress, [0, 0.1], [0, 1]);

  return (
    <div ref={containerRef} className="relative w-full">
      <div
        ref={ref}
        className="relative mx-auto max-w-7xl px-4 pb-16 sm:px-6 lg:px-8"
      >
        {data.map((item, index) => (
          <div key={index} className="flex items-start gap-4 pt-8 md:gap-6 md:pt-12">

            {/* Dot */}
            <div className="relative z-40 mt-0.5 flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/[0.05]">
              <div className="h-2.5 w-2.5 rounded-full bg-white/50" />
            </div>

            {/* Title */}
            <h3 className="mt-1.5 w-32 md:w-40 shrink-0 text-xl font-semibold text-white">
              {item.title}
            </h3>

            {/* Content card */}
            <div className="w-full pb-8">
              <div className="rounded-2xl border border-white/[0.06] bg-white/[0.02] p-5 sm:p-6">
                {item.content}
              </div>
            </div>

          </div>
        ))}

        {/* Vertical line — positioned at dot center per breakpoint */}
        <div
          style={{ height }}
          className="absolute left-9 top-0 w-[2px] overflow-hidden
            bg-gradient-to-b from-transparent via-white/10 to-transparent
            [mask-image:linear-gradient(to_bottom,transparent_0%,black_10%,black_90%,transparent_100%)]
            sm:left-11 lg:left-[52px]"
        >
          <motion.div
            style={{ height: heightTransform, opacity: opacityTransform }}
            className="absolute inset-x-0 top-0 w-[2px] rounded-full
              bg-gradient-to-t from-purple-500 via-cyan-400 to-transparent"
          />
        </div>

      </div>
    </div>
  );
};
