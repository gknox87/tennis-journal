import { Link } from "react-router-dom";
import { Clock, Calendar, ArrowRight, BookOpen, TrendingUp } from "lucide-react";
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
    <div className="min-h-screen bg-[#0b1d12] text-white font-sans antialiased">
      {/* Header / Nav */}
      <div className="border-b border-white/10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-4 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-2 text-white/80 hover:text-white transition text-sm">
            <ArrowRight className="w-4 h-4 rotate-180" />
            Back to Sports Journal
          </Link>
          <div className="flex items-center gap-2 text-white/60 text-sm">
            <BookOpen className="w-4 h-4" />
            Blog
          </div>
        </div>
      </div>

      {/* Hero */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pt-12 pb-10">
        <div className="inline-flex items-center gap-2 bg-white/10 px-4 py-1.5 rounded-full text-sm font-semibold text-white/80 mb-6">
          <span className="w-2 h-2 rounded-full bg-orange-400 animate-pulse" />
          Performance & Improvement
        </div>
        <h1 className="font-black tracking-tight text-4xl sm:text-5xl lg:text-6xl mb-4">
          The Sports Journal
          <span className="block text-orange-400">Blog</span>
        </h1>
        <p className="text-white/60 text-lg sm:text-xl max-w-2xl">
          Structured reflection guides, sport-specific training logs, and performance insights for ambitious athletes.
        </p>
      </div>

      {/* Featured Post */}
      {featured && (
        <div className="max-w-6xl mx-auto px-4 sm:px-6 pb-12">
          <Link
            to={`/blog/${featured.slug}`}
            className="group relative flex flex-col md:flex-row gap-0 rounded-2xl overflow-hidden bg-white/5 border border-white/10 hover:border-orange-400/50 transition-all duration-300 hover:shadow-2xl hover:shadow-orange-900/20"
          >
            {/* Image */}
            <div className="relative md:w-1/2 aspect-[16/9] md:aspect-auto overflow-hidden">
              <img
                src={getSportImage(featured.sport)}
                alt={featured.title}
                className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-transparent to-[#0b1d12]/80" />
            </div>

            {/* Content */}
            <div className="relative md:w-1/2 p-8 sm:p-10 flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-3xl">{featured.sportIcon}</span>
                  <span className="px-3 py-1 bg-orange-500/20 text-orange-400 rounded-full text-xs font-bold uppercase tracking-wider">
                    Featured
                  </span>
                  <span className="text-xs text-white/40 uppercase tracking-wider">{featured.sport}</span>
                </div>
                <h2 className="font-black text-2xl sm:text-3xl leading-tight mb-3 group-hover:text-orange-400 transition-colors">
                  {featured.title}
                </h2>
                <p className="text-white/60 leading-relaxed line-clamp-3">
                  {featured.description}
                </p>
              </div>

              <div className="mt-6 flex items-center justify-between">
                <div className="flex items-center gap-4 text-sm text-white/40">
                  <span className="flex items-center gap-1.5">
                    <Calendar className="w-4 h-4" />
                    {featured.date}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <Clock className="w-4 h-4" />
                    {featured.readTime} min read
                  </span>
                </div>
                <span className="flex items-center gap-2 text-orange-400 font-semibold text-sm group-hover:gap-3 transition-all">
                  Read article
                  <ArrowRight className="w-4 h-4" />
                </span>
              </div>
            </div>
          </Link>
        </div>
      )}

      {/* Post Grid */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 pb-16">
        <div className="flex items-center gap-2 mb-8">
          <TrendingUp className="w-5 h-5 text-orange-400" />
          <h2 className="font-bold text-lg text-white/80">All Articles</h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {remaining.map((post) => (
            <Link
              key={post.slug}
              to={`/blog/${post.slug}`}
              className="group flex gap-4 p-5 rounded-xl bg-white/5 border border-white/10 hover:border-orange-400/40 hover:bg-white/10 transition duration-200"
            >
              {/* Thumbnail */}
              <div className="flex-shrink-0 w-24 h-24 rounded-lg overflow-hidden">
                <img
                  src={getSportImage(post.sport)}
                  alt={post.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                />
              </div>

              {/* Text */}
              <div className="flex-1 min-w-0 flex flex-col justify-between">
                <div>
                  <div className="flex items-center gap-2 mb-2">
                    <span className="text-lg">{post.sportIcon}</span>
                    <span className="text-xs font-bold uppercase tracking-wider text-white/40">
                      {post.sport}
                    </span>
                  </div>
                  <h3 className="font-bold text-white leading-snug line-clamp-2 group-hover:text-orange-400 transition-colors text-sm">
                    {post.title}
                  </h3>
                </div>
                <div className="flex items-center gap-3 mt-2 text-xs text-white/40">
                  <span className="flex items-center gap-1">
                    <Clock className="w-3 h-3" />
                    {post.readTime} min
                  </span>
                  <span>{post.date}</span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {/* Bottom CTA */}
        <div className="mt-14 bg-gradient-to-r from-[#1a2e1f] to-[#0b1d12] rounded-2xl p-8 sm:p-10 text-center border border-white/10">
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

export default BlogIndex;