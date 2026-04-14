import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Zap, Shield, Flame, Star, Crown, Sword, Target,
    ChevronDown, ChevronRight, Search, BookOpen, Brain,
    Sparkles, AlertCircle, Info, ArrowUp, Menu, X,
    Gauge, Timer, Dumbbell, Heart, Crosshair, Battery, LightbulbIcon, HelpCircle
} from 'lucide-react';

const TIERS = {
    tier11: {
        name: "Tier 11: Infinitesimal",
        color: "#6b7280",
        description: "Characters or objects that affect lower-dimensional universes or layers of reality. Qualitatively inferior to standard 3-dimensional reality.",
        subTiers: [
            { id: "11-C", name: "Low Hypoverse", description: "Power equivalent to destroying/creating infinitely inferior 0-dimensional constructs", detail: "A 0-dimensional point has no length, width, or height. In mathematical terms, it is a singularity — a coordinate with no extension. Entities at this tier can influence or destroy such constructs, but have zero capacity against anything with actual spatial extension.", examples: "Abstract computational entities, theoretical particles" },
            { id: "11-B", name: "Hypoverse", description: "Power equivalent to destroying/creating infinitely inferior 1-dimensional constructs", detail: "A 1-dimensional line has length but no width or height. Think of it as an infinitely thin thread through reality. From a geometric perspective, an infinite number of 0D points fit on this line, making it infinitely superior to 11-C.", examples: "Line-bound entities, 1D narrative constructs" },
            { id: "11-A", name: "High Hypoverse", description: "Power equivalent to destroying/creating infinitely inferior 2-dimensional constructs", detail: "A 2-dimensional plane has length and width but no depth. An infinite number of 1D lines can fit side by side on a 2D plane, making it infinitely superior to 11-B. Real-world analogy: the surface of a piece of paper has area but zero volume." }
        ]
    },
    tier10: {
        name: "Tier 10: Human",
        color: "#22c55e",
        description: "Standard scale of human existence and physical capability. The baseline for all fictional scaling.",
        subTiers: [
            { id: "10-C", name: "Below Average Human", description: "0 to 60 Joules", detail: "For reference, 60 Joules is roughly the kinetic energy of a tennis ball served at 120 mph. Characters at this level include small animals, young children, and physically impaired individuals.", examples: "Ash's Pikachu (base, no electricity), Chopper (base human form), small animals" },
            { id: "10-B", name: "Human Level", description: "60 to 106 Joules", detail: "The average untrained adult punch carries about 50-80 Joules of energy. This tier represents the baseline of normal human capability — no special training, no superhuman genes. Just normal people.", examples: "Average teenagers in slice-of-life anime, unathletic adults, civilian NPCs" },
            { id: "10-A", name: "Athlete Level", description: "106 to 300 Joules", detail: "A professional boxer's punch can deliver ~400 Joules peak, but averages around 200-300J. This tier represents the absolute peak of what a normal, well-trained human can achieve without any supernatural augmentation.", examples: "Ippo Makunouchi (early career), Rock Lee (no gates)" }
        ]
    },
    tier9: {
        name: "Tier 9: Superhuman",
        color: "#3b82f6",
        description: "Beyond normal human limits. Characters here consistently perform feats impossible for real humans.",
        subTiers: [
            { id: "9-C", name: "Street Level", description: "300 Joules to 15 Kilojoules", detail: "15 KJ is roughly the energy of a .50 caliber bullet impact. Characters at this level can shatter concrete with bare fists, break steel chains, and survive falls that would kill normal humans. They dominate street-level combat.", examples: "Spike Spiegel (Cowboy Bebop), Deku (early MHA), Tanjiro (early Demon Slayer)" },
            { id: "9-B", name: "Wall Level", description: "15 Kilojoules to 0.005 Tons TNT", detail: "0.005 Tons of TNT is about 20.9 Megajoules — enough energy to demolish a reinforced concrete wall or shatter a car. Characters routinely bust through walls, crush boulders, and tank hits that would obliterate normal structures.", examples: "Zoro (East Blue Saga), Jonathan Joestar, Gon Freecss (early)" },
            { id: "9-A", name: "Small Building Level", description: "0.005 to 0.25 Tons TNT", detail: "Equivalent to 20.9 MJ to 1.05 GJ. For context, a hand grenade produces about 0.0003 Tons TNT. Characters at this tier can demolish small houses, shatter reinforced bunkers, and create craters several meters wide with their attacks.", examples: "Izuku Midoriya (5% Full Cowl), Kaneki Ken, early Bleach characters" }
        ]
    },
    tier8: {
        name: "Tier 8: Urban",
        color: "#8b5cf6",
        description: "Urban-scale destruction. Characters here can level buildings to entire city blocks.",
        subTiers: [
            { id: "8-C", name: "Building Level", description: "0.25 to 2 Tons TNT", detail: "2 Tons of TNT is the explosive yield of most conventional bombs used in WWII. A character at this level can completely demolish a multi-story building with a single attack. The kinetic energy involved is staggering compared to anything humans can produce.", examples: "Luffy (Alabasta), Naruto (Part 1 Rasengan), Ichigo (early Bankai)" },
            { id: "High 8-C", name: "Large Building Level", description: "2 to 11 Tons TNT", detail: "11 Tons TNT is comparable to the GBU-43/B MOAB ('Mother of All Bombs'). Characters can topple skyscrapers, create massive craters, and demolish large industrial complexes with ease.", examples: "All Might (weakened), Ban (Seven Deadly Sins), Garou (early)" },
            { id: "8-B", name: "City Block Level", description: "11 to 100 Tons TNT", detail: "100 Tons of TNT would flatten an entire city block — every building, every structure reduced to rubble. Real-world equivalent: a very large conventional airstrike concentrated on a single point.", examples: "Deku (100%), Grimmjow, early Fairy Tail top-tiers" },
            { id: "8-A", name: "Multi-City Block Level", description: "100 Tons to 1 Kiloton TNT", detail: "1 Kiloton TNT — one-fifteenth the yield of the Hiroshima bomb. Characters at this level can destroy multiple city blocks simultaneously. Their shockwaves shatter windows for blocks around. Craters in the hundreds of meters.", examples: "Endeavor, Erza Scarlet, mid-tier Bleach captains" }
        ]
    },
    tier7: {
        name: "Tier 7: Nuclear",
        color: "#f59e0b",
        description: "Destruction comparable to nuclear weaponry. Characters here reshape geography.",
        subTiers: [
            { id: "Low 7-C", name: "Small Town Level", description: "1 - 5.8 Kilotons", detail: "For perspective, the smallest nuclear weapon ever used in combat (W54 'Davy Crockett') had a yield of 0.01-0.02 Kilotons. Characters at this level casually exceed tactical nuclear devices.", examples: "Pain (individual path), Laxus Dreyar, mid-grade Demon Slayer Hashira" },
            { id: "7-C", name: "Town Level", description: "5.8 - 100 Kilotons", detail: "The Hiroshima bomb 'Little Boy' was approximately 15 Kilotons. Characters at this tier can wipe a town off the map. The energy released is equivalent to thousands of conventional bombs detonating simultaneously.", examples: "Naruto (Sage Mode), Escanor (daytime), Adult Gon" },
            { id: "High 7-C", name: "Large Town Level", description: "100 KT - 1 Megaton", detail: "1 Megaton equals 1,000 Kilotons — about 67 times the Hiroshima bomb. Characters can obliterate sprawling urban areas. The blast radius exceeds 10 km. Thermal radiation causes third-degree burns at 20+ km.", examples: "Natsu (Dragon Force), drained Meruem" },
            { id: "Low 7-B", name: "Small City Level", description: "1 - 6.3 Megatons", detail: "The largest US nuclear test (Castle Bravo, 15 MT) falls within the upper range here. Characters can destroy small metropolitan areas. Their attacks create mushroom clouds visible from space.", examples: "Post-Rose Meruem, Kenpachi (Bankai)" },
            { id: "7-B", name: "City Level", description: "6.3 - 100 Megatons", detail: "Tsar Bomba, the most powerful nuclear weapon ever detonated, was 50 Megatons. Characters at this tier can annihilate major cities like New York or Tokyo in a single attack.", examples: "Naruto (KCM2), Cell (Semi-Perfect), Madara Uchiha" },
            { id: "7-A", name: "Mountain Level", description: "100 MT - 1 Gigaton", detail: "1 Gigaton = 1,000 Megatons. To fragment an average mountain requires roughly 200-500 MT. Characters at this tier can vaporize mountains, creating massive geological depressions visible from orbit.", examples: "Perfect Cell, Kurama (full power), Pain (Shinra Tensei)" },
            { id: "High 7-A", name: "Large Mountain Level", description: "1 - 4.3 Gigatons", detail: "Equivalent to the energy of asteroid impacts that cause mass extinction events. Characters at this tier destroy mountain ranges. For reference, the Chicxulub asteroid that killed the dinosaurs released ~100,000 GT.", examples: "Hashirama Senju, Gilgamesh (serious)" }
        ]
    },
    tier6: {
        name: "Tier 6: Tectonic",
        color: "#ef4444",
        description: "Destruction of landmasses and continental structures. Characters reshape the planet's geography.",
        subTiers: [
            { id: "6-C", name: "Island Level", description: "4.3 - 100 Gigatons", detail: "An average volcanic island has a mass of about 10^15 kg. Destroying it requires overcoming its gravitational binding energy. Characters at this tier sink islands, create tsunamis that devastate coastlines thousands of km away.", examples: "Whitebeard (One Piece), current Naruto/Sasuke, Goku (Saiyan Saga)" },
            { id: "High 6-C", name: "Large Island Level", description: "100 GT - 1 Teraton", detail: "Great Britain is roughly 209,000 km². Destroying an island this size requires enormous energy — equivalent to the total solar energy hitting Earth in about a day. Characters leave permanent scars on the planet.", examples: "Akainu vs Aokiji (changed Punk Hazard), EOS Naruto" },
            { id: "Low 6-B", name: "Small Country Level", description: "1 - 7 Teratons", detail: "The total nuclear arsenal of all nations on Earth is estimated at about 6,500+ warheads totaling roughly 1.5 Teratons. Characters at this level exceed humanity's entire destructive arsenal.", examples: "Frieza (destroying Planet Vegeta — gravity-adjusted), high-end Naruto" },
            { id: "6-B", name: "Country Level", description: "7 - 100 Teratons", detail: "France is 640,000 km². The energy to fragment a country this size is staggering. Characters at this tier reshape continental geography with their battles.", examples: "Majin Buu (base), Momoshiki Otsutsuki" },
            { id: "High 6-B", name: "Large Country Level", description: "100 - 760 Teratons", detail: "Countries like China (9.6 million km²) or Russia (17 million km²). The energy involved exceeds what our Sun outputs in milliseconds. Characters at this tier are walking extinction events.", examples: "Super Buu, Kaguya Otsutsuki" },
            { id: "6-A", name: "Continent Level", description: "760 TT - 4.435 Petatons", detail: "Africa is 30.37 million km². To fragment an entire continent requires energy comparable to large asteroid impacts — events that cause global darkness, acid rain, and mass extinction.", examples: "Goku (Namek Saga SSJ), Kid Buu" },
            { id: "High 6-A", name: "Multi-Continent Level", description: "4.435 PT - 29.6 Exatons", detail: "Destroying multiple continents simultaneously approaches 'life-wiping' — stripping a planet's entire biosphere. The energy is comparable to a fraction of Earth's gravitational binding energy (2.49 × 10^32 J).", examples: "Frieza (Final Form), Cell Saga characters" }
        ]
    },
    tier5: {
        name: "Tier 5: Substellar",
        color: "#06b6d4",
        description: "Destruction of celestial bodies. Characters here operate on a planetary or sub-stellar scale.",
        subTiers: [
            { id: "5-C", name: "Moon Level", description: "29.6 - 433 Exatons", detail: "Earth's Moon has a gravitational binding energy of 1.24 × 10^29 J. Destroying it would cause catastrophic tidal disruption on Earth. The Moon's mass is 7.3 × 10^22 kg — and characters at this level obliterate it casually.", examples: "Piccolo (Destroying the Moon), Master Roshi (first Moon-bust)" },
            { id: "Low 5-B", name: "Small Planet Level", description: "433 Exatons - 59.44 Zettatons", detail: "Mercury's GBE is 1.8 × 10^30 J. Mars is 5.37 × 10^30 J. Characters at this tier can blow apart small rocky planets. The energy involved exceeds the total output of our Sun over several seconds.", examples: "Vegeta (Saiyan Saga, claimed planet-buster)" },
            { id: "5-B", name: "Planet Level", description: "59.44 ZT - 3.8 Yottatons", detail: "Earth's GBE is 2.49 × 10^32 J. This is the gold standard of power scaling — the ability to completely destroy Earth. Characters at this tier are walking apocalypses, capable of rendering any terrestrial planet uninhabitable instantly.", examples: "Frieza (First Form, casually), Perfect Cell (stated)" },
            { id: "5-A", name: "Large Planet Level", description: "3.8 YT - 16.512 Ronnatons", detail: "Jupiter's GBE is 2.09 × 10^36 J — roughly 8,400 times Earth's. Saturn is about 1,400 times Earth. Gas giants are enormously more durable than rocky planets due to their massive gravitational binding.", examples: "SSJ Goku (Buu Saga), Beerus (suppressed)" },
            { id: "High 5-A", name: "Brown Dwarf Level", description: "16.512 RT - 7.505 Quettatons", detail: "Brown Dwarfs are 'failed stars' — too massive to be planets but too small to sustain hydrogen fusion. The smallest (like OTS 44) have masses ~15 times Jupiter. Destroying one requires energy exceeding any planet-busting feat by orders of magnitude.", examples: "High-end Dragon Ball characters" }
        ]
    },
    tier4: {
        name: "Tier 4: Stellar",
        color: "#eab308",
        description: "Stellar and solar system scale destruction.",
        subTiers: [
            { id: "Low 4-C", name: "Small Star Level", description: "7.505 - 136.066 Quettatons", examples: "Red Dwarf stars" },
            { id: "4-C", name: "Star Level", description: "136.066 - 760.516 Quettatons", examples: "The Sun (G-type stars)" },
            { id: "High 4-C", name: "Large Star Level", description: "760.516 QT - 29.23 Foe", examples: "Blue Giants (Rigel)" },
            { id: "4-B", name: "Solar System Level", description: "29.23 Foe - 20.08 TeraFoe", examples: "Entire solar system" },
            { id: "4-A", name: "Multi-Solar System Level", description: "20.08 TF - 10.53 ZettaFoe", examples: "Multiple star systems" }
        ]
    },
    tier3: {
        name: "Tier 3: Cosmic",
        color: "#a855f7",
        description: "Galaxy to universe scale destruction.",
        subTiers: [
            { id: "3-C", name: "Galaxy Level", description: "10.53 ZF - 8.593 YottaFoe", examples: "Milky Way destruction" },
            { id: "3-B", name: "Multi-Galaxy Level", description: "8.593 YF - 2.825 QuettaexaFoe", examples: "Multiple galaxies" },
            { id: "3-A", name: "Universe Level", description: "2.825 QeF to Any Finite", examples: "Observable universe (3D matter only)" },
            { id: "High 3-A", name: "High Universe Level", description: "Infinite 3D power", examples: "Infinite mass, infinite 3D space creation/destruction" }
        ]
    },
    tier2: {
        name: "Tier 2: Multiversal",
        color: "#ec4899",
        description: "4-dimensional space-time and multiverse destruction.",
        subTiers: [
            { id: "Low 2-C", name: "Universe Level+", description: "4D space-time destruction", examples: "Destroying past, present, future of one universe" },
            { id: "2-C", name: "Low Multiverse Level", description: "2 - 1,000 universes", examples: "Multiple space-time continuums" },
            { id: "2-B", name: "Multiverse Level", description: "1,001+ universes", examples: "Any higher finite number of universes" },
            { id: "2-A", name: "Multiverse Level+", description: "Countably infinite universes", examples: "Infinite multiverses (Aleph-0)" }
        ]
    },
    tier1: {
        name: "Tier 1: Higher Infinity",
        color: "#f43f5e",
        description: "Beyond standard dimensional physics. Higher-dimensional beings.",
        subTiers: [
            { id: "Low 1-C", name: "Low Complex Multiverse", description: "5-Dimensional (R^5)", examples: "5D structures, uncountably infinitely larger than 4D" },
            { id: "1-C", name: "Complex Multiverse Level", description: "6-9 Dimensions", examples: "Complex multiverses (R^6-R^9)" },
            { id: "High 1-C", name: "High Complex Multiverse", description: "10-11 Dimensions", examples: "String Theory limit" },
            { id: "1-B", name: "Hyperverse Level", description: "12+ finite dimensions", examples: "Structures beyond 11D" },
            { id: "High 1-B", name: "High Hyperverse Level", description: "Infinite Dimensions", examples: "Infinite-dimensional Hilbert Space" },
            { id: "Low 1-A", name: "Low Outerverse Level", description: "Transcends dimensionality", examples: "Von Neumann Universe (V)" },
            { id: "1-A", name: "Outerverse Level", description: "Qualitative superiority over Low 1-A", examples: "Inaccessible Cardinals" },
            { id: "1-A+", name: "Outerverse Level+", description: "Transcends 1-A hierarchies", examples: "Infinite layers of 1-A" },
            { id: "High 1-A", name: "High Outerverse Level", description: "Meta-Qualitative superiority", examples: "Space of all logical possibilities" }
        ]
    },
    tier0: {
        name: "Tier 0: Boundless",
        color: "#fbbf24",
        description: "Absolute, ultimate transcendence. True Omnipotence.",
        subTiers: [
            { id: "0", name: "Boundless", description: "Absolute Infinity", examples: "Beyond all theological/metaphysical distinctions. Ineffable, indivisible, unsurpassable." }
        ]
    }
};

