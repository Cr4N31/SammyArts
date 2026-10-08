// Placeholder images. Replace each `img` with a real file or URL.
// The grid crops every image to its slot with object-cover, so any
// shape works. Export around 1200px wide for sharp results.
const art = (w, h, bg, fg, text) =>
  `https://placehold.co/${w}x${h}/${bg}/${fg}?text=${encodeURIComponent(text)}`;

export const galleryWorks = [
  {
    id: 1,
    title: "Untitled study",
    medium: "Clay",
    year: 2026,
    img: art(900, 1000, "3b2a22", "c9733a", "Untitled study"),
  },
  {
    id: 2,
    title: "Vessel",
    medium: "Stoneware",
    year: 2026,
    img: art(900, 840, "8a5a3a", "f6ede6", "Vessel"),
  },
  {
    id: 3,
    title: "Ember",
    medium: "Oak",
    year: 2025,
    img: art(900, 680, "2a1f1b", "f78e48", "Ember"),
  },
  {
    id: 4,
    title: "Slow river",
    medium: "Pigment on linen",
    year: 2025,
    img: art(900, 680, "5a3b2a", "e8b48a", "Slow river"),
  },
  {
    id: 5,
    title: "Horizon line",
    medium: "Oil on panel",
    year: 2026,
    img: art(900, 840, "c9733a", "120d0d", "Horizon line"),
  },
  {
    id: 6,
    title: "Low tide",
    medium: "Oil on linen",
    year: 2026,
    img: art(900, 1000, "1c1512", "e8b48a", "Low tide"),
  },
  {
    id: 7,
    title: "Salt",
    medium: "Plaster",
    year: 2025,
    img: art(900, 1000, "3b2a22", "f6ede6", "Salt"),
  },
  {
    id: 8,
    title: "Dusk, field",
    medium: "Pigment",
    year: 2026,
    img: art(900, 840, "5a3b2a", "f78e48", "Dusk, field"),
  },
  {
    id: 9,
    title: "Threshold",
    medium: "Charcoal",
    year: 2025,
    img: art(900, 680, "2a1f1b", "c9733a", "Threshold"),
  },
  {
    id: 10,
    title: "Long afternoon",
    medium: "Oil on panel",
    year: 2026,
    img: art(900, 680, "8a5a3a", "120d0d", "Long afternoon"),
  },
  {
    id: 11,
    title: "Kiln, first light",
    medium: "Raku",
    year: 2026,
    img: art(900, 840, "2a1f1b", "f78e48", "Kiln, first light"),
  },
  {
    id: 12,
    title: "Last firing",
    medium: "Stoneware",
    year: 2025,
    img: art(900, 1000, "c9733a", "120d0d", "Last firing"),
  },
];
