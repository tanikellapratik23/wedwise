import { Calendar, Clock } from 'lucide-react';

interface WeddingDateProps {
  data: { weddingDate?: string; weddingTime?: string };
  updateData: (data: any) => void;
  onNext: () => void;
  onBack: () => void;
}

export default function WeddingDate({ data, updateData, onNext, onBack }: WeddingDateProps) {
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (data.weddingDate) {
      onNext();
    }
  };

  return (
    <div className="max-w-2xl mx-auto">
      <div className="text-center mb-8">
        <div className="inline-flex items-center justify-center w-16 h-16 bg-pink-100 text-pink-600 rounded-full mb-4">
          <Calendar className="w-8 h-8" />
        </div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">When's the big day?</h2>
        <p className="text-gray-600">
          Tell us your wedding date so we can help you plan and countdown to your special day 💕
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="bg-white rounded-xl shadow-sm p-8 border border-gray-200 space-y-6">
          {/* Wedding Date */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Wedding Date <span className="text-red-500">*</span>
            </label>
            <input
              type="date"
              value={data.weddingDate || ''}
              onChange={(e) => updateData({ weddingDate: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 bg-gray-50 focus:ring-2 focus:ring-pink-500 focus:border-transparent text-lg"
              required
              min={new Date().toISOString().split('T')[0]}
            />
            <p className="text-sm text-gray-500 mt-1">Choose your wedding date</p>
          </div>

          {/* Wedding Time (Optional) */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
              <Clock className="w-4 h-4" />
              Wedding Time (Optional)
            </label>
            <input
              type="time"
              value={data.weddingTime || ''}
              onChange={(e) => updateData({ weddingTime: e.target.value })}
              className="w-full px-4 py-3 border border-gray-300 rounded-lg text-gray-900 bg-gray-50 focus:ring-2 focus:ring-pink-500 focus:border-transparent text-lg"
            />
            <p className="text-sm text-gray-500 mt-1">
              What time will your ceremony start? (You can update this later)
            </p>
          </div>

          {/* Preview */}
          {data.weddingDate && (
            <div className="bg-gradient-to-r from-pink-50 to-purple-50 rounded-lg p-4 border border-pink-200">
              <p className="text-sm font-medium text-gray-700 mb-1">Your Wedding:</p>
              <p className="text-lg font-bold text-gray-900">
                {new Date(data.weddingDate + 'T00:00:00').toLocaleDateString('en-US', {
                  weekday: 'long',
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
                {data.weddingTime && (
                  <span className="text-pink-600">
                    {' '}
                    at{' '}
                    {new Date(`2000-01-01T${data.weddingTime}`).toLocaleTimeString('en-US', {
                      hour: 'numeric',
                      minute: '2-digit',
                      hour12: true,
                    })}
                  </span>
                )}
              </p>
              <p className="text-sm text-gray-600 mt-2">
                {Math.floor(
                  (new Date(data.weddingDate + 'T00:00:00').getTime() - new Date().getTime()) /
                    (1000 * 60 * 60 * 24)
                )}{' '}
                days to go! 🎉
              </p>
            </div>
          )}
        </div>

        <div className="flex gap-4">
          <button
            type="button"
            onClick={onBack}
            className="flex-1 px-6 py-3 border-2 border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition font-medium"
          >
            Back
          </button>
          <button
            type="submit"
            disabled={!data.weddingDate}
            className="flex-1 px-6 py-3 bg-gradient-to-r from-primary-500 to-purple-600 text-white rounded-lg hover:from-primary-600 hover:to-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition font-medium"
          >
            Continue
          </button>
        </div>
      </form>
    </div>
  );
}
