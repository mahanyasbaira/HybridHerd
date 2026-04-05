export const RISK_COLORS = {
  Low: { bg: '#16a34a', text: '#ffffff', label: 'Low Risk', border: '#16a34a', lightBg: '#dcfce7', lightText: '#14532d' },
  Medium: { bg: '#d97706', text: '#ffffff', label: 'Medium Risk', border: '#d97706', lightBg: '#fef3c7', lightText: '#78350f' },
  High: { bg: '#dc2626', text: '#ffffff', label: 'High Risk', border: '#dc2626', lightBg: '#fee2e2', lightText: '#7f1d1d' },
};

export function getRiskColors(level) {
  return RISK_COLORS[level] ?? RISK_COLORS.Low;
}
