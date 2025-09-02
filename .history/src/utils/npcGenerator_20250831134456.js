// NPC Generation with AI-like characteristics
export function generateNPCs(dungeon, params) {
  if (!params.enableAI) return [];
  
  const { rooms, biome, difficulty } = dungeon;
  const seed = params.seed;
  const rng = new SeededRandom(seed + '_npcs');
  
  const npcs = [];
  const npcCount = Math.floor(rooms.length * 0.4); // About 40% of rooms have NPCs
  
  for (let i = 0; i < npcCount; i++) {
    const npc = generateSingleNPC(rng, biome, difficulty, i);
    npcs.push(npc);
  }
  
  return npcs;
}

class SeededRandom {
  constructor(seed) {
    this.seed = this.hashString(seed);
  }
  
  hashString(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash;
    }
    return Math.abs(hash);
  }
  
  next() {
    this.seed = (this.seed * 9301 + 49297) % 233280;
    return this.seed / 233280;
  }
  
  nextInt(min, max) {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }
  
  choice(array) {
    return array[this.nextInt(0, array.length - 1)];
  }
}

function generateSingleNPC(rng, biome, difficulty, index) {
  const races = getBiomeRaces(biome);
  const classes = getBiomeClasses(biome);
  const names = getNames(rng);
  
  const race = rng.choice(races);
  const npcClass = rng.choice(classes);
  const name = generateName(rng, race);
  
  // Base stats influenced by difficulty
  const difficultyModifier = {
    'easy': 0.7,
    'medium': 1.0,
    'hard': 1.3,
    'deadly': 1.6
  };
  
  const modifier = difficultyModifier[difficulty] || 1.0;
  const level = Math.max(1, Math.floor(rng.nextInt(1, 8) * modifier));
  
  const baseAC = 10 + Math.floor(level / 2);
  const baseHP = 8 + (level * rng.nextInt(4, 8));
  const cr = Math.max(0.125, level / 4);
  
  return {
    id: index,
    name,
    race,
    class: npcClass,
    level,
    ac: Math.floor(baseAC * modifier),
    hp: Math.floor(baseHP * modifier),
    cr: Math.round(cr * modifier * 4) / 4, // Round to nearest quarter
    description: generateNPCDescription(rng, name, race, npcClass, biome),
    avatar: getNPCAvatar(race, npcClass),
    personality: generatePersonality(rng),
    motivation: generateMotivation(rng, biome),
    secrets: generateSecrets(rng, biome)
  };
}

function getBiomeRaces(biome) {
  const racesByBiome = {
    'dungeon': ['Human', 'Dwarf', 'Halfling', 'Gnome', 'Elf'],
    'cave': ['Dwarf', 'Goblin', 'Kobold', 'Duergar', 'Svirfneblin'],
    'forest': ['Elf', 'Half-Elf', 'Gnome', 'Firbolg', 'Centaur'],
    'crypt': ['Human', 'Tiefling', 'Aasimar', 'Variant Human', 'Dhampir'],
    'temple': ['Human', 'Aasimar', 'Dragonborn', 'Tiefling', 'Deva'],
    'tower': ['Human', 'Elf', 'Gnome', 'Tiefling', 'Githyanki']
  };
  
  return racesByBiome[biome] || racesByBiome['dungeon'];
}

function getBiomeClasses(biome) {
  const classesByBiome = {
    'dungeon': ['Fighter', 'Rogue', 'Wizard', 'Cleric', 'Ranger'],
    'cave': ['Barbarian', 'Ranger', 'Druid', 'Fighter', 'Rogue'],
    'forest': ['Ranger', 'Druid', 'Bard', 'Sorcerer', 'Monk'],
    'crypt': ['Cleric', 'Paladin', 'Warlock', 'Necromancer', 'Death Knight'],
    'temple': ['Cleric', 'Paladin', 'Monk', 'Divine Soul', 'Celestial'],
    'tower': ['Wizard', 'Sorcerer', 'Warlock', 'Artificer', 'Arcane Trickster']
  };
  
  return classesByBiome[biome] || classesByBiome['dungeon'];
}

function generateName(rng, race) {
  const namesByRace = {
    'Human': {
      first: ['Alaric', 'Beatrice', 'Cedric', 'Diana', 'Edmund', 'Fiona', 'Gareth', 'Helena', 'Ivan', 'Juliana'],
      last: ['Blackwood', 'Goldsmith', 'Ironforge', 'Lightbringer', 'Shadowmere', 'Stormwind', 'Thornfield', 'Whitehall']
    },
    'Elf': {
      first: ['Aerdrie', 'Berrian', 'Caelynn', 'Dayereth', 'Enna', 'Galinndan', 'Hadarai', 'Immeral', 'Korfel', 'Lamlis'],
      last: ['Amakir', 'Amarthen', 'Amarillis', 'Helder', 'Hornraven', 'Helder', 'Meliamne', 'Nailo', 'Siannodel', 'Xiloscient']
    },
    'Dwarf': {
      first: ['Adrik', 'Baern', 'Darrak', 'Eberk', 'Fargrim', 'Gardain', 'Harbek', 'Kildrak', 'Morgran', 'Orsik'],
      last: ['Battlehammer', 'Brawnanvil', 'Dankil', 'Fireforge', 'Frostbeard', 'Gorunn', 'Holderhek', 'Ironfist', 'Loderr', 'Lutgehr']
    },
    'Halfling': {
      first: ['Alton', 'Beau', 'Cade', 'Eldon', 'Garret', 'Lyle', 'Milo', 'Osborn', 'Roscoe', 'Wellby'],
      last: ['Brushgather', 'Goodbarrel', 'Greenbottle', 'High-hill', 'Hilltopple', 'Leagallow', 'Tealeaf', 'Thorngage', 'Tosscobble', 'Underbough']
    },
    'Gnome': {
      first: ['Alston', 'Brocc', 'Burgell', 'Dimble', 'Eldon', 'Fonkin', 'Gimble', 'Glim', 'Jebeddo', 'Kellen'],
      last: ['Beren', 'Daergel', 'Folkor', 'Garrick', 'Nackle', 'Murnig', 'Ningel', 'Raulnor', 'Scheppen', 'Timbers']
    }
  };
  
  const names = namesByRace[race] || namesByRace['Human'];
  const firstName = rng.choice(names.first);
  const lastName = rng.choice(names.last);
  
  return `${firstName} ${lastName}`;
}

