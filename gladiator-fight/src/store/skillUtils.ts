
import type { Character, Status } from './useGameStore'

export type SkillData = {
  statusType: string
  value: string // always string for display, can be int or percent
  multiply: string // percent string, e.g. '3.25%'
}

export type Skill = {
  buff: SkillData
  debuff?: SkillData
}

export function randomSkillChoices(luk: number = 0): Skill[] {
  function randIntLuck(min: number, max: number, luk: number) {
    if (Math.random() < Math.min(luk, 9999) / 9999) return max;
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
  function randPercentLuck(luk: number) {
    if (Math.random() < Math.min(luk, 9999) / 9999) return (5).toFixed(2);
    return (Math.random() * 4 + 1).toFixed(2);
  }
  const statusTypes = ['str', 'agi', 'vit', 'dex', 'int', 'luk', 'cha'];
  const choices: Skill[] = [];
  let minChoices = 3;
  let maxChoices = 5;
  let numChoices = minChoices + Math.floor((Math.min(luk, 9999) / 9999) * (maxChoices - minChoices + 1));
  numChoices = Math.max(minChoices, Math.min(maxChoices, numChoices));
  for (let i = 0; i < 5; i++) {
    // Randomly pick type and value
    const type = statusTypes[randIntLuck(0, statusTypes.length - 1, luk)];
    const value = randIntLuck(1, 10, luk).toString();
    const multiply = randPercentLuck(luk);
    const buff: SkillData = {
      statusType: type,
      value,
      multiply: multiply + '%'
    };
    let debuff: SkillData | undefined = undefined;
    // 10% chance for debuff
    if (Math.random() < 0.1) {
      const debuffType = statusTypes[randIntLuck(0, statusTypes.length - 1, luk)];
      const debuffValue = randIntLuck(1, 10, luk).toString();
      const debuffMultiply = randPercentLuck(luk);
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

export function applySkill(idx: number, character: Character, skillChoices: Skill[], characterHistory: Character[], showSkillSelectSetter?: (v: boolean) => void) {
  const skill = skillChoices[idx];
  // Apply buff
  const buff = skill.buff;
  if (buff) {
    // Add value
    if (buff.value && !buff.multiply) {
      const key = buff.statusType as keyof Status;
      character.status[key] += parseInt(buff.value);
    }
    // Multiply
    if (buff.multiply && buff.multiply !== '0%' && buff.multiply !== '0.00%') {
      const key = buff.statusType as keyof Status;
      const mul = parseFloat(buff.multiply.replace('%', '')) / 100;
      character.status[key] = Math.floor(character.status[key] * (1 + mul));
    }
  }
  // Apply debuff (subtract value)
  if (skill.debuff) {
    const debuff = skill.debuff;
    if (debuff.value && !debuff.multiply) {
      const key = debuff.statusType as keyof Status;
      character.status[key] -= parseInt(debuff.value);
      if (character.status[key] < 0) character.status[key] = 0;
    }
    if (debuff.multiply && debuff.multiply !== '0%' && debuff.multiply !== '0.00%') {
      const key = debuff.statusType as keyof Status;
      const mul = parseFloat(debuff.multiply.replace('%', '')) / 100;
      character.status[key] = Math.floor(character.status[key] * (1 - mul));
      if (character.status[key] < 0) character.status[key] = 0;
    }
  }
  // Log skill usage (for history)
  let skillDesc = `Buff: ${buff.statusType} +${buff.value}`;
  if (buff.multiply && buff.multiply !== '0%' && buff.multiply !== '0.00%') skillDesc += ` x${buff.multiply}`;
  if (skill.debuff) {
    skillDesc += ` | Debuff: ${skill.debuff.statusType} -${skill.debuff.value}`;
    if (skill.debuff.multiply && skill.debuff.multiply !== '0%' && skill.debuff.multiply !== '0.00%') skillDesc += ` x${skill.debuff.multiply}`;
  }
  character.skill.push(skillDesc);
  const idxHistory = characterHistory.findIndex(c => c.name === character.name && c.skill.join(',') === character.skill.join(','));
  if (idxHistory !== -1) {
    characterHistory[idxHistory] = { ...character };
  } else {
    characterHistory.push({ ...character });
  }
  if (showSkillSelectSetter) showSkillSelectSetter(false);
}