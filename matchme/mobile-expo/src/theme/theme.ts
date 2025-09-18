export const theme = {
  colors: {
    // Monochromatic palette
    primary: '#000000',
    secondary: '#666666',
    accent: '#999999',
    
    // Background colors
    background: '#FFFFFF',
    surface: '#F8F8F8',
    card: '#FFFFFF',
    
    // Text colors
    text: '#000000',
    textSecondary: '#666666',
    textMuted: '#999999',
    
    // Border and divider colors
    border: '#E5E5E5',
    divider: '#F0F0F0',
    
    // Status colors (minimal)
    success: '#4A4A4A',
    error: '#666666',
    warning: '#8A8A8A',
    info: '#999999',
    
    // Overlay and shadow
    overlay: 'rgba(0, 0, 0, 0.1)',
    shadow: 'rgba(0, 0, 0, 0.05)',
  },
  
  typography: {
    fontFamily: {
      regular: 'System',
      medium: 'System',
      bold: 'System',
    },
    fontSize: {
      xs: 12,
      sm: 14,
      base: 16,
      lg: 18,
      xl: 20,
      '2xl': 24,
      '3xl': 30,
      '4xl': 36,
    },
    lineHeight: {
      tight: 1.2,
      normal: 1.4,
      relaxed: 1.6,
    },
    fontWeight: {
      normal: '400' as const,
      medium: '500' as const,
      semibold: '600' as const,
      bold: '700' as const,
    },
  },
  
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    '2xl': 48,
    '3xl': 64,
  },
  
  borderRadius: {
    none: 0,
    sm: 4,
    md: 8,
    lg: 12,
    xl: 16,
    full: 9999,
  },
  
  shadows: {
    sm: {
      shadowColor: 'rgba(0, 0, 0, 0.05)',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 1,
      shadowRadius: 2,
      elevation: 1,
    },
    md: {
      shadowColor: 'rgba(0, 0, 0, 0.05)',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 1,
      shadowRadius: 4,
      elevation: 2,
    },
    lg: {
      shadowColor: 'rgba(0, 0, 0, 0.05)',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 1,
      shadowRadius: 8,
      elevation: 4,
    },
  },
  
  layout: {
    container: {
      paddingHorizontal: 16,
    },
    screen: {
      paddingHorizontal: 16,
      paddingVertical: 16,
    },
  },
};

export type Theme = typeof theme; 