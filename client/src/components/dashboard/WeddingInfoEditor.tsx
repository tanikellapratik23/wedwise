import { useState, useEffect } from 'react';
import { Heart, MapPin, Calendar, Users, Phone, Mail, Edit2, Save, X, CheckCircle } from 'lucide-react';
import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

export default function WeddingInfoEditor() {
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [saveStatus, setSaveStatus] = useState<'idle' | 'saving' | 'saved' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');
  
  const [formData, setFormData] = useState({
    coupleName1: '',
    coupleName2: '',
    weddingDate: '',
    weddingTime: '',
    weddingCity: '',
    weddingState: '',
    venueName: '',
    venueAddress: '',
    guestCount: '',
    contactName: '',
    contactPhone: '',
    contactEmail: '',
    dressCode: '',
    additionalInfo: '',
  });

  const [originalData, setOriginalData] = useState(formData);

  useEffect(() => {
    fetchWeddingInfo();
  }, []);

  const fetchWeddingInfo = async () => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/api/onboarding`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data) {
        const data = {
          coupleName1: response.data.weddingPageData?.coupleName1 || '',
          coupleName2: response.data.weddingPageData?.coupleName2 || '',
          weddingDate: response.data.weddingPageData?.weddingDate?.split('T')[0] || response.data.weddingDate?.split('T')[0] || '',
          weddingTime: response.data.weddingPageData?.weddingTime || response.data.weddingTime || '',
          weddingCity: response.data.weddingCity || '',
          weddingState: response.data.weddingState || '',
          venueName: response.data.weddingPageData?.venueName || '',
          venueAddress: response.data.weddingPageData?.venueAddress || '',
          guestCount: response.data.guestCount?.toString() || response.data.weddingPageData?.guestCount?.toString() || '',
          contactName: response.data.weddingPageData?.contactName || '',
          contactPhone: response.data.weddingPageData?.contactPhone || '',
          contactEmail: response.data.weddingPageData?.contactEmail || '',
          dressCode: response.data.weddingPageData?.dressCode || '',
          additionalInfo: response.data.weddingPageData?.additionalInfo || '',
        };
        setFormData(data);
        setOriginalData(data);
      }
    } catch (error) {
      console.error('Failed to fetch wedding info:', error);
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      setSaveStatus('saving');
      setErrorMsg('');

      const token = localStorage.getItem('token');
      
      const updateData = {
        weddingPageData: {
          coupleName1: formData.coupleName1,
          coupleName2: formData.coupleName2,
          weddingDate: formData.weddingDate,
          weddingTime: formData.weddingTime,
          venueName: formData.venueName,
          venueAddress: formData.venueAddress,
          guestCount: parseInt(formData.guestCount) || 0,
          contactName: formData.contactName,
          contactPhone: formData.contactPhone,
          contactEmail: formData.contactEmail,
          dressCode: formData.dressCode,
          additionalInfo: formData.additionalInfo,
        },
        weddingCity: formData.weddingCity,
        weddingState: formData.weddingState,
      };

      const response = await axios.put(`${API_URL}/api/onboarding`, updateData, {
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.data.success) {
        setOriginalData(formData);
        setSaveStatus('saved');
        setTimeout(() => {
          setSaveStatus('idle');
          setIsEditing(false);
        }, 1500);
      }
    } catch (error: any) {
      console.error('Failed to save wedding info:', error);
      setSaveStatus('error');
      setErrorMsg(error.response?.data?.error || 'Failed to save. Please try again.');
    } finally {
      setIsSaving(false);
    }
  };

  const handleCancel = () => {
    setFormData(originalData);
    setIsEditing(false);
    setErrorMsg('');
  };

  const formatDate = (dateString: string) => {
    if (!dateString) return 'Not set';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' });
  };

  const hasChanges = JSON.stringify(formData) !== JSON.stringify(originalData);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight text-white drop-shadow-lg">Wedding Information</h1>
          <p className="text-gray-100 mt-1 drop-shadow-md">Manage your couple names, venue details, and contact information</p>
        </div>
        {!isEditing && (
          <button
            onClick={() => setIsEditing(true)}
            className="flex items-center gap-2 px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white rounded-xl transition shadow-lg font-semibold"
          >
            <Edit2 className="w-5 h-5" />
            Edit Information
          </button>
        )}
      </div>

      {errorMsg && (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 flex items-start gap-3">
          <X className="w-5 h-5 text-red-600 mt-0.5 flex-shrink-0" />
          <p className="text-red-700">{errorMsg}</p>
        </div>
      )}

      {saveStatus === 'saved' && (
        <div className="bg-green-50 border border-green-200 rounded-xl p-4 flex items-start gap-3">
          <CheckCircle className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
          <p className="text-green-700 font-medium">✅ Wedding information saved successfully!</p>
        </div>
      )}

      {isEditing ? (
        // EDIT MODE
        <div className="bg-white rounded-2xl shadow-lg p-8 space-y-8">
          {/* Couple Names */}
          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Heart className="w-6 h-6 text-pink-500" />
              Who is Getting Married?
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">First Person's Name</label>
                <input
                  type="text"
                  value={formData.coupleName1}
                  onChange={(e) => handleInputChange('coupleName1', e.target.value)}
                  placeholder="e.g., Sarah"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Second Person's Name</label>
                <input
                  type="text"
                  value={formData.coupleName2}
                  onChange={(e) => handleInputChange('coupleName2', e.target.value)}
                  placeholder="e.g., John"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Wedding Date & Time */}
          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Calendar className="w-6 h-6 text-blue-500" />
              Date & Time
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Wedding Date</label>
                <input
                  type="date"
                  value={formData.weddingDate}
                  onChange={(e) => handleInputChange('weddingDate', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Wedding Time</label>
                <input
                  type="time"
                  value={formData.weddingTime}
                  onChange={(e) => handleInputChange('weddingTime', e.target.value)}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Venue Details */}
          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <MapPin className="w-6 h-6 text-green-500" />
              Venue Details
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Venue Name</label>
                <input
                  type="text"
                  value={formData.venueName}
                  onChange={(e) => handleInputChange('venueName', e.target.value)}
                  placeholder="e.g., The Grand Ballroom"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">City</label>
                <input
                  type="text"
                  value={formData.weddingCity}
                  onChange={(e) => handleInputChange('weddingCity', e.target.value)}
                  placeholder="e.g., San Francisco"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">State</label>
                <input
                  type="text"
                  value={formData.weddingState}
                  onChange={(e) => handleInputChange('weddingState', e.target.value)}
                  placeholder="e.g., California"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Complete Address</label>
                <input
                  type="text"
                  value={formData.venueAddress}
                  onChange={(e) => handleInputChange('venueAddress', e.target.value)}
                  placeholder="Street address"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Guest & Attire Info */}
          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Users className="w-6 h-6 text-purple-500" />
              Guest Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Expected Guest Count</label>
                <input
                  type="number"
                  value={formData.guestCount}
                  onChange={(e) => handleInputChange('guestCount', e.target.value)}
                  placeholder="e.g., 150"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Dress Code</label>
                <input
                  type="text"
                  value={formData.dressCode}
                  onChange={(e) => handleInputChange('dressCode', e.target.value)}
                  placeholder="e.g., Formal, Black Tie, Traditional"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>

          {/* Contact Information */}
          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Phone className="w-6 h-6 text-orange-500" />
              Contact Information
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Contact Name</label>
                <input
                  type="text"
                  value={formData.contactName}
                  onChange={(e) => handleInputChange('contactName', e.target.value)}
                  placeholder="Who should guests contact?"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                <input
                  type="tel"
                  value={formData.contactPhone}
                  onChange={(e) => handleInputChange('contactPhone', e.target.value)}
                  placeholder="e.g., (555) 123-4567"
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
                />
              </div>
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Email Address</label>
              <input
                type="email"
                value={formData.contactEmail}
                onChange={(e) => handleInputChange('contactEmail', e.target.value)}
                placeholder="e.g., contact@wedding.com"
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Additional Information */}
          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-4 flex items-center gap-2">
              <Mail className="w-6 h-6 text-indigo-500" />
              Additional Information
            </h3>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Special Notes (optional)</label>
              <textarea
                value={formData.additionalInfo}
                onChange={(e) => handleInputChange('additionalInfo', e.target.value)}
                placeholder="Add any extra details for your guests - registry links, hotel recommendations, dietary preferences, traditions to honor, special requests, etc."
                rows={6}
                className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-transparent resize-none"
              />
              <p className="text-xs text-gray-500 mt-2">Share anything else you'd like your guests to know!</p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-6 border-t">
            <button
              onClick={handleCancel}
              disabled={isSaving}
              className="flex-1 px-6 py-3 border border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition disabled:opacity-50"
            >
              Cancel
            </button>
            <button
              onClick={handleSave}
              disabled={isSaving || !hasChanges}
              className="flex-1 flex items-center justify-center gap-2 px-6 py-3 bg-primary-500 hover:bg-primary-600 text-white font-semibold rounded-xl transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saveStatus === 'saving' ? (
                <>
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  Saving...
                </>
              ) : (
                <>
                  <Save className="w-5 h-5" />
                  Save Changes
                </>
              )}
            </button>
          </div>
        </div>
      ) : (
        // VIEW MODE
        <div className="space-y-4">
          {/* Couple Names Card */}
          {(formData.coupleName1 || formData.coupleName2) && (
            <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-pink-500">
              <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <Heart className="w-5 h-5 text-pink-500" />
                Couple
              </h3>
              <p className="text-gray-700">
                {formData.coupleName1} {formData.coupleName1 && formData.coupleName2 ? '& ' : ''}{formData.coupleName2}
              </p>
            </div>
          )}

          {/* Date & Time Card */}
          {(formData.weddingDate || formData.weddingTime) && (
            <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-blue-500">
              <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <Calendar className="w-5 h-5 text-blue-500" />
                Date & Time
              </h3>
              <p className="text-gray-700">
                {formatDate(formData.weddingDate)} {formData.weddingTime && `at ${formData.weddingTime}`}
              </p>
            </div>
          )}

          {/* Venue Card */}
          {(formData.venueName || formData.weddingCity) && (
            <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-green-500">
              <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <MapPin className="w-5 h-5 text-green-500" />
                Venue
              </h3>
              <div className="space-y-1 text-gray-700">
                {formData.venueName && <p className="font-medium">{formData.venueName}</p>}
                {formData.venueAddress && <p>{formData.venueAddress}</p>}
                {(formData.weddingCity || formData.weddingState) && (
                  <p>{formData.weddingCity}, {formData.weddingState}</p>
                )}
              </div>
            </div>
          )}

          {/* Guest Info */}
          {(formData.guestCount || formData.dressCode) && (
            <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-purple-500">
              <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <Users className="w-5 h-5 text-purple-500" />
                Guest Information
              </h3>
              <div className="space-y-1 text-gray-700">
                {formData.guestCount && <p><strong>Guests:</strong> {formData.guestCount}</p>}
                {formData.dressCode && <p><strong>Dress Code:</strong> {formData.dressCode}</p>}
              </div>
            </div>
          )}

          {/* Contact Info */}
          {(formData.contactName || formData.contactPhone || formData.contactEmail) && (
            <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-orange-500">
              <h3 className="text-lg font-semibold text-gray-900 mb-2 flex items-center gap-2">
                <Phone className="w-5 h-5 text-orange-500" />
                Contact Information
              </h3>
              <div className="space-y-1 text-gray-700">
                {formData.contactName && <p><strong>Contact:</strong> {formData.contactName}</p>}
                {formData.contactPhone && (
                  <p className="flex items-center gap-2">
                    <Phone className="w-4 h-4" />
                    {formData.contactPhone}
                  </p>
                )}
                {formData.contactEmail && (
                  <p className="flex items-center gap-2">
                    <Mail className="w-4 h-4" />
                    {formData.contactEmail}
                  </p>
                )}
              </div>
            </div>
          )}

          {/* Additional Information Card */}
          {formData.additionalInfo && (
            <div className="bg-white rounded-2xl shadow-lg p-6 border-l-4 border-indigo-500">
              <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center gap-2">
                <Mail className="w-5 h-5 text-indigo-500" />
                Additional Information
              </h3>
              <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{formData.additionalInfo}</p>
            </div>
          )}

          {!formData.coupleName1 && !formData.weddingDate && (
            <div className="bg-gray-50 rounded-2xl p-8 text-center text-gray-600">
              <Heart className="w-12 h-12 mx-auto mb-3 opacity-30" />
              <p>No wedding information added yet. Click "Edit Information" to get started!</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
