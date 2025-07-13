import type { Character, Status } from './useGameStore'

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
    if (Math.random() < Math.min(luk, 9999) / 9999) return max;
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
  function randPercentLuck(luk: number) {
    if (Math.random() < Math.min(luk, 9999) / 9999) return (5).toFixed(2);
    return (Math.random() * 4 + 1).toFixed(2);
  }
  const statusTypes = ['str', 'agi', 'vit', 'dex', 'int', 'luk'];
  const choices: Skill[] = [];
  let minChoices = 3;
  let maxChoices = 5;
  let numChoices = minChoices + Math.floor((Math.min(luk, 9999) / 9999) * (maxChoices - minChoices + 1));
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

export function applySkill(idx: number, character: Character, skillChoices: Skill[]) {
  const skill = skillChoices[idx];
  if (!character.skills) character.skills = [];
  character.skills.push(skill);
  character.status.str = skillStatus(character, 'str', skill);
  character.status.agi = skillStatus(character, 'agi', skill);
  const oldVit = character.status.vit;
  character.status.vit = skillStatus(character, 'vit', skill);
  // 1 vit = +10 hp, maxHp
  const vitDiff = character.status.vit - oldVit;
  if (vitDiff !== 0) {
    character.maxHp += vitDiff * 10;
    character.hp += vitDiff * 10;
    if (character.hp > character.maxHp) character.hp = character.maxHp;
    if (character.maxHp < 1) character.maxHp = 1;
    if (character.hp < 0) character.hp = 0;
  }
  character.status.dex = skillStatus(character, 'dex', skill);
  character.status.int = skillStatus(character, 'int', skill);
  character.status.luk = skillStatus(character, 'luk', skill);
}

function applyBuff(val: number, buff: SkillData, type: keyof Character['status']): number {
  if (buff && buff.statusType === type) {
    if (buff.value) {
      val += parseInt(buff.value)
    }
    if (buff.multiply && buff.multiply !== '0%' && buff.multiply !== '0.00%') {
      val = Math.floor(val * (1 + parseFloat(buff.multiply.replace('%',''))/100))
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
      val = Math.floor(val * (1 - parseFloat(debuff.multiply.replace('%',''))/100))
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