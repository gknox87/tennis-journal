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
      <div className="min-h-screen bg-[#0b1d12] flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <BookOpen className="w-16 h-16 text-white/20 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">Post not found</h1>
          <p className="text-white/40 mb-6">
            This blog post does not exist or may have been moved.
          </p>
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-white/10 text-white rounded-xl font-semibold hover:bg-white/20 transition"
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
  tempDiv.querySelectorAll("h2, h3").forEach((el, i) => {
    const text = el.textContent || "";
    const id = text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    el.id = id;
    headings.push({ id, text, level: parseInt(el.tagName[1]) });
  });
  const contentWithIds = tempDiv.innerHTML;

  return (
    <div className="min-h-screen bg-[#0b1d12] text-white font-sans antialiased">
      {/* Hero with image */}
      <div className="relative">
        <div className="absolute inset-0 h-72 sm:h-80 overflow-hidden">
          <img
            src={getSportImage(post.sport)}
            alt={post.title}
            className="w-full h-full object-cover opacity-30"
          />
          <div className="absolute inset-0 bg-gradient-to-b from-[#0b1d12]/60 via-[#0b1d12]/80 to-[#0b1d12]" />
        </div>

        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 pt-8 pb-10">
          {/* Back nav */}
          <Link
            to="/blog"
            className="inline-flex items-center gap-2 text-white/50 hover:text-white transition text-sm mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Blog
          </Link>

          {/* Meta */}
          <div className="flex items-center gap-3 mb-5">
            <span className="text-3xl">{post.sportIcon}</span>
            <span className="px-3 py-1 bg-white/10 rounded-full text-sm font-semibold capitalize text-white/80">
              {post.sport}
            </span>
          </div>

          <h1 className="font-black tracking-tight text-3xl sm:text-4xl lg:text-5xl leading-tight mb-5 max-w-3xl">
            {post.title}
          </h1>

          <p className="text-white/50 text-lg max-w-2xl mb-6 leading-relaxed">
            {post.description}
          </p>

          <div className="flex items-center gap-5 text-sm text-white/40">
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
      <div className="max-w-5xl mx-auto px-4 sm:px-6 pb-16">
        <div className="lg:grid lg:grid-cols-[1fr_260px] lg:gap-16">
          {/* Article Body */}
          <article className="min-w-0">
            {/* Article intro */}
            <div className="text-lg text-white/60 leading-relaxed mb-8 pb-8 border-b border-white/10">
              Structured reflection is the fastest way to turn match experience into lasting improvement.
              This guide gives you the framework — adapt it to your sport and your game.
            </div>

            <div
              className="prose prose-lg max-w-none
                prose-headings:scroll-mt-24
                prose-headings:text-white
                prose-headings:font-black
                prose-p:text-white/70
                prose-li:text-white/70
                prose-strong:text-white
                prose-em:text-white/80
                prose-a:text-orange-400 prose-a:no-underline hover:prose-a:underline
                prose-blockquote:border-l-orange-400 prose-blockquote:text-white/60
                prose-ul:border-white/10
                prose-code:text-orange-400
                prose-pre:bg-white/5
                prose-hr:border-white/10"
              style={{
                '--tw-prose-body': 'theme(colors.white / 70%)',
                '--tw-prose-headings': 'theme(colors.white)',
              } as React.CSSProperties}
              dangerouslySetInnerHTML={{ __html: contentWithIds }}
            />
          </article>

          {/* Sidebar */}
          <aside className="hidden lg:block">
            {/* Table of Contents */}
            {headings.length > 0 && (
              <div className="sticky top-8 bg-white/5 border border-white/10 rounded-xl p-5">
                <h3 className="font-bold text-xs uppercase tracking-wider text-white/40 mb-4 flex items-center gap-2">
                  <BookOpen className="w-3.5 h-3.5" />
                  In this article
                </h3>
                <nav className="space-y-2">
                  {headings.map((h, i) => (
                    <a
                      key={i}
                      href={`#${h.id}`}
                      className={`block text-sm leading-snug text-white/50 hover:text-orange-400 transition ${
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
            <div className="mt-4 bg-white/5 border border-white/10 rounded-xl p-5">
              <h3 className="font-bold text-xs uppercase tracking-wider text-white/40 mb-3 flex items-center gap-2">
                <Share2 className="w-3.5 h-3.5" />
                Share this article
              </h3>
              <div className="flex gap-2">
                <a
                  href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(`https://sportsjournal.app/blog/${post.slug}`)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-2 px-3 bg-white/10 rounded-lg text-center text-xs font-semibold text-white/70 hover:bg-white/20 transition"
                >
                  Share
                </a>
                <a
                  href={`https://www.linkedin.com/shareArticle?mini=true&url=${encodeURIComponent(`https://sportsjournal.app/blog/${post.slug}`)}&title=${encodeURIComponent(post.title)}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-2 px-3 bg-white/10 rounded-lg text-center text-xs font-semibold text-white/70 hover:bg-white/20 transition"
                >
                  LinkedIn
                </a>
              </div>
            </div>
          </aside>
        </div>

        {/* Related Posts */}
        {related.length > 0 && (
          <div className="mt-16 pt-12 border-t border-white/10">
            <h2 className="text-2xl font-black tracking-tight mb-8 flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-orange-400" />
              Related Articles
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {related.map((rp) => (
                <Link
                  key={rp.slug}
                  to={`/blog/${rp.slug}`}
                  className="group p-5 rounded-xl bg-white/5 border border-white/10 hover:border-orange-400/40 hover:bg-white/10 transition"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <span className="text-xl">{rp.sportIcon}</span>
                    <span className="text-xs font-bold uppercase tracking-wider text-white/40">
                      {rp.sport}
                    </span>
                  </div>
                  <h3 className="font-bold text-white leading-snug mb-2 group-hover:text-orange-400 transition text-sm line-clamp-3">
                    {rp.title}
                  </h3>
                  <div className="flex items-center gap-1.5 mt-3 text-xs text-white/40">
                    <Clock className="w-3 h-3" />
                    {rp.readTime} min read
                  </div>
                </Link>
              ))}
            </div>
          </div>
        )}

        {/* CTA */}
        <div className="mt-16 bg-gradient-to-r from-[#1a2e1f] to-[#0b1d12] rounded-2xl p-8 sm:p-10 text-center border border-white/10">
          <h2 className="text-2xl sm:text-3xl font-black tracking-tight mb-3">
            Start your performance journal free →
          </h2>
          <p className="text-white/50 text-base mb-6">
            Join athletes who track, reflect, and improve with Sports Journal.
          </p>
          <a
            href="https://hub.sportsjournal.app/register"
            className="inline-flex items-center px-6 py-3 bg-orange-500 text-white rounded-xl font-bold hover:bg-orange-400 transition"
          >
            Get started free — no card needed
          </a>
        </div>
      </div>
    </div>
  );
}

export default BlogPost;