// Winerunner Web Edition - Advanced Roguelike with Body System
// Game constants
const TILE_SIZE = 16;
const MAP_WIDTH = 100;
const MAP_HEIGHT = 60;
const VIEW_WIDTH = 80;
const VIEW_HEIGHT = 40;

// Terrain types
const TERRAIN = {
    WALL: { char: '▒', color: '#888', bgColor: '#444', solid: true, name: 'wall' },
    FLOOR: { char: '.', color: '#666', bgColor: '#000', solid: false, name: 'floor' },
    GRASS: { char: ',', color: '#0a5', bgColor: '#000', solid: false, name: 'grass' },
    STONE_FLOOR: { char: '+', color: '#888', bgColor: '#000', solid: false, name: 'stone floor' },
    WATER: { char: '~', color: '#04f', bgColor: '#002', solid: false, name: 'water' },
    DOOR: { char: '+', color: '#daa', bgColor: '#000', solid: false, door: true, name: 'door' },
    TREE: { char: '♣', color: '#0a0', bgColor: '#000', solid: true, name: 'tree' },
    ROCK: { char: '○', color: '#666', bgColor: '#000', solid: true, name: 'rock' },
};

// Colors
const COLORS = {
    BLACK: '#000000',
    WHITE: '#ffffff',
    RED: '#ff0000',
    GREEN: '#00ff00',
    BLUE: '#0000ff',
    YELLOW: '#ffff00',
    MAGENTA: '#ff00ff',
    CYAN: '#00ffff',
    GRAY: '#888888',
    ORANGE: '#ff8800',
};

// Item types
const ITEMS = {
    SWORD: { id: 'sword', name: 'iron sword', char: '/', color: '#ccc', damage: 10, type: 'weapon' },
    DAGGER: { id: 'dagger', name: 'dagger', char: '|', color: '#aaa', damage: 5, type: 'weapon' },
    GOLD: { id: 'gold', name: 'gold coin', char: '$', color: '#ff0', amount: 1, stackable: true },
    FOOD: { id: 'food', name: 'food', char: '%', color: '#8f0', heals: 10 },
    BACKPACK: { id: 'backpack', name: 'backpack', char: '[', color: '#a62', container: true, volume: 50 },
    AXE: { id: 'axe', name: 'battle axe', char: ')', color: '#a00', damage: 15, type: 'weapon' },
};

// Entity AI states
const AI_STATE = {
    IDLE: 'idle',
    WANDER: 'wander',
    HOSTILE: 'hostile',
    FLEE: 'flee',
    DEAD: 'dead',
};

class Entity {
    constructor(id, name, x, y, symbol, color, stats = {}) {
        this.id = id;
        this.name = name;
        this.x = x;
        this.y = y;
        this.symbol = symbol;
        this.color = color;
        this.strength = stats.strength || 10;
        this.dexterity = stats.dexterity || 10;
        this.weapon = stats.weapon || null;
        this.ai = stats.ai || null;
        this.aiState = stats.aiState || AI_STATE.IDLE;
        this.hostile = stats.hostile || false;
        this.inventory = [];
        this.lastMoveTime = 0;
        
        // Body system
        this.body = new Body(this);
        this.alive = this.body.isAlive();
        
        // Calculate HP from body capacities (for display)
        this.updateHpFromBody();
    }
    
    // Update HP display from body capacities
    updateHpFromBody() {
        if (!this.body) return;
        const consciousness = this.body.getCapacity(BODY_FLAG.CONSCIOUSNESS);
        const bloodPumping = this.body.getCapacity(BODY_FLAG.BLOOD_PUMPING);
        const avgCapacity = (consciousness + bloodPumping) / 2;
        this.maxHp = 100;
        this.hp = Math.floor(avgCapacity * 100);
    }
    
    getDamage() {
        let base = Math.floor(this.strength / 2);
        if (this.weapon) {
            base += this.weapon.damage || 0;
        }
        return base;
    }
    
    // Get damage type from weapon
    getDamageType() {
        if (!this.weapon) return DAMAGE_TYPE.BRUISE;
        if (this.weapon.id === 'sword' || this.weapon.id === 'axe') return DAMAGE_TYPE.CUT;
        if (this.weapon.id === 'dagger') return DAMAGE_TYPE.PUNCTURE;
        return DAMAGE_TYPE.BRUISE;
    }
    
    // Take damage to a specific body part
    takeDamageToPart(partName, amount, damageType = DAMAGE_TYPE.BRUISE) {
        if (!this.body) return false;
        const damage = this.body.applyDamage(partName, amount, damageType);
        this.updateHpFromBody();
        this.alive = this.body.isAlive();
        if (!this.alive) {
            this.aiState = AI_STATE.DEAD;
        }
        return !this.alive;
    }
    