const SPEED_TIERS = [
    { name: "Below Average Human", value: "0-5 m/s" },
    { name: "Human", value: "5-7.7 m/s" },
    { name: "Athletic Human", value: "7.7-10.03 m/s" },
    { name: "Peak Human", value: "10.03-12.43 m/s" },
    { name: "Superhuman", value: "12.43-34.3 m/s" },
    { name: "Subsonic", value: "Mach 0.1-0.5" },
    { name: "Transonic", value: "Mach 0.5-1.1" },
    { name: "Supersonic", value: "Mach 1.1-2.5" },
    { name: "Hypersonic", value: "Mach 5-10" },
    { name: "High Hypersonic", value: "Mach 10-25" },
    { name: "Massively Hypersonic", value: "Mach 100-1000" },
    { name: "Massively Hypersonic+", value: "Mach 1000-8810" },
    { name: "Sub-Relativistic", value: "1%-5% c" },
    { name: "Relativistic", value: "10%-50% c" },
    { name: "Relativistic+", value: "50%-100% c" },
    { name: "Speed of Light", value: "299,792,458 m/s (1c)" },
    { name: "FTL", value: "1x-10x c" },
    { name: "FTL+", value: "10x-100x c" },
    { name: "Massively FTL", value: "100x-1000x c" },
    { name: "Massively FTL+", value: "1000x+ c" },
    { name: "Infinite Speed", value: "Infinite distance/finite time" },
    { name: "Immeasurable Speed", value: "Beyond linear time" },
    { name: "Omnipresence", value: "Exists everywhere" }
];

