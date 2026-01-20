

export const POWER_TIERS = {
    OMNIPOTENT: {
        level: 10,
        name: 'Omnipotent',
        color: 'from-violet-500 to-purple-600',
        bgColor: 'bg-violet-500/20',
        textColor: 'text-violet-400',
        description: 'Reality-warping, omniscient beings',
        examples: ['Zeno (DBS)', 'Truth (FMA)', 'Haruhi Suzumiya']
    },
    MULTIVERSAL: {
        level: 9,
        name: 'Multiversal',
        color: 'from-pink-500 to-rose-600',
        bgColor: 'bg-pink-500/20',
        textColor: 'text-pink-400',
        description: 'Can affect multiple universes',
        examples: ['Goku UI', 'Anos Voldigoad', 'Rimuru Tempest']
    },
    UNIVERSAL: {
        level: 8,
        name: 'Universal',
        color: 'from-red-500 to-orange-600',
        bgColor: 'bg-red-500/20',
        textColor: 'text-red-400',
        description: 'Universe-level destruction capability',
        examples: ['Beerus', 'Saitama', 'Giorno GER']
    },
    GALAXY: {
        level: 7,
        name: 'Galaxy',
        color: 'from-orange-500 to-amber-600',
        bgColor: 'bg-orange-500/20',
        textColor: 'text-orange-400',
        description: 'Galaxy-level power',
        examples: ['Frieza', 'Broly', 'Cell']
    },
    PLANETARY: {
        level: 6,
        name: 'Planetary',
        color: 'from-yellow-500 to-lime-600',
        bgColor: 'bg-yellow-500/20',
        textColor: 'text-yellow-400',
        description: 'Planet-busting capabilities',
        examples: ['Madara Uchiha', 'Meruem', 'All Might Prime']
    },
    CONTINENTAL: {
        level: 5,
        name: 'Continental',
        color: 'from-green-500 to-emerald-600',
        bgColor: 'bg-green-500/20',
        textColor: 'text-green-400',
        description: 'Continent-level destruction',
        examples: ['Escanor', 'Netero', 'Whitebeard']
    },
    COUNTRY: {
        level: 4,
        name: 'Country',
        color: 'from-teal-500 to-cyan-600',
        bgColor: 'bg-teal-500/20',
        textColor: 'text-teal-400',
        description: 'Country-level power',
        examples: ['Naruto', 'Gojo Satoru', 'Ichigo']
    },
    CITY: {
        level: 3,
        name: 'City',
        color: 'from-blue-500 to-indigo-600',
        bgColor: 'bg-blue-500/20',
        textColor: 'text-blue-400',
        description: 'City-level destruction',
        examples: ['Bakugo', 'Killua', 'Levi Ackerman']
    },
    BUILDING: {
        level: 2,
        name: 'Building',
        color: 'from-slate-500 to-gray-600',
        bgColor: 'bg-slate-500/20',
        textColor: 'text-slate-400',
        description: 'Building-level strength',
        examples: ['Spike Spiegel', 'Revy', 'Guts (early)']
    },
    HUMAN: {
        level: 1,
        name: 'Human',
        color: 'from-gray-500 to-zinc-600',
        bgColor: 'bg-gray-500/20',
        textColor: 'text-gray-400',
        description: 'Peak human or slightly above',
        examples: ['Light Yagami', 'Lelouch', 'Conan Edogawa']
    }
};

export const ABILITIES = {
    PHYSICAL: ['Super Strength', 'Super Speed', 'Durability', 'Regeneration', 'Flight'],
    ENERGY: ['Ki/Chakra Control', 'Energy Blasts', 'Aura Manipulation', 'Barrier Creation'],
    PSYCHIC: ['Telekinesis', 'Telepathy', 'Mind Control', 'Future Sight', 'Reality Warp'],
    ELEMENTAL: ['Fire', 'Water', 'Lightning', 'Earth', 'Wind', 'Ice', 'Light', 'Dark'],
    SPECIAL: ['Time Manipulation', 'Space Manipulation', 'Dimension Travel', 'Immortality', 'Resurrection']
};

export const getEstimatedTier = (favorites) => {
    if (!favorites) return POWER_TIERS.HUMAN;
    if (favorites >= 100000) return POWER_TIERS.OMNIPOTENT;
    if (favorites >= 80000) return POWER_TIERS.MULTIVERSAL;
    if (favorites >= 60000) return POWER_TIERS.UNIVERSAL;
    if (favorites >= 40000) return POWER_TIERS.GALAXY;
    if (favorites >= 25000) return POWER_TIERS.PLANETARY;
    if (favorites >= 15000) return POWER_TIERS.CONTINENTAL;
    if (favorites >= 8000) return POWER_TIERS.COUNTRY;
    if (favorites >= 3000) return POWER_TIERS.CITY;
    if (favorites >= 1000) return POWER_TIERS.BUILDING;
    return POWER_TIERS.HUMAN;
};

export const CHARACTER_ARCHETYPES = [
    { id: 'protagonist', name: 'Protagonist', icon: '⭐', description: 'Main character of the series' },
    { id: 'antagonist', name: 'Antagonist', icon: '👿', description: 'Primary villain or opponent' },
    { id: 'mentor', name: 'Mentor', icon: '🧙', description: 'Wise guide or teacher' },
    { id: 'rival', name: 'Rival', icon: '⚔️', description: 'Competitive counterpart' },
    { id: 'support', name: 'Support', icon: '🛡️', description: 'Ally and helper' },
    { id: 'antihero', name: 'Anti-Hero', icon: '🔥', description: 'Morally ambiguous hero' }
];

export const CHARACTER_TIERS = {
    'Goku': 'MULTIVERSAL',
    'Vegeta': 'MULTIVERSAL',
    'Saitama': 'UNIVERSAL',
    'Naruto Uzumaki': 'COUNTRY',
    'Sasuke Uchiha': 'COUNTRY',
    'Luffy': 'COUNTRY',
    'Gojo Satoru': 'COUNTRY',
    'Ichigo Kurosaki': 'PLANETARY',
    'Madara Uchiha': 'PLANETARY',
    'Levi': 'CITY',
    'Eren Yeager': 'CONTINENTAL',
    'Light Yagami': 'HUMAN',
    'Lelouch Lamperouge': 'HUMAN',
    'Spike Spiegel': 'BUILDING',
    'Edward Elric': 'CITY',
    'Roy Mustang': 'CITY',
    'All Might': 'CONTINENTAL',
    'Deku': 'CITY',
    'Bakugo': 'CITY',
    'Gon Freecss': 'CITY',
    'Killua Zoldyck': 'CITY',
    'Meruem': 'COUNTRY',
    'Netero': 'COUNTRY'
};

export const getCharacterTier = (characterName, favorites) => {
    
    for (const [name, tier] of Object.entries(CHARACTER_TIERS)) {
        if (characterName?.toLowerCase().includes(name.toLowerCase())) {
            return POWER_TIERS[tier];
        }
    }
    
    return getEstimatedTier(favorites);
};

export const comparePower = (char1, char2) => {
    const tier1 = getCharacterTier(char1.name, char1.favorites);
    const tier2 = getCharacterTier(char2.name, char2.favorites);

    if (tier1.level > tier2.level) return 1;
    if (tier1.level < tier2.level) return -1;

    return (char1.favorites || 0) - (char2.favorites || 0);
};

export default {
    POWER_TIERS,
    ABILITIES,
    CHARACTER_ARCHETYPES,
    getEstimatedTier,
    getCharacterTier,
    comparePower
};
