// Body System - Complex hierarchical body parts with capacities and damage

// Body part flags (capacities)
const BODY_FLAG = {
    CONSCIOUSNESS: 'CONSCIOUSNESS',
    BREATHING: 'BREATHING',
    BLOOD_PUMPING: 'BLOOD_PUMPING',
    SIGHT: 'SIGHT',
    GRASP: 'GRASP',
    MOVING: 'MOVING',
    EATING: 'EATING',
};

// Damage types
const DAMAGE_TYPE = {
    BRUISE: 'bruise',
    CUT: 'cut',
    PUNCTURE: 'puncture',
    FRACTURE: 'fracture',
};

// Tissue types
const TISSUE = {
    SKIN: { name: 'skin', thickness: 1.0, armor: 1 },
    FAT: { name: 'fat', thickness: 2.0, armor: 0.5 },
    MUSCLE: { name: 'muscle', thickness: 5.0, armor: 2 },
    BONE: { name: 'bone', thickness: 3.0, armor: 5 },
    ORGAN: { name: 'organ', thickness: 2.0, armor: 0 },
};

class BodyPart {
    constructor(name, size, flags = [], tissues = [], children = []) {
        this.name = name;
        this.size = size; // Size of the body part
        this.flags = new Set(flags); // Capacities this part provides
        this.tissues = tissues; // Tissue layers
        this.children = children; // Child body parts
        this.parent = null;
        
        // Damage state
        this.damage = {
            bruise: 0,
            cut: 0,
            puncture: 0,
            fracture: 0,
        };
        this.totalDamage = 0;
        this.lostStructure = false; // Severed/destroyed
        this.pain = 0;
        
        // Set parent for children
        children.forEach(child => {
            child.parent = this;
        });
    }
    
    // Get all descendant parts (including self)
    getAllParts() {
        const parts = [this];
        this.children.forEach(child => {
            parts.push(...child.getAllParts());
        });
        return parts;
    }
    
    // Find parts by flag
    findPartsByFlag(flag) {
        const results = [];
        if (this.flags.has(flag)) {
            results.push(this);
        }
        this.children.forEach(child => {
            results.push(...child.findPartsByFlag(flag));
        });
        return results;
    }
    
    // Get health as percentage (0-1)
    getHealth() {
        if (this.lostStructure) return 0;
        const maxHealth = this.size * 100; // Max health based on size
        const currentHealth = maxHealth - this.totalDamage;
        return Math.max(0, currentHealth / maxHealth);
    }
    
    // Get capacity contribution (0-1)
    getCapacity(flag) {
        if (!this.flags.has(flag)) return 0;
        if (this.lostStructure) return 0;
        return this.getHealth();
    }
    
    // Apply damage to this part
    applyDamage(amount, damageType = DAMAGE_TYPE.BRUISE) {
        if (this.lostStructure) return 0;
        
        // Calculate damage based on tissue layers
        let remainingDamage = amount;
        let actualDamage = 0;
        
        for (const tissue of this.tissues) {
            if (remainingDamage <= 0) break;
            
            const tissueData = TISSUE[tissue] || TISSUE.SKIN;
            const armor = tissueData.armor || 0;
            const blocked = Math.min(armor, remainingDamage);
            const passed = remainingDamage - blocked;
            
            actualDamage += passed;
            remainingDamage = passed;
        }
        
        // Apply damage
        this.damage[damageType] += actualDamage;
        this.totalDamage += actualDamage;
        
        // Calculate pain (more pain from cuts and punctures)
        const painMultiplier = {
            [DAMAGE_TYPE.BRUISE]: 0.5,
            [DAMAGE_TYPE.CUT]: 1.5,
            [DAMAGE_TYPE.PUNCTURE]: 2.0,
            [DAMAGE_TYPE.FRACTURE]: 1.0,
        };
        this.pain += actualDamage * (painMultiplier[damageType] || 1.0);
        
        // Check for severance (if damage > 80% of max health)
        const maxHealth = this.size * 100;
        if (this.totalDamage >= maxHealth * 0.8) {
            this.lostStructure = true;
        }
        
        return actualDamage;
    }
    
    // Get status description
    getStatus() {
        if (this.lostStructure) {
            return 'severed';
        }
        const health = this.getHealth();
        if (health > 0.8) return 'healthy';
        if (health > 0.5) return 'damaged';
        if (health > 0.2) return 'badly damaged';
        return 'critical';
    }
}

class Body {
    constructor(entity) {
        this.entity = entity;
        this.root = this.createHumanBody();
        this._capacityCache = {};
    }
    
