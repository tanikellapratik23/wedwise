// Average wedding costs by major US cities (2026 data)
export const cityWeddingCosts: Record<string, {
  averageCost: number;
  guestAverage: number;
  venueRange: [number, number];
  cateringPerPerson: [number, number];
  photographyRange: [number, number];
}> = {
  'New York': {
    averageCost: 76000,
    guestAverage: 150,
    venueRange: [12000, 35000],
    cateringPerPerson: [180, 300],
    photographyRange: [4000, 12000],
  },
  'San Francisco': {
    averageCost: 72000,
    guestAverage: 140,
    venueRange: [10000, 30000],
    cateringPerPerson: [170, 280],
    photographyRange: [3500, 11000],
  },
  'Los Angeles': {
    averageCost: 65000,
    guestAverage: 160,
    venueRange: [8000, 25000],
    cateringPerPerson: [150, 250],
    photographyRange: [3000, 10000],
  },
  'Chicago': {
    averageCost: 52000,
    guestAverage: 155,
    venueRange: [6000, 20000],
    cateringPerPerson: [120, 200],
    photographyRange: [2500, 8000],
  },
  'Miami': {
    averageCost: 48000,
    guestAverage: 145,
    venueRange: [5500, 18000],
    cateringPerPerson: [110, 190],
    photographyRange: [2300, 7500],
  },
  'Boston': {
    averageCost: 58000,
    guestAverage: 140,
    venueRange: [7000, 22000],
    cateringPerPerson: [130, 220],
    photographyRange: [2800, 9000],
  },
  'Seattle': {
    averageCost: 55000,
    guestAverage: 135,
    venueRange: [6500, 21000],
    cateringPerPerson: [125, 210],
    photographyRange: [2700, 8500],
  },
  'Austin': {
    averageCost: 42000,
    guestAverage: 150,
    venueRange: [4500, 15000],
    cateringPerPerson: [95, 160],
    photographyRange: [2000, 6500],
  },
  'Denver': {
    averageCost: 45000,
    guestAverage: 145,
    venueRange: [5000, 16000],
    cateringPerPerson: [100, 170],
    photographyRange: [2200, 7000],
  },
  'Portland': {
    averageCost: 43000,
    guestAverage: 130,
    venueRange: [4800, 15500],
    cateringPerPerson: [98, 165],
    photographyRange: [2100, 6800],
  },
  'Nashville': {
    averageCost: 40000,
    guestAverage: 155,
    venueRange: [4200, 14000],
    cateringPerPerson: [90, 150],
    photographyRange: [1900, 6200],
  },
  'Atlanta': {
    averageCost: 38000,
    guestAverage: 160,
    venueRange: [4000, 13500],
    cateringPerPerson: [85, 145],
    photographyRange: [1800, 6000],
  },
  'Phoenix': {
    averageCost: 35000,
    guestAverage: 150,
    venueRange: [3500, 12000],
    cateringPerPerson: [80, 135],
    photographyRange: [1700, 5500],
  },
};

// Get average cost for a city, fallback to national average
export function getCityAverageCost(city: string): number {
  const normalizedCity = city.split(',')[0].trim(); // Handle "San Francisco, CA"
  return cityWeddingCosts[normalizedCity]?.averageCost || 45000; // National average
}

// Get city data with fallback
export function getCityData(city: string) {
  const normalizedCity = city.split(',')[0].trim();
  return cityWeddingCosts[normalizedCity] || {
    averageCost: 45000,
    guestAverage: 150,
    venueRange: [5000, 15000] as [number, number],
    cateringPerPerson: [100, 170] as [number, number],
    photographyRange: [2000, 6500] as [number, number],
  };
}

// AI Budget Optimization suggestions
export function getBudgetOptimizationSuggestions(
  userBudget: number,
  guestCount: number,
  city: string,
  priorities: string[]
): string[] {
  const cityData = getCityData(city);
  const suggestions: string[] = [];
  const perGuestBudget = userBudget / guestCount;
  const avgPerGuest = cityData.averageCost / cityData.guestAverage;

  if (userBudget < cityData.averageCost * 0.7) {
    suggestions.push(`💡 Your budget is below ${city}'s average. Consider weekday weddings (20-30% savings) or off-season dates (November-March).`);
  }

  if (perGuestBudget < avgPerGuest * 0.8) {
    suggestions.push(`💰 To stay within budget, consider reducing guest count to ${Math.floor(userBudget / avgPerGuest)} guests or find cost-effective venue options.`);
  }

  if (!priorities.includes('Catering')) {
    const cateringSavings = (cityData.cateringPerPerson[1] - cityData.cateringPerPerson[0]) * guestCount;
    suggestions.push(`🍽️ Catering flexibility could save you $${cateringSavings.toLocaleString()}. Consider buffet style instead of plated service.`);
  }

  if (!priorities.includes('Photography')) {
    const photoSavings = cityData.photographyRange[1] - cityData.photographyRange[0];
    suggestions.push(`📸 Photography packages vary widely. Hiring a newer photographer could save $${photoSavings.toLocaleString()}.`);
  }

  if (priorities.includes('Venue')) {
    suggestions.push(`🏛️ Since venue is a priority, allocate ${Math.round((cityData.venueRange[1] / cityData.averageCost) * 100)}% of your budget ($${Math.round(userBudget * (cityData.venueRange[1] / cityData.averageCost)).toLocaleString()}).`);
  }

  suggestions.push(`📊 In ${city}, typical wedding costs: Venue 30%, Catering 30%, Photography 10%, Entertainment 8%, Flowers 8%, Other 14%.`);

  return suggestions;
}

// Ceremony planning suggestions based on religions
export function getCeremonyPlanningSuggestions(
  religions: string[],
  isInterfaith: boolean
): string[] {
  const suggestions: string[] = [];

  if (isInterfaith) {
    suggestions.push('🕊️ Interfaith ceremonies work best with two officiants or a celebrant trained in interfaith weddings.');
    suggestions.push('📜 Consider creating a unified ceremony program that explains traditions from both religions to help guests understand.');
    suggestions.push('💒 Many couples choose to honor both traditions by including key rituals from each religion in separate segments.');
  }

  religions.forEach(religion => {
    switch (religion) {
      case 'Christianity':
        suggestions.push('✝️ Christian weddings typically include readings, vows, ring exchange, and a blessing. Consider including communion if both families practice.');
        break;
      case 'Judaism':
        suggestions.push('✡️ Jewish ceremonies include the ketubah signing, chuppah, seven blessings, and breaking the glass. Plan for 30-45 minutes.');
        break;
      case 'Islam':
        suggestions.push('☪️ Islamic nikah ceremonies include the mahr (gift), ijab (proposal) and qubul (acceptance). Consider segregated seating if traditional.');
        break;
      case 'Hinduism':
        suggestions.push('🕉️ Hindu weddings include saptapadi (seven steps), kanyadaan, and sacred fire ceremony. Traditional ceremonies can last 3+ hours.');
        break;
      case 'Buddhism':
        suggestions.push('☸️ Buddhist ceremonies often include meditation, chanting, and blessing from monks. Consider water pouring ceremony.');
        break;
      case 'Sikhism':
        suggestions.push('☬ Sikh Anand Karaj ceremonies are held in gurdwara with Guru Granth Sahib. Include Laavan (four sacred hymns) and head coverings for all guests.');
        break;
    }
  });

  return suggestions;
}
