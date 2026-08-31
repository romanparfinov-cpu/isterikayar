import React, { useState } from 'react';
import { BlogPost } from '../types';
import { BlogPostModal } from './BlogPostModal';

interface BlogSectionProps {
  posts: BlogPost[];
}

export const BlogSection: React.FC<BlogSectionProps> = ({ posts }) => {
  const [selectedPost, setSelectedPost] = useState<BlogPost | null>(null);

  return (
    <div id="blog-section" className="space-y-8">
      <div className="border-b border-white/10 pb-4">
        <h2 className="text-3xl sm:text-4xl font-black uppercase italic tracking-tighter text-white flex items-center gap-3">
          <span className="text-[#7c3aed]">/</span>
          Блог и статьи
        </h2>
        <span className="text-white/40 text-xs uppercase font-bold tracking-widest mt-2 block">
          Гайды по выбору, обзоры девайсов и новости индустрии ISTERIKA
        </span>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {posts.map((post) => {
          const shortExcerpt = post.excerpt.length > 100 
            ? post.excerpt.substring(0, 100) + '...' 
            : post.excerpt;

          return (
            <article
              key={post.id}
              id={`blog-card-${post.id}`}
              onClick={() => setSelectedPost(post)}
              className="group bg-[#1a1a1a] border border-white/10 hover:border-[#7c3aed]/50 rounded-2xl overflow-hidden cursor-pointer transition-all duration-300 hover:shadow-2xl hover:shadow-purple-950/30 flex flex-col"
            >
              <div className="relative aspect-video w-full bg-[#111] overflow-hidden">
                <img
                  src={post.imageUrl}
                  alt={post.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-3 right-3 px-2.5 py-1 rounded bg-black/80 backdrop-blur-md text-[10px] uppercase font-bold tracking-wider text-white border border-white/10">
                  {post.readTime}
                </div>
              </div>

              <div className="p-5 flex-1 flex flex-col justify-between">
                <div>
                  <div className="text-[10px] text-[#7c3aed] uppercase font-black tracking-widest mb-2 flex items-center gap-1">
                    <span className="material-icons text-xs">calendar_today</span>
                    {post.date}
                  </div>
                  <h3 className="text-lg font-black uppercase tracking-tight text-white group-hover:text-purple-300 transition-colors leading-snug mb-2">
                    {post.title}
                  </h3>
                  <p className="text-xs text-white/60 line-clamp-3 leading-relaxed">
                    {shortExcerpt}
                  </p>
                </div>

                <div className="pt-4 mt-4 border-t border-white/10 flex items-center text-xs font-bold uppercase tracking-widest text-[#7c3aed] group-hover:text-[#9061f9]">
                  Читать статью
                  <span className="material-icons text-sm ml-1.5 group-hover:translate-x-1 transition-transform">
                    arrow_forward
                  </span>
                </div>
              </div>
            </article>
          );
        })}
      </div>

      {/* Post Modal */}
      <BlogPostModal
        post={selectedPost}
        isOpen={!!selectedPost}
        onClose={() => setSelectedPost(null)}
      />
    </div>
  );
};
