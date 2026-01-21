import { useState } from "react";
import { 
  MessageSquare, 
  Target, 
  FileText, 
  CheckCircle, 
  Filter,
  Search,
  Download,
  Printer,
  X,
  Eye,
  Edit,
  FileSpreadsheet,
  Bot,
  User,
  ChevronLeft,
  ChevronRight,
  UserPlus
} from "lucide-react";

// Mock data for conversations
const mockConversations = [
  {
    id: "CONV-001",
    date: "2025-01-15 14:23",
    customer: { name: "Sarah Johnson", phone: "+1234567890", email: "sarah@email.com" },
    channel: "facebook",
    lastMessage: "Do you have this in size M?",
    aiIntent: "Product inquiry",
    orderStatus: "completed",
    orderValue: 45.99,
    outcome: "Order completed",
    conversationStatus: "closed",
    messages: 8,
  },
  {
    id: "CONV-002",
    date: "2025-01-15 13:45",
    customer: { name: "Mike Chen", phone: "+1234567891", email: "mike@email.com" },
    channel: "whatsapp",
    lastMessage: "Thanks, I'll think about it",
    aiIntent: "Lead detected",
    orderStatus: "draft",
    orderValue: 89.50,
    outcome: "Draft order created",
    conversationStatus: "waiting",
    messages: 12,
  },
  {
    id: "CONV-003",
    date: "2025-01-15 12:10",
    customer: { name: "Emma Williams", phone: "+1234567892", email: "emma@email.com" },
    channel: "webchat",
    lastMessage: "What are your store hours?",
    aiIntent: "Information request",
    orderStatus: "none",
    orderValue: 0,
    outcome: "Info only",
    conversationStatus: "closed",
    messages: 4,
  },
  {
    id: "CONV-004",
    date: "2025-01-15 11:30",
    customer: { name: "David Brown", phone: "+1234567893", email: "david@email.com" },
    channel: "telegram",
    lastMessage: "Can I get free shipping?",
    aiIntent: "Order negotiation",
    orderStatus: "confirmed",
    orderValue: 125.00,
    outcome: "Order completed",
    conversationStatus: "active",
    messages: 15,
  },
  {
    id: "CONV-005",
    date: "2025-01-15 10:15",
    customer: { name: "Lisa Anderson", phone: "+1234567894", email: "lisa@email.com" },
    channel: "facebook",
    lastMessage: "I need to cancel my order",
    aiIntent: "Order cancellation",
    orderStatus: "cancelled",
    orderValue: 0,
    outcome: "Order cancelled",
    conversationStatus: "closed",
    messages: 6,
  },
  {
    id: "CONV-006",
    date: "2025-01-15 09:50",
    customer: { name: "Tom Wilson", phone: "+1234567895", email: "tom@email.com" },
    channel: "whatsapp",
    lastMessage: "Is this product available?",
    aiIntent: "Product inquiry",
    orderStatus: "draft",
    orderValue: 35.00,
    outcome: "Draft order created",
    conversationStatus: "active",
    messages: 5,
  },
  {
    id: "CONV-007",
    date: "2025-01-15 09:20",
    customer: { name: "Anna Lee", phone: "+1234567896", email: "anna@email.com" },
    channel: "telegram",
    lastMessage: "Perfect, placing my order now",
    aiIntent: "Order creation",
    orderStatus: "completed",
    orderValue: 67.50,
    outcome: "Order completed",
    conversationStatus: "closed",
    messages: 10,
  },
];

const channelIcons: Record<string, { icon: string; color: string; label: string }> = {
  facebook: { icon: "📘", color: "text-blue-600 bg-blue-100", label: "Facebook" },
  whatsapp: { icon: "💬", color: "text-green-600 bg-green-100", label: "WhatsApp" },
  webchat: { icon: "🌐", color: "text-purple-600 bg-purple-100", label: "Web Chat" },
  telegram: { icon: "✈️", color: "text-sky-600 bg-sky-100", label: "Telegram" },
};

