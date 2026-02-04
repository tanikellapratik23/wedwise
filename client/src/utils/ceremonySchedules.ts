// Wedding schedule templates for different religions and interfaith ceremonies

export interface ScheduleEvent {
  time: string;
  duration: string;
  name: string;
  description: string;
  significance?: string;
  tips?: string[];
}

export interface DaySchedule {
  dayNumber: number;
  dayName: string;
  dayType: 'pre-wedding' | 'wedding' | 'post-wedding';
  events: ScheduleEvent[];
  whyEffective: string;
}

export interface CeremonySchedule {
  religion: string;
  description: string;
  totalDays: number;
  schedule: DaySchedule[];
}

export const ceremonySchedules: Record<string, CeremonySchedule> = {
  hindu: {
    religion: 'Hindu Wedding',
    description: 'Traditional Hindu wedding with sacred rituals spread across multiple days',
    totalDays: 4,
    schedule: [
      {
        dayNumber: 1,
        dayName: 'Mehendi & Sangeet',
        dayType: 'pre-wedding',
        events: [
          {
            time: '2:00 PM',
            duration: '3 hours',
            name: 'Mehendi Ceremony',
            description: 'Henna application for bride, bridesmaids, and female guests',
            significance: 'The darker the mehendi, the stronger the love between bride and groom',
            tips: [
              'Book professional mehendi artists 2-3 months in advance',
              'Set up a comfortable seating area with cushions',
              'Provide refreshments and entertainment',
            ],
          },
          {
            time: '7:00 PM',
            duration: '4 hours',
            name: 'Sangeet Night',
            description: 'Musical evening with dance performances and celebrations',
            significance: 'Brings both families together through music and joy',
            tips: [
              'Choreograph performances 1-2 months ahead',
              'Mix traditional and modern songs',
              'Have a good sound system and DJ',
            ],
          },
        ],
        whyEffective: 'Starting with mehendi and sangeet allows families to bond in a relaxed, joyful atmosphere before the formal ceremonies. It sets a celebratory tone while keeping pre-wedding stress manageable.',
      },
      {
        dayNumber: 2,
        dayName: 'Haldi & Ganesh Puja',
        dayType: 'pre-wedding',
        events: [
          {
            time: '9:00 AM',
            duration: '1.5 hours',
            name: 'Ganesh Puja',
            description: 'Invoking Lord Ganesh for blessings and obstacle removal',
            significance: 'Ensures a smooth wedding ceremony without obstacles',
            tips: [
              'Arrange a small mandap or altar',
              'Have fresh flowers and fruits ready',
              'Invite close family for intimate blessings',
            ],
          },
          {
            time: '11:00 AM',
            duration: '2 hours',
            name: 'Haldi Ceremony',
            description: 'Turmeric paste applied to bride and groom separately',
            significance: 'Purifies and beautifies the couple, brings glow to skin',
            tips: [
              'Wear clothes you don\'t mind staining yellow',
              'Set up outdoor if possible for easy cleanup',
              'Have towels and water ready',
            ],
          },
          {
            time: '7:00 PM',
            duration: '2 hours',
            name: 'Family Dinner',
            description: 'Intimate dinner with immediate family',
            significance: 'Last meal as unmarried individuals with their families',
          },
        ],
        whyEffective: 'Haldi in the morning gives the turmeric paste time to work its magic. Evening family dinner provides emotional grounding before the big day.',
      },
      {
        dayNumber: 3,
        dayName: 'Wedding Day',
        dayType: 'wedding',
        events: [
          {
            time: '6:00 AM',
            duration: '1 hour',
            name: 'Bride/Groom Preparation',
            description: 'Getting ready with help from family and friends',
            tips: [
              'Have a light breakfast',
              'Start makeup/grooming early',
              'Take moments to breathe and enjoy',
            ],
          },
          {
            time: '9:00 AM',
            duration: '1 hour',
            name: 'Baraat Arrival',
            description: 'Groom arrives with family in grand procession',
            significance: 'Traditional welcome of the groom by bride\'s family',
            tips: [
              'Arrange horse or vintage car in advance',
              'Coordinate with DJ for high-energy music',
              'Prepare for milni ceremony',
            ],
          },
          {
            time: '10:30 AM',
            duration: '2.5 hours',
            name: 'Main Wedding Ceremony',
            description: 'Sacred rituals including Kanyadaan, Saptapadi (7 vows), and Sindoor application',
            significance: 'The most sacred part where couple becomes legally married',
            tips: [
              'Work with priest on timing',
              'Have a coordinator to guide family',
              'Ensure mandap is decorated beautifully',
            ],
          },
          {
            time: '1:00 PM',
            duration: '2 hours',
            name: 'Wedding Lunch',
            description: 'Elaborate buffet for all guests',
          },
          {
            time: '3:00 PM',
            duration: '1 hour',
            name: 'Vidaai',
            description: 'Emotional farewell as bride leaves with groom',
            significance: 'Bride says goodbye to her family and begins new life',
            tips: [
              'Have tissues ready for emotional moments',
              'Decorate the car beautifully',
              'Brief family on traditions',
            ],
          },
        ],
        whyEffective: 'Morning muhurat (auspicious time) is ideal for Hindu ceremonies. The schedule flows naturally from ceremony to celebration to emotional farewell.',
      },
      {
        dayNumber: 4,
        dayName: 'Reception',
        dayType: 'post-wedding',
        events: [
          {
            time: '6:00 PM',
            duration: '1 hour',
            name: 'Guest Arrival & Cocktails',
            description: 'Guests arrive and mingle with drinks and appetizers',
          },
          {
            time: '7:00 PM',
            duration: '30 minutes',
            name: 'Couple\'s Grand Entrance',
            description: 'Newlyweds make their first appearance as married couple',
            tips: [
              'Choose a dramatic entrance song',
              'Coordinate lighting and fog effects',
              'Have photographer ready',
            ],
          },
          {
            time: '7:30 PM',
            duration: '1 hour',
            name: 'Dinner Service',
            description: 'Formal sit-down dinner or elaborate buffet',
          },
          {
            time: '8:30 PM',
            duration: '30 minutes',
            name: 'Speeches & Toasts',
            description: 'Parents, best man, maid of honor share memories and wishes',
          },
          {
            time: '9:00 PM',
            duration: '15 minutes',
            name: 'First Dance',
            description: 'Couple\'s first dance followed by parent dances',
          },
          {
            time: '9:15 PM',
            duration: '2 hours',
            name: 'Open Dancing',
            description: 'Dance floor opens for all guests',
            tips: [
              'Mix Bollywood and Western songs',
              'Take requests throughout',
              'Keep energy high with good transitions',
            ],
          },
          {
            time: '11:15 PM',
            duration: '15 minutes',
            name: 'Cake Cutting',
            description: 'Traditional cake cutting ceremony',
          },
          {
            time: '11:30 PM',
            duration: '30 minutes',
            name: 'Send-Off',
            description: 'Sparkler send-off or grand finale',
          },
        ],
        whyEffective: 'Reception on a separate day keeps guests fresh and energized. Evening timing is perfect for dancing and celebration without exhaustion from morning ceremonies.',
      },
    ],
  },

  christian: {
    religion: 'Christian Wedding',
    description: 'Traditional Christian wedding celebration',
    totalDays: 3,
    schedule: [
      {
        dayNumber: 1,
        dayName: 'Rehearsal Dinner',
        dayType: 'pre-wedding',
        events: [
          {
            time: '5:00 PM',
            duration: '1 hour',
            name: 'Ceremony Rehearsal',
            description: 'Practice ceremony proceedings at the church/venue',
            significance: 'Ensures everyone knows their roles and timing',
            tips: [
              'Have all participants arrive on time',
              'Walk through processional and recessional',
              'Practice readings and vows',
            ],
          },
          {
            time: '7:00 PM',
            duration: '3 hours',
            name: 'Rehearsal Dinner',
            description: 'Intimate dinner hosted by groom\'s family',
            significance: 'Thanks wedding party and celebrates upcoming union',
            tips: [
              'Keep it intimate - wedding party and close family',
              'Have a few short speeches',
              'Present gifts to wedding party',
            ],
          },
        ],
        whyEffective: 'Rehearsal dinner the night before ensures smooth ceremony execution while keeping the pre-wedding celebration manageable and intimate.',
      },
      {
        dayNumber: 2,
        dayName: 'Wedding Day',
        dayType: 'wedding',
        events: [
          {
            time: '9:00 AM',
            duration: '2 hours',
            name: 'Getting Ready',
            description: 'Hair, makeup, and dressing with wedding party',
            tips: [
              'Eat a good breakfast',
              'Have champagne and snacks ready',
              'Allow time for photos while getting ready',
            ],
          },
          {
            time: '11:00 AM',
            duration: '1 hour',
            name: 'First Look & Couple Photos',
            description: 'Private moment for couple to see each other (optional)',
            significance: 'Allows emotional moment away from crowds',
          },
          {
            time: '2:00 PM',
            duration: '1 hour',
            name: 'Church Ceremony',
            description: 'Traditional Christian ceremony with vows, rings, and pronouncement',
            significance: 'Sacred covenant before God',
            tips: [
              'Arrive 30 minutes early',
              'Have a wedding coordinator',
              'Ensure officiant has marriage license',
            ],
          },
          {
            time: '3:00 PM',
            duration: '1 hour',
            name: 'Cocktail Hour',
            description: 'Drinks and appetizers while couple takes photos',
          },
          {
            time: '4:00 PM',
            duration: '1 hour',
            name: 'Reception Entrance & First Dances',
            description: 'Grand entrance, first dance, parent dances',
          },
          {
            time: '5:00 PM',
            duration: '1.5 hours',
            name: 'Dinner',
            description: 'Served dinner with toasts and speeches',
          },
          {
            time: '6:30 PM',
            duration: '30 minutes',
            name: 'Cake Cutting',
            description: 'Traditional cake cutting and serving',
          },
          {
            time: '7:00 PM',
            duration: '3 hours',
            name: 'Dancing & Celebration',
            description: 'Open dance floor with DJ or band',
            tips: [
              'Include bouquet and garter toss',
              'Take breaks to visit with guests',
              'Save energy for last dance',
            ],
          },
          {
            time: '10:00 PM',
            duration: '15 minutes',
            name: 'Grand Exit',
            description: 'Sparkler send-off or bubble exit',
          },
        ],
        whyEffective: 'Afternoon ceremony provides perfect lighting for photos. Having cocktail hour during couple photos keeps guests entertained. Evening flow from dinner to dancing feels natural.',
      },
      {
        dayNumber: 3,
        dayName: 'Post-Wedding Brunch',
        dayType: 'post-wedding',
        events: [
          {
            time: '11:00 AM',
            duration: '2 hours',
            name: 'Farewell Brunch',
            description: 'Casual brunch with guests before they depart',
            significance: 'One last gathering to thank guests and say goodbye',
            tips: [
              'Keep it casual and relaxed',
              'Display wedding photos from previous day',
              'Provide hangover-friendly food options',
            ],
          },
        ],
        whyEffective: 'Morning brunch gives out-of-town guests one more celebration before traveling home. Relaxed atmosphere allows meaningful conversations that weren\'t possible during busy wedding day.',
      },
    ],
  },

  jewish: {
    religion: 'Jewish Wedding',
    description: 'Traditional Jewish wedding with sacred customs',
    totalDays: 3,
    schedule: [
      {
        dayNumber: 1,
        dayName: 'Aufruf & Pre-Wedding',
        dayType: 'pre-wedding',
        events: [
          {
            time: '9:00 AM',
            duration: '1 hour',
            name: 'Aufruf',
            description: 'Groom called to Torah at Shabbat service (if Saturday wedding)',
            significance: 'Blessing groom before wedding',
          },
          {
            time: '7:00 PM',
            duration: '2 hours',
            name: 'Pre-Wedding Celebration',
            description: 'Casual gathering of families',
          },
        ],
        whyEffective: 'Aufruf honors tradition while pre-wedding celebration brings families together in relaxed setting.',
      },
      {
        dayNumber: 2,
        dayName: 'Wedding Day',
        dayType: 'wedding',
        events: [
          {
            time: '4:00 PM',
            duration: '30 minutes',
            name: 'Ketubah Signing',
            description: 'Jewish marriage contract signed by witnesses',
            significance: 'Legal and spiritual foundation of marriage',
            tips: [
              'Have ketubah displayed beautifully',
              'Ensure two witnesses present',
              'Take photos of signing',
            ],
          },
          {
            time: '4:30 PM',
            duration: '30 minutes',
            name: 'Bedeken',
            description: 'Groom veils bride',
            significance: 'Ensures groom marries correct bride (biblical reference)',
          },
          {
            time: '5:00 PM',
            duration: '45 minutes',
            name: 'Chuppah Ceremony',
            description: 'Wedding ceremony under chuppah with seven blessings',
            significance: 'Most sacred part of Jewish wedding',
            tips: [
              'Choose meaningful chuppah design',
              'Select readers for seven blessings',
              'Have glass ready for breaking',
            ],
          },
          {
            time: '5:45 PM',
            duration: '15 minutes',
            name: 'Yichud',
            description: 'Couple spends private time together',
            significance: 'First moments as married couple',
          },
          {
            time: '6:00 PM',
            duration: '1 hour',
            name: 'Cocktail Hour',
            description: 'Guests enjoy drinks and hors d\'oeuvres',
          },
          {
            time: '7:00 PM',
            duration: '30 minutes',
            name: 'Grand Entrance & Hora',
            description: 'Traditional hora dance with chair lifting',
            significance: 'Joyful celebration of new marriage',
          },
          {
            time: '7:30 PM',
            duration: '1.5 hours',
            name: 'Dinner',
            description: 'Served dinner with toasts',
          },
          {
            time: '9:00 PM',
            duration: '2.5 hours',
            name: 'Dancing & Celebration',
            description: 'Traditional and modern dancing',
            tips: [
              'Mix traditional Jewish music with modern',
              'Encourage participation in group dances',
            ],
          },
          {
            time: '11:30 PM',
            duration: '30 minutes',
            name: 'Dessert & Send-Off',
            description: 'Late-night sweets and farewell',
          },
        ],
        whyEffective: 'Late afternoon ceremony provides beautiful lighting. Yichud gives couple essential private moment. Hora immediately after entrance sets joyful, energetic tone for celebration.',
      },
      {
        dayNumber: 3,
        dayName: 'Sheva Brachot',
        dayType: 'post-wedding',
        events: [
          {
            time: '6:00 PM',
            duration: '3 hours',
            name: 'Sheva Brachot Dinner',
            description: 'Post-wedding meal with seven blessings repeated',
            significance: 'Continues celebration for seven days after wedding',
            tips: [
              'Can host multiple sheva brachot with different groups',
              'Keep it intimate with close friends/family',
            ],
          },
        ],
        whyEffective: 'Sheva brachot extends joy of wedding week while honoring important tradition. Provides opportunity for meaningful connections that may have been missed during busy wedding.',
      },
    ],
  },

  muslim: {
    religion: 'Muslim Wedding',
    description: 'Traditional Islamic wedding ceremonies',
    totalDays: 3,
    schedule: [
      {
        dayNumber: 1,
        dayName: 'Mehndi Night',
        dayType: 'pre-wedding',
        events: [
          {
            time: '6:00 PM',
            duration: '4 hours',
            name: 'Mehndi Ceremony',
            description: 'Henna application with music and celebration',
            significance: 'Blessing bride with beauty and good fortune',
            tips: [
              'Book professional henna artists',
              'Arrange comfortable seating',
              'Play traditional music',
            ],
          },
        ],
        whyEffective: 'Mehndi night allows female family members and friends to bond. Dark henna has time to develop before wedding day.',
      },
      {
        dayNumber: 2,
        dayName: 'Nikah Day',
        dayType: 'wedding',
        events: [
          {
            time: '10:00 AM',
            duration: '1 hour',
            name: 'Nikah Ceremony',
            description: 'Islamic marriage contract signing with imam',
            significance: 'Religious and legal marriage contract',
            tips: [
              'Have witnesses present',
              'Agree on mahr (dowry) beforehand',
              'Ensure imam knows ceremony preferences',
            ],
          },
          {
            time: '12:00 PM',
            duration: '2 hours',
            name: 'Lunch Reception',
            description: 'Celebration meal with family and friends',
          },
          {
            time: '3:00 PM',
            duration: '2 hours',
            name: 'Rest & Preparation',
            description: 'Break before evening celebration',
          },
          {
            time: '6:00 PM',
            duration: '4 hours',
            name: 'Walima Reception',
            description: 'Formal wedding reception hosted by groom\'s family',
            significance: 'Announcement of marriage to community',
            tips: [
              'Arrange gender-separated seating if traditional',
              'Provide halal catering',
              'Include nasheed or appropriate music',
            ],
          },
        ],
        whyEffective: 'Morning nikah follows sunnah. Break between ceremonies prevents exhaustion. Evening walima allows grand celebration without compromising religious observance.',
      },
      {
        dayNumber: 3,
        dayName: 'Valima Continuation',
        dayType: 'post-wedding',
        events: [
          {
            time: '7:00 PM',
            duration: '3 hours',
            name: 'Extended Walima',
            description: 'Additional reception for those who couldn\'t attend',
            significance: 'Ensuring all community members can celebrate',
          },
        ],
        whyEffective: 'Extended walima honors Islamic principle of community celebration while accommodating large guest lists across multiple days.',
      },
    ],
  },
};

