import { useEffect, useRef } from 'react';
import { useTheme } from '../../context/ThemeContext';

export function DottedBackground({
  dotColor = 'rgba(20, 184, 166, 0.25)',
  dotSize = 1.5,
  gap = 30,
}) {
  const canvasRef = useRef(null);
  const { theme } = useTheme();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext('2d');
    const animationPhases = new Map();

    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };

    const generatePhase = () => Math.random() * Math.PI * 2;

    const bgColor = theme === 'dark' ? '#050810' : '#f8fafc';
    const dotColorActual = theme === 'dark' ? 'rgba(20, 184, 166, 0.25)' : 'rgba(20, 184, 166, 0.35)';

    const animate = () => {
      ctx.fillStyle = bgColor;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      const cols = Math.ceil(canvas.width / gap);
      const rows = Math.ceil(canvas.height / gap);

      for (let x = 0; x < cols; x++) {
        for (let y = 0; y < rows; y++) {
          const dotX = x * gap;
          const dotY = y * gap;
          const key = `${x},${y}`;

          if (!animationPhases.has(key)) {
            animationPhases.set(key, generatePhase());
          }

          const phase = animationPhases.get(key);
          const opacity =
            (0.3 + 0.7 * Math.sin(Date.now() * 0.001 + phase)) / 2;

          ctx.fillStyle = dotColorActual.replace(
            /[\d.]+\)/,
            `${opacity})`
          );
          ctx.beginPath();
          ctx.arc(dotX, dotY, dotSize, 0, Math.PI * 2);
          ctx.fill();
        }
      }

      requestAnimationFrame(animate);
    };

    resizeCanvas();
    animate();

    window.addEventListener('resize', resizeCanvas);
    return () => window.removeEventListener('resize', resizeCanvas);
  }, [dotColor, dotSize, gap, theme]);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 z-0 pointer-events-none"
    />
  );
}