    // Legacy method for compatibility
    takeDamage(amount) {
        // Apply to torso as default
        return this.takeDamageToPart('torso', amount, DAMAGE_TYPE.BRUISE);
    }
    
    heal(amount) {
        // Heal torso
        const part = this.body.getPart('torso');
        if (part) {
            part.totalDamage = Math.max(0, part.totalDamage - amount);
            part.damage.bruise = Math.max(0, part.damage.bruise - amount);
            this.body.clearCapacityCache();
            this.updateHpFromBody();
        }
    }
    
    // Get body status
    getBodyStatus() {
        if (!this.body) return null;
        return this.body.getStatusSummary();
    }
}

class Item {
    constructor(data, x = null, y = null) {
        this.id = data.id;
        this.name = data.name;
        this.char = data.char;
        this.color = data.color;
        this.x = x;
        this.y = y;
        this.damage = data.damage || 0;
        this.type = data.type || 'item';
        this.amount = data.amount || 1;
        this.stackable = data.stackable || false;
        this.heals = data.heals || 0;
        this.container = data.container || false;
        this.volume = data.volume || 0;
        this.contents = data.container ? [] : null;
    }
}

class Game {
    constructor() {
        this.canvas = document.getElementById('game-canvas');
        this.ctx = this.canvas.getContext('2d');
        this.setupCanvas();
        
        // Game state
        this.player = new Entity('player', 'Player', 1, 1, '@', COLORS.MAGENTA, {
            strength: 12,
            dexterity: 12,
        });
        this.entities = [];
        this.items = new Map(); // Map of "x,y" -> [items]
        this.map = [];
        this.visible = [];
        this.turns = 0;
        this.messages = [];
        this.uiMode = null; // 'look', 'inventory', 'combat', 'body_part_select', etc.
        this.lookX = null;
        this.lookY = null;
        this.selectedEntity = null;
        this.selectedBodyPart = null;
        this.bodyPartList = [];
        this.bodyPartIndex = 0;
        
        // Initialize game
        this.generateMap();
        this.spawnEntities();
        this.spawnItems();
        this.updateVisible();
        this.updateStatus();
        this.render();
        
        // Setup input
        this.setupInput();
        
        // Focus canvas
        this.canvas.focus();
    }
    
    setupCanvas() {
        this.canvas.width = VIEW_WIDTH * TILE_SIZE;
        this.canvas.height = VIEW_HEIGHT * TILE_SIZE;
        this.ctx.font = `${TILE_SIZE}px 'IBM BIOS'`;
        this.ctx.textAlign = 'center';
        this.ctx.textBaseline = 'middle';
    }
    
    generateMap() {
        this.map = [];
        // Initialize with grass
        for (let y = 0; y < MAP_HEIGHT; y++) {
            this.map[y] = [];
            for (let x = 0; x < MAP_WIDTH; x++) {
                if (x === 0 || x === MAP_WIDTH - 1 || y === 0 || y === MAP_HEIGHT - 1) {
                    this.map[y][x] = TERRAIN.WALL;
                } else {
                    this.map[y][x] = TERRAIN.GRASS;
                }
            }
        }
        
        // Generate rooms
        const rooms = [];
        for (let i = 0; i < 15; i++) {
            const w = Math.floor(Math.random() * 8) + 4;
            const h = Math.floor(Math.random() * 8) + 4;
            const x = Math.floor(Math.random() * (MAP_WIDTH - w - 2)) + 1;
            const y = Math.floor(Math.random() * (MAP_HEIGHT - h - 2)) + 1;
            
            if (this.canPlaceRoom(x, y, w, h, rooms)) {
                this.createRoom(x, y, w, h);
                rooms.push({ x, y, w, h });
            }
        }
        
        // Connect rooms with corridors
        for (let i = 1; i < rooms.length; i++) {
            this.connectRooms(rooms[i-1], rooms[i]);
        }
        
        // Add some trees and rocks
        for (let i = 0; i < 50; i++) {
            const x = Math.floor(Math.random() * MAP_WIDTH);
            const y = Math.floor(Math.random() * MAP_HEIGHT);
            if (!this.map[y][x].solid && this.map[y][x] === TERRAIN.GRASS) {
                if (Math.random() < 0.5) {
                    this.map[y][x] = TERRAIN.TREE;
                } else {
                    this.map[y][x] = TERRAIN.ROCK;
                }
            }
        }
        
        // Initialize visible array
        this.visible = [];
        for (let y = 0; y < MAP_HEIGHT; y++) {
            this.visible[y] = [];
            for (let x = 0; x < MAP_WIDTH; x++) {
                this.visible[y][x] = false;
            }
        }
    }
    
