import { HP_PER_VIT, MAX_STATUS } from './statusUtils'
import { Character, Status } from '../types/game'

export type SkillData = {
  statusType: string
  value: string // always string for display, can be int or percent
  multiply: string // percent string, e.g. '3.25%'
}

export type Skill = {
  [x: string]: any
  buff: SkillData
  debuff?: SkillData
  active?: boolean // for active skills
}

export function randomSkillChoices(luk: number = 0): Skill[] {
  function randIntLuck(min: number, max: number, luk: number) {
    if (Math.random() < Math.min(luk, MAX_STATUS) / MAX_STATUS) return max;
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
  function randPercentLuck(luk: number) {
    if (Math.random() < Math.min(luk, MAX_STATUS) / MAX_STATUS) return (5).toFixed(2);
    return (Math.random() * 4 + 1).toFixed(2);
  }
  const statusTypes = ['str', 'agi', 'vit', 'dex', 'int', 'luk'];
  const choices: Skill[] = [];
  let minChoices = 3;
  let maxChoices = 5;
  let numChoices = minChoices + Math.floor((Math.min(luk, MAX_STATUS) / MAX_STATUS) * (maxChoices - minChoices + 1));
  numChoices = Math.max(minChoices, Math.min(maxChoices, numChoices));
  for (let i = 0; i < 5; i++) {
    // Randomly pick type and value or multiply (not both)
    const type = statusTypes[randIntLuck(0, statusTypes.length - 1, luk)];
    let value = '0';
    let multiply = '0';
    if (Math.random() < 0.8) {
      value = randIntLuck(1, 10, luk).toString();
    } else {
      multiply = randPercentLuck(luk);
    }
    const buff: SkillData = {
      statusType: type,
      value,
      multiply: multiply + '%'
    };
    let debuff: SkillData | undefined = undefined;
    // 30% chance for debuff
    if (Math.random() < 0.3) {
      const debuffType = statusTypes[randIntLuck(0, statusTypes.length - 1, luk)];
      let debuffValue = '0';
      let debuffMultiply = '0';
      if (Math.random() < 0.8) {
        debuffValue = randIntLuck(1, 10, luk).toString();
      } else {
        debuffMultiply = randPercentLuck(luk);
      }
      debuff = {
        statusType: debuffType,
        value: debuffValue,
        multiply: debuffMultiply + '%'
      };
    }
    choices.push({ buff, debuff });
  }
  // Shuffle and pick numChoices
  for (let i = choices.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [choices[i], choices[j]] = [choices[j], choices[i]];
  }
  return choices.slice(0, numChoices);
}

export function chooseSkill(idx: number, character: Character, skillChoices: Skill[]) {
  const skill = skillChoices[idx];
  character.skills.push(skill);
}

export function applySkills(character: Character): Character {
  // Deep clone the character to avoid mutating the input
  const clone: Character = JSON.parse(JSON.stringify(character));

  for (const skill of clone.skills) {
    clone.status.str = skillStatus(clone, 'str', skill);
    clone.status.agi = skillStatus(clone, 'agi', skill);
    const oldVit = clone.status.vit;
    clone.status.vit = skillStatus(clone, 'vit', skill);
    // 1 vit = +HP_PER_VIT hp, maxHp
    const vitDiff = clone.status.vit - oldVit;
    if (vitDiff !== 0) {
      clone.maxHp += vitDiff * HP_PER_VIT;
      clone.hp += vitDiff * HP_PER_VIT;
      if (clone.hp > clone.maxHp) clone.hp = clone.maxHp;
      if (clone.maxHp < 1) clone.maxHp = 1;
      if (clone.hp < 0) clone.hp = 0;
    }
    clone.status.dex = skillStatus(clone, 'dex', skill);
    clone.status.int = skillStatus(clone, 'int', skill);
    clone.status.luk = skillStatus(clone, 'luk', skill);
  }
  return clone;
}

function applyBuff(val: number, buff: SkillData, type: keyof Character['status']): number {
  if (buff && buff.statusType === type) {
    if (buff.value) {
      val += parseInt(buff.value)
    }
    if (buff.multiply && buff.multiply !== '0%' && buff.multiply !== '0.00%') {
      val = Math.floor(val * (1 + parseFloat(buff.multiply.replace('%', '')) / 100))
    }
  }
  return val
}

function applyDebuff(val: number, debuff: SkillData, type: keyof Character['status']): number {
  if (debuff && debuff.statusType === type) {
    if (debuff.value) {
      val -= parseInt(debuff.value)
    }
    if (debuff.multiply && debuff.multiply !== '0%' && debuff.multiply !== '0.00%') {
      val = Math.floor(val * (1 - parseFloat(debuff.multiply.replace('%', '')) / 100))
    }
    if (val < 0) val = 0
  }
  return val
}

// Calculate status after skill effects (for display)
function skillStatus(character: Character, type: keyof Character['status'], skill: Skill): number {
  let val = character.status[type]
  if (skill.buff) {
    val = applyBuff(val, skill.buff, type)
  }
  if (skill.debuff) {
    val = applyDebuff(val, skill.debuff, type)
  }
  return val
}

export function BASE_STATUS(BASE_STATUS: any): (keyof Status)[] {
  throw new Error('Function not implemented.');
}
