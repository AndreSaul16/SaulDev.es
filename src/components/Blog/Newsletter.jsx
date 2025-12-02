import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Mail, Send, Check } from 'lucide-react';
import CryptoJS from 'crypto-js';

function Newsletter() {
    const [email, setEmail] = useState('');
    const [isSubscribed, setIsSubscribed] = useState(false);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    const handleSubscribe = async (e) => {
        e.preventDefault();
        setError('');

        if (!email || !email.includes('@')) {
            setError('Por favor ingresa un email válido');
            return;
        }

        setIsLoading(true);

        try {
            // Encrypt email before sending
            const encrypted = CryptoJS.AES.encrypt(
                email,
                'sauldev-newsletter-secret-key-2025'
            ).toString();

            const response = await fetch('/.netlify/functions/newsletter-subscribe', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ encrypted }),
            });

            if (!response.ok) {
                throw new Error('Error al suscribirse');
            }

            setIsSubscribed(true);
            setEmail('');

            setTimeout(() => setIsSubscribed(false), 5000);
        } catch (err) {
            console.error('Newsletter error:', err);
            setError('Hubo un error. Por favor intenta de nuevo.');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="mt-12 pt-8 border-t border-white/10">
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="bg-gradient-to-r from-neon-cyan/10 to-neon-purple/10 rounded-2xl p-8 border border-white/10"
            >
                <div className="flex items-start gap-4 mb-6">
                    <div className="p-3 bg-gradient-to-r from-neon-cyan to-neon-purple rounded-lg">
                        <Mail className="w-6 h-6 text-white" />
                    </div>
                    <div>
                        <h3 className="text-2xl font-bold text-white mb-2">
                            Suscríbete al Newsletter
                        </h3>
                        <p className="text-gray-400">
                            Recibe las últimas publicaciones directamente en tu correo
                        </p>
                    </div>
                </div>

                {isSubscribed ? (
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="flex items-center gap-3 bg-green-500/20 border border-green-500/50 rounded-lg p-4"
                    >
                        <Check className="w-5 h-5 text-green-400" />
                        <p className="text-green-400 font-medium">
                            ¡Suscripción exitosa! Revisa tu correo.
                        </p>
                    </motion.div>
                ) : (
                    <form onSubmit={handleSubscribe} className="flex gap-3">
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="tu@email.com"
                            disabled={isLoading}
                            className="flex-1 px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-neon-cyan/50 transition-colors disabled:opacity-50"
                        />
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="px-6 py-3 bg-gradient-to-r from-neon-cyan to-neon-purple rounded-lg text-white font-medium hover:opacity-90 transition-opacity disabled:opacity-50 flex items-center gap-2"
                        >
                            <Send className="w-4 h-4" />
                            {isLoading ? 'Enviando...' : 'Suscribirse'}
                        </button>
                    </form>
                )}

                {error && (
                    <p className="mt-3 text-red-400 text-sm">{error}</p>
                )}

                <p className="mt-4 text-xs text-gray-500">
                    Tu email será encriptado y nunca compartido con terceros.
                </p>
            </motion.div>
        </div>
    );
}

export default Newsletter;
