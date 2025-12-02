import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Upload, FileText, Check, Eye, X, AlertCircle, ArrowLeft } from 'lucide-react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { parseFrontmatter, validatePost } from '../../utils/markdownUtils';
import { useAuth } from '../../contexts/AuthContext';

function BlogEditor() {
    const [file, setFile] = useState(null);
    const [fileContent, setFileContent] = useState('');
    const [previewData, setPreviewData] = useState(null);
    const [isDragging, setIsDragging] = useState(false);
    const [isUploading, setIsUploading] = useState(false);
    const [uploadSuccess, setUploadSuccess] = useState(false);
    const [showPreview, setShowPreview] = useState(false);
    const [error, setError] = useState(null);
    const { user } = useAuth();

    const handleDrop = (e) => {
        e.preventDefault();
        setIsDragging(false);
        setError(null);

        const droppedFile = e.dataTransfer.files[0];
        if (droppedFile && droppedFile.name.endsWith('.md')) {
            processFile(droppedFile);
        } else {
            setError('Por favor sube un archivo .md (Markdown)');
        }
    };

    const handleFileInput = (e) => {
        setError(null);
        const selectedFile = e.target.files[0];
        if (selectedFile && selectedFile.name.endsWith('.md')) {
            processFile(selectedFile);
        } else {
            setError('Por favor sube un archivo .md (Markdown)');
        }
    };

    const processFile = (selectedFile) => {
        setFile(selectedFile);
        const reader = new FileReader();
        reader.onload = (e) => {
            const content = e.target.result;
            setFileContent(content);

            // Parse y validar
            const { metadata, content: body } = parseFrontmatter(content);
            const post = {
                title: metadata.title || selectedFile.name.replace('.md', ''),
                content: body,
                tags: metadata.tags || [],
                date: metadata.date,
                excerpt: metadata.excerpt,
            };

            const validation = validatePost(post);
            if (!validation.valid) {
                setError(validation.errors.join(', '));
            }

            setPreviewData({ metadata, content: body });
        };
        reader.readAsText(selectedFile);
    };

    const handleUpload = async () => {
        if (!file || !fileContent) return;

        setIsUploading(true);
        setUploadSuccess(false);
        setError(null);

        try {
            // Enviar con header de autenticación
            const response = await fetch('/.netlify/functions/blog-upload', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': JSON.stringify(user),
                },
                body: JSON.stringify({
                    filename: file.name,
                    content: fileContent,
                }),
            });

            const result = await response.json();

            if (!response.ok) {
                throw new Error(result.error || 'Error al subir el archivo');
            }

            setUploadSuccess(true);
            setTimeout(() => {
                // Recargar para ver el nuevo post
                window.location.reload();
            }, 2000);
        } catch (error) {
            console.error('Error uploading:', error);
            setError(error.message);
        } finally {
            setIsUploading(false);
        }
    };

    const resetForm = () => {
        setFile(null);
        setFileContent('');
        setPreviewData(null);
        setShowPreview(false);
        setError(null);
    };

    return (
        <div className="min-h-screen py-20 px-6">
            <div className="max-w-4xl mx-auto">
                {/* Header con botón volver */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-12"
                >
                    <button
                        onClick={() => window.location.hash = '#blog'}
                        className="mb-6 flex items-center gap-2 text-neon-cyan hover:underline"
                    >
                        <ArrowLeft className="w-4 h-4" />
                        Ver lista de posts
                    </button>
                    <h1 className="text-5xl font-bold text-white mb-4">Editor de Blog</h1>
                    <p className="text-gray-400 text-lg">
                        Sube un archivo Markdown para publicar una nueva entrada
                    </p>
                </motion.div>

                {/* Error Message */}
                <AnimatePresence>
                    {error && (
                        <motion.div
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            className="mb-6 bg-red-500/10 border border-red-500/50 rounded-lg p-4 flex items-center gap-3"
                        >
                            <AlertCircle className="w-5 h-5 text-red-400" />
                            <p className="text-red-400">{error}</p>
                            <button
                                onClick={() => setError(null)}
                                className="ml-auto text-red-400 hover:text-red-300"
                            >
                                <X className="w-5 h-5" />
                            </button>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Upload Area */}
                <div
                    onDrop={handleDrop}
                    onDragOver={(e) => e.preventDefault()}
                    onDragEnter={() => setIsDragging(true)}
                    onDragLeave={() => setIsDragging(false)}
                    className={`bg-deep-space/50 backdrop-blur-lg rounded-2xl border-2 border-dashed p-12 text-center transition-all ${isDragging
                            ? 'border-neon-cyan bg-neon-cyan/10'
                            : 'border-white/20 hover:border-white/40'
                        }`}
                >
                    {uploadSuccess ? (
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            className="flex flex-col items-center gap-4"
                        >
                            <div className="w-16 h-16 bg-green-500/20 rounded-full flex items-center justify-center">
                                <Check className="w-8 h-8 text-green-400" />
                            </div>
                            <p className="text-white text-xl font-medium">¡Publicado con éxito!</p>
                            <p className="text-gray-400">Redirigiendo...</p>
                        </motion.div>
                    ) : file ? (
                        <div className="space-y-6">
                            <div className="flex items-center justify-center gap-3">
                                <FileText className="w-8 h-8 text-neon-cyan" />
                                <p className="text-white text-lg font-medium">{file.name}</p>
                            </div>

                            {previewData && (
                                <div className="bg-white/5 rounded-lg p-4 text-left">
                                    <h3 className="text-white font-medium mb-2">Metadatos detectados:</h3>
                                    <div className="text-sm text-gray-400 space-y-1">
                                        <p><strong>Título:</strong> {previewData.metadata.title || 'Sin título'}</p>
                                        {previewData.metadata.date && (
                                            <p><strong>Fecha:</strong> {previewData.metadata.date}</p>
                                        )}
                                        {previewData.metadata.tags && previewData.metadata.tags.length > 0 && (
                                            <p><strong>Tags:</strong> {previewData.metadata.tags.join(', ')}</p>
                                        )}
                                    </div>
                                </div>
                            )}

                            <div className="flex gap-4 justify-center flex-wrap">
                                <button
                                    onClick={resetForm}
                                    className="px-6 py-3 bg-gray-600 rounded-lg text-white hover:bg-gray-700 transition-colors"
                                >
                                    Cancelar
                                </button>
                                <button
                                    onClick={() => setShowPreview(!showPreview)}
                                    className="px-6 py-3 bg-purple-600 rounded-lg text-white hover:bg-purple-700 transition-colors flex items-center gap-2"
                                >
                                    <Eye className="w-5 h-5" />
                                    {showPreview ? 'Ocultar' : 'Ver'} Preview
                                </button>
                                <button
                                    onClick={handleUpload}
                                    disabled={isUploading || !!error}
                                    className="px-6 py-3 bg-gradient-to-r from-neon-cyan to-neon-purple rounded-lg text-white hover:opacity-90 transition-opacity disabled:opacity-50"
                                >
                                    {isUploading ? 'Subiendo...' : 'Publicar'}
                                </button>
                            </div>
                        </div>
                    ) : (
                        <>
                            <Upload className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                            <p className="text-white text-xl mb-2">
                                Arrastra un archivo Markdown aquí
                            </p>
                            <p className="text-gray-400 mb-6">o</p>
                            <label className="inline-block px-6 py-3 bg-gradient-to-r from-neon-cyan to-neon-purple rounded-lg text-white cursor-pointer hover:opacity-90 transition-opacity">
                                <input
                                    type="file"
                                    accept=".md"
                                    onChange={handleFileInput}
                                    className="hidden"
                                />
                                Seleccionar archivo
                            </label>
                            <p className="text-gray-500 text-sm mt-4">
                                Solo archivos .md (Markdown)
                            </p>
                        </>
                    )}
                </div>

                {/* Preview */}
                <AnimatePresence>
                    {showPreview && previewData && (
                        <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: 'auto' }}
                            exit={{ opacity: 0, height: 0 }}
                            className="mt-8 bg-deep-space/50 backdrop-blur-lg rounded-2xl border border-white/10 p-8 overflow-hidden"
                        >
                            <h2 className="text-2xl font-bold text-white mb-6">Preview</h2>
                            <article className="prose prose-invert prose-lg max-w-none">
                                <h1 className="text-3xl font-bold text-white mb-4">
                                    {previewData.metadata.title}
                                </h1>
                                <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                    {previewData.content}
                                </ReactMarkdown>
                            </article>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Guía de formato */}
                <div className="mt-8 bg-white/5 border border-white/10 rounded-lg p-6">
                    <h3 className="text-white font-medium mb-3">Formato del archivo Markdown</h3>
                    <div className="text-gray-400 text-sm font-mono bg-black/50 p-4 rounded overflow-x-auto">
                        <pre>{`---
title: Título del post
date: 2025-12-01
tags: [react, javascript, webdev]
excerpt: Breve descripción del post
---

# Contenido del post

Tu contenido aquí en Markdown...`}</pre>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default BlogEditor;
