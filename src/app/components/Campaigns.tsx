import { useState } from "react";
import { Search, Filter, Plus, Mail, MessageSquare, Copy, Eye, MoreVertical } from "lucide-react";
import { Link } from "react-router-dom";

interface Campaign {
  id: string;
  name: string;
  channel: 'Email' | 'SMS' | 'Both';
  audienceCount: number;
  status: 'Draft' | 'Scheduled' | 'Sending' | 'Completed';
  sentDate?: string;
  createdDate: string;
}

export default function Campaigns() {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');

  const [campaigns, setCampaigns] = useState<Campaign[]>([
    {
      id: '1',
      name: 'Summer Sale 2026',
      channel: 'Email',
      audienceCount: 1240,
      status: 'Completed',
      sentDate: 'Jan 10, 2026',
      createdDate: 'Jan 8, 2026',
    },
    {
      id: '2',
      name: 'New Product Alert',
      channel: 'Both',
      audienceCount: 2340,
      status: 'Completed',
      sentDate: 'Jan 7, 2026',
      createdDate: 'Jan 5, 2026',
    },
    {
      id: '3',
      name: 'Order Reminder',
      channel: 'SMS',
      audienceCount: 890,
      status: 'Completed',
      sentDate: 'Jan 5, 2026',
      createdDate: 'Jan 4, 2026',
    },
    {
      id: '4',
      name: 'Winter Collection Launch',
      channel: 'Email',
      audienceCount: 1580,
      status: 'Scheduled',
      sentDate: 'Jan 15, 2026',
      createdDate: 'Jan 12, 2026',
    },
    {
      id: '5',
      name: 'Welcome Series',
      channel: 'Both',
      audienceCount: 0,
      status: 'Draft',
      createdDate: 'Jan 11, 2026',
    },
  ]);

  const filteredCampaigns = campaigns.filter(campaign => {
    const matchesSearch = searchQuery === '' || 
      campaign.name.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesStatus = filterStatus === 'all' || 
      campaign.status.toLowerCase() === filterStatus.toLowerCase();

    return matchesSearch && matchesStatus;
  });

  const statusConfig = {
    Draft: 'bg-gray-100 text-gray-700',
    Scheduled: 'bg-blue-100 text-blue-700',
    Sending: 'bg-yellow-100 text-yellow-700',
    Completed: 'bg-green-100 text-green-700',
  };

  const channelConfig = {
    Email: { color: 'bg-blue-100 text-blue-700', icon: Mail },
    SMS: { color: 'bg-orange-100 text-orange-700', icon: MessageSquare },
    Both: { color: 'bg-purple-100 text-purple-700', icon: Mail },
  };

  return (
    <div className="p-8">
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Campaigns</h1>
          <p className="text-gray-600 mt-1">Manage your email and SMS campaigns</p>
        </div>
        <Link
          to="/marketing/create-campaign"
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
        >
          <Plus className="w-5 h-5" />
          Create Campaign
        </Link>
      </div>

      {/* Search and Filter Bar */}
      <div className="mb-6 flex flex-wrap items-center gap-3">
        {/* Search Input */}
        <div className="flex-1 min-w-[300px] relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search campaigns..."
            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Filter Buttons */}
        <div className="flex gap-2">
          {['all', 'draft', 'scheduled', 'completed'].map((status) => (
            <button
              key={status}
              onClick={() => setFilterStatus(status)}
              className={`px-4 py-2 rounded-lg text-sm transition-colors ${
                filterStatus === status
                  ? 'bg-blue-600 text-white'
                  : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-50'
              }`}
            >
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Campaigns Table */}
      {filteredCampaigns.length > 0 ? (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Campaign Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Channel</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Audience Count</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Sent Date</th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filteredCampaigns.map((campaign) => {
                const Icon = channelConfig[campaign.channel].icon;
                return (
                  <tr key={campaign.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">{campaign.name}</div>
                      <div className="text-sm text-gray-500">Created: {campaign.createdDate}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm ${channelConfig[campaign.channel].color}`}>
                        <Icon className="w-4 h-4" />
                        {campaign.channel}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      {campaign.audienceCount > 0 ? campaign.audienceCount.toLocaleString() : '-'}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-3 py-1 rounded-full text-sm ${statusConfig[campaign.status]}`}>
                        {campaign.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500">
                      {campaign.sentDate || '-'}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded"
                          title="View"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          className="p-2 text-gray-600 hover:text-blue-600 hover:bg-blue-50 rounded"
                          title="Duplicate"
                        >
                          <Copy className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Mail className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No campaigns found</h3>
          <p className="text-gray-600 mb-6">
            {searchQuery || filterStatus !== 'all' 
              ? 'Try adjusting your search or filter'
              : 'No campaigns yet. Create your first campaign.'}
          </p>
          {!searchQuery && filterStatus === 'all' && (
            <Link
              to="/marketing/campaigns/create"
              className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              <Plus className="w-5 h-5" />
              Create Campaign
            </Link>
          )}
        </div>
      )}
    </div>
  );
}