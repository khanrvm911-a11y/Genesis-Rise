import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function GenesisLaunch({ onFinish, loading }) {
  const [exit, setExit] = useState(false);

  useEffect(() => {
    if (!loading) {
      const t = setTimeout(() => {
        setExit(true);
        setTimeout(onFinish, 500);
      }, 2000);
      return () => clearTimeout(t);
    }
  }, [loading, onFinish]);

  return (
    <AnimatePresence>
      {!exit && (
        <motion.div
          className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#03000a]"
          exit={{ opacity: 0 }}
          transition={{ duration: 0.5, ease: 'easeInOut' }}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-col items-center"
          >
            <div className="w-20 h-20 md:w-24 md:h-24 flex items-center justify-center bg-sl-purple/10 rounded-full border-2 border-sl-purple/30 mb-8">
              <img
                src="/igris_shadow_face.png"
                alt="Genesis Rise"
                className="w-full h-full object-cover rounded-full"
              />
            </div>

            <h1 className="text-3xl md:text-4xl font-extrabold text-white tracking-tight mb-2">
              <span className="text-white">GENESIS</span>{' '}
              <span className="text-amber-400/90" style={{ fontFamily: "'Cinzel', serif" }}>RISE</span>
            </h1>

            <div className="mt-6 w-40 h-1 bg-sl-gray/40 rounded-full overflow-hidden">
              <motion.div
                className="h-full rounded-full bg-gradient-to-r from-sl-purple to-amber-400"
                initial={{ width: '0%' }}
                animate={{ width: '100%' }}
                transition={{ duration: 1.8, ease: 'easeInOut' }}
              />
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
