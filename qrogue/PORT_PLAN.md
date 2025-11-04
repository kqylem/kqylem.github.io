# Winerunner HTML Port - Implementation Plan

This document tracks the systematic port of the Python/Pygame roguelike game to HTML/JavaScript.

## Current Status

### ✅ Completed
- Core constants (js/constants.js)
- Color system (js/colors.js)
- Terrain data structures (js/data/terrain.js)
- Item data structures (js/data/items.js)
- Furniture data structures (js/data/furniture.js)
- Registry system (js/utils/registry.js) - TerrainRegistry, ItemRegistry, FurnitureRegistry
- All terrain JSON files copied (13 files)
- All item JSON files copied (6 files)
- All furniture JSON files copied (4 files)

### 🔄 In Progress
- Component systems (movement, vision, lighting, etc.)

### 📋 To Do

#### Phase 1: Foundation (Core Data)
- [x] Constants
- [x] Colors
- [x] Terrain flags/types
- [x] Terrain data structures (TerrainData, BashResult)
- [x] TerrainLoader (loads from JSON)
- [x] TerrainRegistry (complete)
- [x] Terrain utility functions
- [x] All terrain JSON files copied (13 files)
- [x] Item flags/types
- [x] Item data structures (ItemData, ClothingData, PocketData, etc.)
- [x] ItemLoader (loads from JSON)
- [x] Furniture flags/types
- [x] Furniture data structures (FurnitureData, BashResult, WorkbenchData, etc.)
- [x] FurnitureLoader (loads from JSON)
- [x] JSON data loaders (items, furniture)
- [x] Complete registry system (ItemRegistry, FurnitureRegistry)
- [x] All item JSON files copied (6 files)
- [x] All furniture JSON files copied (4 files)

#### Phase 2: Entity System
- [x] Entity class (core structure)
- [x] EntityStats
- [x] EntityManager
- [x] Player class
- [x] FacingDirection enum
- [x] BloodSystem
- [ ] Body system integration (deferred until body system is ported)
- [ ] Clothing system integration (deferred until clothing system is ported)
- [ ] Inventory integration (deferred until inventory system is ported)

#### Phase 3: Body System
- [ ] Body parts structure
- [ ] Body flags/capacities
- [ ] Tissue system
- [ ] Body damage system
- [ ] Body factory

#### Phase 4: World System
- [x] Chunk class (core structure with TypedArrays)
- [x] WorldManager class (chunk management)
- [x] Basic terrain generation
- [x] Heightmap generation (basic)
- [ ] Seamless chunk generation (deferred)
- [ ] Advanced terrain generation (deferred)
- [ ] Furniture generation (deferred)
- [ ] Tree generation (deferred)

#### Phase 5: Component Systems
- [x] Base GameComponent class
- [x] TimeSystem (core structure)
- [x] WorldSystem (core structure)
- [x] MovementSystem (core structure)
- [x] VisionSystem (FOV calculation, entity imprints, explored tiles)
- [x] DirectionalVisionSystem (AI vision cones)
- [ ] Lighting system
- [ ] Inventory system
- [ ] Combat system
- [ ] AI system
- [ ] Physics system
- [ ] And many more...

#### Phase 6: UI System
- [ ] UI components
- [ ] Rendering system
- [ ] Input handling
- [ ] Game loop

#### Phase 7: Game Engine
- [ ] Main engine class
- [ ] System initialization
- [ ] Update loop
- [ ] Render loop

## File Structure

```
js/
├── constants.js          ✅
├── colors.js            ✅
├── data/
│   ├── terrain.js       ✅
│   ├── items.js         🔄
│   └── furniture.js     📋
├── utils/
│   └── registry.js      🔄
├── entity.js            ✅
├── entity_manager.js     ✅
├── player.js             ✅
├── body/                 📋
├── world/
│   ├── chunk.js          ✅
│   └── world_manager.js   ✅
├── components/
│   ├── base.js           ✅
│   ├── time.js           ✅
│   ├── world.js           ✅
│   ├── movement.js        ✅
│   ├── vision.js          ✅
│   └── directional_vision.js ✅
├── ui/                   📋
└── engine.js             📋
```

## Notes

- Using ES6 modules for organization
- Maintaining same structure as Python codebase
- Porting actual code, not making assumptions
- Will need to adapt Python-specific features (numpy, dataclasses, etc.) to JavaScript equivalents