    canPlaceRoom(x, y, w, h, existingRooms) {
        for (const room of existingRooms) {
            if (!(x + w < room.x || x > room.x + room.w || y + h < room.y || y > room.y + room.h)) {
                return false;
            }
        }
        return true;
    }
    
    createRoom(x, y, w, h) {
        for (let dy = 0; dy < h; dy++) {
            for (let dx = 0; dx < w; dx++) {
                const px = x + dx;
                const py = y + dy;
                if (px >= 0 && px < MAP_WIDTH && py >= 0 && py < MAP_HEIGHT) {
                    if (dx === 0 || dx === w - 1 || dy === 0 || dy === h - 1) {
                        if ((dx === Math.floor(w/2) && (dy === 0 || dy === h-1)) ||
                            (dy === Math.floor(h/2) && (dx === 0 || dx === w-1))) {
                            this.map[py][px] = TERRAIN.DOOR;
                        } else {
                            this.map[py][px] = TERRAIN.WALL;
                        }
                    } else {
                        this.map[py][px] = TERRAIN.FLOOR;
                    }
                }
            }
        }
    }
    
    connectRooms(room1, room2) {
        const x1 = room1.x + Math.floor(room1.w / 2);
        const y1 = room1.y + Math.floor(room1.h / 2);
        const x2 = room2.x + Math.floor(room2.w / 2);
        const y2 = room2.y + Math.floor(room2.h / 2);
        
        let x = x1;
        let y = y1;
        
        while (x !== x2 || y !== y2) {
            if (x !== x2) {
                x += x < x2 ? 1 : -1;
            } else if (y !== y2) {
                y += y < y2 ? 1 : -1;
            }
            
            if (x >= 0 && x < MAP_WIDTH && y >= 0 && y < MAP_HEIGHT) {
                if (this.map[y][x].solid) {
                    this.map[y][x] = TERRAIN.FLOOR;
                }
            }
        }
    }
    
    spawnEntities() {
        // Spawn some hostile creatures
        for (let i = 0; i < 8; i++) {
            let x, y;
            do {
                x = Math.floor(Math.random() * MAP_WIDTH);
                y = Math.floor(Math.random() * MAP_HEIGHT);
            } while (this.map[y][x].solid || (x === this.player.x && y === this.player.y));
            
            const entity = new Entity(
                `enemy_${i}`,
                `Goblin ${i+1}`,
                x, y,
                'g',
                COLORS.RED,
                {
                    strength: 8,
                    dexterity: 8,
                    ai: true,
                    aiState: AI_STATE.WANDER,
                    hostile: true,
                }
            );
            
            // Give some enemies weapons
            if (Math.random() < 0.5) {
                entity.weapon = ITEMS.DAGGER;
            }
            
            this.entities.push(entity);
        }
        
        // Spawn a friendly NPC
        let x, y;
        do {
            x = Math.floor(Math.random() * MAP_WIDTH);
            y = Math.floor(Math.random() * MAP_HEIGHT);
        } while (this.map[y][x].solid || (x === this.player.x && y === this.player.y));
        
        const npc = new Entity(
            'merchant',
            'Merchant',
            x, y,
            'M',
            COLORS.YELLOW,
            {
                strength: 5,
                dexterity: 5,
                ai: true,
                aiState: AI_STATE.IDLE,
                hostile: false,
            }
        );
        this.entities.push(npc);
    }
    
    spawnItems() {
        // Spawn items around the map
        const itemTypes = [ITEMS.SWORD, ITEMS.DAGGER, ITEMS.AXE, ITEMS.FOOD, ITEMS.GOLD, ITEMS.BACKPACK];
        
        for (let i = 0; i < 20; i++) {
            let x, y;
            do {
                x = Math.floor(Math.random() * MAP_WIDTH);
                y = Math.floor(Math.random() * MAP_HEIGHT);
            } while (this.map[y][x].solid);
            
            const itemData = itemTypes[Math.floor(Math.random() * itemTypes.length)];
            const item = new Item(itemData, x, y);
            
            const key = `${x},${y}`;
            if (!this.items.has(key)) {
                this.items.set(key, []);
            }
            this.items.get(key).push(item);
        }
    }
    
