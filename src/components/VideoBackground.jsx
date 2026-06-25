import { useState, useRef, useEffect } from 'react';

const VideoBackground = ({ src, type = 'video/mp4' }) => {
  const [hasError, setHasError] = useState(false);
  const videoRef = useRef(null);

  useEffect(() => {
    const el = videoRef.current;
    if (!el) return;

    const handleError = () => setHasError(true);
    el.addEventListener('error', handleError, { once: true });
    return () => el.removeEventListener('error', handleError);
  }, []);

  if (hasError) return null;

  return (
    <video
      ref={videoRef}
      autoPlay
      muted
      loop
      playsInline
      preload="metadata"
      className="absolute inset-0 w-full h-full object-cover"
    >
      <source src={src} type={type} />
    </video>
  );
};

export default VideoBackground;
