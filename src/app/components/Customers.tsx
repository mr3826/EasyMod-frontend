import { useState, useEffect } from "react";
import { 
  Users, 
  Search,
  X,
  Trash2,
  ChevronLeft,
  ChevronRight,
  UserPlus,
  Phone,
  Mail,
  MessageSquare,
  Calendar,
  Hash,
  Filter,
  ShieldAlert,
  ShieldOff
} from "lucide-react";
import { toast } from "sonner";
import { apiClient, Customer, CustomerFilters } from "../lib/api";


const channelIcons: Record<string, { icon: any; color: string; bgColor: string; label: string }> = {
  facebook: { icon: MessageSquare, color: "text-blue-600", bgColor: "bg-blue-50", label: "Facebook" },
  whatsapp: { icon: MessageSquare, color: "text-green-600", bgColor: "bg-green-50", label: "WhatsApp" },
  webchat: { icon: MessageSquare, color: "text-purple-600", bgColor: "bg-purple-50", label: "Web Chat" },
  telegram: { icon: MessageSquare, color: "text-sky-600", bgColor: "bg-sky-50", label: "Telegram" },
  manual: { icon: UserPlus, color: "text-gray-600", bgColor: "bg-gray-50", label: "Manual" },
};

const channels = [
  { value: 'all', label: 'All Channels' },
  { value: 'facebook', label: 'Facebook' },
  { value: 'whatsapp', label: 'WhatsApp' },
  { value: 'telegram', label: 'Telegram' },
  { value: 'webchat', label: 'Web Chat' },
  { value: 'manual', label: 'Manual' },
];

