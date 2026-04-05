export function GlassCard({ className = '', children, onClick }) {
  return (
    <div
      onClick={onClick}
      className={`
        bg-white border border-slate-200 shadow-sm
        dark:bg-white/5 dark:backdrop-blur-md dark:border-white/10 dark:shadow-none
        hover:border-slate-300 dark:hover:border-white/20
        rounded-2xl transition-colors
        ${className}
      `}
    >
      {children}
    </div>
  );
}