export const interfaithSchedules = {
  'hindu-christian': {
    religions: 'Hindu & Christian',
    description: 'Blended ceremony honoring both traditions',
    totalDays: 4,
    schedule: [
      {
        dayNumber: 1,
        dayName: 'Mehendi & Rehearsal',
        dayType: 'pre-wedding',
        events: [
          {
            time: '2:00 PM',
            duration: '3 hours',
            name: 'Mehendi Ceremony',
            description: 'Traditional henna application',
          },
          {
            time: '6:00 PM',
            duration: '2 hours',
            name: 'Rehearsal Dinner',
            description: 'Christian tradition rehearsal with both families',
          },
        ],
        whyEffective: 'Combines Hindu mehendi with Christian rehearsal dinner, giving both families meaningful pre-wedding traditions to participate in.',
      },
      {
        dayNumber: 2,
        dayName: 'Sangeet & Welcome Party',
        dayType: 'pre-wedding',
        events: [
          {
            time: '7:00 PM',
            duration: '4 hours',
            name: 'Sangeet Night',
            description: 'Musical celebration with performances from both cultures',
            tips: [
              'Mix Bollywood and Western songs',
              'Have joint family performances',
              'Educate guests about both traditions',
            ],
          },
        ],
        whyEffective: 'Sangeet provides perfect platform for cultural exchange through music and dance, breaking down barriers between families.',
      },
      {
        dayNumber: 3,
        dayName: 'Wedding Day - Dual Ceremonies',
        dayType: 'wedding',
        events: [
          {
            time: '9:00 AM',
            duration: '2.5 hours',
            name: 'Hindu Ceremony',
            description: 'Traditional Hindu wedding with key rituals',
            significance: 'Honors Hindu traditions including saptapadi',
            tips: [
              'Brief Christian family on Hindu customs',
              'Provide ceremony program with explanations',
              'Consider shortened version of full ceremony',
            ],
          },
          {
            time: '12:00 PM',
            duration: '1.5 hours',
            name: 'Lunch Break',
            description: 'Light lunch and change of outfits',
          },
          {
            time: '2:00 PM',
            duration: '1 hour',
            name: 'Christian Ceremony',
            description: 'Church ceremony with vows and rings',
            significance: 'Honors Christian traditions',
            tips: [
              'Have Hindu elements explained to Christian guests',
              'Consider interfaith officiant',
              'Include readings from both traditions',
            ],
          },
          {
            time: '4:00 PM',
            duration: '6 hours',
            name: 'Joint Reception',
            description: 'Celebration incorporating both cultures',
            tips: [
              'Mix cuisines from both cultures',
              'Play variety of music',
              'Include traditions from both (cake cutting AND ceremonial rituals)',
            ],
          },
        ],
        whyEffective: 'Separate morning and afternoon ceremonies give full honor to each tradition without rushing. Joint reception in evening celebrates unified future.',
      },
      {
        dayNumber: 4,
        dayName: 'Farewell Brunch',
        dayType: 'post-wedding',
        events: [
          {
            time: '11:00 AM',
            duration: '2 hours',
            name: 'Post-Wedding Brunch',
            description: 'Relaxed gathering with both families',
          },
        ],
        whyEffective: 'Casual brunch allows families to bond after experiencing both traditions, fostering understanding and unity.',
      },
    ],
    whyEffective: 'This schedule respects both traditions equally, educates families about each culture, and creates opportunities for meaningful cross-cultural bonding. Two separate ceremonies prevent compromising either tradition while joint celebrations emphasize unity.',
  },

  'hindu-jewish': {
    religions: 'Hindu & Jewish',
    description: 'Beautiful blend of ancient traditions',
    totalDays: 4,
    schedule: [
      {
        dayNumber: 1,
        dayName: 'Mehendi & Ketubah',
        dayType: 'pre-wedding',
        events: [
          {
            time: '3:00 PM',
            duration: '2 hours',
            name: 'Mehendi Ceremony',
            description: 'Henna application for bride and family',
          },
          {
            time: '6:00 PM',
            duration: '1 hour',
            name: 'Ketubah Signing',
            description: 'Jewish marriage contract signing ceremony',
            tips: [
              'Display both Hindu and Jewish symbolism',
              'Have rabbi and pandit present',
              'Create interfaith ketubah with Hindu elements',
            ],
          },
        ],
        whyEffective: 'Combining mehendi and ketubah signing shows respect for both ancient traditions of preparation and commitment.',
      },
      {
        dayNumber: 2,
        dayName: 'Sangeet & Celebration',
        dayType: 'pre-wedding',
        events: [
          {
            time: '7:00 PM',
            duration: '4 hours',
            name: 'Sangeet with Hora',
            description: 'Musical evening incorporating both traditions',
            tips: [
              'Include hora dance and Bollywood performances',
              'Mix klezmer and Indian music',
              'Celebrate both cultures through dance',
            ],
          },
        ],
        whyEffective: 'Music and dance transcend cultural barriers, allowing families to celebrate together through joy.',
      },
      {
        dayNumber: 3,
        dayName: 'Wedding Day - Combined Ceremony',
        dayType: 'wedding',
        events: [
          {
            time: '10:00 AM',
            duration: '3 hours',
            name: 'Interfaith Ceremony',
            description: 'Ceremony combining Hindu mandap and Jewish chuppah',
            significance: 'Unified ceremony under decorated mandap-chuppah',
            tips: [
              'Create hybrid mandap-chuppah structure',
              'Have both rabbi and pandit officiate',
              'Include saptapadi (7 steps) and sheva brachot (7 blessings)',
              'Break glass AND circle sacred fire',
              'Provide detailed program explaining each ritual',
            ],
          },
          {
            time: '1:00 PM',
            duration: '1 hour',
            name: 'Yichud & Private Time',
            description: 'Private moments for newlyweds',
          },
          {
            time: '2:00 PM',
            duration: '6 hours',
            name: 'Reception with Both Traditions',
            description: 'Celebration incorporating Hindu and Jewish customs',
            tips: [
              'Serve fusion menu with kosher and Indian options',
              'Include hora AND traditional Indian dances',
              'Display elements from both cultures in decor',
            ],
          },
        ],
        whyEffective: 'Combined ceremony creates something beautiful and unique rather than feeling like two separate weddings. Guests experience seamless blend of ancient wisdom from both traditions.',
      },
      {
        dayNumber: 4,
        dayName: 'Sheva Brachot Brunch',
        dayType: 'post-wedding',
        events: [
          {
            time: '11:00 AM',
            duration: '3 hours',
            name: 'Post-Wedding Celebration',
            description: 'Sheva brachot-style gathering with both families',
          },
        ],
        whyEffective: 'Continuing celebration honors Jewish tradition while including Hindu family in extended festivities.',
      },
    ],
    whyEffective: 'This interfaith approach creates hybrid rituals that honor core elements of both traditions. The combined ceremony demonstrates that two ancient cultures can beautifully coexist, creating something meaningful for future generations.',
  },

  'christian-muslim': {
    religions: 'Christian & Muslim',
    description: 'Respectful blend of Abrahamic faiths',
    totalDays: 3,
    schedule: [
      {
        dayNumber: 1,
        dayName: 'Mehndi & Rehearsal',
        dayType: 'pre-wedding',
        events: [
          {
            time: '3:00 PM',
            duration: '3 hours',
            name: 'Mehndi Ceremony',
            description: 'Islamic tradition henna application',
          },
          {
            time: '7:00 PM',
            duration: '2 hours',
            name: 'Rehearsal Dinner',
            description: 'Christian tradition with both families',
            tips: [
              'Serve halal options',
              'Brief families on both traditions',
              'Foster understanding and respect',
            ],
          },
        ],
        whyEffective: 'Combines pre-wedding traditions from both faiths, establishing respect and understanding from the start.',
      },
      {
        dayNumber: 2,
        dayName: 'Dual Ceremonies',
        dayType: 'wedding',
        events: [
          {
            time: '10:00 AM',
            duration: '1 hour',
            name: 'Nikah Ceremony',
            description: 'Islamic marriage contract with imam',
            tips: [
              'Hold at mosque or neutral venue',
              'Provide explanation for Christian guests',
              'Ensure mahr is agreed upon',
            ],
          },
          {
            time: '12:00 PM',
            duration: '1.5 hours',
            name: 'Lunch Break',
            description: 'Time to rest and change',
          },
          {
            time: '2:00 PM',
            duration: '1 hour',
            name: 'Christian Ceremony',
            description: 'Church ceremony with pastor',
            tips: [
              'Find interfaith-friendly church',
              'Include readings from both scriptures',
              'Emphasize common values of faith and family',
            ],
          },
          {
            time: '4:00 PM',
            duration: '5 hours',
            name: 'Walima Reception',
            description: 'Evening celebration following Islamic tradition',
            tips: [
              'Serve halal food for all',
              'Consider gender-appropriate celebrations',
              'Include traditions from both (cake, dances, etc.)',
            ],
          },
        ],
        whyEffective: 'Two separate ceremonies ensure both faiths are fully honored. Starting with nikah respects Islamic timing while Christian ceremony provides familiar tradition for that family.',
      },
      {
        dayNumber: 3,
        dayName: 'Extended Celebration',
        dayType: 'post-wedding',
        events: [
          {
            time: '6:00 PM',
            duration: '3 hours',
            name: 'Extended Walima',
            description: 'Additional reception for extended community',
          },
        ],
        whyEffective: 'Extended walima honors Islamic tradition while giving opportunity for those who couldn\'t attend earlier ceremonies to celebrate.',
      },
    ],
    whyEffective: 'Separate ceremonies respect each faith\'s requirements and sanctity. Shared celebrations emphasize common Abrahamic values of family, commitment, and love. Focuses on religious harmony and mutual respect.',
  },

  'hindu-muslim': {
    religions: 'Hindu & Muslim',
    description: 'Harmonious blend of two rich ancient traditions',
    totalDays: 4,
    schedule: [
      {
        dayNumber: 1,
        dayName: 'Mehendi & Ganesh Puja',
        dayType: 'pre-wedding',
        events: [
          {
            time: '10:00 AM',
            duration: '1 hour',
            name: 'Ganesh Puja',
            description: 'Hindu ceremony invoking Lord Ganesh for blessings',
            significance: 'Removing obstacles and blessing the upcoming union',
            tips: [
              'Set up small mandap or altar',
              'Have priest conduct brief ceremony',
              'Welcome Muslim family to observe',
            ],
          },
          {
            time: '3:00 PM',
            duration: '4 hours',
            name: 'Mehendi Ceremony',
            description: 'Elaborate henna application ceremony',
            significance: 'Shared tradition in both Hindu and Muslim cultures',
            tips: [
              'Celebrate that both cultures cherish mehendi',
              'Mix traditional music from both backgrounds',
              'Create inclusive atmosphere for all guests',
            ],
          },
        ],
        whyEffective: 'Mehendi is a beautiful shared tradition between both cultures, creating immediate common ground. Starting with blessings from both traditions sets respectful tone.',
      },
      {
        dayNumber: 2,
        dayName: 'Sangeet & Pre-Wedding Feast',
        dayType: 'pre-wedding',
        events: [
          {
            time: '7:00 PM',
            duration: '4 hours',
            name: 'Sangeet with Qawwali',
            description: 'Musical evening blending Bollywood and Sufi traditions',
            significance: 'Music as universal language bringing families together',
            tips: [
              'Include qawwali performances alongside Bollywood',
              'Mix traditional and modern songs',
              'Encourage both families to perform together',
              'Create fusion dance performances',
            ],
          },
        ],
        whyEffective: 'Music transcends religious boundaries. Combining Bollywood energy with Sufi devotional music creates magical cultural exchange that educates and entertains.',
      },
      {
        dayNumber: 3,
        dayName: 'Wedding Day - Dual Ceremonies',
        dayType: 'wedding',
        events: [
          {
            time: '8:00 AM',
            duration: '1 hour',
            name: 'Haldi Ceremony',
            description: 'Traditional Hindu turmeric blessing',
            significance: 'Purification and beautification before wedding',
            tips: [
              'Keep it intimate with close family',
              'Brief Muslim family on significance',
              'Set up for easy cleanup',
            ],
          },
          {
            time: '10:00 AM',
            duration: '1.5 hours',
            name: 'Nikah Ceremony',
            description: 'Islamic marriage contract with imam',
            significance: 'Religious and legal union in Islamic tradition',
            tips: [
              'Hold at mosque or neutral elegant venue',
              'Ensure mahr is discussed and agreed',
              'Provide program explaining nikah for Hindu guests',
              'Have witnesses from both families',
            ],
          },
          {
            time: '12:00 PM',
            duration: '2 hours',
            name: 'Lunch Break & Outfit Change',
            description: 'Time to rest and change for Hindu ceremony',
          },
          {
            time: '2:00 PM',
            duration: '3 hours',
            name: 'Hindu Wedding Ceremony',
            description: 'Vedic ceremony under mandap with sacred rituals',
            significance: 'Sacred union with saptapadi and agni as witness',
            tips: [
              'Include key rituals: kanyadaan, saptapadi, sindoor',
              'Provide explanations for Muslim guests',
              'Consider shortened ceremony to respect all guests',
              'Have pandit explain each ritual in English/Urdu',
            ],
          },
          {
            time: '5:00 PM',
            duration: '5 hours',
            name: 'Grand Reception',
            description: 'Evening celebration honoring both traditions',
            significance: 'United celebration of new beginning',
            tips: [
              'Serve fusion menu - biryani, chaat, and traditional Indian dishes',
              'Ensure all food is halal',
              'Mix Bollywood, qawwali, and contemporary music',
              'Include traditions from both (cake cutting AND ceremonial rituals)',
              'Create photo displays celebrating both cultures',
            ],
          },
        ],
        whyEffective: 'Morning nikah respects Islamic timing. Afternoon Hindu ceremony allows for proper auspicious muhurat. Separation between ceremonies gives each tradition full dignity without rushing. Joint reception celebrates unified future.',
      },
      {
        dayNumber: 4,
        dayName: 'Walima & Blessings',
        dayType: 'post-wedding',
        events: [
          {
            time: '12:00 PM',
            duration: '3 hours',
            name: 'Walima Lunch',
            description: 'Islamic tradition reception hosted by groom\'s family',
            significance: 'Formal announcement of marriage to community',
            tips: [
              'Serve elaborate halal feast',
              'Welcome both Hindu and Muslim community',
              'Keep atmosphere joyful and inclusive',
            ],
          },
          {
            time: '7:00 PM',
            duration: '2 hours',
            name: 'Family Blessings Dinner',
            description: 'Intimate gathering with immediate family',
            significance: 'Elders from both families bless the newlyweds',
          },
        ],
        whyEffective: 'Walima honors Islamic tradition of community celebration. Final blessing dinner brings both families together in intimate setting, strengthening bonds for future.',
      },
    ],
    whyEffective: 'This schedule honors both Hindu and Muslim traditions equally, using shared love of celebration, music, and family. Mehendi as common ground, separate religious ceremonies for full respect, and fusion celebrations that create something beautiful and new. Demonstrates that ancient traditions can coexist harmoniously.',
  },
};

export const getCeremonySchedule = (religion: string): CeremonySchedule | null => {
  return ceremonySchedules[religion.toLowerCase()] || null;
};

export const getInterfaithSchedule = (religion1: string, religion2: string): any => {
  const key1 = `${religion1.toLowerCase()}-${religion2.toLowerCase()}`;
  const key2 = `${religion2.toLowerCase()}-${religion1.toLowerCase()}`;
  return (interfaithSchedules as any)[key1] || (interfaithSchedules as any)[key2] || null;
};

export const supportedReligions = Object.keys(ceremonySchedules);
export const supportedInterfaithCombinations = Object.keys(interfaithSchedules);
