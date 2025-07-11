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
  character.status.vit = skillStatus(character, 'vit', skill);
  character.status.dex = skillStatus(character, 'dex', skill);
  character.status.int = skillStatus(character, 'int', skill);
  character.status.cha = skillStatus(character, 'cha', skill);
}

// Calculate status after skill effects (for display)
function skillStatus(character: Character, type: keyof Character['status'], skill: Skill): number {
  // Defensive: Only process if character.skill is an array of Skill objects
  let val = character.status[type]
      // Buff
      if (skill.buff && skill.buff.statusType === type) {
        if (skill.buff.value) {
          val += parseInt(skill.buff.value)
        }
        console.log(`skillStatus ${type} for ${character.name}: ${val} (base: ${character.status[type]}) skill:`, skill)
        if (skill.buff.multiply) {
          val += Math.floor(val * parseFloat(skill.buff.multiply.replace('%','')))
        }
        console.log(`skillStatus ${type} for ${character.name}: ${val} (base: ${character.status[type]}) skill:`, skill)
      }
      // Debuff
      if (skill.debuff && skill.debuff.statusType === type) {
        if (skill.debuff.value) {
          val -= parseInt(skill.debuff.value)
        }
        if (skill.debuff.multiply) {
          val -= Math.floor(val * parseFloat(skill.buff.multiply.replace('%','')))
        }
        if (val < 0) val = 0
        console.log(`skillStatus ${type} for ${character.name}: ${val} (base: ${character.status[type]}) skill:`, skill)
      }
  return val
}