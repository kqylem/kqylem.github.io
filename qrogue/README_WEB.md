# Winerunner Web Edition

An advanced web-based version of Winerunner, playable directly in your browser!

## Features

- **Tile-based roguelike gameplay** - Classic ASCII-style graphics
- **Procedural dungeon generation** - Multiple rooms connected by corridors
- **Entities & AI** - Hostile goblins, friendly NPCs, and wandering creatures
- **Advanced Body System** - Hierarchical body parts (head, torso, arms, legs, organs)
- **Body Part Targeting** - Select specific body parts to attack in combat
- **Damage Types** - Bruise, cut, puncture, and fracture damage types
- **Capacities System** - Consciousness, breathing, and blood pumping capacities
- **Pain System** - Track pain from injuries
- **Combat system** - Turn-based combat with body part targeting and damage types
- **Inventory system** - Pick up items, weapons, and equipment
- **Look/Examine mode** - Inspect tiles, entities, and items
- **Field of view** - Only see what your character can see
- **Items on ground** - Weapons, food, gold, and containers scattered around
- **IBM BIOS font** - Authentic retro terminal aesthetic

## How to Play

1. Open `index.html` in a web browser
2. Use **Arrow Keys** or **WASD** to move your character (`@`)
3. Explore the dungeon, fight enemies, collect items
4. Press **?** for help

## Controls

- **Arrow Keys / WASD** - Move your character (or select body part in combat)
- **G** - Pick up item (when standing on one)
- **L** - Enter/exit Look mode (examine tiles)
- **I** - Open/close Inventory
- **B** - Show body status (capacities, pain, damaged parts)
- **Space** - Wait (pass turn) or Attack (in combat/body part selection)
- **ESC** - Exit current mode
- **?** - Show help

## Gameplay

### Combat
- When you move into a hostile entity, body part selection mode begins
- Use **WASD/Arrow Keys** to select which body part to target
- Press **Space** to attack the selected body part
- Different weapons cause different damage types:
  - **Swords/Axes** - Cut damage
  - **Daggers** - Puncture damage
  - **Unarmed** - Bruise damage
- Body parts have health and can be severed if damaged enough
- Destroying critical parts (brain, heart) causes instant death
- Enemies will counter-attack and target your body parts
- Watch for pain messages when taking significant damage

### Items
- Walk over items on the ground
- Press **G** to pick them up
- Items include: swords, daggers, axes, food, gold, and backpacks
- Open inventory with **I** to see what you're carrying

### Exploration
- Press **L** to enter Look mode
- Use arrow keys to look around
- See descriptions of tiles, entities, and items
- Press **L** again or **ESC** to exit

### Body System
- All entities have a complex body with hierarchical body parts:
  - **Head** - Contains brain (consciousness), eyes (sight)
  - **Torso** - Contains heart (blood pumping), lungs (breathing)
  - **Arms** - Can grasp items
  - **Legs** - Required for movement
- Each body part has health and can be damaged
- Body parts can be severed if damaged enough
- Capacities (consciousness, breathing, blood pumping) determine if you're alive
- Press **B** to see your body status
- Different body parts have different tissue layers (skin, muscle, bone, organs)

### Entities
- **Goblins (g)** - Hostile creatures that will attack you
- **Merchant (M)** - Friendly NPC (yellow)
- Enemies will chase you when nearby
- All entities have the same body structure (can be customized)

## File Structure

- `index.html` - Main HTML file
- `style.css` - Styling and layout
- `body_system.js` - Body system with hierarchical body parts, capacities, and damage
- `game.js` - Core game logic (all systems)
- `Ac437_IBM_BIOS.ttf` - Font file (must be in same directory)

## Deployment to GitHub Pages

1. Make sure all files are in your repository root
2. Go to your repository Settings → Pages
3. Select the branch and folder (usually `main` and `/`)
4. Your game will be available at `https://yourusername.github.io/repository-name/`

## Customization

The game is designed to be easily extensible:

- **Terrain types** - Add new terrain in the `TERRAIN` object
- **Items** - Add new items in the `ITEMS` object
- **Entity AI** - Modify the `updateEntities()` function
- **Map generation** - Customize the `generateMap()` function
- **Combat** - Adjust damage formulas in `performAttack()`
- **Colors** - Update the `COLORS` object for different palettes

## Technical Details

### Game Systems
- **Entity System** - Entities with stats, AI, and inventory
- **Body System** - Hierarchical body parts with tissues, capacities, and damage tracking
- **Combat System** - Turn-based combat with body part targeting and damage types
- **Damage System** - Multiple damage types (bruise, cut, puncture, fracture) with tissue armor
- **Capacity System** - Consciousness, breathing, and blood pumping capacities determine life
- **Pain System** - Tracks pain from injuries, affects combat performance
- **Inventory System** - Item management with stacking support
- **AI System** - Simple AI for enemies (wander, pursue, attack)
- **FOV System** - Line-of-sight field of view
- **World Generation** - Room-based dungeon generation

### Code Structure
- `Entity` class - Represents all creatures (player, NPCs, enemies) with body system
- `Body` class - Manages hierarchical body parts and capacities
- `BodyPart` class - Individual body parts with tissues, damage, and flags
- `Item` class - Represents items in the world
- `Game` class - Main game loop and state management
- Terrain, items, and entities are stored in separate data structures

## Future Enhancements

Potential features to add:
- More complex AI behaviors
- Equipment system (wearing items)
- Containers with item storage
- More item types and effects
- Save/load functionality
- Multiple levels/dungeons
- Character stats and progression
- More combat options (different attack types)

