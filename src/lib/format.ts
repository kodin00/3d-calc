export const formatIDR = (n: number): string =>
  new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    maximumFractionDigits: 0,
  }).format(n);

export const formatPercent = (n: number): string =>
  `${n >= 0 ? '+' : ''}${n.toFixed(1)}%`;

export const formatGrams = (n: number): string =>
  n >= 1000 ? `${(n / 1000).toFixed(2)} kg` : `${n.toFixed(1)} g`;
