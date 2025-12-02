import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Calendar, Tag, Clock, BookOpen, ArrowRight } from 'lucide-react';
import BlogPost from './BlogPost';

function BlogList() {
    const [posts, setPosts] = useState([]);
    const [selectedPost, setSelectedPost] = useState(null);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        loadPosts();
    }, []);

    const loadPosts = async () => {
        try {
            // Fetch posts from Netlify Function (que lee de Firestore)
            const response = await fetch('/.netlify/functions/get-posts');
            const data = await response.json();
            setPosts(data.posts || []);
        } catch (error) {
            console.error('Error loading posts:', error);
            setPosts([]);
        } finally {
            setIsLoading(false);
        }
    };

    if (isLoading) {
        return (
            <div className="flex justify-center items-center min-h-screen">
                <div className="text-white text-lg">Cargando posts...</div>
            </div>
        );
    }

    if (selectedPost) {
        return (
            <div className="min-h-screen py-20 px-6">
                <div className="max-w-4xl mx-auto">
                    <button
                        onClick={() => setSelectedPost(null)}
                        className="mb-6 text-neon-cyan hover:underline flex items-center gap-2"
                    >
                        ← Volver al blog
                    </button>
                    <BlogPost post={selectedPost} />
                </div>
            </div>
        );
    }

    return (
        <section className="min-h-screen py-20 px-6">
            <div className="max-w-4xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-12"
                >
                    <h1 className="text-5xl md:text-6xl font-bold text-white mb-6">
                        Blog
                    </h1>
                    <p className="text-gray-400 text-lg md:text-xl">
                        Artículos sobre desarrollo, tecnología y más
                    </p>
                </motion.div>

                {posts.length === 0 ? (
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="bg-deep-space/50 backdrop-blur-lg rounded-2xl border border-white/10 p-12 text-center"
                    >
                        <BookOpen className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-400 text-lg mb-2">
                            No hay posts publicados aún.
                        </p>
                        <p className="text-gray-500">
                            ¡Vuelve pronto para leer nuevo contenido!
                        </p>
                    </motion.div>
                ) : (
                    <div className="space-y-8">
                        {posts
                            .sort((a, b) => new Date(b.date) - new Date(a.date))
                            .map((post, index) => (
                                <motion.article
                                    key={post.id || index}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: index * 0.1 }}
                                    onClick={() => setSelectedPost(post)}
                                    className="bg-deep-space/50 backdrop-blur-lg rounded-2xl border border-white/10 p-8 hover:border-neon-cyan/50 transition-all cursor-pointer group"
                                >
                                    {/* Header con título */}
                                    <h2 className="text-3xl font-bold text-white mb-4 group-hover:text-neon-cyan transition-colors">
                                        {post.title}
                                    </h2>

                                    {/* Metadatos */}
                                    <div className="flex flex-wrap items-center gap-6 text-gray-400 text-sm mb-4">
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

                                        {post.wordCount && (
                                            <div className="flex items-center gap-2">
                                                <BookOpen className="w-4 h-4" />
                                                <span>{post.wordCount} palabras</span>
                                            </div>
                                        )}
                                    </div>

                                    {/* Tags */}
                                    {post.tags && post.tags.length > 0 && (
                                        <div className="flex flex-wrap items-center gap-2 mb-4">
                                            <Tag className="w-4 h-4 text-gray-400" />
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

                                    {/* Excerpt */}
                                    {post.excerpt && (
                                        <p className="text-gray-300 mb-4 leading-relaxed line-clamp-3">
                                            {post.excerpt}
                                        </p>
                                    )}

                                    {/* Read more */}
                                    <div className="flex items-center gap-2 text-neon-cyan font-medium group-hover:gap-3 transition-all">
                                        <span>Leer más</span>
                                        <ArrowRight className="w-4 h-4" />
                                    </div>
                                </motion.article>
                            ))}
                    </div>
                )}
            </div>
        </section>
    );
}

export default BlogList;
