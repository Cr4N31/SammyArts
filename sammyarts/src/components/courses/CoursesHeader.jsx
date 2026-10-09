import { motion } from "motion/react";

function CoursesHeader() {
  return (
    <motion.header
      initial={{ opacity: 0, y: 24 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="mb-16 md:mb-24"
    >
      <p className="mb-4 text-xs uppercase tracking-[0.14em] opacity-60">
        Courses and mentorship
      </p>
      <h2 className="font-serif text-[clamp(2.75rem,9vw,7rem)] font-semibold italic leading-[0.9] tracking-[-0.04em]">
        Learn the <br /> craft.
      </h2>
    </motion.header>
  );
}

export default CoursesHeader;
