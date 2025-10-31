export function formatCurrency(amount) {
  if (amount === undefined || amount === null) return 'KSh 0.00';
  const num = Number(amount);
  if (Number.isNaN(num)) return 'KSh 0.00';
  return `KSh ${num.toFixed(2)}`;
}

export default formatCurrency;
