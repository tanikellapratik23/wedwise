import { useState } from 'react';
import { Plus, Trash2, BookOpen, Image as ImageIcon, Calendar, Users, Heart, Download, Share2 } from 'lucide-react';

interface StoryEntry {
  id: string;
  date: string;
  title: string;
  description: string;
  photos: string[];
  guestsPresent?: string[];
  rituals?: string[];
}

export default function PostWeddingStoryBuilder() {
  const [entries, setEntries] = useState<StoryEntry[]>([]);
  const [showForm, setShowForm] = useState(false);
  const [selectedEntry, setSelectedEntry] = useState<StoryEntry | null>(null);

  // Form state
  const [date, setDate] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [photos, setPhotos] = useState<string[]>([]);
  const [newPhoto, setNewPhoto] = useState('');
  const [guestsPresent, setGuestsPresent] = useState('');
  const [rituals, setRituals] = useState('');

  const addEntry = () => {
    if (!date || !title) return;

    const newEntry: StoryEntry = {
      id: Date.now().toString(),
      date,
      title,
      description,
      photos,
      guestsPresent: guestsPresent ? guestsPresent.split(',').map(g => g.trim()) : undefined,
      rituals: rituals ? rituals.split(',').map(r => r.trim()) : undefined,
    };

    setEntries([...entries, newEntry].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    resetForm();
  };

  const resetForm = () => {
    setDate('');
    setTitle('');
    setDescription('');
    setPhotos([]);
    setNewPhoto('');
    setGuestsPresent('');
    setRituals('');
    setShowForm(false);
  };

  const deleteEntry = (id: string) => {
    setEntries(entries.filter(e => e.id !== id));
  };

  const addPhoto = () => {
    if (newPhoto) {
      setPhotos([...photos, newPhoto]);
      setNewPhoto('');
    }
  };

  const removePhoto = (index: number) => {
    setPhotos(photos.filter((_, i) => i !== index));
  };

  const downloadStory = () => {
    const storyText = entries
      .map(e => `${new Date(e.date).toLocaleDateString()}\n${e.title}\n${e.description}\n`)
      .join('\n---\n');

    const element = document.createElement('a');
    element.setAttribute('href', `data:text/plain;charset=utf-8,${encodeURIComponent(storyText)}`);
    element.setAttribute('download', 'wedding-story.txt');
    element.style.display = 'none';
    document.body.appendChild(element);
    element.click();
    document.body.removeChild(element);
  };

  const shareStory = () => {
    const text = `Check out my wedding story on Vivaha!`;
    if (navigator.share) {
      navigator.share({
        title: 'My Wedding Story',
        text: text,
      });
    } else {
      alert('Share feature not available on this device');
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-gradient-to-r from-rose-100 to-orange-100 rounded-xl p-6">
        <h2 className="text-3xl font-bold text-white drop-shadow-md mb-2">📖 Post-Wedding Story Builder</h2>
        <p className="text-gray-700">Create a digital keepsake of your wedding events, traditions, and memories</p>
      </div>

      {/* Timeline Summary */}
      {entries.length > 0 && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <p className="text-2xl font-bold text-blue-600">{entries.length}</p>
              <p className="text-sm text-gray-600">Events Recorded</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-pink-600">{entries.reduce((sum, e) => sum + e.photos.length, 0)}</p>
              <p className="text-sm text-gray-600">Photos</p>
            </div>
            <div>
              <p className="text-2xl font-bold text-purple-600">{new Set(entries.flatMap(e => e.guestsPresent || [])).size}</p>
              <p className="text-sm text-gray-600">Guests Featured</p>
            </div>
          </div>
        </div>
      )}

      {/* Action Buttons */}
      <div className="flex flex-wrap gap-3">
        {!showForm ? (
          <button
            onClick={() => setShowForm(true)}
            className="flex-1 min-w-[200px] px-6 py-3 bg-rose-600 hover:bg-rose-700 text-white font-semibold rounded-lg flex items-center justify-center gap-2 transition"
          >
            <Plus className="w-5 h-5" />
            Add Memory
          </button>
        ) : null}
        {entries.length > 0 && (
          <>
            <button
              onClick={downloadStory}
              className="flex-1 min-w-[200px] px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg flex items-center justify-center gap-2 transition"
            >
              <Download className="w-5 h-5" />
              Download Story
            </button>
            <button
              onClick={shareStory}
              className="flex-1 min-w-[200px] px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-lg flex items-center justify-center gap-2 transition"
            >
              <Share2 className="w-5 h-5" />
              Share
            </button>
          </>
        )}
      </div>

      {/* Add Entry Form */}
      {showForm && (
        <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-4">
          <h3 className="text-lg font-bold text-gray-900">Add New Memory</h3>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Date *</label>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">Event Title *</label>
              <input
                type="text"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g., Mehendi Day, First Dance, etc."
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Story Description</label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Share the details of this special moment..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 text-sm h-24"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Guests Present</label>
            <input
              type="text"
              value={guestsPresent}
              onChange={(e) => setGuestsPresent(e.target.value)}
              placeholder="Separate with commas (e.g., Sarah, Mom, Aunt Lisa)"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 text-sm"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Rituals/Traditions</label>
            <input
              type="text"
              value={rituals}
              onChange={(e) => setRituals(e.target.value)}
              placeholder="Separate with commas (e.g., Henna, Exchange of Rings, etc.)"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 text-sm"
            />
          </div>

          {/* Photo Upload */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">Add Photos</label>
            <div className="flex gap-2">
              <input
                type="url"
                value={newPhoto}
                onChange={(e) => setNewPhoto(e.target.value)}
                placeholder="Photo URL..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-rose-500 text-sm"
              />
              <button
                onClick={addPhoto}
                className="px-4 py-2 bg-gray-200 hover:bg-gray-300 text-gray-700 font-medium rounded-lg transition"
              >
                Add
              </button>
            </div>

            {/* Photo Previews */}
            {photos.length > 0 && (
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mt-3">
                {photos.map((photo, idx) => (
                  <div key={idx} className="relative group">
                    <img
                      src={photo}
                      alt={`Photo ${idx + 1}`}
                      className="w-full h-24 object-cover rounded-lg"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                      }}
                    />
                    <button
                      onClick={() => removePhoto(idx)}
                      className="absolute top-1 right-1 p-1 bg-red-600 text-white rounded-full opacity-0 group-hover:opacity-100 transition"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="flex gap-3 pt-4">
            <button
              onClick={addEntry}
              className="flex-1 px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-medium rounded-lg transition"
            >
              Save Memory
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

      {/* Timeline */}
      <div className="space-y-4">
        {entries.length === 0 && !showForm ? (
          <div className="bg-gray-50 rounded-xl p-12 text-center border-2 border-dashed border-gray-300">
            <BookOpen className="w-12 h-12 text-gray-400 mx-auto mb-3" />
            <p className="text-gray-600">No memories added yet</p>
            <p className="text-sm text-gray-500 mt-1">Click "Add Memory" to start building your wedding story</p>
          </div>
        ) : (
          entries.map((entry, idx) => (
            <div key={entry.id} className="relative">
              {/* Timeline dot */}
              <div className="absolute left-0 top-0 w-4 h-4 bg-rose-600 rounded-full border-4 border-white -ml-2 mt-2" />

              {/* Timeline line */}
              {idx < entries.length - 1 && (
                <div className="absolute left-0 top-6 w-0.5 h-24 bg-rose-200 -ml-1.5" />
              )}

              {/* Entry card */}
              <div className="ml-8 bg-white rounded-xl shadow-sm border border-gray-200 p-6">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <p className="text-xs text-gray-500 font-semibold flex items-center gap-1">
                      <Calendar className="w-3 h-3" />
                      {new Date(entry.date).toLocaleDateString('en-US', {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
                    </p>
                    <h3 className="text-xl font-bold text-gray-900 mt-1">{entry.title}</h3>
                  </div>
                  <button
                    onClick={() => deleteEntry(entry.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                {/* Description */}
                {entry.description && (
                  <p className="text-gray-700 mb-4">{entry.description}</p>
                )}

                {/* Photos */}
                {entry.photos.length > 0 && (
                  <div className="mb-4">
                    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-2">
                      {entry.photos.map((photo, idx) => (
                        <img
                          key={idx}
                          src={photo}
                          alt={`Memory photo ${idx + 1}`}
                          className="w-full h-24 object-cover rounded-lg"
                          onError={(e) => {
                            e.currentTarget.style.display = 'none';
                          }}
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* Guests */}
                {entry.guestsPresent && entry.guestsPresent.length > 0 && (
                  <div className="mb-3 pb-3 border-b border-gray-200">
                    <p className="text-xs font-semibold text-gray-600 flex items-center gap-1 mb-1">
                      <Users className="w-3 h-3" />
                      Guests Present
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {entry.guestsPresent.map((guest, idx) => (
                        <span key={idx} className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full">
                          {guest}
                        </span>
                      ))}
                    </div>
                  </div>
                )}

                {/* Rituals */}
                {entry.rituals && entry.rituals.length > 0 && (
                  <div>
                    <p className="text-xs font-semibold text-gray-600 flex items-center gap-1 mb-1">
                      <Heart className="w-3 h-3" />
                      Traditions & Rituals
                    </p>
                    <div className="flex flex-wrap gap-1">
                      {entry.rituals.map((ritual, idx) => (
                        <span key={idx} className="text-xs bg-rose-100 text-rose-700 px-2 py-1 rounded-full">
                          {ritual}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
