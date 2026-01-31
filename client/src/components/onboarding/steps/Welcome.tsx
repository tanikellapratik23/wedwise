import { Heart, Sparkles } from 'lucide-react';

interface WelcomeProps {
  onNext: () => void;
}

export default function Welcome({ onNext }: WelcomeProps) {
  return (
    <div className="text-center space-y-6">
      <div className="flex justify-center">
        <div className="bg-gradient-to-br from-primary-400 to-purple-500 text-white p-6 rounded-full">
          <Heart className="w-16 h-16" />
        </div>
      </div>

      <div className="space-y-3">
        <h1 className="text-4xl md:text-5xl font-bold text-gray-900">
          Hi! Welcome to WedWise 😊
        </h1>
        <p className="text-xl text-gray-600">
          Your personalized wedding planning companion
        </p>
      </div>

      <div className="bg-gradient-to-r from-primary-50 to-purple-50 rounded-xl p-6 space-y-4">
        <div className="flex items-start space-x-3">
          <Sparkles className="w-6 h-6 text-primary-500 flex-shrink-0 mt-1" />
          <div className="text-left">
            <h3 className="font-semibold text-gray-900">Personalized Planning</h3>
            <p className="text-gray-600 text-sm">
              We'll customize your experience based on your unique needs
            </p>
          </div>
        </div>
        <div className="flex items-start space-x-3">
          <Sparkles className="w-6 h-6 text-primary-500 flex-shrink-0 mt-1" />
          <div className="text-left">
            <h3 className="font-semibold text-gray-900">Stay Organized</h3>
            <p className="text-gray-600 text-sm">
              Track guests, budget, vendors, and to-dos all in one place
            </p>
          </div>
        </div>
        <div className="flex items-start space-x-3">
          <Sparkles className="w-6 h-6 text-primary-500 flex-shrink-0 mt-1" />
          <div className="text-left">
            <h3 className="font-semibold text-gray-900">Collaborate Easily</h3>
            <p className="text-gray-600 text-sm">
              Share planning tasks with your partner, family, or wedding planner
            </p>
          </div>
        </div>
      </div>

      <p className="text-gray-600">
        Let's get started! This will only take a few minutes.
      </p>

      <button
        onClick={onNext}
        className="w-full md:w-auto px-12 py-4 bg-primary-500 hover:bg-primary-600 text-white font-semibold rounded-xl transition shadow-lg hover:shadow-xl"
      >
        Let's Begin
      </button>
    </div>
  );
}
