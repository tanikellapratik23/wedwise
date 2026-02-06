import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  X, ChevronRight, ChevronLeft, Lock, FileText, AlertTriangle, 
  Calendar, DollarSign, Users, Sparkles, CheckCircle
} from 'lucide-react';

interface TutorialStep {
  id: number;
  title: string;
  description: string;
  icon: React.ReactNode;
  features: string[];
  position: 'center' | 'top' | 'bottom';
}

const tutorialSteps: TutorialStep[] = [
  {
    id: 1,
    title: '🔒 Lock Decisions',
    description: 'Once something\'s decided, it\'s frozen. No more endless debates.',
    icon: <Lock className="w-12 h-12 text-pink-600" />,
    features: [
      'Venue, date, and guest count get locked once finalized',
      'Changing locked items shows extra costs and downstream breakage',
      'Requires both partners to unlock decisions',
      'Prevents endless re-litigation of settled decisions',
      'See impact on vendors, travel, and invites before changing'
    ],
    position: 'center'
  },
  {
    id: 2,
    title: '📄 Single Source of Truth',
    description: 'One page you can send to anyone with all the essential details.',
    icon: <FileText className="w-12 h-12 text-blue-600" />,
    features: [
      'Share one link with date, venue, dress code, hotel block',
      'Auto-updates everywhere when you make changes',
      'Contact person info always accessible',
      'Stops "what time is it again?" messages',
      'Way more valuable than guest chat features'
    ],
    position: 'center'
  },
  {
    id: 3,
    title: '⚠️ Vendor Reality Log',
    description: 'Track vendor reliability so you know who to trust on wedding week.',
    icon: <AlertTriangle className="w-12 h-12 text-orange-600" />,
    features: [
      'Log: Did they respond on time? Did price change?',
      'Add notes after each interaction',
      'Wedding week highlights vendors with risk flags',
      'Catches issues early without drama',
      'Know who you can count on before the big day'
    ],
    position: 'center'
  },
  {
    id: 4,
    title: '📱 Day-Of Control Panel',
    description: 'Minimal, offline-accessible control panel for wedding day chaos.',
    icon: <Calendar className="w-12 h-12 text-purple-600" />,
    features: [
      'Final timeline at your fingertips',
      'All vendor phone numbers in one place',
      'One assigned decision-maker per issue type',
      'Emergency notes and backup plans',
      'Works offline - no wifi needed on the big day'
    ],
    position: 'center'
  },
  {
    id: 5,
    title: '💰 Real Spend Mode',
    description: 'See where money actually is: planned, committed, paid, and outstanding.',
    icon: <DollarSign className="w-12 h-12 text-green-600" />,
    features: [
      'Shows: Planned → Committed → Paid → Outstanding',
      'Splitwise integration ties to actual payments',
      'No more panic about where money went',
      'Track deposits vs final payments clearly',
      'Real-time budget vs actual spend comparison'
    ],
    position: 'center'
  },
  {
    id: 6,
    title: '👥 One-Person Mode',
    description: 'Bachelor/bachelorette trips work better with one planner in control.',
    icon: <Users className="w-12 h-12 text-indigo-600" />,
    features: [
      'One planner controls all trip details',
      'Others only see: what they owe, dates, location',
      'No group chaos with everyone editing everything',
      'Clean decision-making without committee paralysis',
      'Bachelor trips succeed when one person leads'
    ],
    position: 'center'
  }
];

interface TutorialProps {
  onClose: () => void;
}

