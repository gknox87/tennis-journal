import { Link } from "react-router-dom";
import { Clock, Calendar, ArrowRight, BookOpen, TrendingUp, ArrowUpRight } from "lucide-react";
import { blogPosts } from "./blogData";
import { useEffect } from "react";

const SPORT_IMAGES: Record<string, string> = {
  PADEL: "https://images.unsplash.com/photo-1622279457486-62dcc4a431d6?w=800&q=80",
  TENNIS: "https://images.unsplash.com/photo-1554068865-24cecd4e34b8?w=800&q=80",
  TABLETENNIS: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=800&q=80",
  BADMINTON: "https://images.unsplash.com/photo-1626224583764-f87db24ac4ea?w=800&q=80",
  WEIGHTLIFTING: "https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&q=80",
  CYCLING: "https://images.unsplash.com/photo-1541625602330-2277a4c46182?w=800&q=80",
  SWIMMING: "https://images.unsplash.com/photo-1560090995-01632a28895b?w=800&q=80",
  ATHLETICS: "https://images.unsplash.com/photo-1535743684570-1947246e12f5?w=800&q=80",
  GENERAL: "https://images.unsplash.com/photo-1517649763962-0c623066013b?w=800&q=80",
};

function getSportImage(sport: string): string {
  return SPORT_IMAGES[sport.toUpperCase().replace(" ", "")] || SPORT_IMAGES["GENERAL"];
}

function BlogIndex() {
  useEffect(() => {
    document.title = "Sports Journal Blog — Performance & Improvement Tips for Athletes";
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.setAttribute("content", "Performance journals, match reflection guides, and sport-specific training logs for athletes in padel, tennis, table tennis, badminton, cycling, swimming, and more.");
  }, []);

  const featured = blogPosts[0];
  const remaining = blogPosts.slice(1);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 text-[#111827] font-sans antialiased">
      {/* Minimal nav */}
      <div className="border-b border-[#e5e7eb] bg-white/80 backdrop-blur-sm">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-3.5 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-[#111827]/60 hover:text-[#3b82f6] transition text-sm font-medium">
            <ArrowRight className="w-4 h-4 rotate-180" />
            Back to Sports Journal
          </Link>
          <div className="flex items-center gap-2 text-[#111827]/40 text-sm">
            <BookOpen className="w-4 h-4" />
            Blog
          </div>
        </div>
      </div>

      {/* Hero */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-12 pb-10">
        <div className="inline-flex items-center gap-2 bg-[#3b82f6]/10 px-4 py-1.5 rounded-full text-sm font-semibold text-[#3b82f6] mb-6">
          <span className="w-2 h-2 rounded-full bg-[#16a34a] animate-pulse" />
          Performance & Improvement
        </div>
        <h1 className="font-black tracking-tight text-4xl sm:text-5xl lg:text-6xl mb-4">
          The Sports Journal
          <span className="block text-[#3b82f6]">Blog</span>
        </h1>
        <p className="text-[#111827]/60 text-lg sm:text-xl max-w-2xl">
          Structured reflection guides, sport-specific training logs, and performance insights for ambitious athletes.
        </p>
      </div>

      {/* Featured Post */}
      {featured && (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 pb-10">
          <Link
            to={`/blog/${featured.slug}`}
            className="group relative flex flex-col sm:flex-row gap-0 rounded-2xl overflow-hidden bg-white border border-[#e5e7eb] hover:border-[#3b82f6]/40 hover:shadow-xl transition-all duration-300"
          >
            {/* Image */}
            <div className="sm:w-72 h-48 sm:h-auto flex-shrink-0 overflow-hidden">
              <img
                src={getSportImage(featured.sport)}
                alt={featured.title}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </div>
            {/* Content */}
            <div className="flex-1 p-6 sm:p-8 flex flex-col justify-center">
              <div className="flex items-center gap-2 mb-3">
                <span className="text-2xl">{featured.sportIcon}</span>
                <span className="text-xs font-bold uppercase tracking-wider text-[#16a34a] bg-[#16a34a]/10 px-2.5 py-1 rounded-full">
                  Featured — {featured.sport}
                </span>
              </div>
              <h2 className="font-black text-xl sm:text-2xl tracking-tight mb-3 leading-snug group-hover:text-[#3b82f6] transition">
                {featured.title}
              </h2>
              <p className="text-[#111827]/55 text-sm leading-relaxed mb-4 line-clamp-2">
                {featured.description}
              </p>
              <div className="flex items-center gap-4 text-xs text-[#111827]/40 font-medium">
                <span className="flex items-center gap-1.5">
                  <Calendar className="w-3.5 h-3.5" />
                  {featured.date}
                </span>
                <span className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5" />
                  {featured.readTime} min read
                </span>
              </div>
              <div className="mt-5 flex items-center gap-1.5 text-sm font-bold text-[#3b82f6] group-hover:gap-2.5 transition-all">
                Read article
                <ArrowUpRight className="w-4 h-4" />
              </div>
            </div>
          </Link>
        </div>
      )}

      {/* All Articles */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pb-16">
        <div className="flex items-center gap-2 mb-6">
          <TrendingUp className="w-5 h-5 text-[#3b82f6]" />
          <h2 className="text-xl font-black tracking-tight">All Articles</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {remaining.map((post) => (
            <Link
              key={post.slug}
              to={`/blog/${post.slug}`}
              className="group flex flex-col rounded-xl overflow-hidden bg-white border border-[#e5e7eb] hover:border-[#3b82f6]/40 hover:shadow-lg transition-all duration-300"
            >
              {/* Image */}
              <div className="h-40 overflow-hidden">
                <img
                  src={getSportImage(post.sport)}
                  alt={post.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              </div>
              {/* Content */}
              <div className="p-5 flex flex-col flex-1">
                <div className="flex items-center gap-2 mb-2.5">
                  <span className="text-lg">{post.sportIcon}</span>
                  <span className="text-xs font-bold uppercase tracking-wider text-[#111827]/50">
                    {post.sport}
                  </span>
                </div>
                <h3 className="font-bold text-[#111827] leading-snug mb-2 group-hover:text-[#3b82f6] transition line-clamp-2 text-sm">
                  {post.title}
                </h3>
                <div className="mt-auto pt-3 flex items-center gap-3 text-xs text-[#111827]/40 font-medium">
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3 h-3" />
                    {post.date}
                  </span>
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {post.readTime} min
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>

      {/* CTA */}
      <div className="bg-white border-t border-[#e5e7eb]">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-14 text-center">
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

export default BlogIndex;
