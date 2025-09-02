// Seeded random number generator
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
  
  weightedChoice(items, weights) {
    const totalWeight = weights.reduce((sum, weight) => sum + weight, 0);
    let random = this.next() * totalWeight;
    
    for (let i = 0; i < items.length; i++) {
      random -= weights[i];
      if (random <= 0) {
        return items[i];
      }
    }
    
    return items[items.length - 1];
  }
}

// Loot Generation System
export function generateLoot(dungeon, params) {
  const { rooms, biome, difficulty } = dungeon;
  const seed = params.seed;
  const rng = new SeededRandom(seed + '_loot');
  
  const lootTables = [];
  
  // Generate main treasure table
  const mainTable = generateTreasureTable(rng, 'Main Treasure', difficulty, biome);
  lootTables.push(mainTable);
  
  // Generate room-specific loot
  rooms.forEach((room, index) => {
    if (rng.next() < 0.7) { // 70% chance for room loot
      const roomTable = generateRoomLoot(rng, room, difficulty, biome, index);
      if (roomTable.items.length > 0) {
        lootTables.push(roomTable);
      }
    }
  });
  
  // Generate special encounter loot
  const encounterTable = generateEncounterLoot(rng, difficulty, biome);
  lootTables.push(encounterTable);
  
  return lootTables;
}

function generateTreasureTable(rng, name, difficulty, biome) {
  const difficultyModifier = {
    'easy': 0.5,
    'medium': 1.0,
    'hard': 1.5,
    'deadly': 2.0
  };
  
  const modifier = difficultyModifier[difficulty] || 1.0;
  const itemCount = Math.floor(rng.nextInt(3, 8) * modifier);
  const items = [];
  
  for (let i = 0; i < itemCount; i++) {
    const item = generateLootItem(rng, biome, difficulty, 'treasure');
    items.push(item);
  }
  
  // Add currency
  const goldAmount = Math.floor(rng.nextInt(50, 500) * modifier);
  items.push({
    name: 'Gold Pieces',
    icon: '🪙',
    rarity: 'common',
    value: `${goldAmount} gp`,
    type: 'currency',
    description: 'Standard gold currency of the realm'
  });
  
  return {
    id: 'main_treasure',
    name,
    type: 'treasure',
    items
  };
}

function generateRoomLoot(rng, room, difficulty, biome, index) {
  const roomTypes = {
    'Treasury': { items: 4, bias: 'valuable' },
    'Armory': { items: 3, bias: 'weapons' },
    'Library': { items: 2, bias: 'scrolls' },
    'Kitchen': { items: 2, bias: 'consumables' },
    'Barracks': { items: 3, bias: 'equipment' },
    'Chapel': { items: 2, bias: 'holy' },
    'Laboratory': { items: 3, bias: 'magical' },
    'Throne Room': { items: 4, bias: 'royal' },
    'Chamber': { items: 2, bias: 'general' },
    'Hall': { items: 1, bias: 'general' }
  };
  
  const roomConfig = roomTypes[room.type] || roomTypes['Chamber'];
  const items = [];
  
  for (let i = 0; i < roomConfig.items; i++) {
    const item = generateLootItem(rng, biome, difficulty, roomConfig.bias);
    items.push(item);
  }
  
  return {
    id: `room_${index}`,
    name: `${room.type} Loot`,
    type: 'room',
    roomId: room.id,
    items
  };
}

function generateEncounterLoot(rng, difficulty, biome) {
  const items = [];
  const itemCount = rng.nextInt(2, 5);
  
  for (let i = 0; i < itemCount; i++) {
    const item = generateLootItem(rng, biome, difficulty, 'combat');
    items.push(item);
  }
  
  return {
    id: 'encounter_loot',
    name: 'Combat Rewards',
    type: 'encounter',
    items
  };
}

function generateLootItem(rng, biome, difficulty, bias = 'general') {
  const rarity = determineRarity(rng, difficulty);
  const itemType = determineItemType(rng, bias);
  
  const item = {
    icon: getItemIcon(itemType),
    rarity,
    type: itemType,
    value: calculateValue(rng, rarity, itemType),
    description: generateItemDescription(rng, itemType, rarity, biome)
  };
  
  item.name = generateItemName(rng, item, biome);
  
  return item;
}