function generateNPCDescription(rng, name, race, npcClass, biome) {
  const appearances = [
    'weathered and battle-scarred',
    'young and eager',
    'mysterious and hooded',
    'well-dressed and refined',
    'grizzled and experienced',
    'nervous and twitchy',
    'calm and composed',
    'energetic and enthusiastic'
  ];
  
  const behaviors = [
    'speaks in riddles',
    'constantly sharpens weapons',
    'studies ancient tomes',
    'mutters prayers under their breath',
    'watches the shadows carefully',
    'hums old tavern songs',
    'counts coins obsessively',
    'tells tales of past adventures'
  ];
  
  const locations = {
    'dungeon': 'deep within these stone corridors',
    'cave': 'in the depths of this cavern system',
    'forest': 'among the ancient trees',
    'crypt': 'within these hallowed halls',
    'temple': 'before the sacred altar',
    'tower': 'high in this mystical spire'
  };
  
  const appearance = rng.choice(appearances);
  const behavior = rng.choice(behaviors);
  const location = locations[biome] || locations['dungeon'];
  
  return `${name} is a ${appearance} ${race} ${npcClass} found ${location}. They ${behavior} and seem to have important knowledge about this place.`;
}

function getNPCAvatar(race, npcClass) {
  const avatars = {
    'Human': { 'Fighter': '🛡️', 'Rogue': '🗡️', 'Wizard': '🔮', 'Cleric': '⚕️', 'default': '👤' },
    'Elf': { 'Ranger': '🏹', 'Wizard': '🔮', 'Rogue': '🗡️', 'default': '🧝' },
    'Dwarf': { 'Fighter': '⚒️', 'Cleric': '⚕️', 'Barbarian': '🪓', 'default': '👨‍🦲' },
    'Halfling': { 'Rogue': '🗡️', 'Bard': '🎵', 'default': '👶' },
    'Gnome': { 'Wizard': '🔮', 'Artificer': '⚙️', 'default': '👴' },
    'Goblin': { 'default': '👺' },
    'Kobold': { 'default': '🦎' },
    'Tiefling': { 'Warlock': '😈', 'default': '👹' }
  };
  
  return avatars[race]?.[npcClass] || avatars[race]?.default || '👤';
}

function generatePersonality(rng) {
  const traits = [
    'Brave and honorable',
    'Cunning and opportunistic',
    'Wise and contemplative',
    'Cheerful and optimistic',
    'Brooding and mysterious',
    'Ambitious and driven',
    'Loyal and dependable',
    'Eccentric and unpredictable',
    'Cautious and paranoid',
    'Generous and kind-hearted'
  ];
  
  return rng.choice(traits);
}

function generateMotivation(rng, biome) {
  const motivationsByBiome = {
    'dungeon': [
      'Seeks ancient treasure hidden within',
      'Guards family secrets buried here',
      'Hunts the monster that destroyed their village',
      'Researches the dungeon\'s dark history'
    ],
    'cave': [
      'Protects the natural balance of the caves',
      'Searches for rare minerals and gems',
      'Hides from surface world persecution',
      'Studies unique cave ecosystems'
    ],
    'forest': [
      'Protects the sacred grove from intruders',
      'Seeks harmony between nature and civilization',
      'Hunts poachers and defilers',
      'Guards ancient druidic secrets'
    ],
    'crypt': [
      'Seeks to put restless spirits to rest',
      'Protects sacred burial grounds',
      'Hunts undead abominations',
      'Researches necromantic mysteries'
    ],
    'temple': [
      'Serves their deity faithfully',
      'Protects holy relics and artifacts',
      'Seeks divine guidance and wisdom',
      'Battles unholy corruption'
    ],
    'tower': [
      'Pursues arcane knowledge and power',
      'Guards magical secrets and spells',
      'Conducts mystical experiments',
      'Seeks to unlock cosmic mysteries'
    ]
  };
  
  const motivations = motivationsByBiome[biome] || motivationsByBiome['dungeon'];
  return rng.choice(motivations);
}

function generateSecrets(rng, biome) {
  const secrets = [
    'Knows the location of a hidden passage',
    'Carries a map to ancient treasure',
    'Is actually royalty in disguise',
    'Made a pact with a powerful entity',
    'Possesses a cursed magical item',
    'Is the last of their bloodline',
    'Knows the dungeon\'s true purpose',
    'Has seen the future in visions',
    'Is secretly working for the enemy',
    'Guards the key to a great mystery'
  ];
  
  return rng.choice(secrets);
}

export default generateNPCs;