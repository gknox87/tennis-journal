import { useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { getPostBySlug, getRelatedPosts, type BlogPost as BlogPostType } from "./blogData";
import { Calendar, Clock, ArrowLeft, BookOpen, TrendingUp } from "lucide-react";

function BlogPost() {
  const { slug } = useParams<{ slug: string }>();
  const post = slug ? getPostBySlug(slug) : undefined;

  useEffect(() => {
    if (post) {
      document.title = `${post.title} | Sports Journal`;
      const metaDesc = document.querySelector('meta[name="description"]');
      if (metaDesc) metaDesc.setAttribute("content", post.description);
      const canonical = document.querySelector('link[rel="canonical"]');
      if (canonical) canonical.setAttribute("href", `https://sportsjournal.app/blog/${post.slug}`);

      // Inject Article JSON-LD
      const existing = document.querySelector('script[data-type="article-schema"]');
      if (existing) existing.remove();
      const script = document.createElement("script");
      script.type = "application/ld+json";
      script.setAttribute("data-type", "article-schema");
      script.innerHTML = JSON.stringify({
        "@context": "https://schema.org",
        "@type": "Article",
        "headline": post.title,
        "description": post.description,
        "datePublished": "2026-05-27",
        "author": { "@type": "Organization", "name": "Sports Journal" },
        "publisher": { "@type": "Organization", "name": "Sports Journal", "url": "https://sportsjournal.app" },
        "image": "https://storage.googleapis.com/gpt-engineer-file-uploads/gGmCnfklxDUYZQpYJkfC3pyA0H33/social-images/social-1770551830305-Screenshot_2026-02-08_at_11.57.02.png"
      });
      document.head.appendChild(script);
    }
    return () => {
      if (post) {
        const s = document.querySelector('script[data-type="article-schema"]');
        if (s) s.remove();
      }
    };
  }, [post]);

  if (!post) {
    return (
      <div className="min-h-screen bg-white flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Post not found</h1>
          <p className="text-gray-500 mb-6">
            This blog post does not exist or may have been moved. Browse all our articles below.
          </p>
          <Link to="/blog" className="inline-flex items-center gap-2 px-5 py-2.5 bg-violet-700 text-white rounded-xl font-semibold hover:bg-violet-800 transition">
            <ArrowLeft className="w-4 h-4" />
            Back to Blog
          </Link>
        </div>
      </div>
    );
  }

  const related = getRelatedPosts(post, 3);

  // Parse headings from HTML content for table of contents
  const headings: { id: string; text: string; level: number }[] = [];
  const tempDiv = document.createElement("div");
  tempDiv.innerHTML = post.content;
  tempDiv.querySelectorAll("h2, h3").forEach((el, i) => {
    const text = el.textContent || "";
    const id = text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    headings.push({ id, text, level: parseInt(el.tagName[1]) });
  });

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans antialiased">
      {/* Hero */}
      <div className="bg-gradient-to-br from-violet-700 via-violet-800 to-orange-600 text-white">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
          <Link to="/blog" className="inline-flex items-center gap-2 text-white/80 hover:text-white transition text-sm mb-8">
            <ArrowLeft className="w-4 h-4" />
            Back to Blog
          </Link>
          <div className="flex items-center gap-3 mb-4">
            <span className="text-3xl">{post.sportIcon}</span>
            <span className="px-3 py-1 bg-white/20 rounded-full text-sm font-semibold capitalize">
              {post.sport}
            </span>
          </div>
          <h1 className="font-black tracking-tight text-3xl sm:text-4xl lg:text-5xl leading-tight mb-6">
            {post.title}
          </h1>
          <p className="text-white/90 text-lg max-w-2xl mb-6">{post.description}</p>
          <div className="flex items-center gap-5 text-sm text-white/70">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-4 h-4" />
              {post.date}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="w-4 h-4" />
              {post.readTime} min read
            </span>
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 py-10 sm:py-14">
        <div className="lg:grid lg:grid-cols-[1fr_280px] lg:gap-12">
          {/* Article Body */}
          <article>
            <div
              className="prose prose-lg max-w-none prose-headings:scroll-mt-24 prose-a:text-violet-700 prose-headings:text-gray-900 prose-p:text-gray-600 prose-li:text-gray-600"
              dangerouslySetInnerHTML={{ __html: post.content }}
            />
          </article>

          {/* Sidebar – Table of Contents (desktop only) */}
          {headings.length > 0 && (
            <aside className="hidden lg:block">
              <div className="sticky top-24">
                <h3 className="font-bold text-sm uppercase tracking-wider text-gray-400 mb-4">
                  In this article
                </h3>
                <nav className="space-y-2">
                  {headings.map((h, i) => (
                    <a
                      key={i}
                      href={`#${h.id}`}
                      className={`block text-sm leading-snug text-gray-600 hover:text-violet-700 transition ${
                        h.level === 3 ? "pl-4" : ""
                      }`}
                    >
                      {h.text}
                    </a>
                  ))}
                </nav>
              </div>
            </aside>
          )}
        </div>

        {/* Related Posts */}
        {related.length > 0 && (
          <div className="mt-16 border-t border-gray-100 pt-12">
            <h2 className="text-2xl font-black tracking-tight text-gray-900 mb-8 flex items-center gap-2">
              <TrendingUp className="w-6 h-6 text-violet-700" />
              Related Articles
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {related.map((rp) => (
                <Link
                  key={rp.slug}
                  to={`/blog/${rp.slug}`}
                  className="group bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md hover:-translate-y-0.5 transition"
                >
                  <div className="p-6">
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-xl">{rp.sportIcon}</span>
                      <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
                        {rp.sport}
                      </span>
                    </div>
                    <h3 className="font-bold text-gray-900 leading-snug mb-2 group-hover:text-violet-700 transition line-clamp-3">
                      {rp.title}
                    </h3>
                    <p className="text-sm text-gray-500 line-clamp-2">{rp.description}</p>
                    <div className="mt-4 flex items-center gap-1.5 text-xs text-gray-400">
                      <Clock className="w-3.5 h-3.5" />
                      {rp.readTime} min read
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* Bottom CTA */}
        <div className="mt-16 bg-gradient-to-r from-violet-700 to-orange-500 rounded-2xl p-8 sm:p-10 text-center text-white">
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight mb-3">
            Start your performance journal free →
          </h2>
          <p className="text-white/80 text-base mb-6">
            Join thousands of athletes who track, reflect, and improve with Sports Journal.
          </p>
          <a
            href="https://hub.sportsjournal.app/register"
            className="inline-flex items-center px-6 py-3 bg-white text-violet-700 rounded-xl font-bold hover:bg-violet-50 transition"
          >
            Get started free — no card needed
          </a>
        </div>
      </div>
    </div>
  );
}

export default BlogPost;
