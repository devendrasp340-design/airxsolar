import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, ArrowRight, BookOpen } from 'lucide-react';
import useSEO from '../hooks/useSEO';

export default function BlogPage() {
  useSEO({
    title: 'Perth Air Conditioning Tips & Buying Guides | AirXSolar',
    description:
      'Split vs ducted, sizing, running costs and servicing advice for Perth homes. Air conditioning buying guides from licensed WA installers.',
    path: '/blog',
  });
  const [blogs, setBlogs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch('/api/blogs')
      .then((r) => (r.ok ? r.json() : { blogs: [] }))
      .then((data) => {
        setBlogs(data.blogs || []);
        setLoading(false);
      })
      .catch(() => {
        setBlogs([]);
        setLoading(false);
      });
  }, []);

  return (
    <div className="bg-slate min-h-screen py-10 lg:py-16">
      <div className="max-w-7xl mx-auto px-4">
        <div className="text-center max-w-2xl mx-auto mb-12">
          <h1 className="font-heading font-extrabold text-3xl lg:text-4xl text-navy mb-3">
            AirXSolar Perth Air Conditioning Blog
          </h1>
          <p className="text-navy/65 text-sm lg:text-base">
            Buying guides, energy efficiency tips, and cooling insights tailored for Western Australian homes.
          </p>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3].map((n) => (
              <div key={n} className="bg-white rounded-2xl h-80 animate-pulse p-6" />
            ))}
          </div>
        ) : blogs.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center max-w-lg mx-auto">
            <BookOpen className="w-10 h-10 text-amber mx-auto mb-3" />
            <h2 className="font-heading font-bold text-xl text-navy mb-2">
              Articles Coming Soon
            </h2>
            <p className="text-navy/60 text-sm">
              Check back soon for Perth air conditioning tips, guides, and energy-saving advice.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {blogs.map((post) => (
              <Link
                key={post.id}
                to={`/blog/${post.slug}`}
                className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-xl transition-all group flex flex-col justify-between"
              >
                <div>
                  <div className="aspect-[16/9] bg-navy/5 overflow-hidden">
                    {post.featured_image ? (
                      <img
                        src={post.featured_image}
                        alt={post.title}
                        loading="lazy"
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-navy text-amber font-heading font-bold text-xl">
                        AirXSolar
                      </div>
                    )}
                  </div>
                  <div className="p-6">
                    <div className="flex items-center gap-2 text-xs text-navy/50 mb-2">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{new Date(post.created_at).toLocaleDateString('en-AU')}</span>
                      {post.author_name && <span>· {post.author_name}</span>}
                    </div>
                    <h2 className="font-heading font-bold text-xl text-navy mb-2 group-hover:text-amber transition-colors line-clamp-2">
                      {post.title}
                    </h2>
                    {post.excerpt && (
                      <p className="text-navy/65 text-sm line-clamp-3">{post.excerpt}</p>
                    )}
                  </div>
                </div>
                <div className="px-6 pb-6">
                  <span className="inline-flex items-center gap-1.5 text-sm font-bold text-navy group-hover:text-amber">
                    Read Article <ArrowRight className="w-4 h-4" />
                  </span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
