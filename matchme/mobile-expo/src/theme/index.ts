import { colors, darkColors } from './colors';
import { typography } from './typography';
import { spacing, layout } from './spacing';

export { colors, darkColors } from './colors';
export { typography } from './typography';
export { spacing, layout } from './spacing';

// Theme object for easy access
export const theme = {
  colors,
  typography,
  spacing,
  layout,
};

// Dark theme
export const darkTheme = {
  colors: darkColors,
  typography,
  spacing,
  layout,
}; 