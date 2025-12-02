import React, { Suspense } from 'react';
import { Canvas } from '@react-three/fiber';
import Scene from './components/Canvas/Scene';
import Hero from './components/UI/Hero';
import Navbar from './components/UI/Navbar';
import CustomCursor from './components/UI/CustomCursor';
import About from './components/UI/About';
import Skills from './components/UI/Skills';
import Experience from './components/UI/Experience';
import Projects from './components/UI/Projects';
import Contact from './components/UI/Contact';
import FeaturedProjects from './components/UI/FeaturedProjects';
import Chatbot from './components/UI/Chatbot';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import AuthButton from './components/Auth/AuthButton';
import BlogList from './components/Blog/BlogList';
import BlogEditor from './components/Blog/BlogEditor';
import { useState, useEffect } from 'react';

function AppContent() {
  const [currentView, setCurrentView] = useState('home');
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    const handleHashChange = () => {
      const hash = window.location.hash.replace('#', '');
      setCurrentView(hash || 'home');
    };

    window.addEventListener('hashchange', handleHashChange);
    handleHashChange(); // Check on mount

    return () => {
      window.removeEventListener('hashchange', handleHashChange);
    };
  }, []);

  return (
    <div className="relative w-full min-h-screen bg-deep-space text-white overflow-x-hidden selection:bg-neon-cyan selection:text-deep-space">
      <CustomCursor />
      <Navbar />

      {/* Background 3D Scene */}
      <div className="fixed top-0 left-0 w-full h-full z-0">
        <Canvas camera={{ position: [0, 0, 10], fov: 45 }}>
          <Suspense fallback={null}>
            <Scene />
          </Suspense>
        </Canvas>
      </div>

      {/* Main Content */}
      {currentView === 'blog' ? (
        <main className="relative z-10">
          {isAuthenticated ? <BlogEditor /> : <BlogList />}
        </main>
      ) : (
        <main className="relative z-10">
          <Hero />
          <About />
          <Skills />
          <Experience />
          <Projects />
          <FeaturedProjects />
          <Contact />

          <footer className="py-6 text-center text-gray-500 text-sm bg-black/20 backdrop-blur-md">
            <p>© {new Date().getFullYear()} Saúl Briceño. Built with React, Three.js & GSAP.</p>
          </footer>
        </main>
      )}

      {/* Auth and Chatbot buttons */}
      <AuthButton />
      <Chatbot />
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
