import React from 'react';
import { BlogPost } from '../types';

interface BlogPostModalProps {
  post: BlogPost | null;
  isOpen: boolean;
  onClose: () => void;
}

export const BlogPostModal: React.FC<BlogPostModalProps> = ({
  post,
  isOpen,
  onClose,
}) => {
  if (!isOpen || !post) return null;

  return (
    <div
      id="blog-post-modal-overlay"
      onClick={onClose}
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/80 backdrop-blur-md overflow-y-auto animate-in fade-in"
    >
      <div
        id="blog-post-modal-card"
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-2xl bg-[#1a1a1a] border border-white/10 rounded-2xl overflow-hidden shadow-2xl my-auto text-left max-h-[90vh] flex flex-col"
      >
        {/* Close button */}
        <button
          id="blog-post-modal-close-btn"
          type="button"
          onClick={onClose}
          className="absolute top-4 right-4 z-20 w-9 h-9 rounded-full bg-black/70 hover:bg-black text-white flex items-center justify-center backdrop-blur-md border border-white/10 transition-colors cursor-pointer"
        >
          <span className="material-icons text-lg">close</span>
        </button>

        {/* Large Header Image */}
        {post.imageUrl && (
          <div className="relative w-full h-56 sm:h-64 bg-[#111] overflow-hidden shrink-0">
            <img
              src={post.imageUrl}
              alt={post.title}
              className="w-full h-full object-cover"
              onError={(e) => {
                (e.target as HTMLImageElement).style.display = 'none';
              }}
            />
            <div className="absolute inset-0 bg-gradient-to-t from-[#1a1a1a] via-transparent to-transparent" />
          </div>
        )}

        {/* Post Content */}
        <div className="p-6 sm:p-8 overflow-y-auto space-y-4">
          <div className="flex items-center gap-3 text-xs uppercase font-bold tracking-widest text-white/50">
            <span className="flex items-center gap-1.5 text-[#7c3aed]">
              <span className="material-icons text-sm">calendar_today</span>
              {post.date}
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <span className="material-icons text-sm">schedule</span>
              {post.readTime}
            </span>
          </div>

          <h2 className="text-2xl sm:text-3xl font-black uppercase tracking-tight text-white leading-snug">
            {post.title}
          </h2>

          <div className="text-white/80 text-sm leading-relaxed whitespace-pre-line space-y-3 pt-2">
            {post.content}
          </div>

          <div className="pt-6 border-t border-white/10 flex justify-end">
            <button
              type="button"
              onClick={onClose}
              className="py-3 px-6 rounded-xl bg-white/5 hover:bg-white/10 text-white text-xs font-bold uppercase tracking-widest transition-colors cursor-pointer border border-white/10"
            >
              Закрыть
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