    updateVisible() {
        const viewRange = 12;
        const px = this.player.x;
        const py = this.player.y;
        
        // Reset visible
        for (let y = 0; y < MAP_HEIGHT; y++) {
            for (let x = 0; x < MAP_WIDTH; x++) {
                this.visible[y][x] = false;
            }
        }
        
        // Simple FOV
        for (let y = -viewRange; y <= viewRange; y++) {
            for (let x = -viewRange; x <= viewRange; x++) {
                const dist = Math.sqrt(x * x + y * y);
                if (dist <= viewRange) {
                    const mapX = px + x;
                    const mapY = py + y;
                    
                    if (mapX >= 0 && mapX < MAP_WIDTH && mapY >= 0 && mapY < MAP_HEIGHT) {
                        if (dist === 0) {
                            this.visible[mapY][mapX] = true;
                        } else {
                            const dx = x / dist;
                            const dy = y / dist;
                            let blocked = false;
                            
                            for (let d = 0; d <= dist; d += 0.5) {
                                const checkX = Math.round(px + dx * d);
                                const checkY = Math.round(py + dy * d);
                                
                                if (checkX >= 0 && checkX < MAP_WIDTH && checkY >= 0 && checkY < MAP_HEIGHT) {
                                    if (this.map[checkY][checkX].solid && (checkX !== mapX || checkY !== mapY)) {
                                        blocked = true;
                                        break;
                                    }
                                }
                            }
                            
                            if (!blocked) {
                                this.visible[mapY][mapX] = true;
                            }
                        }
                    }
                }
            }
        }
    }
    
    canMove(x, y) {
        if (x < 0 || x >= MAP_WIDTH || y < 0 || y >= MAP_HEIGHT) {
            return false;
        }
        const tile = this.map[y][x];
        return !tile.solid;
    }
    
    getEntityAt(x, y) {
        for (const entity of this.entities) {
            if (entity.alive && entity.x === x && entity.y === y) {
                return entity;
            }
        }
        return null;
    }
    
    getItemsAt(x, y) {
        const key = `${x},${y}`;
        return this.items.get(key) || [];
    }
    
    movePlayer(dx, dy) {
        if (this.uiMode === 'look') {
            this.lookX = Math.max(0, Math.min(MAP_WIDTH - 1, this.lookX + dx));
            this.lookY = Math.max(0, Math.min(MAP_HEIGHT - 1, this.lookY + dy));
            this.render();
            return;
        }
        
        const newX = this.player.x + dx;
        const newY = this.player.y + dy;
        
        if (!this.canMove(newX, newY)) {
            this.addMessage("You can't move there!");
            return;
        }
        
        // Check for entity
        const entity = this.getEntityAt(newX, newY);
        if (entity) {
            if (entity.hostile) {
                this.enterCombat(entity);
            } else {
                this.addMessage(`${entity.name} blocks your way.`);
            }
            return;
        }
        
        // Move player
        this.player.x = newX;
        this.player.y = newY;
        
        // Check for items
        const items = this.getItemsAt(newX, newY);
        if (items.length > 0) {
            this.addMessage(`You see ${items.length} item(s) here.`);
        }
        
        this.turns++;
        this.updateVisible();
        this.updateEntities();
        this.updateStatus();
        this.render();
    }
    
    enterCombat(target) {
        this.selectedEntity = target;
        // Get available body parts for targeting
        this.bodyPartList = target.body.getAllParts()
            .filter(p => !p.lostStructure)
            .map(p => p.name);
        this.bodyPartIndex = 0;
        this.selectedBodyPart = this.bodyPartList[0] || 'torso';
        this.uiMode = 'body_part_select';
        this.addMessage(`Select body part to attack on ${target.name} (WASD/Arrows to select, Space to attack)`);
        this.render();
    }
    
    selectBodyPart(direction) {
        if (this.uiMode !== 'body_part_select') return;
        
        if (direction === 'up') {
            this.bodyPartIndex = (this.bodyPartIndex - 1 + this.bodyPartList.length) % this.bodyPartList.length;
        } else if (direction === 'down') {
            this.bodyPartIndex = (this.bodyPartIndex + 1) % this.bodyPartList.length;
        }
        
        this.selectedBodyPart = this.bodyPartList[this.bodyPartIndex];
        this.render();
    }
    
