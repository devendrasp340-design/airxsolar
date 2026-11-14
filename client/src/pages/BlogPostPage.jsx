import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Calendar, User } from 'lucide-react';
import QuoteModal from '../components/shared/QuoteModal';

function extractYouTubeId(url) {
  if (!url) return null;
  const match = url.match(/(?:youtube\.com\/(?:watch\?v=|embed\/|shorts\/)|youtu\.be\/)([A-Za-z0-9_-]{11})/);
  return match ? match[1] : null;
}

export default function BlogPostPage() {
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [related, setRelated] = useState([]);
  const [loading, setLoading] = useState(true);
  const [notFound, setNotFound] = useState(false);
  const [quoteOpen, setQuoteOpen] = useState(false);

  useEffect(() => {
    setLoading(true);
    setNotFound(false);

    fetch(`/api/blogs/${slug}`)
      .then((r) => {
        if (!r.ok) throw new Error('Not found');
        return r.json();
      })
      .then((data) => {
        setPost(data);
        setLoading(false);
      })
      .catch(() => {
        setNotFound(true);
        setLoading(false);
      });

    fetch('/api/blogs')
      .then((r) => (r.ok ? r.json() : { blogs: [] }))
      .then((data) => {
        setRelated((data.blogs || []).filter((b) => b.slug !== slug).slice(0, 3));
      })
      .catch(() => setRelated([]));
  }, [slug]);

  if (loading) {
    return (
      <div className="max-w-4xl mx-auto px-4 py-16">
        <div className="h-8 bg-slate rounded w-2/3 mb-4 animate-pulse" />
        <div className="h-64 bg-slate rounded-2xl mb-6 animate-pulse" />
        <div className="space-y-3">
          <div className="h-4 bg-slate rounded w-full animate-pulse" />
          <div className="h-4 bg-slate rounded w-5/6 animate-pulse" />
        </div>
      </div>
    );
  }

  if (notFound || !post) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <h1 className="font-heading font-bold text-2xl text-navy mb-3">Article Not Found</h1>
        <Link to="/blog" className="text-amber font-bold hover:underline">
          Back to Blog
        </Link>
      </div>
    );
  }

  const youtubeId = extractYouTubeId(post.youtube_url);

  return (
    <article className="bg-white py-10 lg:py-16">
      <div className="max-w-4xl mx-auto px-4">
        <Link
          to="/blog"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-navy/60 hover:text-navy mb-6 min-h-[44px] py-1"
        >
          <ArrowLeft className="w-4 h-4" /> Back to Articles
        </Link>

        <h1 className="font-heading font-extrabold text-2xl sm:text-3xl lg:text-4xl text-navy mb-4 leading-tight">
          {post.title}
        </h1>

        <div className="flex flex-wrap items-center gap-4 text-sm text-navy/60 mb-8">
          <span className="inline-flex items-center gap-1.5">
            <Calendar className="w-4 h-4 text-amber" />
            {new Date(post.created_at).toLocaleDateString('en-AU', {
              day: 'numeric',
              month: 'long',
              year: 'numeric',
            })}
          </span>
          {post.author_name && (
            <span className="inline-flex items-center gap-1.5">
              <User className="w-4 h-4 text-amber" />
              {post.author_name}
            </span>
          )}
        </div>

        {post.featured_image && (
          <img
            src={post.featured_image}
            alt={post.title}
            loading="lazy"
            className="w-full max-h-[420px] object-cover rounded-2xl mb-8"
          />
        )}

        {/* YouTube Embed */}
        {youtubeId && (
          <div className="aspect-video rounded-2xl overflow-hidden mb-8 shadow-md">
            <iframe
              src={`https://www.youtube.com/embed/${youtubeId}`}
              title={post.title}
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="w-full h-full border-0"
            />
          </div>
        )}

        {/* Rich HTML Content */}
        <div
          className="prose prose-lg max-w-none text-navy/85 leading-relaxed space-y-4 [&_h2]:font-heading [&_h2]:font-bold [&_h2]:text-2xl [&_h2]:text-navy [&_h2]:mt-8 [&_h2]:mb-3 [&_h3]:font-heading [&_h3]:font-bold [&_h3]:text-xl [&_h3]:text-navy [&_ul]:list-disc [&_ul]:pl-6 [&_ol]:list-decimal [&_ol]:pl-6 [&_a]:text-amber [&_a]:underline [&_img]:rounded-xl"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {/* CTA Box */}
        <div className="mt-12 bg-navy text-white rounded-2xl p-6 sm:p-8 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div>
            <h3 className="font-heading font-bold text-xl mb-1">
              Need an Air Conditioning Quote in Perth?
            </h3>
            <p className="text-white/70 text-sm">
              Talk to our licensed team for tailored advice and fast installation.
            </p>
          </div>
          <button
            onClick={() => setQuoteOpen(true)}
            className="w-full sm:w-auto bg-amber text-navy font-bold px-6 py-3.5 min-h-[48px] rounded-xl hover:bg-amber/90 transition-colors shrink-0 text-center"
          >
            Get Free Quote
          </button>
        </div>

        {/* Related Posts */}
        {related.length > 0 && (
          <div className="mt-14 pt-10 border-t border-slate">
            <h2 className="font-heading font-bold text-2xl text-navy mb-6">
              Related Articles
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {related.map((item) => (
                <Link
                  key={item.id}
                  to={`/blog/${item.slug}`}
                  className="bg-slate rounded-xl p-5 hover:shadow-md transition-shadow"
                >
                  <h3 className="font-heading font-bold text-navy mb-2 line-clamp-2">
                    {item.title}
                  </h3>
                  {item.excerpt && (
                    <p className="text-navy/60 text-xs line-clamp-3">{item.excerpt}</p>
                  )}
                </Link>
              ))}
            </div>
          </div>
        )}
      </div>

      <QuoteModal
        isOpen={quoteOpen}
        onClose={() => setQuoteOpen(false)}
        prefillProduct={`Enquiry from Blog: ${post.title}`}
      />
    </article>
  );
}
