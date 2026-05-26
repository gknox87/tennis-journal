import { Link } from "react-router-dom";
import { Clock, Calendar, ArrowRight, BookOpen } from "lucide-react";
import { blogPosts } from "./blogData";
import { useEffect } from "react";

function BlogIndex() {
  useEffect(() => {
    document.title = "Sports Journal Blog — Performance & Improvement Tips for Athletes";
    const metaDesc = document.querySelector('meta[name="description"]');
    if (metaDesc) metaDesc.setAttribute("content", "Performance journals, match reflection guides, and sport-specific training logs for athletes in padel, tennis, table tennis, badminton, cycling, swimming, and more.");
  }, []);

  return (
    <div className="min-h-screen bg-white text-gray-900 font-sans antialiased">
      {/* Header */}
      <div className="bg-gradient-to-br from-violet-700 via-violet-800 to-orange-600 text-white">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 py-14 sm:py-20 text-center">
          <div className="inline-flex items-center gap-2 bg-white/20 px-4 py-1.5 rounded-full text-sm font-semibold mb-6">
            <BookOpen className="w-4 h-4" />
            Sports Journal Blog
          </div>
          <h1 className="font-black tracking-tight text-4xl sm:text-5xl lg:text-6xl mb-6">
            Performance insights for
            <br />
            <span className="bg-gradient-to-r from-orange-300 to-yellow-200 bg-clip-text text-transparent">
              ambitious athletes
            </span>
          </h1>
          <p className="text-white/85 text-lg sm:text-xl max-w-2xl mx-auto">
            Structured reflection guides, sport-specific training logs, and performance improvement articles for athletes in 13 sports.
          </p>
        </div>
      </div>

      {/* Blog Grid */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {blogPosts.map((post) => (
            <Link
              key={post.slug}
              to={`/blog/${post.slug}`}
              className="group bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-lg hover:-translate-y-1 transition duration-200"
            >
              {/* Card header */}
              <div className="bg-gradient-to-br from-violet-50 to-orange-50 px-6 pt-6 pb-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="text-2xl">{post.sportIcon}</span>
                    <span className="text-xs font-bold uppercase tracking-wider text-gray-500">
                      {post.sport}
                    </span>
                  </div>
                </div>
                <h2 className="font-extrabold text-gray-900 text-lg leading-snug line-clamp-3 group-hover:text-violet-700 transition">
                  {post.title}
                </h2>
              </div>

              <div className="px-6 py-4">
                <p className="text-gray-500 text-sm leading-relaxed line-clamp-3 mb-4">
                  {post.description}
                </p>

                <div className="flex items-center justify-between text-xs text-gray-400">
                  <div className="flex items-center gap-1.5">
                    <Calendar className="w-3.5 h-3.5" />
                    {post.date}
                  </div>
                  <div className="flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5" />
                    {post.readTime} min read
                  </div>
                </div>

                <div className="mt-4 flex items-center gap-1 text-violet-600 font-semibold text-sm group-hover:gap-2 transition-all">
                  Read article
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
            </Link>
          ))}
        </div>

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

export default BlogIndex;
