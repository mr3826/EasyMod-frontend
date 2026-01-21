import { useState } from "react";
import { ArrowLeft, Mail, MessageSquare, ChevronRight, Send, Save, Clock } from "lucide-react";
import { useNavigate } from "react-router";

export default function CreateCampaign() {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const [showScheduleModal, setShowScheduleModal] = useState(false);

  // Form data
  const [campaignData, setCampaignData] = useState({
    name: '',
    channel: 'email' as 'email' | 'sms' | 'both',
    campaignType: 'promotional',
    // Audience filters
    customerType: 'all',
    contactType: 'all',
    dateRange: '',
    // Message content
    emailSubject: '',
    emailBody: '',
    smsMessage: '',
    // Schedule
    scheduleType: 'now',
    scheduleDate: '',
    scheduleTime: '',
  });

  const handleNext = () => {
    if (currentStep < 4) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handleBack = () => {
    if (currentStep > 1) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleSaveDraft = () => {
    console.log('Saving draft...', campaignData);
    navigate('/marketing');
  };

  const handleSendTest = () => {
    console.log('Sending test...', campaignData);
  };

  const handleSendCampaign = () => {
    console.log('Sending campaign...', campaignData);
    navigate('/marketing');
  };

  const estimatedReach = 1248; // This would be calculated based on filters

  const steps = [
    { number: 1, title: 'Campaign Info' },
    { number: 2, title: 'Audience' },
    { number: 3, title: 'Message' },
    { number: 4, title: 'Schedule & Send' },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200 sticky top-0 z-10">
        <div className="px-8 py-4">
          <button
            onClick={() => navigate('/marketing')}
            className="flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-4"
          >
            <ArrowLeft className="w-5 h-5" />
            Back to Marketing
          </button>
          
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Create Campaign</h1>
          
          {/* Progress Steps */}
          <div className="flex items-center gap-2">
            {steps.map((step, index) => (
              <div key={step.number} className="flex items-center gap-2">
                <div className="flex items-center gap-2">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                    currentStep >= step.number
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-200 text-gray-600'
                  }`}>
                    {step.number}
                  </div>
                  <span className={`text-sm hidden md:inline ${
                    currentStep >= step.number ? 'text-gray-900 font-medium' : 'text-gray-500'
                  }`}>
                    {step.title}
                  </span>
                </div>
                {index < steps.length - 1 && (
                  <ChevronRight className="w-5 h-5 text-gray-400 hidden md:block" />
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-8 max-w-4xl mx-auto">
        <div className="bg-white rounded-xl border border-gray-200 p-8">
          {/* Step 1: Campaign Info */}
          {currentStep === 1 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Campaign Information</h2>
                <p className="text-gray-600 text-sm mb-6">Let's start with basic details about your campaign</p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Campaign Name <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  value={campaignData.name}
                  onChange={(e) => setCampaignData({ ...campaignData, name: e.target.value })}
                  placeholder="e.g., Summer Sale 2026"
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Channel <span className="text-red-500">*</span>
                </label>
                <div className="grid grid-cols-3 gap-3">
                  <button
                    onClick={() => setCampaignData({ ...campaignData, channel: 'email' })}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      campaignData.channel === 'email'
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <Mail className={`w-8 h-8 mx-auto mb-2 ${
                      campaignData.channel === 'email' ? 'text-blue-600' : 'text-gray-400'
                    }`} />
                    <div className="text-sm font-medium text-gray-900">Email</div>
                  </button>

                  <button
                    onClick={() => setCampaignData({ ...campaignData, channel: 'sms' })}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      campaignData.channel === 'sms'
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <MessageSquare className={`w-8 h-8 mx-auto mb-2 ${
                      campaignData.channel === 'sms' ? 'text-blue-600' : 'text-gray-400'
                    }`} />
                    <div className="text-sm font-medium text-gray-900">SMS</div>
                  </button>

                  <button
                    onClick={() => setCampaignData({ ...campaignData, channel: 'both' })}
                    className={`p-4 rounded-lg border-2 transition-all ${
                      campaignData.channel === 'both'
                        ? 'border-blue-500 bg-blue-50'
                        : 'border-gray-200 hover:border-gray-300'
                    }`}
                  >
                    <div className="flex justify-center items-center gap-1 mb-2">
                      <Mail className={`w-6 h-6 ${
                        campaignData.channel === 'both' ? 'text-blue-600' : 'text-gray-400'
                      }`} />
                      <MessageSquare className={`w-6 h-6 ${
                        campaignData.channel === 'both' ? 'text-blue-600' : 'text-gray-400'
                      }`} />
                    </div>
                    <div className="text-sm font-medium text-gray-900">Both</div>
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Campaign Type
                </label>
                <select
                  value={campaignData.campaignType}
                  onChange={(e) => setCampaignData({ ...campaignData, campaignType: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="promotional">Promotional</option>
                  <option value="transactional">Transactional</option>
                  <option value="announcement">Announcement</option>
                  <option value="reminder">Reminder</option>
                </select>
              </div>
            </div>
          )}

          {/* Step 2: Audience Filter */}
          {currentStep === 2 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Select Your Audience</h2>
                <p className="text-gray-600 text-sm mb-6">Choose who will receive this campaign</p>
              </div>

              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="text-sm text-blue-900">
                  <strong>Estimated Reach:</strong> {estimatedReach.toLocaleString()} users
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Customer Type
                </label>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="customerType"
                      value="all"
                      checked={campaignData.customerType === 'all'}
                      onChange={(e) => setCampaignData({ ...campaignData, customerType: e.target.value })}
                      className="w-4 h-4 text-blue-600"
                    />
                    <span className="text-gray-700">All Customers</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="customerType"
                      value="new"
                      checked={campaignData.customerType === 'new'}
                      onChange={(e) => setCampaignData({ ...campaignData, customerType: e.target.value })}
                      className="w-4 h-4 text-blue-600"
                    />
                    <span className="text-gray-700">New Customers (First 30 days)</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="customerType"
                      value="returning"
                      checked={campaignData.customerType === 'returning'}
                      onChange={(e) => setCampaignData({ ...campaignData, customerType: e.target.value })}
                      className="w-4 h-4 text-blue-600"
                    />
                    <span className="text-gray-700">Returning Customers</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  Contact Type
                </label>
                <div className="space-y-2">
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="contactType"
                      value="all"
                      checked={campaignData.contactType === 'all'}
                      onChange={(e) => setCampaignData({ ...campaignData, contactType: e.target.value })}
                      className="w-4 h-4 text-blue-600"
                    />
                    <span className="text-gray-700">All Contacts</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="contactType"
                      value="email"
                      checked={campaignData.contactType === 'email'}
                      onChange={(e) => setCampaignData({ ...campaignData, contactType: e.target.value })}
                      className="w-4 h-4 text-blue-600"
                    />
                    <span className="text-gray-700">Email Only</span>
                  </label>
                  <label className="flex items-center gap-2 cursor-pointer">
                    <input
                      type="radio"
                      name="contactType"
                      value="phone"
                      checked={campaignData.contactType === 'phone'}
                      onChange={(e) => setCampaignData({ ...campaignData, contactType: e.target.value })}
                      className="w-4 h-4 text-blue-600"
                    />
                    <span className="text-gray-700">Phone Only</span>
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Date Range (Optional)
                </label>
                <select
                  value={campaignData.dateRange}
                  onChange={(e) => setCampaignData({ ...campaignData, dateRange: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">All time</option>
                  <option value="last7days">Last 7 days</option>
                  <option value="last30days">Last 30 days</option>
                  <option value="last90days">Last 90 days</option>
                  <option value="lastyear">Last year</option>
                </select>
                <p className="text-xs text-gray-500 mt-1">Filter by when customers joined or last ordered</p>
              </div>
            </div>
          )}

          {/* Step 3: Message Content */}
          {currentStep === 3 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Create Your Message</h2>
                <p className="text-gray-600 text-sm mb-6">Write the content for your campaign</p>
              </div>

              {/* Email Section */}
              {(campaignData.channel === 'email' || campaignData.channel === 'both') && (
                <div className="p-4 border-2 border-blue-200 rounded-lg bg-blue-50">
                  <div className="flex items-center gap-2 mb-4">
                    <Mail className="w-5 h-5 text-blue-600" />
                    <h3 className="font-semibold text-gray-900">Email Message</h3>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Subject Line <span className="text-red-500">*</span>
                      </label>
                      <input
                        type="text"
                        value={campaignData.emailSubject}
                        onChange={(e) => setCampaignData({ ...campaignData, emailSubject: e.target.value })}
                        placeholder="e.g., Exclusive Summer Sale - 50% Off!"
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Message <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        value={campaignData.emailBody}
                        onChange={(e) => setCampaignData({ ...campaignData, emailBody: e.target.value })}
                        placeholder="Write your email message here..."
                        rows={8}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <div className="mt-2 flex gap-2 text-xs text-gray-600">
                        <span className="px-2 py-1 bg-gray-100 rounded cursor-pointer hover:bg-gray-200">
                          {'{{name}}'} - Customer name
                        </span>
                        <span className="px-2 py-1 bg-gray-100 rounded cursor-pointer hover:bg-gray-200">
                          {'{{store_name}}'} - Your store name
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* SMS Section */}
              {(campaignData.channel === 'sms' || campaignData.channel === 'both') && (
                <div className="p-4 border-2 border-orange-200 rounded-lg bg-orange-50">
                  <div className="flex items-center gap-2 mb-4">
                    <MessageSquare className="w-5 h-5 text-orange-600" />
                    <h3 className="font-semibold text-gray-900">SMS Message</h3>
                  </div>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Message <span className="text-red-500">*</span>
                      </label>
                      <textarea
                        value={campaignData.smsMessage}
                        onChange={(e) => setCampaignData({ ...campaignData, smsMessage: e.target.value })}
                        placeholder="Write your SMS message here..."
                        rows={4}
                        maxLength={160}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                      <div className="flex items-center justify-between mt-2">
                        <div className="flex gap-2 text-xs text-gray-600">
                          <span className="px-2 py-1 bg-white rounded cursor-pointer hover:bg-gray-100">
                            {'{{name}}'} - Customer name
                          </span>
                          <span className="px-2 py-1 bg-white rounded cursor-pointer hover:bg-gray-100">
                            {'{{store_name}}'} - Store
                          </span>
                        </div>
                        <span className="text-sm text-gray-600">
                          {campaignData.smsMessage.length}/160
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Step 4: Schedule & Send */}
          {currentStep === 4 && (
            <div className="space-y-6">
              <div>
                <h2 className="text-xl font-semibold text-gray-900 mb-4">Schedule & Send</h2>
                <p className="text-gray-600 text-sm mb-6">Choose when to send your campaign</p>
              </div>

              <div className="p-4 bg-gray-50 rounded-lg border border-gray-200">
                <h3 className="font-semibold text-gray-900 mb-3">Campaign Summary</h3>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Name:</span>
                    <span className="ml-2 text-gray-900 font-medium">{campaignData.name || '-'}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Channel:</span>
                    <span className="ml-2 text-gray-900 font-medium capitalize">{campaignData.channel}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Audience:</span>
                    <span className="ml-2 text-gray-900 font-medium">{estimatedReach.toLocaleString()} users</span>
                  </div>
                  <div>
                    <span className="text-gray-600">Type:</span>
                    <span className="ml-2 text-gray-900 font-medium capitalize">{campaignData.campaignType}</span>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-3">
                  When to send?
                </label>
                <div className="space-y-3">
                  <label className="flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                    <input
                      type="radio"
                      name="scheduleType"
                      value="now"
                      checked={campaignData.scheduleType === 'now'}
                      onChange={(e) => setCampaignData({ ...campaignData, scheduleType: e.target.value })}
                      className="w-5 h-5 text-blue-600 mt-0.5"
                    />
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">Send Now</div>
                      <div className="text-sm text-gray-600">Campaign will be sent immediately</div>
                    </div>
                  </label>

                  <label className="flex items-start gap-3 p-4 border-2 rounded-lg cursor-pointer hover:bg-gray-50 transition-colors">
                    <input
                      type="radio"
                      name="scheduleType"
                      value="later"
                      checked={campaignData.scheduleType === 'later'}
                      onChange={(e) => setCampaignData({ ...campaignData, scheduleType: e.target.value })}
                      className="w-5 h-5 text-blue-600 mt-0.5"
                    />
                    <div className="flex-1">
                      <div className="font-medium text-gray-900">Schedule for Later</div>
                      <div className="text-sm text-gray-600 mb-3">Choose a specific date and time</div>
                      
                      {campaignData.scheduleType === 'later' && (
                        <div className="grid grid-cols-2 gap-3 mt-3">
                          <div>
                            <label className="block text-xs text-gray-600 mb-1">Date</label>
                            <input
                              type="date"
                              value={campaignData.scheduleDate}
                              onChange={(e) => setCampaignData({ ...campaignData, scheduleDate: e.target.value })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                            />
                          </div>
                          <div>
                            <label className="block text-xs text-gray-600 mb-1">Time</label>
                            <input
                              type="time"
                              value={campaignData.scheduleTime}
                              onChange={(e) => setCampaignData({ ...campaignData, scheduleTime: e.target.value })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 text-sm"
                            />
                          </div>
                        </div>
                      )}
                    </div>
                  </label>
                </div>
              </div>
            </div>
          )}

          {/* Navigation Buttons */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-gray-200">
            <div>
              {currentStep > 1 && (
                <button
                  onClick={handleBack}
                  className="px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Back
                </button>
              )}
            </div>

            <div className="flex gap-3">
              {currentStep === 4 ? (
                <>
                  <button
                    onClick={handleSaveDraft}
                    className="flex items-center gap-2 px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    <Save className="w-4 h-4" />
                    Save as Draft
                  </button>
                  <button
                    onClick={handleSendTest}
                    className="flex items-center gap-2 px-6 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    <Send className="w-4 h-4" />
                    Send Test
                  </button>
                  <button
                    onClick={handleSendCampaign}
                    className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                  >
                    <Send className="w-5 h-5" />
                    {campaignData.scheduleType === 'now' ? 'Send Campaign' : 'Schedule Campaign'}
                  </button>
                </>
              ) : (
                <button
                  onClick={handleNext}
                  className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Continue
                  <ChevronRight className="w-5 h-5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}