function determineRarity(rng, difficulty) {
  const rarityWeights = {
    'easy': { common: 70, uncommon: 25, rare: 4, epic: 1, legendary: 0 },
    'medium': { common: 50, uncommon: 30, rare: 15, epic: 4, legendary: 1 },
    'hard': { common: 30, uncommon: 35, rare: 25, epic: 8, legendary: 2 },
    'deadly': { common: 20, uncommon: 30, rare: 30, epic: 15, legendary: 5 }
  };
  
  const weights = rarityWeights[difficulty] || rarityWeights['medium'];
  const rarities = Object.keys(weights);
  const weightValues = Object.values(weights);
  
  return rng.weightedChoice(rarities, weightValues);
}

function determineItemType(rng, bias) {
  const typesByBias = {
    'treasure': ['gem', 'jewelry', 'art', 'currency'],
    'valuable': ['gem', 'jewelry', 'art'],
    'weapons': ['weapon', 'armor', 'shield'],
    'scrolls': ['scroll', 'book', 'map'],
    'consumables': ['potion', 'food', 'component'],
    'equipment': ['tool', 'gear', 'weapon', 'armor'],
    'holy': ['relic', 'symbol', 'scroll'],
    'magical': ['wand', 'staff', 'orb', 'potion', 'scroll'],
    'royal': ['jewelry', 'art', 'weapon', 'crown'],
    'combat': ['weapon', 'armor', 'potion'],
    'general': ['weapon', 'armor', 'potion', 'gem', 'tool']
  };
  
  const types = typesByBias[bias] || typesByBias['general'];
  return rng.choice(types);
}

function getItemIcon(itemType) {
  const icons = {
    'weapon': ['⚔️', '🗡️', '🏹', '🔨', '🪓'],
    'armor': ['🛡️', '🥾', '👕', '👑', '🧤'],
    'shield': ['🛡️'],
    'potion': ['🧪', '🍶', '🥤'],
    'scroll': ['📜', '📋', '📃'],
    'book': ['📖', '📚', '📕'],
    'gem': ['💎', '💍', '🔮', '💠'],
    'jewelry': ['💍', '📿', '👑', '⌚'],
    'art': ['🎨', '🏺', '🪞', '🕯️'],
    'currency': ['🪙', '💰', '💵'],
    'tool': ['🔧', '⚒️', '🪚', '🔑'],
    'gear': ['🎒', '🪢', '🧭'],
    'wand': ['🪄', '✨'],
    'staff': ['🪄', '🦯'],
    'orb': ['🔮', '💎'],
    'relic': ['✨', '🏺', '📿'],
    'symbol': ['✝️', '☪️', '🕎', '☯️'],
    'map': ['🗺️', '📜'],
    'component': ['🌿', '🦴', '⭐', '🔥'],
    'food': ['🍖', '🍞', '🧀', '🍯'],
    'crown': ['👑', '💎']
  };
  
  const typeIcons = icons[itemType] || ['❓'];
  return rng.choice(typeIcons);
}

function calculateValue(rng, rarity, itemType) {
  const baseValues = {
    'common': rng.nextInt(1, 50),
    'uncommon': rng.nextInt(51, 250),
    'rare': rng.nextInt(251, 1000),
    'epic': rng.nextInt(1001, 5000),
    'legendary': rng.nextInt(5001, 25000)
  };
  
  const typeMultiplier = {
    'weapon': 1.5,
    'armor': 1.3,
    'jewelry': 2.0,
    'art': 1.8,
    'gem': 2.5,
    'potion': 0.8,
    'scroll': 1.2,
    'currency': 1.0
  };
  
  const base = baseValues[rarity] || baseValues['common'];
  const multiplier = typeMultiplier[itemType] || 1.0;
  const finalValue = Math.floor(base * multiplier);
  
  return `${finalValue} gp`;
}