    // Create a standard human body structure
    createHumanBody() {
        const torso = new BodyPart('torso', 20, [BODY_FLAG.BLOOD_PUMPING], 
            [TISSUE.SKIN, TISSUE.FAT, TISSUE.MUSCLE]);
        
        const head = new BodyPart('head', 8, [BODY_FLAG.CONSCIOUSNESS, BODY_FLAG.SIGHT, BODY_FLAG.EATING], 
            [TISSUE.SKIN, TISSUE.MUSCLE, TISSUE.BONE], [
                new BodyPart('brain', 3, [BODY_FLAG.CONSCIOUSNESS], [TISSUE.ORGAN]),
                new BodyPart('left eye', 1, [BODY_FLAG.SIGHT], [TISSUE.SKIN]),
                new BodyPart('right eye', 1, [BODY_FLAG.SIGHT], [TISSUE.SKIN]),
            ]);
        
        const leftArm = new BodyPart('left arm', 6, [BODY_FLAG.GRASP], 
            [TISSUE.SKIN, TISSUE.MUSCLE, TISSUE.BONE], [
                new BodyPart('left hand', 2, [BODY_FLAG.GRASP], [TISSUE.SKIN, TISSUE.MUSCLE]),
            ]);
        
        const rightArm = new BodyPart('right arm', 6, [BODY_FLAG.GRASP], 
            [TISSUE.SKIN, TISSUE.MUSCLE, TISSUE.BONE], [
                new BodyPart('right hand', 2, [BODY_FLAG.GRASP], [TISSUE.SKIN, TISSUE.MUSCLE]),
            ]);
        
        const leftLeg = new BodyPart('left leg', 8, [BODY_FLAG.MOVING], 
            [TISSUE.SKIN, TISSUE.MUSCLE, TISSUE.BONE], [
                new BodyPart('left foot', 2, [], [TISSUE.SKIN, TISSUE.MUSCLE]),
            ]);
        
        const rightLeg = new BodyPart('right leg', 8, [BODY_FLAG.MOVING], 
            [TISSUE.SKIN, TISSUE.MUSCLE, TISSUE.BONE], [
                new BodyPart('right foot', 2, [], [TISSUE.SKIN, TISSUE.MUSCLE]),
            ]);
        
        const lungs = new BodyPart('lungs', 4, [BODY_FLAG.BREATHING], [TISSUE.ORGAN]);
        const heart = new BodyPart('heart', 2, [BODY_FLAG.BLOOD_PUMPING], [TISSUE.ORGAN]);
        
        torso.children = [head, leftArm, rightArm, leftLeg, rightLeg, lungs, heart];
        torso.children.forEach(child => child.parent = torso);
        
        return torso;
    }
    
    // Get all body parts
    getAllParts() {
        return this.root.getAllParts();
    }
    
    // Find parts by flag
    findPartsByFlag(flag) {
        return this.root.findPartsByFlag(flag);
    }
    
    // Get capacity for a flag (0-1)
    getCapacity(flag) {
        if (this._capacityCache[flag] !== undefined) {
            return this._capacityCache[flag];
        }
        
        const parts = this.findPartsByFlag(flag);
        if (parts.length === 0) {
            this._capacityCache[flag] = 0;
            return 0;
        }
        
        // Average health of all parts with this flag
        let totalCapacity = 0;
        parts.forEach(part => {
            totalCapacity += part.getCapacity(flag);
        });
        
        const capacity = totalCapacity / parts.length;
        this._capacityCache[flag] = capacity;
        return capacity;
    }
    
    // Clear capacity cache (call after damage)
    clearCapacityCache() {
        this._capacityCache = {};
    }
    
    // Apply damage to a specific body part
    applyDamage(partName, amount, damageType = DAMAGE_TYPE.BRUISE) {
        const parts = this.getAllParts();
        const part = parts.find(p => p.name.toLowerCase() === partName.toLowerCase());
        
        if (!part) {
            console.warn(`Body part not found: ${partName}`);
            return 0;
        }
        
        const damage = part.applyDamage(amount, damageType);
        this.clearCapacityCache();
        
        // Update entity alive status
        this.updateAliveStatus();
        
        return damage;
    }
    
    // Get total pain
    getTotalPain() {
        const parts = this.getAllParts();
        let totalPain = 0;
        parts.forEach(part => {
            totalPain += part.pain;
        });
        return totalPain;
    }
    
    // Check if entity is alive
    isAlive() {
        const consciousness = this.getCapacity(BODY_FLAG.CONSCIOUSNESS);
        const bloodPumping = this.getCapacity(BODY_FLAG.BLOOD_PUMPING);
        return consciousness > 0 && bloodPumping > 0;
    }
    
    // Update entity alive status
    updateAliveStatus() {
        if (this.entity) {
            this.entity.alive = this.isAlive();
            if (!this.entity.alive) {
                this.entity.aiState = 'dead';
            }
        }
    }
    
    // Get body status summary
    getStatusSummary() {
        const parts = this.getAllParts();
        const criticalParts = parts.filter(p => p.getHealth() < 0.3 && !p.lostStructure);
        const severedParts = parts.filter(p => p.lostStructure);
        
        const summary = {
            totalParts: parts.length,
            healthyParts: parts.filter(p => p.getHealth() > 0.8).length,
            damagedParts: parts.filter(p => p.getHealth() <= 0.8 && p.getHealth() > 0.3 && !p.lostStructure).length,
            criticalParts: criticalParts.length,
            severedParts: severedParts.length,
            pain: Math.floor(this.getTotalPain()),
            consciousness: Math.floor(this.getCapacity(BODY_FLAG.CONSCIOUSNESS) * 100),
            breathing: Math.floor(this.getCapacity(BODY_FLAG.BREATHING) * 100),
            bloodPumping: Math.floor(this.getCapacity(BODY_FLAG.BLOOD_PUMPING) * 100),
        };
        
        return summary;
    }
    
    // Get body part by name
    getPart(partName) {
        const parts = this.getAllParts();
        return parts.find(p => p.name.toLowerCase() === partName.toLowerCase());
    }
}