const LIFTING_STRENGTH = [
    { class: "Below Average", range: "< 50 kg" },
    { class: "Average Human", range: "50-80 kg" },
    { class: "Above Average", range: "80-120 kg" },
    { class: "Athletic Human", range: "120-227 kg" },
    { class: "Peak Human", range: "227-545 kg" },
    { class: "Superhuman", range: "545-1000 kg" },
    { class: "Class 1", range: "545 kg - 1 ton" },
    { class: "Class 5", range: "1-5 tons" },
    { class: "Class 10", range: "5-10 tons" },
    { class: "Class 25", range: "10-25 tons" },
    { class: "Class 50", range: "25-50 tons" },
    { class: "Class 100", range: "50-100 tons" },
    { class: "Class K", range: "100-1000 tons" },
    { class: "Class M", range: "1K-1M tons" },
    { class: "Class G", range: "1M-1B tons" },
    { class: "Class T", range: "1B-1T tons" },
    { class: "Class P", range: "1T-1Q tons" },
    { class: "Class E", range: "1Q+ tons" },
    { class: "Pre-Stellar", range: "Large planet masses" },
    { class: "Stellar", range: "Star masses" },
    { class: "Multi-Stellar", range: "Multiple stars" },
    { class: "Galactic", range: "Galaxy masses" },
    { class: "Universal", range: "Universal mass" },
    { class: "Infinite", range: "Infinite 3D" },
    { class: "Immeasurable", range: "Beyond dimensions" }
];

