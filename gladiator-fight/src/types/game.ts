// src/types/game.ts
import type { Skill } from '../store/skillUtils'

export type UserProfile = { money: number }

export type Character = {
  id: string;
  name: string;
  hp: number;
  maxHp: number;
  status: Status;
  skills: Skill[];
  winStreak: number;
  lastMoneyEarned: number;
  statusPoint: number;
}

export const scenes = {
  PREPARE: 'prepare',
  FIGHT: 'fight',
  RESULT: 'result',
  HISTORY: 'history',
  CREATE: 'create',
} as const
export type Scene = typeof scenes[keyof typeof scenes]

// --- TYPE DEFINITIONS ---
export type Status = {
  str: number;
  agi: number;
  vit: number;
  dex: number;
  int: number;
  luk: number;
}
