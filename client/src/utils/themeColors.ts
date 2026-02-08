// Theme color mappings for dashboard background with subtle gradients
export const themeColorMap: Record<string, { bg: string; accent: string; text: string }> = {
  'Romantic Pink': {
    bg: 'bg-gradient-to-br from-white via-pink-50 to-pink-100',
    accent: 'bg-pink-100',
    text: 'text-pink-600',
  },
  'Classic White': {
    bg: 'bg-gradient-to-br from-white to-gray-50',
    accent: 'bg-gray-100',
    text: 'text-gray-600',
  },
  'Elegant Gold': {
    bg: 'bg-gradient-to-br from-white via-yellow-50 to-yellow-100',
    accent: 'bg-yellow-100',
    text: 'text-yellow-700',
  },
  'Navy Blue': {
    bg: 'bg-gradient-to-br from-white via-blue-50 to-blue-100',
    accent: 'bg-blue-100',
    text: 'text-blue-700',
  },
  'Sage Green': {
    bg: 'bg-gradient-to-br from-white via-green-50 to-green-100',
    accent: 'bg-green-100',
    text: 'text-green-700',
  },
  'Lavender': {
    bg: 'bg-gradient-to-br from-white via-purple-50 to-purple-100',
    accent: 'bg-purple-100',
    text: 'text-purple-700',
  },
  'Blush': {
    bg: 'bg-gradient-to-br from-white via-pink-50 to-pink-100',
    accent: 'bg-pink-100',
    text: 'text-pink-600',
  },
  'Burgundy': {
    bg: 'bg-gradient-to-br from-white via-red-50 to-red-100',
    accent: 'bg-red-100',
    text: 'text-red-700',
  },
};

export function getThemeClasses(colorTheme: string | null | undefined) {
  if (!colorTheme) {
    return { bg: 'bg-gradient-to-br from-white to-gray-50', accent: 'bg-gray-50', text: 'text-gray-600' };
  }
  return themeColorMap[colorTheme] || { bg: 'bg-gradient-to-br from-white to-gray-50', accent: 'bg-gray-50', text: 'text-gray-600' };
}