const HAX_CATEGORIES = [
    {
        name: "Reality Warping",
        description: "Ability to alter laws of physics and reality itself. High-level can rewrite logic.",
        icon: "✨"
    },
    {
        name: "Causality Manipulation",
        description: "Controlling cause and effect. Can reverse injuries by removing the 'cause' of attacks.",
        icon: "🔄"
    },
    {
        name: "Conceptual Manipulation",
        description: "Interacting with abstract concepts (e.g., destroying 'Death' to become immortal).",
        icon: "💭"
    },
    {
        name: "Acausality",
        description: "Operating outside standard causality. Type 1 (Paradox Immunity) to Type 5 (Transcends Cause/Effect).",
        icon: "⚡"
    },
    {
        name: "Existence Erasure",
        description: "Removing targets from existence entirely - body, mind, and soul.",
        icon: "🌀"
    },
    {
        name: "Immortality",
        description: "Type 1: Eternal Life | Type 3: Regeneration | Type 4: Resurrection | Type 8: Reliant | Type 9: Transcendental",
        icon: "♾️"
    }
];

const TOC_ITEMS = [
    { id: "introduction", title: "I. Introduction" },
    { id: "tiers", title: "II. Complete Tiering System" },
    { id: "attack-potency", title: "III. Attack Potency" },
    { id: "speed", title: "IV. Speed Tiering" },
    { id: "lifting", title: "V. Lifting Strength" },
    { id: "striking", title: "VI. Striking Strength" },
    { id: "durability", title: "VII. Durability" },
    { id: "range", title: "VIII. Range" },
    { id: "stamina", title: "IX. Stamina" },
    { id: "intelligence", title: "X. Intelligence" },
    { id: "hax", title: "XI. Hax & Abilities" },
    { id: "dimensional", title: "XII. Dimensional Tiering" },
    { id: "faq", title: "XIII. FAQ" }
];

const Section = ({ id, title, icon: Icon, children }) => (
    <section id={id} className="scroll-mt-20 mb-12">
        <h2 className="text-2xl md:text-3xl font-black text-white mb-6 flex items-center gap-3">
            {Icon && <Icon size={26} style={{ color: '#f43f5e' }} />}
            {title}
        </h2>
        {children}
    </section>
);

