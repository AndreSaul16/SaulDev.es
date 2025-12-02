import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { LogIn, LogOut, User } from 'lucide-react';
import { useAuth } from '../../contexts/AuthContext';
import Login from './Login';

function AuthButton() {
    const [showLogin, setShowLogin] = useState(false);
    const { user, isAuthenticated, logout } = useAuth();

    return (
        <>
            <motion.button
                onClick={() => (isAuthenticated ? logout() : setShowLogin(true))}
                className="fixed bottom-24 right-6 z-40 p-4 bg-gradient-to-r from-purple-500 to-pink-500 rounded-full shadow-lg hover:shadow-2xl transition-shadow"
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.9 }}
                aria-label={isAuthenticated ? 'Cerrar sesión' : 'Iniciar sesión'}
            >
                {isAuthenticated ? (
                    <LogOut className="w-6 h-6 text-white" />
                ) : (
                    <LogIn className="w-6 h-6 text-white" />
                )}
            </motion.button>

            {isAuthenticated && user && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="fixed bottom-40 right-6 z-40 bg-deep-space/90 backdrop-blur-xl border border-white/10 rounded-lg px-4 py-2 shadow-lg"
                >
                    <div className="flex items-center gap-2">
                        <User className="w-4 h-4 text-neon-cyan" />
                        <span className="text-sm text-white">{user.email}</span>
                    </div>
                </motion.div>
            )}

            <Login isOpen={showLogin} onClose={() => setShowLogin(false)} />
        </>
    );
}

export default AuthButton;
