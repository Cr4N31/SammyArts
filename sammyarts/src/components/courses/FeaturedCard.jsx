import { motion } from "motion/react";
import PriceTag from "./PriceTag";
import BuyButton from "./BuyButton";

function FeaturedCard({ course, large = false, onBuy, index = 0 }) {
  return (
    <motion.article
      initial={{ opacity: 0, y: 32 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-60px" }}
      transition={{ duration: 0.8, delay: index * 0.12, ease: "easeOut" }}
      className={`group relative isolate flex min-h-[26rem] flex-col justify-end overflow-hidden lg:min-h-[32rem] ${
        large ? "lg:col-span-2" : ""
      }`}
    >
      <img
        src={course.image}
        alt=""
        loading="lazy"
        className="absolute inset-0 -z-20 h-full w-full object-cover transition-transform duration-[1200ms] ease-out group-hover:scale-105"
      />
      <div className="absolute inset-0 -z-10 bg-gradient-to-t from-brand via-brand/50 to-transparent" />

      <div className="flex flex-col gap-5 p-6 md:p-8">
        <p className="text-[0.65rem] uppercase tracking-[0.14em] opacity-70">
          {course.type === "mentorship" ? "Mentorship" : "Course"} ·{" "}
          {course.duration}
        </p>

        <h3
          className={`font-serif font-semibold leading-[1] tracking-[-0.03em] ${
            large ? "text-4xl md:text-5xl" : "text-2xl md:text-3xl"
          }`}
        >
          {course.title}
        </h3>

        <div className="flex flex-wrap items-center justify-between gap-4">
          <PriceTag
            price={course.price}
            billing={course.billing}
            size={large ? "lg" : "md"}
          />
          <BuyButton onClick={() => onBuy(course)} />
        </div>
      </div>
    </motion.article>
  );
}

export default FeaturedCard;