const TierCard = ({ tier, isExpanded, onToggle }) => (
    <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-2xl overflow-hidden mb-3"
        style={{
            background: '#0a0a0a',
            border: `1px solid ${tier.color}25`
        }}
    >
        <button
            onClick={onToggle}
            className="w-full p-5 flex items-center justify-between text-left"
            style={{ background: `linear-gradient(90deg, ${tier.color}08, transparent)` }}
        >
            <div className="flex items-center gap-3">
                <div
                    className="w-3 h-3 rounded-full flex-shrink-0"
                    style={{ background: tier.color, boxShadow: `0 0 10px ${tier.color}50` }}
                />
                <h3 className="font-bold text-white text-sm md:text-base">{tier.name}</h3>
            </div>
            <ChevronDown
                className={`text-[#444] transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`}
                size={18}
            />
        </button>

        <AnimatePresence>
            {isExpanded && (
                <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.25 }}
                    className="overflow-hidden"
                >
                    <div className="px-5 pb-5">
                        <p className="text-[#555] text-sm mb-5 border-b border-white/[0.04] pb-4">{tier.description}</p>

                        <div className="space-y-3">
                            {tier.subTiers.map((sub, idx) => (
                                <div
                                    key={idx}
                                    className="p-4 rounded-xl"
                                    style={{ background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(255,255,255,0.04)' }}
                                >
                                    <div className="flex items-center gap-2 mb-2">
                                        <span
                                            className="px-2 py-0.5 rounded-md text-[11px] font-bold tracking-wider"
                                            style={{ background: `${tier.color}15`, color: tier.color, border: `1px solid ${tier.color}25` }}
                                        >
                                            {sub.id}
                                        </span>
                                        <span className="font-semibold text-white text-sm">{sub.name}</span>
                                    </div>
                                    <p className="text-[13px] text-[#888] font-medium mb-1">{sub.description}</p>
                                    {sub.detail && (
                                        <p className="text-[12px] text-[#555] leading-relaxed mt-2 pl-3 border-l-2" style={{ borderLeftColor: `${tier.color}40` }}>{sub.detail}</p>
                                    )}
                                    {sub.examples && (
                                        <p className="text-[11px] text-[#444] mt-2"><span className="text-[#666] font-medium">Examples:</span> {sub.examples}</p>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                </motion.div>
            )}
        </AnimatePresence>
    </motion.div>
);

const SpeedTable = () => (
    <div className="overflow-x-auto">
        <table className="w-full text-sm">
            <thead>
                <tr style={{ borderBottom: '1px solid rgba(244,63,94,0.15)' }}>
                    <th className="text-left py-3 px-4 font-bold" style={{ color: '#fb7185' }}>Rating</th>
                    <th className="text-left py-3 px-4 font-bold" style={{ color: '#fb7185' }}>Value / Benchmark</th>
                </tr>
            </thead>
            <tbody>
                {SPEED_TIERS.map((speed, idx) => (
                    <tr
                        key={idx}
                        className="border-b border-slate-800 hover:bg-white/5"
                    >
                        <td className="py-2 px-4 text-white font-medium">{speed.name}</td>
                        <td className="py-2 px-4 text-slate-400 font-mono text-xs">{speed.value}</td>
                    </tr>
                ))}
            </tbody>
        </table>
    </div>
);

const LiftingTable = () => (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-2">
        {LIFTING_STRENGTH.map((item, idx) => (
            <div
                key={idx}
                className="p-3 rounded-lg text-center"
                style={{ background: 'rgba(30,30,40,0.6)' }}
            >
                <div className="text-white font-bold text-sm">{item.class}</div>
                <div className="text-slate-500 text-xs">{item.range}</div>
            </div>
        ))}
    </div>
);

const TieringSystem = () => {
    const [expandedTiers, setExpandedTiers] = useState(new Set());
    const [searchQuery, setSearchQuery] = useState('');
    const [showTOC, setShowTOC] = useState(false);
    const [activeSection, setActiveSection] = useState('introduction');

    const toggleTier = (tierKey) => {
        const newExpanded = new Set(expandedTiers);
        if (newExpanded.has(tierKey)) {
            newExpanded.delete(tierKey);
        } else {
            newExpanded.add(tierKey);
        }
        setExpandedTiers(newExpanded);
    };

    const expandAll = () => {
        setExpandedTiers(new Set(Object.keys(TIERS)));
    };

    const collapseAll = () => {
        setExpandedTiers(new Set());
    };

    const scrollToSection = (id) => {
        const element = document.getElementById(id);
        if (element) {
            element.scrollIntoView({ behavior: 'smooth' });
            setShowTOC(false);
        }
    };

    return (
        <div className="min-h-screen pt-20 pb-24 md:pb-8 px-4 relative bg-[#050505]">
        <div className="fixed inset-0 pointer-events-none -z-10" />
            <div className="max-w-5xl mx-auto">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-center mb-12 pt-6"
                >
                    <h1 className="font-bold text-white mb-3" style={{ fontFamily: 'var(--font-display)', fontSize: 'clamp(2rem, 5vw, 3.5rem)' }}>
                        Power <span className="text-[#e5484d]">Rankings</span>
                    </h1>
                    <p className="text-[#555] text-sm max-w-2xl mx-auto">
                        The complete framework for categorizing fictional characters based on destructive capacity,
                        dimensional transcendence, and ontological complexity.
                    </p>
                </motion.div>

                <div className="sticky top-16 z-30 mb-8">
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setShowTOC(!showTOC)}
                        className="w-full p-4 rounded-2xl flex items-center justify-between"
                        style={{ background: 'rgba(10,7,20,0.97)', border: '1px solid rgba(244,63,94,0.15)', backdropFilter: 'blur(12px)' }}
                    >
                        <div className="flex items-center gap-3">
                            <Menu size={18} style={{ color: '#f43f5e' }} />
                            <span className="font-bold text-white text-sm">Table of Contents</span>
                        </div>
                        <ChevronDown
                            className={`text-slate-600 transition-transform ${showTOC ? 'rotate-180' : ''}`}
                            size={18}
                        />
                    </motion.button>

                    <AnimatePresence>
                        {showTOC && (
                            <motion.div
                                initial={{ opacity: 0, y: -10 }}
                                animate={{ opacity: 1, y: 0 }}
                                exit={{ opacity: 0, y: -10 }}
                                className="absolute left-0 right-0 mt-2 p-4 rounded-2xl z-40"
                                style={{ background: 'rgba(10,7,20,0.98)', border: '1px solid rgba(244,63,94,0.15)', backdropFilter: 'blur(12px)' }}
                            >
                                <div className="grid md:grid-cols-2 gap-1.5">
                                    {TOC_ITEMS.map((item) => (
                                        <button
                                            key={item.id}
                                            onClick={() => scrollToSection(item.id)}
                                            className="text-left p-2 rounded-xl text-slate-600 hover:text-white transition-colors text-sm"
                                            style={{ background: 'transparent' }}
                                            onMouseEnter={e => e.target.style.background = 'rgba(244,63,94,0.06)'}
                                            onMouseLeave={e => e.target.style.background = 'transparent'}
                                        >
                                            {item.title}
                                        </button>
                                    ))}
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                { }
                <Section id="introduction" title="Introduction to Tiering Systems" icon={Info}>
                    <div className="prose prose-invert max-w-none">
                        <div className="p-6 rounded-2xl mb-6" style={{ background: 'rgba(244,63,94,0.04)', border: '1px solid rgba(244,63,94,0.15)' }}>
                            <p className="text-slate-300 mb-4">
                                The <strong style={{ color: '#f43f5e' }}>Tiering System</strong> serves as the backbone of modern power scaling and VS debating.
                                It is a hierarchical framework designed to categorize fictional characters, entities, and objects based on
                                the scale of their feats, destructive capacity, and the scope of reality they can affect.
                            </p>

                            <h4 className="text-white font-bold mt-4 mb-2">History and Evolution</h4>
                            <p className="text-slate-400 text-sm">
                                Originally derived from informal forum discussions in the early 2000s, power scaling systems evolved to address
                                the need for standardized comparisons across disparate fictional universes. Early systems focused primarily on
                                destructive capacity (e.g., "Town Level" vs. "City Level"). As fictional works introduced more abstract concepts
                                involving higher dimensions, multiverses, and meta-fictional narratives, the system expanded to include
                                mathematical and philosophical concepts such as set theory, dimensional tiering, and modal realism.
                            </p>

                            <h4 className="text-white font-bold mt-4 mb-2">Philosophical Foundations</h4>
                            <p className="text-slate-400 text-sm">
                                The system operates on the principle that comparative analysis requires a standardized metric. While different
                                fictional verses operate on different laws of physics, the Tiering System attempts to create a "neutral ground"
                                by translating feats into energy values (Joules/TNT equivalent) for lower tiers, and dimensional/ontological
                                complexity for higher tiers.
                            </p>
                        </div>
                    </div>
                </Section>

                { }
                <Section id="tiers" title="Complete Tiering System (11-C to 0)" icon={Crown}>
                    <div className="flex gap-3 mb-5">
                        <button
                            onClick={expandAll}
                            className="px-4 py-2 rounded-xl text-sm font-medium transition-all"
                            style={{ background: 'rgba(244,63,94,0.08)', border: '1px solid rgba(244,63,94,0.2)', color: '#fb7185' }}
                        >
                            Expand All
                        </button>
                        <button
                            onClick={collapseAll}
                            className="px-4 py-2 rounded-xl text-sm font-medium transition-all"
                            style={{ background: 'rgba(255,255,255,0.04)', color: '#475569' }}
                        >
                            Collapse All
                        </button>
                    </div>

                    {Object.entries(TIERS).map(([key, tier]) => (
                        <TierCard
                            key={key}
                            tier={tier}
                            isExpanded={expandedTiers.has(key)}
                            onToggle={() => toggleTier(key)}
                        />
                    ))}
                </Section>

                { }
                <Section id="attack-potency" title="Attack Potency" icon={Sword}>
                    <div className="p-6 rounded-2xl" style={{ background: 'rgba(10,7,20,0.6)', border: '1px solid rgba(255,255,255,0.04)' }}>
                        <p className="text-slate-300 mb-4">
                            <strong style={{ color: '#fb7185' }}>Attack Potency (AP)</strong> measures the destructive capacity of an attack.
                            It's crucial to distinguish AP from <strong>Destructive Capacity (DC)</strong>.
                        </p>

                        <div className="grid md:grid-cols-2 gap-4 mb-4">
                            <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20">
                                <h4 className="font-bold text-red-400 mb-2">Attack Potency</h4>
                                <p className="text-slate-400 text-sm">The energy contained within an attack.</p>
                            </div>
                            <div className="p-4 rounded-lg bg-blue-500/10 border border-blue-500/20">
                                <h4 className="font-bold text-blue-400 mb-2">Destructive Capacity</h4>
                                <p className="text-slate-400 text-sm">The area of effect an attack destroys.</p>
                            </div>
                        </div>

                        <div className="p-4 rounded-xl border-l-4" style={{ background: 'rgba(244,63,94,0.05)', borderLeftColor: '#f43f5e' }}>
                            <p className="text-slate-300 text-sm">
                                <strong>Example:</strong> A character punches with force equal to an exploding star (Star Level AP),
                                but the punch only destroys a building (Building Level DC). In VS battles, their AP is Star Level
                                because they can harm durability equivalent to a star.
                            </p>
                        </div>

                        <h4 className="font-bold text-white mt-6 mb-3">Modifiers</h4>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                            {[
                                { mod: "+", desc: "Above arithmetic mean" },
                                { mod: "At least", desc: "Lower limit known" },
                                { mod: "At most", desc: "Upper limit known" },
                                { mod: "Likely", desc: "High probability" },
                                { mod: "Varies", desc: "Variable power" }
                            ].map((item, idx) => (
                                <div key={idx} className="p-3 rounded-xl text-center" style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.04)' }}>
                                    <div className="font-bold" style={{ color: '#fb7185' }}>{item.mod}</div>
                                    <div className="text-slate-600 text-xs">{item.desc}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </Section>

                {/* Speed */}
                <Section id="speed" title="Speed Tiering" icon={Zap}>
                    <div className="p-6 rounded-2xl" style={{ background: 'rgba(10,7,20,0.6)', border: '1px solid rgba(255,255,255,0.04)' }}>
                        <p className="text-slate-300 mb-6">
                            Speed is categorized into: <strong style={{ color: '#fb7185' }}>Attack Speed</strong>,
                            <strong className="text-blue-400"> Combat Speed</strong>,
                            <strong className="text-green-400"> Reaction Speed</strong>,
                            <strong className="text-purple-400"> Travel Speed</strong>, and
                            <strong className="text-red-400"> Flight Speed</strong>.
                        </p>
                        <SpeedTable />

                        <h4 className="font-bold text-white mt-6 mb-3">Special Speed Categories</h4>
                        <div className="grid md:grid-cols-3 gap-4">
                            <div className="p-4 rounded-lg bg-cyan-500/10 border border-cyan-500/20">
                                <h5 className="font-bold text-cyan-400 mb-2">Infinite Speed</h5>
                                <p className="text-slate-400 text-xs">Move infinite distance in finite time, or finite distance in zero time. Finite speed characters appear frozen.</p>
                            </div>
                            <div className="p-4 rounded-lg bg-purple-500/10 border border-purple-500/20">
                                <h5 className="font-bold text-purple-400 mb-2">Immeasurable Speed</h5>
                                <p className="text-slate-400 text-xs">Cannot be measured by S=D/T because T is undefined. Can run from present to future/past through speed.</p>
                            </div>
                            <div className="p-4 rounded-lg bg-pink-500/10 border border-pink-500/20">
                                <h5 className="font-bold text-pink-400 mb-2">Omnipresence</h5>
                                <p className="text-slate-400 text-xs">Not a speed but a state. Exists everywhere simultaneously - localized, universal, or multiversal.</p>
                            </div>
                        </div>
                    </div>
                </Section>

                {/* Lifting Strength */}
                <Section id="lifting" title="Lifting Strength" icon={Dumbbell}>
                    <div className="p-6 rounded-xl" style={{ background: 'rgba(30,30,40,0.6)' }}>
                        <p className="text-slate-300 mb-6">
                            Measures the mass a character can lift against Earth's gravity. Distinct from striking strength.
                        </p>
                        <LiftingTable />
                    </div>
                </Section>

                { }
                <Section id="striking" title="Striking Strength" icon={Target}>
                    <div className="p-6 rounded-xl" style={{ background: 'rgba(30,30,40,0.6)' }}>
                        <p className="text-slate-300">
                            <strong className="text-yellow-400">Striking Strength</strong> measures the physical force a character can output in a blow.
                            It generally corresponds directly to their Attack Potency tier (e.g., Planet Level AP = Planet Class Striking Strength).
                            However, magic users or glass cannons may have high AP but low Striking Strength.
                        </p>
                    </div>
                </Section>

                { }
                <Section id="durability" title="Durability" icon={Shield}>
                    <div className="p-6 rounded-xl" style={{ background: 'rgba(30,30,40,0.6)' }}>
                        <p className="text-slate-300 mb-6">
                            The amount of damage a character can withstand before succumbing to injury or death.
                        </p>

                        <h4 className="font-bold text-white mb-3">Types of Durability Feats</h4>
                        <div className="grid md:grid-cols-3 gap-4 mb-6">
                            <div className="p-4 rounded-lg bg-green-500/10 border border-green-500/20">
                                <h5 className="font-bold text-green-400">Tanking</h5>
                                <p className="text-slate-400 text-xs">Taking an attack with little to no damage.</p>
                            </div>
                            <div className="p-4 rounded-lg bg-yellow-500/10 border border-yellow-500/20">
                                <h5 className="font-bold text-yellow-400">Withstanding</h5>
                                <p className="text-slate-400 text-xs">Taking an attack and surviving, though with damage.</p>
                            </div>
                            <div className="p-4 rounded-lg bg-red-500/10 border border-red-500/20">
                                <h5 className="font-bold text-red-400">No-Selling</h5>
                                <p className="text-slate-400 text-xs">Taking an attack with absolute zero effect.</p>
                            </div>
                        </div>

                        <h4 className="font-bold text-white mb-3">Durability Negation</h4>
                        <p className="text-slate-400 text-sm">
                            Certain abilities bypass durability entirely: <span className="text-purple-400">Soul Manipulation</span>,
                            <span className="text-cyan-400"> Matter Manipulation</span>, and <span className="text-red-400">Existence Erasure</span>.
                        </p>
                    </div>
                </Section>

                { }
                <Section id="range" title="Range" icon={Crosshair}>
                    <div className="p-6 rounded-xl" style={{ background: 'rgba(30,30,40,0.6)' }}>
                        <p className="text-slate-300 mb-4">
                            The distance at which a character can effectively influence the world or attack opponents.
                        </p>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                            {[
                                "Standard Melee (Arm's length)",
                                "Extended Melee (Several meters)",
                                "Tens of Meters",
                                "Hundreds of Meters",
                                "Kilometers",
                                "Planetary",
                                "Stellar",
                                "Interstellar",
                                "Galactic",
                                "Universal",
                                "Universal+",
                                "Interdimensional"
                            ].map((range, idx) => (
                                <div key={idx} className="p-2 rounded-lg bg-slate-800/50 text-center text-xs text-slate-300">
                                    {range}
                                </div>
                            ))}
                        </div>
                    </div>
                </Section>

                { }
                <Section id="stamina" title="Stamina" icon={Battery}>
                    <div className="p-6 rounded-xl" style={{ background: 'rgba(30,30,40,0.6)' }}>
                        <p className="text-slate-300 mb-4">
                            How long a character can maintain their peak physical/mental performance.
                        </p>
                        <div className="grid grid-cols-2 md:grid-cols-5 gap-2">
                            {[
                                { level: "Very Low", desc: "Minutes" },
                                { level: "Low", desc: "Tens of minutes" },
                                { level: "Average", desc: "Hours" },
                                { level: "High", desc: "Days" },
                                { level: "Very High", desc: "Weeks" },
                                { level: "Superhuman", desc: "Months" },
                                { level: "Godlike", desc: "Years" },
                                { level: "Limitless", desc: "Infinite" },
                                { level: "Self-Sustenance", desc: "No needs" },
                                { level: "N/A", desc: "Non-beings" }
                            ].map((item, idx) => (
                                <div key={idx} className="p-3 rounded-lg bg-slate-800/50 text-center">
                                    <div className="text-cyan-400 font-bold text-sm">{item.level}</div>
                                    <div className="text-slate-500 text-xs">{item.desc}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </Section>

                { }
                <Section id="intelligence" title="Intelligence" icon={Brain}>
                    <div className="p-6 rounded-xl" style={{ background: 'rgba(30,30,40,0.6)' }}>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {[
                                { level: "Mindless", desc: "No capacity for thought" },
                                { level: "Animalistic", desc: "Basic survival instincts" },
                                { level: "Below Average", desc: "Below normal human cognition" },
                                { level: "Average", desc: "Standard human intelligence" },
                                { level: "Above Average", desc: "Notably smarter than average" },
                                { level: "Gifted", desc: "Exceptional mental capacity" },
                                { level: "Genius", desc: "Extraordinary intellect" },
                                { level: "Extraordinary Genius", desc: "World-class minds" },
                                { level: "Supergenius", desc: "Beyond human comprehension" },
                                { level: "Nigh-Omniscient", desc: "Near-complete knowledge" },
                                { level: "Omniscient", desc: "Knows everything" }
                            ].map((item, idx) => (
                                <div key={idx} className="p-3 rounded-lg bg-slate-800/50 flex items-center gap-3">
                                    <div className="w-2 h-2 rounded-full bg-purple-400" />
                                    <div>
                                        <div className="text-white font-medium text-sm">{item.level}</div>
                                        <div className="text-slate-500 text-xs">{item.desc}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </Section>

                { }
                <Section id="hax" title="Hax & Abilities" icon={Sparkles}>
                    <div className="p-6 rounded-xl mb-6" style={{ background: 'rgba(30,30,40,0.6)' }}>
                        <p className="text-slate-300 mb-6">
                            <strong className="text-yellow-400">"Hax"</strong> refers to abilities that allow a character to defeat
                            opponents significantly stronger than themselves by ignoring conventional stats like AP or Durability.
                        </p>

                        <div className="grid md:grid-cols-2 gap-4">
                            {HAX_CATEGORIES.map((hax, idx) => (
                                <div
                                    key={idx}
                                    className="p-4 rounded-lg"
                                    style={{ background: 'rgba(168,85,247,0.1)', border: '1px solid rgba(168,85,247,0.2)' }}
                                >
                                    <div className="flex items-center gap-2 mb-2">
                                        <span className="text-2xl">{hax.icon}</span>
                                        <h4 className="font-bold text-purple-400">{hax.name}</h4>
                                    </div>
                                    <p className="text-slate-400 text-sm">{hax.description}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                </Section>

                { }
                <Section id="dimensional" title="Dimensional Tiering" icon={Star}>
                    <div className="p-6 rounded-xl" style={{ background: 'rgba(30,30,40,0.6)' }}>
                        <p className="text-slate-300 mb-4">
                            Higher dimensions are <strong className="text-yellow-400">uncountably infinitely larger</strong> than lower ones.
                            A 4D being is infinitely larger than a 3D being geometrically.
                        </p>

                        <div className="border-l-4 border-yellow-500 pl-4 mb-4">
                            <p className="text-slate-400 text-sm italic">
                                <strong>Set Theory Note:</strong> A collection of infinite multiverses is still countably infinite (Aleph-0).
                                Destroying "multiple infinite multiverses" doesn't qualify for higher than 2-A unless the structure is uncountably infinite.
                            </p>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
                            {["0D (Point)", "1D (Line)", "2D (Plane)", "3D (Space)", "4D (Spacetime)", "5D+", "∞D (Hilbert)", "Beyond"].map((dim, idx) => (
                                <div key={idx} className="p-3 rounded-lg bg-gradient-to-br from-purple-500/10 to-pink-500/10 text-center">
                                    <div className="text-white font-bold text-sm">{dim}</div>
                                </div>
                            ))}
                        </div>
                    </div>
                </Section>

                {/* FAQ */}
                <Section id="faq" title="Frequently Asked Questions" icon={HelpCircle}>
                    <div className="space-y-4">
                        {[
                            {
                                q: "Does existing in a higher dimension make a character infinitely strong?",
                                a: "Generally yes, but feats are required. A 4D being is infinitely larger than a 3D being geometrically. However, simply being from a 'higher plane' without context does not qualify for Tier 1. It must be a coordinate space or qualitative superiority."
                            },
                            {
                                q: "Is destroying 1,000 universes better than destroying 1?",
                                a: "Yes, it qualifies for Tier 2-B (Multiverse Level), whereas 1 universe is Low 2-C."
                            },
                            {
                                q: "How does speed work in timeless voids?",
                                a: "Moving in a timeless void does not grant Infinite or Immeasurable speed automatically. It simply means the character has resistance to timelessness or self-sustenance. Infinite Speed requires crossing distance in zero time, not just existing where time is absent."
                            }
                        ].map((faq, idx) => (
                            <div
                                key={idx}
                                className="p-4 rounded-2xl"
                                style={{ background: 'rgba(10,7,20,0.85)', border: '1px solid rgba(244,63,94,0.12)' }}
                            >
                                <h4 className="font-bold mb-2" style={{ color: '#fb7185' }}>Q: {faq.q}</h4>
                                <p className="text-slate-300 text-sm">A: {faq.a}</p>
                            </div>
                        ))}
                    </div>
                </Section>

                {/* Back to Top */}
                <motion.button
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                    onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                    className="fixed bottom-24 md:bottom-8 left-1/2 -translate-x-1/2 px-5 py-2.5 rounded-full flex items-center gap-2 z-30"
                    style={{ background: 'rgba(10,7,20,0.97)', border: '1px solid rgba(244,63,94,0.2)', backdropFilter: 'blur(12px)' }}
                >
                    <ArrowUp size={14} style={{ color: '#f43f5e' }} />
                    <span className="text-sm font-medium" style={{ color: '#fb7185' }}>Top</span>
                </motion.button>
            </div>
        </div>
    );
};

export default TieringSystem;
