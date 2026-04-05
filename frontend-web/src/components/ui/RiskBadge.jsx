export function RiskBadge({ risk, flagged }) {
  let bgColor = 'bg-emerald-500/20';
  let textColor = 'text-emerald-300';
  let dotColor = 'bg-emerald-500';
  let label = 'Low Risk';

  if (flagged && risk === 'High') {
    bgColor = 'bg-amber-400/20';
    textColor = 'text-amber-300';
    dotColor = 'bg-amber-400';
    label = 'Flagged · High';
  } else if (flagged) {
    bgColor = 'bg-amber-400/20';
    textColor = 'text-amber-300';
    dotColor = 'bg-amber-400';
    label = 'Flagged';
  } else if (risk === 'High') {
    bgColor = 'bg-red-500/20';
    textColor = 'text-red-300';
    dotColor = 'bg-red-500';
    label = 'High Risk';
  } else if (risk === 'Medium') {
    bgColor = 'bg-amber-500/20';
    textColor = 'text-amber-300';
    dotColor = 'bg-amber-500';
    label = 'Medium Risk';
  }

  return (
    <div className={`${bgColor} ${textColor} rounded-full px-3 py-1 text-xs font-medium inline-flex items-center gap-2`}>
      <span className={`w-2 h-2 rounded-full ${dotColor}`} />
      {label}
    </div>
  );
}
