import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function GenesisLaunch({ onFinish, loading }) {
  const [progress, setProgress] = useState(0);
  const [showContent, setShowContent] = useState(false);
  const [exit, setExit] = useState(false);
  const progressRef = useRef(0);
  const rafRef = useRef(null);

  useEffect(() => {
    const t1 = setTimeout(() => setShowContent(true), 100);
    return () => clearTimeout(t1);
  }, []);

  useEffect(() => {
    if (!loading) {
      const start = performance.now();
      const duration = 800;
      const animate = (now) => {
        const elapsed = now - start;
        const p = Math.min(elapsed / duration, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        progressRef.current = eased;
        setProgress(eased);
        if (p < 1) {
          rafRef.current = requestAnimationFrame(animate);
        } else {
          const t = setTimeout(() => {
            setExit(true);
            setTimeout(onFinish, 800);
          }, 400);
          return () => clearTimeout(t);
        }
      };
      rafRef.current = requestAnimationFrame(animate);
      return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
    } else {
      const start = performance.now();
      const duration = 3000;
      const animate = (now) => {
        const elapsed = now - start;
        const raw = Math.min(elapsed / duration, 0.85);
        progressRef.current = raw;
        setProgress(raw);
        if (raw < 0.85) {
          rafRef.current = requestAnimationFrame(animate);
        }
      };
      rafRef.current = requestAnimationFrame(animate);
      return () => { if (rafRef.current) cancelAnimationFrame(rafRef.current); };
    }
  }, [loading, onFinish]);

  return (
    <AnimatePresence>
      {!exit && (
        <motion.div
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#03000a] overflow-hidden"
          exit={{ opacity: 0, scale: 1.05, filter: 'blur(8px)' }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute top-1/4 left-1/3 w-[400px] h-[400px] bg-sl-purple/8 rounded-full blur-3xl animate-pulse-slow" />
            <div className="absolute bottom-1/3 right-1/4 w-[350px] h-[350px] bg-amber-500/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '-2s' }} />
            <div className="absolute top-1/2 right-1/3 w-[300px] h-[300px] bg-sl-purple/5 rounded-full blur-3xl animate-float" style={{ animationDelay: '-4s' }} />
          </div>

          <div className="relative z-10 flex flex-col items-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.3 }}
              animate={showContent ? { opacity: 1, scale: 1 } : {}}
              transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1], delay: 0.3 }}
              className="relative"
            >
              <div className="absolute inset-0 bg-sl-purple/20 rounded-full blur-3xl scale-150 animate-pulse-slow" />
              <div className="w-28 h-28 md:w-32 md:h-32 flex items-center justify-center bg-sl-purple/10 rounded-full border-2 border-sl-purple/30 shadow-[0_0_60px_rgba(139,92,246,0.3)] overflow-hidden relative">
                <motion.img
                  src="/igris_shadow_face.png"
                  alt="Genesis Rise"
                  className="w-full h-full object-cover"
                  initial={{ filter: 'brightness(0.5)' }}
                  animate={{ filter: 'brightness(1)' }}
                  transition={{ duration: 2, delay: 0.5 }}
                />
              </div>
            </motion.div>

            <motion.div
              className="mt-8 text-center"
              initial={{ opacity: 0, y: 20 }}
              animate={showContent ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 0.8, delay: 0.6 }}
            >
              <motion.p
                className="text-sm md:text-base text-sl-purple-light/80 font-medium tracking-[0.3em] uppercase mb-1"
                initial={{ opacity: 0, letterSpacing: '0.5em' }}
                animate={{ opacity: 1, letterSpacing: '0.3em' }}
                transition={{ duration: 1.2, delay: 0.8 }}
              >
                Entering
              </motion.p>

              <motion.h1
                className="text-4xl md:text-5xl font-extrabold tracking-tight"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.8, delay: 1.2 }}
              >
                <span className="text-white">GENESIS</span>
              </motion.h1>

              <motion.p
                className="text-lg md:text-xl font-bold text-amber-400/80 tracking-[0.2em] mt-0.5"
                style={{ fontFamily: "'Cinzel', serif" }}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 0.8, delay: 1.6 }}
              >
                RISE
              </motion.p>
            </motion.div>

            <motion.div
              className="mt-10 w-48 md:w-56"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.6, delay: 1.0 }}
            >
              <div className="w-full h-1 bg-sl-gray/30 rounded-full overflow-hidden">
                <motion.div
                  className="h-full rounded-full"
                  style={{
                    width: `${progress * 100}%`,
                    background: 'linear-gradient(90deg, #8b5cf6, #f59e0b)',
                    boxShadow: '0 0 10px rgba(139,92,246,0.4)',
                  }}
                />
              </div>
              <p className="text-[10px] text-sl-gray-light/40 text-center mt-2 font-mono tracking-wider">
                {Math.round(progress * 100)}%
              </p>
            </motion.div>
          </div>

          <motion.p
            className="absolute bottom-8 text-[9px] text-sl-gray-light/20 font-mono tracking-[0.2em]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 2 }}
          >
            Genesis Rise
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
