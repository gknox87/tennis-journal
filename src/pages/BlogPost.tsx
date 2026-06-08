import { useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { getPostBySlug, getRelatedPosts, type BlogPost as BlogPostType } from "./blogData";
import { Calendar, Clock, ArrowLeft, BookOpen, TrendingUp, Share2, ArrowRight } from "lucide-react";

const SPORT_IMAGES: Record<string, string> = {
  PADEL: "https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?w=1200&q=80",
  TENNIS: "https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=1200&q=80",
  TABLETENNIS: "https://images.unsplash.com/photo-1617083934555-ac8d96a87825?w=1200&q=80",
  BADMINTON: "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=1200&q=80",
  WEIGHTLIFTING: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=1200&q=80",
  CYCLING: "https://images.unsplash.com/photo-1541625602330-2277a4c46182?w=1200&q=80",
  SWIMMING: "https://images.unsplash.com/photo-1560090995-01632a28895b?w=1200&q=80",
  ATHLETICS: "https://images.unsplash.com/photo-1535743684570-1947246e12f5?w=1200&q=80",
  GENERAL: "https://images.unsplash.com/photo-1517649763962-0c623066013b?w=1200&q=80",
};

const SPORT_COLORS: Record<string, { bg: string; text: string; border: string }> = {
  PADEL:     { bg: "bg-amber-50",  text: "text-amber-700",  border: "border-amber-200"  },
  TENNIS:    { bg: "bg-green-50",  text: "text-green-700",  border: "border-green-200"  },
  TABLETENNIS:{ bg: "bg-blue-50",  text: "text-blue-700",   border: "border-blue-200"   },
  BADMINTON: { bg: "bg-purple-50", text: "text-purple-700", border: "border-purple-200" },
  WEIGHTLIFTING:{ bg: "bg-red-50", text: "text-red-700",    border: "border-red-200"    },
  CYCLING:   { bg: "bg-orange-50", text: "text-orange-700", border: "border-orange-200" },
  SWIMMING:  { bg: "bg-cyan-50",  text: "text-cyan-700",   border: "border-cyan-200"   },
  ATHLETICS: { bg: "bg-yellow-50",text: "text-yellow-700", border: "border-yellow-200" },
  GENERAL:   { bg: "bg-slate-50", text: "text-slate-700",   border: "border-slate-200"   },
};

function getSportImage(sport: string): string {
  return SPORT_IMAGES[sport.toUpperCase().replace(" ", "")] || SPORT_IMAGES["GENERAL"];
}

function getSportColor(sport: string) {
  return SPORT_COLORS[sport.toUpperCase().replace(" ", "")] || SPORT_COLORS["GENERAL"];
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
      <div className="min-h-full bg-gradient-to-br from-blue-50 via-white to-purple-50 flex items-center justify-center px-4 overflow-y-auto pb-24 pt-16">
        <div className="text-center max-w-md">
          <BookOpen className="w-16 h-16 text-[#111827]/10 mx-auto mb-4" />
          <h1 className="text-2xl font-black text-[#111827] mb-2">Post not found</h1>
          <p className="text-[#111827]/40 mb-6">This blog post does not exist or may have been moved.</p>
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
  const sportColor = getSportColor(post.sport);

  // Parse headings and inject IDs for anchor links
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
    <div className="min-h-full bg-gradient-to-br from-blue-50 via-white to-purple-50 text-[#111827] font-sans antialiased pt-16">
      {/* Sticky nav */}
      <div className="border-b border-[#e5e7eb] bg-white/90 backdrop-blur-sm sticky top-0 z-10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between">
          <Link
            to="/blog"
            className="flex items-center gap-2 text-[#111827]/60 hover:text-[#3b82f6] transition text-sm font-medium"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Blog
          </Link>
          <div className="flex items-center gap-2 text-[#111827]/40 text-sm">
            <BookOpen className="w-4 h-4" />
            Article
          </div>
        </div>
      </div>

      {/* Hero — sport-colored header band */}
      <div className={`${sportColor.bg} border-b-4 ${sportColor.border}`}>
        <div className="max-w-3xl mx-auto px-4 sm:px-6 pt-10 pb-8">
          <div className="flex items-center gap-3 mb-5">
            <span className="text-3xl">{post.sportIcon}</span>
            <span className={`px-3 py-1 ${sportColor.bg} ${sportColor.text} border ${sportColor.border} rounded-full text-xs font-bold uppercase tracking-wider`}>
              {post.sport}
            </span>
          </div>
          <h1 className="font-black tracking-tight text-3xl sm:text-4xl lg:text-5xl leading-tight mb-4 text-left">
            {post.title}
          </h1>
          <p className="text-[#111827]/55 text-lg leading-relaxed mb-5 text-left">
            {post.description}
          </p>
          <div className="flex items-center gap-5 text-sm text-[#111827]/40 font-medium text-left">
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

      {/* Content area */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pb-16">
        <div className="lg:grid lg:grid-cols-[1fr_260px] lg:gap-16">
          {/* Article body */}
          <article className="min-w-0 bg-white rounded-2xl border-2 border-[#e5e7eb] p-6 sm:p-10 mt-8 text-left">
            <style>{`
              .blog-prose { text-align: left; }
              .blog-prose h2 { font-size: 1.375rem; font-weight: 800; color: #111827; margin: 2.25rem 0 0.875rem; padding-bottom: 0.5rem; border-bottom: 2px solid #e5e7eb; }
              .blog-prose h3 { font-size: 1.125rem; font-weight: 700; color: #1f2937; margin: 1.75rem 0 0.5rem; padding-left: 1rem; border-left: 3px solid #3b82f6; }
              .blog-prose p { color: #374151; line-height: 1.85; margin: 0 0 1.1rem; text-align: left; }
              .blog-prose li { color: #374151; line-height: 1.75; margin-bottom: 0.5rem; text-align: left; }
              .blog-prose strong { color: #111827; font-weight: 600; }
              .blog-prose em { color: #4b5563; font-style: italic; }
              .blog-prose a { color: #3b82f6; text-decoration: none; font-weight: 500; }
              .blog-prose a:hover { text-decoration: underline; }
              .blog-prose blockquote { border-left: 4px solid #3b82f6; padding: 0.75rem 1.25rem; background: #f0f7ff; border-radius: 0 8px 8px 0; margin: 1.5rem 0; font-style: italic; color: #1f2937; }
              .blog-prose ul { margin: 0.75rem 0 1rem 1.25rem; }
              .blog-prose ol { margin: 0.75rem 0 1rem 1.5rem; }
              .blog-prose hr { border-color: #e5e7eb; margin: 2rem 0; }
            `}</style>

            <div className="text-base text-[#111827]/60 leading-relaxed mb-8 pb-8 border-b-2 border-[#e5e7eb] text-left">
              Structured reflection is the fastest way to turn match experience into lasting improvement.
              This guide gives you the framework — adapt it to your sport and your game.
            </div>

            <div
              className="blog-prose"
              dangerouslySetInnerHTML={{ __html: contentWithIds }}
            />
          </article>

          {/* Sidebar */}
          <aside className="hidden lg:block mt-8 space-y-5">
            {headings.length > 0 && (
              <div className="bg-white border-2 border-[#e5e7eb] rounded-xl p-5 sticky top-20">
                <h3 className="font-bold text-xs uppercase tracking-wider text-[#111827]/40 mb-4 flex items-center gap-2">
                  <BookOpen className="w-3.5 h-3.5" />
                  In this article
                </h3>
                <nav className="space-y-2.5">
                  {headings.map((h, i) => (
                    <a
                      key={i}
                      href={`#${h.id}`}
                      className={`block text-sm leading-snug text-[#111827]/50 hover:text-[#3b82f6] transition text-left ${
                        h.level === 3 ? "pl-4" : ""
                      }`}
                    >
                      {h.text}
                    </a>
                  ))}
                </nav>
              </div>
            )}

            <div className="bg-white border-2 border-[#e5e7eb] rounded-xl p-5">
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
          <div className="mt-16 pt-12 border-t-2 border-[#e5e7eb]">
            <h2 className="text-2xl font-black tracking-tight mb-8 flex items-center gap-2 text-[#111827]">
              <TrendingUp className="w-5 h-5 text-[#3b82f6]" />
              Related Articles
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {related.map((rp) => {
                const rpColor = getSportColor(rp.sport);
                return (
                  <Link
                    key={rp.slug}
                    to={`/blog/${rp.slug}`}
                    className="group p-5 rounded-xl bg-white border-2 border-[#e5e7eb] hover:border-[#3b82f6] hover:shadow-lg transition text-left"
                  >
                    <div className="flex items-center gap-2 mb-3">
                      <span className="text-xl">{rp.sportIcon}</span>
                      <span className="text-xs font-bold uppercase tracking-wider text-[#111827]/40">
                        {rp.sport}
                      </span>
                    </div>
                    <h3 className="font-bold text-[#111827] leading-snug mb-3 group-hover:text-[#3b82f6] transition text-base line-clamp-3">
                      {rp.title}
                    </h3>
                    <div className="flex items-center gap-1.5 mt-auto pt-2 text-xs text-[#111827]/40">
                      <Clock className="w-3 h-3" />
                      {rp.readTime} min read
                    </div>
                  </Link>
                );
              })}
            </div>
          </div>
        )}

        {/* CTA */}
        <div className="mt-16 bg-gradient-to-r from-[#3b82f6] to-[#2563eb] rounded-2xl p-8 sm:p-10 text-center">
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight mb-3 text-white">
            Start your performance journal free →
          </h2>
          <p className="text-white/70 text-base mb-6">
            Join athletes who track, reflect, and improve with Sports Journal.
          </p>
          <a
            href="https://hub.sportsjournal.app/register"
            className="inline-flex items-center px-6 py-3 bg-white text-[#3b82f6] rounded-xl font-bold hover:bg-[#f8fafc] transition shadow-lg"
          >
            Get started free — no card needed
          </a>
        </div>
      </div>
    </div>
  );
}

export default BlogPost;
