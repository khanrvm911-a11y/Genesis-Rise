import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function GenesisLaunch({ onFinish, loading }) {
  const [showContent, setShowContent] = useState(false);
  const [exit, setExit] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setShowContent(true), 200);
    return () => clearTimeout(t1);
  }, []);

  useEffect(() => {
    if (!loading) {
      const t = setTimeout(() => {
        setExit(true);
        setTimeout(onFinish, 1200);
      }, 1200);
      return () => clearTimeout(t);
    }
  }, [loading, onFinish]);

  return (
    <AnimatePresence>
      {!exit && (
        <motion.div
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#03000a] overflow-hidden"
          exit={{ opacity: 0, scale: 1.08, filter: 'blur(12px)' }}
          transition={{ duration: 1.2, ease: [0.22, 1, 0.36, 1] }}
        >
          <div className="absolute inset-0 pointer-events-none">
            <motion.div
              className="absolute top-1/4 left-1/3 w-[500px] h-[500px] bg-sl-purple/10 rounded-full blur-3xl"
              animate={{ scale: [1, 1.2, 1], opacity: [0.3, 0.6, 0.3] }}
              transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
            />
            <motion.div
              className="absolute bottom-1/3 right-1/4 w-[400px] h-[400px] bg-amber-500/8 rounded-full blur-3xl"
              animate={{ scale: [1, 1.3, 1], opacity: [0.2, 0.5, 0.2] }}
              transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut', delay: -2 }}
            />
            <motion.div
              className="absolute top-1/3 right-1/3 w-[350px] h-[350px] bg-fuchsia-500/8 rounded-full blur-3xl"
              animate={{ scale: [1, 1.15, 1], opacity: [0.15, 0.4, 0.15] }}
              transition={{ duration: 4.5, repeat: Infinity, ease: 'easeInOut', delay: -3 }}
            />
            <motion.div
              className="absolute bottom-1/4 left-1/4 w-[300px] h-[300px] bg-blue-500/6 rounded-full blur-3xl"
              animate={{ scale: [1, 1.25, 1], opacity: [0.1, 0.3, 0.1] }}
              transition={{ duration: 6, repeat: Infinity, ease: 'easeInOut', delay: -1.5 }}
            />
          </div>

          <div className="absolute inset-0 pointer-events-none" style={{
            background: 'radial-gradient(ellipse at center, transparent 30%, rgba(3,0,10,0.9) 100%)',
          }} />

          <div className="relative z-10 flex flex-col items-center">
            <motion.div
              initial={{ opacity: 0, scale: 0.2, rotate: -10 }}
              animate={showContent ? { opacity: 1, scale: 1, rotate: 0 } : {}}
              transition={{ duration: 1.4, ease: [0.16, 1, 0.3, 1], delay: 0.3 }}
              className="relative"
            >
              <motion.div
                className="absolute inset-0 bg-sl-purple/20 rounded-full blur-3xl scale-150"
                animate={{ scale: [1.4, 1.6, 1.4], opacity: [0.4, 0.7, 0.4] }}
                transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
              />
              <motion.div
                className="absolute inset-0 bg-amber-500/10 rounded-full blur-2xl scale-125"
                animate={{ scale: [1.2, 1.4, 1.2], opacity: [0.2, 0.5, 0.2] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut', delay: -1 }}
              />
              <div className="w-32 h-32 md:w-36 md:h-36 flex items-center justify-center bg-sl-purple/10 rounded-full border-2 border-sl-purple/40 shadow-[0_0_80px_rgba(139,92,246,0.4)] overflow-hidden relative">
                <motion.img
                  src="/igris_shadow_face.png"
                  alt="Genesis Rise"
                  className="w-full h-full object-cover"
                  initial={{ filter: 'brightness(0.3) saturate(0.5)', scale: 1.1 }}
                  animate={{
                    filter: 'brightness(1) saturate(1)',
                    scale: 1,
                  }}
                  transition={{ duration: 2.5, delay: 0.5, ease: [0.16, 1, 0.3, 1] }}
                />
              </div>
            </motion.div>

            <motion.div
              className="mt-10 text-center"
              initial={{ opacity: 0, y: 30 }}
              animate={showContent ? { opacity: 1, y: 0 } : {}}
              transition={{ duration: 1, delay: 0.8, ease: [0.16, 1, 0.3, 1] }}
            >
              <motion.p
                className="text-sm md:text-base text-sl-purple-light/80 font-medium tracking-[0.4em] uppercase mb-2"
                initial={{ opacity: 0, letterSpacing: '0.8em' }}
                animate={{ opacity: 1, letterSpacing: '0.4em' }}
                transition={{ duration: 1.5, delay: 1, ease: [0.16, 1, 0.3, 1] }}
              >
                Entering
              </motion.p>

              <motion.h1
                className="text-5xl md:text-6xl font-extrabold tracking-tight"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 1, delay: 1.4, ease: [0.16, 1, 0.3, 1] }}
              >
                <motion.span
                  className="text-white inline-block"
                  animate={{ textShadow: ['0 0 20px rgba(139,92,246,0)', '0 0 40px rgba(139,92,246,0.4)', '0 0 20px rgba(139,92,246,0)'] }}
                  transition={{ duration: 2.5, delay: 2, repeat: Infinity, ease: 'easeInOut' }}
                >
                  GENESIS
                </motion.span>
              </motion.h1>

              <motion.div
                className="mt-1 flex items-center justify-center gap-3"
                initial={{ opacity: 0, scaleX: 0 }}
                animate={{ opacity: 1, scaleX: 1 }}
                transition={{ duration: 0.8, delay: 1.8, ease: [0.16, 1, 0.3, 1] }}
              >
                <motion.div
                  className="h-px w-12 bg-gradient-to-r from-transparent via-amber-400/60 to-transparent"
                  animate={{ opacity: [0.3, 0.8, 0.3] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
                />
                <motion.p
                  className="text-xl md:text-2xl font-bold text-amber-400/80 tracking-[0.3em]"
                  style={{ fontFamily: "'Cinzel', serif" }}
                  animate={{ textShadow: ['0 0 10px rgba(251,191,36,0)', '0 0 30px rgba(251,191,36,0.3)', '0 0 10px rgba(251,191,36,0)'] }}
                  transition={{ duration: 2, delay: 2.2, repeat: Infinity, ease: 'easeInOut' }}
                >
                  RISE
                </motion.p>
                <motion.div
                  className="h-px w-12 bg-gradient-to-r from-transparent via-amber-400/60 to-transparent"
                  animate={{ opacity: [0.3, 0.8, 0.3] }}
                  transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut', delay: 1 }}
                />
              </motion.div>

              <motion.div
                className="mt-6 mx-auto w-32 h-0.5 rounded-full bg-gradient-to-r from-transparent via-sl-purple/60 to-transparent"
                initial={{ scaleX: 0, opacity: 0 }}
                animate={{ scaleX: 1, opacity: 1 }}
                transition={{ duration: 1.2, delay: 2.2, ease: [0.16, 1, 0.3, 1] }}
              />
            </motion.div>

            <motion.div
              className="mt-10"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 2.5 }}
            >
              <span className="text-xs text-sl-purple-light/40 font-mono tracking-widest">
                <span className="inline-flex gap-1.5">
                  {[0, 1, 2].map((i) => (
                    <motion.span
                      key={i}
                      className="w-1.5 h-1.5 rounded-full bg-sl-purple-light/50"
                      animate={{ opacity: [0.2, 0.8, 0.2], scale: [0.8, 1.2, 0.8] }}
                      transition={{ duration: 1.2, delay: 2.8 + i * 0.2, repeat: Infinity, ease: 'easeInOut' }}
                    />
                  ))}
                </span>
              </span>
            </motion.div>
          </div>

          <motion.p
            className="absolute bottom-8 text-[9px] text-sl-gray-light/20 font-mono tracking-[0.3em]"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.5, delay: 3 }}
          >
            Genesis Rise
          </motion.p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