    performAttack(attacker, defender, bodyPartName = null) {
        // Auto-select body part if not specified
        if (!bodyPartName) {
            // Weighted random selection (head/torso more likely)
            const parts = defender.body.getAllParts().filter(p => !p.lostStructure);
            const weights = {
                'head': 0.3,
                'torso': 0.3,
                'left arm': 0.1,
                'right arm': 0.1,
                'left leg': 0.1,
                'right leg': 0.1,
            };
            
            let rand = Math.random();
            let cumulative = 0;
            for (const part of parts) {
                cumulative += weights[part.name.toLowerCase()] || 0.05;
                if (rand <= cumulative) {
                    bodyPartName = part.name;
                    break;
                }
            }
            if (!bodyPartName) {
                bodyPartName = parts[Math.floor(Math.random() * parts.length)].name;
            }
        }
        
        const damage = attacker.getDamage();
        const damageType = attacker.getDamageType();
        const killed = defender.takeDamageToPart(bodyPartName, damage, damageType);
        
        const part = defender.body.getPart(bodyPartName);
        const partStatus = part ? part.getStatus() : 'unknown';
        
        if (killed) {
            this.addMessage(`${attacker.name} kills ${defender.name} by destroying the ${bodyPartName}!`);
            // Drop items
            if (defender.inventory.length > 0) {
                const key = `${defender.x},${defender.y}`;
                if (!this.items.has(key)) {
                    this.items.set(key, []);
                }
                this.items.get(key).push(...defender.inventory);
            }
        } else {
            this.addMessage(`${attacker.name} hits ${defender.name}'s ${bodyPartName} for ${damage} ${damageType} damage (${partStatus})!`);
            
            // Show pain if significant
            const bodyStatus = defender.getBodyStatus();
            if (bodyStatus && bodyStatus.pain > 50) {
                this.addMessage(`${defender.name} is in severe pain!`);
            }
            
            // Enemy counter-attack if hostile
            if (defender.hostile && defender.alive) {
                // Enemy attacks random body part
                const playerParts = attacker.body.getAllParts().filter(p => !p.lostStructure);
                const targetPart = playerParts[Math.floor(Math.random() * playerParts.length)].name;
                const counterDamage = defender.getDamage();
                const counterDamageType = defender.getDamageType();
                const playerKilled = attacker.takeDamageToPart(targetPart, counterDamage, counterDamageType);
                
                if (playerKilled) {
                    this.addMessage(`You have been slain by ${defender.name} (${targetPart} destroyed)!`);
                    this.gameOver();
                } else {
                    const playerPart = attacker.body.getPart(targetPart);
                    const playerPartStatus = playerPart ? playerPart.getStatus() : 'unknown';
                    this.addMessage(`${defender.name} hits your ${targetPart} for ${counterDamage} ${counterDamageType} damage (${playerPartStatus})!`);
                }
            }
        }
        
        this.turns++;
        this.updateStatus();
    }
    
    pickupItem() {
        const items = this.getItemsAt(this.player.x, this.player.y);
        if (items.length === 0) {
            this.addMessage("There's nothing here to pick up.");
            return;
        }
        
        const item = items[0];
        this.player.inventory.push(item);
        items.shift();
        
        if (items.length === 0) {
            const key = `${this.player.x},${this.player.y}`;
            this.items.delete(key);
        }
        
        this.addMessage(`You pick up ${item.name}.`);
        this.turns++;
        this.updateStatus();
        this.render();
    }
    
    enterLookMode() {
        this.uiMode = 'look';
        this.lookX = this.player.x;
        this.lookY = this.player.y;
        this.addMessage("Look mode: Use arrow keys to look around, ESC to exit.");
        this.render();
    }
    
    exitLookMode() {
        this.uiMode = null;
        this.lookX = null;
        this.lookY = null;
        this.render();
    }
    
    showInventory() {
        this.uiMode = 'inventory';
        this.addMessage(`Inventory: ${this.player.inventory.length} items.`);
        this.render();
    }
    
    showBodyStatus() {
        const status = this.player.getBodyStatus();
        if (!status) {
            this.addMessage("No body status available.");
            return;
        }
        
        this.addMessage(`Body Status: ${status.consciousness}% consciousness, ${status.breathing}% breathing, ${status.bloodPumping}% blood pumping`);
        this.addMessage(`Pain: ${status.pain}, Healthy: ${status.healthyParts}, Damaged: ${status.damagedParts}, Critical: ${status.criticalParts}`);
        if (status.severedParts > 0) {
            this.addMessage(`WARNING: ${status.severedParts} body parts severed!`);
        }
        
        // Show critical parts
        const parts = this.player.body.getAllParts().filter(p => p.getHealth() < 0.3 && !p.lostStructure);
        if (parts.length > 0) {
            const partNames = parts.map(p => `${p.name} (${Math.floor(p.getHealth() * 100)}%)`).join(', ');
            this.addMessage(`Critical parts: ${partNames}`);
        }
    }
    
