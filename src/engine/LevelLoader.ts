import {LevelDefinition, LevelPack} from '../types';
import pack01 from '../assets/levels/pack-01.json';

const packs: LevelPack[] = [pack01 as LevelPack];

/** Flat, order-sorted list of every level across every installed pack. */
const allLevels: LevelDefinition[] = packs
  .flatMap(pack => pack.levels)
  .sort((a, b) => a.order - b.order);

const levelsById = new Map<string, LevelDefinition>(allLevels.map(level => [level.id, level]));

export const LevelLoader = {
  getAllPacks(): LevelPack[] {
    return packs;
  },

  getPack(packId: string): LevelPack | undefined {
    return packs.find(p => p.packId === packId);
  },

  getAllLevels(): LevelDefinition[] {
    return allLevels;
  },

  getLevelById(levelId: string): LevelDefinition | undefined {
    return levelsById.get(levelId);
  },

  getOrderedLevelIds(): string[] {
    return allLevels.map(l => l.id);
  },

  getNextLevel(levelId: string): LevelDefinition | undefined {
    const current = levelsById.get(levelId);
    if (!current) {
      return undefined;
    }
    return allLevels.find(l => l.order === current.order + 1);
  },

  getFirstLevel(): LevelDefinition {
    return allLevels[0];
  },
};
