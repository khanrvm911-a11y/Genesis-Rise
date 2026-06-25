import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';

const particles = Array.from({ length: 20 }, (_, i) => ({
  id: i,
  x: Math.random() * 100,
  y: Math.random() * 100,
  size: Math.random() * 4 + 1,
  delay: Math.random() * 0.8,
  duration: Math.random() * 0.6 + 0.4,
}));

const LoginTransition = ({ onComplete }) => {
  const navigate = useNavigate();

  useEffect(() => {
    const navigateTimer = setTimeout(() => {
      navigate('/', { replace: true });
    }, 2400);

    const cleanupTimer = setTimeout(() => {
      onComplete?.();
    }, 2800);

    return () => {
      clearTimeout(navigateTimer);
      clearTimeout(cleanupTimer);
    };
  }, [navigate, onComplete]);

  return (
    <motion.div
      className="fixed inset-0 z-[9999] flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.2, ease: 'easeOut' }}
    >
      <div className="absolute inset-0 bg-black" />

      <div className="absolute inset-0 pointer-events-none" style={{
        background: 'radial-gradient(ellipse at center, transparent 40%, rgba(0,0,0,0.8) 100%)',
      }} />

      <div className="absolute inset-0 border-t-4 border-b-4 border-[#7c3aed]/0 pointer-events-none" />

      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-full bg-[#c084fc]"
          style={{
            left: `${p.x}%`,
            top: `${p.y}%`,
            width: p.size,
            height: p.size,
          }}
          initial={{ opacity: 0, scale: 0 }}
          animate={{
            opacity: [0, 0.8, 0],
            scale: [0, 1.5, 0],
            y: [0, -80],
            x: [0, (p.id % 2 === 0 ? 1 : -1) * 40],
          }}
          transition={{
            duration: p.duration,
            delay: p.delay + 0.6,
            ease: 'easeOut',
          }}
        />
      ))}

      <motion.div
        className="absolute inset-0 pointer-events-none"
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 0.4, 0] }}
        transition={{ duration: 0.3, delay: 0.7, ease: 'easeOut' }}
        style={{
          background: 'radial-gradient(circle at center, rgba(168,85,247,0.6) 0%, transparent 60%)',
        }}
      />

      <motion.div
        className="relative z-10 flex flex-col items-center"
        initial={{ opacity: 0, scale: 0.3 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1], delay: 0.15 }}
      >
        <motion.div
          animate={{
            scale: [1, 1.08, 1],
            filter: [
              'brightness(1) drop-shadow(0 0 20px rgba(139,92,246,0.3))',
              'brightness(1.3) drop-shadow(0 0 50px rgba(139,92,246,0.8))',
              'brightness(1) drop-shadow(0 0 20px rgba(139,92,246,0.3))',
            ],
          }}
          transition={{ duration: 2, repeat: Infinity, ease: 'easeInOut' }}
          className="w-48 h-48 rounded-full overflow-hidden border-2 border-[#7c3aed]/40"
          style={{
            boxShadow: '0 0 60px rgba(139,92,246,0.3), inset 0 0 40px rgba(139,92,246,0.1)',
          }}
        >
          <img
            src="/igris_shadow_face.png"
            alt=""
            className="w-full h-full object-cover"
            draggable={false}
          />
        </motion.div>

        <motion.div
          className="mt-6 h-0.5 rounded-full bg-gradient-to-r from-transparent via-[#c084fc] to-transparent"
          initial={{ width: 0, opacity: 0 }}
          animate={{ width: 220, opacity: 1 }}
          transition={{ duration: 0.6, ease: 'easeOut', delay: 0.4 }}
        />

        <motion.p
          className="mt-5 text-2xl font-bold tracking-[0.3em] uppercase"
          style={{
            background: 'linear-gradient(135deg, #c084fc, #a855f7, #7c3aed)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
            fontFamily: "'Cinzel', serif",
            textShadow: '0 0 30px rgba(139,92,246,0.3)',
          }}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut', delay: 0.6 }}
        >
          Entering Genesis
        </motion.p>

        <motion.div
          className="mt-2 flex gap-1"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.9 }}
        >
          {[0, 1, 2].map((i) => (
            <motion.div
              key={i}
              className="w-1.5 h-1.5 rounded-full bg-[#c084fc]"
              animate={{ opacity: [0.3, 1, 0.3] }}
              transition={{ duration: 1, delay: 1 + i * 0.2, repeat: Infinity }}
            />
          ))}
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default LoginTransition;
