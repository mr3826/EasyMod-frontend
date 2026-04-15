import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';

export interface Order {
  id: string;
  customerName: string;
  customerPhone?: string;
  total: number;
  status: string;
  channel: string;
  createdAt: string;
}

export const useOrderFormatters = () => {
  const { i18n } = useTranslation();

  const currencyFormatter = useMemo(
    () =>
      new Intl.NumberFormat(i18n.language === 'bn' ? 'bn-BD' : 'en-US', {
        style: 'currency',
        currency: 'BDT',
        minimumFractionDigits: 2,
      }),
    [i18n.language]
  );

  const formatCurrency = (value: number): string => {
    return currencyFormatter.format(Number(value || 0));
  };

  const formatDate = (value: string): string => {
    return new Date(value).toLocaleString(i18n.language === 'bn' ? 'bn-BD' : 'en-US');
  };

  return { formatCurrency, formatDate };
};

export const buildCsv = (rows: Record<string, string | number>[]): string => {
  if (rows.length === 0) return '';

  const headers = Object.keys(rows[0]);

  const escapeCsv = (value: string | number): string => {
    const text = String(value ?? '');
    if (text.includes(',') || text.includes('"') || text.includes('\n')) {
      return `"${text.replace(/"/g, '""')}"`;
    }
    return text;
  };

  const lines = [headers.join(',')];
  rows.forEach((row) => {
    lines.push(headers.map((header) => escapeCsv(row[header] ?? '')).join(','));
  });

  return lines.join('\n');
};

export const downloadFile = (content: string, filename: string, type: string): void => {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
};

export const statusColors: Record<string, string> = {
  draft: 'bg-gray-100 text-gray-700',
  confirmed: 'bg-blue-100 text-blue-700',
  processing: 'bg-yellow-100 text-yellow-700',
  completed: 'bg-green-100 text-green-700',
  cancelled: 'bg-red-100 text-red-700',
};

export const statusIcons: Record<string, string> = {
  draft: '⏸️',
  confirmed: '✅',
  processing: '⏳',
  completed: '🎉',
  cancelled: '❌',
};