    wait() {
        this.turns++;
        this.updateEntities();
        this.updateStatus();
        this.addMessage("You wait...");
        this.render();
    }
    
    updateEntities() {
        for (const entity of this.entities) {
            if (!entity.alive || !entity.ai) continue;
            
            if (entity.aiState === AI_STATE.DEAD) continue;
            
            // Simple AI: move towards player if hostile
            if (entity.hostile && entity.aiState === AI_STATE.HOSTILE) {
                const dx = this.player.x - entity.x;
                const dy = this.player.y - entity.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                
                if (dist <= 8) {
                    // Move towards player
                    const moveX = Math.sign(dx);
                    const moveY = Math.sign(dy);
                    
                    if (moveX !== 0 && Math.random() < 0.5) {
                        const newX = entity.x + moveX;
                        if (this.canMove(newX, entity.y) && !this.getEntityAt(newX, entity.y)) {
                            entity.x = newX;
                        }
                    } else if (moveY !== 0) {
                        const newY = entity.y + moveY;
                        if (this.canMove(entity.x, newY) && !this.getEntityAt(entity.x, newY)) {
                            entity.y = newY;
                        }
                    }
                    
                    // Attack if adjacent
                    if (dist < 2 && Math.random() < 0.3) {
                        this.performAttack(entity, this.player);
                    }
                }
            } else if (entity.aiState === AI_STATE.WANDER) {
                // Random wandering
                if (Math.random() < 0.1) {
                    const dirs = [[0, -1], [0, 1], [-1, 0], [1, 0]];
                    const [dx, dy] = dirs[Math.floor(Math.random() * dirs.length)];
                    const newX = entity.x + dx;
                    const newY = entity.y + dy;
                    
                    if (this.canMove(newX, newY) && !this.getEntityAt(newX, newY)) {
                        entity.x = newX;
                        entity.y = newY;
                    }
                }
                
                // Check if player is nearby
                const dx = this.player.x - entity.x;
                const dy = this.player.y - entity.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                
                if (dist <= 6 && entity.hostile) {
                    entity.aiState = AI_STATE.HOSTILE;
                }
            }
        }
    }
    
    gameOver() {
        this.addMessage("GAME OVER - Press R to restart");
        this.uiMode = 'gameover';
    }
    
    updateStatus() {
        document.getElementById('health').textContent = `HP: ${this.player.hp}/${this.player.maxHp}`;
        document.getElementById('position').textContent = `Position: (${this.player.x}, ${this.player.y})`;
        document.getElementById('turns').textContent = `Turns: ${this.turns}`;
    }
    
    addMessage(text) {
        this.messages.push(text);
        if (this.messages.length > 10) {
            this.messages.shift();
        }
        
        const log = document.getElementById('message-log');
        log.innerHTML = '';
        this.messages.forEach(msg => {
            const p = document.createElement('p');
            p.textContent = msg;
            log.appendChild(p);
        });
        log.scrollTop = log.scrollHeight;
    }
    
    setupInput() {
        document.addEventListener('keydown', (e) => {
            this.canvas.focus();
            
            if (this.uiMode === 'gameover' && e.key.toLowerCase() === 'r') {
                location.reload();
                return;
            }
            
            switch(e.key) {
                case 'ArrowUp':
                case 'w':
                case 'W':
                    e.preventDefault();
                    if (this.uiMode === 'body_part_select') {
                        this.selectBodyPart('up');
                    } else {
                        this.movePlayer(0, -1);
                    }
                    break;
                case 'ArrowDown':
                case 's':
                case 'S':
                    e.preventDefault();
                    if (this.uiMode === 'body_part_select') {
                        this.selectBodyPart('down');
                    } else {
                        this.movePlayer(0, 1);
                    }
                    break;
                case 'ArrowLeft':
                case 'a':
                case 'A':
                    e.preventDefault();
                    this.movePlayer(-1, 0);
                    break;
                case 'ArrowRight':
                case 'd':
                case 'D':
                    e.preventDefault();
                    this.movePlayer(1, 0);
                    break;
                case ' ':
                    e.preventDefault();
                    if (this.uiMode === 'body_part_select') {
                        if (this.selectedEntity && this.selectedEntity.alive && this.selectedBodyPart) {
                            this.performAttack(this.player, this.selectedEntity, this.selectedBodyPart);
                            this.uiMode = null;
                            this.selectedBodyPart = null;
                            this.render();
                        } else {
                            this.uiMode = null;
                            this.selectedEntity = null;
                            this.selectedBodyPart = null;
                            this.render();
                        }
                    } else {
                        this.wait();
                    }
                    break;
                case 'g':
                case 'G':
                    e.preventDefault();
                    this.pickupItem();
                    break;
                case 'l':
                case 'L':
                    e.preventDefault();
                    if (this.uiMode === 'look') {
                        this.exitLookMode();
                    } else {
                        this.enterLookMode();
                    }
                    break;
                case 'i':
                case 'I':
                    e.preventDefault();
                    if (this.uiMode === 'inventory') {
                        this.uiMode = null;
                        this.render();
                    } else {
                        this.showInventory();
                    }
                    break;
                case 'Escape':
                    e.preventDefault();
                    if (this.uiMode) {
                        this.uiMode = null;
                        this.selectedEntity = null;
                        this.lookX = null;
                        this.lookY = null;
                        this.render();
                    }
                    break;
                case 'b':
                case 'B':
                    e.preventDefault();
                    this.showBodyStatus();
                    break;
                case '?':
                    e.preventDefault();
                    this.addMessage("Controls: WASD/Arrows=Move, G=Pickup, L=Look, I=Inventory, B=Body status, Space=Wait/Attack, ESC=Exit mode");
                    break;
            }
        });
    }
    
