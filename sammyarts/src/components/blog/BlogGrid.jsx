import BlogCard from "./BlogCard";

// Three columns on desktop, two on tablet, one on phones.
// Items are top aligned, so a two line title never stretches its neighbours.
function BlogGrid({ posts }) {
  return (
    <ul className="grid grid-cols-1 items-start gap-x-6 gap-y-14 md:grid-cols-2 lg:grid-cols-3 lg:gap-y-16">
      {posts.map((post) => (
        <li key={post.id}>
          <BlogCard post={post} />
        </li>
      ))}
    </ul>
  );
}

export default BlogGrid;
