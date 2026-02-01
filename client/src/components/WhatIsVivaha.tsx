import { Link } from 'react-router-dom';
import { Heart, ArrowLeft } from 'lucide-react';

export default function WhatIsVivaha() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 via-purple-50 to-blue-50">
      <header className="w-full border-b border-white/20 py-4 bg-white/80 backdrop-blur-sm sticky top-0 z-50">
        <div className="max-w-6xl mx-auto px-6 flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3 hover:opacity-80 transition">
            <div className="bg-primary-500 text-white p-2 rounded-md">
              <Heart className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-gray-900">Vivaha</h1>
              <p className="text-xs text-gray-500">Your Wedding Planner</p>
            </div>
          </Link>
          <Link to="/" className="flex items-center gap-2 px-4 py-2 text-gray-700 hover:bg-gray-100 rounded-md transition">
            <ArrowLeft className="w-4 h-4" />
            Back
          </Link>
        </div>
      </header>

      <main className="max-w-4xl mx-auto px-6 py-16">
        {/* Hero Section */}
        <div className="mb-16 text-center">
          <h1 className="text-4xl md:text-5xl font-extrabold text-gray-900 mb-4">
            Vivaha Planning for Modern & Interfaith Weddings
          </h1>
          <p className="text-xl text-gray-600">
            Everything you need to plan your perfect multicultural celebration
          </p>
        </div>

        {/* Main Content */}
        <div className="bg-white rounded-2xl shadow-lg p-8 md:p-12 mb-12 border border-gray-100">
          <h2 className="text-3xl font-bold text-gray-900 mb-6">What is Vivaha?</h2>
          
          <p className="text-lg text-gray-700 mb-6 leading-relaxed">
            <span className="font-semibold text-primary-700">Vivaha</span> is a modern platform designed for planning multicultural weddings and interfaith ceremonies. Whether you're planning a traditional celebration, an interfaith wedding, or a blend of cultural traditions, Vivaha brings all your wedding planning into one beautiful, organized space.
          </p>

          <div className="space-y-6 mb-8">
            <div className="border-l-4 border-primary-500 pl-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Plan Your Wedding Ceremonies</h3>
              <p className="text-gray-700">
                Coordinate multiple ceremonies and rituals with ease. From pre-wedding celebrations to main events, manage each ceremony's details, timing, and logistics all in one place.
              </p>
            </div>

            <div className="border-l-4 border-primary-500 pl-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Interfaith & Cultural Support</h3>
              <p className="text-gray-700">
                Planning an interfaith wedding? Vivaha supports Christian, Muslim, Jewish, Sikh, Buddhist, and other cultural traditions. Mix and match rituals, honor multiple customs, and celebrate your unique love story.
              </p>
            </div>

            <div className="border-l-4 border-primary-500 pl-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Guest Lists & Celebrations</h3>
              <p className="text-gray-700">
                Manage guest lists across multiple events. Track RSVPs, dietary preferences, and celebration preferences. Ensure every guest feels welcomed and informed.
              </p>
            </div>

            <div className="border-l-4 border-primary-500 pl-6">
              <h3 className="text-xl font-semibold text-gray-900 mb-2">Budgets & Vendors</h3>
              <p className="text-gray-700">
                Plan your budget across all ceremonies and events. Find trusted vendors specializing in Vivaha planning—photographers, caterers, florists, and more—all filtered for cultural understanding.
              </p>
            </div>
          </div>

          <div className="bg-primary-50 rounded-xl p-8 mb-8">
            <h3 className="text-2xl font-bold text-gray-900 mb-4">Why Choose Vivaha?</h3>
            <ul className="space-y-3 text-gray-700">
              <li className="flex items-start gap-3">
                <span className="text-primary-600 font-bold text-lg">✓</span>
                <span><strong>Built for Complexity:</strong> Modern multicultural wedding planning involves multiple ceremonies. Vivaha is designed to handle it all.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-primary-600 font-bold text-lg">✓</span>
                <span><strong>Interfaith Friendly:</strong> Honor multiple traditions in one wedding without conflict.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-primary-600 font-bold text-lg">✓</span>
                <span><strong>Smart Organization:</strong> Automated suggestions based on your wedding type, location, and preferences.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-primary-600 font-bold text-lg">✓</span>
                <span><strong>Offline Backup:</strong> Your wedding plans are safe with automatic backup and offline access.</span>
              </li>
              <li className="flex items-start gap-3">
                <span className="text-primary-600 font-bold text-lg">✓</span>
                <span><strong>Bachelor Party Planning:</strong> Coordinate your bachelor/bachelorette celebrations seamlessly.</span>
              </li>
            </ul>
          </div>
        </div>

        {/* CTA Section */}
        <div className="text-center space-y-6">
          <div>
            <h2 className="text-3xl font-bold text-gray-900 mb-3">Ready to Plan Your Vivaha?</h2>
            <p className="text-lg text-gray-600 mb-6">
              Start planning your perfect wedding celebration today
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link 
              to="/register" 
              className="px-8 py-3 bg-primary-600 text-white rounded-lg font-semibold hover:bg-primary-700 transition"
            >
              Start Planning Your Vivaha
            </Link>
            <Link 
              to="/login" 
              className="px-8 py-3 bg-white text-primary-600 border-2 border-primary-600 rounded-lg font-semibold hover:bg-primary-50 transition"
            >
              Sign In
            </Link>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-20 pt-8 border-t border-gray-200 text-center text-gray-600">
          <p className="mb-2">
            <strong>Vivaha</strong> — Multicultural wedding planning for interfaith ceremonies and celebrations
          </p>
          <p className="text-sm">Plan rituals, manage guests, organize budgets, and coordinate vendors all in one place</p>
        </div>
      </main>
    </div>
  );
}
