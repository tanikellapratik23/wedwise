import { useState, useEffect } from 'react';
import { Church, Sparkles, Check, Plus, X, Clock, Users, Info, Calendar, ChevronRight, Trash2, MapPin, Save, Share2, Download, BookOpen, Heart } from 'lucide-react';
import axios from 'axios';
import { religionCeremonyData, getRitualsForReligion, getTraditionsForReligion, getCeremonyStructure, getInterfaithOptions } from '../../utils/ceremonyData';
import { getCeremonySchedule, getInterfaithSchedule, supportedReligions, CeremonySchedule } from '../../utils/ceremonySchedules';
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000';

interface DayEvent {
  id: string;
  name: string;
  time: string;
  duration: string;
  description: string;
  rituals: string[];
  location?: {
    name: string;
    address: string;
  };
}


interface WeddingDay {
  dayNumber: number;
  date: string;
  title: string;
  dayType: 'pre-wedding' | 'wedding' | 'post-wedding'; // Track the type
  events: DayEvent[];
}

export default function CeremonyPlanning() {
  const [userSettings, setUserSettings] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [selectedRituals, setSelectedRituals] = useState<string[]>([]);
  const [selectedTraditions, setSelectedTraditions] = useState<string[]>([]);
  const [customRitual, setCustomRitual] = useState('');
  const [customTradition, setCustomTradition] = useState('');
  const [saving, setSaving] = useState(false);
  const [numberOfDays, setNumberOfDays] = useState(4);
  const [showDaySelector, setShowDaySelector] = useState(false);
  const [weddingDays, setWeddingDays] = useState<WeddingDay[]>([]);
  const [selectedDay, setSelectedDay] = useState(0);
  const [showAddEvent, setShowAddEvent] = useState(false);
  const [showExampleSchedules, setShowExampleSchedules] = useState(false);
  const [selectedExampleReligion, setSelectedExampleReligion] = useState<string>('');
  const [interfaithMode, setInterfaithMode] = useState(false);
  const [interfaithReligion1, setInterfaithReligion1] = useState<string>('');
  const [interfaithReligion2, setInterfaithReligion2] = useState<string>('');
  const [newEvent, setNewEvent] = useState<DayEvent>({
    id: '',
    name: '',
    time: '10:00',
    duration: '2 hours',
    description: '',
    rituals: [],
    location: { name: '', address: '' },
  });

  useEffect(() => {
    // Load from localStorage immediately for instant display
    try {
      const cached = localStorage.getItem('ceremony');
      if (cached) {
        const parsed = JSON.parse(cached);
        if (parsed.userSettings) setUserSettings(parsed.userSettings);
        if (parsed.selectedRituals) setSelectedRituals(parsed.selectedRituals);
        if (parsed.selectedTraditions) setSelectedTraditions(parsed.selectedTraditions);
        if (parsed.weddingDays) setWeddingDays(parsed.weddingDays);
      }
    } catch (e) {
      console.error('Failed to load cached ceremony:', e);
    }
    
    fetchUserSettings();
  }, []);

  // Save to localStorage immediately whenever ceremony data changes
  useEffect(() => {
    try {
      const payload = {
        userSettings,
        selectedRituals,
        selectedTraditions,
        weddingDays,
      };
      localStorage.setItem('ceremony', JSON.stringify(payload));
      const { isAutoSaveEnabled, setWithTTL } = require('../../utils/autosave');
      if (isAutoSaveEnabled()) setWithTTL('ceremony', payload, 24 * 60 * 60 * 1000);
    } catch (e) {
      console.error('Failed to save ceremony:', e);
    }
  }, [userSettings, selectedRituals, selectedTraditions, weddingDays]);

  const fetchUserSettings = async () => {
    try {
      const offlineMode = localStorage.getItem('offlineMode') === 'true';
      if (offlineMode) {
        const cached = localStorage.getItem('ceremony');
        if (cached) {
          const data = JSON.parse(cached);
          setUserSettings(data.userSettings || null);
          setSelectedRituals(data.selectedRituals || []);
          setSelectedTraditions(data.selectedTraditions || []);
          setWeddingDays(data.weddingDays || []);
          setLoading(false);
          return;
        }
      }

      const token = localStorage.getItem('token');
      const response = await axios.get(`${API_URL}/api/onboarding`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      if (response.data) {
        setUserSettings(response.data);
        setSelectedRituals(response.data.ceremonyDetails?.specificRituals || []);
        setSelectedTraditions(response.data.ceremonyDetails?.culturalTraditions || []);
        
        // Initialize wedding days (4-day wedding)
        if (!response.data.ceremonyDetails?.weddingDays || response.data.ceremonyDetails.weddingDays.length === 0) {
          initializeDefaultDays(response.data.weddingDate, response.data.religions);
        } else {
          setWeddingDays(response.data.ceremonyDetails.weddingDays);
        }
      }
    } catch (error) {
      console.error('Failed to fetch settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const initializeDefaultDays = (weddingDate: string, religions: string[]) => {
    const baseDate = weddingDate ? new Date(weddingDate) : new Date();
    const defaultDays: WeddingDay[] = [];

    // Create days based on numberOfDays selection
    const daysCount = numberOfDays || 4;
    const dayTemplates: Array<{ offset: number; title: string; dayType: 'pre-wedding' | 'wedding' | 'post-wedding'; defaultEvents: string[] }> = [];

    // Build day templates based on numberOfDays
    if (daysCount === 1) {
      dayTemplates.push({
        offset: 0,
        title: 'Wedding Day',
        dayType: 'wedding',
        defaultEvents: ['Main Ceremony', 'Reception', 'Grand Celebration'],
      });
    } else if (daysCount === 2) {
      dayTemplates.push({
        offset: -1,
        title: 'Pre-Wedding Day',
        dayType: 'pre-wedding',
        defaultEvents: ['Mehndi/Sangeet', 'Welcome Dinner', 'Rehearsal'],
      });
      dayTemplates.push({
        offset: 0,
        title: 'Wedding Day',
        dayType: 'wedding',
        defaultEvents: ['Main Ceremony', 'Reception', 'Grand Celebration'],
      });
    } else if (daysCount === 3) {
      dayTemplates.push({
        offset: -1,
        title: 'Pre-Wedding Day',
        dayType: 'pre-wedding',
        defaultEvents: ['Mehndi/Sangeet', 'Welcome Dinner'],
      });
      dayTemplates.push({
        offset: 0,
        title: 'Wedding Day',
        dayType: 'wedding',
        defaultEvents: ['Main Ceremony', 'Reception', 'Grand Celebration'],
      });
      dayTemplates.push({
        offset: 1,
        title: 'Post-Wedding',
        dayType: 'post-wedding',
        defaultEvents: ['Farewell Brunch', 'Gift Opening'],
      });
    } else {
      // 4+ days: default to original structure
      dayTemplates.push({
        offset: -2,
        title: 'Pre-Wedding Day 1',
        dayType: 'pre-wedding',
        defaultEvents: ['Mehndi Ceremony', 'Welcome Dinner', 'Family Gathering'],
      });
      dayTemplates.push({
        offset: -1,
        title: 'Pre-Wedding Day 2',
        dayType: 'pre-wedding',
        defaultEvents: ['Sangeet/Music Night', 'Haldi Ceremony', 'Rehearsal Dinner'],
      });
      dayTemplates.push({
        offset: 0,
        title: 'Wedding Day',
        dayType: 'wedding',
        defaultEvents: ['Main Ceremony', 'Reception', 'Grand Celebration'],
      });
      dayTemplates.push({
        offset: 1,
        title: 'Post-Wedding',
        dayType: 'post-wedding',
        defaultEvents: ['Farewell Brunch', 'Gift Opening', 'Thank You Gathering'],
      });

      // Add extra days if > 4
      for (let i = 4; i < daysCount; i++) {
        dayTemplates.push({
          offset: i - 2,
          title: `Day ${i}`,
          dayType: i <= 2 ? 'pre-wedding' : 'post-wedding',
          defaultEvents: ['Activities', 'Celebration'],
        });
      }
    }

    dayTemplates.forEach((template, index) => {
      const dayDate = new Date(baseDate);
      dayDate.setDate(baseDate.getDate() + template.offset);

      defaultDays.push({
        dayNumber: index + 1,
        date: dayDate.toISOString().split('T')[0],
        title: template.title,
        dayType: template.dayType,
        events: template.defaultEvents.map((eventName, eventIndex) => ({
          id: `day${index}-event${eventIndex}`,
          name: eventName,
          time: eventIndex === 0 ? '10:00' : eventIndex === 1 ? '16:00' : '19:00',
          duration: eventIndex === 0 ? '3 hours' : eventIndex === 1 ? '4 hours' : '5 hours',
          description: '',
          rituals: [],
        })),
      });
    });

    setWeddingDays(defaultDays);
  };

  const addEventToDay = () => {
    if (!newEvent.name || !newEvent.time) return;

    const updatedDays = [...weddingDays];
    updatedDays[selectedDay].events.push({
      ...newEvent,
      id: `day${selectedDay}-event${Date.now()}`,
    });

    setWeddingDays(updatedDays);
    setNewEvent({
      id: '',
      name: '',
      time: '10:00',
      duration: '2 hours',
      description: '',
      rituals: [],
      location: { name: '', address: '' },
    });
    setShowAddEvent(false);
  };

  const deleteEvent = (dayIndex: number, eventId: string) => {
    const updatedDays = [...weddingDays];
    if (updatedDays[dayIndex] && Array.isArray(updatedDays[dayIndex].events)) {
      updatedDays[dayIndex].events = updatedDays[dayIndex].events.filter(e => e.id !== eventId);
      setWeddingDays(updatedDays);
    }
  };

  const assignRitualToEvent = (dayIndex: number, eventId: string, ritual: string) => {
    const updatedDays = [...weddingDays];
    if (updatedDays[dayIndex] && Array.isArray(updatedDays[dayIndex].events)) {
      const event = updatedDays[dayIndex].events.find(e => e.id === eventId);
      if (event) {
        const rituals = Array.isArray(event.rituals) ? event.rituals : [];
        if (rituals.includes(ritual)) {
          event.rituals = rituals.filter(r => r !== ritual);
        } else {
          event.rituals = [...rituals, ritual];
        }
      }
      setWeddingDays(updatedDays);
    }
  };

  const changeDayType = (dayIndex: number, newType: 'pre-wedding' | 'wedding' | 'post-wedding') => {
    const updatedDays = [...weddingDays];
    if (updatedDays[dayIndex]) {
      updatedDays[dayIndex].dayType = newType;
      // Update title based on type
      if (newType === 'wedding') {
        updatedDays[dayIndex].title = 'Wedding Day';
      } else if (newType === 'post-wedding') {
        updatedDays[dayIndex].title = 'Post-Wedding';
      } else {
        updatedDays[dayIndex].title = `Pre-Wedding Day ${dayIndex + 1}`;
      }
      setWeddingDays(updatedDays);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const offlineMode = localStorage.getItem('offlineMode') === 'true';
      if (offlineMode) {
        const payload = {
          userSettings,
          selectedRituals,
          selectedTraditions,
          weddingDays,
        };
        localStorage.setItem('ceremony', JSON.stringify(payload));
        alert('Ceremony details saved locally');
        setSaving(false);
        return;
      }

      const token = localStorage.getItem('token');
      await axios.put(`${API_URL}/api/onboarding`, {
        ...userSettings,
        ceremonyDetails: {
          ...userSettings.ceremonyDetails,
          specificRituals: selectedRituals,
          culturalTraditions: selectedTraditions,
          weddingDays: weddingDays,
        },
      }, {
        headers: { Authorization: `Bearer ${token}` },
      });
      alert('Ceremony details saved successfully!');
    } catch (error) {
      console.error('Failed to save ceremony details:', error);
      alert('Failed to save. Please try again.');
    } finally {
      setSaving(false);
    }
  };

  const exportCeremonyCSV = () => {
    const rows: string[][] = [];
    
    // Header
    rows.push(['Ceremony Schedule', '', '', '']);
    rows.push(['']);
    rows.push(['Day', 'Type', 'Date', 'Events']);
    
    // Data rows
    weddingDays.forEach((day) => {
      const eventsList = day.events.map(e => `${e.time} - ${e.name}`).join('; ');
      rows.push([
        `Day ${day.dayNumber}`,
        day.dayType.replace('-', ' ').toUpperCase(),
        day.date || 'TBD',
        eventsList || 'No events scheduled'
      ]);
      
      // Add event details
      day.events.forEach((event) => {
        rows.push([
          '',
          `  ${event.time}`,
          event.name,
          `${event.duration} - ${event.description}`
        ]);
      });
    });
    
    // Add rituals and traditions
    rows.push(['']);
    rows.push(['Rituals & Traditions', '', '', '']);
    rows.push(['Rituals', selectedRituals.join(', ') || 'None selected', '', '']);
    rows.push(['Traditions', selectedTraditions.join(', ') || 'None selected', '', '']);
    
    // Convert to CSV
    const csv = rows.map(row => 
      row.map(cell => `"${cell.replace(/"/g, '""')}"`).join(',')
    ).join('\n');
    
    // Download
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'vivaha-ceremony-plan.csv';
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  };

  const toggleRitual = (ritual: string) => {
    if ((Array.isArray(selectedRituals) ? selectedRituals : []).includes(ritual)) {
      setSelectedRituals((Array.isArray(selectedRituals) ? selectedRituals : []).filter(r => r !== ritual));
    } else {
      setSelectedRituals([...(Array.isArray(selectedRituals) ? selectedRituals : []), ritual]);
    }
  };

  const toggleTradition = (tradition: string) => {
    if ((Array.isArray(selectedTraditions) ? selectedTraditions : []).includes(tradition)) {
      setSelectedTraditions((Array.isArray(selectedTraditions) ? selectedTraditions : []).filter(t => t !== tradition));
    } else {
      setSelectedTraditions([...(Array.isArray(selectedTraditions) ? selectedTraditions : []), tradition]);
    }
  };

  const addCustomRitual = () => {
    if (customRitual.trim() && !selectedRituals.includes(customRitual.trim())) {
      setSelectedRituals([...selectedRituals, customRitual.trim()]);
      setCustomRitual('');
    }
  };

  const addCustomTradition = () => {
    if (customTradition.trim() && !selectedTraditions.includes(customTradition.trim())) {
      setSelectedTraditions([...selectedTraditions, customTradition.trim()]);
      setCustomTradition('');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-96">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-pink-500"></div>
      </div>
    );
  }

  const religions = userSettings?.religions || [];
  const isInterfaith = religions.length > 1;
  const ceremonyType = userSettings?.isReligious 
    ? (isInterfaith ? 'Interfaith' : religions[0] || 'Religious')
    : 'Secular';

  // Get available rituals and traditions
  let availableRituals: string[] = [];
  let availableTraditions: string[] = [];
  let ceremonyStructure: string[] = [];
  let religionInfo: any = null;

  if (isInterfaith) {
    const options = getInterfaithOptions(religions);
    availableRituals = options.allRituals;
    availableTraditions = options.allTraditions;
  } else if (religions.length === 1) {
    availableRituals = getRitualsForReligion(religions[0]);
    availableTraditions = getTraditionsForReligion(religions[0]);
    ceremonyStructure = getCeremonyStructure(religions[0]);
    religionInfo = religionCeremonyData[religions[0]];
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white drop-shadow-md">Ceremony Planning</h1>
          <p className="text-gray-500 mt-1">
            {ceremonyType} Wedding - Plan your celebration day by day
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={() => setShowDaySelector(true)}
            className="flex items-center gap-2 px-4 py-2 border-2 border-pink-500 text-pink-600 rounded-lg hover:bg-pink-50 transition font-medium"
          >
            <Calendar className="w-5 h-5" />
            {weddingDays.length} Day{weddingDays.length !== 1 ? 's' : ''}
          </button>
          <button
            onClick={exportCeremonyCSV}
            className="flex items-center gap-2 px-4 py-2 border-2 border-blue-500 text-blue-600 rounded-lg hover:bg-blue-50 transition font-medium"
          >
            <Download className="w-5 h-5" />
            Export CSV
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className="flex items-center gap-2 px-6 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 disabled:opacity-50 transition font-medium"
          >
            <Save className="w-5 h-5" />
            {saving ? 'Saving...' : 'Save'}
          </button>
        </div>
      </div>

      {/* Number of Days Selector Modal */}
      {showDaySelector && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl p-6 max-w-md w-full">
            <h3 className="text-xl font-bold text-gray-900 mb-4">How many days does your ceremony last?</h3>
            <div className="grid grid-cols-5 gap-3 mb-6">
              {[1, 2, 3, 4, 5].map((num) => (
                <button
                  key={num}
                  onClick={() => setNumberOfDays(num)}
                  className={`p-4 rounded-lg border-2 transition ${
                    numberOfDays === num
                      ? 'border-pink-500 bg-pink-50 text-pink-700'
                      : 'border-gray-300 hover:border-pink-300'
                  }`}
                >
                  <div className="text-2xl font-bold">{num}</div>
                  <div className="text-xs">day{num !== 1 ? 's' : ''}</div>
                </button>
              ))}
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => setShowDaySelector(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  // Regenerate days based on selected number
                  initializeDefaultDays(userSettings?.weddingDate, religions);
                  setShowDaySelector(false);
                }}
                className="flex-1 px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600"
              >
                Apply
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Multi-Day Wedding Timeline */}
      <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl shadow-lg p-6 text-white">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <Calendar className="w-8 h-8" />
              <h2 className="text-2xl font-bold">Your Multi-Day Wedding</h2>
            </div>
            <p className="text-purple-100">
              Plan your {weddingDays.length}-day wedding celebration with detailed timeline for each event
            </p>
          </div>
          <button
            onClick={() => setShowExampleSchedules(true)}
            className="flex items-center gap-2 px-5 py-3 bg-white/20 hover:bg-white/30 backdrop-blur-sm text-white rounded-lg transition font-medium border-2 border-white/40"
          >
            <BookOpen className="w-5 h-5" />
            <span>Need help planning?<br />View example schedules</span>
          </button>
        </div>
      </div>

      {/* Day Tabs */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {(Array.isArray(weddingDays) ? weddingDays : []).map((day, index) => (
          <button
            key={index}
            onClick={() => setSelectedDay(index)}
            className={`flex-shrink-0 px-6 py-3 rounded-lg border-2 transition ${
              selectedDay === index
                ? 'border-pink-500 bg-pink-50 text-pink-700'
                : 'border-gray-200 hover:border-pink-300 bg-white text-gray-700'
            }`}
          >
            <div className="font-bold">Day {day.dayNumber}</div>
            <div className="text-sm">{day.title}</div>
            <div className="text-xs text-gray-500">{new Date(day.date).toLocaleDateString()}</div>
          </button>
        ))}
      </div>

      {/* Selected Day Details */}
      {weddingDays[selectedDay] && (
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <div className="flex items-center justify-between mb-6">
            <div className="flex-1">
              <div className="flex items-center gap-3 mb-2">
                <h3 className="text-2xl font-bold text-gray-900">{weddingDays[selectedDay].title}</h3>
                <select
                  value={weddingDays[selectedDay].dayType || 'pre-wedding'}
                  onChange={(e) => changeDayType(selectedDay, e.target.value as 'pre-wedding' | 'wedding' | 'post-wedding')}
                  className="px-3 py-1 border border-gray-300 rounded-lg text-sm font-medium focus:ring-2 focus:ring-pink-500"
                >
                  <option value="pre-wedding">Pre-Wedding</option>
                  <option value="wedding">Wedding Day</option>
                  <option value="post-wedding">Post-Wedding</option>
                </select>
              </div>
              <p className="text-gray-600">
                {new Date(weddingDays[selectedDay].date).toLocaleDateString('en-US', {
                  weekday: 'long',
                  month: 'long',
                  day: 'numeric',
                  year: 'numeric',
                })}
              </p>
            </div>
            <button
              onClick={() => setShowAddEvent(true)}
              className="flex items-center gap-2 px-4 py-2 bg-green-500 hover:bg-green-600 text-white rounded-lg transition"
            >
              <Plus className="w-5 h-5" />
              Add Event
            </button>
          </div>

          {/* Events Timeline */}
          <div className="space-y-4">
            {weddingDays[selectedDay].events.length === 0 ? (
              <div className="text-center py-12 bg-gray-50 rounded-lg">
                <Calendar className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-600">No events scheduled for this day</p>
                <button
                  onClick={() => setShowAddEvent(true)}
                  className="mt-4 text-pink-600 hover:text-pink-700 font-medium"
                >
                  Add your first event
                </button>
              </div>
            ) : (
              weddingDays[selectedDay].events.map((event, eventIndex) => {
                return (
                  <div
                    key={event.id}
                    className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-5 border-l-4 border-pink-500"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <Clock className="w-5 h-5 text-pink-600" />
                          <span className="text-lg font-bold text-gray-900">{event.name}</span>
                        </div>
                        <div className="flex items-center gap-4 text-sm text-gray-600 mb-2">
                          <span>🕐 {event.time}</span>
                          <span>⏱️ {event.duration}</span>
                        </div>
                        {event.location && event.location.name && (
                          <div className="flex items-center gap-2 text-sm text-gray-700 mb-2">
                            <MapPin className="w-4 h-4 text-pink-600" />
                            <div>
                              <div className="font-medium">{event.location.name}</div>
                              {event.location.address && (
                                <a
                                  href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.location.address)}`}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="text-xs text-blue-600 hover:underline"
                                >
                                  {event.location.address} →
                                </a>
                              )}
                            </div>
                          </div>
                        )}
                        {event.description && (
                          <p className="text-sm text-gray-700 mb-3">{event.description}</p>
                        )}
                        {event.rituals.length > 0 && (
                          <div className="flex flex-wrap gap-2 mt-2">
                            <span className="text-xs font-semibold text-purple-700">Rituals:</span>
                            {event.rituals.map((ritual, rIndex) => (
                              <span
                                key={rIndex}
                                className="text-xs px-2 py-1 bg-purple-100 text-purple-700 rounded-full"
                              >
                                {ritual}
                              </span>
                            ))}
                          </div>
                        )}
                      </div>
                      <button
                        onClick={() => deleteEvent(selectedDay, event.id)}
                        className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition"
                        title="Delete event"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>

                    {/* Assign Rituals to Event */}
                    <div className="mt-4 pt-4 border-t border-purple-200">
                      <p className="text-xs font-semibold text-gray-700 mb-2">Assign rituals to this event:</p>
                      <div className="flex flex-wrap gap-2">
                        {(Array.isArray(selectedRituals) ? selectedRituals : []).map((ritual) => {
                          const isAssigned = event.rituals.includes(ritual);
                          return (
                            <button
                              key={ritual}
                              onClick={() => assignRitualToEvent(selectedDay, event.id, ritual)}
                              className={`text-xs px-3 py-1 rounded-full transition ${
                                isAssigned
                                  ? 'bg-purple-600 text-white'
                                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                              }`}
                            >
                              {isAssigned && <Check className="w-3 h-3 inline mr-1" />}
                              {ritual}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>

          {/* Add Event Modal */}
          {showAddEvent && (
            <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-xl p-6 max-w-md w-full">
                <h3 className="text-xl font-bold text-gray-900 mb-4">Add New Event</h3>
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Event Name</label>
                    <input
                      type="text"
                      value={newEvent.name}
                      onChange={(e) => setNewEvent({ ...newEvent, name: e.target.value })}
                      placeholder="e.g., Mehndi Ceremony"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 bg-gray-50"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Time</label>
                      <input
                        type="time"
                        value={newEvent.time}
                        onChange={(e) => setNewEvent({ ...newEvent, time: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 bg-gray-50"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Duration</label>
                      <select
                        value={newEvent.duration}
                        onChange={(e) => setNewEvent({ ...newEvent, duration: e.target.value })}
                        className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 bg-gray-50"
                      >
                        <option>1 hour</option>
                        <option>2 hours</option>
                        <option>3 hours</option>
                        <option>4 hours</option>
                        <option>5 hours</option>
                        <option>6 hours</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description (Optional)</label>
                    <textarea
                      value={newEvent.description}
                      onChange={(e) => setNewEvent({ ...newEvent, description: e.target.value })}
                      placeholder="Event details..."
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 bg-gray-50"
                      rows={3}
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1 flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      Location Name (Optional)
                    </label>
                    <input
                      type="text"
                      value={newEvent.location?.name || ''}
                      onChange={(e) => setNewEvent({ 
                        ...newEvent, 
                        location: { ...newEvent.location!, name: e.target.value } 
                      })}
                      placeholder="e.g., Grand Ballroom"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 bg-gray-50"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Address (Optional)</label>
                    <input
                      type="text"
                      value={newEvent.location?.address || ''}
                      onChange={(e) => setNewEvent({ 
                        ...newEvent, 
                        location: { ...newEvent.location!, address: e.target.value } 
                      })}
                      placeholder="Full address for Google Maps"
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg text-gray-900 bg-gray-50"
                    />
                    <p className="text-xs text-gray-500 mt-1">
                      Address will link to Google Maps
                    </p>
                  </div>
                </div>
                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => setShowAddEvent(false)}
                    className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={addEventToDay}
                    className="flex-1 px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600"
                  >
                    Add Event
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Ceremony Information */}
      {religionInfo && !isInterfaith && (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-gradient-to-br from-blue-50 to-indigo-50 rounded-xl p-6 border border-blue-200">
            <Clock className="w-8 h-8 text-blue-600 mb-3" />
            <h3 className="font-semibold text-gray-900 mb-1">Typical Duration</h3>
            <p className="text-gray-700">{religionInfo.typicalDuration}</p>
          </div>
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-xl p-6 border border-purple-200">
            <Users className="w-8 h-8 text-purple-600 mb-3" />
            <h3 className="font-semibold text-gray-900 mb-1">Dress Code</h3>
            <p className="text-gray-700">{religionInfo.dressCode}</p>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-xl p-6 border border-green-200">
            <Info className="w-8 h-8 text-green-600 mb-3" />
            <h3 className="font-semibold text-gray-900 mb-1">Ceremony Sections</h3>
            <p className="text-gray-700 text-sm">{ceremonyStructure.length} parts</p>
          </div>
        </div>
      )}

      {isInterfaith && (
        <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center gap-3 mb-2">
            <Sparkles className="w-8 h-8" />
            <h2 className="text-2xl font-bold">Interfaith Wedding Ceremony</h2>
          </div>
          <p className="text-purple-100">
            You're blending beautiful traditions from {religions.join(' and ')}. Below are common rituals and
            traditions from both faiths. Select the ones you'd like to include in your ceremony.
          </p>
        </div>
      )}

      {/* Ceremony Structure (for single religion) */}
      {ceremonyStructure.length > 0 && !isInterfaith && (
        <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-4 flex items-center gap-2">
            <Church className="w-6 h-6 text-pink-500" />
            Typical Ceremony Flow
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {ceremonyStructure.map((section, index) => (
              <div key={index} className="flex items-center gap-3 bg-gray-50 rounded-lg p-3">
                <div className="bg-pink-500 text-white rounded-full w-8 h-8 flex items-center justify-center text-sm font-bold flex-shrink-0">
                  {index + 1}
                </div>
                <span className="text-gray-900 text-sm font-medium">{section}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Rituals Selection */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Select Rituals to Include</h2>
        <p className="text-gray-600 mb-4 text-sm">
          Choose from traditional rituals for your ceremony. You can also add custom rituals below.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
          {availableRituals.map((ritual) => {
            const isSelected = selectedRituals.includes(ritual);
            return (
              <button
                key={ritual}
                onClick={() => toggleRitual(ritual)}
                className={`flex items-center gap-3 p-4 rounded-lg border-2 transition-all text-left ${
                  isSelected
                    ? 'border-pink-500 bg-pink-50'
                    : 'border-gray-200 hover:border-pink-300 bg-white'
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                    isSelected ? 'border-pink-500 bg-pink-500' : 'border-gray-300'
                  }`}
                >
                  {isSelected && <Check className="w-4 h-4 text-white" />}
                </div>
                <span className={`text-sm font-medium ${isSelected ? 'text-pink-700' : 'text-gray-700'}`}>
                  {ritual}
                </span>
              </button>
            );
          })}
        </div>

        {/* Add Custom Ritual */}
        <div className="border-t border-gray-200 pt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Add Custom Ritual</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={customRitual}
              onChange={(e) => setCustomRitual(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addCustomRitual()}
              placeholder="e.g., Family blessing, Rose ceremony..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 focus:border-transparent"
            />
            <button
              onClick={addCustomRitual}
              className="px-4 py-2 bg-pink-500 text-white rounded-lg hover:bg-pink-600 transition-colors flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Add
            </button>
          </div>
        </div>

        {/* Selected Rituals */}
        {selectedRituals.length > 0 && (
          <div className="mt-4 border-t border-gray-200 pt-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">
              Selected Rituals ({selectedRituals.length})
            </h3>
            <div className="flex flex-wrap gap-2">
              {(Array.isArray(selectedRituals) ? selectedRituals : []).map((ritual) => (
                <span
                  key={ritual}
                  className="inline-flex items-center gap-2 px-3 py-1 bg-pink-100 text-pink-700 rounded-full text-sm font-medium"
                >
                  {ritual}
                  <button
                    onClick={() => toggleRitual(ritual)}
                    className="hover:bg-pink-200 rounded-full p-0.5"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Traditions Selection */}
      <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-200">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Cultural Traditions</h2>
        <p className="text-gray-600 mb-4 text-sm">
          Select traditional elements and customs you'd like to incorporate.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-4">
          {availableTraditions.map((tradition) => {
            const isSelected = selectedTraditions.includes(tradition);
            return (
              <button
                key={tradition}
                onClick={() => toggleTradition(tradition)}
                className={`flex items-center gap-3 p-4 rounded-lg border-2 transition-all text-left ${
                  isSelected
                    ? 'border-purple-500 bg-purple-50'
                    : 'border-gray-200 hover:border-purple-300 bg-white'
                }`}
              >
                <div
                  className={`w-6 h-6 rounded-full border-2 flex items-center justify-center flex-shrink-0 ${
                    isSelected ? 'border-purple-500 bg-purple-500' : 'border-gray-300'
                  }`}
                >
                  {isSelected && <Check className="w-4 h-4 text-white" />}
                </div>
                <span className={`text-sm font-medium ${isSelected ? 'text-purple-700' : 'text-gray-700'}`}>
                  {tradition}
                </span>
              </button>
            );
          })}
        </div>

        {/* Add Custom Tradition */}
        <div className="border-t border-gray-200 pt-4">
          <label className="block text-sm font-medium text-gray-700 mb-2">Add Custom Tradition</label>
          <div className="flex gap-2">
            <input
              type="text"
              value={customTradition}
              onChange={(e) => setCustomTradition(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && addCustomTradition()}
              placeholder="e.g., Family heirloom, special song..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent"
            />
            <button
              onClick={addCustomTradition}
              className="px-4 py-2 bg-purple-500 text-white rounded-lg hover:bg-purple-600 transition-colors flex items-center gap-2"
            >
              <Plus className="w-5 h-5" />
              Add
            </button>
          </div>
        </div>

        {/* Selected Traditions */}
        {selectedTraditions.length > 0 && (
          <div className="mt-4 border-t border-gray-200 pt-4">
            <h3 className="text-sm font-semibold text-gray-900 mb-3">
              Selected Traditions ({selectedTraditions.length})
            </h3>
            <div className="flex flex-wrap gap-2">
              {(Array.isArray(selectedTraditions) ? selectedTraditions : []).map((tradition) => (
                <span
                  key={tradition}
                  className="inline-flex items-center gap-2 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm font-medium"
                >
                  {tradition}
                  <button
                    onClick={() => toggleTradition(tradition)}
                    className="hover:bg-purple-200 rounded-full p-0.5"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={handleSave}
          disabled={saving}
          className="flex items-center gap-2 px-8 py-3 bg-pink-500 text-white rounded-lg hover:bg-pink-600 disabled:opacity-50 transition-colors text-lg font-medium"
        >
          {saving ? 'Saving...' : 'Save Ceremony Details'}
        </button>
      </div>

      {/* Example Wedding Schedules Modal */}
      {showExampleSchedules && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4 overflow-y-auto">
          <div className="bg-white rounded-xl p-6 max-w-5xl w-full max-h-[90vh] overflow-y-auto my-8">
            <div className="flex items-center justify-between mb-6 sticky top-0 bg-white pb-4 border-b">
              <div>
                <h2 className="text-2xl font-bold text-gray-900">Example Wedding Schedules</h2>
                <p className="text-sm text-gray-500 mt-1">Browse templates to inspire your perfect day-by-day schedule</p>
              </div>
              <button
                onClick={() => {
                  setShowExampleSchedules(false);
                  setInterfaithMode(false);
                  setSelectedExampleReligion('');
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Interfaith Toggle */}
            <div className="mb-6 p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg border border-purple-200">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <Heart className="w-5 h-5 text-pink-600" />
                  <span className="font-semibold text-gray-900">Planning an interfaith wedding?</span>
                </div>
                <button
                  onClick={() => {
                    setInterfaithMode(!interfaithMode);
                    setSelectedExampleReligion('');
                    setInterfaithReligion1('');
                    setInterfaithReligion2('');
                  }}
                  className={`px-4 py-2 rounded-lg font-medium transition ${
                    interfaithMode
                      ? 'bg-pink-500 text-white'
                      : 'bg-white border-2 border-pink-300 text-pink-700 hover:bg-pink-50'
                  }`}
                >
                  {interfaithMode ? 'No, single faith' : 'Yes, show interfaith options'}
                </button>
              </div>
              {interfaithMode && (
                <p className="text-sm text-gray-600">
                  Select two faiths to see beautifully blended ceremony schedules with tips on combining traditions
                </p>
              )}
            </div>

            {!interfaithMode ? (
              <>
                {/* Single Religion Selection */}
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-3">Select Your Religion:</label>
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                    {['hindu', 'christian', 'jewish', 'muslim'].map((religion) => (
                      <button
                        key={religion}
                        onClick={() => setSelectedExampleReligion(religion)}
                        className={`p-4 rounded-lg border-2 transition ${
                          selectedExampleReligion === religion
                            ? 'border-pink-500 bg-pink-50 text-pink-700'
                            : 'border-gray-300 hover:border-pink-300 bg-white'
                        }`}
                      >
                        <div className="font-semibold capitalize">{religion}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Show Selected Religion Schedule */}
                {selectedExampleReligion && (() => {
                  const schedule = getCeremonySchedule(selectedExampleReligion);
                  if (!schedule) return null;

                  return (
                    <div className="space-y-6">
                      <div className="bg-gradient-to-r from-purple-500 to-pink-500 rounded-lg p-6 text-white">
                        <h3 className="text-2xl font-bold mb-2">{schedule.religion}</h3>
                        <p className="text-purple-100 mb-4">{schedule.description}</p>
                        <div className="inline-block px-4 py-2 bg-white/20 rounded-full text-sm font-medium">
                          {schedule.totalDays}-Day Celebration
                        </div>
                      </div>

                      {schedule.schedule.map((day) => (
                        <div key={day.dayNumber} className="bg-white border-2 border-gray-200 rounded-xl p-6">
                          <div className="flex items-center justify-between mb-4">
                            <div>
                              <h4 className="text-xl font-bold text-gray-900">Day {day.dayNumber}: {day.dayName}</h4>
                              <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-medium ${
                                day.dayType === 'wedding' ? 'bg-pink-100 text-pink-700' :
                                day.dayType === 'pre-wedding' ? 'bg-purple-100 text-purple-700' :
                                'bg-blue-100 text-blue-700'
                              }`}>
                                {day.dayType.replace('-', ' ').toUpperCase()}
                              </span>
                            </div>
                          </div>

                          {/* Why This Works */}
                          <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                            <div className="flex items-start gap-2">
                              <Info className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                              <div>
                                <div className="font-semibold text-green-900 mb-1">Why this schedule is effective:</div>
                                <p className="text-sm text-green-800">{day.whyEffective}</p>
                              </div>
                            </div>
                          </div>

                          {/* Events */}
                          <div className="space-y-3">
                            {day.events.map((event, idx) => (
                              <div key={idx} className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-4 border-l-4 border-pink-500">
                                <div className="flex items-start gap-3">
                                  <Clock className="w-5 h-5 text-pink-600 mt-1" />
                                  <div className="flex-1">
                                    <div className="font-bold text-gray-900 mb-1">{event.name}</div>
                                    <div className="flex gap-3 text-sm text-gray-600 mb-2">
                                      <span>⏰ {event.time}</span>
                                      <span>⏱️ {event.duration}</span>
                                    </div>
                                    <p className="text-sm text-gray-700 mb-2">{event.description}</p>
                                    {event.significance && (
                                      <div className="text-sm bg-yellow-50 border border-yellow-200 rounded p-2 mb-2">
                                        <span className="font-semibold text-yellow-900">Significance:</span>
                                        <span className="text-yellow-800 ml-1">{event.significance}</span>
                                      </div>
                                    )}
                                    {event.tips && event.tips.length > 0 && (
                                      <div className="mt-2">
                                        <div className="text-xs font-semibold text-gray-700 mb-1">💡 Tips:</div>
                                        <ul className="text-xs text-gray-600 space-y-1">
                                          {event.tips.map((tip, tipIdx) => (
                                            <li key={tipIdx} className="flex items-start gap-1">
                                              <span className="text-pink-500">•</span>
                                              <span>{tip}</span>
                                            </li>
                                          ))}
                                        </ul>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </>
            ) : (
              <>
                {/* Interfaith Selection */}
                <div className="space-y-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">First Faith:</label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {['hindu', 'christian', 'jewish', 'muslim'].map((religion) => (
                        <button
                          key={religion}
                          onClick={() => setInterfaithReligion1(religion)}
                          className={`p-4 rounded-lg border-2 transition ${
                            interfaithReligion1 === religion
                              ? 'border-pink-500 bg-pink-50 text-pink-700'
                              : 'border-gray-300 hover:border-pink-300 bg-white'
                          }`}
                        >
                          <div className="font-semibold capitalize">{religion}</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-3">Second Faith:</label>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {['hindu', 'christian', 'jewish', 'muslim'].filter(r => r !== interfaithReligion1).map((religion) => (
                        <button
                          key={religion}
                          onClick={() => setInterfaithReligion2(religion)}
                          className={`p-4 rounded-lg border-2 transition ${
                            interfaithReligion2 === religion
                              ? 'border-purple-500 bg-purple-50 text-purple-700'
                              : 'border-gray-300 hover:border-purple-300 bg-white'
                          }`}
                        >
                          <div className="font-semibold capitalize">{religion}</div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Show Interfaith Schedule */}
                {interfaithReligion1 && interfaithReligion2 && (() => {
                  const schedule = getInterfaithSchedule(interfaithReligion1, interfaithReligion2);
                  if (!schedule) {
                    return (
                      <div className="text-center py-12 bg-gray-50 rounded-lg">
                        <p className="text-gray-600">Example schedule for this combination is coming soon!</p>
                      </div>
                    );
                  }

                  return (
                    <div className="space-y-6">
                      <div className="bg-gradient-to-r from-purple-500 via-pink-500 to-red-500 rounded-lg p-6 text-white">
                        <h3 className="text-2xl font-bold mb-2">{schedule.religions} Wedding</h3>
                        <p className="text-purple-100 mb-4">{schedule.description}</p>
                        <div className="inline-block px-4 py-2 bg-white/20 rounded-full text-sm font-medium">
                          {schedule.totalDays}-Day Celebration
                        </div>
                      </div>

                      {/* Overall Why Effective */}
                      {schedule.whyEffective && (
                        <div className="p-6 bg-gradient-to-r from-green-50 to-blue-50 border-2 border-green-300 rounded-xl">
                          <div className="flex items-start gap-3">
                            <Heart className="w-6 h-6 text-green-600 mt-1 flex-shrink-0" />
                            <div>
                              <div className="font-bold text-green-900 text-lg mb-2">Why This Interfaith Approach Works:</div>
                              <p className="text-green-800">{schedule.whyEffective}</p>
                            </div>
                          </div>
                        </div>
                      )}

                      {schedule.schedule.map((day: any, dayIdx: number) => (
                        <div key={dayIdx} className="bg-white border-2 border-purple-300 rounded-xl p-6">
                          <div className="flex items-center justify-between mb-4">
                            <div>
                              <h4 className="text-xl font-bold text-gray-900">Day {day.dayNumber}: {day.dayName}</h4>
                              <span className={`inline-block mt-2 px-3 py-1 rounded-full text-xs font-medium ${
                                day.dayType === 'wedding' ? 'bg-pink-100 text-pink-700' :
                                day.dayType === 'pre-wedding' ? 'bg-purple-100 text-purple-700' :
                                'bg-blue-100 text-blue-700'
                              }`}>
                                {day.dayType.replace('-', ' ').toUpperCase()}
                              </span>
                            </div>
                          </div>

                          {day.whyEffective && (
                            <div className="mb-4 p-4 bg-green-50 border border-green-200 rounded-lg">
                              <div className="flex items-start gap-2">
                                <Info className="w-5 h-5 text-green-600 mt-0.5 flex-shrink-0" />
                                <div>
                                  <div className="font-semibold text-green-900 mb-1">Why this works:</div>
                                  <p className="text-sm text-green-800">{day.whyEffective}</p>
                                </div>
                              </div>
                            </div>
                          )}

                          <div className="space-y-3">
                            {day.events.map((event: any, idx: number) => (
                              <div key={idx} className="bg-gradient-to-r from-purple-50 via-pink-50 to-orange-50 rounded-lg p-4 border-l-4 border-purple-500">
                                <div className="flex items-start gap-3">
                                  <Clock className="w-5 h-5 text-purple-600 mt-1" />
                                  <div className="flex-1">
                                    <div className="font-bold text-gray-900 mb-1">{event.name}</div>
                                    <div className="flex gap-3 text-sm text-gray-600 mb-2">
                                      <span>⏰ {event.time}</span>
                                      <span>⏱️ {event.duration}</span>
                                    </div>
                                    <p className="text-sm text-gray-700 mb-2">{event.description}</p>
                                    {event.significance && (
                                      <div className="text-sm bg-yellow-50 border border-yellow-200 rounded p-2 mb-2">
                                        <span className="font-semibold text-yellow-900">Significance:</span>
                                        <span className="text-yellow-800 ml-1">{event.significance}</span>
                                      </div>
                                    )}
                                    {event.tips && event.tips.length > 0 && (
                                      <div className="mt-2">
                                        <div className="text-xs font-semibold text-gray-700 mb-1">💡 Interfaith Tips:</div>
                                        <ul className="text-xs text-gray-600 space-y-1">
                                          {event.tips.map((tip: string, tipIdx: number) => (
                                            <li key={tipIdx} className="flex items-start gap-1">
                                              <span className="text-purple-500">•</span>
                                              <span>{tip}</span>
                                            </li>
                                          ))}
                                        </ul>
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </div>
                            ))}
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </>
            )}

            <div className="mt-6 pt-6 border-t flex justify-end">
              <button
                onClick={() => {
                  setShowExampleSchedules(false);
                  setInterfaithMode(false);
                  setSelectedExampleReligion('');
                }}
                className="px-6 py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-lg transition font-medium"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
