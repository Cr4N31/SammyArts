// Placeholder posts. Replace titles, copy, authors, and images with real ones.
// Exactly one post should have `featured: true`, it becomes the big card on top.
// `slug` becomes the link, for example /blog/why-we-work-with-raw-clay.
const art = (w, h, bg, fg, text) =>
  `https://placehold.co/${w}x${h}/${bg}/${fg}?text=${encodeURIComponent(text)}`;

export const blogPosts = [
  {
    id: 1,
    slug: "why-we-work-with-raw-clay",
    featured: true,
    title: "Why we work with raw clay, and what it teaches you",
    excerpt:
      "Before the glaze, the kiln, or the showcase, there is a lump of earth and a pair of hands. A look at the slow habits behind every piece we make.",
    author: "Sammy",
    date: "2026-10-02",
    img: art(1800, 1000, "3b2a22", "c9733a", "Raw clay"),
  },
  {
    id: 2,
    slug: "choosing-your-first-mentor",
    title: "Choosing your first mentor",
    excerpt:
      "What to look for in someone who will critique your work honestly, and what to bring to the first session.",
    author: "Amara Obi",
    date: "2026-09-28",
    img: art(1200, 800, "5a3b2a", "e8b48a", "First mentor"),
  },
  {
    id: 3,
    slug: "inside-the-annual-showcase",
    title: "Inside the annual showcase",
    excerpt:
      "Months of preparation, a single weekend. How the pieces are chosen, hung, and lit.",
    author: "Sammy",
    date: "2026-09-21",
    img: art(1200, 800, "2a1f1b", "f78e48", "The showcase"),
  },
  {
    id: 4,
    slug: "glazing-101",
    title: "Glazing 101",
    excerpt:
      "A plain introduction to glazes, firing temperatures, and the mistakes everyone makes once.",
    author: "Tunde Bello",
    date: "2026-09-14",
    img: art(1200, 800, "8a5a3a", "f6ede6", "Glazing"),
  },
  {
    id: 5,
    slug: "reading-a-canvas",
    title: "How to read a canvas",
    excerpt:
      "Learning to see composition, weight, and light before you pick up a brush.",
    author: "Amara Obi",
    date: "2026-09-07",
    img: art(1200, 800, "1c1512", "e8b48a", "Reading a canvas"),
  },
  {
    id: 6,
    slug: "studio-notes-october",
    title: "Studio notes: October",
    excerpt:
      "What is on the shelves, what just came out of the kiln, and what we are still arguing about.",
    author: "Sammy",
    date: "2026-10-05",
    img: art(1200, 800, "c9733a", "120d0d", "Studio notes"),
  },
  {
    id: 7,
    slug: "how-we-price-commissions",
    title: "How we price commissions",
    excerpt:
      "Time, materials, and the part nobody talks about. A transparent look at what goes into a quote.",
    author: "Tunde Bello",
    date: "2026-08-30",
    img: art(1200, 800, "3b2a22", "f78e48", "Commissions"),
  },
  {
    id: 8,
    slug: "from-sketch-to-kiln",
    title: "From sketch to kiln",
    excerpt:
      "Following one vessel through every stage, from the first drawing to the final firing.",
    author: "Amara Obi",
    date: "2026-08-22",
    img: art(1200, 800, "5a3b2a", "f6ede6", "Sketch to kiln"),
  },
  {
    id: 9,
    slug: "notes-on-slow-making",
    title: "Notes on slow making",
    excerpt:
      "Why we refuse to rush, and how patience shows up in the finished work.",
    author: "Sammy",
    date: "2026-08-15",
    img: art(1200, 800, "2a1f1b", "c9733a", "Slow making"),
  },
  {
    id: 10,
    slug: "visiting-artists-this-season",
    title: "Visiting artists this season",
    excerpt:
      "Three artists are joining the studio for short residencies. Here is who they are and what they will teach.",
    author: "Tunde Bello",
    date: "2026-08-08",
    img: art(1200, 800, "8a5a3a", "120d0d", "Visiting artists"),
  },
];
