/**
 * Purchasable cosmetic color skins. A skin re-tints the brand/game-accent
 * colors on top of whichever light/dark mode is active — it never touches
 * background/surface/text colors, so contrast and readability stay
 * consistent across every skin.
 */
export interface ThemeSkinDefinition {
  id: string;
  name: string;
  description: string;
  /** Coin price. 0 = owned by everyone from the start. */
  priceCoins: number;
  /** Three swatch colors used for the shop preview chip. */
  preview: [string, string, string];
  overrides: {
    primary: string;
    primaryDark: string;
    primaryLight: string;
    secondary: string;
    accent: string;
    tilePainted: string;
    tileTeleport: string;
    ballGlow: string;
    star: string;
    coin: string;
  };
}

export const DEFAULT_THEME_SKIN_ID = 'classic';

export const THEME_SKINS: ThemeSkinDefinition[] = [
  {
    id: 'classic',
    name: 'Classic',
    description: 'The original PaintRoll palette.',
    priceCoins: 0,
    preview: ['#7C5CFF', '#06D6C6', '#FF6B6B'],
    overrides: {
      primary: '#7C5CFF',
      primaryDark: '#5B3FD6',
      primaryLight: '#A78BFA',
      secondary: '#06D6C6',
      accent: '#FF6B6B',
      tilePainted: '#7C5CFF',
      tileTeleport: '#06D6C6',
      ballGlow: '#7C5CFF',
      star: '#FFC94D',
      coin: '#FFC94D',
    },
  },
  {
    id: 'sunset',
    name: 'Sunset',
    description: 'Warm oranges and pinks for a golden-hour roll.',
    priceCoins: 150,
    preview: ['#FF7A45', '#FFB84D', '#FF4D8D'],
    overrides: {
      primary: '#FF7A45',
      primaryDark: '#DB5A28',
      primaryLight: '#FFA477',
      secondary: '#FFB84D',
      accent: '#FF4D8D',
      tilePainted: '#FF7A45',
      tileTeleport: '#FFB84D',
      ballGlow: '#FF7A45',
      star: '#FFCE54',
      coin: '#FFCE54',
    },
  },
  {
    id: 'ocean',
    name: 'Ocean',
    description: 'Cool blues and teals for a calm, deep-sea roll.',
    priceCoins: 150,
    preview: ['#2E9CFF', '#22E6D4', '#3B6BFF'],
    overrides: {
      primary: '#2E9CFF',
      primaryDark: '#1C74C9',
      primaryLight: '#6EC1FF',
      secondary: '#22E6D4',
      accent: '#3B6BFF',
      tilePainted: '#2E9CFF',
      tileTeleport: '#22E6D4',
      ballGlow: '#2E9CFF',
      star: '#5FE0D6',
      coin: '#FFD166',
    },
  },
  {
    id: 'candy',
    name: 'Candy',
    description: 'Bright pinks and lime for a playful sugar rush.',
    priceCoins: 200,
    preview: ['#FF5CA8', '#B4FF4D', '#FFD166'],
    overrides: {
      primary: '#FF5CA8',
      primaryDark: '#D63C86',
      primaryLight: '#FF97C7',
      secondary: '#B4FF4D',
      accent: '#FFD166',
      tilePainted: '#FF5CA8',
      tileTeleport: '#B4FF4D',
      ballGlow: '#FF5CA8',
      star: '#FFD166',
      coin: '#FFD166',
    },
  },
  {
    id: 'midnight',
    name: 'Midnight',
    description: 'Deep violet and electric cyan for night owls.',
    priceCoins: 250,
    preview: ['#6947E0', '#00E5FF', '#B3A0FF'],
    overrides: {
      primary: '#6947E0',
      primaryDark: '#4B2FB0',
      primaryLight: '#9B82FF',
      secondary: '#00E5FF',
      accent: '#B3A0FF',
      tilePainted: '#6947E0',
      tileTeleport: '#00E5FF',
      ballGlow: '#6947E0',
      star: '#00E5FF',
      coin: '#FFD166',
    },
  },
];

const skinsById = new Map(THEME_SKINS.map(skin => [skin.id, skin]));

export function getThemeSkin(id: string): ThemeSkinDefinition {
  return skinsById.get(id) ?? (skinsById.get(DEFAULT_THEME_SKIN_ID) as ThemeSkinDefinition);
}
