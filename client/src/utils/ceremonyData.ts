// Pre-defined rituals and traditions for each religion

export interface ReligionCeremonyData {
  name: string;
  commonRituals: string[];
  traditions: string[];
  ceremonySections: string[];
  typicalDuration: string;
  dressCode?: string;
}

export const religionCeremonyData: Record<string, ReligionCeremonyData> = {
  'Christianity': {
    name: 'Christianity',
    commonRituals: [
      'Exchange of Vows',
      'Exchange of Rings',
      'Unity Candle Lighting',
      'Holy Communion',
      'Reading of Scripture',
      'Prayer and Blessing',
      'Pronouncement of Marriage',
      'First Kiss',
      'Signing of Marriage Certificate',
      'Recessional',
    ],
    traditions: [
      'Bride walks down aisle with father',
      'White wedding dress',
      'Throwing of rice or flower petals',
      'Wedding in church',
      'Organ or hymn music',
      'Benediction from priest/pastor',
    ],
    ceremonySections: ['Processional', 'Welcome & Prayer', 'Scripture Readings', 'Homily', 'Vows & Rings', 'Communion', 'Blessing', 'Recessional'],
    typicalDuration: '30-60 minutes',
    dressCode: 'Formal, modest attire',
  },
  'Judaism': {
    name: 'Judaism',
    commonRituals: [
      'Signing of Ketubah (marriage contract)',
      'Chuppah (wedding canopy) ceremony',
      'Circling (Hakafot) - bride circles groom',
      'Seven Blessings (Sheva Brachot)',
      'Exchange of rings',
      'Breaking of the glass',
      'Yichud (seclusion time)',
      'Reading from Torah',
      'Kiddushin (betrothal)',
      'Nisuin (marriage)',
    ],
    traditions: [
      'Wedding under chuppah (canopy)',
      'Fasting on wedding day',
      'Ketubah displayed at reception',
      'Hora dance at reception',
      'No weddings on Shabbat',
      'Male and female guests may sit separately (Orthodox)',
    ],
    ceremonySections: ['Ketubah Signing', 'Bedeken (Veiling)', 'Chuppah Ceremony', 'Seven Blessings', 'Breaking Glass', 'Yichud'],
    typicalDuration: '30-45 minutes',
    dressCode: 'Modest formal attire, head coverings for men',
  },
  'Islam': {
    name: 'Islam',
    commonRituals: [
      'Nikah (marriage contract)',
      'Mahr (bridal gift)',
      'Ijab (proposal by groom)',
      'Qubul (acceptance by bride)',
      'Khutbah (sermon)',
      'Reading from Quran',
      'Dua (prayers)',
      'Witnessing by two witnesses',
      'Signing of marriage contract',
      'Waleemah (wedding feast)',
    ],
    traditions: [
      'Mehndi/Henna ceremony (pre-wedding)',
      'Segregated seating (traditional)',
      'No music or dancing (strict observance)',
      'Modest dress for bride',
      'Wali (guardian) gives bride away',
      'Simple ceremony in mosque or home',
    ],
    ceremonySections: ['Khutbah', 'Nikah Ceremony', 'Mahr Presentation', 'Contract Signing', 'Dua', 'Waleemah'],
    typicalDuration: '20-30 minutes',
    dressCode: 'Modest attire, hijab for women, traditional dress preferred',
  },
  'Hinduism': {
    name: 'Hinduism',
    commonRituals: [
      'Kanyadaan (giving away of bride)',
      'Saptapadi (seven steps around sacred fire)',
      'Mangalsutra (sacred necklace)',
      'Sindoor (vermillion on bride)',
      'Hasta Melap (joining of hands)',
      'Agni Puja (fire worship)',
      'Saat Phere (seven circles around fire)',
      'Garland exchange (Jai Mala)',
      'Offerings to fire god (Havan)',
      'Blessing from elders',
    ],
    traditions: [
      'Multiple day celebration',
      'Mehndi/Henna ceremony',
      'Sangeet (music night)',
      'Baraat (groom\'s procession)',
      'Mandap (decorated canopy)',
      'Red or colorful bridal attire',
      'Sacred fire as witness',
    ],
    ceremonySections: ['Ganesh Puja', 'Kanyadaan', 'Hasta Melap', 'Agni Puja', 'Saptapadi', 'Sindoor & Mangalsutra', 'Ashirvad'],
    typicalDuration: '2-4 hours',
    dressCode: 'Traditional Indian attire, bright colors, avoid black/white',
  },
  'Buddhism': {
    name: 'Buddhism',
    commonRituals: [
      'Chanting of sutras',
      'Water pouring ceremony',
      'Blessing from monk(s)',
      'Three refuges recitation',
      'Exchange of vows',
      'Offering of flowers to Buddha',
      'Lighting of candles/incense',
      'Meditation period',
      'Tying of blessed string (Sai Sin)',
      'Merit-making activities',
    ],
    traditions: [
      'Ceremony at temple or home',
      'Monks perform blessings',
      'Morning ceremony preferred',
      'Vegetarian food offerings',
      'White or light colored attire',
      'Removal of shoes in temple',
    ],
    ceremonySections: ['Welcoming', 'Chanting', 'Dharma Talk', 'Water Ceremony', 'Vows', 'Blessing', 'Merit Making'],
    typicalDuration: '45-90 minutes',
    dressCode: 'Modest, light colors preferred, remove shoes in temple',
  },
  'Sikhism': {
    name: 'Sikhism',
    commonRituals: [
      'Anand Karaj (blissful union)',
      'Four Laavan (four sacred hymns)',
      'Circumambulation of Guru Granth Sahib',
      'Reading from Guru Granth Sahib',
      'Ardas (Sikh prayer)',
      'Palla ceremony (joining of scarves)',
      'Karah Parshad distribution',
      'Signing of marriage register',
      'Kirtan (devotional singing)',
      'Blessing from Guru Granth Sahib',
    ],
    traditions: [
      'Ceremony held in Gurdwara',
      'Head covering mandatory for all',
      'Sitting on floor during ceremony',
      'Langar (community meal) served',
      'No dowry or lavish displays',
      'Simplicity emphasized',
    ],
    ceremonySections: ['Ardas', 'Reading', 'Four Laavan', 'Palla Ceremony', 'Final Ardas', 'Karah Parshad', 'Langar'],
    typicalDuration: '2-3 hours',
    dressCode: 'Modest attire, head covering required, remove shoes',
  },
  'Bahá\'í': {
    name: 'Bahá\'í',
    commonRituals: [
      'Parental consent',
      'Bahá\'í vows ("We will all verily abide by the Will of God")',
      'Reading from Bahá\'í writings',
      'Witnessing by Spiritual Assembly',
      'Prayer and meditation',
      'Musical performance',
      'Exchange of rings (optional)',
      'Unity themes emphasized',
      'Simple ceremony structure',
    ],
    traditions: [
      'Extremely simple ceremony',
      'No clergy or ritual',
      'Parental approval required',
      'Two witnesses needed',
      'No alcohol at celebration',
      'Emphasis on spiritual unity',
    ],
    ceremonySections: ['Welcome', 'Reading from Writings', 'Vows', 'Prayer', 'Signing of Certificate'],
    typicalDuration: '20-30 minutes',
    dressCode: 'Modest, no specific requirements',
  },
  'Jainism': {
    name: 'Jainism',
    commonRituals: [
      'Ganesh Puja',
      'Laja Homa (offering to fire)',
      'Saptapadi (seven steps)',
      'Hasta Milap (joining hands)',
      'Kanyadaan (giving away bride)',
      'Agni parikrama (circling fire)',
      'Mangal pheras (sacred rounds)',
      'Ashirvad (blessings from elders)',
      'Chanting of mantras',
      'Vegetarian feast',
    ],
    traditions: [
      'Strict vegetarian ceremony and feast',
      'No leather products',
      'Morning or afternoon ceremony',
      'Simple, non-violent celebrations',
      'Traditional attire',
      'Emphasis on non-violence (Ahimsa)',
    ],
    ceremonySections: ['Puja', 'Hasta Milap', 'Kanyadaan', 'Laja Homa', 'Saptapadi', 'Ashirvad'],
    typicalDuration: '2-3 hours',
    dressCode: 'Traditional Indian attire, no leather, modest',
  },
  'Shinto': {
    name: 'Shinto',
    commonRituals: [
      'San San Kudo (sake-sharing ceremony)',
      'Purification rite (Harai)',
      'Prayer and offerings to kami',
      'Exchanging of sake cups',
      'Tamagushi offering (sacred branch)',
      'Ring exchange (modern addition)',
      'Priest blessing',
      'Bowing to shrine',
      'Processional to shrine',
    ],
    traditions: [
      'Ceremony at Shinto shrine',
      'White kimono for bride',
      'Shiro-muku (traditional white kimono)',
      'Tsunokakushi (head covering)',
      'Small, intimate ceremony',
      'Family-focused celebration',
    ],
    ceremonySections: ['Purification', 'Procession', 'Prayer', 'San San Kudo', 'Tamagushi', 'Ring Exchange', 'Final Blessing'],
    typicalDuration: '30-45 minutes',
    dressCode: 'Traditional Japanese attire (kimono), formal',
  },
  'Taoism': {
    name: 'Taoism',
    commonRituals: [
      'Tea ceremony',
      'Bowing to heaven and earth',
      'Incense offering',
      'Red envelope exchange',
      'Prayer to ancestors',
      'Taoist priest blessing',
      'Harmony and balance rituals',
      'Exchange of vows',
      'Unity cup ceremony',
      'Zodiac compatibility reading',
    ],
    traditions: [
      'Auspicious date selection',
      'Red color symbolism',
      'Tea ceremony for families',
      'Bowing to parents',
      'Dragon and phoenix imagery',
      'Emphasis on harmony and balance',
    ],
    ceremonySections: ['Tea Ceremony', 'Incense Offering', 'Ancestor Prayer', 'Vows', 'Priest Blessing', 'Unity Ceremony'],
    typicalDuration: '1-2 hours',
    dressCode: 'Traditional Chinese attire (Qipao/Changshan), red preferred',
  },
  'Zoroastrianism': {
    name: 'Zoroastrianism',
    commonRituals: [
      'Achu Michu (blessing with rice)',
      'Exchange of rings',
      'Joining hands with white cloth',
      'Seven steps ceremony',
      'Prayer by priest (Mobed)',
      'Signing of marriage contract',
      'Throwing of rice',
      'Fire temple blessing',
      'Recitation of Yasna',
      'Honey ceremony',
    ],
    traditions: [
      'Ceremony at fire temple or home',
      'Presence of Mobed (priest)',
      'White attire preferred',
      'Sacred fire as witness',
      'Evening ceremony common',
      'Traditional Persian elements',
    ],
    ceremonySections: ['Prayer', 'Achu Michu', 'Ring Exchange', 'Seven Steps', 'Contract Signing', 'Blessing'],
    typicalDuration: '45-60 minutes',
    dressCode: 'Traditional white or light colored attire',
  },
  'Wicca': {
    name: 'Wicca',
    commonRituals: [
      'Handfasting (binding of hands)',
      'Casting the circle',
      'Calling the quarters',
      'Invoking deity',
      'Exchange of vows',
      'Jumping the broom',
      'Sharing of wine/cakes',
      'Blessing of rings',
      'Declaration of union',
      'Opening the circle',
    ],
    traditions: [
      'Outdoor ceremony preferred',
      'Nature-based elements',
      'Circle of participants',
      'Seasonal timing important',
      'Personalized ritual',
      'No standard format',
    ],
    ceremonySections: ['Circle Casting', 'Quarter Calling', 'Deity Invocation', 'Handfasting', 'Vows', 'Broom Jumping', 'Cakes & Wine', 'Circle Opening'],
    typicalDuration: '30-60 minutes',
    dressCode: 'Nature-inspired, comfortable, often includes ritual robes',
  },
  'Native American': {
    name: 'Native American',
    commonRituals: [
      'Blanket ceremony',
      'Smudging with sage',
      'Circle of unity',
      'Four directions blessing',
      'Exchange of gifts',
      'Sharing of food (corn, berries)',
      'Blessing from elder',
      'Traditional songs/drums',
      'Feather ceremony',
      'Honoring ancestors',
    ],
    traditions: [
      'Outdoor ceremony',
      'Connection to nature',
      'Tribal-specific customs',
      'Honoring of elders',
      'Traditional dress',
      'Community involvement',
    ],
    ceremonySections: ['Smudging', 'Four Directions', 'Elder Blessing', 'Blanket Ceremony', 'Vows', 'Gift Exchange', 'Feast'],
    typicalDuration: '1-2 hours',
    dressCode: 'Traditional tribal attire, respectful of culture',
  },
  'African Traditional': {
    name: 'African Traditional',
    commonRituals: [
      'Libation ceremony',
      'Jumping the broom',
      'Knot tying ceremony',
      'Cowrie shell divination',
      'Ancestor honoring',
      'Traditional drumming',
      'Dance celebration',
      'Exchange of kola nuts',
      'Wine/palm wine ceremony',
      'Community blessing',
    ],
    traditions: [
      'Colorful traditional attire',
      'Community participation',
      'Multiple day celebration',
      'Bride price ceremony',
      'Traditional music and dance',
      'Oral traditions shared',
    ],
    ceremonySections: ['Libation', 'Ancestor Honoring', 'Vows', 'Knot Tying', 'Jumping Broom', 'Wine Ceremony', 'Dancing'],
    typicalDuration: '2-4 hours or multiple days',
    dressCode: 'Traditional African attire (dashiki, kente, etc.), vibrant colors',
  },
  'Other': {
    name: 'Other/Cultural',
    commonRituals: [
      'Exchange of vows',
      'Exchange of rings',
      'Unity ceremony (candle, sand, etc.)',
      'Reading of poetry/literature',
      'Musical performance',
      'Cultural tradition inclusion',
      'Family blessing',
      'Declaration of marriage',
      'First kiss',
      'Celebration',
    ],
    traditions: [
      'Personalized ceremony',
      'Cultural elements',
      'Family involvement',
      'Meaningful readings',
      'Secular or spiritual mix',
      'Flexible format',
    ],
    ceremonySections: ['Welcome', 'Readings', 'Vows', 'Rings', 'Unity Ceremony', 'Pronouncement', 'Celebration'],
    typicalDuration: '20-45 minutes',
    dressCode: 'Varies by culture and preference',
  },
};

// Get rituals for specific religion
export function getRitualsForReligion(religion: string): string[] {
  return religionCeremonyData[religion]?.commonRituals || [];
}

// Get traditions for specific religion
export function getTraditionsForReligion(religion: string): string[] {
  return religionCeremonyData[religion]?.traditions || [];
}

// Get ceremony structure for religion
export function getCeremonyStructure(religion: string): string[] {
  return religionCeremonyData[religion]?.ceremonySections || [];
}

// Get all available rituals and traditions for multiple religions (interfaith)
export function getInterfaithOptions(religions: string[]): {
  allRituals: string[];
  allTraditions: string[];
} {
  const allRituals = new Set<string>();
  const allTraditions = new Set<string>();

  religions.forEach(religion => {
    getRitualsForReligion(religion).forEach(r => allRituals.add(r));
    getTraditionsForReligion(religion).forEach(t => allTraditions.add(t));
  });

  return {
    allRituals: Array.from(allRituals),
    allTraditions: Array.from(allTraditions),
  };
}
