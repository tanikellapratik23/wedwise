import { useState, useEffect } from 'react';
import { Calendar, MapPin, Users, Phone, Mail, Hotel, Shirt, Copy, Check, ExternalLink, Edit2, Save, X } from 'lucide-react';
import axios from 'axios';
import { authStorage } from '../../utils/auth';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export default function SingleSourceOfTruth() {
  const [weddingInfo, setWeddingInfo] = useState<any>(null);
  const [editedInfo, setEditedInfo] = useState<any>(null);
  const [shareLink, setShareLink] = useState('');
  const [copied, setCopied] = useState(false);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchWeddingInfo();
    generateShareLink();
  }, []);

  const fetchWeddingInfo = async () => {
    try {
      const token = authStorage.getToken();
      if (!token) return;

      const response = await axios.get(`${API_URL}/api/onboarding`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      setWeddingInfo(response.data);
      setEditedInfo(response.data); // Initialize edit state
    } catch (error) {
      console.error('Failed to fetch wedding info:', error);
    } finally {
      setLoading(false);
    }
  };

  const generateShareLink = async () => {
    try {
      const token = authStorage.getToken();
      if (!token) return;

      const response = await axios.post(
        `${API_URL}/api/sharing/generate`,
        { accessLevel: 'view' },
        { headers: { Authorization: `Bearer ${token}` } }
      );

      if (response.data.shareToken) {
        // Use /wedding/ route for public wedding info page
        const currentUrl = window.location.origin;
        const shareUrl = `${currentUrl}/wedding/${response.data.shareToken}`;
        setShareLink(shareUrl);
      }
    } catch (error) {
      console.error('Failed to generate share link:', error);
      // Fallback to simple link if API fails
      const currentUrl = window.location.origin;
      setShareLink(`${currentUrl}/dashboard/single-source`);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(shareLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleEditToggle = () => {
    if (isEditing) {
      // Cancel edit - reset to original
      setEditedInfo(weddingInfo);
    }
    setIsEditing(!isEditing);
  };

  const handleSave = async () => {
    try {
      setSaving(true);
      const token = authStorage.getToken();
      if (!token) return;

      await axios.put(
        `${API_URL}/api/onboarding`,
        editedInfo,
        { headers: { Authorization: `Bearer ${token}` } }
      );

      setWeddingInfo(editedInfo);
      setIsEditing(false);
      alert('Wedding information updated successfully!');
    } catch (error) {
      console.error('Failed to save wedding info:', error);
      alert('Failed to save changes. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const updateField = (field: string, value: any) => {
    setEditedInfo({ ...editedInfo, [field]: value });
  };

  const displayInfo = isEditing ? editedInfo : weddingInfo;

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header with Edit/Save buttons */}
      <div className="bg-gradient-to-r from-primary-500 via-pink-500 to-purple-600 rounded-2xl shadow-lg p-8 text-white">
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-3xl font-bold mb-2">Share Wedding Information</h1>
            <p className="text-white/90 text-lg">
              One shareable page with all your wedding details. Auto-updates everywhere when you make changes.
            </p>
          </div>
          <div className="flex gap-3">
            {isEditing ? (
              <>
                <button
                  onClick={handleEditToggle}
                  className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
                >
                  <X className="w-5 h-5" />
                  Cancel
                </button>
                <button
                  onClick={handleSave}
                  disabled={saving}
                  className="flex items-center gap-2 px-4 py-2 bg-white text-primary-600 hover:bg-white/90 rounded-lg transition-colors font-semibold disabled:opacity-50"
                >
                  <Save className="w-5 h-5" />
                  {saving ? 'Saving...' : 'Save Changes'}
                </button>
              </>
            ) : (
              <button
                onClick={handleEditToggle}
                className="flex items-center gap-2 px-4 py-2 bg-white/20 hover:bg-white/30 rounded-lg transition-colors"
              >
                <Edit2 className="w-5 h-5" />
                Edit
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Share Link Box */}
      <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Share Your Wedding Page</h2>
        <div className="flex gap-3">
          <input
            type="text"
            value={shareLink}
            readOnly
            className="flex-1 px-4 py-3 bg-gray-50 border border-gray-300 rounded-lg text-gray-700 font-mono text-sm"
          />
          <button
            onClick={copyToClipboard}
            className="flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-primary-500 to-pink-500 hover:from-primary-600 hover:to-pink-600 text-white font-semibold rounded-lg transition-all shadow-md"
          >
            {copied ? <Check className="w-5 h-5" /> : <Copy className="w-5 h-5" />}
            {copied ? 'Copied!' : 'Copy Link'}
          </button>
        </div>
        <p className="text-sm text-gray-500 mt-3">
          Share this link with guests, vendors, and anyone who needs wedding details. It updates automatically!
        </p>
      </div>

      {/* Wedding Details Preview */}
      <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200">
        <div className="bg-gradient-to-r from-primary-50 to-pink-50 p-6 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Wedding Information</h2>
          <p className="text-gray-600 text-sm mt-1">This is what guests will see when they visit your link</p>
        </div>

        <div className="p-8 space-y-6">
          {/* Date & Time */}
          {displayInfo?.weddingDate && (
            <div className="flex items-start gap-4 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl">
              <Calendar className="w-6 h-6 text-blue-600 flex-shrink-0 mt-1" />
              <div className="flex-1">
                <div className="font-semibold text-gray-900 text-lg mb-2">Date & Time</div>
                {isEditing ? (
                  <div className="space-y-2">
                    <input
                      type="date"
                      value={editedInfo?.weddingDate?.split('T')[0] || ''}
                      onChange={(e) => updateField('weddingDate', e.target.value)}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                    <input
                      type="time"
                      value={editedInfo?.weddingTime || ''}
                      onChange={(e) => updateField('weddingTime', e.target.value)}
                      placeholder="Time (optional)"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    />
                  </div>
                ) : (
                  <>
                    <div className="text-gray-700 mt-1">
                      {new Date(displayInfo.weddingDate).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </div>
                    {displayInfo.weddingTime && (
                      <div className="text-gray-600 text-sm mt-1">{displayInfo.weddingTime}</div>
                    )}
                  </>
                )}
              </div>
            </div>
          )}

          {/* Venue */}
          {displayInfo?.weddingCity && (
            <div className="flex items-start gap-4 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-xl">
              <MapPin className="w-6 h-6 text-purple-600 flex-shrink-0 mt-1" />
              <div className="flex-1">
                <div className="font-semibold text-gray-900 text-lg mb-2">Location</div>
                {isEditing ? (
                  <div className="space-y-2">
                    <input
                      type="text"
                      value={editedInfo?.weddingCity || ''}
                      onChange={(e) => updateField('weddingCity', e.target.value)}
                      placeholder="City"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                    <input
                      type="text"
                      value={editedInfo?.weddingState || ''}
                      onChange={(e) => updateField('weddingState', e.target.value)}
                      placeholder="State/Country"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                    <input
                      type="text"
                      value={editedInfo?.venue || ''}
                      onChange={(e) => updateField('venue', e.target.value)}
                      placeholder="Venue Name (optional)"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                    />
                  </div>
                ) : (
                  <>
                    <div className="text-gray-700 mt-1">
                      {displayInfo.weddingCity}, {displayInfo.weddingState || displayInfo.weddingCountry}
                    </div>
                    {displayInfo.venue && (
                      <div className="text-gray-600 text-sm mt-1">{displayInfo.venue}</div>
                    )}
                  </>
                )}
              </div>
            </div>
          )}

          {/* Guest Count */}
          {displayInfo?.guestCount && (
            <div className="flex items-start gap-4 p-4 bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl">
              <Users className="w-6 h-6 text-green-600 flex-shrink-0 mt-1" />
              <div className="flex-1">
                <div className="font-semibold text-gray-900 text-lg mb-2">Expected Guests</div>
                {isEditing ? (
                  <input
                    type="number"
                    value={editedInfo?.guestCount || ''}
                    onChange={(e) => updateField('guestCount', parseInt(e.target.value) || 0)}
                    placeholder="Number of guests"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                  />
                ) : (
                  <div className="text-gray-700 mt-1">{displayInfo.guestCount} guests</div>
                )}
              </div>
            </div>
          )}

          {/* Dress Code */}
          {displayInfo?.dressCode && (
            <div className="flex items-start gap-4 p-4 bg-gradient-to-r from-pink-50 to-rose-50 rounded-xl">
              <Shirt className="w-6 h-6 text-pink-600 flex-shrink-0 mt-1" />
              <div className="flex-1">
                <div className="font-semibold text-gray-900 text-lg mb-2">Dress Code</div>
                {isEditing ? (
                  <input
                    type="text"
                    value={editedInfo?.dressCode || ''}
                    onChange={(e) => updateField('dressCode', e.target.value)}
                    placeholder="e.g., Formal, Semi-Formal, Cocktail Attire"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                  />
                ) : (
                  <div className="text-gray-700 mt-1">{displayInfo.dressCode}</div>
                )}
              </div>
            </div>
          )}

          {/* Contact Person */}
          <div className="flex items-start gap-4 p-4 bg-gradient-to-r from-orange-50 to-amber-50 rounded-xl">
            <Phone className="w-6 h-6 text-orange-600 flex-shrink-0 mt-1" />
            <div className="flex-1">
              <div className="font-semibold text-gray-900 text-lg mb-2">Contact Information</div>
              {isEditing ? (
                <div className="space-y-2">
                  <input
                    type="text"
                    value={editedInfo?.contactName || ''}
                    onChange={(e) => updateField('contactName', e.target.value)}
                    placeholder="Contact Name"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                  <input
                    type="tel"
                    value={editedInfo?.contactPhone || ''}
                    onChange={(e) => updateField('contactPhone', e.target.value)}
                    placeholder="Phone Number"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                  <input
                    type="email"
                    value={editedInfo?.contactEmail || ''}
                    onChange={(e) => updateField('contactEmail', e.target.value)}
                    placeholder="Email Address"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                  />
                </div>
              ) : (
                <>
                  {displayInfo?.contactName && (
                    <div className="text-gray-700 mt-1">{displayInfo.contactName}</div>
                  )}
                  {displayInfo?.contactPhone && (
                    <div className="text-gray-600 text-sm mt-1">
                      <Phone className="w-4 h-4 inline mr-1" />
                      {displayInfo.contactPhone}
                    </div>
                  )}
                  {displayInfo?.contactEmail && (
                    <div className="text-gray-600 text-sm mt-1">
                      <Mail className="w-4 h-4 inline mr-1" />
                      {displayInfo.contactEmail}
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Hotel Block Info */}
          <div className="flex items-start gap-4 p-4 bg-gradient-to-r from-cyan-50 to-blue-50 rounded-xl">
            <Hotel className="w-6 h-6 text-cyan-600 flex-shrink-0 mt-1" />
            <div className="flex-1">
              <div className="font-semibold text-gray-900 text-lg">Hotel Block</div>
              <div className="text-gray-600 text-sm mt-1">
                Check our Hotel Block page for discounted rates at nearby hotels
              </div>
              <button
                onClick={() => window.location.href = '/dashboard/hotel-block'}
                className="mt-3 inline-flex items-center gap-2 text-cyan-600 hover:text-cyan-700 font-medium text-sm"
              >
                View Hotel Options
                <ExternalLink className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Auto-Update Notice */}
      <div className="bg-gradient-to-r from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
        <div className="flex items-start gap-3">
          <Check className="w-6 h-6 text-green-600 flex-shrink-0" />
          <div>
            <h3 className="font-bold text-green-900 text-lg">Auto-Updates Enabled</h3>
            <p className="text-green-800 text-sm mt-1">
              Whenever you update details in your dashboard, this page automatically updates. No need to send new information to guests!
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
