import { Mail, MessageSquare, PartyPopper, Package, Megaphone, Bell } from "lucide-react";
import { useNavigate } from "react-router";

export default function Templates() {
  const navigate = useNavigate();

  const templates = [
    {
      id: '1',
      name: 'Festival Offer',
      category: 'Promotional',
      channel: 'Both',
      icon: PartyPopper,
      color: 'text-purple-600 bg-purple-100',
      preview: 'Special festival discount just for you! Get 50% off on all products.',
    },
    {
      id: '2',
      name: 'Order Reminder',
      category: 'Transactional',
      channel: 'SMS',
      icon: Bell,
      color: 'text-orange-600 bg-orange-100',
      preview: 'Hi {{name}}, you have items in your cart. Complete your order today!',
    },
    {
      id: '3',
      name: 'New Product Launch',
      category: 'Announcement',
      channel: 'Email',
      icon: Package,
      color: 'text-blue-600 bg-blue-100',
      preview: 'Exciting news! We just launched our new collection. Check it out now.',
    },
    {
      id: '4',
      name: 'Announcement',
      category: 'General',
      channel: 'Both',
      icon: Megaphone,
      color: 'text-green-600 bg-green-100',
      preview: 'Important update from {{store_name}}. We want to share something special with you.',
    },
  ];

  const handleUseTemplate = (templateId: string) => {
    // In a real app, this would pre-fill the create campaign form
    navigate('/marketing/create-campaign');
  };

  return (
    <div className="p-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Templates</h1>
        <p className="text-gray-600 mt-1">Start with ready-made campaign templates</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map((template) => {
          const Icon = template.icon;
          return (
            <div
              key={template.id}
              className="bg-white rounded-xl border border-gray-200 overflow-hidden hover:shadow-lg transition-shadow"
            >
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className={`w-12 h-12 rounded-lg ${template.color} flex items-center justify-center`}>
                    <Icon className="w-6 h-6" />
                  </div>
                  <span className={`px-3 py-1 rounded-full text-sm ${
                    template.channel === 'Email'
                      ? 'bg-blue-100 text-blue-700'
                      : template.channel === 'SMS'
                      ? 'bg-orange-100 text-orange-700'
                      : 'bg-purple-100 text-purple-700'
                  }`}>
                    {template.channel}
                  </span>
                </div>

                <h3 className="text-lg font-semibold text-gray-900 mb-1">{template.name}</h3>
                <p className="text-sm text-gray-600 mb-4">{template.category}</p>

                <div className="p-3 bg-gray-50 rounded-lg mb-4 min-h-[80px]">
                  <p className="text-sm text-gray-700 line-clamp-3">{template.preview}</p>
                </div>

                <button
                  onClick={() => handleUseTemplate(template.id)}
                  className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Use Template
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Empty state if no templates (for demonstration) */}
      {templates.length === 0 && (
        <div className="bg-white rounded-xl border border-gray-200 p-12 text-center">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Mail className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-semibold text-gray-900 mb-2">No templates available</h3>
          <p className="text-gray-600">Templates will be added soon</p>
        </div>
      )}
    </div>
  );
}