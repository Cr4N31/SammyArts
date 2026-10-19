import { useRef } from "react";
import {
  motion,
  useAnimationFrame,
  useInView,
  useReducedMotion,
} from "motion/react";
import { services } from "../../data/service";

const EASE = [0.16, 1, 0.3, 1];
const MotionP = motion.p;
const MotionH2 = motion.h2;

const SPIN_SPEED = 7; // degrees per second, so a full turn takes about 51s
const PER_RING = 12; // slots per ring, filled by cycling through the services
const TILT = -4; // degrees; negative drops the near side, as if looking down on the ring

// Fade the left and right edges out
const EDGE_MASK =
  "linear-gradient(to right, transparent 0%, black 10%, black 90%, transparent 100%)";

const fadeUp = {
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: "-80px" },
};

const ringTransform = (angle) =>
  `translateZ(calc(var(--r) * -1)) rotateX(${TILT}deg) rotateY(${angle}deg)`;

// `phase` shifts the ring by a fraction of one step so the two rows stagger
function buildRing(offset, phase) {
  return Array.from({ length: PER_RING }, (_, i) => ({
    service: services[(i + offset) % services.length],
    angle: (360 / PER_RING) * (i + phase),
  }));
}

const RINGS = [
  {
    id: "outer",
    items: buildRing(0, 0),
    top: "24%",
    radius: "var(--ring-r)",
    size: "var(--badge)",
  },
  {
    id: "inner",
    items: buildRing(3, 0.5),
    top: "62%",
    radius: "calc(var(--ring-r) * 0.86)",
    size: "calc(var(--badge) * 0.78)",
  },
];

function ServiceRing() {
  const stageRef = useRef(null);
  const ringRefs = useRef([]);
  const angle = useRef(0);

  const inView = useInView(stageRef, { margin: "100px" });
  const reduce = useReducedMotion();

  // Written straight to the DOM, so spinning never triggers a React render
  useAnimationFrame((_, delta) => {
    if (!inView || reduce) return;
    angle.current = (angle.current - SPIN_SPEED * (delta / 1000)) % 360;
    const transform = ringTransform(angle.current);
    ringRefs.current.forEach((el) => {
      if (el) el.style.transform = transform;
    });
  });

  return (
    <section
      aria-labelledby="services-heading"
      className="relative mt-12 bg-transparent px-3 py-8 text-text md:mt-24 md:py-12"
    >
      <div className="md:px-10 px-4 mb-6 px-2 md:mb-10">
        <MotionP
          {...fadeUp}
          transition={{ duration: 0.8, ease: EASE }}
          className="mb-4 text-xs uppercase tracking-[0.3em] text-muted"
        >
          Services
        </MotionP>
        <MotionH2
          {...fadeUp}
          transition={{ duration: 1, delay: 0.1, ease: EASE }}
          id="services-heading"
          className="font-serif text-[clamp(2.75rem,8vw,6rem)] italic leading-[0.95] tracking-[-0.05em]"
        >
          Services we offer
        </MotionH2>
      </div>

      <div
        ref={stageRef}
        role="img"
        aria-label={`Our services: ${services.map((s) => s.name).join(", ")}`}
        className="relative select-none overflow-hidden"
        style={{
          maskImage: EDGE_MASK,
          WebkitMaskImage: EDGE_MASK,
          height: "clamp(13rem, 24vw, 22rem)",
          "--ring-r": "clamp(16rem, 60vw, 60rem)",
          "--badge": "clamp(2.5rem, 5.4vw, 5rem)",
        }}
      >
        <div
          className="absolute inset-0"
          style={{ perspective: "calc(var(--ring-r) * 2.2)" }}
        >
          {RINGS.map((ring, ringIndex) => (
            <div
              key={ring.id}
              ref={(el) => (ringRefs.current[ringIndex] = el)}
              aria-hidden="true"
              className="absolute left-1/2 h-0 w-0 [transform-style:preserve-3d]"
              style={{
                top: ring.top,
                "--r": ring.radius,
                "--s": ring.size,
                transform: ringTransform(0),
              }}
            >
              {ring.items.map(({ service, angle: itemAngle }, i) => (
                <div
                  key={i}
                  className="absolute left-1/2 top-1/2 flex flex-col items-center gap-1.5"
                  style={{
                    width: "calc(var(--s) * 2.4)",
                    marginLeft: "calc(var(--s) * -1.2)",
                    marginTop: "calc(var(--s) / -2)",
                    transform: `rotateY(${itemAngle}deg) translateZ(var(--r))`,
                    // Hides the far side of the ring, so text is never seen mirrored
                    backfaceVisibility: "hidden",
                    WebkitBackfaceVisibility: "hidden",
                  }}
                >
                  <span
                    className="block shrink-0 overflow-hidden rounded-full ring-1 ring-border shadow-[0_0_24px_rgba(247,142,72,0.08)]"
                    style={{ width: "var(--s)", height: "var(--s)" }}
                  >
                    <img
                      src={service.img}
                      alt=""
                      loading="lazy"
                      decoding="async"
                      draggable={false}
                      className="block h-full w-full object-contain"
                    />
                  </span>
                  <span
                    className="whitespace-nowrap rounded-full border border-border/80 bg-bg/80 px-2 py-0.5 font-medium uppercase leading-tight tracking-[0.1em] text-text"
                    style={{ fontSize: "clamp(0.45rem, 0.9vw, 0.65rem)" }}
                  >
                    {service.name}
                  </span>
                </div>
              ))}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

export default ServiceRing;