    render() {
        // Clear canvas
        this.ctx.fillStyle = '#000';
        this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Calculate camera
        let cameraX, cameraY;
        if (this.uiMode === 'look' && this.lookX !== null && this.lookY !== null) {
            cameraX = Math.floor(this.lookX - VIEW_WIDTH / 2);
            cameraY = Math.floor(this.lookY - VIEW_HEIGHT / 2);
        } else {
            cameraX = Math.floor(this.player.x - VIEW_WIDTH / 2);
            cameraY = Math.floor(this.player.y - VIEW_HEIGHT / 2);
        }
        
        // Render tiles
        for (let y = 0; y < VIEW_HEIGHT; y++) {
            for (let x = 0; x < VIEW_WIDTH; x++) {
                const mapX = cameraX + x;
                const mapY = cameraY + y;
                
                if (mapX >= 0 && mapX < MAP_WIDTH && mapY >= 0 && mapY < MAP_HEIGHT) {
                    const tile = this.map[mapY][mapX];
                    const isVisible = this.visible[mapY] && this.visible[mapY][mapX];
                    
                    // Draw background
                    const bgColor = isVisible ? tile.bgColor : '#000';
                    this.ctx.fillStyle = bgColor;
                    this.ctx.fillRect(x * TILE_SIZE, y * TILE_SIZE, TILE_SIZE, TILE_SIZE);
                    
                    // Draw tile
                    if (isVisible || this.uiMode === 'look') {
                        this.ctx.fillStyle = isVisible ? tile.color : '#333';
                        this.ctx.fillText(
                            tile.char,
                            x * TILE_SIZE + TILE_SIZE / 2,
                            y * TILE_SIZE + TILE_SIZE / 2
                        );
                    }
                    
                    // Draw items
                    if (isVisible || this.uiMode === 'look') {
                        const items = this.getItemsAt(mapX, mapY);
                        if (items.length > 0) {
                            const item = items[0];
                            this.ctx.fillStyle = isVisible ? item.color : '#333';
                            this.ctx.fillText(
                                item.char,
                                x * TILE_SIZE + TILE_SIZE / 2,
                                y * TILE_SIZE + TILE_SIZE / 2
                            );
                        }
                    }
                }
            }
        }
        
        // Draw entities
        for (const entity of this.entities) {
            if (!entity.alive) continue;
            
            const screenX = entity.x - cameraX;
            const screenY = entity.y - cameraY;
            
            if (screenX >= 0 && screenX < VIEW_WIDTH && screenY >= 0 && screenY < VIEW_HEIGHT) {
                const isVisible = this.visible[entity.y] && this.visible[entity.y][entity.x];
                if (isVisible || this.uiMode === 'look') {
                    this.ctx.fillStyle = isVisible ? entity.color : '#333';
                    this.ctx.fillText(
                        entity.symbol,
                        screenX * TILE_SIZE + TILE_SIZE / 2,
                        screenY * TILE_SIZE + TILE_SIZE / 2
                    );
                }
            }
        }
        
        // Draw player
        const screenX = this.player.x - cameraX;
        const screenY = this.player.y - cameraY;
        if (screenX >= 0 && screenX < VIEW_WIDTH && screenY >= 0 && screenY < VIEW_HEIGHT) {
            this.ctx.fillStyle = COLORS.MAGENTA;
            this.ctx.fillText(
                '@',
                screenX * TILE_SIZE + TILE_SIZE / 2,
                screenY * TILE_SIZE + TILE_SIZE / 2
            );
        }
        
        // Draw look cursor
        if (this.uiMode === 'look' && this.lookX !== null && this.lookY !== null) {
            const lookScreenX = this.lookX - cameraX;
            const lookScreenY = this.lookY - cameraY;
            if (lookScreenX >= 0 && lookScreenX < VIEW_WIDTH && lookScreenY >= 0 && lookScreenY < VIEW_HEIGHT) {
                this.ctx.strokeStyle = COLORS.CYAN;
                this.ctx.lineWidth = 2;
                this.ctx.strokeRect(
                    lookScreenX * TILE_SIZE,
                    lookScreenY * TILE_SIZE,
                    TILE_SIZE,
                    TILE_SIZE
                );
                
                // Show description
                const tile = this.map[this.lookY][this.lookX];
                const entity = this.getEntityAt(this.lookX, this.lookY);
                const items = this.getItemsAt(this.lookX, this.lookY);
                
                let desc = tile.name;
                if (entity) desc += `, ${entity.name}`;
                if (items.length > 0) desc += `, ${items[0].name}`;
                
                this.addMessage(`You see: ${desc}`);
            }
        }
        
        // Draw inventory overlay
        if (this.uiMode === 'inventory') {
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            
            this.ctx.fillStyle = COLORS.WHITE;
            this.ctx.font = `${TILE_SIZE * 2}px 'IBM BIOS'`;
            this.ctx.textAlign = 'left';
            this.ctx.fillText('INVENTORY', 20, 40);
            
            this.ctx.font = `${TILE_SIZE}px 'IBM BIOS'`;
            if (this.player.inventory.length === 0) {
                this.ctx.fillText('(empty)', 20, 80);
            } else {
                this.player.inventory.forEach((item, i) => {
                    this.ctx.fillStyle = item.color;
                    this.ctx.fillText(
                        `${item.char} ${item.name}`,
                        20,
                        80 + i * 30
                    );
                });
            }
            
            this.ctx.fillStyle = COLORS.GRAY;
            this.ctx.fillText('Press I to close', 20, this.canvas.height - 40);
            this.ctx.textAlign = 'center';
        }
        
        // Draw body part selection overlay
        if (this.uiMode === 'body_part_select' && this.selectedEntity) {
            // Highlight target
            this.ctx.fillStyle = 'rgba(200, 0, 0, 0.3)';
            const targetScreenX = this.selectedEntity.x - cameraX;
            const targetScreenY = this.selectedEntity.y - cameraY;
            if (targetScreenX >= 0 && targetScreenX < VIEW_WIDTH && targetScreenY >= 0 && targetScreenY < VIEW_HEIGHT) {
                this.ctx.fillRect(
                    targetScreenX * TILE_SIZE,
                    targetScreenY * TILE_SIZE,
                    TILE_SIZE,
                    TILE_SIZE
                );
            }
            
            // Show body part selection menu
            this.ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
            this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
            
            this.ctx.fillStyle = COLORS.WHITE;
            this.ctx.font = `${TILE_SIZE * 2}px 'IBM BIOS'`;
            this.ctx.textAlign = 'left';
            this.ctx.fillText('SELECT BODY PART TO ATTACK', 20, 40);
            
            this.ctx.font = `${TILE_SIZE}px 'IBM BIOS'`;
            this.bodyPartList.forEach((partName, i) => {
                const part = this.selectedEntity.body.getPart(partName);
                const isSelected = i === this.bodyPartIndex;
                const health = part ? Math.floor(part.getHealth() * 100) : 0;
                const status = part ? part.getStatus() : 'unknown';
                
                if (isSelected) {
                    this.ctx.fillStyle = COLORS.CYAN;
                    this.ctx.fillRect(20, 80 + i * 30 - 5, this.canvas.width - 40, 25);
                } else {
                    this.ctx.fillStyle = COLORS.WHITE;
                }
                
                this.ctx.fillText(
                    `${isSelected ? '>' : ' '} ${partName} (${health}% - ${status})`,
                    30,
                    80 + i * 30
                );
            });
            
            this.ctx.fillStyle = COLORS.GRAY;
            this.ctx.fillText('WASD/Arrows: Select | Space: Attack | ESC: Cancel', 20, this.canvas.height - 40);
            this.ctx.textAlign = 'center';
        }
    }
}

// Initialize game
window.addEventListener('load', () => {
    new Game();
});