const statusColors: Record<string, string> = {
  completed: "bg-green-100 text-green-700",
  confirmed: "bg-blue-100 text-blue-700",
  draft: "bg-yellow-100 text-yellow-700",
  cancelled: "bg-red-100 text-red-700",
  none: "bg-gray-100 text-gray-600",
};

const outcomeColors: Record<string, string> = {
  "Order completed": "bg-green-100 text-green-700",
  "Draft order created": "bg-yellow-100 text-yellow-700",
  "Info only": "bg-gray-100 text-gray-600",
  "Order cancelled": "bg-red-100 text-red-700",
  "Lead detected": "bg-purple-100 text-purple-700",
};

export default function ConversationIntelligence() {
  const [dateFilter, setDateFilter] = useState("last7days");
  const [conversationStatusFilter, setConversationStatusFilter] = useState<string[]>([]);
  const [orderStatusFilter, setOrderStatusFilter] = useState<string[]>([]);
  const [channelFilter, setChannelFilter] = useState<string[]>([]);
  const [aiOutcomeFilter, setAiOutcomeFilter] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [phoneSearch, setPhoneSearch] = useState("");
  const [emailSearch, setEmailSearch] = useState("");
  const [selectedConversation, setSelectedConversation] = useState<any>(null);
  const [showFilters, setShowFilters] = useState(false);
  const [currentPage, setCurrentPage] = useState(1);
  const [showCreateCustomer, setShowCreateCustomer] = useState(false);
  const [newCustomer, setNewCustomer] = useState({
    name: "",
    phone: "",
    email: "",
    address: "",
    notes: "",
  });
  const itemsPerPage = 10;

  // Mock conversation detail
  const conversationDetail = selectedConversation ? {
    id: selectedConversation.id,
    customer: selectedConversation.customer,
    channel: selectedConversation.channel,
    status: selectedConversation.conversationStatus,
    messages: [
      { id: 1, sender: "customer", text: "Hi, do you have green tea in stock?", time: "14:20", confidence: null },
      { id: 2, sender: "ai", text: "Hello! Yes, we have organic green tea in stock. We have 100ml and 200ml bottles available.", time: "14:20", confidence: 0.94, intent: "Product inquiry", matchedProducts: ["Green Tea 100ml", "Green Tea 200ml"] },
      { id: 3, sender: "customer", text: "How much is the 100ml?", time: "14:21", confidence: null },
      { id: 4, sender: "ai", text: "The 100ml bottle is $15.99. Would you like to place an order?", time: "14:21", confidence: 0.89, intent: "Pricing question" },
      { id: 5, sender: "customer", text: "Yes, I'll take 3 bottles", time: "14:22", confidence: null },
      { id: 6, sender: "ai", text: "Great! I've created an order for 3x Green Tea 100ml for $47.97. Can you confirm your delivery address?", time: "14:22", confidence: 0.96, intent: "Order creation", orderId: "ORD-12345" },
      { id: 7, sender: "customer", text: "123 Main Street, apt 4B", time: "14:23", confidence: null },
      { id: 8, sender: "ai", text: "Perfect! Your order has been confirmed. Order ID: ORD-12345. You'll receive a confirmation shortly.", time: "14:23", confidence: 0.98, intent: "Order confirmed" },
    ],
    orderSummary: {
      orderId: "ORD-12345",
      status: "completed",
      total: 45.99,
      items: [{ name: "Green Tea 100ml", qty: 3, price: 15.99 }],
    },
  } : null;

  const toggleFilter = (filterArray: string[], setFilterArray: (arr: string[]) => void, value: string) => {
    if (filterArray.includes(value)) {
      setFilterArray(filterArray.filter(item => item !== value));
    } else {
      setFilterArray([...filterArray, value]);
    }
  };

  const applyFilters = () => {
    console.log("Applying filters...");
    setCurrentPage(1);
  };

  const resetFilters = () => {
    setDateFilter("last7days");
    setConversationStatusFilter([]);
    setOrderStatusFilter([]);
    setChannelFilter([]);
    setAiOutcomeFilter([]);
    setSearchQuery("");
    setPhoneSearch("");
    setEmailSearch("");
    setCurrentPage(1);
  };

  const exportData = (format: "pdf" | "csv") => {
    console.log(`Exporting as ${format}...`);
  };

  const printView = () => {
    window.print();
  };

  // Pagination
  const totalPages = Math.ceil(mockConversations.length / itemsPerPage);
  const startIndex = (currentPage - 1) * itemsPerPage;
  const endIndex = startIndex + itemsPerPage;
  const currentConversations = mockConversations.slice(startIndex, endIndex);

  return (
    <div className="p-4 md:p-8">
      {/* Header */}
      <div className="mb-6 md:mb-8 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Customer Intelligence</h1>
          <p className="text-sm md:text-base text-gray-600 mt-1">Insights from AI conversations and customer order queries</p>
        </div>
        <button
          onClick={() => setShowCreateCustomer(true)}
          className="flex items-center justify-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm whitespace-nowrap"
        >
          <UserPlus className="w-4 h-4" />
          Create Customer
        </button>
      </div>

      {/* Summary Cards - 4 cards in one row */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 md:gap-4 mb-6">
        <div className="bg-white rounded-xl border border-gray-200 p-4 md:p-5">
          <div className="flex items-center justify-between mb-2 md:mb-3">
            <MessageSquare className="w-6 h-6 md:w-8 md:h-8 text-blue-600" />
          </div>
          <div className="text-xl md:text-2xl font-bold text-gray-900">1,247</div>
          <div className="text-xs md:text-sm text-gray-600">Total Conversations</div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4 md:p-5">
          <div className="flex items-center justify-between mb-2 md:mb-3">
            <Target className="w-6 h-6 md:w-8 md:h-8 text-purple-600" />
          </div>
          <div className="text-xl md:text-2xl font-bold text-gray-900">342</div>
          <div className="text-xs md:text-sm text-gray-600">Qualified Leads</div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4 md:p-5">
          <div className="flex items-center justify-between mb-2 md:mb-3">
            <CheckCircle className="w-6 h-6 md:w-8 md:h-8 text-green-600" />
          </div>
          <div className="text-xl md:text-2xl font-bold text-gray-900">234</div>
          <div className="text-xs md:text-sm text-gray-600">Completed Orders</div>
        </div>

        <div className="bg-white rounded-xl border border-gray-200 p-4 md:p-5">
          <div className="flex items-center justify-between mb-2 md:mb-3">
            <FileText className="w-6 h-6 md:w-8 md:h-8 text-yellow-600" />
          </div>
          <div className="text-xl md:text-2xl font-bold text-gray-900">89</div>
          <div className="text-xs md:text-sm text-gray-600">Draft Orders</div>
        </div>
      </div>

      {/* Filters & Export Bar */}
      <div className="bg-white rounded-xl border border-gray-200 mb-6 sticky top-0 z-10 shadow-sm">
        <div className="p-3 md:p-4 border-b border-gray-200 flex flex-col md:flex-row md:items-center justify-between gap-3">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="flex items-center justify-center md:justify-start gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm"
          >
            <Filter className="w-4 h-4" />
            {showFilters ? "Hide Filters" : "Show Filters"}
          </button>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => exportData("csv")}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 px-3 md:px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm"
            >
              <FileSpreadsheet className="w-4 h-4" />
              <span className="hidden sm:inline">CSV</span>
            </button>
            <button
              onClick={() => exportData("pdf")}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 px-3 md:px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm"
            >
              <Download className="w-4 h-4" />
              <span className="hidden sm:inline">PDF</span>
            </button>
            <button
              onClick={printView}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 px-3 md:px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm"
            >
              <Printer className="w-4 h-4" />
              <span className="hidden sm:inline">Print</span>
            </button>
          </div>
        </div>

        {showFilters && (
          <div className="p-4 space-y-4">
            {/* Search Fields */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Search Customer</label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Name, Conv ID, Order ID..."
                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                <input
                  type="text"
                  value={phoneSearch}
                  onChange={(e) => setPhoneSearch(e.target.value)}
                  placeholder="Search by phone..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Email</label>
                <input
                  type="text"
                  value={emailSearch}
                  onChange={(e) => setEmailSearch(e.target.value)}
                  placeholder="Search by email..."
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>
            </div>

            {/* Date Range */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Date Range</label>
              <div className="flex flex-wrap gap-2">
                {[
                  { value: "today", label: "Today" },
                  { value: "last7days", label: "Last 7 days" },
                  { value: "last30days", label: "Last 30 days" },
                  { value: "custom", label: "Custom range" },
                ].map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setDateFilter(option.value)}
                    className={`px-4 py-2 rounded-lg border text-sm transition-colors ${
                      dateFilter === option.value
                        ? "bg-blue-600 text-white border-blue-600"
                        : "bg-white text-gray-700 border-gray-300 hover:bg-gray-50"
                    }`}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Multi-select Checkbox Filters */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {/* Conversation Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Conversation Status</label>
                <div className="space-y-2">
                  {[
                    { value: "active", label: "Active" },
                    { value: "waiting", label: "Waiting for customer" },
                    { value: "closed", label: "Closed" },
                  ].map((option) => (
                    <label key={option.value} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={conversationStatusFilter.includes(option.value)}
                        onChange={() => toggleFilter(conversationStatusFilter, setConversationStatusFilter, option.value)}
                        className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-2 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Order Status */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Order Status</label>
                <div className="space-y-2">
                  {[
                    { value: "none", label: "No Order" },
                    { value: "draft", label: "Draft" },
                    { value: "confirmed", label: "Confirmed" },
                    { value: "completed", label: "Completed" },
                    { value: "cancelled", label: "Cancelled" },
                  ].map((option) => (
                    <label key={option.value} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={orderStatusFilter.includes(option.value)}
                        onChange={() => toggleFilter(orderStatusFilter, setOrderStatusFilter, option.value)}
                        className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-2 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* Channel */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">Channel</label>
                <div className="space-y-2">
                  {[
                    { value: "facebook", label: "Facebook Messenger" },
                    { value: "whatsapp", label: "WhatsApp" },
                    { value: "webchat", label: "Web Chat" },
                    { value: "telegram", label: "Telegram" },
                  ].map((option) => (
                    <label key={option.value} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={channelFilter.includes(option.value)}
                        onChange={() => toggleFilter(channelFilter, setChannelFilter, option.value)}
                        className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-2 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>

              {/* AI Outcome */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">AI Outcome</label>
                <div className="space-y-2">
                  {[
                    { value: "info", label: "Info only" },
                    { value: "lead", label: "Lead detected" },
                    { value: "proposed", label: "Order proposed" },
                    { value: "completed", label: "Order completed" },
                  ].map((option) => (
                    <label key={option.value} className="flex items-center gap-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={aiOutcomeFilter.includes(option.value)}
                        onChange={() => toggleFilter(aiOutcomeFilter, setAiOutcomeFilter, option.value)}
                        className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-2 focus:ring-blue-500"
                      />
                      <span className="text-sm text-gray-700">{option.label}</span>
                    </label>
                  ))}
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-2 border-t border-gray-200">
              <button
                onClick={applyFilters}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
              >
                Apply Filters
              </button>
              <button
                onClick={resetFilters}
                className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 text-sm"
              >
                Reset
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-xl border border-gray-200 overflow-hidden mb-4">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">Date / Time</th>
                <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">Customer</th>
                <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">Channel</th>
                <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase hidden lg:table-cell">Last Message</th>
                <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase hidden xl:table-cell">AI Intent</th>
                <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase whitespace-nowrap">Order Status</th>
                <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase hidden md:table-cell whitespace-nowrap">Order Value</th>
                <th className="px-4 md:px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase hidden lg:table-cell">Outcome</th>
                <th className="px-4 md:px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase whitespace-nowrap">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {currentConversations.map((conv) => (
                <tr key={conv.id} className="hover:bg-gray-50">
                  <td className="px-4 md:px-6 py-4 text-xs md:text-sm text-gray-900 whitespace-nowrap">{conv.date}</td>
                  <td className="px-4 md:px-6 py-4">
                    <div className="text-xs md:text-sm font-medium text-gray-900">{conv.customer.name}</div>
                    <div className="text-xs text-gray-500">{conv.customer.phone}</div>
                  </td>
                  <td className="px-4 md:px-6 py-4">
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${channelIcons[conv.channel].color}`}>
                      <span>{channelIcons[conv.channel].icon}</span>
                      <span className="hidden sm:inline">{channelIcons[conv.channel].label}</span>
                    </span>
                  </td>
                  <td className="px-4 md:px-6 py-4 hidden lg:table-cell">
                    <div className="text-sm text-gray-600 max-w-xs truncate">{conv.lastMessage}</div>
                    <div className="text-xs text-gray-500">{conv.messages} messages</div>
                  </td>
                  <td className="px-4 md:px-6 py-4 hidden xl:table-cell">
                    <div className="flex items-center gap-1 text-sm text-gray-700">
                      <Bot className="w-3 h-3 text-purple-600" />
                      <span className="text-xs">{conv.aiIntent}</span>
                    </div>
                  </td>
                  <td className="px-4 md:px-6 py-4">
                    <span className={`px-2 py-1 rounded-full text-xs capitalize whitespace-nowrap ${statusColors[conv.orderStatus]}`}>
                      {conv.orderStatus === "none" ? "No Order" : conv.orderStatus}
                    </span>
                  </td>
                  <td className="px-4 md:px-6 py-4 text-xs md:text-sm text-gray-900 hidden md:table-cell whitespace-nowrap">
                    {conv.orderValue > 0 ? `$${conv.orderValue.toFixed(2)}` : "-"}
                  </td>
                  <td className="px-4 md:px-6 py-4 hidden lg:table-cell">
                    <span className={`px-2 py-1 rounded-full text-xs whitespace-nowrap ${outcomeColors[conv.outcome]}`}>
                      {conv.outcome}
                    </span>
                  </td>
                  <td className="px-4 md:px-6 py-4 text-right">
                    <button
                      onClick={() => setSelectedConversation(conv)}
                      className="inline-flex items-center gap-1 px-3 py-1 text-xs md:text-sm text-blue-600 hover:bg-blue-50 rounded-lg"
                    >
                      <Eye className="w-4 h-4" />
                      <span className="hidden sm:inline">View</span>
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {currentConversations.length === 0 && (
            <div className="p-12 text-center">
              <MessageSquare className="w-12 h-12 text-gray-400 mx-auto mb-3" />
              <h3 className="text-lg font-medium text-gray-900 mb-1">No conversations found</h3>
              <p className="text-gray-500">Try adjusting your filters or date range</p>
            </div>
          )}
        </div>
      </div>

      {/* Pagination */}
      {mockConversations.length > 0 && (
        <div className="bg-white rounded-xl border border-gray-200 px-4 md:px-6 py-4">
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="text-sm text-gray-600">
              Showing {startIndex + 1}-{Math.min(endIndex, mockConversations.length)} of {mockConversations.length} conversations
            </div>
            
            <div className="flex items-center gap-2">
              <button
                onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
                disabled={currentPage === 1}
                className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              
              <div className="flex items-center gap-1">
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                  // Show first page, last page, current page, and pages around current
                  if (
                    page === 1 ||
                    page === totalPages ||
                    (page >= currentPage - 1 && page <= currentPage + 1)
                  ) {
                    return (
                      <button
                        key={page}
                        onClick={() => setCurrentPage(page)}
                        className={`px-3 py-1 rounded-lg text-sm ${
                          currentPage === page
                            ? "bg-blue-600 text-white"
                            : "border border-gray-300 text-gray-700 hover:bg-gray-50"
                        }`}
                      >
                        {page}
                      </button>
                    );
                  } else if (page === currentPage - 2 || page === currentPage + 2) {
                    return <span key={page} className="px-1 text-gray-400">...</span>;
                  }
                  return null;
                })}
              </div>
              
              <button
                onClick={() => setCurrentPage(Math.min(totalPages, currentPage + 1))}
                disabled={currentPage === totalPages}
                className="p-2 border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Detail Drawer */}
      {selectedConversation && conversationDetail && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-end">
          <div className="bg-white w-full max-w-2xl h-full overflow-y-auto">
            {/* Drawer Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-4 md:px-6 py-4 flex items-center justify-between z-10">
              <div>
                <h2 className="text-lg md:text-xl font-bold text-gray-900">Conversation Details</h2>
                <p className="text-sm text-gray-600">ID: {conversationDetail.id}</p>
              </div>
              <button
                onClick={() => setSelectedConversation(null)}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Drawer Content */}
            <div className="p-4 md:p-6 space-y-6">
              {/* Customer Info */}
              <div className="bg-gray-50 rounded-lg p-4">
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Customer Information</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <div className="text-gray-600">Name</div>
                    <div className="font-medium text-gray-900">{conversationDetail.customer.name}</div>
                  </div>
                  <div>
                    <div className="text-gray-600">Phone</div>
                    <div className="font-medium text-gray-900">{conversationDetail.customer.phone}</div>
                  </div>
                  <div>
                    <div className="text-gray-600">Channel</div>
                    <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs ${channelIcons[conversationDetail.channel].color}`}>
                      <span>{channelIcons[conversationDetail.channel].icon}</span>
                      {channelIcons[conversationDetail.channel].label}
                    </span>
                  </div>
                  <div>
                    <div className="text-gray-600">Status</div>
                    <div className="font-medium text-gray-900 capitalize">{conversationDetail.status}</div>
                  </div>
                </div>
              </div>

              {/* Conversation Timeline */}
              <div>
                <h3 className="text-sm font-semibold text-gray-900 mb-3">Conversation Timeline</h3>
                <div className="space-y-3">
                  {conversationDetail.messages.map((msg) => (
                    <div
                      key={msg.id}
                      className={`flex gap-3 ${msg.sender === "customer" ? "" : "flex-row-reverse"}`}
                    >
                      <div className={`flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center ${
                        msg.sender === "customer" ? "bg-blue-100 text-blue-600" : "bg-purple-100 text-purple-600"
                      }`}>
                        {msg.sender === "customer" ? <User className="w-4 h-4" /> : <Bot className="w-4 h-4" />}
                      </div>
                      <div className={`flex-1 ${msg.sender === "customer" ? "" : "flex flex-col items-end"}`}>
                        <div className={`inline-block px-4 py-2 rounded-lg ${
                          msg.sender === "customer" 
                            ? "bg-gray-100 text-gray-900" 
                            : "bg-purple-600 text-white"
                        }`}>
                          <p className="text-sm">{msg.text}</p>
                        </div>
                        <div className="flex items-center gap-2 mt-1 text-xs text-gray-500">
                          <span>{msg.time}</span>
                          {msg.confidence && (
                            <>
                              <span>•</span>
                              <span className="text-purple-600">Confidence: {(msg.confidence * 100).toFixed(0)}%</span>
                            </>
                          )}
                          {msg.intent && (
                            <>
                              <span>•</span>
                              <span className="text-gray-700">{msg.intent}</span>
                            </>
                          )}
                        </div>
                        {msg.matchedProducts && (
                          <div className="mt-2 flex flex-wrap gap-1">
                            {msg.matchedProducts.map((product, i) => (
                              <span key={i} className="px-2 py-1 bg-purple-100 text-purple-700 text-xs rounded">
                                {product}
                              </span>
                            ))}
                          </div>
                        )}
                        {msg.orderId && (
                          <div className="mt-2 px-2 py-1 bg-green-100 text-green-700 text-xs rounded inline-block">
                            Order Created: {msg.orderId}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Order Summary */}
              {conversationDetail.orderSummary && (
                <div className="bg-green-50 rounded-lg p-4 border border-green-200">
                  <h3 className="text-sm font-semibold text-gray-900 mb-3">Order Summary</h3>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Order ID:</span>
                      <span className="font-medium text-gray-900">{conversationDetail.orderSummary.orderId}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-600">Status:</span>
                      <span className={`px-2 py-1 rounded-full text-xs capitalize ${statusColors[conversationDetail.orderSummary.status]}`}>
                        {conversationDetail.orderSummary.status}
                      </span>
                    </div>
                    <div className="border-t border-green-200 pt-2 mt-2">
                      {conversationDetail.orderSummary.items.map((item, i) => (
                        <div key={i} className="flex justify-between text-sm mb-1">
                          <span className="text-gray-700">{item.qty}x {item.name}</span>
                          <span className="text-gray-900">${(item.qty * item.price).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-between text-sm font-semibold border-t border-green-200 pt-2">
                      <span className="text-gray-900">Total:</span>
                      <span className="text-gray-900">${conversationDetail.orderSummary.total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200">
                <button className="flex-1 flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                  <Edit className="w-4 h-4" />
                  Edit Draft Order
                </button>
                <button className="flex items-center justify-center gap-2 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
                  <Printer className="w-4 h-4" />
                  Print
                </button>
                <button className="flex items-center justify-center gap-2 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
                  <Download className="w-4 h-4" />
                  Export
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      
      {/* Create Customer Modal */}
      {showCreateCustomer && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between rounded-t-xl">
              <div>
                <h2 className="text-xl font-bold text-gray-900">Create New Customer</h2>
                <p className="text-sm text-gray-600 mt-1">Manually add customer information to your database</p>
              </div>
              <button
                onClick={() => {
                  setShowCreateCustomer(false);
                  setNewCustomer({ name: "", phone: "", email: "", address: "", notes: "" });
                }}
                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Content */}
            <div className="p-6 space-y-5">
              {/* Customer Name */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Customer Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={newCustomer.name}
                  onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
                  placeholder="Enter full name"
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                />
              </div>

              {/* Phone & Email */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Phone Number <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="tel"
                    value={newCustomer.phone}
                    onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
                    placeholder="+1234567890"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Email Address
                  </label>
                  <input
                    type="email"
                    value={newCustomer.email}
                    onChange={(e) => setNewCustomer({ ...newCustomer, email: e.target.value })}
                    placeholder="customer@email.com"
                    className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                  />
                </div>
              </div>

              {/* Address */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Delivery Address
                </label>
                <textarea
                  value={newCustomer.address}
                  onChange={(e) => setNewCustomer({ ...newCustomer, address: e.target.value })}
                  placeholder="Enter full delivery address"
                  rows={3}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none"
                />
              </div>

              {/* Notes */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Notes (Optional)
                </label>
                <textarea
                  value={newCustomer.notes}
                  onChange={(e) => setNewCustomer({ ...newCustomer, notes: e.target.value })}
                  placeholder="Add any additional notes about this customer..."
                  rows={3}
                  className="w-full px-4 py-2.5 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm resize-none"
                />
              </div>

              {/* Info Note */}
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex gap-3">
                  <div className="flex-shrink-0">
                    <User className="w-5 h-5 text-blue-600" />
                  </div>
                  <div>
                    <h4 className="text-sm font-medium text-blue-900 mb-1">Customer Privacy</h4>
                    <p className="text-sm text-blue-700">
                      Customer information is securely stored and only used for order processing and communication purposes.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-gray-50 border-t border-gray-200 px-6 py-4 flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-3 rounded-b-xl">
              <button
                onClick={() => {
                  setShowCreateCustomer(false);
                  setNewCustomer({ name: "", phone: "", email: "", address: "", notes: "" });
                }}
                className="px-5 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-white transition-colors text-sm font-medium"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  // Handle customer creation
                  console.log("Creating customer:", newCustomer);
                  // In a real app, this would call an API
                  setShowCreateCustomer(false);
                  setNewCustomer({ name: "", phone: "", email: "", address: "", notes: "" });
                  // Show success message (you could add a toast notification here)
                  alert("Customer created successfully!");
                }}
                disabled={!newCustomer.name || !newCustomer.phone}
                className="px-5 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                Create Customer
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}