export default function Tutorial({ onClose }: TutorialProps) {
  const [currentStep, setCurrentStep] = useState(0);
  const [isVisible, setIsVisible] = useState(true);

  const currentStepData = tutorialSteps[currentStep];
  const isFirstStep = currentStep === 0;
  const isLastStep = currentStep === tutorialSteps.length - 1;

  const handleNext = () => {
    if (!isLastStep) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrev = () => {
    if (!isFirstStep) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300);
  };

  const handleFinish = () => {
    handleClose();
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        handleClose();
      } else if (e.key === 'ArrowRight' && !isLastStep) {
        handleNext();
      } else if (e.key === 'ArrowLeft' && !isFirstStep) {
        handlePrev();
      }
    };

    window.addEventListener('keydown', handleKeyPress);
    return () => window.removeEventListener('keydown', handleKeyPress);
  }, [currentStep]);

  return (
    <AnimatePresence>
      {isVisible && (
        <>
          {/* Overlay */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-[100]"
            onClick={handleClose}
          />

          {/* Exit Button - Top Left */}
          <motion.button
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            onClick={handleClose}
            className="fixed top-6 left-6 z-[102] flex items-center gap-2 px-4 py-2 bg-white/95 hover:bg-white text-gray-700 font-semibold rounded-lg shadow-lg transition-all hover:scale-105"
          >
            <X className="w-5 h-5" />
            Exit Tutorial
          </motion.button>

          {/* Progress Indicator - Top Right */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 20 }}
            className="fixed top-6 right-6 z-[102] bg-white/95 px-4 py-2 rounded-lg shadow-lg"
          >
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-gray-700">
                {currentStep + 1} / {tutorialSteps.length}
              </span>
              <div className="flex gap-1">
                {tutorialSteps.map((_, idx) => (
                  <div
                    key={idx}
                    className={`w-2 h-2 rounded-full transition-all ${
                      idx === currentStep
                        ? 'bg-gradient-to-r from-primary-500 to-pink-500 w-4'
                        : idx < currentStep
                        ? 'bg-green-500'
                        : 'bg-gray-300'
                    }`}
                  />
                ))}
              </div>
            </div>
          </motion.div>

          {/* Tutorial Content Box */}
          <motion.div
            key={currentStep}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            transition={{ type: 'spring', damping: 25, stiffness: 300 }}
            className="fixed inset-0 z-[101] flex items-center justify-center p-4"
          >
            <div className="w-full max-w-2xl max-h-[90vh] overflow-hidden">
              <div className="bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
                {/* Header with gradient */}
                <div className="bg-gradient-to-r from-primary-500 via-pink-500 to-purple-600 p-6 text-white flex-shrink-0">
                <div className="flex items-center justify-center mb-3">
                  {currentStepData.icon}
                </div>
                <h2 className="text-2xl font-bold text-center mb-2">
                  {currentStepData.title}
                </h2>
                <p className="text-white/90 text-center text-base">
                  {currentStepData.description}
                </p>
              </div>

              {/* Content - Scrollable */}
              <div className="p-6 overflow-y-auto flex-1">
                <div className="space-y-2">
                  {currentStepData.features.map((feature, idx) => (
                    <motion.div
                      key={idx}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: idx * 0.1 }}
                      className="flex items-start gap-3 bg-gradient-to-r from-gray-50 to-white p-3 rounded-lg border border-gray-200 hover:border-primary-300 transition-all"
                    >
                      <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0 mt-0.5" />
                      <p className="text-gray-700 text-sm leading-relaxed">{feature}</p>
                    </motion.div>
                  ))}
                </div>

                {/* Why It Matters Badge */}
                <div className="mt-4 bg-gradient-to-r from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-3">
                  <div className="flex items-center gap-2 mb-2">
                    <Sparkles className="w-5 h-5 text-purple-600" />
                    <span className="text-sm font-bold text-purple-900">Why This Matters</span>
                  </div>
                  <p className="text-sm text-purple-800 leading-relaxed">
                    {currentStep === 0 && 'No other app enforces finality - prevent endless re-litigation of decisions.'}
                    {currentStep === 1 && 'Stops 200 "what time is it again?" texts - one link, always up to date.'}
                    {currentStep === 2 && 'Vendors flake. This catches it early without being dramatic.'}
                    {currentStep === 3 && 'When things go wrong, nobody opens a planning app — unless it\'s this simple.'}
                    {currentStep === 4 && 'Couples don\'t panic when they see where the money actually is.'}
                    {currentStep === 5 && 'Bachelor trips fail when everyone edits everything - one leader wins.'}
                  </p>
                </div>
              </div>

              {/* Navigation Footer */}
              <div className="bg-gray-50 px-6 py-4 flex items-center justify-between border-t border-gray-200 flex-shrink-0">
                <button
                  onClick={handlePrev}
                  disabled={isFirstStep}
                  className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold transition-all ${
                    isFirstStep
                      ? 'text-gray-400 cursor-not-allowed'
                      : 'text-gray-700 hover:bg-white hover:shadow-md'
                  }`}
                >
                  <ChevronLeft className="w-5 h-5" />
                  Previous
                </button>

                <div className="text-xs text-gray-500 font-medium">
                  Use ← → keys
                </div>

                {!isLastStep ? (
                  <button
                    onClick={handleNext}
                    className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-primary-500 to-pink-500 hover:from-primary-600 hover:to-pink-600 text-white font-semibold rounded-lg transition-all hover:scale-105 shadow-lg"
                  >
                    Next
                    <ChevronRight className="w-5 h-5" />
                  </button>
                ) : (
                  <button
                    onClick={handleFinish}
                    className="flex items-center gap-2 px-6 py-2 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white font-semibold rounded-lg transition-all hover:scale-105 shadow-lg"
                  >
                    <CheckCircle className="w-5 h-5" />
                    Got It!
                  </button>
                )}
              </div>
            </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
