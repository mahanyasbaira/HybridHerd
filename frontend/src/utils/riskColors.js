export const RISK_COLORS = {
  Low: { bg: '#16a34a', text: '#ffffff', label: 'Low' },
  Medium: { bg: '#ca8a04', text: '#ffffff', label: 'Medium' },
  High: { bg: '#dc2626', text: '#ffffff', label: 'High' },
};

export function getRiskColors(level) {
  return RISK_COLORS[level] ?? RISK_COLORS.Low;
}
