// Cartes de jeux dans la langue du site : en anglais, seulement les jeux traduits, avec leurs textes anglais.
import { characters as TOUS } from './characters';
import { CHARACTERS_EN } from './charactersEn';
import { IS_EN } from '../i18n';

export const characters = IS_EN
  ? TOUS.filter((c) => CHARACTERS_EN[c.game]).map((c) => ({ ...c, ...CHARACTERS_EN[c.game] }))
  : TOUS;
