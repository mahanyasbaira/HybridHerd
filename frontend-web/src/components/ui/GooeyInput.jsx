export function GooeyInput({ value, onChange, placeholder, type = 'text', name, className = '', required }) {
  return (
    <div className={`relative ${className}`}>
      <div className="bg-slate-100 border border-slate-200 dark:bg-white/5 dark:border-white/10 rounded-full px-6 py-3 focus-within:border-teal-400 dark:focus-within:border-teal-400 transition-colors">
        <input
          type={type}
          name={name}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          className="w-full bg-transparent text-slate-900 dark:text-white placeholder-slate-400 dark:placeholder-slate-500 outline-none text-sm"
        />
      </div>
    </div>
  );
}