function generateItemName(rng, item, biome) {
  const prefixes = {
    'common': ['Simple', 'Basic', 'Plain', 'Ordinary', 'Standard'],
    'uncommon': ['Fine', 'Quality', 'Masterwork', 'Superior', 'Elegant'],
    'rare': ['Exquisite', 'Enchanted', 'Mystical', 'Ancient', 'Noble'],
    'epic': ['Legendary', 'Mythical', 'Divine', 'Celestial', 'Draconic'],
    'legendary': ['Artifact', 'Godly', 'Eternal', 'Ultimate', 'Transcendent']
  };
  
  const itemNames = {
    'weapon': ['Sword', 'Blade', 'Dagger', 'Axe', 'Mace', 'Bow', 'Crossbow', 'Spear', 'Hammer'],
    'armor': ['Chainmail', 'Leather Armor', 'Plate Mail', 'Robes', 'Cloak', 'Boots', 'Gauntlets'],
    'shield': ['Shield', 'Buckler', 'Tower Shield'],
    'potion': ['Healing Potion', 'Mana Potion', 'Elixir', 'Philter', 'Draught'],
    'scroll': ['Spell Scroll', 'Map', 'Deed', 'Letter', 'Contract'],
    'book': ['Spellbook', 'Tome', 'Grimoire', 'Manual', 'Chronicle'],
    'gem': ['Ruby', 'Emerald', 'Sapphire', 'Diamond', 'Opal', 'Amethyst'],
    'jewelry': ['Ring', 'Necklace', 'Bracelet', 'Amulet', 'Circlet'],
    'art': ['Painting', 'Sculpture', 'Vase', 'Tapestry', 'Mirror'],
    'tool': ['Lockpicks', 'Rope', 'Grappling Hook', 'Crowbar', 'Hammer'],
    'wand': ['Wand', 'Rod'],
    'staff': ['Staff', 'Quarterstaff'],
    'orb': ['Crystal Orb', 'Scrying Orb'],
    'crown': ['Crown', 'Tiara', 'Diadem']
  };
  
  const biomeModifiers = {
    'dungeon': ['of the Deep', 'of Shadows', 'of Stone'],
    'cave': ['of the Depths', 'of Crystal', 'of Echoes'],
    'forest': ['of the Grove', 'of Nature', 'of the Wild'],
    'crypt': ['of the Dead', 'of Souls', 'of Eternity'],
    'temple': ['of Light', 'of Faith', 'of the Divine'],
    'tower': ['of Power', 'of Wisdom', 'of the Arcane']
  };
  
  const prefix = rng.choice(prefixes[item.rarity] || prefixes['common']);
  const baseName = rng.choice(itemNames[item.type] || ['Item']);
  
  let fullName = `${prefix} ${baseName}`;
  
  // Add biome modifier for rare+ items
  if (['rare', 'epic', 'legendary'].includes(item.rarity)) {
    const modifier = rng.choice(biomeModifiers[biome] || biomeModifiers['dungeon']);
    fullName += ` ${modifier}`;
  }
  
  return fullName;
}

function generateItemDescription(rng, itemType, rarity, biome) {
  const descriptions = {
    'weapon': [
      'A well-balanced weapon with a keen edge.',
      'This weapon bears the marks of many battles.',
      'Crafted with exceptional skill and attention to detail.',
      'The metal gleams with an otherworldly sheen.'
    ],
    'armor': [
      'Sturdy protection that has weathered many conflicts.',
      'This armor shows signs of masterful craftsmanship.',
      'Lightweight yet durable, perfect for adventurers.',
      'Enhanced with protective enchantments.'
    ],
    'potion': [
      'A bubbling liquid that glows faintly in the dark.',
      'The contents swirl mysteriously within the bottle.',
      'Smells of herbs and magical ingredients.',
      'Crafted by a skilled alchemist.'
    ],
    'gem': [
      'This precious stone catches light beautifully.',
      'A flawless gem of exceptional clarity.',
      'The facets seem to hold inner fire.',
      'Valued by collectors and jewelers alike.'
    ],
    'scroll': [
      'Ancient parchment covered in mystic symbols.',
      'The writing glows faintly with magical power.',
      'Contains knowledge from a bygone age.',
      'Carefully preserved despite its age.'
    ]
  };
  
  const typeDescriptions = descriptions[itemType] || descriptions['weapon'];
  return rng.choice(typeDescriptions);
}