import { useRef, useState } from "react";
import {
  motion,
  useScroll,
  useSpring,
  useTransform,
  useReducedMotion,
} from "motion/react";

const EASE = [0.16, 1, 0.3, 1]; // easeOutExpo, long soft landing
const MotionDiv = motion.div;

const ArrowUpRight = ({ className = "w-3 h-3" }) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    <path d="M7 17L17 7M8 7h9v9" />
  </svg>
);

const ImageCell = ({ label, src }) => {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div className="grid h-full w-full place-items-center border border-dashed border-border bg-surface/70 text-xs text-muted">
        {label}
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={label}
      loading="eager"
      decoding="async"
      draggable={false}
      onError={() => setFailed(true)}
      className="block h-full w-full select-none object-cover"
    />
  );
};

/**
 * Wraps any asset with:
 *  - outer layer: moves up as you scroll (speed = how many px it travels)
 *  - inner layer: fades up on load (delay = stagger)
 */
const Item = ({
  children,
  progress,
  speed = 80,
  delay = 0,
  className = "",
}) => {
  const reduce = useReducedMotion();
  const y = useTransform(progress, [0, 1], [0, reduce ? 0 : -speed]);

  return (
    <MotionDiv
      style={{ y, willChange: "transform" }}
      className={`transform-gpu ${className}`}
    >
      <MotionDiv
        className="h-full"
        initial={{ opacity: 0, y: reduce ? 0 : 28 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{
          opacity: { duration: 0.8, delay, ease: "easeOut" },
          y: { duration: 1.4, delay, ease: EASE },
        }}
      >
        {children}
      </MotionDiv>
    </MotionDiv>
  );
};

// Placeholder copy, replace with the real lines
const tagline = [
  "Hand finished.",
  "Raw materials.",
  "Honest craft.",
  "Quiet depth.",
];

// Five columns, each bottom aligned. `basis` is the share of the column
// height an image takes, which is what creates the ragged tops.
const columns = [
  [
    {
      label: "Image 1",
      src: "https://images.unsplash.com/photo-1791152933480-aa6e16d4786e?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxmZWF0dXJlZC1waG90b3MtZmVlZHwyMXx8fGVufDB8fHx8fA%3D%3D",
      basis: "basis-[32%]",
      speed: 40,
    },
  ],
  [
    {
      label: "Image 2",
      src: "https://images.unsplash.com/photo-1790014415640-b937789152ce?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxmZWF0dXJlZC1waG90b3MtZmVlZHw0fHx8ZW58MHx8fHx8",
      basis: "basis-[32%]",
      speed: 70,
    },
    {
      label: "Image 3",
      src: "https://images.unsplash.com/photo-1790520781274-5b9f020f05c8?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxmZWF0dXJlZC1waG90b3MtZmVlZHwzMXx8fGVufDB8fHx8fA%3D%3D",
      basis: "basis-[20%]",
      speed: 70,
    },
  ],
  [
    {
      label: "Image 4",
      src: "https://images.unsplash.com/photo-1583258298678-04b638193ec4?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxmZWF0dXJlZC1waG90b3MtZmVlZHwyOHx8fGVufDB8fHx8fA%3D%3D",
      basis: "basis-[32%]",
      speed: 100,
    },
    {
      label: "Image 5",
      src: "https://images.unsplash.com/photo-1777236912013-3cfe7328c776?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxmZWF0dXJlZC1waG90b3MtZmVlZHw0MXx8fGVufDB8fHx8fA%3D%3D",
      basis: "basis-[32%]",
      speed: 100,
    },
  ],
  [
    { list: true, speed: 120 },
    {
      label: "Image 6",
      src: "https://images.unsplash.com/photo-1788067093758-ab07a386b2bd?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxmZWF0dXJlZC1waG90b3MtZmVlZHw1Mnx8fGVufDB8fHx8fA%3D%3D",
      basis: "basis-[46%]",
      speed: 120,
    },
  ],
  [
    {
      label: "Image 7",
      src: "https://images.unsplash.com/photo-1790619719523-43ba16a2303e?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxmZWF0dXJlZC1waG90b3MtZmVlZHw2NHx8fGVufDB8fHx8fA%3D%3D",
      basis: "basis-[24%]",
      speed: 150,
    },
    {
      label: "Image 8",
      src: "https://images.unsplash.com/photo-1578301978018-3005759f48f7?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8N3x8YXJ0fGVufDB8fDB8fHww",
      basis: "basis-[50%]",
      speed: 150,
    },
    {
      label: "Image 9",
      src: "https://images.unsplash.com/photo-1579541814924-49fef17c5be5?w=400&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTJ8fGFydHxlbnwwfHwwfHx8MA%3D%3D",
      basis: "basis-[22%]",
      speed: 150,
    },
  ],
];

function Hero() {
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({
    target: ref,
    offset: ["start start", "end start"],
  });

  // Smooths out wheel steps and fast flicks on touch
  const smoothProgress = useSpring(scrollYProgress, {
    stiffness: 90,
    damping: 28,
    mass: 0.4,
    restDelta: 0.0005,
  });

  return (
    <section
      ref={ref}
      className="relative isolate min-h-screen overflow-hidden bg-brand text-text"
    >
      <div className="relative z-10 flex min-h-screen flex-col px-5 pb-6 pt-24 md:px-10 md:pb-10 md:pt-28">
        <div className="flex flex-1 flex-col justify-between gap-10 md:relative md:block md:min-h-[720px]">
          {/* Text block */}
          <div className="flex flex-col gap-5 md:absolute md:left-0 md:top-0 md:z-10 md:max-w-[40%] md:gap-6">
            <Item progress={smoothProgress} speed={40} delay={0.2}>
              <h1 className="font-serif text-4xl leading-[0.98] tracking-[-0.03em] text-text md:text-[clamp(2.25rem,4.6vw,4.25rem)]">
                Raw Materials.
                <br />
                <em className="italic text-accent">Pure Intention.</em>
              </h1>
            </Item>

            <Item progress={smoothProgress} speed={55} delay={0.3}>
              <p className="max-w-xs text-xs leading-relaxed text-muted md:text-sm">
                Discover exclusive, hand-crafted pieces shaped from raw
                materials and deep intention only at SammyArts' annual showcase.
              </p>
            </Item>

            <Item progress={smoothProgress} speed={65} delay={0.4}>
              <a
                href="#gallery"
                className="inline-flex w-fit items-center gap-3 rounded-full bg-accent px-6 py-3 text-[0.7rem] uppercase tracking-[0.2em] text-brand transition-colors duration-300 hover:bg-bg hover:border-accent hover:border hover:text-accent"
              >
                View Gallery
                <span aria-hidden="true">&rarr;</span>
              </a>
            </Item>
          </div>

          {/* Image columns */}
          <div className="grid h-[48svh] min-h-[320px] grid-cols-5 gap-2 md:absolute md:inset-0 md:h-auto md:min-h-0 md:gap-3">
            {columns.map((col, c) => (
              <div
                key={c}
                className="flex h-full min-h-0 flex-col justify-end gap-2 md:gap-3"
              >
                {col.map((cell, r) =>
                  cell.list ? (
                    <Item
                      key="tagline"
                      progress={smoothProgress}
                      speed={cell.speed}
                      delay={0.3 + c * 0.1 + r * 0.08}
                      className="hidden shrink-0 md:block"
                    >
                      <ul className="space-y-2 pb-1 text-xs text-muted">
                        {tagline.map((line) => (
                          <li key={line} className="flex items-center gap-2">
                            <ArrowUpRight className="h-3 w-3 shrink-0 text-accent" />
                            {line}
                          </li>
                        ))}
                      </ul>
                    </Item>
                  ) : (
                    <Item
                      key={cell.label}
                      progress={smoothProgress}
                      speed={cell.speed}
                      delay={0.3 + c * 0.1 + r * 0.08}
                      className={`min-h-0 ${cell.basis}`}
                    >
                      <ImageCell label={cell.label} src={cell.src} />
                    </Item>
                  ),
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

export default Hero;