export default function Customers() {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [channelFilter, setChannelFilter] = useState<string>("all");
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const [showCreateCustomer, setShowCreateCustomer] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [togglingBlacklist, setTogglingBlacklist] = useState(false);
  
  const [newCustomer, setNewCustomer] = useState({
    name: "",
    number: "",
    email: "",
    channel: "" as const,
  });

  const itemsPerPage = 10;

  // Fetch customers on mount
  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const data = await apiClient.getCustomers();
      setCustomers(data);
    } catch (err: any) {
      setError(err.message || 'Failed to fetch customers');
      console.error('Error fetching customers:', err);
    } finally {
      setIsLoading(false);
    }
  };

  const handleCreateCustomer = async () => {
    if (!newCustomer.name || !newCustomer.number || !newCustomer.channel) {
      setError('Please fill in all required fields');
      return;
    }

    try {
      setIsSubmitting(true);
      const created = await apiClient.createCustomer({
        name: newCustomer.name,
        number: newCustomer.number,
        email: newCustomer.email || undefined,
        channel: newCustomer.channel,
      });
      
      setCustomers([created, ...customers]);
      setShowCreateCustomer(false);
      setNewCustomer({ name: "", number: "", email: "", channel: "" as const });
      setError(null);
      toast.success('Customer created successfully');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to create customer');
      setError(err.response?.data?.message || 'Failed to create customer');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteCustomer = async (customerId: string) => {
    try {
      setIsSubmitting(true);
      await apiClient.deleteCustomer(customerId);
      setCustomers(customers.filter(c => c.id !== customerId));
      setShowDeleteConfirm(null);
      if (selectedCustomer?.id === customerId) {
        setSelectedCustomer(null);
      }
      toast.success('Customer deleted');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to delete customer');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleBlacklist = async (customer: Customer) => {
    try {
      setTogglingBlacklist(true);
      const updated = customer.blacklisted
        ? await apiClient.unblacklistCustomer(customer.id)
        : await apiClient.blacklistCustomer(customer.id);
      setCustomers(customers.map(c => c.id === customer.id ? updated : c));
      setSelectedCustomer(updated);
      toast.success(updated.blacklisted ? 'Customer blacklisted' : 'Customer removed from blacklist');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update blacklist status');
    } finally {
      setTogglingBlacklist(false);
    }
  };

  const handleUpdateCustomer = async (customerId: string, updates: Partial<Customer>) => {
    try {
      setIsSubmitting(true);
      const updated = await apiClient.updateCustomer(customerId, updates);
      setCustomers(customers.map(c => c.id === customerId ? updated : c));
      setSelectedCustomer(updated);
      toast.success('Customer updated');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update customer');
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filter customers
  const filteredCustomers = customers.filter(customer => {
    const matchesSearch = 
      searchQuery === "" || 
      customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      customer.number.includes(searchQuery) ||
      (customer.email && customer.email.toLowerCase().includes(searchQuery.toLowerCase()));
    
    const matchesChannel = 
      channelFilter === "all" || 
      customer.channel === channelFilter;

    return matchesSearch && matchesChannel;
  });

  // Pagination
  const totalPages = Math.ceil(filteredCustomers.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const paginatedCustomers = filteredCustomers.slice(startIndex, endIndex);

  // Calculate channel customer count (exclude manual)
  const channelCustomers = customers.filter(c => c.channel !== 'manual').length;

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Customer Management</h1>
          <p className="text-gray-600">Manage and track all your customers in one place</p>
        </div>

        {/* Summary Cards - Only 3 boxes as requested */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          {/* Total Customers */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Total Customers</p>
                <p className="text-3xl font-bold text-gray-900">{customers.length}</p>
              </div>
              <div className="w-14 h-14 bg-blue-50 rounded-xl flex items-center justify-center">
                <Users className="w-7 h-7 text-blue-600" />
              </div>
            </div>
          </div>

          {/* Channel Customers */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Channel Customers</p>
                <p className="text-3xl font-bold text-gray-900">{channelCustomers}</p>
                <p className="text-xs text-gray-500 mt-1">WhatsApp, Facebook, etc.</p>
              </div>
              <div className="w-14 h-14 bg-green-50 rounded-xl flex items-center justify-center">
                <MessageSquare className="w-7 h-7 text-green-600" />
              </div>
            </div>
          </div>

          {/* Manual Customers */}
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 mb-1">Manual Customers</p>
                <p className="text-3xl font-bold text-gray-900">{customers.filter(c => c.channel === 'manual').length}</p>
                <p className="text-xs text-gray-500 mt-1">Manually added</p>
              </div>
              <div className="w-14 h-14 bg-purple-50 rounded-xl flex items-center justify-center">
                <UserPlus className="w-7 h-7 text-purple-600" />
              </div>
            </div>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
            <X className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm font-medium text-red-900">{error}</p>
            </div>
            <button
              onClick={() => setError(null)}
              className="text-red-400 hover:text-red-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Search and Filter Bar */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            {/* Search */}
            <div className="flex-1 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by name, phone, or email..."
                className="w-full pl-12 pr-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Channel Filter */}
            <div className="md:w-64">
              <select
                value={channelFilter}
                onChange={(e) => setChannelFilter(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
              >
                {channels.map((channel) => (
                  <option key={channel.value} value={channel.value}>
                    {channel.label}
                  </option>
                ))}
              </select>
            </div>

            {/* Add Customer Button */}
            <button
              onClick={() => setShowCreateCustomer(true)}
              className="flex items-center justify-center gap-2 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 transition-colors whitespace-nowrap"
            >
              <UserPlus className="w-5 h-5" />
              Add Customer
            </button>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
            <div className="inline-block animate-spin rounded-full h-10 w-10 border-4 border-blue-600 border-t-transparent mb-4"></div>
            <p className="text-gray-600">Loading customers...</p>
          </div>
        )}

        {/* Customer List */}
        {!isLoading && (
          <>
            {filteredCustomers.length === 0 ? (
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-12 text-center">
                <Users className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No customers found</h3>
                <p className="text-gray-600">Try adjusting your search or filters</p>
              </div>
            ) : (
              <>
                <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden mb-6">
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Customer</th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Contact</th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Channel</th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">RTO Risk</th>
                          <th className="px-6 py-4 text-left text-xs font-semibold text-gray-600 uppercase tracking-wider">Created</th>
                          <th className="px-6 py-4 text-right text-xs font-semibold text-gray-600 uppercase tracking-wider">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {paginatedCustomers.map((customer) => {
                          const ChannelIcon = channelIcons[customer.channel]?.icon || MessageSquare;
                          return (
                            <tr key={customer.id} className="hover:bg-gray-50 transition-colors">
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-3">
                                  <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white font-semibold">
                                    {customer.name.charAt(0).toUpperCase()}
                                  </div>
                                  <div>
                                    <p className="font-medium text-gray-900">{customer.name}</p>
                                    <p className="text-sm text-gray-500">ID: {customer.id.slice(0, 8)}</p>
                                  </div>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <div className="space-y-1">
                                  <div className="flex items-center gap-2 text-sm text-gray-900">
                                    <Phone className="w-4 h-4 text-gray-400" />
                                    {customer.number}
                                  </div>
                                  {customer.email && (
                                    <div className="flex items-center gap-2 text-sm text-gray-600">
                                      <Mail className="w-4 h-4 text-gray-400" />
                                      {customer.email}
                                    </div>
                                  )}
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg ${channelIcons[customer.channel]?.bgColor || 'bg-gray-50'}`}>
                                  <ChannelIcon className={`w-4 h-4 ${channelIcons[customer.channel]?.color || 'text-gray-600'}`} />
                                  <span className={`text-sm font-medium ${channelIcons[customer.channel]?.color || 'text-gray-600'}`}>
                                    {channelIcons[customer.channel]?.label || customer.channel}
                                  </span>
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                {customer.blacklisted ? (
                                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-gray-900 text-white">
                                    <ShieldOff className="w-3 h-3" /> Blacklisted
                                  </span>
                                ) : customer.rto_risk === 'high' ? (
                                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-red-100 text-red-700">
                                    <ShieldAlert className="w-3 h-3" /> High
                                  </span>
                                ) : customer.rto_risk === 'medium' ? (
                                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-amber-100 text-amber-700">
                                    <ShieldAlert className="w-3 h-3" /> Medium
                                  </span>
                                ) : customer.rto_risk === 'low' ? (
                                  <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-semibold bg-green-100 text-green-700">
                                    <ShieldAlert className="w-3 h-3" /> Low
                                  </span>
                                ) : (
                                  <span className="text-sm text-gray-400">—</span>
                                )}
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex items-center gap-2 text-sm text-gray-600">
                                  <Calendar className="w-4 h-4 text-gray-400" />
                                  {customer.created_at ? (
                                    new Date(customer.created_at).toLocaleDateString('en-US', {
                                      year: 'numeric',
                                      month: 'short',
                                      day: 'numeric'
                                    })
                                  ) : (
                                    'N/A'
                                  )}
                                </div>
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex items-center justify-end gap-2">
                                  <button
                                    onClick={() => setSelectedCustomer(customer)}
                                    className="px-3 py-1.5 text-sm font-medium text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                  >
                                    View
                                  </button>
                                  <button
                                    onClick={() => setShowDeleteConfirm(customer.id)}
                                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                  >
                                    <Trash2 className="w-4 h-4" />
                                  </button>
                                </div>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                  <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-4 flex items-center justify-between">
                    <p className="text-sm text-gray-600">
                      Showing {startIndex + 1} to {Math.min(endIndex, filteredCustomers.length)} of {filteredCustomers.length} customers
                    </p>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                        disabled={currentPage === 1}
                        className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <ChevronLeft className="w-5 h-5" />
                      </button>
                      <span className="px-4 py-2 text-sm font-medium text-gray-700">
                        {currentPage} / {totalPages}
                      </span>
                      <button
                        onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                        disabled={currentPage === totalPages}
                        className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                      >
                        <ChevronRight className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                )}
              </>
            )}
          </>
        )}
      </div>

      {/* Customer Detail Drawer */}
      {selectedCustomer && (
        <div className="fixed inset-0 bg-gray-900/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full max-h-[90vh] overflow-y-auto">
            <div className="sticky top-0 bg-white border-b border-gray-200 p-6 flex items-center justify-between rounded-t-2xl">
              <h2 className="text-2xl font-bold text-gray-900">Customer Details</h2>
              <button
                onClick={() => setSelectedCustomer(null)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-6">
              {/* Avatar and Name */}
              <div className="flex items-center gap-4">
                <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-500 rounded-full flex items-center justify-center text-white text-2xl font-bold">
                  {selectedCustomer.name.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">{selectedCustomer.name}</h3>
                  <p className="text-sm text-gray-500">Customer ID: {selectedCustomer.id.slice(0, 8)}</p>
                  {selectedCustomer.blacklisted && (
                    <span className="inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full text-xs font-semibold bg-gray-900 text-white">
                      <ShieldOff className="w-3 h-3" /> Blacklisted
                    </span>
                  )}
                  {!selectedCustomer.blacklisted && selectedCustomer.rto_risk && (
                    <span className={`inline-flex items-center gap-1 mt-1 px-2 py-0.5 rounded-full text-xs font-semibold ${
                      selectedCustomer.rto_risk === 'high' ? 'bg-red-100 text-red-700' :
                      selectedCustomer.rto_risk === 'medium' ? 'bg-amber-100 text-amber-700' :
                      'bg-green-100 text-green-700'
                    }`}>
                      <ShieldAlert className="w-3 h-3" /> RTO Risk: {selectedCustomer.rto_risk.charAt(0).toUpperCase() + selectedCustomer.rto_risk.slice(1)}
                    </span>
                  )}
                </div>
              </div>

              {/* Contact Information */}
              <div className="space-y-4">
                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-600 mb-2">
                    <Phone className="w-4 h-4" />
                    Phone Number
                  </label>
                  <p className="text-lg text-gray-900 pl-6">{selectedCustomer.number}</p>
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-600 mb-2">
                    <Mail className="w-4 h-4" />
                    Email
                  </label>
                  <p className="text-lg text-gray-900 pl-6">{selectedCustomer.email || 'Not provided'}</p>
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-600 mb-2">
                    <MessageSquare className="w-4 h-4" />
                    Channel
                  </label>
                  <div className="pl-6">
                    {(() => {
                      const ChannelIcon = channelIcons[selectedCustomer.channel]?.icon || MessageSquare;
                      return (
                        <div className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg ${channelIcons[selectedCustomer.channel]?.bgColor || 'bg-gray-50'}`}>
                          <ChannelIcon className={`w-5 h-5 ${channelIcons[selectedCustomer.channel]?.color || 'text-gray-600'}`} />
                          <span className={`text-base font-medium ${channelIcons[selectedCustomer.channel]?.color || 'text-gray-600'}`}>
                            {channelIcons[selectedCustomer.channel]?.label || selectedCustomer.channel}
                          </span>
                        </div>
                      );
                    })()}
                  </div>
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-600 mb-2">
                    <Calendar className="w-4 h-4" />
                    Created At
                  </label>
                  <p className="text-base text-gray-900 pl-6">
                    {selectedCustomer.created_at ? (
                      new Date(selectedCustomer.created_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })
                    ) : (
                      'Not available'
                    )}
                  </p>
                </div>

                <div>
                  <label className="flex items-center gap-2 text-sm font-medium text-gray-600 mb-2">
                    <Calendar className="w-4 h-4" />
                    Last Updated
                  </label>
                  <p className="text-base text-gray-900 pl-6">
                    {selectedCustomer.updated_at ? (
                      new Date(selectedCustomer.updated_at).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit'
                      })
                    ) : (
                      'Not available'
                    )}
                  </p>
                </div>

                {/* RTO Shield Section */}
                {(selectedCustomer.rto_risk || selectedCustomer.rto_count !== undefined || selectedCustomer.blacklisted) && (
                  <div className="border border-gray-200 rounded-xl p-4 bg-gray-50">
                    <div className="flex items-center gap-2 mb-3">
                      <ShieldAlert className="w-4 h-4 text-gray-600" />
                      <span className="text-sm font-semibold text-gray-700">RTO Shield</span>
                    </div>
                    <div className="flex flex-wrap gap-3 text-sm">
                      {selectedCustomer.rto_risk && (
                        <div>
                          <span className="text-gray-500">Risk Level: </span>
                          <span className={`font-semibold ${
                            selectedCustomer.rto_risk === 'high' ? 'text-red-600' :
                            selectedCustomer.rto_risk === 'medium' ? 'text-amber-600' :
                            'text-green-600'
                          }`}>{selectedCustomer.rto_risk.charAt(0).toUpperCase() + selectedCustomer.rto_risk.slice(1)}</span>
                        </div>
                      )}
                      {selectedCustomer.rto_count !== undefined && (
                        <div>
                          <span className="text-gray-500">RTO Count: </span>
                          <span className="font-semibold text-gray-900">{selectedCustomer.rto_count}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Blacklist Toggle */}
                <div className="pt-2">
                  <button
                    onClick={() => handleToggleBlacklist(selectedCustomer)}
                    disabled={togglingBlacklist}
                    className={`w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl text-sm font-medium transition-colors disabled:opacity-50 ${
                      selectedCustomer.blacklisted
                        ? 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        : 'bg-red-50 text-red-700 hover:bg-red-100 border border-red-200'
                    }`}
                  >
                    {selectedCustomer.blacklisted ? (
                      <><ShieldOff className="w-4 h-4" /> Remove from Blacklist</>
                    ) : (
                      <><ShieldAlert className="w-4 h-4" /> Blacklist Customer</>
                    )}
                  </button>
                </div>
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newCustomer.name}
                  onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="Enter customer name"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <input
                  type="tel"
                  value={newCustomer.number}
                  onChange={(e) => setNewCustomer({ ...newCustomer, number: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="+1234567890"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">Email (Optional)</label>
                <input
                  type="email"
                  value={newCustomer.email}
                  onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  placeholder="customer@example.com"
                />
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Channel <span className="text-red-500">*</span>
                </label>
                <select
                  value={newCustomer.channel}
                  onChange={(e) => setNewCustomer({ ...newCustomer, channel: e.target.value as any })}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
                >
                  <option value="">Select a channel</option>
                  {channels.filter(c => c.value !== 'all').map((channel) => (
                    <option key={channel.value} value={channel.value}>
                      {channel.label}
                    </option>
                  ))}
                </select>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => {
                    setShowCreateCustomer(false);
                    setNewCustomer({ name: "", number: "", email: "", channel: "" as const });
                    setError(null);
                  }}
                  className="flex-1 px-6 py-3 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateCustomer}
                  disabled={isSubmitting || !newCustomer.name || !newCustomer.number || !newCustomer.channel}
                  className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium transition-colors"
                >
                  {isSubmitting ? 'Creating...' : 'Create'}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-gray-900/60 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Trash2 className="w-6 h-6 text-red-600" />
            </div>
            <h2 className="text-xl font-bold text-gray-900 mb-2 text-center">Delete Customer</h2>
            <p className="text-gray-600 mb-6 text-center">
              Are you sure you want to delete this customer? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="flex-1 px-6 py-3 border border-gray-200 text-gray-700 rounded-xl hover:bg-gray-50 font-medium transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteCustomer(showDeleteConfirm)}
                disabled={isSubmitting}
                className="flex-1 px-6 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 disabled:opacity-50 font-medium transition-colors"
              >
                {isSubmitting ? 'Deleting...' : 'Delete'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
