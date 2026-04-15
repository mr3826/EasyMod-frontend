import { Search, Download, ChevronDown } from 'lucide-react';
import { useTranslation } from 'react-i18next';

export type DateFilter = 'today' | 'last7days' | 'last30days' | 'all';
export type StatusFilter = 'all' | 'draft' | 'confirmed' | 'processing' | 'completed' | 'cancelled';

interface OrderFiltersProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  dateFilter: DateFilter;
  onDateFilterChange: (filter: DateFilter) => void;
  statusFilter: StatusFilter;
  onStatusFilterChange: (filter: StatusFilter) => void;
  onExport: () => void;
  showExportMenu: boolean;
  onToggleExportMenu: () => void;
  onExportCsv: () => void;
  onExportExcel: () => void;
  hasOrders: boolean;
}

export const OrderFilters: React.FC<OrderFiltersProps> = ({
  searchQuery,
  onSearchChange,
  dateFilter,
  onDateFilterChange,
  statusFilter,
  onStatusFilterChange,
  onExport,
  showExportMenu,
  onToggleExportMenu,
  onExportCsv,
  onExportExcel,
  hasOrders,
}) => {
  const { t } = useTranslation();

  return (
    <div className="bg-white rounded-xl border border-gray-200 p-4 mb-6">
      <div className="flex flex-col md:flex-row gap-4">
        {/* Search */}
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            placeholder={t('orders.filters.searchPlaceholder')}
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Date Filter */}
        <select
          value={dateFilter}
          onChange={(e) => onDateFilterChange(e.target.value as DateFilter)}
          aria-label={t('orders.filters.dateFilter')}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="today">{t('orders.filters.today')}</option>
          <option value="last7days">{t('orders.filters.last7Days')}</option>
          <option value="last30days">{t('orders.filters.last30Days')}</option>
          <option value="all">{t('orders.filters.allTime')}</option>
        </select>

        {/* Status Filter */}
        <select
          value={statusFilter}
          onChange={(e) => onStatusFilterChange(e.target.value as StatusFilter)}
          aria-label={t('orders.filters.statusFilter')}
          className="px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="all">{t('orders.filters.allStatuses')}</option>
          <option value="draft">{t('orders.status.draft')}</option>
          <option value="confirmed">{t('orders.status.confirmed')}</option>
          <option value="processing">{t('orders.status.processing')}</option>
          <option value="completed">{t('orders.status.completed')}</option>
          <option value="cancelled">{t('orders.status.cancelled')}</option>
        </select>

        {/* Export Dropdown */}
        <div className="relative">
          <button
            onClick={onToggleExportMenu}
            disabled={!hasOrders}
            className="flex items-center gap-2 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <Download className="w-4 h-4" />
            {t('orders.filters.export')}
            <ChevronDown className="w-4 h-4" />
          </button>

          {showExportMenu && (
            <div className="absolute right-0 mt-2 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
              <button
                onClick={onExportCsv}
                className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-50 first:rounded-t-lg"
              >
                {t('orders.filters.exportCsv')}
              </button>
              <button
                onClick={onExportExcel}
                className="w-full px-4 py-2 text-left text-gray-700 hover:bg-gray-50 last:rounded-b-lg"
              >
                {t('orders.filters.exportExcel')}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};
