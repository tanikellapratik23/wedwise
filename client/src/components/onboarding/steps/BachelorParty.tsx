import { PartyPopper, Check } from 'lucide-react';

interface BachelorPartyProps {
  wantsBachelorParty: boolean;
  onChange: (value: boolean) => void;
}

export default function BachelorParty({ wantsBachelorParty, onChange }: BachelorPartyProps) {
  return (
    <div className="space-y-8">
      <div>
        <h2 className="text-3xl font-bold text-gray-900 mb-2">Bachelor / Bachelorette Trip</h2>
        <p className="text-gray-600">
          Would you like to use Vivaha to plan and coordinate your bachelor or bachelorette trip as well?
        </p>
      </div>

      <div className="space-y-4">
        <button
          onClick={() => onChange(true)}
          className={`w-full p-6 rounded-xl border-2 transition ${
            wantsBachelorParty
              ? 'border-pink-500 bg-pink-50'
              : 'border-gray-200 bg-white hover:border-pink-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 text-left">
              <PartyPopper className={`w-8 h-8 ${wantsBachelorParty ? 'text-pink-600' : 'text-gray-400'}`} />
              <div>
                <h3 className="text-lg font-semibold text-gray-900">Yes, plan my trip too!</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Get a dedicated dashboard for budget tracking, flights, stays, and expense splitting
                </p>
              </div>
            </div>
            {wantsBachelorParty && <Check className="w-6 h-6 text-pink-600 flex-shrink-0" />}
          </div>
        </button>

        <button
          onClick={() => onChange(false)}
          className={`w-full p-6 rounded-xl border-2 transition ${
            !wantsBachelorParty
              ? 'border-pink-500 bg-pink-50'
              : 'border-gray-200 bg-white hover:border-pink-300'
          }`}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4 text-left">
              <div className="w-8 h-8" />
              <div>
                <h3 className="text-lg font-semibold text-gray-900">No, just wedding planning</h3>
                <p className="text-sm text-gray-600 mt-1">
                  Focus on the wedding. You can always add this later!
                </p>
              </div>
            </div>
            {!wantsBachelorParty && <Check className="w-6 h-6 text-pink-600 flex-shrink-0" />}
          </div>
        </button>
      </div>

      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-semibold text-blue-900 mb-2">Bachelor/Bachelorette Dashboard includes:</h4>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>✓ Budget tracking with per-person cost calculation</li>
          <li>✓ Expense splitting and payment tracking</li>
          <li>✓ Guest list management</li>
          <li>✓ Flight search and comparison</li>
          <li>✓ Accommodation booking integration</li>
          <li>✓ Real-time cost coordination</li>
        </ul>
      </div>
    </div>
  );
}
