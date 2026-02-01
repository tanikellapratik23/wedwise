import { useState } from 'react';
import { Plus, Trash2, AlertCircle, Zap, Image as ImageIcon, Link as LinkIcon, Users } from 'lucide-react';

interface Outfit {
  id: string;
  guestName: string;
  eventDay: string;
  description: string;
  color: string;
  designerLink?: string;
  imageUrl?: string;
  availability?: string;
  conflictsWith?: string[];
}

export default function OutfitPlanner() {
  const [outfits, setOutfits] = useState<Outfit[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedOutfit, setSelectedOutfit] = useState<Outfit | null>(null);

  // Form state
  const [guestName, setGuestName] = useState('');
  const [eventDay, setEventDay] = useState('');
  const [description, setDescription] = useState('');
  const [color, setColor] = useState('');
  const [designerLink, setDesignerLink] = useState('');
  const [imageUrl, setImageUrl] = useState('');

  const eventDays = ['Mehendi', 'Sangeet', 'Wedding Day', 'Reception', 'Post-Wedding Brunch'];
  const colors = ['Red', 'Gold', 'Green', 'Blue', 'Pink', 'White', 'Cream', 'Black'];

  const addOutfit = () => {
    if (!guestName || !eventDay || !color) return;

    const newOutfit: Outfit = {
      id: Date.now().toString(),
      guestName,
      eventDay,
      description,
      color,
      designerLink,
      imageUrl,
      conflictsWith: [],
    };

    // Check for color conflicts
    const conflicts = outfits
      .filter(o => o.eventDay === eventDay && o.color === color && o.guestName !== guestName)
      .map(o => o.guestName);

    if (conflicts.length > 0) {
      newOutfit.conflictsWith = conflicts;
    }

    setOutfits([...outfits, newOutfit]);
    resetForm();
  };

  const resetForm = () => {
    setGuestName('');
    setEventDay('');
    setDescription('');
    setColor('');
    setDesignerLink('');
    setImageUrl('');
    setShowForm(false);
  };

  const deleteOutfit = (id: string) => {
    setOutfits(outfits.filter(o => o.id !== id));
  };

  const getConflictingOutfits = (outfit: Outfit) => {
    return outfits.filter(
      o => o.eventDay === outfit.eventDay && 
           o.color === outfit.color && 
           o.id !== outfit.id
    );
  };

  const suggestSwap = (outfit1: Outfit, outfit2: Outfit) => {
    alert(`Swap suggestion: ${outfit1.guestName} wears ${outfit2.color} and ${outfit2.guestName} wears ${outfit1.color}`);
  };

  const groupByDay = () => {
    const grouped: { [key: string]: Outfit[] } = {};
    eventDays.forEach(day => {
      grouped[day] = outfits.filter(o => o.eventDay === day);
    });
    return grouped;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-purple-100 to-pink-100 rounded-xl p-6">
        <h2 className="text-3xl font-bold text-gray-900 mb-2">👗 Outfit & Jewelry Planner</h2>
        <p className="text-gray-700">Assign outfits to guests for each event, track designers, and auto-detect conflicts</p>
      </div>

      {/* Add Outfit Button */}
      {!showForm ? (
        <button
          onClick={() => setShowForm(true)}
          className="w-full px-6 py-3 bg-pink-600 hover:bg-pink-700 text-white font-semibold rounded-lg flex items-center justify-center gap-2 transition"
        >
          <Plus className="w-5 h-5" />
          Add Outfit
        </button>
      ) : null}

      {/* Add Outfit Form */}
      {showForm && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
          <h3 className="text-lg font-bold text-gray-900">Add New Outfit</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Guest Name *</label>
              <input
                type="text"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                placeholder="e.g., Sarah"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Event Day *</label>
              <select
                value={eventDay}
                onChange={(e) => setEventDay(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
              >
                <option value="">Select day...</option>
                {eventDays.map(day => (
                  <option key={day} value={day}>{day}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Color/Theme *</label>
              <select
                value={color}
                onChange={(e) => setColor(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500"
              >
                <option value="">Select color...</option>
                {colors.map(c => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Designer/Shop Link</label>
              <input
                type="url"
                value={designerLink}
                onChange={(e) => setDesignerLink(e.target.value)}
                placeholder="https://..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 text-sm"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="e.g., Red silk saree with gold embroidery"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 text-sm h-20"
              />
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Image URL</label>
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://..."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-pink-500 text-sm"
              />
            </div>
          </div>

          <div className="flex gap-3 pt-4">
            <button
              onClick={addOutfit}
              className="flex-1 px-4 py-2 bg-pink-600 hover:bg-pink-700 text-white font-medium rounded-lg transition"
            >
              Add Outfit
            </button>
            <button
              onClick={resetForm}
              className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium rounded-lg transition"
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Outfits by Day */}
      <div className="space-y-6">
        {Object.entries(groupByDay()).map(([day, dayOutfits]) => (
          dayOutfits.length > 0 && (
            <div key={day} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
              <h3 className="text-xl font-bold text-gray-900 mb-4">{day}</h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {dayOutfits.map(outfit => {
                  const conflicts = getConflictingOutfits(outfit);
                  return (
                    <div
                      key={outfit.id}
                      className="border-2 border-gray-200 rounded-lg p-4 hover:shadow-md transition"
                    >
                      {/* Guest & Color */}
                      <div className="flex items-start justify-between mb-3">
                        <div>
                          <p className="font-bold text-gray-900 flex items-center gap-2">
                            <Users className="w-4 h-4" />
                            {outfit.guestName}
                          </p>
                          <div className="flex items-center gap-2 mt-1">
                            <div
                              className="w-4 h-4 rounded border"
                              style={{
                                backgroundColor: outfit.color.toLowerCase(),
                                borderColor: '#ccc',
                              }}
                            />
                            <span className="text-sm text-gray-600">{outfit.color}</span>
                          </div>
                        </div>
                        <button
                          onClick={() => deleteOutfit(outfit.id)}
                          className="p-1 text-red-600 hover:bg-red-50 rounded transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>

                      {/* Description */}
                      {outfit.description && (
                        <p className="text-sm text-gray-700 mb-3">{outfit.description}</p>
                      )}

                      {/* Image Preview */}
                      {outfit.imageUrl && (
                        <div className="mb-3">
                          <img
                            src={outfit.imageUrl}
                            alt={outfit.guestName}
                            className="w-full h-32 object-cover rounded-lg"
                            onError={(e) => {
                              e.currentTarget.style.display = 'none';
                            }}
                          />
                        </div>
                      )}

                      {/* Designer Link */}
                      {outfit.designerLink && (
                        <a
                          href={outfit.designerLink}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="flex items-center gap-2 text-sm text-blue-600 hover:text-blue-700 mb-3"
                        >
                          <LinkIcon className="w-3 h-3" />
                          View Designer
                        </a>
                      )}

                      {/* Conflicts */}
                      {conflicts.length > 0 && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-3">
                          <div className="flex items-start gap-2 mb-2">
                            <AlertCircle className="w-4 h-4 text-yellow-600 flex-shrink-0 mt-0.5" />
                            <div>
                              <p className="text-xs font-semibold text-yellow-800">Color Conflict!</p>
                              <p className="text-xs text-yellow-700">
                                {conflicts.map(c => c.guestName).join(', ')} also wearing {outfit.color}
                              </p>
                            </div>
                          </div>

                          {/* Swap Suggestions */}
                          {conflicts.map(conflict => (
                            <button
                              key={conflict.id}
                              onClick={() => suggestSwap(outfit, conflict)}
                              className="w-full mt-2 flex items-center justify-center gap-2 px-2 py-1 bg-blue-100 hover:bg-blue-200 text-blue-700 text-xs font-medium rounded transition"
                            >
                              <Zap className="w-3 h-3" />
                              Suggest Swap
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )
        ))}
      </div>

      {outfits.length === 0 && !showForm && (
        <div className="bg-gray-50 rounded-xl p-12 text-center border-2 border-dashed border-gray-300">
          <ImageIcon className="w-12 h-12 text-gray-400 mx-auto mb-3" />
          <p className="text-gray-600">No outfits assigned yet</p>
          <p className="text-sm text-gray-500 mt-1">Click "Add Outfit" to start planning</p>
        </div>
      )}
    </div>
  );
}
