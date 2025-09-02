// Seeded random number generator for deterministic generation
class SeededRandom {
  constructor(seed) {
    this.seed = this.hashString(seed);
  }
  
  hashString(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
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
  
  shuffle(array) {
    const shuffled = [...array];
    for (let i = shuffled.length - 1; i > 0; i--) {
      const j = this.nextInt(0, i);
      [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
    }
    return shuffled;
  }
}

export function generateDungeon(params) {
  const {
    seed,
    width,
    height,
    roomCount,
    corridorWidth,
    difficulty,
    biome
  } = params;
  
  const rng = new SeededRandom(seed);
  
  // Initialize grid (0 = wall, 1 = floor, 2 = door, 3 = room center)
  const grid = Array(height).fill().map(() => Array(width).fill(0));
  
  // Generate rooms
  const rooms = generateRooms(rng, width, height, roomCount);
  
  // Place rooms on grid
  rooms.forEach(room => {
    for (let y = room.y; y < room.y + room.height; y++) {
      for (let x = room.x; x < room.x + room.width; x++) {
        if (x >= 0 && x < width && y >= 0 && y < height) {
          grid[y][x] = 1; // Floor
        }
      }
    }
    
    // Mark room center
    const centerX = Math.floor(room.x + room.width / 2);
    const centerY = Math.floor(room.y + room.height / 2);
    if (centerX >= 0 && centerX < width && centerY >= 0 && centerY < height) {
      grid[centerY][centerX] = 3; // Room center
      room.centerX = centerX;
      room.centerY = centerY;
    }
  });
  
  // Generate corridors
  const corridors = generateCorridors(rng, rooms, grid, width, height, corridorWidth);
  
  // Place doors
  placeDoors(rng, grid, rooms, width, height);
  
  // Generate encounters based on difficulty
  const encounters = generateEncounters(rng, rooms, difficulty, biome);
  
  return {
    width,
    height,
    grid,
    rooms,
    corridors,
    encounters,
    biome,
    difficulty
  };
}

function generateRooms(rng, width, height, roomCount) {
  const rooms = [];
  const attempts = roomCount * 10; // Allow multiple attempts
  
  for (let i = 0; i < attempts && rooms.length < roomCount; i++) {
    const roomWidth = rng.nextInt(4, 8);
    const roomHeight = rng.nextInt(4, 8);
    const x = rng.nextInt(1, width - roomWidth - 1);
    const y = rng.nextInt(1, height - roomHeight - 1);
    
    const newRoom = {
      x,
      y,
      width: roomWidth,
      height: roomHeight,
      type: getRoomType(rng),
      id: rooms.length
    };
    
    // Check for overlap with existing rooms (with padding)
    const overlaps = rooms.some(room => 
      newRoom.x < room.x + room.width + 2 &&
      newRoom.x + newRoom.width + 2 > room.x &&
      newRoom.y < room.y + room.height + 2 &&
      newRoom.y + newRoom.height + 2 > room.y
    );
    
    if (!overlaps) {
      rooms.push(newRoom);
    }
  }
  
  return rooms;
}

function getRoomType(rng) {
  const types = [
    'Chamber', 'Hall', 'Treasury', 'Barracks', 'Library', 
    'Armory', 'Kitchen', 'Throne Room', 'Chapel', 'Laboratory'
  ];
  return rng.choice(types);
}

function generateCorridors(rng, rooms, grid, width, height, corridorWidth) {
  const corridors = [];
  
  // Connect each room to at least one other room
  for (let i = 0; i < rooms.length - 1; i++) {
    const room1 = rooms[i];
    const room2 = rooms[i + 1];
    
    const corridor = createCorridor(
      room1.centerX || Math.floor(room1.x + room1.width / 2),
      room1.centerY || Math.floor(room1.y + room1.height / 2),
      room2.centerX || Math.floor(room2.x + room2.width / 2),
      room2.centerY || Math.floor(room2.y + room2.height / 2),
      grid,
      width,
      height,
      corridorWidth
    );
    
    if (corridor) {
      corridors.push(corridor);
    }
  }
  
  // Add some extra connections for interesting layouts
  const extraConnections = Math.floor(rooms.length / 3);
  for (let i = 0; i < extraConnections; i++) {
    const room1 = rng.choice(rooms);
    const room2 = rng.choice(rooms);
    
    if (room1 !== room2) {
      createCorridor(
        room1.centerX || Math.floor(room1.x + room1.width / 2),
        room1.centerY || Math.floor(room1.y + room1.height / 2),
        room2.centerX || Math.floor(room2.x + room2.width / 2),
        room2.centerY || Math.floor(room2.y + room2.height / 2),
        grid,
        width,
        height,
        corridorWidth
      );
    }
  }
  
  return corridors;
}

function createCorridor(x1, y1, x2, y2, grid, width, height, corridorWidth) {
  const path = [];
  
  // L-shaped corridor (horizontal first, then vertical)
  const currentX = x1;
  const currentY = y1;
  
  // Horizontal segment
  const startX = Math.min(x1, x2);
  const endX = Math.max(x1, x2);
  
  for (let x = startX; x <= endX; x++) {
    for (let w = 0; w < corridorWidth; w++) {
      const corridorY = y1 + w - Math.floor(corridorWidth / 2);
      if (x >= 0 && x < width && corridorY >= 0 && corridorY < height) {
        if (grid[corridorY][x] === 0) { // Only carve if it's a wall
          grid[corridorY][x] = 1; // Floor
          path.push({ x, y: corridorY });
        }
      }
    }
  }
  
  // Vertical segment
  const startY = Math.min(y1, y2);
  const endY = Math.max(y1, y2);
  
  for (let y = startY; y <= endY; y++) {
    for (let w = 0; w < corridorWidth; w++) {
      const corridorX = x2 + w - Math.floor(corridorWidth / 2);
      if (corridorX >= 0 && corridorX < width && y >= 0 && y < height) {
        if (grid[y][corridorX] === 0) { // Only carve if it's a wall
          grid[y][corridorX] = 1; // Floor
          path.push({ x: corridorX, y });
        }
      }
    }
  }
  
  return {
    start: { x: x1, y: y1 },
    end: { x: x2, y: y2 },
    path,
    width: corridorWidth
  };
}

function placeDoors(rng, grid, rooms, width, height) {
  // Find potential door locations (floor tiles adjacent to walls)
  const doorCandidates = [];
  
  for (let y = 1; y < height - 1; y++) {
    for (let x = 1; x < width - 1; x++) {
      if (grid[y][x] === 1) { // Floor tile
        // Check if adjacent to a wall
        const adjacentToWall = 
          grid[y-1][x] === 0 || grid[y+1][x] === 0 ||
          grid[y][x-1] === 0 || grid[y][x+1] === 0;
          
        if (adjacentToWall) {
          // Check if it's at a room entrance
          const nearRoomEdge = rooms.some(room => {
            return (x === room.x - 1 || x === room.x + room.width) &&
                   y >= room.y && y < room.y + room.height ||
                   (y === room.y - 1 || y === room.y + room.height) &&
                   x >= room.x && x < room.x + room.width;
          });
          
          if (nearRoomEdge) {
            doorCandidates.push({ x, y });
          }
        }
      }
    }
  }
  
  // Place doors at some candidates
  const doorCount = Math.min(doorCandidates.length, rooms.length + rng.nextInt(1, 3));
  const selectedDoors = rng.shuffle(doorCandidates).slice(0, doorCount);
  
  selectedDoors.forEach(door => {
    grid[door.y][door.x] = 2; // Door
  });
}

function generateEncounters(rng, rooms, difficulty, biome) {
  const encounters = [];
  const difficultyMultiplier = {
    'easy': 0.5,
    'medium': 1.0,
    'hard': 1.5,
    'deadly': 2.0
  };
  
  const biomeCreatures = {
    'dungeon': ['Goblin', 'Skeleton', 'Orc', 'Troll', 'Dragon'],
    'cave': ['Bat', 'Bear', 'Kobold', 'Owlbear', 'Bulette'],
    'forest': ['Wolf', 'Dryad', 'Treant', 'Dire Wolf', 'Green Dragon'],
    'crypt': ['Zombie', 'Wraith', 'Lich', 'Mummy', 'Vampire'],
    'temple': ['Celestial', 'Demon', 'Angel', 'Paladin', 'Cleric'],
    'tower': ['Mage', 'Elemental', 'Gargoyle', 'Wizard', 'Archmage']
  };
  
  const creatures = biomeCreatures[biome] || biomeCreatures['dungeon'];
  const baseCR = difficultyMultiplier[difficulty];
  
  rooms.forEach((room, index) => {
    // 60% chance for an encounter per room
    if (rng.next() < 0.6) {
      const encounterCreatures = [];
      const creatureCount = rng.nextInt(1, 3);
      
      for (let i = 0; i < creatureCount; i++) {
        encounterCreatures.push({
          name: rng.choice(creatures),
          count: rng.nextInt(1, Math.max(1, Math.floor(baseCR * 2)))
        });
      }
      
      encounters.push({
        id: encounters.length,
        roomId: room.id,
        name: `${room.type} Encounter`,
        description: generateEncounterDescription(room.type, encounterCreatures, biome),
        challengeRating: Math.max(1, Math.round(baseCR * rng.next() * 3)),
        creatures: encounterCreatures
      });
    }
  });
  
  return encounters;
}

function generateEncounterDescription(roomType, creatures, biome) {
  const descriptions = {
    'Chamber': 'A dimly lit chamber where danger lurks in the shadows.',
    'Hall': 'The echoing hall stretches before you, inhabited by hostile forces.',
    'Treasury': 'Gold and gems glitter in this treasure room, but guardians protect the hoard.',
    'Barracks': 'Old bunks and weapons racks suggest this was once a military quarters.',
    'Library': 'Ancient tomes line the shelves of this forgotten library.',
    'Armory': 'Weapons and armor hang from the walls, some still serviceable.',
    'Kitchen': 'The smell of old food and decay fills this abandoned kitchen.',
    'Throne Room': 'A grand throne dominates this royal chamber.',
    'Chapel': 'Sacred symbols and altar suggest this was once a holy place.',
    'Laboratory': 'Bubbling potions and strange apparatus fill this research chamber.'
  };
  
  const baseDesc = descriptions[roomType] || descriptions['Chamber'];
  const creatureNames = creatures.map(c => c.name.toLowerCase()).join(', ');
  
  return `${baseDesc} ${creatures.length === 1 ? 'A' : 'Several'} ${creatureNames} ${creatures.length === 1 ? 'guards' : 'guard'} this area.`;
}

export default generateDungeon;