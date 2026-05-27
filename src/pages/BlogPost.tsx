import { useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { getPostBySlug, getRelatedPosts, type BlogPost as BlogPostType } from "./blogData";
import { Calendar, Clock, ArrowLeft, BookOpen, TrendingUp, Share2 } from "lucide-react";

const SPORT_IMAGES: Record<string, string> = {
  PADEL: "https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?w=1200&q=80",
  TENNIS: "https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=1200&q=80",
  TABLETENNIS: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=1200&q=80",
  BADMINTON: "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=1200&q=80",
  WEIGHTLIFTING: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1200&q=80",
  CYCLING: "https://images.unsplash.com/photo-1541625602330-2277a4c46182?w=1200&q=80",
  SWIMMING: "https://images.unsplash.com/photo-1560090995-01632a28895b?w=1200&q=80",
  ATHLETICS: "https://images.unsplash.com/photo-1535743684570-1947246e12f5?w=1200&q=80",
  GENERAL: "https://images.unsplash.com/photo-1517649763962-0c623066013b?w=1200&q=80",
};

function getSportImage(sport: string): string {
  return SPORT_IMAGES[sport.toUpperCase().replace(" ", "")] || SPORT_IMAGES["GENERAL"];
}

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
        "image": getSportImage(post.sport)
      });
      document.head.appendChild(script);
    }
    return () => {
      const s = document.querySelector('script[data-type="article-schema"]');
      if (s) s.remove();
    };
  }, [post]);

  if (!post) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <BookOpen className="w-16 h-16 text-[#111827]/10 mx-auto mb-4" />
          <h1 className="text-2xl font-black text-[#111827] mb-2">Post not found</h1>
          <p className="text-[#111827]/40 mb-6">
            This blog post does not exist or may have been moved.
          </p>
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#3b82f6] text-white rounded-xl font-semibold hover:bg-[#2563eb] transition"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Blog
          </Link>
        </div>
      </div>
    );
  }

  const related = getRelatedPosts(post, 3);

  // Parse headings from HTML content and inject IDs for anchor links
  const headings: { id: string; text: string; level: number }[] = [];
  const tempDiv = document.createElement("div");
  tempDiv.innerHTML = post.content;
  tempDiv.querySelectorAll("h2, h3").forEach((el) => {
    const text = el.textContent || "";
    const id = text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    el.id = id;
    headings.push({ id, text, level: parseInt(el.tagName[1]) });
  });
  const contentWithIds = tempDiv.innerHTML;

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 text-[#111827] font-sans antialiased">
      {/* Minimal nav */}
      <div className="border-b border-[#e5e7eb] bg-white/80 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between">
          <Link
            to="/blog"
            className="flex items-center gap-2 text-[#111827]/60 hover:text-[#3b82f6] transition text-sm font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Blog
          </Link>
          <div className="hidden sm:flex items-center gap-2 text-[#111827]/40 text-sm">
            <BookOpen className="w-4 h-4" />
            Article
          </div>
        </div>
      </div>

      {/* Hero */}
      <div className="bg-white border-b border-[#e5e7eb]">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-10 pb-8">
          <div className="flex items-center gap-3 mb-4">
            <span className="text-3xl">{post.sportIcon}</span>
            <span className="px-3 py-1 bg-[#16a34a]/10 text-[#16a34a] rounded-full text-xs font-bold uppercase tracking-wider">
              {post.sport}
            </span>
          </div>

          <h1 className="font-black tracking-tight text-3xl sm:text-4xl lg:text-5xl leading-tight mb-4 text-[#111827]">
            {post.title}
          </h1>

          <p className="text-[#111827]/55 text-lg leading-relaxed mb-5">
            {post.description}
          </p>

          <div className="flex items-center gap-5 text-sm text-[#111827]/40 font-medium">
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
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pb-16">
        <div className="lg:grid lg:grid-cols-[1fr_260px] lg:gap-16">
          {/* Article Body */}
          <article className="min-w-0 bg-white rounded-2xl border border-[#e5e7eb] p-6 sm:p-10 mt-8">
            {/* Article intro */}
            <div className="text-lg text-[#111827]/60 leading-relaxed mb-8 pb-8 border-b border-[#e5e7eb]">
              Structured reflection is the fastest way to turn match experience into lasting improvement.
              This guide gives you the framework — adapt it to your sport and your game.
            </div>

            {/* Headings typed for prose plugin */}
            <style>{`
              .blog-prose h2 { font-size: 1.5rem; font-weight: 800; color: #111827; margin: 2rem 0 0.75rem; }
              .blog-prose h3 { font-size: 1.125rem; font-weight: 700; color: #111827; margin: 1.5rem 0 0.5rem; }
              .blog-prose p { color: #374151; line-height: 1.8; margin: 0 0 1rem; }
              .blog-prose li { color: #374151; line-height: 1.7; }
              .blog-prose strong { color: #111827; }
              .blog-prose em { color: #374151; }
              .blog-prose a { color: #3b82f6; text-decoration: none; }
              .blog-prose a:hover { text-decoration: underline; }
              .blog-prose blockquote { border-left: 4px solid #16a34a; padding: 0.5rem 0 0.5rem 1rem; background: #f9fafb; border-radius: 0 8px 8px 0; font-style: italic; }
              .blog-prose ul { border-radius: 8px; }
              .blog-prose hr { border-color: #e5e7eb; }
            `}</style>
            <div
              className="blog-prose"
              dangerouslySetInnerHTML={{ __html: contentWithIds }}
            />
          </article>

          {/* Sidebar */}
          <aside className="hidden lg:block mt-8 space-y-5">
            {/* Table of Contents */}
            {headings.length > 0 && (
              <div className="bg-white border border-[#e5e7eb] rounded-xl p-5 sticky top-20">
                <h3 className="font-bold text-xs uppercase tracking-wider text-[#111827]/40 mb-4 flex items-center gap-2">
                  <BookOpen className="w-3.5 h-3.5" />
                  In this article
                </h3>
                <nav className="space-y-2">
                  {headings.map((h, i) => (
                    <a
                      key={i}
                      href={`#${h.id}`}
                      className={`block text-sm leading-snug text-[#111827]/50 hover:text-[#3b82f6] transition ${
                        h.level === 3 ? "pl-4" : ""
                      }`}
                    >
                      {h.text}
                    </a>
                  ))}
                </nav>
              </div>
            )}

            {/* Share */}
            <div className="bg-white border border-[#e5e7eb] rounded-xl p-5">
              <h3 className="font-bold text-xs uppercase tracking-wider text-[#111827]/40 mb-3 flex items-center gap-2">
                <Share2 className="w-3.5 h-3.5" />
                Share this article
              </h3>
              <div className="flex gap-2">
                <a
                  href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(`https://sportsjournal.app/blog/${post.slug}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-2 px-3 bg-[#3b82f6]/10 text-[#3b82f6] rounded-lg text-center text-xs font-semibold hover:bg-[#3b82f6]/20 transition"
                >
                  Share
                </a>
                <a
                  href={`https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(`https://sportsjournal.app/blog/${post.slug}`)}&title=${encodeURIComponent(post.title)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-2 px-3 bg-[#3b82f6]/10 text-[#3b82f6] rounded-lg text-center text-xs font-semibold hover:bg-[#3b82f6]/20 transition"
                >
                  LinkedIn
                </a>
              </div>
            </div>
          </aside>
        </div>

        {/* Related Posts */}
        {related.length > 0 && (
          <div className="mt-16 pt-12 border-t border-[#e5e7eb]">
            <h2 className="text-2xl font-black tracking-tight mb-8 flex items-center gap-2 text-[#111827]">
              <TrendingUp className="w-5 h-5 text-[#3b82f6]" />
              Related Articles
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {related.map((rp) => (
                <Link
                  key={rp.slug}
                  to={`/blog/${rp.slug}`}
                  className="group p-5 rounded-xl bg-white border border-[#e5e7eb] hover:border-[#3b82f6]/40 hover:shadow-lg transition"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xl">{rp.sportIcon}</span>
                    <span className="text-xs font-bold uppercase tracking-wider text-[#111827]/40">
                      {rp.sport}
                    </span>
                  </div>
                  <h3 className="font-bold text-[#111827] leading-snug mb-2 group-hover:text-[#3b82f6] transition text-sm line-clamp-3">
                    {rp.title}
                  </h3>
                  <div className="flex items-center gap-1.5 mt-3 text-xs text-[#111827]/40">
                    <Clock className="w-3 h-3" />
                    {rp.readTime} min read
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* CTA */}
        <div className="mt-16 bg-white rounded-2xl p-8 sm:p-10 text-center border border-[#e5e7eb]">
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight mb-3 text-[#111827]">
            Start your performance journal free →
          </h2>
          <p className="text-[#111827]/50 text-base mb-6">
            Join athletes who track, reflect, and improve with Sports Journal.
          </p>
          <a
            href="https://hub.sportsjournal.app/register"
            className="inline-flex items-center px-6 py-3 bg-[#3b82f6] text-white rounded-xl font-bold hover:bg-[#2563eb] transition shadow-lg shadow-[#3b82f6]/20"
          >
            Get started free — no card needed
          </a>
        </div>
      </div>
    </div>
  );
}

export default BlogPost;
