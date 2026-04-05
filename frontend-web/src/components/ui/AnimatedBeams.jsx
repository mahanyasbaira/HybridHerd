export function AnimatedBeams() {
  return (
    <svg
      className="absolute inset-0 w-full h-full overflow-hidden pointer-events-none"
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 1000 1000"
    >
      <defs>
        <linearGradient id="beam1" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="rgba(139, 92, 246, 0.5)" />
          <stop offset="100%" stopColor="rgba(139, 92, 246, 0)" />
        </linearGradient>
        <linearGradient id="beam2" x1="100%" y1="0%" x2="0%" y2="100%">
          <stop offset="0%" stopColor="rgba(168, 85, 247, 0.4)" />
          <stop offset="100%" stopColor="rgba(168, 85, 247, 0)" />
        </linearGradient>
        <linearGradient id="beam3" x1="50%" y1="0%" x2="50%" y2="100%">
          <stop offset="0%" stopColor="rgba(126, 34, 206, 0.3)" />
          <stop offset="100%" stopColor="rgba(126, 34, 206, 0)" />
        </linearGradient>
      </defs>

      <line
        x1="0"
        y1="0"
        x2="1000"
        y2="1000"
        stroke="url(#beam1)"
        strokeWidth="2"
        strokeDasharray="1000"
        className="animate-beam-slide"
      />

      <line
        x1="1000"
        y1="0"
        x2="0"
        y2="1000"
        stroke="url(#beam2)"
        strokeWidth="2"
        strokeDasharray="1000"
        className="animate-beam-slide"
        style={{ animationDelay: '0.5s' }}
      />

      <line
        x1="500"
        y1="0"
        x2="500"
        y2="1000"
        stroke="url(#beam3)"
        strokeWidth="2"
        strokeDasharray="1000"
        className="animate-beam-slide"
        style={{ animationDelay: '1s' }}
      />
    </svg>
  );
}
