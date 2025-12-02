import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Fingerprint } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';

function Login({ isOpen, onClose }) {
    const [email, setEmail] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [isRegistering, setIsRegistering] = useState(false);
    const { login, register, isLoading } = useAuth();

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');

        if (!email || !email.includes('@')) {
            setError('Por favor ingresa un email válido');
            return;
        }

        const result = isRegistering
            ? await register(email)
            : await login(email);

        if (result.success) {
            const successMsg = isRegistering
                ? '¡Registro exitoso! Bienvenido 🎉'
                : '¡Sesión iniciada correctamente! ✅';

            setSuccess(successMsg);
            setEmail('');

            // Auto-close after 2 seconds
            setTimeout(() => {
                onClose();
                setSuccess('');
            }, 2000);
        } else {
            setError(result.error || 'Error al autenticar');
        }
    };

    if (!isOpen) return null;

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
                onClick={onClose}
            >
                <motion.div
                    initial={{ scale: 0.9, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.9, opacity: 0 }}
                    onClick={(e) => e.stopPropagation()}
                    className="bg-deep-space/90 backdrop-blur-xl border border-white/10 rounded-2xl p-8 max-w-md w-full mx-4 shadow-2xl"
                >
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-2xl font-bold text-white">
                            {isRegistering ? 'Crear Cuenta' : 'Iniciar Sesión'}
                        </h2>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-white transition-colors"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label htmlFor="email" className="block text-sm text-gray-300 mb-2">
                                Email
                            </label>
                            <input
                                type="email"
                                id="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="tu@email.com"
                                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-500 focus:outline-none focus:border-neon-cyan/50 transition-colors"
                                disabled={isLoading}
                            />
                        </div>

                        {error && (
                            <div className="bg-red-500/10 border border-red-500/50 rounded-lg p-3 text-red-400 text-sm">
                                {error}
                            </div>
                        )}

                        {success && (
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0 }}
                                animate={{ scale: 1, opacity: 1 }}
                                className="bg-green-500/10 border border-green-500/50 rounded-lg p-3 text-green-400 text-sm font-medium"
                            >
                                {success}
                            </motion.div>
                        )}

                        <button
                            type="submit"
                            disabled={isLoading}
                            className="w-full flex items-center justify-center gap-2 px-6 py-3 bg-gradient-to-r from-neon-cyan to-neon-purple rounded-lg text-white font-medium hover:opacity-90 transition-opacity disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            <Fingerprint className="w-5 h-5" />
                            {isLoading
                                ? 'Procesando...'
                                : isRegistering
                                    ? 'Registrar con Biometría'
                                    : 'Iniciar con Biometría'}
                        </button>

                        <button
                            type="button"
                            onClick={() => setIsRegistering(!isRegistering)}
                            className="w-full text-sm text-gray-400 hover:text-white transition-colors"
                        >
                            {isRegistering
                                ? '¿Ya tienes cuenta? Inicia sesión'
                                : '¿No tienes cuenta? Regístrate'}
                        </button>
                    </form>

                    <div className="mt-6 pt-6 border-t border-white/10">
                        <p className="text-xs text-gray-500 text-center">
                            El login usa WebAuthn para autenticación segura sin contraseñas.
                            Se te solicitará usar tu huella, rostro u otro método biométrico.
                        </p>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}

export default Login;
