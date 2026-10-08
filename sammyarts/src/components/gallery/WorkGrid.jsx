import WorkCard from "./WorkCard";

// Image heights repeat every six works and mirror from row to row:
// tall, medium, wide, then wide, medium, tall. Items are top aligned,
// which leaves the uneven gaps under the shorter ones.
const shapes = [
  "aspect-[9/10]",
  "aspect-[15/14]",
  "aspect-[4/3]",
  "aspect-[4/3]",
  "aspect-[15/14]",
  "aspect-[9/10]",
];

// Three columns on tablet and up, two on phones
function WorkGrid({ works, onOpen }) {
  return (
    <ul className="mx-auto grid max-w-5xl grid-cols-1 items-start gap-x-2 gap-y-12 md:grid-cols-3 md:gap-x-3 md:gap-y-16">
      {works.map((work, i) => (
        <li key={work.id}>
          <WorkCard
            work={work}
            shape={shapes[i % shapes.length]}
            onOpen={() => onOpen(i)}
          />
        </li>
      ))}
    </ul>
  );
}

export default WorkGrid;
