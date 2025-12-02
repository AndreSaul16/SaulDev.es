import React, { useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import rehypeHighlight from 'rehype-highlight';
import { motion } from 'framer-motion';
import { Calendar, Clock, User } from 'lucide-react';
import 'highlight.js/styles/github-dark.css';

function BlogPost({ post }) {
    return (
        <motion.article
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-deep-space/50 backdrop-blur-lg rounded-2xl border border-white/10 p-8 mb-8"
        >
            {/* Header del post */}
            <header className="mb-8 pb-8 border-b border-white/10">
                <h1 className="text-4xl md:text-5xl font-bold text-white mb-6 leading-tight">
                    {post.title}
                </h1>

                <div className="flex flex-wrap items-center gap-6 text-gray-400 text-sm">
                    <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4" />
                        <time dateTime={post.date}>
                            {new Date(post.date).toLocaleDateString('es-ES', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                            })}
                        </time>
                    </div>

                    {post.readingTime && (
                        <div className="flex items-center gap-2">
                            <Clock className="w-4 h-4" />
                            <span>{post.readingTime}</span>
                        </div>
                    )}

                    {post.author && (
                        <div className="flex items-center gap-2">
                            <User className="w-4 h-4" />
                            <span>{post.author}</span>
                        </div>
                    )}
                </div>

                {post.tags && post.tags.length > 0 && (
                    <div className="flex flex-wrap gap-2 mt-4">
                        {post.tags.map((tag, i) => (
                            <span
                                key={i}
                                className="px-3 py-1 bg-neon-cyan/10 text-neon-cyan rounded-full text-xs font-medium"
                            >
                                #{tag}
                            </span>
                        ))}
                    </div>
                )}
            </header>

            {/* Contenido del post */}
            <div className="prose prose-invert prose-lg max-w-none">
                <ReactMarkdown
                    remarkPlugins={[remarkGfm]}
                    rehypePlugins={[rehypeHighlight]}
                    components={{
                        // Headings
                        h1: ({ children }) => (
                            <h1 className="text-4xl font-bold text-white mb-6 mt-8 pb-2 border-b border-white/10">
                                {children}
                            </h1>
                        ),
                        h2: ({ children }) => (
                            <h2 className="text-3xl font-bold text-white mb-5 mt-8">
                                {children}
                            </h2>
                        ),
                        h3: ({ children }) => (
                            <h3 className="text-2xl font-bold text-white mb-4 mt-6">
                                {children}
                            </h3>
                        ),
                        h4: ({ children }) => (
                            <h4 className="text-xl font-bold text-white mb-3 mt-5">
                                {children}
                            </h4>
                        ),

                        // Paragraphs
                        p: ({ children }) => (
                            <p className="text-gray-300 mb-6 leading-relaxed text-lg">
                                {children}
                            </p>
                        ),

                        // Code blocks
                        pre: ({ children }) => (
                            <pre className="bg-black/60 rounded-xl p-6 overflow-x-auto mb-6 border border-white/10">
                                {children}
                            </pre>
                        ),
                        code: ({ inline, className, children }) => {
                            return inline ? (
                                <code className="bg-neon-cyan/20 text-neon-cyan px-2 py-1 rounded text-sm font-mono">
                                    {children}
                                </code>
                            ) : (
                                <code className={`${className} text-sm`}>
                                    {children}
                                </code>
                            );
                        },

                        // Links
                        a: ({ href, children }) => (
                            <a
                                href={href}
                                className="text-neon-cyan hover:text-neon-purple transition-colors underline decoration-neon-cyan/50 hover:decoration-neon-purple/50"
                                target="_blank"
                                rel="noopener noreferrer"
                            >
                                {children}
                            </a>
                        ),

                        // Lists
                        ul: ({ children }) => (
                            <ul className="list-disc list-outside ml-6 mb-6 space-y-2 text-gray-300">
                                {children}
                            </ul>
                        ),
                        ol: ({ children }) => (
                            <ol className="list-decimal list-outside ml-6 mb-6 space-y-2 text-gray-300">
                                {children}
                            </ol>
                        ),
                        li: ({ children }) => (
                            <li className="text-gray-300 leading-relaxed">
                                {children}
                            </li>
                        ),

                        // Blockquotes
                        blockquote: ({ children }) => (
                            <blockquote className="border-l-4 border-neon-cyan pl-6 py-2 my-6 bg-neon-cyan/5 rounded-r-lg italic text-gray-300">
                                {children}
                            </blockquote>
                        ),

                        // Tables
                        table: ({ children }) => (
                            <div className="overflow-x-auto mb-6">
                                <table className="min-w-full divide-y divide-white/10 border border-white/10 rounded-lg overflow-hidden">
                                    {children}
                                </table>
                            </div>
                        ),
                        thead: ({ children }) => (
                            <thead className="bg-white/5">
                                {children}
                            </thead>
                        ),
                        th: ({ children }) => (
                            <th className="px-6 py-3 text-left text-xs font-medium text-neon-cyan uppercase tracking-wider">
                                {children}
                            </th>
                        ),
                        td: ({ children }) => (
                            <td className="px-6 py-4 text-gray-300 border-t border-white/10">
                                {children}
                            </td>
                        ),

                        // Images
                        img: ({ src, alt }) => (
                            <img
                                src={src}
                                alt={alt}
                                className="rounded-lg my-6 w-full shadow-2xl"
                                loading="lazy"
                            />
                        ),

                        // Horizontal rule
                        hr: () => (
                            <hr className="my-8 border-white/10" />
                        ),
                    }}
                >
                    {post.content}
                </ReactMarkdown>
            </div>
        </motion.article>
    );
}

export default BlogPost;
